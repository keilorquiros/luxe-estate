"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

type MapWrapperProps = { location: string; loadingLabel: string };

export default function MapWrapper({ location, loadingLabel }: MapWrapperProps) {
  const PropertyMap = useMemo(
    () =>
      dynamic(() => import("./PropertyMap"), {
        ssr: false,
        loading: () => (
          <div className="w-full h-[300px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-nordic-dark/60 font-medium">
            {loadingLabel}
          </div>
        ),
      }),
    [loadingLabel]
  );

  return <PropertyMap location={location} />;
}
