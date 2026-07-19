import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import SearchableArticles from '@/components/SearchableArticles';

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
}

export default async function ArticlesPage() {
  const articlesDir = path.join(process.cwd(), 'content/articles');

  let articles: ArticleMeta[] = [];
  if (fs.existsSync(articlesDir)) {
    const files = fs.readdirSync(articlesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    articles = jsonFiles
      .map((file) => {
        const filePath = path.join(articlesDir, file);
        const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
          slug: article.slug,
          title: article.title,
          date: article.date,
          summary: article.summary,
          tags: article.tags || [],
        };
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navbar />

      <div className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-reveal">
            <h1 className="font-headline font-bold text-4xl md:text-5xl mb-4 tracking-tight">
              Technical <span className="text-primary">Articles</span> & Insights
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A curated collection of technical articles, deep dives, project documentation, and learning resources.
            </p>
          </div>

          {/* Searchable grid */}
          <SearchableArticles initialArticles={articles} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
