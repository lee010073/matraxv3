const URL_RE = /https?:\/\/[^\s)]+/gi;

export function parseSeedUrls(input: string): string[] {
  const fromLines = input
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const found = new Set<string>();
  for (const part of fromLines) {
    try {
      const withProto = /^https?:\/\//i.test(part) ? part : `https://${part}`;
      const url = new URL(withProto);
      if (url.hostname.includes(".")) {
        found.add(url.toString());
      }
    } catch {
      const matches = part.match(URL_RE) ?? [];
      for (const match of matches) {
        try {
          found.add(new URL(match).toString());
        } catch {
          /* skip */
        }
      }
    }
  }
  return [...found].slice(0, 3);
}

export function hostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export type SourceKind =
  | "openrice"
  | "timeout"
  | "michelin"
  | "instagram"
  | "maps"
  | "generic";

export function classifySource(url: string): SourceKind {
  const value = url.toLowerCase();
  if (value.includes("openrice")) return "openrice";
  if (value.includes("timeout")) return "timeout";
  if (value.includes("michelin")) return "michelin";
  if (value.includes("instagram") || value.includes("instagr.am")) {
    return "instagram";
  }
  if (
    value.includes("google.com/maps") ||
    value.includes("maps.google") ||
    value.includes("goo.gl/maps") ||
    value.includes("maps.app.goo.gl")
  ) {
    return "maps";
  }
  return "generic";
}

export function sourceDisplayName(kind: SourceKind, url: string): string {
  switch (kind) {
    case "openrice":
      return "OpenRice";
    case "timeout":
      return "Time Out Hong Kong";
    case "michelin":
      return "Michelin Guide HK";
    case "instagram":
      return "Instagram";
    case "maps":
      return "Google Maps";
    default:
      return hostnameLabel(url);
  }
}
