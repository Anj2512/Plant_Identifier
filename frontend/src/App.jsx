import { useState } from "react";

//const API_URL = "http://127.0.0.1:8000";
//const API_URL = "http://192.168.68.127:8000";
const API_URL = "http://localhost:8000";

const c = {
  bg: "#F2EFE7",
  darkGreen: "#2D5016",
  midGreen: "#3A6B35",
  lightGreen: "#EAF3DE",
  accentGreen: "#9DC66B",
  text: "#2C2C2A",
  muted: "#7A7A74",
  border: "#D8D4C8",
  cardBg: "#FFFFFF",
  careBg: "#F7F4EE",
  warningBg: "#FEF3CD",
  warningBorder: "#F0C040",
  warningText: "#7A5010",
};

const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'Segoe UI', Arial, sans-serif",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setResults([]);
    setWarnings([]);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const identifyPlant = async () => {
    if (!file) return;
    setLoading(true);
    setResults([]);
    setWarnings([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/identify`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResults(data.results || []);
      setWarnings(data.warnings || []);
    } catch {
      alert("Could not connect to backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const confColor = (v) => v >= 70 ? c.midGreen : v >= 40 ? "#C4922D" : "#C4622D";
  const confBg = (v) => v >= 70 ? c.lightGreen : v >= 40 ? "#FEF3CD" : "#FAE8E0";
  const confText = (v) => v >= 70 ? c.midGreen : v >= 40 ? "#8A5A10" : "#B04010";

  return (
    <div style={{ width: "100%", padding: "36px 40px 60px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        a:hover { opacity: 0.75; }
      `}</style>

      {/* Header */}
      <div style={{ background: c.darkGreen, padding: "18px 32px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}>
        <span style={{ fontSize: "26px" }}>🌿</span>
        <div>
          <div style={{ color: "#E8F5D0", fontSize: "20px", fontWeight: "700", fontFamily: fonts.serif, letterSpacing: "0.5px", marginRight:
            "220px"
           }}>PlantSense</div>
          <div style={{ color: c.accentGreen, fontSize: "12px", fontStyle: "italic", fontFamily: fonts.serif, marginTop: "1px" }}>Identify garden plants in the wild & discover their care needs</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ background: c.accentGreen, margin: "0 auto", padding: "18px 32px"}}>

        {/* Upload area */}
        {!preview ? (
          <label
            style={{
              display: "block", border: `2px dashed ${hovering ? c.midGreen : "#B8D09A"}`,
              borderRadius: "16px", background: hovering ? "#F0F7E6" : "#FAFAF6",
              padding: "48px 20px", textAlign: "center", cursor: "pointer",
              transition: "all 0.2s", marginBottom: "24px",
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/*<input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />*/}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
            <div style={{ fontSize: "44px", marginTop: "20px" }}>🌱</div>
            <div style={{ fontSize: "17px", fontFamily: fonts.serif, color: c.text, marginTop: "22px" }}>Upload a plant photo</div>
            <div style={{ fontSize: "13px", color: c.muted, fontStyle: "italic", fontFamily: fonts.serif, marginTop: "18px" }}>JPG or PNG · Click or drag to upload</div>
          </label>
        ) : (
          <div style={{ marginBottom: "20px", animation: "fadeIn 0.3s ease" }}>
            <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "340px", objectFit: "cover", borderRadius: "14px", border: `1px solid ${c.border}`, display: "block", marginBottom: "12px" }} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: c.midGreen, fontFamily: fonts.serif, cursor: "pointer", border: `1px solid ${c.accentGreen}`, borderRadius: "8px", padding: "7px 14px", background: c.lightGreen }}>
              <span>↩</span> Change photo
              {/*<input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />  */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Identify button */}
        {preview && (
          <button
            onClick={identifyPlant}
            disabled={loading || !file}
            style={{
              width: "100%", padding: "15px", border: "none", borderRadius: "12px",
              background: loading || !file ? "#8BAF7A" : `linear-gradient(135deg, ${c.midGreen}, ${c.darkGreen})`,
              color: "#E8F5D0", fontSize: "16px", fontFamily: fonts.serif, fontWeight: "600",
              cursor: loading || !file ? "not-allowed" : "pointer", marginBottom: "24px",
              letterSpacing: "0.3px", boxShadow: loading || !file ? "none" : "0 4px 14px rgba(45,80,22,0.25)",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{ width: "16px", height: "16px", border: "2px solid #9DC66B", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Identifying...
                </span>
              : "🔍 Identify Plant"
            }
          </button>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ background: c.warningBg, border: `1px solid ${c.warningBorder}`, borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", animation: "fadeIn 0.3s ease" }}>
            {warnings.map((w, i) => (
              <p key={i} style={{ margin: i > 0 ? "6px 0 0" : 0, fontSize: "14px", color: c.warningText, fontFamily: fonts.serif }}>⚠️ {w}</p>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <p style={{ textAlign: "center", fontSize: "13px", color: c.muted, fontStyle: "italic", fontFamily: fonts.serif, marginBottom: "20px" }}>
              Showing top {results.length} matches
            </p>

            {results.map((plant, i) => (
              <div key={i} style={{ background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: "18px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

                {/* Card header */}
                <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    {i === 0 && <div style={{ fontSize: "11px", color: c.midGreen, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>✦ Best Match</div>}
                    <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: fonts.serif, color: c.text, marginBottom: "3px" }}>{plant.name}</div>
                    <div style={{ fontSize: "13px", fontStyle: "italic", color: c.muted, fontFamily: fonts.serif }}>{plant.info?.scientific_name || "—"} · {plant.info?.family || "—"}</div>
                  </div>
                  <div style={{ background: confBg(plant.confidence), color: confText(plant.confidence), borderRadius: "20px", padding: "5px 13px", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", fontFamily: fonts.serif }}>
                    {plant.confidence}% match
                  </div>
                </div>

                {/* Confidence bar */}
                <div style={{ height: "4px", background: "#EEE", margin: "14px 22px 0" }}>
                  <div style={{ height: "100%", width: `${plant.confidence}%`, background: confColor(plant.confidence), borderRadius: "2px", transition: "width 0.8s ease" }} />
                </div>

                {/* Wikipedia image */}
                {plant.info?.image && (
                  <img src={plant.info.image} alt={plant.name} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block", marginTop: "16px" }} />
                )}

                <div style={{ padding: "18px 22px 22px" }}>

                  {/* Description */}
                  {plant.info?.description && (
                    <p style={{ fontSize: "14px", color: "#4A4A46", lineHeight: "1.7", fontFamily: fonts.serif, fontStyle: "italic", borderLeft: "3px solid #C8DDB8", paddingLeft: "12px", margin: "0 0 18px" }}>
                      {plant.info.description}
                    </p>
                  )}

                  {/* Care grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    {[
                      { icon: "💧", label: "Watering", val: plant.info?.watering },
                      { icon: "☀️", label: "Sunlight", val: plant.info?.sunlight },
                      { icon: "🛤️", label: "Soil", val: plant.info?.soil },
                      { icon: "🌿", label: "Family", val: plant.info?.family },
                    ].map(({ icon, label, val }) => (
                      <div key={label} style={{ background: c.careBg, borderRadius: "10px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", color: c.muted, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: fonts.serif, marginBottom: "5px" }}>{icon} {label}</div>
                        <div style={{ fontSize: "13px", color: c.text, fontFamily: fonts.serif, lineHeight: "1.5" }}>{val || "Not available"}</div>
                      </div>
                    ))}
                  </div>

                  {/* Care tips */}
                  {plant.info?.care_tips && (
                    <div style={{ background: c.lightGreen, borderRadius: "10px", padding: "13px 15px", marginBottom: "14px" }}>
                      <div style={{ fontSize: "11px", color: c.midGreen, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: fonts.serif, marginBottom: "5px" }}>🌱 Care Tips</div>
                      <div style={{ fontSize: "13px", color: c.text, fontFamily: fonts.serif, lineHeight: "1.6" }}>{plant.info.care_tips}</div>
                    </div>
                  )}

                  {/* Wikipedia link */}
                  {plant.info?.wikipedia_url && (
                    <a href={plant.info.wikipedia_url} target="_blank" rel="noreferrer"
                      style={{ fontSize: "13px", color: c.midGreen, fontFamily: fonts.serif, textDecoration: "none", borderBottom: `1px solid ${c.accentGreen}`, paddingBottom: "1px" }}>
                      Read more on Wikipedia ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}