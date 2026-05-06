"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-nordic-dark/60 font-medium">Loading interactive map...</div>
});

export default function MapWrapper({ location }: { location: string }) {
  return <PropertyMap location={location} />;
}
