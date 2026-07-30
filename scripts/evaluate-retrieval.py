#!/usr/bin/env python3
"""
evaluate-retrieval.py — Offline retrieval quality evaluation.

Runs a golden test set of questions against the Upstash Vector index
and measures retrieval accuracy using:
    - Recall@K (K=3, 5)
    - Mean Reciprocal Rank (MRR)
    - Hit Rate (at least 1 relevant chunk in top K)

Usage:
    python scripts/evaluate-retrieval.py

Env vars required:
    GEMINI_API_KEY
    UPSTASH_VECTOR_REST_URL
    UPSTASH_VECTOR_REST_TOKEN
"""

import os
import sys
import json
import time

from google import genai
from upstash_vector import Index


# ---------------------------------------------------------------------------
# Golden test set — question → expected source slug prefix
# The expected_source is matched as a prefix of the retrieved article_slug
# ---------------------------------------------------------------------------
GOLDEN_TEST_SET = [
    {
        "question": "What is a vector database?",
        "expected_source": "ai-system-architecture/01-vector-database",
        "key_terms": ["embeddings", "semantic search", "similarity"],
    },
    {
        "question": "How does Rust handle memory safety?",
        "expected_source": "logferry",
        "key_terms": ["ownership", "borrow"],
    },
    {
        "question": "What are the CAP theorem tradeoffs?",
        "expected_source": "system-design/06-availability",
        "key_terms": ["consistency", "availability", "partition"],
    },
    {
        "question": "How do you deploy a PyTorch model?",
        "expected_source": "pytorch-101/10-deployment",
        "key_terms": ["TorchScript", "ONNX"],
    },
    {
        "question": "What is a write-through cache?",
        "expected_source": "system-design/08-caching",
        "key_terms": ["write-through", "cache"],
    },
    {
        "question": "Explain the MCP protocol",
        "expected_source": "ai-system-architecture/06-mcp",
        "key_terms": ["model context protocol", "tool"],
    },
    {
        "question": "What is PyO3?",
        "expected_source": "logferry",
        "key_terms": ["Python", "Rust"],
    },
    {
        "question": "What are Terraform modules?",
        "expected_source": "terraform",
        "key_terms": ["module", "resource"],
    },
    {
        "question": "Explain RAG architecture",
        "expected_source": "ai-system-architecture/03-rag",
        "key_terms": ["retrieval", "augmented"],
    },
    {
        "question": "What is a circuit breaker pattern?",
        "expected_source": "system-design/15-design-patterns",
        "key_terms": ["fault", "fallback"],
    },
    {
        "question": "What is prompt engineering?",
        "expected_source": "ai-system-architecture/04-prompt-engineering",
        "key_terms": ["prompt", "LLM"],
    },
    {
        "question": "What is semantic caching?",
        "expected_source": "ai-system-architecture/05-semantic-cache",
        "key_terms": ["semantic", "cache", "similarity"],
    },
    {
        "question": "Explain Rust closures and iterators",
        "expected_source": "logferry",
        "key_terms": ["closure", "iterator"],
    },
    {
        "question": "What are AI agent guardrails?",
        "expected_source": "ai-system-architecture/09-agent-guardrails",
        "key_terms": ["guardrail", "safety"],
    },
    {
        "question": "What is function calling in LLMs?",
        "expected_source": "ai-system-architecture/08-function-calling",
        "key_terms": ["function", "API"],
    },
    {
        "question": "What is the C4 model?",
        "expected_source": "c4-model",
        "key_terms": ["C4", "architecture", "diagram"],
    },
    {
        "question": "What is load balancing?",
        "expected_source": "system-design/05-scalability",
        "key_terms": ["load", "balancer"],
    },
    {
        "question": "What is an embedding model?",
        "expected_source": "ai-system-architecture/02-embedding-model",
        "key_terms": ["embedding", "vector"],
    },
    {
        "question": "What is Apache Spark?",
        "expected_source": "apache-spark",
        "key_terms": ["Spark", "distributed"],
    },
    {
        "question": "What are database indexes?",
        "expected_source": "system-design/04-database",
        "key_terms": ["index", "query"],
    },
    {
        "question": "What is API rate limiting?",
        "expected_source": "system-design/11-api-design",
        "key_terms": ["rate", "limit"],
    },
    {
        "question": "How does an AI agent work?",
        "expected_source": "ai-system-architecture/07-ai-agent",
        "key_terms": ["agent", "autonomous"],
    },
    {
        "question": "What is DNS and how does it work?",
        "expected_source": "system-design/07-networking",
        "key_terms": ["DNS", "domain"],
    },
    {
        "question": "What is microservices architecture?",
        "expected_source": "system-design/10-compute",
        "key_terms": ["microservice", "service"],
    },
    {
        "question": "What is SSL/TLS encryption?",
        "expected_source": "system-design/12-security",
        "key_terms": ["SSL", "TLS", "encryption"],
    },
    {
        "question": "What are PyTorch tensors?",
        "expected_source": "pytorch-101/01-tensors",
        "key_terms": ["tensor", "PyTorch"],
    },
    {
        "question": "How does autograd work in PyTorch?",
        "expected_source": "pytorch-101/02-autograd",
        "key_terms": ["autograd", "gradient"],
    },
    {
        "question": "What is observability in system design?",
        "expected_source": "system-design/14-observability",
        "key_terms": ["observability", "monitoring"],
    },
    {
        "question": "What are AWS core services?",
        "expected_source": "aws",
        "key_terms": ["AWS", "cloud"],
    },
    {
        "question": "What is Azure cloud?",
        "expected_source": "azure",
        "key_terms": ["Azure", "cloud"],
    },
]


EMBEDDING_MODEL = "text-embedding-004"
TOP_K_VALUES = [3, 5]


def embed_query(client, query: str) -> list[float]:
    result = client.models.embed_content(model=EMBEDDING_MODEL, contents=query)
    return result.embeddings[0].values


def is_relevant(retrieved_slug: str, expected_prefix: str) -> bool:
    """Check if retrieved slug matches the expected source prefix."""
    return retrieved_slug.startswith(expected_prefix)


def evaluate():
    api_key = os.environ.get("GEMINI_API_KEY")
    upstash_url = os.environ.get("UPSTASH_VECTOR_REST_URL")
    upstash_token = os.environ.get("UPSTASH_VECTOR_REST_TOKEN")

    if not all([api_key, upstash_url, upstash_token]):
        print("ERROR: Missing env vars (GEMINI_API_KEY, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN)")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    index = Index(url=upstash_url, token=upstash_token)

    max_k = max(TOP_K_VALUES)

    print("=" * 70)
    print("RAG Retrieval Quality Evaluation")
    print("=" * 70)
    print(f"Test set size: {len(GOLDEN_TEST_SET)} questions")
    print(f"Top-K values: {TOP_K_VALUES}")
    print()

    results = []

    for i, test in enumerate(GOLDEN_TEST_SET, 1):
        question = test["question"]
        expected = test["expected_source"]

        # Embed the question
        query_vector = embed_query(client, question)
        time.sleep(0.3)  # Rate limit

        # Query Upstash
        search_results = index.query(
            vector=query_vector,
            top_k=max_k,
            include_metadata=True,
        )

        # Check each position for relevance
        retrieved_slugs = []
        ranks = []
        for rank, r in enumerate(search_results, 1):
            slug = r.metadata.get("article_slug", "") if r.metadata else ""
            retrieved_slugs.append(slug)
            if is_relevant(slug, expected):
                ranks.append(rank)

        # Compute metrics for this question
        reciprocal_rank = 1.0 / ranks[0] if ranks else 0.0
        recall_at = {}
        hit_at = {}
        for k in TOP_K_VALUES:
            relevant_in_top_k = sum(1 for slug in retrieved_slugs[:k] if is_relevant(slug, expected))
            recall_at[k] = 1.0 if relevant_in_top_k > 0 else 0.0  # Binary recall
            hit_at[k] = 1.0 if relevant_in_top_k > 0 else 0.0

        result = {
            "question": question,
            "expected": expected,
            "top_retrieved": retrieved_slugs[:3],
            "reciprocal_rank": reciprocal_rank,
            "recall_at": recall_at,
            "hit": hit_at,
            "scores": [r.score for r in search_results[:3]],
        }
        results.append(result)

        status = "✅" if reciprocal_rank > 0 else "❌"
        print(f"  {status} [{i:2d}/{len(GOLDEN_TEST_SET)}] {question}")
        if reciprocal_rank == 0:
            print(f"       Expected: {expected}")
            print(f"       Got: {retrieved_slugs[:3]}")

    # Aggregate metrics
    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)

    for k in TOP_K_VALUES:
        recall = sum(r["recall_at"][k] for r in results) / len(results)
        hit_rate = sum(r["hit"][k] for r in results) / len(results)
        print(f"  Recall@{k}:  {recall:.1%}  (target: {'≥80%' if k == 3 else '≥90%'})")
        print(f"  Hit Rate@{k}: {hit_rate:.1%}  (target: ≥95%)")

    mrr = sum(r["reciprocal_rank"] for r in results) / len(results)
    print(f"  MRR:        {mrr:.3f}  (target: ≥0.70)")

    total_hits = sum(1 for r in results if r["reciprocal_rank"] > 0)
    print(f"\n  Total: {total_hits}/{len(results)} questions had relevant results in top-{max_k}")

    # Save detailed results
    output_path = os.path.join(os.path.dirname(__file__), "..", "scratch", "retrieval-eval-results.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  Detailed results saved to: {output_path}")


if __name__ == "__main__":
    evaluate()
