import { useEffect, useRef } from "react";

interface ConnectionPoint {
    nx: number;
    ny: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export function HeroConnectionsCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const points: ConnectionPoint[] = [];
        const mouse = { x: -9999, y: -9999 };
        const anchors: { x: number; y: number }[] = [];

        const createPoints = (width: number, height: number) => {
            points.length = 0;
            const clusters = 4;
            const perCluster = 16;

            for (let c = 0; c < clusters; c += 1) {
                const centerX = Math.random() * 0.8 + 0.1;
                const centerY = Math.random() * 0.6 + 0.2;

                for (let i = 0; i < perCluster; i += 1) {
                    const spread = 0.08 + Math.random() * 0.07;
                    const nx = Math.min(
                        0.98,
                        Math.max(0.02, centerX + (Math.random() - 0.5) * spread),
                    );
                    const ny = Math.min(
                        0.98,
                        Math.max(0.02, centerY + (Math.random() - 0.5) * spread),
                    );
                    points.push({
                        nx,
                        ny,
                        x: nx * width,
                        y: ny * height,
                        vx: (Math.random() - 0.5) * 0.2,
                        vy: (Math.random() - 0.5) * 0.2,
                    });
                }
            }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createPoints(canvas.width, canvas.height);
            // Recompute anchor positions from DOM elements with class `floating-service-icon`
            anchors.length = 0;
            try {
                const elems = document.querySelectorAll('.floating-service-icon');
                elems.forEach((el) => {
                    const rect = (el as HTMLElement).getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2 + window.scrollY;
                    anchors.push({ x, y });
                });
            } catch (err) {
                // ignore if DOM not ready
            }
        };

        const handleMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        const handleLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        let frameCounter = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const point of points) {
                const targetX = point.nx * canvas.width;
                const targetY = point.ny * canvas.height;

                point.vx += (targetX - point.x) * 0.0008;
                point.vy += (targetY - point.y) * 0.0008;

                const dx = point.x - mouse.x;
                const dy = point.y - mouse.y;
                const distance = Math.hypot(dx, dy);
                if (distance < 140) {
                    const force = (140 - distance) / 140;
                    point.vx += (dx / distance) * force * 0.35;
                    point.vy += (dy / distance) * force * 0.35;
                }

                point.vx *= 0.92;
                point.vy *= 0.92;
                point.x += point.vx;
                point.y += point.vy;
            }

            for (let i = 0; i < points.length; i += 1) {
                for (let j = i + 1; j < points.length; j += 1) {
                    const a = points[i];
                    const b = points[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.35;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            for (const point of points) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // For each anchored icon, draw a connector line to nearest node and a subtle pulsing ring at icon position
            const drawPulse = (cx: number, cy: number, radius = 10, t = 0) => {
                const p = (Math.sin(t / 300) + 1) / 2; // 0..1
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - p)})`;
                ctx.lineWidth = 1 + 2 * p;
                ctx.arc(cx, cy, radius + 6 * p, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            };

            // Recompute anchors periodically in case DOM moved (e.g., responsive layout)
            frameCounter += 1;
            if (frameCounter % 12 === 0) {
                anchors.length = 0;
                try {
                    const elems = document.querySelectorAll('.floating-service-icon');
                    const cRect = canvas.getBoundingClientRect();
                    elems.forEach((el) => {
                        const rect = (el as HTMLElement).getBoundingClientRect();
                        const x = rect.left + rect.width / 2 - cRect.left;
                        const y = rect.top + rect.height / 2 - cRect.top;
                        anchors.push({ x, y });
                    });
                } catch (err) {
                    // ignore
                }
            }

            for (const anchor of anchors) {
                // Find nearest network point and draw connector
                let nearest: ConnectionPoint | null = null;
                let minDist = Infinity;
                for (const p of points) {
                    const dx = p.x - anchor.x;
                    const dy = p.y - anchor.y;
                    const d = Math.hypot(dx, dy);
                    if (d < minDist) {
                        minDist = d;
                        nearest = p;
                    }
                }
                if (nearest) {
                    const alpha = Math.max(0, Math.min(0.6, 0.6 - (minDist / 800)));
                    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(anchor.x, anchor.y);
                    ctx.lineTo(nearest.x, nearest.y);
                    ctx.stroke();
                }

                // Draw a pulsing ring + inner dot to indicate connection target (icons are rendered by DOM)
                drawPulse(anchor.x, anchor.y, 8, Date.now());
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.arc(anchor.x, anchor.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = window.requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseleave", handleLeave);
        animationRef.current = window.requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseleave", handleLeave);
            if (animationRef.current)
                window.cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className="particles-canvas" />;
}
