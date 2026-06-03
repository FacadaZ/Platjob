import { useEffect, useRef } from "react";

interface HeroSequenceCanvasProps {
  frameCount: number;
}

export function HeroSequenceCanvas({ frameCount }: HeroSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let currentFrameIndex = 1;
    let loopId: number | undefined;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(airpods.frame);
    };

    const airpods = {
      frame: 1,
    };

    const images: HTMLImageElement[] = [];

    const currentFrame = (index: number) =>
      `/assets/hero-sequence/${index.toString().padStart(4, "0")}.webp`;

    // Preload images
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    const renderFrame = (index: number) => {
      const img = images[index - 1];
      if (!img || !img.complete) return;
      currentFrameIndex = index;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Object-fit: cover logic
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const x = (canvasWidth / 2) - (imgWidth / 2) * scale;
      const y = (canvasHeight / 2) - (imgHeight / 2) * scale;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
    };

    const startFrameLoop = () => {
      if (frameCount < 2) return;
      loopId = window.setInterval(() => {
        const nextFrame = currentFrameIndex >= frameCount ? 1 : currentFrameIndex + 1;
        renderFrame(nextFrame);
      }, 1400);
    };

    // Ensure the first frame is rendered
    images[0].onload = () => {
      renderFrame(1);
      startFrameLoop();
    };

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (loopId) window.clearInterval(loopId);
    };
  }, [frameCount]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
