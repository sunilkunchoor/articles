require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const articlesDir = path.join(__dirname, '../content/articles');

// Helper to resolve relative image paths to repository-root paths
function resolveRepoPath(markdownRepoPath, relativeImageHref) {
  const baseDir = path.dirname(markdownRepoPath);
  const hrefParts = relativeImageHref.split('/');
  const resolvedParts = baseDir.split('/');

  for (const part of hrefParts) {
    if (part === '.' || part === '') {
      continue;
    }
    if (part === '..') {
      resolvedParts.pop();
    } else {
      resolvedParts.push(part);
    }
  }
  return resolvedParts.join('/');
}

// Download image, convert non-SVGs to lossy WebP (85% quality), and rewrite markdown tags
async function processMarkdownImages(rawContent, markdownRepoPath, owner, repo, branch, slug) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  let updatedContent = rawContent;
  const matches = [];

  // Collect all image matches first
  while ((match = imageRegex.exec(rawContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      alt: match[1],
      href: match[2]
    });
  }

  for (const m of matches) {
    const { fullMatch, alt, href } = m;
    
    // Skip absolute or data URLs
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/') || href.startsWith('data:')) {
      continue;
    }

    try {
      const resolvedRepoPath = resolveRepoPath(markdownRepoPath, href);
      const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'main'}/${resolvedRepoPath}`;
      
      console.log(`    - Downloading image: ${href} -> ${resolvedRepoPath}`);
      
      const headers = {};
      if (process.env.GITHUB_PAT) {
        headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
      }
      
      const imgRes = await fetch(imageUrl, { headers });
      if (!imgRes.ok) {
        console.warn(`    [WARNING] Failed to fetch image ${imageUrl}: ${imgRes.status}`);
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const ext = path.extname(resolvedRepoPath).toLowerCase();
      const isSvg = ext === '.svg';
      
      // Save as WebP unless it's an SVG
      const localFilename = isSvg ? path.basename(resolvedRepoPath) : `${path.basename(resolvedRepoPath, ext)}.webp`;
      const localRelDir = path.dirname(resolvedRepoPath);
      const localDir = path.join(__dirname, '../public/assets', slug, localRelDir);
      
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      const localFilePath = path.join(localDir, localFilename);
      
      if (isSvg) {
        fs.writeFileSync(localFilePath, buffer);
        console.log(`    - Saved SVG: ${localFilename}`);
      } else {
        await sharp(buffer)
          .webp({ quality: 85 })
          .toFile(localFilePath);
        console.log(`    - Saved WebP (85% Quality): ${localFilename}`);
      }

      // Rewrite markdown image source URL to point locally
      const webRelDir = localRelDir.replace(/\\/g, '/');
      const newWebUrl = `/articles/assets/${slug}/${webRelDir}/${localFilename}`;
      const newImageTag = `![${alt}](${newWebUrl})`;
      
      updatedContent = updatedContent.replace(fullMatch, newImageTag);
      console.log(`    - Rewrote image tag: ${href} -> ${newWebUrl}`);
    } catch (err) {
      console.error(`    [ERROR] Failed to process image ${href}:`, err);
    }
  }

  return updatedContent;
}

async function syncArticles() {
  try {
    console.log("Starting articles synchronization pipeline...");

    // Create base output directory if it doesn't exist
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    // Read all JSON configuration files in the articles folder
    const files = fs.readdirSync(articlesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log("No article JSON configurations found in content/articles.");
      console.log("Sync pipeline completed successfully!");
      return;
    }

    const headers = {};
    if (process.env.GITHUB_PAT) {
      console.log("Using GITHUB_PAT authentication header.");
      headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
    } else {
      console.log("[WARNING] No GITHUB_PAT found. Fetching from public endpoints.");
    }

    for (const jsonFile of jsonFiles) {
      const configPath = path.join(articlesDir, jsonFile);
      const article = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      console.log(`Processing article: ${article.title || article.slug}...`);

      if (article.type === 'local') {
        console.log(`- Local article verified: ${article.slug}.md`);
        continue;
      }

      if (article.type === 'remote') {
        const { owner, repo, branch, slug, mainPath, title, date, summary, tags, author, subPages } = article;
        const mainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'main'}/${mainPath}`;

        // 1. Fetch main article
        console.log(`- Fetching main article from: ${mainUrl}`);
        const response = await fetch(mainUrl, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch main article ${slug}: ${response.status}`);
        }
        let rawContent = await response.text();

        // Clean up markdown headers from the beginning if present
        if (rawContent.startsWith('# ') || rawContent.includes('# 🧠')) {
          const lines = rawContent.split('\n');
          const headerIdx = lines.findIndex(line => line.startsWith('# ') || line.startsWith('# 🧠'));
          if (headerIdx !== -1) {
            lines.splice(headerIdx, 1);
          }
          rawContent = lines.join('\n');
        }

        // Prep YAML Frontmatter
        const frontmatter = `---
title: "${title}"
date: "${date}"
summary: "${summary}"
tags: ${JSON.stringify(tags)}
author: "${author}"
---

`;

        const mainOutputFilePath = path.join(articlesDir, `${slug}.md`);
        const processedContent = await processMarkdownImages(rawContent, mainPath, owner, repo, branch, slug);
        fs.writeFileSync(mainOutputFilePath, frontmatter + processedContent.trim(), 'utf-8');
        console.log(`- Main article saved to: ${slug}.md`);

        // 2. Fetch sub pages if any
        if (subPages && subPages.length > 0) {
          const subPagesDir = path.join(articlesDir, slug);
          if (!fs.existsSync(subPagesDir)) {
            fs.mkdirSync(subPagesDir, { recursive: true });
          }

          for (const subPage of subPages) {
            const subPageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'main'}/${subPage.path}`;
            console.log(`  - Fetching subpage [${subPage.title}] from: ${subPageUrl}`);
            
            const subRes = await fetch(subPageUrl, { headers });
            if (!subRes.ok) {
              console.warn(`  [WARNING] Failed to fetch subpage: ${subPage.title}. Skipping.`);
              continue;
            }
            let subContent = await subRes.text();

            // Clean up headers
            if (subContent.startsWith('# ') || subContent.startsWith('## ')) {
              const lines = subContent.split('\n');
              lines.shift();
              subContent = lines.join('\n');
            }

            const subFrontmatter = `---
title: "${subPage.title}"
parentSlug: "${slug}"
---

`;

            // Slug array path creation
            const nestedPath = path.join(subPagesDir, ...subPage.slug);
            const nestedDir = path.dirname(nestedPath);
            
            if (!fs.existsSync(nestedDir)) {
              fs.mkdirSync(nestedDir, { recursive: true });
            }

            const processedSubContent = await processMarkdownImages(subContent, subPage.path, owner, repo, branch, slug);
            fs.writeFileSync(`${nestedPath}.md`, subFrontmatter + processedSubContent.trim(), 'utf-8');
            console.log(`  - Saved subpage to: ${path.join(slug, ...subPage.slug)}.md`);
          }
        }
      }
    }

    console.log("Sync pipeline completed successfully!");
  } catch (error) {
    console.error("Error in sync pipeline:", error);
    process.exit(1);
  }
}

syncArticles();
