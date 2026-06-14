import { registerSW } from "virtual:pwa-register";

const PREVIEW_HOSTS = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    PREVIEW_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  );
}

async function unregisterCoachFaceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const scriptUrl = registration.active?.scriptURL ?? registration.installing?.scriptURL;
        return scriptUrl ? new URL(scriptUrl).pathname === "/sw.js" : false;
      })
      .map((registration) => registration.unregister()),
  );
}

export async function registerCoachFaceServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const isTopLevel = window.self === window.top;
  const disabled = new URLSearchParams(window.location.search).get("sw") === "off";
  const mayRegister =
    import.meta.env.PROD && isTopLevel && !isPreviewHost(location.hostname) && !disabled;

  if (!mayRegister) {
    await unregisterCoachFaceWorkers();
    return;
  }

  registerSW({ immediate: true });
}
