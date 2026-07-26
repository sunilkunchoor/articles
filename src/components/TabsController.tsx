'use client';

import { useEffect } from 'react';

export default function TabsController() {
  useEffect(() => {
    window.switchTab = function(btn: HTMLElement) {
      const group = btn.getAttribute('data-group');
      const val = btn.getAttribute('data-value');
      
      const container = document.querySelector(`.tabs-container[data-group="${group}"]`);
      if (!container) return;
      
      const buttons = container.querySelectorAll('.tab-btn');
      buttons.forEach(b => {
        if (b.getAttribute('data-value') === val) {
          b.classList.add('border-primary', 'text-primary');
          b.classList.remove('border-transparent', 'text-slate-400');
        } else {
          b.classList.remove('border-primary', 'text-primary');
          b.classList.add('border-transparent', 'text-slate-400');
        }
      });
      
      const panes = container.querySelectorAll('.tab-pane') as NodeListOf<HTMLElement>;
      panes.forEach(p => {
        if (p.getAttribute('data-value') === val) {
          p.style.display = 'block';
        } else {
          p.style.display = 'none';
        }
      });
    };

    // Initialize display state
    document.querySelectorAll('.tabs-container').forEach(container => {
      const panes = container.querySelectorAll('.tab-pane') as NodeListOf<HTMLElement>;
      panes.forEach((p, i) => {
        if (i !== 0) p.style.display = 'none';
        else p.style.display = 'block';
      });
    });
  }, []);

  return null;
}

declare global {
  interface Window {
    switchTab: (btn: HTMLElement) => void;
  }
}
