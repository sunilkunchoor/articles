#!/usr/bin/env python3
"""
build-embeddings.py — Build-time script that:
1. Walks content/articles/**/*.md recursively
2. Parses frontmatter + splits by H2/H3 headings into chunks
3. Embeds each chunk via Google text-embedding-004
4. Upserts all chunks to Upstash Vector with metadata

Usage:
    python scripts/build-embeddings.py

Env vars required:
    GEMINI_API_KEY              — Google AI API key
    UPSTASH_VECTOR_REST_URL     — Upstash Vector REST endpoint
    UPSTASH_VECTOR_REST_TOKEN   — Upstash Vector REST token
"""

import os
import re
import sys
import time
import json
from pathlib import Path

from google import genai
from upstash_vector import Index


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"
EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSION = 768
CHUNK_MAX_TOKENS = 500          # approximate, using word count as proxy
CHUNK_OVERLAP_TOKENS = 100      # overlap between adjacent chunks
UPSERT_BATCH_SIZE = 100         # Upstash batch upsert limit


# ---------------------------------------------------------------------------
# Frontmatter parsing
# ---------------------------------------------------------------------------
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def strip_frontmatter(text: str) -> tuple[dict, str]:
    """Strip YAML frontmatter and return (metadata_dict, body).

    Does a lightweight parse — only extracts title, parentSlug, date, tags.
    """
    metadata = {}
    match = FRONTMATTER_RE.match(text)
    if match:
        raw = match.group(1)
        for line in raw.split("\n"):
            if ":" in line:
                key, _, val = line.partition(":")
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key in ("title", "parentSlug", "date", "summary", "author"):
                    metadata[key] = val
                elif key == "tags":
                    # Handle JSON-style tag arrays
                    tag_match = re.findall(r'"([^"]+)"', val)
                    if tag_match:
                        metadata["tags"] = tag_match
        body = text[match.end():]
    else:
        body = text
    return metadata, body


# ---------------------------------------------------------------------------
# Heading-based chunking
# ---------------------------------------------------------------------------
HEADING_RE = re.compile(r"^(#{2,3})\s+(.+)$", re.MULTILINE)


def estimate_tokens(text: str) -> int:
    """Rough token estimate using word count (~0.75 words per token)."""
    return int(len(text.split()) / 0.75)


def chunk_by_headings(body: str, max_tokens: int = CHUNK_MAX_TOKENS,
                      overlap_tokens: int = CHUNK_OVERLAP_TOKENS) -> list[dict]:
    """Split markdown body into chunks by H2/H3 headings.

    Each chunk includes:
        - heading: the section heading (or "Introduction" for preamble)
        - text: the chunk text content
    
    If a section exceeds max_tokens, it is further split with overlap.
    """
    # Find all heading positions
    headings = list(HEADING_RE.finditer(body))

    sections = []
    if not headings:
        # No headings — treat entire body as one section
        sections.append({"heading": "Introduction", "text": body.strip()})
    else:
        # Preamble before first heading
        preamble = body[:headings[0].start()].strip()
        if preamble and len(preamble.split()) > 20:
            sections.append({"heading": "Introduction", "text": preamble})

        # Each heading section
        for i, match in enumerate(headings):
            heading_text = match.group(2).strip()
            # Remove markdown formatting from heading (bold, links, emoji)
            heading_text = re.sub(r"\*\*(.+?)\*\*", r"\1", heading_text)
            heading_text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", heading_text)

            start = match.end()
            end = headings[i + 1].start() if i + 1 < len(headings) else len(body)
            section_text = body[start:end].strip()

            if section_text:
                sections.append({"heading": heading_text, "text": section_text})

    # Further split large sections with overlap
    chunks = []
    for section in sections:
        text = section["text"]
        token_est = estimate_tokens(text)

        if token_est <= max_tokens:
            chunks.append(section)
        else:
            # Split by paragraphs, accumulate until max_tokens
            paragraphs = re.split(r"\n\n+", text)
            current_chunk = []
            current_tokens = 0

            for para in paragraphs:
                para_tokens = estimate_tokens(para)
                if current_tokens + para_tokens > max_tokens and current_chunk:
                    chunks.append({
                        "heading": section["heading"],
                        "text": "\n\n".join(current_chunk)
                    })
                    # Overlap: keep last few paragraphs
                    overlap_text = ""
                    overlap_paras = []
                    for p in reversed(current_chunk):
                        if estimate_tokens(overlap_text + p) > overlap_tokens:
                            break
                        overlap_paras.insert(0, p)
                        overlap_text = "\n\n".join(overlap_paras)
                    current_chunk = overlap_paras + [para]
                    current_tokens = estimate_tokens("\n\n".join(current_chunk))
                else:
                    current_chunk.append(para)
                    current_tokens += para_tokens

            if current_chunk:
                chunks.append({
                    "heading": section["heading"],
                    "text": "\n\n".join(current_chunk)
                })

    return chunks


# ---------------------------------------------------------------------------
# File walking & metadata extraction
# ---------------------------------------------------------------------------
def resolve_article_metadata(filepath: Path) -> dict:
    """Derive article_title, article_slug, and source_file from filepath.

    Examples:
        content/articles/system-design.md
            → slug: "system-design", title from frontmatter or filename
        content/articles/system-design/08-caching.md
            → slug: "system-design/08-caching"
        content/articles/system-design/08-caching/cache-invalidation.md
            → slug: "system-design/08-caching/cache-invalidation"
    """
    rel = filepath.relative_to(CONTENT_DIR)
    parts = list(rel.parts)
    # Remove .md extension from last part
    parts[-1] = parts[-1].replace(".md", "")
    slug = "/".join(parts)
    
    if parts[0] == "articles":
        url = f"/articles/{'/'.join(parts[1:])}"
    elif parts[0] == "bio":
        url = f"https://sunilkunchoor.github.io/{'/'.join(parts[1:])}"
    else:
        url = f"/{'/'.join(parts)}"
        
    source_file = str(filepath.relative_to(CONTENT_DIR.parent.parent))
    return {"article_slug": slug, "source_file": source_file, "url": url}


def find_article_title(slug: str) -> str:
    """Look up article title from the JSON config for the top-level slug."""
    top_slug = slug.split("/")[0]
    json_path = CONTENT_DIR / f"{top_slug}.json"
    if json_path.exists():
        try:
            config = json.loads(json_path.read_text(encoding="utf-8"))
            return config.get("title", top_slug)
        except (json.JSONDecodeError, KeyError):
            pass
    return top_slug


def collect_all_chunks() -> list[dict]:
    """Walk all markdown files and return a list of chunk dicts."""
    all_chunks = []
    md_files = sorted(CONTENT_DIR.rglob("*.md"))

    print(f"Found {len(md_files)} markdown files in {CONTENT_DIR}")

    for filepath in md_files:
        file_meta = resolve_article_metadata(filepath)
        raw = filepath.read_text(encoding="utf-8")
        fm_meta, body = strip_frontmatter(raw)

        # Skip near-empty files
        if len(body.strip().split()) < 30:
            print(f"  SKIP (too short): {file_meta['source_file']}")
            continue

        article_title = fm_meta.get("title") or find_article_title(
            file_meta["article_slug"]
        )

        chunks = chunk_by_headings(body)
        for i, chunk in enumerate(chunks):
            chunk_id = f"{file_meta['article_slug']}#{chunk['heading'].lower().replace(' ', '-')}"
            # De-duplicate IDs by appending index if needed
            if i > 0 or any(c.get("id") == chunk_id for c in all_chunks):
                chunk_id = f"{chunk_id}-{i}"

            all_chunks.append({
                "id": chunk_id,
                "text": chunk["text"],
                "metadata": {
                    "text": chunk["text"][:4000],  # Upstash metadata limit
                    "article_title": article_title,
                    "article_slug": file_meta["article_slug"],
                    "url": file_meta["url"],
                    "heading": chunk["heading"],
                    "source_file": file_meta["source_file"],
                },
            })

    return all_chunks


# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------
def embed_chunks(client: genai.Client, chunks: list[dict]) -> list[dict]:
    """Embed all chunks using gemini-embedding-2 in parallel."""
    print(f"\nEmbedding {len(chunks)} chunks with {EMBEDDING_MODEL} (in parallel)...")

    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    def _embed(chunk):
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=chunk["text"],
            config={"output_dimensionality": 768},
        )
        chunk["embedding"] = result.embeddings[0].values

    completed = 0
    # Use 5 parallel workers to stay safely within the 1500 RPM limit
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(_embed, c) for c in chunks]
        for future in as_completed(futures):
            future.result() # Propagate any errors
            completed += 1
            if completed % 100 == 0 or completed == len(chunks):
                print(f"  Embedded {completed}/{len(chunks)} chunks")

    return chunks


# ---------------------------------------------------------------------------
# Upstash Vector upsert
# ---------------------------------------------------------------------------
def upsert_to_upstash(index: Index, chunks: list[dict]):
    """Reset the index and upsert all chunks in batches."""
    print(f"\nResetting Upstash Vector index...")
    index.reset()
    # Brief pause after reset for index to be ready
    time.sleep(2)

    print(f"Upserting {len(chunks)} vectors to Upstash...")
    for i in range(0, len(chunks), UPSERT_BATCH_SIZE):
        batch = chunks[i : i + UPSERT_BATCH_SIZE]
        vectors = []
        for chunk in batch:
            vectors.append({
                "id": chunk["id"],
                "vector": chunk["embedding"],
                "metadata": chunk["metadata"],
            })
        index.upsert(vectors=vectors)

        done = min(i + UPSERT_BATCH_SIZE, len(chunks))
        print(f"  Upserted {done}/{len(chunks)} vectors")
        if i + UPSERT_BATCH_SIZE < len(chunks):
            time.sleep(0.3)

    # Verify
    time.sleep(2)
    info = index.info()
    print(f"\nUpstash Vector index info:")
    print(f"  Vectors: {info.vector_count}")
    print(f"  Dimension: {info.dimension}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    from dotenv import load_dotenv
    load_dotenv(".env.local")
    start_time = time.time()

    # Validate env vars
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable is required.")
        sys.exit(1)

    upstash_url = os.environ.get("UPSTASH_VECTOR_REST_URL")
    upstash_token = os.environ.get("UPSTASH_VECTOR_REST_TOKEN")
    if not upstash_url or not upstash_token:
        print("ERROR: UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN are required.")
        sys.exit(1)

    # Check content directory exists
    if not CONTENT_DIR.exists():
        print(f"ERROR: Content directory not found: {CONTENT_DIR}")
        sys.exit(1)

    print("=" * 60)
    print("RAG Embedding Pipeline — Build & Upload to Upstash Vector")
    print("=" * 60)

    # 1. Collect and chunk all articles
    chunks = collect_all_chunks()
    
    if "test" in sys.argv:
        print("\n[TEST MODE] Limiting to first 100 chunks.")
        chunks = chunks[:100]
        
    print(f"\nTotal chunks to embed: {len(chunks)}")

    if not chunks:
        print("WARNING: No chunks found. Check content directory.")
        sys.exit(0)

    # 2. Embed all chunks
    client = genai.Client(api_key=api_key)
    chunks = embed_chunks(client, chunks)

    # 3. Upsert to Upstash Vector
    index = Index(url=upstash_url, token=upstash_token)
    upsert_to_upstash(index, chunks)

    elapsed = time.time() - start_time
    print(f"\n✅ Pipeline completed in {elapsed:.1f}s")
    print(f"   {len(chunks)} chunks embedded and uploaded to Upstash Vector")


if __name__ == "__main__":
    main()
