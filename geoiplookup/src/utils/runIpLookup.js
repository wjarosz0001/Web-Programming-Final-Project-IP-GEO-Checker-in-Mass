export async function runIpLookup(ip, apiKey) {
  const REQUEST_URL = `https://ipwhois.app/json/${ip}?apiKey=${apiKey}`;

  const res = await fetch(REQUEST_URL);
  const json = await res.json();

  return json;
}
