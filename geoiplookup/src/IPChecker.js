import "./App.css";
import { useState } from "react";
import { runIpLookup } from "./utils/runIpLookup";
import { isValidPublicIP } from "./utils/isValidPublicIP";
import { runWhoapiBlacklist } from "./utils/runWhoapiBlacklist";

const IPWHOIS_KEY = process.env.REACT_APP_WHOISKEY;
const WHOAPI_KEY = process.env.REACT_APP_WHOAPI_KEY;

export default function IpLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);         // ipwhois.app data
  const [blacklist, setBlacklist] = useState(null); // WhoAPI blacklist data
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setError("");
    setData(null);
    setBlacklist(null);
    setLoading(true);

    if (!IPWHOIS_KEY) {
      setLoading(false);
      setError("Missing REACT_APP_WHOISKEY env variable.");
      return;
    }

    if (!WHOAPI_KEY) {
      setLoading(false);
      setError("Missing REACT_APP_WHOAPI_KEY env variable.");
      return;
    }

    if (!isValidPublicIP(ip)) {
      setLoading(false);
      setError("Please enter a valid PUBLIC IPv4 address.");
      return;
    }

    try {
      // 1) IP geo/info lookup (ipwhois.app)
      const json = await runIpLookup(ip, IPWHOIS_KEY);

      if (json.success === false) {
        setLoading(false);
        setError(json.message || "Lookup failed.");
        return;
      }

      setData(json);

      // 2) Blacklist lookup (WhoAPI)
      const blJson = await runWhoapiBlacklist(ip, WHOAPI_KEY);
      setBlacklist(blJson);
    } catch (e) {
      console.error(e);
      setError(e.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <h1>IP Lookup</h1>

        {/* Input row */}
        <div className="input-row">
          <input
            className="ip-input"
            type="text"
            placeholder="Enter public IP address"
            value={ip}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9.]/g, "");
              setIp(cleaned);
            }}
          />

          <button className="ip-button" onClick={lookup} disabled={loading}>
            {loading ? "Checking..." : "Lookup"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {/* Output box */}
        {(data || blacklist) && (
          <div className="output-box">
            {data && (
              <div>
                <h3>IP Info</h3>
                <p><strong>IP:</strong> {data.ip}</p>
                <p><strong>Country:</strong> {data.country}</p>
                <p><strong>Region:</strong> {data.region}</p>
                <p><strong>City:</strong> {data.city}</p>
              </div>
            )}

            {blacklist && (
              <div style={{ marginTop: "20px" }}>
                <h3>Blacklist Status (WhoAPI)</h3>

                <p>
                  Overall:{" "}
                  {blacklist.blacklisted === "1" ? (
                    <span className="pill pill-bad">Blacklisted</span>
                  ) : (
                    <span className="pill pill-ok">Not Blacklisted</span>
                  )}
                </p>

                {Array.isArray(blacklist.blacklists) && (
                  <ul className="blacklist-list">
                    {blacklist.blacklists.map((entry) => {
                      const listed = entry.blacklisted === "1";
                      return (
                        <li key={entry.tracker} className="blacklist-item">
                          <span>{entry.tracker}</span>
                          <span
                            className={`pill ${
                              listed ? "pill-bad" : "pill-ok"
                            }`}
                          >
                            {listed ? "LISTED" : "Not listed"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
