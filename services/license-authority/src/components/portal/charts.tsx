"use client";

/**
 * RAVENHUB — CANVAS-BASED MONOSPACE ANALYTICS
 * ------------------------------------------------------------------
 * Hand-rolled, dependency-free canvas charts with devicePixelRatio
 * scaling and hardware-accelerated rendering:
 *
 *  · HandshakeLine : 24h verification volume (ok vs fail) with hover.
 *  · OsDonut       : active platform distribution ring.
 *  · StatusBars    : license state distribution bars.
 */
import { useEffect, useRef } from "react";

interface SeriesPoint {
  label: string;
  ok: number;
  fail: number;
}

function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const cssW = parent.clientWidth;
    const cssH = canvas.clientHeight || 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, cssW, cssH);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const palette = {
  ok: "#10b981",
  fail: "#ef4444",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  grid: "rgba(139,92,246,0.10)",
  dim: "rgba(156,143,192,0.55)",
};

export function HandshakeLine({ series }: { series: SeriesPoint[] }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const padL = 34;
      const padR = 10;
      const padT = 14;
      const padB = 22;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;

      const max = Math.max(1, ...series.map((s) => s.ok + s.fail));
      const niceMax = Math.ceil(max / 4) * 4;

      ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // Gridlines + Y labels
      for (let i = 0; i <= 4; i += 1) {
        const y = padT + innerH - (innerH / 4) * i;
        ctx.strokeStyle = palette.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.fillStyle = palette.dim;
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round((niceMax / 4) * i)), padL - 6, y);
      }

      const step = innerW / Math.max(1, series.length - 1);
      const pts: Array<{ x: number; y: number; ok: number; fail: number; label: string }> = [];

      series.forEach((s, i) => {
        const x = padL + step * i;
        const yOk = padT + innerH - (s.ok / niceMax) * innerH;
        const yFail = padT + innerH - ((s.ok + s.fail) / niceMax) * innerH;
        pts.push({ x, y: yOk, ok: s.ok, fail: s.fail, label: s.label });

        // X label every 4th bucket
        if (i % 4 === 0) {
          ctx.fillStyle = palette.dim;
          ctx.textAlign = "center";
          ctx.fillText(s.label, x, h - 8);
        }
      });

      // Fail area (bottom layer)
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      pts
        .slice()
        .reverse()
        .forEach((p) => ctx.lineTo(p.x, p.y + (p.fail / niceMax) * innerH));
      ctx.closePath();
      ctx.fillStyle = "rgba(239,68,68,0.16)";
      ctx.fill();

      // Ok gradient area
      const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
      grad.addColorStop(0, "rgba(139,92,246,0.42)");
      grad.addColorStop(1, "rgba(139,92,246,0.03)");
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(pts[pts.length - 1]?.x ?? padL, h - padB);
      ctx.lineTo(pts[0]?.x ?? padL, h - padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Ok stroke
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = palette.violetSoft;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Fail stroke
      ctx.beginPath();
      pts.forEach((p, i) => {
        const y = p.y + (p.fail / niceMax) * innerH;
        if (i === 0) ctx.moveTo(p.x, y);
        else ctx.lineTo(p.x, y);
      });
      ctx.strokeStyle = "rgba(239,68,68,0.75)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [series],
  );
  return (
    <div className="relative w-full">
      <canvas ref={ref} className="w-full block" style={{ height: 220 }} />
    </div>
  );
}

export function OsDonut({ data }: { data: Array<{ os: string; count: number }> }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const total = Math.max(1, data.reduce((s, d) => s + d.count, 0));
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2 - 16;
      const colors = ["#8b5cf6", "#a78bfa", "#6d28d9", "#ec4899", "#10b981", "#f59e0b"];
      let start = -Math.PI / 2;

      data.forEach((d, i) => {
        const angle = (d.count / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + angle);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.stroke();
        start += angle;
      });

      ctx.textAlign = "center";
      ctx.fillStyle = "var(--text)";
      ctx.font = "bold 22px 'JetBrains Mono', ui-monospace, monospace";
      ctx.fillText(String(total), cx, cy - 2);
      ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace";
      ctx.fillStyle = palette.dim;
      ctx.fillText("BOUND DEVICES", cx, cy + 16);
    },
    [data],
  );
  return (
    <div className="relative w-full">
      <canvas ref={ref} className="w-full block mx-auto" style={{ height: 200, maxWidth: 260 }} />
    </div>
  );
}

export function StatusBars({ data }: { data: Array<{ status: string; count: number }> }) {
  const ref = useCanvas(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const total = Math.max(1, data.reduce((s, d) => s + d.count, 0));
      const colors: Record<string, string> = {
        active: "#10b981",
        revoked: "#ef4444",
        expired: "#f59e0b",
      };
      const rowH = 30;
      const maxW = w - 130;
      data.forEach((d, i) => {
        const y = 16 + i * rowH;
        ctx.textAlign = "left";
        ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillStyle = "var(--text-dim)";
        ctx.fillText(d.status.toUpperCase(), 6, y + 8);
        const barW = Math.max(2, (d.count / total) * maxW);
        ctx.fillStyle = "rgba(139,92,246,0.10)";
        ctx.fillRect(90, y, maxW, 14);
        ctx.fillStyle = colors[d.status] ?? "#8b5cf6";
        ctx.fillRect(90, y, barW, 14);
        ctx.textAlign = "left";
        ctx.fillStyle = "var(--text)";
        ctx.fillText(String(d.count), 90 + maxW + 8, y + 10);
      });
    },
    [data],
  );
  return (
    <div className="relative w-full">
      <canvas ref={ref} className="w-full block" style={{ height: 110 }} />
    </div>
  );
}
