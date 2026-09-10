/**
 * DRISHTI-CRIMENEXUS AI / NLP INTELLIGENCE EXTRACTOR
 * Advanced Named Entity Recognition (NER) & statute classifier for unstructured
 * police reports, FIR transcripts, and informant field cables.
 * Supports open-vocabulary suspect name extraction, live typing extraction,
 * and contextual entity link resolution.
 */

const SAMPLE_POLICE_CABLES = [
  {
    id: "CABLE-01",
    title: "Confidential Field Intercept: Surat-Pune Narcotics Transit",
    text: `CONFIDENTIAL // SPECIAL TASK FORCE (STF) INTELLIGENCE CABLE
DATE: 14-MAY-2025 | SOURCE: SIGINT SURVEILLANCE CELL SURAT

Field informant confirms that Kunal Khan (alias KK), currently absconding in FIR-908 under NDPS Act Sec 8/20 (Drugs), was sighted operating near Surat textile market driving black SUV vehicle MH1265AD6967. 
Wiretap on burner phone 9697848018 intercepted 3 encrypted communications with Priya Pillai (phone 9850142940) coordinating delivery of commercial contraband consignment to Pune receiver Farhan Nair.

Financial settlement of ₹88,000 was layered through Sunrise Money Exchange account Axis-203577948775. Consignment is scheduled to move via Om Sai Logistics carrier vehicle GJ0530FF4432 toward Mumbai corridor.`
  },
  {
    id: "CABLE-02",
    title: "FIR Intelligence: Interstate Extortion Racket",
    text: `CRIME BRANCH CID // SPECIAL INVESTIGATION TEAM REPORT
SUBJECT: EXTORTION & HAWALA SYNDICATE INVESTIGATION

During interrogation in FIR-537 under IPC 384 (Extortion) and IPC 120B (Criminal Conspiracy), prime suspect Anil Gupta (phone 9509839301) disclosed extortion demands levied against builders in Delhi and Lucknow.
Extortion proceeds amounting to ₹58,584 were transferred from Bank of Baroda-334013073383 directly into Axis-203577948775 under the guise of trading payments.

Co-conspirator Priya Khan (phone 9033092327) using registration TS0969EF3749 provided logistics sanctuary in Hyderabad. Cross-border communication links traced to Faisal Joshi in Nagpur.`
  },
  {
    id: "CABLE-03",
    title: "FIU Suspicious Activity Intercept: Structured Hawala Dispersal",
    text: `FINANCIAL INTELLIGENCE UNIT // SUSPICIOUS ACTIVITY ADVISORY
DATE: 22-JAN-2025 | PRIORITY: HIGH ALERT

Surveillance of account Axis-203577948775 belonging to Sunrise Money Exchange in Bengaluru reveals rapid structuring violations under PMLA Sec 3 (Money Laundering). 
Inbound transfers of ₹91,801 from ICICI-273665994394 belonging to Kunal Khan and ₹64,035 from Bank of Baroda-227639372412 were dispersed into multiple micro-deposits of ₹82,989 and ₹53,242 to evade detection.

Suspects identified in this financial trail include Zoya Nair (phone 9489513433), Ahmed Singh (phone 9350305641) with vehicle PB1084GG6930, and Sunita Reddy in Lucknow.`
  }
];

// Law Enforcement & Administrative Stopwords (to eliminate false-positive entity tags)
const NER_STOPWORDS = new Set([
  "confidential", "special task force", "intelligence cable", "source",
  "sigint surveillance cell", "special investigation team", "crime branch cid",
  "crime branch", "financial intelligence unit", "suspicious activity advisory",
  "high alert", "police station", "textile market", "burner phone",
  "encrypted communications", "contraband consignment", "commercial contraband",
  "sunrise money exchange", "money exchange", "logistics carrier", "om sai logistics",
  "sai logistics", "mumbai corridor", "trading payments", "logistics sanctuary",
  "cross border", "communication links", "structuring violations", "inbound transfers",
  "micro deposits", "financial trail", "black suv", "white sedan", "fir", "stf", "cid",
  "fiu", "pmla", "ndps", "ipc", "act", "sec", "section", "date", "subject", "priority",
  "field informant", "bank of baroda", "axis", "icici", "sbi", "hdfc", "pnb", "state bank",
  "first information report", "investigation report", "case diary", "central crime branch",
  "narcotic drugs", "prevention of money laundering", "high court", "supreme court",
  "january", "february", "march", "april", "may", "june", "july", "august", "september",
  "october", "november", "december", "monday", "tuesday", "wednesday", "thursday", "friday",
  "saturday", "sunday"
]);

// Common Indian Surnames & Family Names for Affinitive NER Matching
const INDIAN_SURNAMES = new Set([
  "khan", "gupta", "nair", "pillai", "singh", "sharma", "joshi", "reddy", "patel",
  "deshmukh", "verma", "rao", "shah", "mehta", "roy", "sen", "das", "ali", "sheikh",
  "yadav", "mishra", "agarwal", "bhatia", "kulkarni", "shinde", "patil", "malhotra",
  "kapoor", "khanna", "chopra", "bedi", "gill", "kaur", "merchant", "ansari", "qureshi",
  "hegde", "shetty", "nayak", "menon", "chawla", "grover", "bajaj", "seth", "saxena",
  "tiwari", "pandey", "dubey", "shukla", "jha", "thakur", "chauhan", "rathore", "solanki",
  "singhania", "dutta", "bose", "choudhury", "chatterjee", "banerjee", "mukherjee", "parmar",
  "pawar", "bhosale", "desai", "chavan", "jadhav", "more", "shukla", "tripathi", "bhatt"
]);

// Expanded Metropolitan & Crime Transit Hub Cities
const INDIAN_CITIES = [
  "Mumbai", "Pune", "Nagpur", "Delhi", "Bengaluru", "Surat", "Lucknow", "Hyderabad",
  "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Indore", "Bhopal",
  "Patna", "Kochi", "Gurugram", "Noida", "Thane", "Nashik", "Varanasi", "Amritsar", "Goa"
];

class NLPEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentText = SAMPLE_POLICE_CABLES[0].text;
    this.extractedEntities = null;
    this.aiStatuteData = null;
    this.debounceTimer = null;
    this.init();
  }

  init() {
    this.extractEntities(this.currentText);
    this.render();
    this.fetchBackendStatuteClassification(this.currentText);
  }

  /**
   * Helper: Cleans up extracted candidate names, removes honorific prefixes,
   * colons/punctuation, and stops at verbs/prepositions.
   */
  cleanPersonName(rawName) {
    if (!rawName) return "";
    let name = rawName.trim();
    
    // Remove leading punctuation / colons
    name = name.replace(/^[:=-]+\s*/, "");

    // Remove leading honorifics / ranks
    name = name.replace(/^(?:Inspector|Sub-Inspector|SI|ACP|DCP|DSP|Constable|Shri|Smt|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Mohd\.?|Md\.?)\s+/i, "");
    
    // Remove trailing punctuation
    name = name.replace(/[.,;:()\[\]{}'"]+$/, "").trim();
    
    const NON_NAME_TOKENS = new Set([
      "is", "was", "are", "were", "has", "had", "been", "being", "having", "driving",
      "operating", "currently", "absconding", "arrested", "lodged", "registered",
      "sighted", "seen", "fled", "stole", "intercepted", "disclosed", "confirms",
      "revealed", "layered", "belonging", "transferred", "moving", "scheduled",
      "near", "under", "toward", "towards", "against", "between", "through",
      "during", "interrogation", "vehicle", "phone", "account", "cash", "for",
      "consignment", "contraband", "racket", "transit", "corridor", "syndicate",
      "and", "in", "to", "at", "by", "on", "with", "from", "alias"
    ]);

    const rawTokens = name.split(/\s+/);
    const validTokens = [];
    for (const tok of rawTokens) {
      const cleanTok = tok.replace(/[^a-zA-Z]/g, '');
      if (!cleanTok) break;
      const lower = cleanTok.toLowerCase();
      if (NON_NAME_TOKENS.has(lower) || NER_STOPWORDS.has(lower)) {
        break;
      }
      // Capitalize first letter properly
      validTokens.push(cleanTok.charAt(0).toUpperCase() + cleanTok.slice(1).toLowerCase());
    }
    return validTokens.join(" ");
  }

  /**
   * Validates whether a candidate person name is legitimate or a false positive.
   */
  isValidPerson(cand, extractedOrgs, isFromCue = false) {
    if (!cand || cand.length < 2) return false;
    const lower = cand.toLowerCase();
    
    if (NER_STOPWORDS.has(lower)) return false;
    
    // Disallow if matches any extracted organization
    for (const org of extractedOrgs) {
      if (org.toLowerCase() === lower || (lower.length > 5 && org.toLowerCase().includes(lower))) {
        return false;
      }
    }
    
    // Disallow if matches any city
    for (const city of INDIAN_CITIES) {
      if (lower === city.toLowerCase()) return false;
    }

    const tokens = cand.split(/\s+/);
    // If preceded by an explicit cue (e.g. "accused", "suspect", "named", "against"), allow 1 to 3 tokens!
    if (isFromCue) {
      if (tokens.length < 1 || tokens.length > 3) return false;
    } else {
      if (tokens.length < 2 || tokens.length > 3) return false;
    }

    // Disqualify known non-person noun starters
    const blacklistedStarters = new Set([
      "vehicle", "carrier", "truck", "black", "white", "account",
      "interrogation", "consignment", "financial", "burner", "textile", "corridor"
    ]);
    if (blacklistedStarters.has(tokens[0].toLowerCase())) return false;

    return true;
  }

  /**
   * Multi-Stage Hybrid Named Entity Recognition (NER)
   * Combines Database Knowledge Base + Law Enforcement Contextual Cues + Open-Vocabulary Patterns
   */
  extractEntities(text) {
    if (!text) {
      this.extractedEntities = { persons: [], organizations: [], phones: [], vehicles: [], bankAccounts: [], sections: [], cities: [], amounts: [], firs: [] };
      return this.extractedEntities;
    }

    const engine = window.crimeDataEngine;
    const knownSuspects = engine ? engine.persons : [];
    const knownNames = knownSuspects.map(p => p.name);
    const knownOrgs = engine ? engine.organizations.map(o => o.name) : [];

    const entities = {
      persons: new Set(),
      organizations: new Set(),
      phones: new Set(),
      vehicles: new Set(),
      bankAccounts: new Set(),
      sections: new Set(),
      cities: new Set(),
      amounts: new Set(),
      firs: new Set()
    };

    // 1. Phone numbers (10 digits starting 6-9)
    const phoneRegex = /\b[6-9]\d{9}\b/g;
    let match;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.phones.add(match[0]);
    }

    // 2. Vehicle numbers (Indian registration formats)
    const vehicleRegex = /\b[A-Z]{2}\s?\d{2}\s?[A-Z]{1,3}\s?\d{4}\b/g;
    while ((match = vehicleRegex.exec(text)) !== null) {
      entities.vehicles.add(match[0].replace(/\s+/g, ''));
    }

    // 3. Bank Accounts (Multi-bank regex support)
    const bankRegex = /\b(?:Axis|ICICI|SBI|HDFC|PNB|Bank of Baroda|Canara|Kotak|Yes Bank|Union Bank|IDFC|IndusInd)[-\s]?[0-9]{9,18}\b/gi;
    while ((match = bankRegex.exec(text)) !== null) {
      entities.bankAccounts.add(match[0]);
    }

    // 4. Legal Sections: IPC, NDPS, PMLA
    const secRegex = /\b(IPC\s+\d+[A-Z]?|NDPS(?:\s+Act)?(?:\s+Sec\s+\d+(?:\/\d+)?)?|PMLA(?:\s+Sec\s+\d+)?)\b/gi;
    while ((match = secRegex.exec(text)) !== null) {
      entities.sections.add(match[0]);
    }

    // 5. FIR Numbers (e.g. FIR-908, FIR-537, FIR-1004)
    const firRegex = /\bFIR-\d{3,5}\b/g;
    while ((match = firRegex.exec(text)) !== null) {
      entities.firs.add(match[0]);
    }

    // 6. Currency Amounts: ₹xx,xxx or Rs. xx,xxx
    const amtRegex = /(?:[₹Rs\.]+|INR)\s?[\d,]+(?:\.\d{2})?/gi;
    while ((match = amtRegex.exec(text)) !== null) {
      entities.amounts.add(match[0]);
    }

    // 7. Indian Transit Cities & Hubs
    INDIAN_CITIES.forEach(city => {
      if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
        entities.cities.add(city);
      }
    });

    // 8. Organizations (Database + Contextual regex)
    knownOrgs.forEach(org => {
      if (new RegExp(`\\b${org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
        entities.organizations.add(org);
      }
    });
    const orgPattern = /\b([A-Z][a-zA-Z0-9\s&]{2,32}?(?:Money\s+Exchange|Logistics|Enterprises|Traders|Exports|Impex|Agency|Corporation|Pvt\s+Ltd|Ltd|LLP))\b/g;
    while ((match = orgPattern.exec(text)) !== null) {
      const orgCand = match[1].trim();
      if (!NER_STOPWORDS.has(orgCand.toLowerCase())) {
        entities.organizations.add(orgCand);
      }
    }

    // ==========================================
    // 9. PERSON ENTITY EXTRACTION (MULTI-TIER)
    // ==========================================
    const extractedPersons = new Set();

    // Tier 1: Known Database Suspects
    knownNames.forEach(name => {
      const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        extractedPersons.add(name);
      }
    });

    // Tier 2: Law Enforcement Contextual Cues (Supports Single or Multi-token names, with or without colons!)
    // e.g. "Accused: Rahul", "Suspect: Vikram", "Field informant confirms that Amit", "FIR against Ramesh", "Arrested Rohit"
    const contextRegex = /(?:field\s+informant\s+confirms\s+that|confirms\s+that|prime\s+suspect|suspects?\s+identified\s+in\s+this\s+financial\s+trail\s+include|suspects?\s+include|suspects?|accused|conspirators?|co-conspirators?|receivers?|handlers?|operators?|drivers?|carriers?|couriers?|informants?|associates?|masterminds?|kingpins?|accomplices?|wanted|absconders?|interrogation\s+(?:of|revealed)|communications?\s+with|meeting\s+with|along\s+with|traced\s+to|belonging\s+to|identified\s+as|named\s+in\s+fir|named|alias|against|arrested|apprehended|complaint\s+against|charges\s+against|dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt|inspector|sub-inspector|si|constable|names?|complainants?|witnesses?|victims?)(?:\s*[:=-]\s*|\s+)([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/gi;
    while ((match = contextRegex.exec(text)) !== null) {
      const cleaned = this.cleanPersonName(match[1]);
      if (this.isValidPerson(cleaned, entities.organizations, true)) {
        extractedPersons.add(cleaned);
      }
    }

    // Tier 3: Followed by Operational Parenthetical or Connectives
    // e.g. "Ahmed Singh (phone 9350305641)", "Farhan (alias...", "Sunita Reddy in Lucknow"
    const patternRegex = /\b([A-Za-z]{2,15}(?:\s+[A-Za-z]{2,15}){0,2})\s*(?:\((?:alias|phone|driving|residence|age)|(?:\s+in\s+[A-Z][a-z]+)|\s+with\s+vehicle)/gi;
    while ((match = patternRegex.exec(text)) !== null) {
      const cleaned = this.cleanPersonName(match[1]);
      if (this.isValidPerson(cleaned, entities.organizations, true)) {
        extractedPersons.add(cleaned);
      }
    }

    // Tier 4: Open-Vocabulary 2-Word Proper Noun matching (e.g. Alex Walker, Vikram Malhotra, John Smith, Kunal Khan)
    const properNounRegex = /\b([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b/g;
    while ((match = properNounRegex.exec(text)) !== null) {
      const cand = this.cleanPersonName(match[1]);
      if (this.isValidPerson(cand, entities.organizations, false)) {
        extractedPersons.add(cand);
      }
    }

    // Deduplicate substrings (e.g., if 'Rajesh Rao' and 'Rajesh' both exist, keep the full 'Rajesh Rao')
    const finalPersons = new Set();
    const sortedCand = Array.from(extractedPersons).sort((a, b) => b.length - a.length);
    for (const p of sortedCand) {
      let isSubsumed = false;
      for (const existing of finalPersons) {
        if (existing !== p && existing.toLowerCase().includes(p.toLowerCase())) {
          isSubsumed = true;
          break;
        }
      }
      if (!isSubsumed) {
        finalPersons.add(p);
      }
    }

    entities.persons = finalPersons;

    this.extractedEntities = {
      persons: Array.from(entities.persons),
      organizations: Array.from(entities.organizations),
      phones: Array.from(entities.phones),
      vehicles: Array.from(entities.vehicles),
      bankAccounts: Array.from(entities.bankAccounts),
      sections: Array.from(entities.sections),
      cities: Array.from(entities.cities),
      amounts: Array.from(entities.amounts),
      firs: Array.from(entities.firs)
    };

    return this.extractedEntities;
  }

  /**
   * Connects to FastAPI Backend /api/nlp/classify to get real-time ML statute predictions
   * and merges backend extracted entities into the active visual board.
   */
  async fetchBackendStatuteClassification(text) {
    if (!text || text.trim().length < 5) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/nlp/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_text: text })
      });
      if (res.ok) {
        const data = await res.json();
        this.aiStatuteData = data;
        this.updateStatuteBadge();

        // Merge backend entities seamlessly
        if (data.extracted_entities && data.extracted_entities.persons) {
          let updated = false;
          data.extracted_entities.persons.forEach(p => {
            if (!this.extractedEntities.persons.some(existing => existing.toLowerCase() === p.toLowerCase())) {
              this.extractedEntities.persons.push(p);
              updated = true;
            }
          });
          if (updated) {
            this.updateEntityBoard();
          }
        }
      }
    } catch (err) {
      console.warn("Backend NLP endpoint offline or unreachable:", err);
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="nlp-workspace">
        <!-- Sample Cable Picker & Action Bar -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('cpu', 'text-cyan', 18)}</span> AI INTELLIGENCE & POLICE REPORT NER ANALYZER
            </div>
            <div class="cable-selector-bar">
              <span class="text-xs text-muted">Preloaded Intel:</span>
              ${SAMPLE_POLICE_CABLES.map((c, i) => `
                <button class="btn-cable ${this.currentText === c.text ? 'active' : ''}" onclick="window.nlpEngineInstance.loadCable(${i})">
                  ${c.title}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="nlp-split-grid">
            <!-- Unstructured Input Column -->
            <div class="nlp-input-col">
              <div class="nlp-box-header">
                <span>${window.renderSvgIcon('fileText', 'text-cyan', 16)} RAW UNSTRUCTURED INTELLIGENCE REPORT / FIR</span>
                <button class="btn btn-sm btn-cyan" onclick="window.nlpEngineInstance.runExtraction()">
                  ${window.renderSvgIcon('zap', '', 14)} Run AI Entity Extraction
                </button>
              </div>
              <textarea id="nlpRawInput" class="nlp-textarea" rows="15" placeholder="Paste or type police FIR transcript, intelligence cable, or interrogation diary...">${this.currentText}</textarea>
              <div class="nlp-input-footer">
                <span class="text-muted text-xs">Dynamic Real-Time NER: Type or edit any name to extract instantly.</span>
                <button class="btn btn-xs btn-outline-secondary" onclick="window.nlpEngineInstance.clearInput()">Clear</button>
              </div>
            </div>

            <!-- Extracted Entity Visualizer Column -->
            <div class="nlp-output-col">
              <div class="nlp-box-header">
                <span id="nlpTotalCountTitle">${window.renderSvgIcon('target', 'text-emerald', 16)} EXTRACTED ENTITIES (${this.getTotalEntitiesCount()} DETECTED)</span>
                <button class="btn btn-sm btn-emerald" onclick="window.nlpEngineInstance.ingestToLiveGraph()">
                  ${window.renderSvgIcon('plus', '', 14)} Ingest & Link in Active Graph
                </button>
              </div>

              <!-- AI Statute Prediction Strip -->
              <div id="aiStatuteStrip">
                ${this.renderStatuteStripHtml()}
              </div>

              <!-- Entity Display Board -->
              <div id="nlpEntityBoard" class="entity-display-board">
                ${this.renderEntityCategoriesHtml()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach real-time debounced input listener for instant extraction as user edits
    const textarea = document.getElementById('nlpRawInput');
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.currentText = textarea.value;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.extractEntities(this.currentText);
          this.updateEntityBoard();
          this.fetchBackendStatuteClassification(this.currentText);
        }, 250);
      });
    }
  }

  getTotalEntitiesCount() {
    const e = this.extractedEntities || {};
    return (e.persons?.length || 0) + (e.organizations?.length || 0) + 
      (e.phones?.length || 0) + (e.vehicles?.length || 0) + (e.bankAccounts?.length || 0) + 
      (e.sections?.length || 0) + (e.cities?.length || 0);
  }

  renderStatuteStripHtml() {
    if (!this.aiStatuteData) {
      return `<div class="ai-statute-badge">
        <span class="text-cyan">${window.renderSvgIcon('cpu', '', 14)}</span>
        <span>AI STATUTE ANALYZER: Ready for intelligence input</span>
      </div>`;
    }
    const d = this.aiStatuteData;
    const isHigh = d.threat_level === "HIGH";
    return `<div class="ai-statute-badge">
      <span class="text-cyan">${window.renderSvgIcon('shieldAlert', isHigh ? 'text-danger' : 'text-amber', 14)}</span>
      <span><strong>AI CLASSIFICATION:</strong> ${d.predicted_statute} (${Math.round((d.confidence || 0.85) * 100)}% CONFIDENCE)</span>
      <span class="badge ${isHigh ? 'badge-danger' : 'badge-amber'} text-xs font-bold">${d.threat_level} PRIORITY</span>
    </div>`;
  }

  updateStatuteBadge() {
    const strip = document.getElementById('aiStatuteStrip');
    if (strip) {
      strip.innerHTML = this.renderStatuteStripHtml();
    }
  }

  renderEntityCategoriesHtml() {
    const e = this.extractedEntities || {};
    const engine = window.crimeDataEngine;

    return `
      <!-- Persons -->
      <div class="entity-category">
        <div class="category-title text-cyan">${window.renderSvgIcon('user', '', 14)} PERSONS IDENTIFIED (${e.persons?.length || 0})</div>
        <div class="category-tags">
          ${(e.persons || []).map(p => {
            const personObj = engine?.persons.find(x => x.name.toLowerCase() === p.toLowerCase());
            const isAbs = personObj && personObj.statusFlags.includes('ABSCONDING');
            if (personObj) {
              return `<span class="ner-tag tag-person ${isAbs ? 'tag-alert' : ''}" title="View police dossier for ${p}" onclick="window.showDossierModal('${personObj.person_id}')">
                ${window.renderSvgIcon('user', '', 12)} ${p} (${personObj.person_id}) ${isAbs ? `<span class="text-danger font-bold">${window.renderSvgIcon('alertTriangle', '', 12)} ABSCONDING</span>` : ''}
              </span>`;
            } else {
              return `<span class="ner-tag tag-person tag-new-subject" title="Newly identified entity from FIR text" onclick="window.showTacticalNotification('Subject [${p}] extracted from FIR narrative. Unregistered in database — logged as tactical lead.')">
                ${window.renderSvgIcon('user', '', 12)} ${p} <span class="badge-new-subject">NEW LEAD</span>
              </span>`;
            }
          }).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>

      <!-- Organizations -->
      <div class="entity-category">
        <div class="category-title text-purple">${window.renderSvgIcon('building', '', 14)} ORGANIZATIONS & ENTITIES (${e.organizations?.length || 0})</div>
        <div class="category-tags">
          ${(e.organizations || []).map(o => `<span class="ner-tag tag-org">${window.renderSvgIcon('building', '', 12)} ${o}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>

      <!-- Vehicles -->
      <div class="entity-category">
        <div class="category-title text-amber">${window.renderSvgIcon('car', '', 14)} VEHICLE REGISTRATIONS (${e.vehicles?.length || 0})</div>
        <div class="category-tags">
          ${(e.vehicles || []).map(v => `<span class="ner-tag tag-vehicle font-mono">${window.renderSvgIcon('car', '', 12)} ${v}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>

      <!-- Phone Numbers -->
      <div class="entity-category">
        <div class="category-title text-emerald">${window.renderSvgIcon('phone', '', 14)} TELECOM INTERCEPT NUMBERS (${e.phones?.length || 0})</div>
        <div class="category-tags">
          ${(e.phones || []).map(ph => `<span class="ner-tag tag-phone font-mono">${window.renderSvgIcon('phone', '', 12)} ${ph}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>

      <!-- Bank Accounts -->
      <div class="entity-category">
        <div class="category-title text-danger">${window.renderSvgIcon('bank', '', 14)} FINANCIAL / BANK ACCOUNTS (${e.bankAccounts?.length || 0})</div>
        <div class="category-tags">
          ${(e.bankAccounts || []).map(acc => `<span class="ner-tag tag-acc font-mono">${window.renderSvgIcon('bank', '', 12)} ${acc}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>

      <!-- Legal Sections & FIRs -->
      <div class="entity-category">
        <div class="category-title text-danger">${window.renderSvgIcon('scale', '', 14)} STATUTORY SECTIONS & FIRS (${(e.sections?.length || 0) + (e.firs?.length || 0)})</div>
        <div class="category-tags">
          ${(e.firs || []).map(f => `<span class="ner-tag tag-fir font-mono">${window.renderSvgIcon('fileText', '', 12)} ${f}</span>`).join('')}
          ${(e.sections || []).map(s => `<span class="ner-tag tag-sec">${window.renderSvgIcon('scale', '', 12)} ${s}</span>`).join('')}
          ${(!e.sections?.length && !e.firs?.length) ? '<span class="text-muted text-xs">None detected</span>' : ''}
        </div>
      </div>

      <!-- Cities & Transit Locations -->
      <div class="entity-category">
        <div class="category-title text-cyan">${window.renderSvgIcon('mapPin', '', 14)} TRANSIT HUBS & LOCATIONS (${e.cities?.length || 0})</div>
        <div class="category-tags">
          ${(e.cities || []).map(c => `<span class="ner-tag tag-city">${window.renderSvgIcon('mapPin', '', 12)} ${c}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
        </div>
      </div>
    `;
  }

  updateEntityBoard() {
    const board = document.getElementById('nlpEntityBoard');
    if (board) {
      board.innerHTML = this.renderEntityCategoriesHtml();
    }
    const countTitle = document.getElementById('nlpTotalCountTitle');
    if (countTitle) {
      countTitle.innerHTML = `${window.renderSvgIcon('target', 'text-emerald', 16)} EXTRACTED ENTITIES (${this.getTotalEntitiesCount()} DETECTED)`;
    }
  }

  loadCable(idx) {
    const cable = SAMPLE_POLICE_CABLES[idx];
    if (cable) {
      this.currentText = cable.text;
      const textarea = document.getElementById('nlpRawInput');
      if (textarea) textarea.value = this.currentText;
      
      // Update cable active button styles
      const buttons = document.querySelectorAll('.cable-selector-bar .btn-cable');
      buttons.forEach((btn, i) => {
        if (i === idx) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      this.extractEntities(this.currentText);
      this.updateEntityBoard();
      this.fetchBackendStatuteClassification(this.currentText);
    }
  }

  clearInput() {
    const textarea = document.getElementById('nlpRawInput');
    if (textarea) textarea.value = '';
    this.currentText = '';
    this.extractEntities('');
    this.updateEntityBoard();
  }

  runExtraction() {
    const textarea = document.getElementById('nlpRawInput');
    if (textarea) {
      this.currentText = textarea.value;
      this.extractEntities(this.currentText);
      this.updateEntityBoard();
      this.fetchBackendStatuteClassification(this.currentText);
      const newCount = this.extractedEntities.persons.filter(p => !window.crimeDataEngine?.persons.some(k => k.name.toLowerCase() === p.toLowerCase())).length;
      const newMsg = newCount > 0 ? ` (${newCount} new subject leads identified)` : '';
      window.showTacticalNotification(`AI NLP Extracted ${this.extractedEntities.persons.length} suspects${newMsg}, ${this.extractedEntities.vehicles.length} vehicles, ${this.extractedEntities.bankAccounts.length} bank accounts.`);
    }
  }

  ingestToLiveGraph() {
    if (!this.extractedEntities) return;
    const e = this.extractedEntities;

    // Switch to link analysis graph tab
    const graphTab = document.querySelector('[data-tab="graph"]');
    if (graphTab) graphTab.click();

    setTimeout(() => {
      if (e.persons.length > 0 && window.graphInstance) {
        const pName = e.persons[0];
        const suspect = window.crimeDataEngine?.persons.find(p => p.name.toLowerCase() === pName.toLowerCase());
        if (suspect) {
          const node = window.graphInstance.nodeMap.get(suspect.person_id);
          if (node) {
            window.graphInstance.selectedNode = node;
            window.graphInstance.camera.x = window.graphInstance.width / 2 - node.x;
            window.graphInstance.camera.y = window.graphInstance.height / 2 - node.y;
            window.graphInstance.camera.zoom = 1.5;
            if (window.onGraphNodeSelected) window.onGraphNodeSelected(node);
          }
        }
      }
      window.showTacticalNotification(`Extracted Intelligence (${e.persons.length} subjects) connected to Active Link Analysis Graph.`);
    }, 250);
  }
}

window.NLPEngine = NLPEngine;
