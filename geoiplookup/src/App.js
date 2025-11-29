import { useState } from "react";

const API_KEY = process.env.REACT_APP_WHOISKEY;

export default function IpLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  //Validate PUBLIC IPs only (Regex)
  const isValidPublicIP = (value) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1?\d?\d)\.(25[0-5]|2[0-4]\d|1?\d?\d)\.(25[0-5]|2[0-4]\d|1?\d?\d)\.(25[0-5]|2[0-4]\d|1?\d?\d)$/;

    if (!ipv4Regex.test(value)) return false; // not a valid IPv4 format

    const [a, b] = value.split(".").map(Number);

    // Private IP ranges
    if (a === 10) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;

    // Loopback
    if (a === 127) return false;

    // Link-local
    if (a === 169 && b === 254) return false;

    return true;
  };

  const lookup = async () => {
    setError("");
    setData(null);

    if (!API_KEY) {
      setError("Missing REACT_APP_WHOISKEY env variable.");
      return;
    }

    if (!isValidPublicIP(ip)) {
      setError("Please enter a valid PUBLIC IPv4 address.");
      return;
    }

    const REQUEST_URL = `https://ipwhois.app/json/${ip}?apiKey=${API_KEY}`;

    try {
      const res = await fetch(REQUEST_URL);
      const json = await res.json();

      if (json.success === false) {
        setError(json.message || "Lookup failed.");
        return;
      }

      setData(json);
    } catch (e) {
      setError("Request failed.");
    }
  };

  return (
    <div>
      <h2>IP Lookup</h2>

        <input
          type="text"
          placeholder="Enter public IP address"
          value={ip}
          onChange={(e) => {
            // Allow ONLY digits and dots while typing
            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
            setIp(cleaned);
          }}
          style={{ width: "200px", marginRight: "10px" }}
        />

      <button onClick={lookup}>Lookup</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <p>IP: {data.ip}</p>
          <p>Country: {data.country}</p>
          <p>Region: {data.region}</p>
          <p>City: {data.city}</p>
        </div>
      )}
    </div>
  );
}
