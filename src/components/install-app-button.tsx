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
                ? "This button can't install the app — only Safari can. Follow the 3 steps below."
                : "This button can't install the app — only your browser can. Follow the steps below."}
            </DialogDescription>
          </DialogHeader>
          {isIos ? (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">1</span>
                <span>Tap the <Share className="inline size-4 text-primary" /> <strong>Share</strong> button at the bottom of Safari (the square with an up arrow).</span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </li>
              <li className="mt-2 rounded-md border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                If you don't see "Add to Home Screen", make sure you're using <strong>Safari</strong> (not Chrome, Gmail, or an in-app browser).
              </li>
            </ol>
          ) : (
            <div className="flex items-center gap-3 border border-border bg-secondary/50 p-4 text-sm font-semibold">
              <Download className="shrink-0 text-primary" />
              <span>Menu → Install app</span>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
