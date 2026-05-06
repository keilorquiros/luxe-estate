"use client";

import { useState } from "react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  tag?: string;
}

export default function PropertyGallery({ images, title, tag }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(images?.[0] || "");

  const allImages = images || [];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={activeImage} 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {tag && (
            <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {tag}
            </span>
          )}
          <span className="bg-white/90 backdrop-blur text-nordic-dark text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            New
          </span>
        </div>
        <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic-dark px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2">
          <span className="material-icons text-sm">grid_view</span>
          View All Photos
        </button>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {allImages.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveImage(img)}
              className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start transition-opacity ${activeImage === img ? 'ring-2 ring-mosque ring-offset-2 ring-offset-background-light opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`${title} image ${idx + 1}`} className="w-full h-full object-cover" src={img} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
