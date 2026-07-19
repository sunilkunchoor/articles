"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Github, Linkedin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Education', href: '/#education' },
    { name: 'Certifications', href: '/#certifications' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Philosophy', href: '/#philosophy' },
    { name: 'Articles', href: '/articles' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">
            Sunil <span className="text-primary">Kunchoor</span> Basavaraju
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const isArticles = link.name === 'Articles';
            const isActive = isArticles && pathname.startsWith('/articles');

            if (isArticles) {
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`relative text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(125,249,255,0.2)]'
                      : 'bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary-hover shadow-[0_0_10px_rgba(125,249,255,0.05)]'
                  }`}
                >
                  Articles
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </Link>
              );
            }

            return (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            );
          })}
          <div className="flex items-center space-x-4 border-l border-white/10 pl-6 ml-2">
            <Link href="https://github.com/sunilkunchoor" target="_blank" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/sunilkunchoor" target="_blank" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(125,249,255,0.1)] hover:shadow-[0_0_20px_rgba(125,249,255,0.25)] transition-all duration-300 bg-slate-950/30" size="sm">
              <a href="https://skunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                AI Playground
              </a>
            </Button>
            <Button asChild variant="default" className="btn-primary" size="sm">
              <a href="mailto:sunilkunchoor@gmail.com">
                Contact Me
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-nav absolute top-full left-0 right-0 border-t border-white/10 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => {
              const isArticles = link.name === 'Articles';
              const isActive = isArticles && pathname.startsWith('/articles');

              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-lg font-medium transition-colors flex items-center justify-between ${
                    isActive 
                      ? 'text-primary' 
                      : isArticles 
                        ? 'text-primary/90' 
                        : 'text-slate-300 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {isArticles && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-4">
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href="https://skunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  AI Playground
                </a>
              </Button>
              <Button asChild variant="default" className="btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href="mailto:sunilkunchoor@gmail.com">
                  Contact Me
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
