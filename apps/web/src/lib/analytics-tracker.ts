import { Env } from "@/lib/env";

interface TrackPageViewInput {
  pageId: string;
  slug: string;
}

export const trackPageView = ({ pageId, slug }: TrackPageViewInput): void => {
  if (typeof window === "undefined" || !slug || !pageId) {
    return;
  }

  // const storageKey = `nastro:track:${slug}:${pageId}:${window.location.pathname}`;
  // if (sessionStorage.getItem(storageKey)) {
  //   return;
  // }

  const url = new URL("/api/analytics/track", Env.apiUrl);
  const body = JSON.stringify({
    pageId,
    slug,
    path: window.location.pathname,
    referrer: document.referrer,
  });

  // const blob = new Blob([body], { type: "application/json" });
  // const sent = navigator.sendBeacon(url, blob);

  // console.log("send tracking using sendBeacon");

  // if (!sent) {

  fetch(url, {
    method: "POST",
    body,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  })
    .then(() => console.log("sent tracking using fetch", url))
    .catch(console.error);
  // }

  // sessionStorage.setItem(storageKey, "1");
};
