// src/utils/runWhoapiBlacklist.js

export async function runWhoapiBlacklist(ip, apiKey) {
  // Use the "ip" param exactly like in the docs
  const url = `https://api.whoapi.com/?apikey=${encodeURIComponent(
    apiKey
  )}&r=blacklist&ip=${encodeURIComponent(ip)}`;

  const res = await fetch(url);

  // If HTTP status is not 200, try to read the body and surface it
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    // This will make it easier to debug in your UI
    throw new Error(
      `WhoAPI HTTP error ${res.status} ${res.statusText}${
        raw ? ` – ${raw.slice(0, 200)}` : ""
      }`
    );
  }

  const json = await res.json();

  // WhoAPI uses "status" field in the JSON for success
  // 0 = OK, anything else = error (with status_desc)
  if (String(json.status) !== "0") {
    const msg = json.status_desc || "WhoAPI reported an error";
    throw new Error(`WhoAPI API error: ${msg} (status ${json.status})`);
  }

  return json; // contains blacklisted, blacklists[], etc.
}
