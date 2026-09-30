import { useEffect, useState } from "react";
import defaultLogo from "../assets/dan-logo.jpg";

export const BRAND = {
  name: "Dan Gold Hands",
  nameUpper: "DAN GOLD HANDS",
  hebrew: "דן ידי זהב",
  tagline: "לייבים | פתיחות | מכירות",
  drawPrefix: "DGH",
};

export const DEFAULT_LOGO: string = defaultLogo;

const KEY = "dgh.logo.v1";
const listeners = new Set<(src: string) => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let current: string = read() ?? DEFAULT_LOGO;

export function getLogo(): string {
  return current;
}

export function hasCustomLogo(): boolean {
  return current !== DEFAULT_LOGO;
}

function emit() {
  listeners.forEach((l) => l(current));
}

export function resetLogo() {
  current = DEFAULT_LOGO;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

/** Downscale an uploaded image to a 512px square data-URL and persist it. */
export function setLogoFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const S = 512;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        // centre-crop to a square so round logos stay round
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
        const isPng = file.type === "image/png" || file.type === "image/webp";
        const url = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.92);
        current = url;
        try {
          localStorage.setItem(KEY, url);
        } catch {
          /* storage full — still use it for this session */
        }
        emit();
        resolve();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function useLogo(): string {
  const [src, setSrc] = useState(current);
  useEffect(() => {
    const l = (s: string) => setSrc(s);
    listeners.add(l);
    setSrc(current);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return src;
}
