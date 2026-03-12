import { useMemo, useState } from "react";
import { useRouter } from "next/router";

const PillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const BoxesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.2 10.2a1 1 0 001 .8H19a1 1 0 001-.8L22 7H7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 006 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
  { label: "AI Assistant", icon: <SparklesIcon />, href: "/ai-assistant", active: true },
];

const symptomOptions = [
  "Headache",
  "Fever",
  "Cough",
  "Sore Throat",
  "Runny Nose",
  "Nasal Congestion",
  "Body Pain",
  "Fatigue",
  "Upset Stomach",
  "Heartburn",
  "Diarrhea",
  "Minor Allergy",
];

const productCatalog = [
  {
    name: "Paracetamol 500mg",
    category: "Pain / Fever",
    stock: 8,
    otc: true,
    tags: ["Headache", "Fever", "Body Pain"],
    note: "Common OTC option for mild pain and fever relief.",
  },
  {
    name: "Ibuprofen 400mg",
    category: "Pain / Inflammation",
    stock: 19,
    otc: true,
    tags: ["Headache", "Body Pain", "Fever"],
    note: "May help with pain and inflammation when appropriate.",
  },
  {
    name: "Cough Syrup",
    category: "Respiratory",
    stock: 11,
    otc: true,
    tags: ["Cough", "Sore Throat"],
    note: "Supportive relief for mild cough symptoms.",
  },
  {
    name: "Vitamin C 1000mg",
    category: "Supplements",
    stock: 63,
    otc: true,
    tags: ["Fatigue", "Minor Allergy", "Runny Nose"],
    note: "Supportive supplement frequently requested for mild symptoms.",
  },
  {
    name: "Antacid Tablets",
    category: "Digestive",
    stock: 24,
    otc: true,
    tags: ["Heartburn", "Upset Stomach"],
    note: "OTC option for temporary acid discomfort relief.",
  },
  {
    name: "ORS Sachets",
    category: "Digestive",
    stock: 17,
    otc: true,
    tags: ["Diarrhea", "Fatigue"],
    note: "Useful for hydration support in mild digestive cases.",
  },
];

export default function AIAssistantPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [patientCategory, setPatientCategory] = useState("Adult");
  const [productCategory, setProductCategory] = useState("All");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [generated, setGenerated] = useState(false);

  const toggleSymptom = (symptom) => {
    setGenerated(false);
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const suggestions = useMemo(() => {
    let items = productCatalog.filter((item) => item.otc && item.stock > 0);

    if (productCategory !== "All") {
      items = items.filter((item) => item.category === productCategory);
    }

    if (selectedSymptoms.length > 0) {
      items = items
        .map((item) => ({
          ...item,
          score: item.tags.filter((tag) => selectedSymptoms.includes(tag)).length,
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return items;
  }, [selectedSymptoms, productCategory, search]);

  const handleGenerate = () => {
    setGenerated(true);
  };

  return (
    <>
      <div className="ai-root">
        <aside className="ai-sidebar">
          <div>
            <div className="ai-brand">
              <div className="ai-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="ai-brand-title">PharmaOS</div>
                <div className="ai-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="ai-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`ai-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="ai-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="ai-sidebar-card">
            <div className="ai-sidebar-card-badge">Advisory Only</div>
            <h4>OTC suggestions only</h4>
            <p>The assistant excludes regulated items and does not replace pharmacist judgment.</p>
          </div>
        </aside>

        <main className="ai-main">
          <header className="ai-topbar">
            <div>
              <p className="ai-topbar-label">Decision Support / Internal Assistant</p>
              <h1>OTC Suggestion Panel</h1>
            </div>

            <div className="ai-topbar-actions">
              <div className="ai-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search symptom, tag, or OTC product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="ai-icon-btn">
                <BellIcon />
              </button>

              <div className="ai-user">
                <div className="ai-user-avatar">DA</div>
                <div>
                  <div className="ai-user-name">Dr. Admin</div>
                  <div className="ai-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="ai-hero">
            <div className="ai-hero-text">
              <span className="ai-hero-badge">Differentiator Feature</span>
              <h2>Generate advisory OTC suggestions based on symptoms, patient category, and available stock.</h2>
              <p>
                This feature supports the pharmacist or assistant by surfacing in-stock,
                non-prescription products only. The final dispensing decision always remains human.
              </p>
            </div>
          </section>

          <div className="ai-layout">
            <section className="ai-panel">
              <div className="ai-panel-head">
                <div>
                  <p className="ai-panel-kicker">Input Controls</p>
                  <h3>Symptom-based request</h3>
                </div>
              </div>

              <div className="ai-grid two">
                <div className="ai-field">
                  <label>Patient Category</label>
                  <select value={patientCategory} onChange={(e) => setPatientCategory(e.target.value)}>
                    <option>Adult</option>
                    <option>Child</option>
                    <option>Elderly</option>
                  </select>
                </div>

                <div className="ai-field">
                  <label>Product Category</label>
                  <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                    <option>All</option>
                    <option>Pain / Fever</option>
                    <option>Respiratory</option>
                    <option>Digestive</option>
                    <option>Supplements</option>
                  </select>
                </div>
              </div>

              <div className="ai-field">
                <label>Symptoms</label>
                <div className="ai-symptom-grid">
                  {symptomOptions.map((symptom) => (
                    <button
                      type="button"
                      key={symptom}
                      className={`ai-symptom-btn${selectedSymptoms.includes(symptom) ? " active" : ""}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ai-actions">
                <button type="button" className="ai-primary-btn" onClick={handleGenerate}>
                  <SparklesIcon /> Generate Suggestions
                </button>
              </div>

              <div className="ai-info-box">
                <InfoIcon />
                <span>
                  This tool only proposes OTC products currently in stock. It is advisory and must be reviewed by a pharmacist or assistant.
                </span>
              </div>
            </section>

            <section className="ai-panel">
              <div className="ai-panel-head">
                <div>
                  <p className="ai-panel-kicker">AI Output</p>
                  <h3>Suggested OTC options</h3>
                </div>
              </div>

              {!generated ? (
                <div className="ai-empty">
                  Select symptoms and click “Generate Suggestions” to display matching OTC products.
                </div>
              ) : suggestions.length === 0 ? (
                <div className="ai-empty">
                  No advisory match found for the current filters. Try fewer symptoms or another category.
                </div>
              ) : (
                <div className="ai-suggestion-list">
                  {suggestions.map((item) => (
                    <div className="ai-suggestion-card" key={item.name}>
                      <div className="ai-suggestion-top">
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.category}</p>
                        </div>
                        <span className="ai-stock-badge">{item.stock} in stock</span>
                      </div>

                      <div className="ai-tag-row">
                        {item.tags.map((tag) => (
                          <span key={tag} className={`ai-tag${selectedSymptoms.includes(tag) ? " match" : ""}`}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="ai-suggestion-note">
                        <strong>Advisory note:</strong> {item.note}
                      </div>

                      <div className="ai-review-box">
                        <CheckIcon />
                        <span>Must be reviewed by staff before recommendation to patient.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="ai-panel ai-bottom-panel">
            <div className="ai-panel-head">
              <div>
                <p className="ai-panel-kicker">Compliance Notes</p>
                <h3>Safety boundaries</h3>
              </div>
            </div>

            <div className="ai-rules-grid">
              <div className="ai-rule-card">
                <h4>Non-prescription only</h4>
                <p>The module excludes prescription and regulated medicines from suggestions.</p>
              </div>

              <div className="ai-rule-card">
                <h4>Stock-aware recommendations</h4>
                <p>Only currently available products are surfaced to the user interface.</p>
              </div>

              <div className="ai-rule-card">
                <h4>Human final authority</h4>
                <p>The pharmacist remains legally and operationally responsible for the final decision.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        body {
          margin: 0;
          background: #f5f3ee;
          font-family: "Outfit", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .ai-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .ai-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .ai-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .ai-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.32);
        }

        .ai-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .ai-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .ai-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-nav-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #a8bdd7;
          min-height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          text-align: left;
        }

        .ai-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .ai-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .ai-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .ai-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .ai-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .ai-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .ai-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .ai-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .ai-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .ai-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .ai-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ai-search {
          width: 330px;
          height: 48px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          color: #7b8ba1;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .ai-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .ai-icon-btn {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .ai-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .ai-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .ai-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .ai-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .ai-hero {
          background: linear-gradient(135deg, #0b1c35, #163257);
          color: white;
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 22px;
          box-shadow: 0 16px 40px rgba(11, 28, 53, 0.16);
        }

        .ai-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .ai-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .ai-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .ai-layout {
          display: grid;
          grid-template-columns: 0.95fr 1.25fr;
          gap: 18px;
          margin-bottom: 22px;
        }

        .ai-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .ai-bottom-panel {
          margin-top: 0;
        }

        .ai-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .ai-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .ai-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .ai-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 16px;
        }

        .ai-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .ai-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .ai-field label {
          font-size: 13px;
          color: #5d6d82;
          font-weight: 500;
        }

        .ai-field select {
          width: 100%;
          border: 1px solid #dbe3ed;
          background: #f8fafc;
          border-radius: 14px;
          padding: 14px 14px;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
          outline: none;
        }

        .ai-field select:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .ai-symptom-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ai-symptom-btn {
          border: 1px solid #dbe4ef;
          background: #fff;
          color: #0b1c35;
          border-radius: 999px;
          padding: 10px 14px;
          font-family: "Outfit", sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ai-symptom-btn.active {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .ai-actions {
          display: flex;
          justify-content: flex-end;
          margin: 10px 0 16px;
        }

        .ai-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
          font-family: "Outfit", sans-serif;
          cursor: pointer;
          border-radius: 14px;
          height: 46px;
          padding: 0 18px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .ai-info-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          border-radius: 14px;
          padding: 14px;
          font-size: 13px;
          line-height: 1.7;
        }

        .ai-empty {
          border: 1px dashed #d8e1eb;
          border-radius: 16px;
          padding: 20px;
          color: #7a8a9b;
          font-size: 14px;
          text-align: center;
          background: #fbfdff;
        }

        .ai-suggestion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ai-suggestion-card {
          border: 1px solid #e8eef5;
          background: #fbfdff;
          border-radius: 18px;
          padding: 16px;
        }

        .ai-suggestion-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ai-suggestion-top h4 {
          margin: 0 0 4px;
          font-size: 17px;
          color: #0b1c35;
        }

        .ai-suggestion-top p {
          margin: 0;
          font-size: 13px;
          color: #6b7a90;
        }

        .ai-stock-badge {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: #ecfdf5;
          color: #047857;
          white-space: nowrap;
          height: fit-content;
        }

        .ai-tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ai-tag {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: #f1f5f9;
          color: #516275;
        }

        .ai-tag.match {
          background: #eff6ff;
          color: #2563eb;
        }

        .ai-suggestion-note {
          color: #516275;
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .ai-review-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 12px;
          border-radius: 12px;
          background: #fff7ed;
          color: #c2410c;
          font-size: 12px;
          font-weight: 500;
        }

        .ai-rules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .ai-rule-card {
          border: 1px solid #e8eef5;
          border-radius: 18px;
          background: #fbfdff;
          padding: 16px;
        }

        .ai-rule-card h4 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #0b1c35;
        }

        .ai-rule-card p {
          margin: 0;
          color: #607086;
          font-size: 13px;
          line-height: 1.7;
        }

        @media (max-width: 1200px) {
          .ai-layout {
            grid-template-columns: 1fr;
          }

          .ai-rules-grid {
            grid-template-columns: 1fr;
          }

          .ai-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .ai-root {
            flex-direction: column;
          }

          .ai-sidebar {
            width: 100%;
            gap: 20px;
          }

          .ai-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .ai-topbar-actions {
            flex-wrap: wrap;
          }

          .ai-search {
            width: 100%;
          }

          .ai-grid.two {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .ai-main {
            padding: 18px;
          }

          .ai-topbar h1 {
            font-size: 34px;
          }

          .ai-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}