/**
 * DRISHTI-CRIMENEXUS AI / NLP INTELLIGENCE EXTRACTOR
 * Named Entity Recognition (NER) and relationship extractor for unstructured
 * police reports, FIR transcripts, and informant field cables.
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

class NLPEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentText = SAMPLE_POLICE_CABLES[0].text;
    this.extractedEntities = null;
    this.init();
  }

  init() {
    this.extractEntities(this.currentText);
    this.render();
  }

  extractEntities(text) {
    const engine = window.crimeDataEngine;
    const knownNames = engine.persons.map(p => p.name);
    const knownPhones = engine.persons.map(p => p.phone).filter(Boolean);
    const knownVehicles = engine.persons.map(p => p.vehicle_no).filter(Boolean);
    const knownOrgs = engine.organizations.map(o => o.name);

    // Entity Buckets
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

    // 1. Regex Matchers
    // Phone numbers: 10 digits starting 9, 8, 7
    const phoneRegex = /\b[789]\d{9}\b/g;
    let match;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.phones.add(match[0]);
    }

    // Vehicle numbers (Indian format e.g. MH1265AD6967, MH12 65 AD 6967, PB1010CG6574)
    const vehicleRegex = /\b[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}\b/g;
    while ((match = vehicleRegex.exec(text)) !== null) {
      entities.vehicles.add(match[0].replace(/\s+/g, ''));
    }

    // Bank Accounts (e.g. Axis-203577948775, ICICI-273665994394, Bank of Baroda-334013073383)
    const bankRegex = /\b(Axis|ICICI|SBI|HDFC|PNB|Bank of Baroda)-[0-9]{12}\b/g;
    while ((match = bankRegex.exec(text)) !== null) {
      entities.bankAccounts.add(match[0]);
    }

    // Legal Sections: IPC, NDPS, PMLA
    const secRegex = /\b(IPC\s+\d+[A-Z]?|NDPS(\s+Act)?(\s+Sec\s+\d+(\/\d+)?)?|PMLA(\s+Sec\s+\d+)?)\b/gi;
    while ((match = secRegex.exec(text)) !== null) {
      entities.sections.add(match[0]);
    }

    // FIR Numbers (e.g. FIR-908, FIR-537)
    const firRegex = /\bFIR-\d{3,4}\b/g;
    while ((match = firRegex.exec(text)) !== null) {
      entities.firs.add(match[0]);
    }

    // Currency Amounts: ₹xx,xxx or Rs. xx,xxx
    const amtRegex = /[₹Rs\.]+\s?[\d,]+/g;
    while ((match = amtRegex.exec(text)) !== null) {
      entities.amounts.add(match[0]);
    }

    // Indian Cities
    const cityList = ["Mumbai", "Pune", "Nagpur", "Delhi", "Bengaluru", "Surat", "Lucknow", "Hyderabad"];
    cityList.forEach(city => {
      if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
        entities.cities.add(city);
      }
    });

    // Known Persons
    knownNames.forEach(name => {
      if (text.toLowerCase().includes(name.toLowerCase())) {
        entities.persons.add(name);
      }
    });

    // Known Organizations
    knownOrgs.forEach(org => {
      if (text.toLowerCase().includes(org.toLowerCase())) {
        entities.organizations.add(org);
      }
    });

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

  render() {
    if (!this.container) return;
    const e = this.extractedEntities || {};

    const totalExtracted = (e.persons?.length || 0) + (e.organizations?.length || 0) + 
      (e.phones?.length || 0) + (e.vehicles?.length || 0) + (e.bankAccounts?.length || 0) + 
      (e.sections?.length || 0) + (e.cities?.length || 0);

    this.container.innerHTML = `
      <div class="nlp-workspace">
        <!-- Sample Cable Picker & Action Bar -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">🤖</span> AI INTELLIGENCE & POLICE REPORT NER ANALYZER
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
                <span>📝 RAW UNSTRUCTURED INTELLIGENCE REPORT / FIR</span>
                <button class="btn btn-sm btn-cyan" onclick="window.nlpEngineInstance.runExtraction()">
                  ⚡ Run AI Entity Extraction
                </button>
              </div>
              <textarea id="nlpRawInput" class="nlp-textarea" rows="14">${this.currentText}</textarea>
              <div class="nlp-input-footer">
                <span class="text-muted text-xs">Supports: Names, Vehicles, SIMs, Accounts, FIRs, IPC/NDPS Sections, Cities.</span>
                <button class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('nlpRawInput').value='';">Clear</button>
              </div>
            </div>

            <!-- Extracted Entity Visualizer -->
            <div class="nlp-output-col">
              <div class="nlp-box-header">
                <span>🎯 EXTRACTED ENTITIES (${totalExtracted} DETECTED)</span>
                <button class="btn btn-sm btn-emerald" onclick="window.nlpEngineInstance.ingestToLiveGraph()">
                  ➕ Ingest & Link in Active Graph
                </button>
              </div>

              <div class="entity-display-board">
                <!-- Persons -->
                <div class="entity-category">
                  <div class="category-title text-cyan">👤 PERSONS IDENTIFIED (${e.persons?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.persons || []).map(p => {
                      const personObj = window.crimeDataEngine.persons.find(x => x.name.toLowerCase() === p.toLowerCase());
                      const isAbs = personObj && personObj.statusFlags.includes('ABSCONDING');
                      return `<span class="ner-tag tag-person ${isAbs ? 'tag-alert' : ''}" onclick="window.showDossierModal('${personObj?.person_id || ''}')">
                        ${p} ${personObj ? `(${personObj.person_id})` : ''} ${isAbs ? '⚠️ ABSCONDING' : ''}
                      </span>`;
                    }).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>

                <!-- Organizations -->
                <div class="entity-category">
                  <div class="category-title text-purple">🏢 ORGANIZATIONS (${e.organizations?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.organizations || []).map(o => `<span class="ner-tag tag-org">${o}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>

                <!-- Vehicles -->
                <div class="entity-category">
                  <div class="category-title text-amber">🚗 VEHICLE NUMBERS (${e.vehicles?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.vehicles || []).map(v => `<span class="ner-tag tag-vehicle font-mono">${v}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>

                <!-- Phone Numbers -->
                <div class="entity-category">
                  <div class="category-title text-emerald">📞 TELECOM SIM / NUMBERS (${e.phones?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.phones || []).map(ph => `<span class="ner-tag tag-phone font-mono">${ph}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>

                <!-- Bank Accounts -->
                <div class="entity-category">
                  <div class="category-title text-danger">🏦 FINANCIAL / BANK ACCOUNTS (${e.bankAccounts?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.bankAccounts || []).map(acc => `<span class="ner-tag tag-acc font-mono">${acc}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>

                <!-- Legal Sections & FIRs -->
                <div class="entity-category">
                  <div class="category-title text-danger">⚖️ LEGAL SECTIONS & CHARGES (${(e.sections?.length || 0) + (e.firs?.length || 0)})</div>
                  <div class="category-tags">
                    ${(e.firs || []).map(f => `<span class="ner-tag tag-fir">${f}</span>`).join('')}
                    ${(e.sections || []).map(s => `<span class="ner-tag tag-sec">${s}</span>`).join('')}
                    ${(!e.sections?.length && !e.firs?.length) ? '<span class="text-muted text-xs">None detected</span>' : ''}
                  </div>
                </div>

                <!-- Cities & Locations -->
                <div class="entity-category">
                  <div class="category-title text-cyan">📍 LOCATIONS & HUBS (${e.cities?.length || 0})</div>
                  <div class="category-tags">
                    ${(e.cities || []).map(c => `<span class="ner-tag tag-city">${c}</span>`).join('') || '<span class="text-muted text-xs">None detected</span>'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadCable(idx) {
    const cable = SAMPLE_POLICE_CABLES[idx];
    if (cable) {
      this.currentText = cable.text;
      this.extractEntities(this.currentText);
      this.render();
    }
  }

  runExtraction() {
    const textarea = document.getElementById('nlpRawInput');
    if (textarea) {
      this.currentText = textarea.value;
      this.extractEntities(this.currentText);
      this.render();
      window.showTacticalNotification(`AI NLP Extracted ${this.extractedEntities.persons.length} suspects, ${this.extractedEntities.vehicles.length} vehicles, ${this.extractedEntities.bankAccounts.length} bank accounts.`);
    }
  }

  ingestToLiveGraph() {
    if (!this.extractedEntities) return;
    const e = this.extractedEntities;

    // Switch to graph tab and highlight involved persons
    const graphTab = document.querySelector('[data-tab="graph"]');
    if (graphTab) graphTab.click();

    // If graph instance exists, highlight the first found person
    setTimeout(() => {
      if (e.persons.length > 0 && window.graphInstance) {
        const pName = e.persons[0];
        const suspect = window.crimeDataEngine.persons.find(p => p.name.toLowerCase() === pName.toLowerCase());
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
      window.showTacticalNotification("✨ Extracted Intelligence Cable linked with Active Tactical Graph!");
    }, 200);
  }
}

window.NLPEngine = NLPEngine;
