"use client";

import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="text-xl font-bold mb-2">Sunil Kunchoor Basavaraju</div>
            <p className="text-slate-500 text-sm">Senior MLOps Engineer • Delivering Enterprise AI Excellence</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="https://github.com/sunilkunchoor" className="p-3 bg-white/5 rounded-full hover:bg-primary/20 hover:text-primary transition-all">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/sunilkunchoor" className="p-3 bg-white/5 rounded-full hover:bg-primary/20 hover:text-primary transition-all">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="mailto:sunilkunchoor@gmail.com" className="p-3 bg-white/5 rounded-full hover:bg-primary/20 hover:text-primary transition-all">
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} Sunil Kunchoor. All rights reserved. Built with Next.js & AI Intelligence.
        </div>
      </div>
    </footer>
  );
}
