"use client";

import { useState, useEffect } from "react";

interface GalleryDict {
  badge_new: string;
  view_all_photos: string;
  gallery_thumb_alt: string;
}

interface PropertyGalleryProps {
  images: string[];
  title: string;
  tag?: string | null;
  highlightTag?: string[] | string | null;
  galleryDict: GalleryDict;
}

export default function PropertyGallery({ images, title, tag, highlightTag, galleryDict }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(images?.[0] || "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = images || [];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      if (e.key === "ArrowRight") setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, allImages.length]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
          src={activeImage} 
          onClick={() => openLightbox(allImages.indexOf(activeImage))}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {tag && (
            <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wider shadow-sm">
              {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          )}
          {highlightTag && (Array.isArray(highlightTag) ? highlightTag : [highlightTag]).map((ht, idx) => (
            <span key={idx} className="bg-white/90 backdrop-blur text-nordic-dark text-xs font-medium px-3 py-1.5 rounded-full tracking-wider shadow-sm">
              {ht.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          ))}

        </div>
        {allImages.length > 1 && (
          <button 
            onClick={() => openLightbox(allImages.indexOf(activeImage))}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic-dark px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2"
          >
            <span className="material-icons text-sm">grid_view</span>
            {galleryDict.view_all_photos}
          </button>
        )}
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
              <img 
                alt={galleryDict.gallery_thumb_alt.replace("{title}", title).replace("{index}", String(idx + 1))} 
                className="w-full h-full object-cover" 
                src={img} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col justify-between p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-medium">
              {currentImageIndex + 1} / {allImages.length}
            </span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-icons text-2xl">close</span>
            </button>
          </div>

          {/* Main Image & Nav */}
          <div className="flex-1 flex items-center justify-center relative">
            <button 
              onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
              className="absolute left-0 md:left-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <span className="material-icons text-3xl">chevron_left</span>
            </button>
            
            <img 
              src={allImages[currentImageIndex]} 
              alt={`${title} - ${currentImageIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain"
            />

            <button 
              onClick={() => setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
              className="absolute right-0 md:right-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <span className="material-icons text-3xl">chevron_right</span>
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto justify-center pb-4 hide-scroll">
            {allImages.map((img, idx) => (
              <div 
                key={`lightbox-thumb-${idx}`}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-none w-20 aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-opacity ${currentImageIndex === idx ? 'ring-2 ring-mosque opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

