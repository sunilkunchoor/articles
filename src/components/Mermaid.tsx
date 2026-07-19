"use client";

import { useEffect } from 'react';

export default function Mermaid() {
  useEffect(() => {
    const initMermaid = async () => {
      // Dynamically import mermaid on the client side
      const mermaid = (await import('mermaid')).default;
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          background: 'transparent', // Translucent card background inherited from parent container
          mainBkg: 'rgba(30, 41, 59, 0.4)', // Deep slate nodes
          nodeBorder: '#7df9ff', // Cyan neon borders
          nodeTextColor: '#f8fafc',
          lineColor: '#64748b', // Slate arrow connecting lines
          textColor: '#94a3b8', // Descriptive labels
          edgeLabelBackground: '#0f172a', // Clean backdrop contrast for text on lines
          clusterBkg: 'rgba(15, 23, 42, 0.3)', // Subdued inner groups background
          clusterBorder: 'rgba(255, 255, 255, 0.1)',
          primaryColor: '#7df9ff',
          secondaryColor: '#9d00ff',
          tertiaryColor: '#f43f5e',
        }
      });
      
      const elements = document.querySelectorAll('pre code.language-mermaid');
      if (elements.length === 0) return;

      elements.forEach((el, index) => {
        const code = el.textContent;
        if (code) {
          const container = document.createElement('div');
          container.className = 'mermaid mermaid-container flex justify-center';
          container.id = `mermaid-${index}`;
          container.textContent = code.trim();
          
          const pre = el.parentElement;
          if (pre && pre.tagName === 'PRE') {
            pre.parentNode?.replaceChild(container, pre);
          }
        }
      });
      
      // Run mermaid rendering manually on the new elements
      await mermaid.run();
    };

    initMermaid().catch((err) => console.error("Mermaid initialization failed:", err));
  }, []);

  return null;
}
