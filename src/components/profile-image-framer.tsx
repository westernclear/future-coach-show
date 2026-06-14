import { useEffect, useRef, useState } from "react";
import { Crop, Loader2, Move, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Framing = { zoom: number; x: number; y: number };

export function ProfileImageFramer({
  file,
  onCancel,
  onApply,
}: {
  file: File | null;
  onCancel: () => void;
  onApply: (blob: Blob) => Promise<void>;
}) {
  const avatarCanvas = useRef<HTMLCanvasElement>(null);
  const bannerCanvas = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [framing, setFraming] = useState<Framing>({ zoom: 1, x: 0, y: 0 });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!file) {
      setSource(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => setSource(image);
    image.src = url;
    setFraming({ zoom: 1, x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!source) return;
    drawSquareCrop(avatarCanvas.current, source, framing);
    drawBannerPreview(bannerCanvas.current, source, framing);
  }, [source, framing]);

  const applyCrop = async () => {
    if (!source) return;
    setApplying(true);
    try {
      const output = document.createElement("canvas");
      output.width = 1200;
      output.height = 1200;
      drawSquareCrop(output, source, framing);
      const blob = await new Promise<Blob | null>((resolve) =>
        output.toBlob(resolve, "image/webp", 0.9),
      );
      if (!blob) throw new Error("The framed image could not be created.");
      await onApply(blob);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && !applying && onCancel()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-none p-0">
        <DialogHeader className="border-b border-border p-6 pr-12">
          <DialogTitle className="font-display text-3xl font-black uppercase">Frame your identity</DialogTitle>
          <DialogDescription>
            Position the image once, then review how it appears as a profile avatar and wide banner.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-7 p-6 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Avatar crop</p>
            <div className="mx-auto aspect-square max-w-md overflow-hidden rounded-full border-4 border-primary bg-secondary">
              <canvas ref={avatarCanvas} width={520} height={520} className="size-full" aria-label="Avatar crop preview" />
            </div>
            <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Banner preview</p>
            <div className="aspect-[3/1] overflow-hidden border border-border bg-secondary">
              <canvas ref={bannerCanvas} width={720} height={240} className="size-full" aria-label="Banner crop preview" />
            </div>
          </div>
          <div className="space-y-7 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <FrameControl icon={<ZoomIn />} label="Zoom" value={framing.zoom} min={1} max={2.5} step={0.01} onChange={(zoom) => setFraming((current) => ({ ...current, zoom }))} />
            <FrameControl icon={<Move />} label="Horizontal" value={framing.x} min={-1} max={1} step={0.01} onChange={(x) => setFraming((current) => ({ ...current, x }))} />
            <FrameControl icon={<Move className="rotate-90" />} label="Vertical" value={framing.y} min={-1} max={1} step={0.01} onChange={(y) => setFraming((current) => ({ ...current, y }))} />
            <Button type="button" variant="outline" className="w-full" onClick={() => setFraming({ zoom: 1, x: 0, y: 0 })}>Reset framing</Button>
            <div className="border-l-2 border-primary pl-4 text-xs leading-relaxed text-muted-foreground">
              <Crop className="mb-2 size-4 text-primary" />
              The saved image is optimized to a consistent square. Banner surfaces use the same centered framing.
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border p-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={applying}>Choose another</Button>
          <Button type="button" onClick={() => void applyCrop()} disabled={!source || applying}>
            {applying ? <Loader2 className="animate-spin" /> : <Crop />} Apply framing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FrameControl({ icon, label, value, min, max, step, onChange }: { icon: React.ReactNode; label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(next) => onChange(next[0] ?? value)} />
    </div>
  );
}

function getCrop(source: HTMLImageElement, framing: Framing, width: number, height: number) {
  const baseScale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
  const scale = baseScale * framing.zoom;
  const scaledWidth = source.naturalWidth * scale;
  const scaledHeight = source.naturalHeight * scale;
  return {
    scale,
    left: (width - scaledWidth) / 2 + framing.x * Math.max(0, scaledWidth - width) / 2,
    top: (height - scaledHeight) / 2 + framing.y * Math.max(0, scaledHeight - height) / 2,
  };
}

function drawSquareCrop(canvas: HTMLCanvasElement | null, source: HTMLImageElement, framing: Framing) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const crop = getCrop(source, framing, canvas.width, canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, crop.left, crop.top, source.naturalWidth * crop.scale, source.naturalHeight * crop.scale);
}

function drawBannerPreview(canvas: HTMLCanvasElement | null, source: HTMLImageElement, framing: Framing) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const square = document.createElement("canvas");
  square.width = 720;
  square.height = 720;
  drawSquareCrop(square, source, framing);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(square, 0, (square.height - canvas.height) / 2, square.width, canvas.height, 0, 0, canvas.width, canvas.height);
}