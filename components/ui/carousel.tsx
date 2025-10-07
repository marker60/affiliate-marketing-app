// components/ui/carousel.tsx
"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselProps = React.PropsWithChildren<{
  className?: string;
  options?: EmblaOptionsType;
}>;

export function Carousel({ className, options, children }: CarouselProps) {
  const [viewportRef, embla]: [React.RefObject<HTMLDivElement>, EmblaCarouselType | undefined] =
    useEmblaCarousel(options);

  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex">{children}</div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded border bg-background/80 backdrop-blur hover:bg-background"
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded border bg-background/80 backdrop-blur hover:bg-background"
        aria-label="Next slide"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

type CarouselItemProps = React.PropsWithChildren<{ className?: string }>;

export function CarouselItem({ className, children }: CarouselItemProps) {
  // Each slide should be a fixed-basis item so Embla can snap correctly
  return <div className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}>{children}</div>;
}
