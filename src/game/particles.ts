interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: "confetti" | "spark" | "ring" | "star" | "ball";
  rot: number;
  vrot: number;
  grav: number;
  drag: number;
}

const MAX = 900;

export class Particles {
  private ps: P[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpr = 1;
  w = 0;
  h = 0;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";
    if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private push(p: P) {
    if (this.ps.length >= MAX) this.ps.shift();
    this.ps.push(p);
  }

  burst(x: number, y: number, colors: string[], count = 40, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (1.6 + Math.random() * 6.5) * power;
      this.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1.6,
        life: 1,
        maxLife: 0.75 + Math.random() * 0.75,
        size: 3 + Math.random() * 6,
        color: colors[(Math.random() * colors.length) | 0],
        kind: Math.random() < 0.35 ? "spark" : "confetti",
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.4,
        grav: 0.19,
        drag: 0.985,
      });
    }
  }

  fountain(x: number, y: number, colors: string[], count = 60) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.25;
      const s = 6 + Math.random() * 11;
      this.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        maxLife: 1.3 + Math.random() * 0.9,
        size: 3 + Math.random() * 7,
        color: colors[(Math.random() * colors.length) | 0],
        kind: Math.random() < 0.25 ? "star" : "confetti",
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.5,
        grav: 0.24,
        drag: 0.99,
      });
    }
  }

  ring(x: number, y: number, color: string, size = 14) {
    this.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 0.55,
      size,
      color,
      kind: "ring",
      rot: 0,
      vrot: 0,
      grav: 0,
      drag: 1,
    });
  }

  balls(x: number, y: number, colors: string[], count = 10) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const s = 5 + Math.random() * 8;
      this.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        maxLife: 1.1 + Math.random() * 0.6,
        size: 7 + Math.random() * 6,
        color: colors[(Math.random() * colors.length) | 0],
        kind: "ball",
        rot: 0,
        vrot: 0,
        grav: 0.3,
        drag: 0.995,
      });
    }
  }

  trail(x: number, y: number, color: string) {
    this.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      life: 1,
      maxLife: 0.4,
      size: 2 + Math.random() * 3,
      color,
      kind: "spark",
      rot: 0,
      vrot: 0,
      grav: 0,
      drag: 0.94,
    });
  }

  clear() {
    this.ps.length = 0;
  }

  update(dt: number) {
    const ps = this.ps;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt / p.maxLife;
      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      p.vy += p.grav * dt * 60;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.rot += p.vrot * dt * 60;
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.w, this.h);
    const ps = this.ps;
    ctx.save();
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const a = Math.max(0, Math.min(1, p.life));
      ctx.globalAlpha = a;
      if (p.kind === "ring") {
        const t = 1 - a;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, 7 * a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + t * 130, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      if (p.kind === "spark" || p.kind === "star") {
        ctx.fillStyle = p.color;
        if (p.kind === "star") {
          drawStar(ctx, p.x, p.y, p.size * (0.6 + a * 0.7), p.rot);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
          ctx.fill();
        }
        continue;
      }
      if (p.kind === "ball") {
        drawPokeball(ctx, p.x, p.y, p.size * (0.5 + a * 0.5));
        continue;
      }
      // confetti
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size * 0.5, -p.size * 0.35, p.size, p.size * 0.7);
      ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rot: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPokeball(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.fillStyle = "#ee1c25";
  ctx.fill();
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = Math.max(1, r * 0.18);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
