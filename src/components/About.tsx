"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, Cloud, Zap, Database } from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Total Experience', value: '10+ Years', icon: Database },
    { label: 'MLOps Specialization', value: '3.5+ Years', icon: Zap },
    { label: 'Cloud Focus', value: 'Azure & Databricks', icon: Cloud },
    { label: 'Reliability', value: 'Self-healing Systems', icon: ShieldCheck },
  ];

  const slides = [
    {
      title: "Enterprise Ready",
      description: "Deploying LLMs and Computer Vision models to edge and cloud with zero-downtime architectures.",
      icon: Cloud,
    },
    {
      title: "Automated Governance",
      description: "Enforcing quality gates, vulnerability checks (Snyk), and regression testing on every pipeline run.",
      icon: ShieldCheck,
    },
    {
      title: "Cost Optimization",
      description: "Leveraging ONNX, OpenVINO, and quantization to optimize inference compute costs at scale.",
      icon: Zap,
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              From Notebooks to <span className="text-primary">Scalable Platforms</span>
            </h2>
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
              <p>
                I specialize in building scalable, secure, and self-healing AI platforms. I help enterprises navigate the complex transition from experimental Jupyter notebooks to robust, production-grade cloud environments.
              </p>
              <p>
                My approach focuses on creating automated governance and robust monitoring systems that empower Data Scientists rather than slowing them down. I believe that MLOps isn't just about automation—it's about building trust in AI.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-xl hover:bg-white/10 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass-card aspect-square rounded-2xl overflow-hidden flex items-center justify-center p-12">
              <div className="relative w-full h-full border border-white/10 rounded-xl flex flex-col items-center justify-between text-center bg-slate-900/40 p-10">
                
                {/* Active Slide Content */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  {/* Icon */}
                  <div key={`icon-${activeSlide}`} className="p-4 bg-primary/10 rounded-full animate-in fade-in zoom-in duration-500">
                    {(() => {
                      const IconComponent = slides[activeSlide].icon;
                      return <IconComponent className="w-12 h-12 text-primary" />;
                    })()}
                  </div>
                  
                  {/* Text */}
                  <div key={`text-${activeSlide}`} className="px-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-2xl font-bold text-white">{slides[activeSlide].title}</div>
                    <p className="text-slate-400 text-sm leading-relaxed min-h-[60px] max-w-sm mx-auto">
                      {slides[activeSlide].description}
                    </p>
                  </div>
                </div>

                {/* Dots indicators */}
                <div className="flex space-x-3 mt-6">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        activeSlide === idx 
                          ? 'bg-primary scale-110 shadow-[0_0_8px_rgba(125,249,255,0.8)]' 
                          : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

