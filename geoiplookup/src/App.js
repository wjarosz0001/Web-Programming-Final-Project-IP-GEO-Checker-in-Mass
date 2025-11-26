// IpLookup.jsx
import { useState } from "react";

const API_KEY = process.env.REACT_APP_WHOISKEY;
const IPADDRESS = "99.99.99.99";
const REQUEST_URL = `https://ipwhois.app/json/${IPADDRESS}?apiKey=${API_KEY}`;

export default function IpLookup() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    setError("");
    setData(null);

    if (!API_KEY) {
      setError("Missing REACT_APP_WHOISKEY env variable.");
      return;
    }

    try {
      const res = await fetch(
        REQUEST_URL
      );
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
      <button onClick={lookup}>IP Lookup</button>

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
