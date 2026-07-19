"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, Github, Linkedin, Menu, X } from 'lucide-react';
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Navigation className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">
            Knowledge <span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4 ml-2">
            <Link href="https://github.com/sunilkunchoor" target="_blank" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/sunilkunchoor" target="_blank" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(125,249,255,0.1)] hover:shadow-[0_0_20px_rgba(125,249,255,0.25)] transition-all duration-300 bg-slate-950/30" size="sm">
              <a href="https://sunilkunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                Portfolio
              </a>
            </Button>
            <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(125,249,255,0.1)] hover:shadow-[0_0_20px_rgba(125,249,255,0.25)] transition-all duration-300 bg-slate-950/30" size="sm">
              <a href="https://skunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                AI Playground
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
            <div className="flex flex-col space-y-4">
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href="https://sunilkunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  Portfolio
                </a>
              </Button>
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href="https://skunchoor.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  AI Playground
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
