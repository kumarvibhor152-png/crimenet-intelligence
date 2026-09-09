# DRISHTI-CRIMENEXUS (National Criminal Network & Intelligence Command)
**Police-Grade AI Syndicate Analyzer, Link Analysis, Hawala Radar & Geospatial Intelligence**

## 1. System Overview
**DRISHTI-CRIMENEXUS** is an advanced law enforcement intelligence platform engineered to ingest, cross-reference, and analyze fragmented criminal data across telecommunications, banking transactions, prior FIR charge sheets, and field surveillance reports.

### Key Capabilities Built for Law Enforcement:
1. **Multi-Dimensional Entity Link Graph**:
   - Force-directed physics network linking Suspects, Front Businesses, Bank Accounts, Phone Numbers, and Vehicles.
   - Centrality computation: **Betweenness Centrality** (identifies critical syndicate brokers), **Degree Centrality**, and **PageRank**.
   - Interactive Shortest-Path Finder: Traces the exact intermediary hops connecting any two suspects.
2. **Geospatial Tactical GIS & Telecom Movement Radar**:
   - Real-time Leaflet India map plotting suspect base coordinates, cell towers across 8 major hubs (Mumbai, Pune, Nagpur, Delhi, Bengaluru, Surat, Lucknow, Hyderabad), and inter-city communication arcs.
3. **Financial Forensics & Hawala Smurfing Radar**:
   - Uncovers the money laundering nexus centered on **Sunrise Money Exchange (O10 - Axis-203577948775)**.
   - Detects structuring violations under Section 12 PMLA (rapid micro-transfers strictly under ₹1,00,000 threshold to evade mandatory FIU reporting).
   - Generates official **FIU-IND Suspicious Transaction Reports (STR)** formatted for regulatory and judicial filing.
4. **CDR Telecommunication & Burner Line Analytics**:
   - 24-hour temporal density histogram flagging midnight operational windows.
   - Identifies late-night call bursts between key narcotics fugitives Kunal Khan (P004) and Priya Pillai (P016).
5. **AI / NLP Police Report Named Entity Recognizer (NER)**:
   - Parses unstructured FIRs, interrogation transcripts, and field cables.
   - Extracts Persons, Vehicles, SIMs, Bank Accounts, IPC/NDPS/PMLA sections, and Indian Cities with one-click live graph ingestion.
6. **Classified Suspect Dossier & Printable Case Board**:
   - Full biometric and criminal record profile for all 40 suspects.
   - Printable court-ready case files with print-optimized CSS.

---

## 2. Directory Structure
```
crimenet-intelligence/
├── index.html              # Command portal & UI layout
├── styles.css              # Tactical cyber-intelligence dark stylesheet
├── README.md               # Architecture documentation & guide
└── js/
    ├── data.js             # 40 Suspects, 10 Orgs, 122 CDRs, 68 FinTxns, Centrality Algorithms
    ├── graph-engine.js     # Canvas force-directed graph & Brandes betweenness engine
    ├── gis-map.js          # Leaflet geospatial mapping & tower arcs
    ├── hawala-radar.js     # Money laundering pipeline & FIU STR generator
    ├── cdr-engine.js       # 24h call histogram & burner burst detection
    ├── nlp-engine.js       # Police intelligence report NER extractor
    ├── dossier-modal.js    # Suspect case dossier modal & print layout
    └── app.js              # State manager, tabs, audio synthesizer & omnisearch
```

---

## 3. Running Locally
Run the built-in Python web server from this directory:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your web browser.
