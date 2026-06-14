import { useEffect, useState } from "react";
import { Download, ExternalLink, Share, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton({ className }: { className?: string }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const previouslyInstalled = window.localStorage.getItem("coachface-installed") === "true";
    setInstalled(standalone || previouslyInstalled);
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      window.localStorage.setItem("coachface-installed", "true");
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (installed) {
      window.location.assign("/");
      return;
    }
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        window.localStorage.setItem("coachface-installed", "true");
        setInstalled(true);
        setInstallPrompt(null);
      }
      return;
    }
    setInstructionsOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("shrink-0 px-2 sm:px-3", className)}
        onClick={handleClick}
        aria-label={installed ? "Open CoachFace app" : "Install CoachFace app"}
      >
        {installed ? <ExternalLink /> : <Smartphone />}
        <span className="hidden lg:inline">{installed ? "Open app" : "Mobile app"}</span>
      </Button>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent
          data-overlay-allowed="true"
          className="w-[calc(100%-2rem)] max-w-md rounded-lg"
        >
          <DialogHeader>
            <div className="mb-3 flex items-center gap-3 text-left">
              <img
                src="/coachface-icon-192.png"
                alt="CoachFace app icon"
                width={56}
                height={56}
                className="size-14 rounded-xl"
              />
              <DialogTitle className="font-display text-2xl font-black uppercase">
                Add CoachFace
              </DialogTitle>
            </div>
            <DialogDescription className="text-left leading-relaxed">
              {isIos
                ? "In Safari, tap Share, then choose Add to Home Screen and tap Add."
                : "Open your browser menu, choose Install app or Add to Home screen, then confirm."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 border border-border bg-secondary/50 p-4 text-sm font-semibold">
            {isIos ? <Share className="shrink-0 text-primary" /> : <Download className="shrink-0 text-primary" />}
            <span>{isIos ? "Share → Add to Home Screen" : "Menu → Install app"}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}