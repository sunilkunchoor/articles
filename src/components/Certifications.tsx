"use client";

import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Certifications() {
  const certifications = [
    {
      title: "Databricks — Data, ML & GenAI",
      issuer: "Databricks",
      link: "https://www.credential.net/profile/sunilkunchoor/",
      description: "Expertise in large-scale data processing and generative AI implementation on the Databricks platform.",
      icon: Award
    },
    {
      title: "IBM Data Science Professional Certificate",
      issuer: "Coursera / IBM",
      link: "https://coursera.org/share/1d8c22add8a9d639e0047b765798c133",
      description: "Comprehensive training in statistical analysis, predictive modeling, and data science methodologies.",
      icon: Award
    },
    {
      title: "GitHub Actions Certification",
      issuer: "GitHub",
      link: "https://www.credly.com/badges/ebfdf196-e4da-4b88-bb0f-9b689d82a2cf/public_url",
      description: "Advanced CI/CD automation and workflow optimization for enterprise-grade software delivery.",
      icon: ShieldCheck
    }
  ];

  return (
    <section id="certifications" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional <span className="text-primary">Certifications</span></h2>
          <p className="text-slate-400">Validated expertise in cloud platforms and AI engineering.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {certifications.map((cert, index) => (
            <Link 
              key={index} 
              href={cert.link} 
              target="_blank"
              className="glass-card p-8 rounded-2xl group hover:border-primary/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <cert.icon className="w-6 h-6 text-primary" />
                </div>
                <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight min-h-[56px] flex items-center">
                {cert.title}
              </h3>
              
              <div className="text-sm font-mono text-slate-400 mb-4 uppercase tracking-wider">
                {cert.issuer}
              </div>
              
              <p className="text-slate-500 text-sm leading-relaxed mt-auto">
                {cert.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


