import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import Mermaid from '@/components/Mermaid';
import { Calendar, ArrowLeft, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  if (!fs.existsSync(articlesDir)) return [];

  const paths: { slug: string[] }[] = [];

  function walk(dir: string, currentSlug: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, [...currentSlug, file]);
      } else if (file.endsWith('.md')) {
        const fileSlug = file.replace('.md', '');
        paths.push({
          slug: [...currentSlug, fileSlug],
        });
      }
    }
  }

  walk(articlesDir);
  return paths;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const mainSlug = slug[0];
  const relativeFilePath = slug.join('/') + '.md';
  const filePath = path.join(process.cwd(), 'content/articles', relativeFilePath);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  // Load article markdown
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Calculate reading time
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const isSubPage = slug.length > 1;

  // Fetch specific article configuration to get the hierarchy and metadata for remote links/images
  const articleConfigPath = path.join(process.cwd(), 'content/articles', `${mainSlug}.json`);
  let subPages: any[] = [];
  let mainTitle = '';
  let isRemote = false;
  let owner = '';
  let repo = '';
  let branch = 'main';
  let remoteFilePath = '';
  let mainPath = '';

  if (fs.existsSync(articleConfigPath)) {
    const config = JSON.parse(fs.readFileSync(articleConfigPath, 'utf-8'));
    subPages = config.subPages || [];
    mainTitle = config.title;
    if (config.type === 'remote') {
      isRemote = true;
      mainPath = config.mainPath || '';
      owner = config.owner;
      repo = config.repo;
      branch = config.branch || 'main';
      if (!isSubPage) {
        remoteFilePath = config.mainPath;
      } else {
        const subSlugPath = slug.slice(1).join('/');
        const subPage = subPages.find((sub: any) => sub.slug.join('/') === subSlugPath);
        if (subPage) {
          remoteFilePath = subPage.path;
        }
      }
    }
  }

  // Convert markdown to HTML with custom renderer
  const renderer = new marked.Renderer();

  // Custom heading renderer to generate IDs for table of contents
  renderer.heading = function (text: string, level: number, raw: string) {
    const id = raw
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };

  // Custom link renderer to rewrite relative Markdown hyperlinks to slug paths
  renderer.link = function (href: string, title: string | null | undefined, text: string) {
    let displayText = text;
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    if (cleanText.endsWith('.md')) {
      const matchedPage = subPages.find((sub: any) => sub.path && sub.path.endsWith(cleanText));
      if (matchedPage && matchedPage.title) {
        // If it was wrapped in code tags, preserve them but replace the text
        if (text.startsWith('<code>') && text.endsWith('</code>')) {
          displayText = `<code>${matchedPage.title}</code>`;
        } else {
          displayText = matchedPage.title;
        }
      } else {
        displayText = text.replace(/\.md(<\/code>)?$/, '$1');
      }
    }

    if (!href) {
      return `<a href="${href}"${title ? ` title="${title}"` : ''}>${displayText}</a>`;
    }

    let resolvedHref = href;
    // Check if relative link (not absolute, not an email, not anchor)
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('/') && !href.startsWith('#')) {
      const hashIndex = href.indexOf('#');
      const hash = hashIndex !== -1 ? href.substring(hashIndex) : '';
      const pathOnly = hashIndex !== -1 ? href.substring(0, hashIndex) : href;

      if (isRemote && remoteFilePath) {
        const dirParts = remoteFilePath.split('/').slice(0, -1);
        const linkParts = pathOnly.split('/');

        for (const part of linkParts) {
          if (part === '.' || part === '') continue;
          if (part === '..') dirParts.pop();
          else dirParts.push(part);
        }
        let targetRepoPath = dirParts.join('/');

        if (!targetRepoPath.endsWith('.md')) {
          targetRepoPath += targetRepoPath.endsWith('/') ? 'README.md' : '/README.md';
        }

        const matchedPage = subPages.find((sub: any) => sub.path === targetRepoPath);
        if (matchedPage) {
          resolvedHref = `/${mainSlug}/${matchedPage.slug.join('/')}${hash}`;
        } else if (mainPath && targetRepoPath === mainPath) {
          resolvedHref = `/${mainSlug}${hash}`;
        } else {
          // Fallback if not mapped
          let strippedPath = pathOnly;
          if (strippedPath.endsWith('.md')) strippedPath = strippedPath.slice(0, -3);
          if (strippedPath === 'README' || strippedPath === 'README.md') strippedPath = '';
          else if (strippedPath.endsWith('/README')) strippedPath = strippedPath.slice(0, -7);

          let fallbackDirParts = remoteFilePath.split('/').slice(0, -1);
          if (fallbackDirParts[0] === 'docs') fallbackDirParts.shift();

          const fallbackResolvedParts = [...fallbackDirParts];
          for (const part of strippedPath.split('/')) {
            if (part === '.' || part === '' || part === 'docs') continue;
            if (part === '..') fallbackResolvedParts.pop();
            else fallbackResolvedParts.push(part);
          }
          resolvedHref = `/${mainSlug}${fallbackResolvedParts.length > 0 ? '/' + fallbackResolvedParts.join('/') : ''}${hash}`;
        }
      } else {
        // Local files fallback
        let strippedPath = pathOnly;
        if (strippedPath.endsWith('.md')) strippedPath = strippedPath.slice(0, -3);
        if (strippedPath === 'README' || strippedPath === 'README.md') strippedPath = '';
        else if (strippedPath.endsWith('/README')) strippedPath = strippedPath.slice(0, -7);

        const baseDirParts = slug.length > 1 ? slug.slice(1, -1) : [];
        const resolvedParts = [...baseDirParts];

        for (const part of strippedPath.split('/')) {
          if (part === '.' || part === '') continue;
          if (part === '..') resolvedParts.pop();
          else resolvedParts.push(part);
        }
        resolvedHref = `/${mainSlug}${resolvedParts.length > 0 ? '/' + resolvedParts.join('/') : ''}${hash}`;
      }
    }

    if (resolvedHref.startsWith('/') && !resolvedHref.startsWith('/articles/')) {
      resolvedHref = `/articles${resolvedHref}`;
    }

    return `<a href="${resolvedHref}"${title ? ` title="${title}"` : ''}>${displayText}</a>`;
  };

  // Custom image renderer to rewrite relative images to local public WebP paths
  renderer.image = function (href: string, title: string | null, text: string) {
    if (!href) return '';

    let resolvedHref = href;
    if (isRemote && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('data:') && !href.startsWith('/')) {
      const hrefParts = href.split('/');
      const filename = hrefParts[hrefParts.length - 1];
      const dotIdx = filename.lastIndexOf('.');
      const ext = dotIdx !== -1 ? filename.substring(dotIdx).toLowerCase() : '';

      let resolvedParts: string[] = [];
      if (filename === 'overview.png') {
        resolvedParts = ['docs', 'assets', 'overview.png'];
      } else {
        // Resolve to the specific chapter folder
        const chapter = slug.length > 1 ? slug[1] : '';
        if (chapter) {
          resolvedParts = ['docs', chapter, 'assets', filename];
        } else {
          resolvedParts = ['docs', 'assets', filename];
        }
      }

      // Map PNG/JPG/GIF extensions to WebP
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        const baseName = filename.substring(0, filename.length - ext.length);
        resolvedParts[resolvedParts.length - 1] = `${baseName}.webp`;
      }

      resolvedHref = `/${mainSlug}/${resolvedParts.join('/')}`;
    } else if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('data:') && href.startsWith('/')) {
      // Just keep it as is, but prefix later
    }

    if (resolvedHref.startsWith('/') && !resolvedHref.startsWith('/articles/')) {
      resolvedHref = `/articles${resolvedHref}`;
    }

    return `<img src="${resolvedHref}" alt="${text || ''}"${title ? ` title="${title}"` : ''} style="user-select: none; -webkit-user-drag: none;" ondragstart="return false;" oncontextmenu="return false;" />`;
  };

  // Custom code block renderer to highlight code with Prism based on language
  renderer.code = function (code: string, infostring: string | undefined, escaped: boolean) {
    const lang = (infostring || '').match(/^\S*/)?.[0] || 'text';

    let highlightedCode = code;
    if (Prism.languages[lang]) {
      try {
        highlightedCode = Prism.highlight(code, Prism.languages[lang], lang);
      } catch (err) {
        console.error(`Prism failed to highlight language ${lang}:`, err);
      }
    } else {
      // Escape HTML for plain/unrecognized code blocks
      highlightedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    return `<pre class="language-${lang}"><code class="language-${lang}">${highlightedCode}</code></pre>\n`;
  };

  const htmlContent = await marked.parse(content, { renderer });

  const hasSidebar = subPages.length > 0;

  // Helpers for chronological sidebar group rendering
  const isGroupParent = (groupKey: string) => {
    return subPages.some((sub: any) => sub.slug.length > 1 && sub.slug[0] === groupKey);
  };

  const getGroupChildren = (groupKey: string) => {
    return subPages.filter((sub: any) => sub.slug.length > 1 && sub.slug[0] === groupKey);
  };

  const groupIndexPages: { [key: string]: any } = {};
  subPages.forEach((sub: any) => {
    if (sub.slug.length === 1 && isGroupParent(sub.slug[0])) {
      groupIndexPages[sub.slug[0]] = sub;
    }
  });

  const renderedGroups = new Set<string>();
  const renderedSubPages = new Set<string>();

  function formatGroupName(name: string) {
    const match = name.match(/^(\d+)-(.*)$/);
    if (match) {
      const num = match[1];
      const text = match[2];
      const formattedText = text
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${num} — ${formattedText}`;
    }
    return name
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navbar />
      <Mermaid />

      <div className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Main Layout Grid */}
          <div className={`grid grid-cols-1 ${hasSidebar ? 'lg:grid-cols-4' : 'max-w-3xl mx-auto'} gap-12`}>

            {/* Left Sidebar (Desktop Navigation) */}
            {hasSidebar && (
              <aside className="lg:col-span-1 border-r border-white/5 pr-6 h-fit sticky top-28 hidden lg:block overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Course / Project
                  </span>
                  <Link href={`/${mainSlug}`}>
                    <h3 className="font-headline font-semibold text-lg text-white hover:text-primary transition-colors leading-snug">
                      {mainTitle}
                    </h3>
                  </Link>
                </div>

                <nav className="space-y-4">
                  {/* Introduction link */}
                  <Link
                    href={`/${mainSlug}`}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!isSubPage
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(125,249,255,0.05)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Introduction</span>
                  </Link>

                  {/* Chronological order-preserving render map */}
                  {subPages.map((sub: any) => {
                    const subSlugPath = sub.slug.join('/');

                    if (renderedSubPages.has(subSlugPath)) {
                      return null;
                    }

                    const isGroup = sub.slug.length === 1 && isGroupParent(sub.slug[0]);

                    if (isGroup) {
                      const groupKey = sub.slug[0];
                      if (renderedGroups.has(groupKey)) {
                        return null;
                      }
                      renderedGroups.add(groupKey);

                      const groupHref = `/${mainSlug}/${groupKey}`;
                      const isGroupActive = isSubPage && slug.slice(1).join('/') === groupKey;
                      const children = getGroupChildren(groupKey);

                      children.forEach((child: any) => {
                        renderedSubPages.add(child.slug.join('/'));
                      });

                      return (
                        <div key={groupKey} className="space-y-1.5 pt-2">
                          <Link
                            href={groupHref}
                            className={`text-[10px] uppercase tracking-wider font-bold block px-3 mb-1.5 transition-colors ${isGroupActive
                                ? 'text-primary shadow-[0_0_10px_rgba(125,249,255,0.05)]'
                                : 'text-slate-500 hover:text-white'
                              }`}
                          >
                            {sub.title}
                          </Link>
                          <div className="space-y-1">
                            {children.map((child: any) => {
                              const childSlugPath = child.slug.join('/');
                              const childHref = `/${mainSlug}/${childSlugPath}`;
                              const isChildActive = isSubPage && slug.slice(1).join('/') === childSlugPath;

                              return (
                                <Link
                                  key={childSlugPath}
                                  href={childHref}
                                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${isChildActive
                                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(125,249,255,0.05)]'
                                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                  <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-600" />
                                  <span className="line-clamp-1">{child.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (sub.slug.length > 1) {
                      const groupKey = sub.slug[0];
                      if (!renderedGroups.has(groupKey)) {
                        renderedGroups.add(groupKey);

                        const children = getGroupChildren(groupKey);
                        children.forEach((child: any) => {
                          renderedSubPages.add(child.slug.join('/'));
                        });

                        const groupHref = `/${mainSlug}/${groupKey}`;
                        const groupFilePath = path.join(process.cwd(), 'content/articles', mainSlug, `${groupKey}.md`);
                        const hasGroupFile = fs.existsSync(groupFilePath);
                        const isGroupActive = isSubPage && slug.slice(1).join('/') === groupKey;
                        const groupTitle = formatGroupName(groupKey);

                        return (
                          <div key={groupKey} className="space-y-1.5 pt-2">
                            {hasGroupFile ? (
                              <Link
                                href={groupHref}
                                className={`text-[10px] uppercase tracking-wider font-bold block px-3 mb-1.5 transition-colors ${isGroupActive
                                    ? 'text-primary shadow-[0_0_10px_rgba(125,249,255,0.05)]'
                                    : 'text-slate-500 hover:text-white'
                                  }`}
                              >
                                {groupTitle}
                              </Link>
                            ) : (
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block px-3 mb-1">
                                {groupTitle}
                              </span>
                            )}
                            <div className="space-y-1">
                              {children.map((child: any) => {
                                const childSlugPath = child.slug.join('/');
                                const childHref = `/${mainSlug}/${childSlugPath}`;
                                const isChildActive = isSubPage && slug.slice(1).join('/') === childSlugPath;

                                return (
                                  <Link
                                    key={childSlugPath}
                                    href={childHref}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${isChildActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(125,249,255,0.05)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                      }`}
                                  >
                                    <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-600" />
                                    <span className="line-clamp-1">{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    // Flat subpage link rendering
                    const subHref = `/${mainSlug}/${subSlugPath}`;
                    const isActive = isSubPage && slug.slice(1).join('/') === subSlugPath;
                    renderedSubPages.add(subSlugPath);

                    return (
                      <Link
                        key={subSlugPath}
                        href={subHref}
                        className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(125,249,255,0.05)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{sub.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            )}

            {/* Main Content Area */}
            <div className={`${hasSidebar ? 'lg:col-span-3 max-w-4xl' : 'w-full'}`}>
              {/* Back to Blog Listing */}
              <div className="flex items-center space-x-4 mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                  Back to Articles
                </Link>
                {isSubPage && (
                  <>
                    <span className="text-slate-600">/</span>
                    <Link
                      href={`/${mainSlug}`}
                      className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      {mainTitle}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Navigation Dropdown (Only visible on Mobile when sub-pages exist) */}
              {hasSidebar && (
                <div className="lg:hidden glass-card p-4 rounded-xl border border-white/5 mb-8">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">
                    Sections
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/${mainSlug}`}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!isSubPage
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-white/5 border-transparent text-slate-400'
                        }`}
                    >
                      Introduction
                    </Link>
                    {subPages.map((sub: any) => {
                      const subSlugPath = sub.slug.join('/');
                      const isActive = isSubPage && slug.slice(1).join('/') === subSlugPath;
                      return (
                        <Link
                          key={subSlugPath}
                          href={`/${mainSlug}/${subSlugPath}`}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${isActive
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-white/5 border-transparent text-slate-400'
                            }`}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Article Header */}
              <header className="mb-12 border-b border-white/10 pb-8">
                <h1 className="font-headline font-bold text-3xl md:text-5xl text-white mb-6 leading-tight">
                  {data.title || slug[slug.length - 1]}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  {data.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(data.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {readingTime} min read
                  </span>
                  {data.author && (
                    <span className="text-slate-400">
                      By {data.author}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {data.tags && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {data.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-white/5 text-slate-300 rounded-full border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Article Content */}
              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
