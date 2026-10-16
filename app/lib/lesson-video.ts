const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYoutubeEmbedUrl(videoUrl: string | null, startSeconds: number): string | null {
  if (!videoUrl) return null;

  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (/^\/(embed|shorts)\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) id = url.pathname.split("/")[2];
  } else if (host === "youtu.be" || host === "www.youtu.be") {
    id = url.pathname.slice(1);
  }
  if (!id || !YOUTUBE_ID.test(id)) return null;

  const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  embed.searchParams.set("rel", "0");
  if (startSeconds > 0) embed.searchParams.set("start", String(startSeconds));
  return embed.toString();
}

export function parseStartSeconds(value: string | string[] | undefined, duration: number | null): number {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,7})$/.test(value)) return 0;
  const seconds = Number(value);
  if (!Number.isSafeInteger(seconds)) return 0;
  return Math.min(seconds, Math.max(0, Math.floor(duration ?? seconds)));
}

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
