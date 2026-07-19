"use client";

import { GraduationCap, Calendar, BookOpen, ExternalLink, Github } from 'lucide-react';

export default function Education() {
  const education = [
    {
      degree: "AI Performance Engineer Fellowship",
      institution: "Nebius Academy",
      period: "2026 (In Progress)",
      description: "Advanced fellowship program focusing on high-performance training, inference, and hardware-aware optimization for LLM models.",
      link: "https://www.credly.com/users/sunilkunchoor/badges/credly",
      projectLink: "https://github.com/sunilkunchoor/ai-performance-engineering-fellowship"
    },
    {
      degree: "Post Graduate Program – AI & ML",
      institution: "Great Learning (University of Texas, Austin)",
      period: "2021 – 2022",
      description: "Specialized training in Artificial Intelligence and Machine Learning, focusing on deep learning, computer vision, and NLP.",
      link: "https://eportfolio.mygreatlearning.com/sunil-kunchoor-basavaraju",
      projectLink: "https://github.com/sunilkunchoor/pgp-ai-ml"
    },
    {
      degree: "Master of Science (Mathematics)",
      institution: "Bangalore University",
      period: "2012 – 2014",
      description: "Advanced mathematics degree providing the theoretical and statistical foundation for machine learning algorithms and data science.",
      link: "/documents/master-degree-verification.pdf"
    },
    {
      degree: "Bachelor of Science (Stats, Math, CS)",
      institution: "Bangalore University",
      period: "2009 – 2012",
      description: "Undergraduate degree in Statistics, Mathematics, and Computer Science, establishing strong computational and statistical foundations.",
      link: "/documents/bachelor-degree-verification.pdf"
    }
  ];

  return (
    <section id="education" className="py-24 relative bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Academic <span className="text-primary">Background</span></h2>
          <p className="text-slate-400">The theoretical foundations of my engineering practices.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {education.map((edu, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-16 h-16 text-primary" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-primary font-mono text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  {edu.period}
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors min-h-[56px] flex items-center">{edu.degree}</h3>

                <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                  <BookOpen className="w-4 h-4 text-primary/70" />
                  {edu.institution}
                </div>

                <p className="text-slate-400 leading-relaxed text-sm mb-4">
                  {edu.description}
                </p>
              </div>

              {(edu.link || edu.projectLink) && (
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  {edu.link ? (
                    <a
                      href={edu.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-white transition-colors group/link"
                    >
                      View Verification
                      <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                  ) : <div />}
                  {edu.projectLink && (
                    <a
                      href={edu.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group/link"
                    >
                      <Github className="w-3.5 h-3.5" />
                      View Projects
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
