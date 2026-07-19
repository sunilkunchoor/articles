"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Background() {
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'mlops-bg');

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
      {/* Base Static Background Image */}
      {fallbackImage && (
        <div className="absolute inset-0 opacity-20">
          <Image
            src={fallbackImage.imageUrl}
            alt="Background"
            fill
            className="object-cover grayscale"
            priority
            data-ai-hint={fallbackImage.imageHint}
          />
        </div>
      )}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
    </div>
  );
}
