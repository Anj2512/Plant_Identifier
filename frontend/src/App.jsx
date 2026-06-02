import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";
//const API_URL = "http://192.168.68.127:8000";
//const API_URL = "http://localhost:8000";
//const API_URL = import.meta.env.VITE_API_URL;


export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setResults([]);
    setWarnings([]);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const identifyPlant = async () => {
    if (!file) return;

    setLoading(true);
    setResults([]);
    setWarnings([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/identify`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend request failed");

      const data = await res.json();
      setResults(data.results || []);
      setWarnings(data.warnings || []);
    } catch (err) {
      console.error(err);
      alert("Could not connect to the plant identification server.");
    } finally {
      setLoading(false);
    }
  };

  const bestResult = results[0];

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="hero">
        <span className="botanicalShape botanicalOne"></span>
        <span className="botanicalShape botanicalTwo"></span>
        <span className="botanicalShape botanicalThree"></span>

        <span className="heroGlow heroGlowOne"></span>
        <span className="heroGlow heroGlowTwo"></span>

        <nav className="nav">
          <div className="brand">
            <span className="brandIcon">🌿</span>
            <span>PlantSense</span>
          </div>
          <span className="pill">Free Plant Care Guide</span>
        </nav>

        <div className="heroContent">
          <p className="eyebrow">Garden companion</p>
          <h1>Identify garden plants and see how to support them.</h1>
          <p className="subtitle">
            Take or upload a photo to get your plant identified with a confidence score
            and simple care instructions.
          </p>
        </div>
      </header>

      <main className="main">
        <section className="uploadPanel">
          <div className="panelHeader">
            <h2>Scan a plant</h2>
            <p>Use a clear photo with good lighting for best results.</p>
          </div>

          {!preview ? (
            <label className="dropZone">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
              <div className="dropIcon">📷</div>
              <h3>Take or upload a photo</h3>
              <p>JPG, PNG, or phone camera image</p>
            </label>
          ) : (
            <div className="previewWrap">
              <img src={preview} alt="Plant preview" className="preview" />

              <div className="previewActions">
                <label className="secondaryBtn">
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  className="primaryBtn"
                  onClick={identifyPlant}
                  disabled={loading}
                >
                  {loading ? "Identifying..." : "Identify Plant"}
                </button>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="warningBox">
              {warnings.map((warning, i) => (
                <p key={i}>⚠️ {warning}</p>
              ))}
            </div>
          )}
        </section>

        {bestResult && (
          <section className="bestMatch">
            <div>
              <p className="eyebrow">Best match</p>
              <h2>{bestResult.name}</h2>
              <p>{bestResult.confidence}% confidence</p>
            </div>
            <div className="scoreCircle">{bestResult.confidence}%</div>
          </section>
        )}

        {results.length > 0 && (
          <section className="results">
            <h2>Identification Results</h2>

            <div className="resultGrid">
              {results.map((plant, index) => (
                <article className="plantCard" key={index}>
                  {plant.info?.image && (
                    <img
                      src={plant.info.image}
                      alt={plant.name}
                      className="plantImage"
                    />
                  )}

                  <div className="plantBody">
                    <div className="plantTop">
                      <div>
                        <span className="rank">
                          {index === 0 ? "Best Match" : `Match #${index + 1}`}
                        </span>
                        <h3>{plant.name}</h3>
                        <p className="scientific">
                          {plant.info?.scientific_name || "Unknown scientific name"}
                        </p>
                      </div>

                      <span className="confidence">{plant.confidence}%</span>
                    </div>

                    <p className="description">
                      {plant.info?.description || "No description available."}
                    </p>

                    <div className="careGrid">
                      <CareItem label="Water" icon="💧" value={plant.info?.watering} />
                      <CareItem label="Sunlight" icon="☀️" value={plant.info?.sunlight} />
                      <CareItem label="Soil" icon="🪴" value={plant.info?.soil} />
                      <CareItem label="Family" icon="🌱" value={plant.info?.family} />
                    </div>

                    {plant.info?.care_tips && (
                      <div className="tipBox">
                        <strong>Care tip:</strong> {plant.info.care_tips}
                      </div>
                    )}

                    {plant.info?.wikipedia_url && (
                      <a
                        href={plant.info.wikipedia_url}
                        target="_blank"
                        rel="noreferrer"
                        className="wikiLink"
                      >
                        Read more on Wikipedia →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function CareItem({ icon, label, value }) {
  return (
    <div className="careItem">
      <span>{icon}</span>
      <div>
        <h4>{label}</h4>
        <p>{value || "Not available"}</p>
      </div>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f5f1e8;
    color: #21351f;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .app {
    min-height: 100vh;
  }

  .hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 20%, rgba(188, 231, 137, 0.22), transparent 30%),
    radial-gradient(circle at 85% 10%, rgba(157, 198, 107, 0.16), transparent 24%),
    linear-gradient(120deg, #183b16, #244f1e, #315f29, #183b16);
  background-size: 140% 140%, 120% 120%, 300% 300%;
  animation: heroGardenMove 16s ease-in-out infinite;
  color: white;
  padding: 26px 22px 120px;
  margin-bottom: 74px;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px),
    radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 80px 80px, 34px 34px;
  opacity: 0.32;
  pointer-events: none;
}

.hero::after {
  content: "";
  position: absolute;
  inset: auto -10% -35% -10%;
  height: 180px;
  background: radial-gradient(
    ellipse at center,
    rgba(185, 218, 143, 0.16),
    transparent 68%
  );
  pointer-events: none;
}

.botanicalShape,
.heroGlow {
  position: absolute;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.botanicalShape {
  width: 120px;
  height: 48px;
  border: 1px solid rgba(214, 242, 163, 0.14);
  border-radius: 100% 0 100% 0;
  background: linear-gradient(
    135deg,
    rgba(214, 242, 163, 0.12),
    rgba(255, 255, 255, 0.02)
  );
  transform-origin: center;
  animation: botanicalFloat 9s ease-in-out infinite;
}

.botanicalShape::after {
  content: "";
  position: absolute;
  left: 12%;
  top: 50%;
  width: 76%;
  height: 1px;
  background: rgba(214, 242, 163, 0.16);
  transform: rotate(-18deg);
}

.botanicalOne {
  top: 32px;
  left: 7%;
  --rotate: -18deg;
}

.botanicalTwo {
  top: 54px;
  right: 10%;
  width: 92px;
  height: 38px;
  --rotate: 22deg;
  animation-delay: 1.3s;
}

.botanicalThree {
  bottom: 34px;
  right: 26%;
  width: 150px;
  height: 58px;
  opacity: 0.7;
  --rotate: -8deg;
  animation-delay: 2.1s;
}

.heroGlow {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d7f2a3;
  box-shadow: 0 0 14px #d7f2a3;
  opacity: 0.35;
  animation: glowFloat 5s ease-in-out infinite;
}

.heroGlowOne {
  top: 42px;
  right: 31%;
}

.heroGlowTwo {
  bottom: 72px;
  left: 18%;
  width: 5px;
  height: 5px;
  animation-delay: 1.8s;
}

.nav,
.heroContent {
  position: relative;
  z-index: 1;
}

@keyframes heroGardenMove {
  0% {
    background-position: 0% 50%, 100% 0%, 0% 50%;
  }

  50% {
    background-position: 100% 50%, 0% 100%, 100% 50%;
  }

  100% {
    background-position: 0% 50%, 100% 0%, 0% 50%;
  }
}

@keyframes botanicalFloat {
  0%,
  100% {
    transform: translateY(0) rotate(var(--rotate));
  }

  50% {
    transform: translateY(-10px) rotate(var(--rotate));
  }
}

@keyframes glowFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.22;
  }

  50% {
    transform: translateY(-9px);
    opacity: 0.75;
  }
}
  .nav {
    max-width: 1080px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .brandIcon {
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.18);
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 14px;
  }

  .pill {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .heroContent {
    max-width: 1080px;
    margin: 70px auto 0;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #b9da8f;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 12px;
    font-weight: 800;
  }

  h1 {
    margin: 0;
    max-width: 720px;
    font-size: clamp(38px, 6vw, 68px);
    line-height: 0.95;
    letter-spacing: -0.06em;
    color: #cdf7cd; 
  }

  .subtitle {
    max-width: 580px;
    margin-top: 18px;
    color: #e6f2dd;
    font-size: 18px;
    line-height: 1.6;
  }

  .main {
    max-width: 1080px;
    margin: -54px auto 70px;
    padding: 0 22px;
  }

  .uploadPanel,
  .bestMatch,
  .plantCard {
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(65, 82, 45, 0.12);
    box-shadow: 0 24px 70px rgba(25, 46, 22, 0.12);
    border-radius: 28px;
  }

  .uploadPanel {
    padding: 28px;
  }

  .panelHeader h2,
  .results h2,
  .bestMatch h2 {
    margin: 0;
    font-size: 28px;
    letter-spacing: -0.04em;
  }

  .panelHeader p {
    margin: 8px 0 22px;
    color: #68735f;
  }

  .dropZone {
    min-height: 300px;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 34px;
    border: 2px dashed #a9c985;
    background: linear-gradient(180deg, #fbfff5, #f3f8ea);
    border-radius: 22px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .dropZone:hover {
    transform: translateY(-2px);
    border-color: #557c3b;
  }

  .dropZone input,
  .secondaryBtn input {
    display: none;
  }

  .dropIcon {
    width: 76px;
    height: 76px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    background: #e4f2d4;
    font-size: 34px;
    margin: 0 auto 18px;
  }

  .dropZone h3 {
    margin: 0;
    font-size: 22px;
  }

  .dropZone p {
    margin: 8px 0 0;
    color: #738067;
  }

  .preview {
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: 22px;
    display: block;
  }

  .previewActions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .primaryBtn,
  .secondaryBtn {
    border: none;
    border-radius: 16px;
    padding: 14px 18px;
    font-weight: 800;
    cursor: pointer;
    font-size: 15px;
  }

  .primaryBtn {
    flex: 1;
    color: white;
    background: linear-gradient(135deg, #396f2f, #183b16);
    box-shadow: 0 10px 24px rgba(36, 75, 29, 0.25);
  }

  .primaryBtn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .secondaryBtn {
    background: #edf5e5;
    color: #315f29;
    border: 1px solid #c8ddb8;
  }

  .warningBox {
    margin-top: 18px;
    padding: 14px 16px;
    background: #fff7d8;
    border: 1px solid #eed179;
    border-radius: 16px;
    color: #78540c;
  }

  .warningBox p {
    margin: 0;
  }

  .bestMatch {
    margin-top: 22px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bestMatch p:last-child {
    margin: 8px 0 0;
    color: #68735f;
  }

  .scoreCircle {
    width: 82px;
    height: 82px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e4f2d4;
    color: #315f29;
    font-weight: 900;
    border: 8px solid #c8e3aa;
  }

  .results {
    margin-top: 34px;
  }

  .resultGrid {
    display: grid;
    gap: 22px;
    margin-top: 18px;
  }

  .plantCard {
    overflow: hidden;
  }

  .plantImage {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  .plantBody {
    padding: 24px;
  }

  .plantTop {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .rank {
    color: #557c3b;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .plantTop h3 {
    margin: 6px 0 4px;
    font-size: 28px;
    letter-spacing: -0.04em;
  }

  .scientific {
    margin: 0;
    color: #72806b;
    font-style: italic;
  }

  .confidence {
    background: #e4f2d4;
    color: #315f29;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 900;
    white-space: nowrap;
  }

  .description {
    margin: 18px 0;
    color: #4e5b49;
    line-height: 1.7;
  }

  .careGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .careItem {
    display: flex;
    gap: 12px;
    background: #f6f2e9;
    border: 1px solid #e5dfd1;
    border-radius: 18px;
    padding: 14px;
  }

  .careItem h4 {
    margin: 0 0 5px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #557c3b;
  }

  .careItem p {
    margin: 0;
    color: #3e4b39;
    line-height: 1.5;
    font-size: 14px;
  }

  .tipBox {
    margin-top: 14px;
    background: #eaf5df;
    color: #2c4f24;
    border-radius: 18px;
    padding: 16px;
    line-height: 1.6;
  }

  .wikiLink {
    display: inline-block;
    margin-top: 16px;
    color: #315f29;
    font-weight: 800;
    text-decoration: none;
  }

  @media (max-width: 700px) {
    .hero {
      padding-bottom: 240px;
    }

    .main {
      margin-top: -42px;
    }

    .uploadPanel {
      padding: 20px;
    }

    .previewActions,
    .bestMatch,
    .plantTop {
      flex-direction: column;
    }

    .careGrid {
      grid-template-columns: 1fr;
    }

    .plantImage {
      height: 220px;
    }

    .scoreCircle {
      width: 70px;
      height: 70px;
    }
  }
`;