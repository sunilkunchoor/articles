"use client";

import { useState } from 'react';
import { Github, Bot, Eye, Radio, Activity, Sparkles } from 'lucide-react';

export default function Projects() {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'hackathon' | 'work'>('all');

  const projects = [
    {
      id: 'traffic-light',
      title: '🚦 Traffic Light Governance',
      description: 'Automated Model Governance as Code. A GitHub Actions "Gatekeeper" that enforces a quality gate on every PR — validating code quality, security posture, and model performance regressions before a single line reaches production.',
      tech: ['Python', 'GitHub Actions', 'PyTest', 'Snyk', 'Semgrep'],
      icon: Radio,
      playgroundUrl: 'https://skunchoor.github.io/traffic-light-governance',
      githubUrl: 'https://github.com/skunchoor/traffic-light-governance',
      gradient: 'from-[#7DF9FF]/20 to-transparent',
      category: 'personal'
    },
    {
      id: 'airflow-custom-plugins',
      title: '🛠️ Airflow Custom Plugins',
      description: 'Airflow Custom Plugins for seamless integration with various services. End-to-end LLM pipeline with automated evaluation loops — GPT-4 acts as a judge to score prompt quality, enabling data-driven prompt engineering at scale with full MLflow lineage tracking.',
      tech: ['Airflow', 'Custom Plugins', 'Python', 'Azure'],
      icon: Bot,
      githubUrl: 'https://github.com/sunilkunchoor/airflow-custom-plugins',
      gradient: 'from-[#9D00FF]/20 to-transparent',
      category: 'personal'
    },
    {
      id: 'retail-lens',
      title: '👁️ Retail-Lens',
      description: 'AI-Powered Smart Shelf Vision. Computer vision system that empowers store associates to instantly identify out-of-stock items, misplaced products, and incorrect price tags — reducing shelf compliance issues in real time.',
      tech: ['Google Lens', 'OpenCV', 'Docker', 'Python', 'Edge AI'],
      icon: Eye,
      githubUrl: 'https://github.com/skunchoor/retail-lens',
      playgroundUrl: 'https://skunchoor.github.io/retail-lens',
      gradient: 'from-blue-500/20 to-transparent',
      category: 'hackathon'
    },
    {
      id: 'edge-compliance',
      title: '🧠 AI-Powered QSR — Edge Compliance & Benchmarking',
      description: 'A benchmarking study of small form factor hardware devices that manage AI workloads deployed at the edge.',
      tech: ['Intel OpenVINO', 'OpenCV', 'Python', 'Edge Hardware', 'AWS', 'ASR', 'NLP'],
      icon: Eye,
      githubUrl: 'https://github.com/sunilkunchoor/edge-compliance',
      gradient: 'from-green-500/20 to-transparent',
      category: 'work'
    },
    {
      id: 'skywalker',
      title: '⚡ Skywalker: Automated QA using Classification',
      description: 'A fully automated QA analysis engine using Classification & Clustering',
      tech: ['Scikit-learn', 'Python', 'pandas', 'numpy'],
      icon: Eye,
      githubUrl: 'https://github.com/sunilkunchoor/skywalker',
      gradient: 'from-green-500/20 to-transparent',
      category: 'work'
    },
    {
      id: 'nebuis-serverless-profiler',
      title: '🛠️ Serverless Model Profiler',
      description: 'CloudNative Hackathon submission. Developed a serverless benchmarking suite that automatically spins up isolated model inference tasks in AWS Lambda containers to profile model latency, cold-start, and memory drift.',
      tech: ['AWS Lambda', 'Docker', 'Python', 'MLflow'],
      icon: Activity,
      githubUrl: 'https://github.com/sunilkunchoor',
      gradient: 'from-yellow-500/20 to-transparent',
      category: 'hackathon'
    },
    {
      id: 'adgenie',
      title: '🧞 AdGenie',
      description: 'LLM Lifecycle Management with "Prompts as Code". End-to-end LLM pipeline with automated evaluation loops — GPT-4 acts as a judge to score prompt quality, enabling data-driven prompt engineering at scale with full MLflow lineage tracking.',
      tech: ['LangChain', 'MLflow', 'OpenAI', 'Azure', 'Python'],
      icon: Bot,
      githubUrl: 'https://github.com/skunchoor/ad-genie',
      playgroundUrl: 'https://skunchoor.github.io/ad-genie',
      gradient: 'from-[#9D00FF]/20 to-transparent',
      category: 'hackathon'
    },
  ];

  const filteredProjects = projects.filter(
    (p) => activeTab === 'all' || p.category === activeTab
  );

  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured <span className="text-gradient-blue">Projects</span></h2>
            <p className="text-slate-400 max-w-xl">Deep engineering dive into automated governance, LLMOps, telemetry, and edge intelligence.</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto">
            {(['all', 'personal', 'hackathon', 'work'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                  ? 'bg-primary text-slate-950 shadow-[0_0_10px_rgba(125,249,255,0.5)] font-bold'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab === 'all' ? 'All' : tab === 'personal' ? 'Personal' : tab === 'hackathon' ? 'Hackathons' : 'Work'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card rounded-2xl p-8 flex flex-col relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500 min-h-[380px] animate-in fade-in zoom-in duration-300"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${project.gradient} -z-10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-125`}></div>

              <div className="flex items-start justify-between mb-8">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <project.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="opacity-70 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                  {project.playgroundUrl && (
                    <a
                      href={project.playgroundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:text-primary transition-all inline-block shadow-[0_0_10px_rgba(125,249,255,0.1)]"
                      title="AI Playground"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-primary/20 hover:text-primary transition-all inline-block"
                      title="GitHub Repository"
                    >
                      <Github className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                    {project.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-16 animate-in fade-in duration-700">
          <a
            href="https://github.com/sunilkunchoor"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold hover:text-primary hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          >
            <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>View More Projects on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}

