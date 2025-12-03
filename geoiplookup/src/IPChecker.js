import { useState } from "react";
import { runIpLookup } from "./utils/runIpLookup";
import { isValidPublicIP } from "./utils/isValidPublicIP";

const API_KEY = process.env.REACT_APP_WHOISKEY;

export default function IpLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

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

    try {
      const json = await runIpLookup(ip, API_KEY);

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
