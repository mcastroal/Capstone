"use client";

import { useState } from "react";

/**
 * Shows a dashboard screenshot from /public/home/… or a placeholder if the file is missing.
 * Add: public/home/fighter-dashboard.png and public/home/coach-dashboard.png
 */
export default function HomeScreenshot({ src, alt, placeholderText }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[var(--storm-blue)]/15">
        {failed ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 bg-[var(--rain)]/35 px-6 py-14 text-center sm:min-h-[280px]">
            <p className="max-w-md text-sm font-medium text-[var(--storm-blue)]">Screenshot placeholder</p>
            <p className="max-w-md text-sm text-[var(--slate)]">{placeholderText}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- public asset + onError fallback for missing file
          <img
            src={src}
            alt={alt}
            className="w-full object-cover object-top"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </figure>
  );
}
