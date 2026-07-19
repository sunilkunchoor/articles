"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Tag, X } from 'lucide-react';

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
}

interface SearchableArticlesProps {
  initialArticles: ArticleMeta[];
}

export default function SearchableArticles({ initialArticles }: SearchableArticlesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialArticles.forEach((article) => {
      article.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [initialArticles]);

  // Filter articles based on search query and selected tag
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag ? article.tags.includes(selectedTag) : true;
      
      return matchesSearch && matchesTag;
    });
  }, [initialArticles, searchQuery, selectedTag]);

  return (
    <div className="space-y-12">
      {/* Search and Filter Section */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl max-w-4xl mx-auto space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search articles by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tags Filters */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Tag className="w-3.5 h-3.5 text-primary/70" />
            <span>Filter by Topic Tag</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                selectedTag === null
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(125,249,255,0.1)]'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                  tag === selectedTag
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(125,249,255,0.1)]'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((article) => (
            <article 
              key={article.slug}
              className="glass-card p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_30px_rgba(125,249,255,0.1)] hover:-translate-y-1"
            >
              <div>
                {/* Meta info */}
                <div className="flex items-center space-x-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/articles/${article.slug}`}>
                  <h2 className="font-headline font-bold text-xl text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h2>
                </Link>

                {/* Summary */}
                <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag === selectedTag ? null : tag);
                      }}
                      className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border transition-all ${
                        tag === selectedTag
                          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(125,249,255,0.15)]'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Read More */}
                <Link 
                  href={`/articles/${article.slug}`}
                  className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                >
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-2xl border border-white/5 max-w-md mx-auto space-y-4">
          <p className="text-slate-400 text-lg">No articles matched your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="text-xs text-primary font-semibold border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-all"
          >
            Clear Filters & Search
          </button>
        </div>
      )}
    </div>
  );
}
