"use client";

export default function TechStack() {
  const skills = [
    "Azure", "AWS", "Kubernetes", "Docker", "Terraform",
    "Databricks", "MLflow", "Azure ML", "Apache Spark", "Apache Airflow",
    "LangChain", "LangGraph", "CrewAI", "OpenAI", "OpenVINO", "ONNX", "Hugging Face",
    "Dynatrace", "Grafana", "Prometheus", "Snyk",
    "GitHub Actions", "Azure DevOps", "Jenkins",
    "Python", "Rust", "Bash"
  ];

  return (
    <section className="py-20 border-y border-white/5 bg-slate-950/50 overflow-hidden">
      <div className="flex flex-col items-center mb-10">
        <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest">Mastered Technologies</h3>
      </div>
      
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {[...skills, ...skills].map((skill, i) => (
            <div key={i} className="mx-8 text-3xl md:text-5xl font-bold text-slate-700 hover:text-primary transition-colors cursor-default tracking-tighter">
              {skill}
            </div>
          ))}
        </div>
        
        {/* Gradient Mask */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background"></div>
      </div>
    </section>
  );
}

