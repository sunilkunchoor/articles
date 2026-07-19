"use client";

import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function Experience() {
  const experiences = [
    {
      company: "TATA CONSULTANCY SERVICES",
      location: "London, UK",
      period: "Sep 2022 – Present",
      role: "Senior MLOps Engineer",
      description: "Delivering enterprise ML infrastructure for Marks & Spencer (top UK retailer).",
      achievements: [
        "Architected an automated deployment validation system that replaced manual multi-team sign-off with policy-based checks, cutting deployment lead time 83% (from 2 hours to 20 minutes).",
        "Managed an end-to-end ML platform on Azure, using Databricks for scalable model training and Azure Kubernetes Service for high-availability inference serving.",
        "Consolidated fragmented, duplicate feature tables into a centralized feature store, eliminating data silos and speeding up the feature engineering lifecycle by 40%.",
        "Enforced compliance and governance standards, including GDPR adherence, across the data science lifecycle for sensitive retail data.",
        "Designed operational dashboards to monitor model drift and system health, giving real-time visibility to both business and operations stakeholders.",
        "Built custom plugins for Apache Airflow and Databricks Operators to extend pipeline orchestration capability.",
        "Maintained a shared feature-engineering repository and coordinated requirements across multiple enterprise data science teams."
      ],
      tools: ["Databricks", "Airflow", "MLflow", "Azure", "Dynatrace"]
    },
    {
      company: "DAVE.AI",
      location: "Bangalore, India",
      period: "Aug 2021 – Aug 2022",
      role: "Data Scientist",
      description: "Focused on Edge AI optimization and cost-effective infrastructure.",
      achievements: [
        "Partnered with Intel to optimize Automatic Speech Recognition (ASR) and NLP models using the OpenVINO framework, deploying them on edge devices for Quick Service Restaurant (QSR) applications.",
        "Re-architected inference infrastructure for QSR clients using optimized inference engines, cutting per-store infrastructure cost by 40%.",
        "Built ASR models achieving a Word Error Rate of 0.1–0.2 across Banking, Retail, Food Chain, and Automotive domains.",
        "Worked as an end-to-end ML engineer on a food-chain domain project spanning image, speech, and text analysis.",
        "Built a benchmarking framework to evaluate hardware requirements for in-house AI components.",
        "Partnered with Nvidia on a proof-of-concept using Jetson devices for the QSR system."
      ],
      tools: ["Python", "TensorFlow", "NLTK", "OpenCV", "OpenVINO", "AWS", "GCP"]
    },
    {
      company: "ANSRSOURCE",
      location: "Bangalore, India",
      period: "Apr 2016 – Aug 2021",
      role: "Business Analyst",
      description: "Led product strategy, operations analytics, and QA automation.",
      achievements: [
        "Built and led a team of 70 from the ground up, generating $1.5M in Annual Recurring Revenue.",
        "Developed an in-house QA automation tool that cut manual data-categorization effort by 60% and raised data accuracy to 99.5%.",
        "Used predictive models to shape strategies addressing growth and operations issues.",
        "Defined and tracked KPIs for existing and new functions/projects across the company.",
        "Partnered with 20+ data analysts on data quality, integrity, and new approaches to presenting existing data.",
        "Acted as liaison across operations, technology, vendors, and clients, managing BAU support alongside project work.",
        "Collaborated with stakeholders to refine product requirements, functional specs, and product direction."
      ],
      tools: ["Pandas", "JIRA", "Tableau", "Excel VBA", "Power BI", "IBM Watson Studio", "MySQL", "Scikit-Learn"]
    },
    {
      company: "ANSRSOURCE",
      location: "Bangalore, India",
      period: "June 2014 – Apr 2016",
      role: "Content Programmer",
      description: "Foundation in software engineering and web platforms.",
      achievements: [
        "Developed interactive e-learning platforms for publishers and universities using Python, Django, and Flask."
      ],
      tools: ["Python", "Django", "Flask", "MySQL", "JavaScript", "MongoDB", "React"]
    }
  ];

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional <span className="text-primary">Experience</span></h2>
          <p className="text-slate-400">A decade of engineering excellence across the UK and India.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {experiences.map((exp, index) => (
            <div key={index} className="relative pl-8 md:pl-0">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
              
              <div className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 rounded-full bg-primary border-4 border-slate-950 md:-translate-x-1/2 z-10 shadow-[0_0_10px_rgba(125,249,255,0.5)]" />
                
                <div className="w-full md:w-1/2">
                  <div className={`glass-card p-8 rounded-2xl border-white/5 hover:border-primary/30 transition-all duration-500 group ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`flex items-center gap-2 mb-2 text-primary font-mono text-sm ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{exp.role}</h3>
                    <div className={`flex items-center gap-2 text-slate-300 font-semibold mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <Briefcase className="w-4 h-4" />
                      {exp.company}
                      <span className="text-slate-500">•</span>
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </div>
                    <p className="text-slate-400 mb-6 italic">{exp.description}</p>
                    
                    <ul className={`space-y-3 ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className={`flex items-start gap-3 text-slate-400 text-sm leading-relaxed ${index % 2 === 0 ? 'md:flex-row-reverse md:text-right' : 'text-left'}`}>
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>

                    {exp.tools && (
                      <div className={`flex flex-wrap gap-2 mt-6 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                        {exp.tools.map((t) => (
                          <span key={t} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
