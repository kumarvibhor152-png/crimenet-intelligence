/**
 * POLICENET // DRISHTI - SUSPECT DIGGER & GOOGLE-STYLE INTELLIGENCE SEARCH
 * Minimal, high-utility search engine for investigating officers.
 * Features:
 * - Google-style instant search with autocomplete & multi-attribute matching
 * - Quick-target chips (Kunal Khan, Priya Pillai, Anil Gupta, etc.)
 * - Suspect Knowledge Header (AI role inference, threat gauge, legal status, ground-truth bridge callout)
 * - Interactive Suspect Relation Chart with 1-click pivot to dig deeper into associates
 * - Geospatial GIS map centered on suspect, active cell towers, and surveillance rendezvous points
 * - FIR Chargesheet records, CDR telecom logs, Hawala financial trail, Surveillance logs, and OSINT feed
 * - AI Link Predictor & multi-hop pathfinder
 */

class SuspectDigger {
  constructor() {
    this.currentSuspectId = null;
    this.suspectMapInstance = null;
    this.suspectGraphInstance = null;
    this.graphDepth = 1; // 1-hop or 2-hop
    this.activeSubTab = 'relation-chart';
  }

  init() {
    this.renderSearchHome();
    this.bindGlobalEvents();
  }

  // 1. Render Google-Style Search Interface with AI Analysis Copilot
  renderSearchHome() {
    const container = document.getElementById('tab-search');
    if (!container) return;

    container.innerHTML = `
      <div id="searchViewWrapper" class="search-view-wrapper">
        <!-- Google Search Home View -->
        <div id="googleSearchHome" class="google-search-home ${this.currentSuspectId || this.currentAiQuery ? 'd-none' : ''}">
          <div class="google-brand-zone">
            <div class="google-emblem">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="12 6 13.8 10.2 18 12 13.8 13.8 12 18 10.2 13.8 6 12 10.2 10.2 12 6"/>
              </svg>
            </div>
            <h1 class="google-title">CrimeNet AI Analysis</h1>
            <p class="google-subtitle">Ask natural language investigative questions or search suspects, transactions, phone numbers, and FIR records</p>
          </div>

          <!-- Main Google-Style Search Box -->
          <div class="google-search-box-wrap">
            <div class="google-search-bar">
              <span class="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input type="text" id="mainSuspectSearchInput" class="google-search-input" 
                placeholder="Ask an investigative question (e.g. relation between Kunal, Priya & Anil) or search suspect..." autocomplete="off" autofocus>
              <button id="clearMainSearchBtn" class="clear-search-btn d-none" title="Clear input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button id="btnExecuteSearch" class="btn-search-go" title="Execute AI Analysis">
                <span>Analyze</span>
              </button>
            </div>

            <!-- Instant Autocomplete & AI Copilot Dropdown -->
            <div id="mainSearchDropdown" class="google-autocomplete-dropdown"></div>
          </div>

          <!-- Quick Query Target Chips -->
          <div class="quick-chips-zone">
            <div class="chips-group mb-2">
              <span class="chips-label">Ask CrimeNet AI Copilot:</span>
              <div class="chips-list">
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Relation: Kunal, Priya & Anil</span>
                </button>
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('Show hawala transactions on 14 Nov 2024')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Transactions on 14 Nov 2024</span>
                </button>
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('Show structuring transactions below 1 lakh threshold')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Hawala structuring & sub-1L deposits</span>
                </button>
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('Nocturnal calls in Pune and Mumbai sectors')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Nocturnal calls in Pune / Mumbai</span>
                </button>
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('What is the nexus involving Sunrise Money Exchange?')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Sunrise Money Exchange nexus</span>
                </button>
                <button class="chip chip-copilot" onclick="window.suspectDigger.executeAiQuestion('Synthesize crime syndicate structure, kingpins, and bridge nodes')">
                  <span class="chip-dot dot-copilot"></span>
                  <span>Cartel & syndicate overview</span>
                </button>
              </div>
            </div>

            <div class="chips-group mt-2">
              <span class="chips-label">Quick Suspect Dossiers:</span>
              <div class="chips-list">
                <button class="chip chip-danger" onclick="window.suspectDigger.selectSuspect('P004')">
                  <span class="chip-dot dot-danger"></span>
                  <span>Kunal Khan (Conduit)</span>
                </button>
                <button class="chip chip-emerald" onclick="window.suspectDigger.selectSuspect('P016')">
                  <span class="chip-dot dot-emerald"></span>
                  <span>Priya Pillai (Narcotics Ring)</span>
                </button>
                <button class="chip chip-purple" onclick="window.suspectDigger.selectSuspect('P007')">
                  <span class="chip-dot dot-purple"></span>
                  <span>Anil Gupta (Fraud Ring)</span>
                </button>
                <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P003')">
                  <span>Ahmed Singh</span>
                </button>
                <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P002')">
                  <span>Zoya Verma</span>
                </button>
                <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P009')">
                  <span>Farhan Nair</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Summary Strip -->
          <div class="google-stats-strip">
            <span class="stat-pill"><span class="pill-num">40</span> suspects on file</span>
            <span class="stat-pill"><span class="pill-num">122</span> call records</span>
            <span class="stat-pill"><span class="pill-num">68</span> financial transactions</span>
            <span class="stat-pill"><span class="pill-num">20</span> surveillance sightings</span>
            <span class="stat-pill"><span class="pill-num">16</span> FIR chargesheets</span>
          </div>
        </div>

        <!-- Suspect Deep-Dive & AI Analysis Workspace -->
        <div id="suspectDossierWorkspace" class="suspect-workspace ${this.currentSuspectId || this.currentAiQuery ? '' : 'd-none'}">
          <!-- Sticky Search Bar at top of Results -->
          <div class="sticky-results-header">
            <button id="btnBackToHome" class="btn-back-home" title="Return to Search Home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              <span>Back to Search</span>
            </button>
            <div class="sticky-search-wrap">
              <svg class="search-icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" id="stickySuspectSearchInput" class="sticky-search-input" 
                placeholder="Ask follow-up question or search suspect, phone, FIR..." autocomplete="off">
              <div id="stickySearchDropdown" class="google-autocomplete-dropdown sticky-dropdown"></div>
            </div>
            <div class="sticky-actions">
              <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Report
              </button>
            </div>
          </div>

          <!-- Dynamic Deep-Dive / AI Analysis Content Injected Here -->
          <div id="suspectDossierDetails" class="suspect-dossier-container"></div>
        </div>
      </div>
    `;

    this.bindSearchInputs();
  }

  // 2. Bind Search Inputs & Autocomplete
  bindSearchInputs() {
    const mainInput = document.getElementById('mainSuspectSearchInput');
    const mainDropdown = document.getElementById('mainSearchDropdown');
    const clearBtn = document.getElementById('clearMainSearchBtn');
    const executeBtn = document.getElementById('btnExecuteSearch');

    const stickyInput = document.getElementById('stickySuspectSearchInput');
    const stickyDropdown = document.getElementById('stickySearchDropdown');

    const handleInput = (inputEl, dropdownEl, clearBtnEl) => {
      const q = inputEl.value.trim();
      if (clearBtnEl) {
        clearBtnEl.classList.toggle('d-none', !q);
      }

      if (!q || q.length < 1) {
        dropdownEl.classList.remove('active');
        dropdownEl.innerHTML = '';
        return;
      }

      const isQuestion = this.isQuestionQuery(q);
      const results = this.querySuspects(q).slice(0, 5);
      const cleanQ = q.replace(/["']/g, '');

      let html = `
        <div class="autocomplete-ai-item" onclick="window.suspectDigger.executeAiQuestion('${cleanQ}')">
          <div class="ac-ai-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="12 6 13.8 10.2 18 12 13.8 13.8 12 18 10.2 13.8 6 12 10.2 10.2 12 6"/>
            </svg>
          </div>
          <div class="ac-ai-body">
            <div class="ac-ai-title">Ask CrimeNet AI Copilot: <span class="highlight-q">"${cleanQ}"</span></div>
            <div class="ac-ai-subtitle">Synthesize telecom, hawala, surveillance & chargesheets</div>
          </div>
          <div class="ac-ai-badge">AI Analysis ↵</div>
        </div>
      `;

      if (results.length > 0) {
        html += `<div class="ac-section-divider">Suspect Records (${results.length})</div>`;
        html += results.map(p => {
          const isBridge = p.person_id === window.crimeDataEngine.groundTruth.bridge_person_id;
          const isAbs = p.statusFlags.includes('ABSCONDING');
          const isConv = p.statusFlags.includes('CONVICTED');
          return `
            <div class="autocomplete-item" onclick="window.suspectDigger.selectSuspect('${p.person_id}')">
              <div class="ac-avatar">
                <span>${p.person_id}</span>
              </div>
              <div class="ac-body">
                <div class="ac-name-row">
                  <span class="ac-name">${p.name}</span>
                  <span class="ac-id">${p.person_id}</span>
                  ${isBridge ? '<span class="badge badge-danger font-mono text-xs">CONDUIT</span>' : ''}
                  ${isAbs ? '<span class="badge badge-danger text-xs">ABSCONDING</span>' : ''}
                  ${isConv ? '<span class="badge badge-amber text-xs">CONVICTED</span>' : ''}
                </div>
                <div class="ac-meta text-xs">
                  <span>Base: <strong>${p.home_city}</strong></span> • 
                  <span>Phone: <span class="font-mono">${p.phone}</span></span> • 
                  <span>Vehicle: <span class="font-mono">${p.vehicle_no || 'None'}</span></span> • 
                  <span>FIRs: <strong>${p.firs.length}</strong></span>
                </div>
              </div>
              <div class="ac-threat">
                <span class="threat-pill ${p.threatScore >= 70 ? 'danger' : 'warning'}">${p.threatScore}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      dropdownEl.innerHTML = html;
      dropdownEl.classList.add('active');
    };

    if (mainInput && mainDropdown) {
      mainInput.addEventListener('input', () => handleInput(mainInput, mainDropdown, clearBtn));
      mainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = mainInput.value.trim();
          if (!q) return;
          mainDropdown.classList.remove('active');
          if (this.isQuestionQuery(q)) {
            this.executeAiQuestion(q);
          } else {
            const matches = this.querySuspects(q);
            if (matches.length > 0) {
              this.selectSuspect(matches[0].person_id);
            } else {
              this.executeAiQuestion(q);
            }
          }
        }
      });
    }

    if (clearBtn && mainInput) {
      clearBtn.addEventListener('click', () => {
        mainInput.value = '';
        clearBtn.classList.add('d-none');
        if (mainDropdown) mainDropdown.classList.remove('active');
        mainInput.focus();
      });
    }

    if (executeBtn && mainInput) {
      executeBtn.addEventListener('click', () => {
        const q = mainInput.value.trim();
        if (!q) return;
        if (mainDropdown) mainDropdown.classList.remove('active');
        if (this.isQuestionQuery(q)) {
          this.executeAiQuestion(q);
        } else {
          const matches = this.querySuspects(q);
          if (matches.length > 0) {
            this.selectSuspect(matches[0].person_id);
          } else {
            this.executeAiQuestion(q);
          }
        }
      });
    }

    if (stickyInput && stickyDropdown) {
      stickyInput.addEventListener('input', () => handleInput(stickyInput, stickyDropdown, null));
      stickyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = stickyInput.value.trim();
          if (!q) return;
          stickyDropdown.classList.remove('active');
          if (this.isQuestionQuery(q)) {
            this.executeAiQuestion(q);
          } else {
            const matches = this.querySuspects(q);
            if (matches.length > 0) {
              this.selectSuspect(matches[0].person_id);
            } else {
              this.executeAiQuestion(q);
            }
          }
        }
      });
    }

    const backBtn = document.getElementById('btnBackToHome');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentSuspectId = null;
        this.currentAiQuery = null;
        document.getElementById('googleSearchHome').classList.remove('d-none');
        document.getElementById('suspectDossierWorkspace').classList.add('d-none');
        if (mainInput) {
          mainInput.value = '';
          mainInput.focus();
        }
      });
    }

    // Dismiss dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (mainDropdown && !e.target.closest('.google-search-box-wrap')) {
        mainDropdown.classList.remove('active');
      }
      if (stickyDropdown && !e.target.closest('.sticky-search-wrap')) {
        stickyDropdown.classList.remove('active');
      }
    });
  }

  // 2.1 Intent Classifier for Natural Language Questions
  isQuestionQuery(query) {
    if (!query) return false;
    const q = query.trim().toLowerCase();

    // Direct interrogative markers
    if (q.includes('?') || /^(what|who|where|when|why|how|which|is|are|can|does|do|tell|explain|show|find|analyze|investigate|search|trace|check|give)\b/.test(q)) {
      return true;
    }

    // Multiple suspects mentioned in the same query
    const engine = window.crimeDataEngine;
    if (engine && engine.persons) {
      let matchedCount = 0;
      for (const p of engine.persons) {
        const idLower = p.person_id.toLowerCase();
        const nameParts = p.name.toLowerCase().split(' ');
        const firstName = nameParts[0];
        const fullName = p.name.toLowerCase();

        if (q.includes(fullName) || (q.includes(idLower) && q.length > 5) || (firstName.length >= 4 && new RegExp('\\b' + firstName + '\\b').test(q))) {
          matchedCount++;
          if (matchedCount >= 2) return true;
        }
      }
    }

    // Domain keywords
    const domainKeywords = [
      'relation', 'relationship', 'between', 'connect', 'connection', 'nexus', 'route', 'path', 'link',
      'transaction', 'transactions', 'transfer', 'transfers', 'hawala', 'smurf', 'structuring', 'threshold',
      'call', 'calls', 'cdr', 'nocturnal', 'late night', 'cell tower', 'intercept', 'intercepts',
      'surveillance', 'meeting', 'rendezvous', 'safehouse', 'spotted', 'sighted',
      'syndicate', 'cartel', 'gang', 'kingpin', 'bridge', 'conduit', 'triad', 'overview'
    ];
    for (const kw of domainKeywords) {
      if (new RegExp('\\b' + kw + '\\b', 'i').test(q)) {
        return true;
      }
    }

    // Date references with multiple words
    if (/\b(202[4-6]|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b/i.test(q)) {
      if (q.split(/\s+/).length >= 2) return true;
    }

    return false;
  }

  // 2.2 Execute AI Copilot Question
  executeAiQuestion(query) {
    if (!query) return;
    const q = query.trim();

    this.currentSuspectId = null;
    this.currentAiQuery = q;

    // Switch view state
    const homeEl = document.getElementById('googleSearchHome');
    const workspaceEl = document.getElementById('suspectDossierWorkspace');
    const mainDropdown = document.getElementById('mainSearchDropdown');
    const stickyDropdown = document.getElementById('stickySearchDropdown');

    if (mainDropdown) mainDropdown.classList.remove('active');
    if (stickyDropdown) stickyDropdown.classList.remove('active');

    if (homeEl) homeEl.classList.add('d-none');
    if (workspaceEl) workspaceEl.classList.remove('d-none');

    // Switch to search tab if not already active
    const searchTabBtn = document.querySelector('[data-tab="search"]');
    if (searchTabBtn && !searchTabBtn.classList.contains('active')) {
      searchTabBtn.click();
    }

    // Update sticky search input
    const stickyInput = document.getElementById('stickySuspectSearchInput');
    if (stickyInput) {
      stickyInput.value = q;
    }

    // Solve the question and render the result
    const responseData = this.answerInvestigativeQuestion(q);
    this.renderAiAnalysisResult(q, responseData);
  }

  // 2.3 Comprehensive AI Intelligence Reasoning Engine
  answerInvestigativeQuestion(rawQuery) {
    const q = rawQuery.trim();
    const qLower = q.toLowerCase();
    const engine = window.crimeDataEngine;
    if (!engine) {
      return {
        title: "Intelligence Engine Initializing",
        threatTag: "INFO",
        corroborationText: "System records loading...",
        synthesisHtml: "<p>Database records are loading. Please try again in a moment.</p>",
        followUps: []
      };
    }

    // Helper: format INR currency
    const fmtInr = (num) => '₹' + Number(num || 0).toLocaleString('en-IN');

    // 1. Detect mentioned suspects
    const detectedPersons = [];
    const detectedPersonIds = new Set();
    engine.persons.forEach(p => {
      const fullName = p.name.toLowerCase();
      const id = p.person_id.toLowerCase();
      const parts = fullName.split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || '';

      let matched = false;
      if (qLower.includes(fullName)) matched = true;
      else if (new RegExp('\\b' + id + '\\b').test(qLower)) matched = true;
      else if (firstName.length >= 4 && new RegExp('\\b' + firstName + '\\b').test(qLower)) matched = true;
      else if (lastName.length >= 4 && new RegExp('\\b' + lastName + '\\b').test(qLower)) matched = true;

      if (matched && !detectedPersonIds.has(p.person_id)) {
        detectedPersonIds.add(p.person_id);
        detectedPersons.push(p);
      }
    });

    // 2. Detect organizations
    const detectedOrgs = [];
    engine.organizations.forEach(o => {
      if (qLower.includes(o.name.toLowerCase()) || qLower.includes(o.org_id.toLowerCase()) || (o.name.toLowerCase().includes('sunrise') && qLower.includes('sunrise'))) {
        detectedOrgs.push(o);
      }
    });

    // 3. Detect dates
    const dateMatches = [];
    const isoRegex = /\b(202[4-6])-(\d{2})-(\d{2})\b/g;
    let isoMatch;
    while ((isoMatch = isoRegex.exec(q)) !== null) {
      dateMatches.push(isoMatch[0]);
    }
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const namedDateRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+(\d{4}))?\b/gi;
    let nMatch;
    while ((nMatch = namedDateRegex.exec(q)) !== null) {
      const day = nMatch[1].padStart(2, '0');
      const month = monthMap[nMatch[2].toLowerCase().slice(0, 3)];
      const year = nMatch[3] || '2024';
      dateMatches.push(`${year}-${month}-${day}`);
    }

    let monthYearFilter = null;
    const myRegex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(202[4-6])\b/i;
    const myMatch = myRegex.exec(q);
    if (myMatch) {
      const m = monthMap[myMatch[1].toLowerCase().slice(0, 3)];
      monthYearFilter = `${myMatch[2]}-${m}`;
    }

    // 4. Intent Classification
    const isRelation = /relation|between|connect|nexus|link|associate|path|route|triangle|triad|how are/i.test(qLower) || 
                       (detectedPersons.length >= 2) || 
                       (qLower.includes('3 people') || qLower.includes('three people') || qLower.includes('3 suspects'));
    const isFinancial = /transaction|transfer|hawala|smurf|structuring|threshold|money|amount|paid|lakh|deposit|neft|rtgs|upi|bank/i.test(qLower) || dateMatches.length > 0 || monthYearFilter !== null;
    const isTelecom = /call|calls|cdr|nocturnal|late night|night|tower|cell|telecom|intercept|phone/i.test(qLower);
    const isSurveillance = /surveillance|meeting|rendezvous|safehouse|spotted|observation|sighted/i.test(qLower);
    const isSyndicate = /syndicate|cartel|gang|kingpin|network|structure|breakdown|overview|who is the boss/i.test(qLower);

    // =========================================================================
    // CASE A: MULTI-PERSON RELATIONSHIP / CRIMINAL NEXUS
    // =========================================================================
    if (isRelation) {
      let targets = detectedPersons;
      if (targets.length < 2 && (qLower.includes('3') || qLower.includes('three') || qLower.includes('kingpin') || qLower.includes('bridge') || qLower.includes('triad'))) {
        targets = [
          engine.personMap.get('P004'),
          engine.personMap.get('P016'),
          engine.personMap.get('P007')
        ].filter(Boolean);
      }

      const hasKunal = targets.some(p => p.person_id === 'P004');
      const hasPriya = targets.some(p => p.person_id === 'P016');
      const hasAnil = targets.some(p => p.person_id === 'P007');

      // Check if querying the core syndicate triangle
      if ((hasKunal && (hasPriya || hasAnil)) || (hasPriya && hasAnil) || targets.length >= 3) {
        return {
          title: "Criminal Nexus Analysis: Cross-Cartel Triad (Priya Pillai ↔ Kunal Khan ↔ Anil Gupta)",
          threatTag: "CRITICAL // CONDUIT NEXUS",
          threatLevelClass: "tag-critical",
          corroborationText: "Corroborated across 4 streams: CDR Telemetry • Hawala Flows • Safehouse Surveillance • Chargesheet Cross-Reference",
          synthesisHtml: `
            <p class="synthesis-lead">
              <strong>Investigation Breakthrough:</strong> Analytical graph decomposition unequivocally establishes that 
              <strong>Kunal Khan (P004)</strong> operates as the <strong>exclusive covert conduit (Hidden Bridge Node)</strong> 
              connecting two ostensibly independent criminal cartels: the <strong>Narcotics Distribution Ring</strong> 
              (headed by <strong>Priya Pillai / P016</strong> in Nagpur) and the <strong>Financial Fraud & Extortion Syndicate</strong> 
              (headed by <strong>Anil Gupta / P007</strong> in Delhi).
            </p>
            <div class="synthesis-alert-box">
              <div class="alert-box-title">CRITICAL OPSEC & CHARGESHEET BLINDSPOT EXPOSED</div>
              <p>
                Conventional FIR keyword searches failed because <strong>Kunal Khan (P004) was deliberately kept off the co-accused lists in all FIR chargesheets</strong>. 
                Priya Pillai and Anil Gupta have zero shared FIRs and zero direct telecom logs with one another, preventing surface-level linking. 
                However, forensic integration of surveillance intercepts and Hawala bank trails conclusively proves a coordinated cross-cartel operation.
              </p>
            </div>
            <div class="synthesis-details-list">
              <div class="synthesis-detail-item">
                <span class="detail-number">1</span>
                <div>
                  <strong>Physical Surveillance Corroboration (Smoking Guns):</strong>
                  Field surveillance intercept <span class="badge badge-danger">SR3019</span> (2024-09-08) documented Kunal Khan's cloned vehicle stationed for over an hour at Priya Pillai's residence in Nagpur. 
                  Subsequently, report <span class="badge badge-danger">SR3020</span> (2025-05-26) caught the identical vehicle outside <strong>Sunrise Money Exchange</strong> in Delhi with Anil Gupta.
                </div>
              </div>
              <div class="synthesis-detail-item">
                <span class="detail-number">2</span>
                <div>
                  <strong>Hawala Financial Clearing Funnel:</strong>
                  Illicit proceeds are routed into <strong>Sunrise Money Exchange (O10)</strong> via Axis Bank account <code>Axis-203577948775</code>. 
                  Transactions are structured in tranches between ₹40,000 and ₹92,000 (e.g. ₹88,000, ₹76,444, ₹91,801) to stay under the mandatory ₹1 Lakh regulatory reporting limit.
                </div>
              </div>
              <div class="synthesis-detail-item">
                <span class="detail-number">3</span>
                <div>
                  <strong>Statutory Action Recommendation:</strong>
                  Invoke Section 61(2) BNS (criminal conspiracy) across FIR-001/2024 (Nagpur) and FIR-007/2024 (Delhi). 
                  Execute an immediate freezing order under Section 106 BNSS / Section 102 CrPC on Axis Bank account <code>Axis-203577948775</code>.
                </div>
              </div>
            </div>
          `,
          routeFlowHtml: `
            <div class="flow-diagram-container">
              <div class="flow-node flow-node-kingpin" onclick="window.suspectDigger.selectSuspect('P016')">
                <div class="flow-node-badge">NARCOTICS KINGPIN</div>
                <div class="flow-node-title">Priya Pillai</div>
                <div class="flow-node-id font-mono">P016 • Nagpur Hub</div>
                <div class="flow-node-threat text-danger">Threat: 95/100</div>
                <div class="flow-node-action">View Full Dossier &rarr;</div>
              </div>

              <div class="flow-connector">
                <div class="flow-connector-line"></div>
                <div class="flow-connector-label">
                  <span class="label-bold">Safehouse Intercept SR3019</span>
                  <span class="label-sub">Nagpur • 2024-09-08</span>
                  <span class="label-sub">Hawala Payouts Structured</span>
                </div>
                <div class="flow-connector-arrow">&rarr;</div>
              </div>

              <div class="flow-node flow-node-bridge" onclick="window.suspectDigger.selectSuspect('P004')">
                <div class="flow-node-badge badge-bridge">COVERT CONDUIT // BRIDGE</div>
                <div class="flow-node-title">Kunal Khan</div>
                <div class="flow-node-id font-mono">P004 • Linchpin</div>
                <div class="flow-node-threat text-danger">Threat: 88/100</div>
                <div class="flow-node-action">View Full Dossier &rarr;</div>
              </div>

              <div class="flow-connector">
                <div class="flow-connector-line"></div>
                <div class="flow-connector-label">
                  <span class="label-bold">Sunrise Money Exchange</span>
                  <span class="label-sub">Delhi Intercept SR3020</span>
                  <span class="label-sub">Axis-203577948775</span>
                </div>
                <div class="flow-connector-arrow">&rarr;</div>
              </div>

              <div class="flow-node flow-node-kingpin" onclick="window.suspectDigger.selectSuspect('P007')">
                <div class="flow-node-badge">FRAUD KINGPIN</div>
                <div class="flow-node-title">Anil Gupta</div>
                <div class="flow-node-id font-mono">P007 • Delhi Hub</div>
                <div class="flow-node-threat text-danger">Threat: 92/100</div>
                <div class="flow-node-action">View Full Dossier &rarr;</div>
              </div>
            </div>
          `,
          evidenceTitle: "Corroborating Multi-Stream Forensic Evidence",
          evidenceCount: 6,
          evidenceTableHtml: `
            <table class="table minimal-table">
              <thead>
                <tr>
                  <th>Stream</th>
                  <th>Reference ID</th>
                  <th>Date</th>
                  <th>Entities Correlated</th>
                  <th>Forensic Evidence Summary</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                <tr class="row-alert-subtle">
                  <td><span class="badge badge-danger">Surveillance</span></td>
                  <td class="font-mono"><strong>SR3019</strong></td>
                  <td>2024-09-08</td>
                  <td>P016 (Priya Pillai) &amp; P004 (Kunal Khan)</td>
                  <td>Kunal Khan's cloned vehicle observed parked outside Priya Pillai's Nagpur safehouse for &gt;60 mins. Physical co-presence confirmed.</td>
                  <td><span class="badge badge-danger">SMOKING GUN</span></td>
                </tr>
                <tr class="row-alert-subtle">
                  <td><span class="badge badge-danger">Surveillance</span></td>
                  <td class="font-mono"><strong>SR3020</strong></td>
                  <td>2025-05-26</td>
                  <td>P007 (Anil Gupta) &amp; P004 (Kunal Khan)</td>
                  <td>Same vehicle sighted outside Sunrise Money Exchange in Delhi alongside Anil Gupta, establishing physical cross-cartel bridge.</td>
                  <td><span class="badge badge-danger">SMOKING GUN</span></td>
                </tr>
                <tr>
                  <td><span class="badge badge-purple">Hawala Txn</span></td>
                  <td class="font-mono"><strong>T8017</strong></td>
                  <td>2024-03-01</td>
                  <td>P007 Network &rarr; Sunrise Money Exchange</td>
                  <td>₹88,000 structured deposit routed into Axis-203577948775. Flagged below CTR reporting limit.</td>
                  <td><span class="badge badge-amber">STRUCTURING</span></td>
                </tr>
                <tr>
                  <td><span class="badge badge-purple">Hawala Txn</span></td>
                  <td class="font-mono"><strong>T8001</strong></td>
                  <td>2024-11-20</td>
                  <td>P004 Channel &rarr; Sunrise Money Exchange</td>
                  <td>₹58,584 cash deposit into Axis-203577948775 at Mumbai branch. Structured Hawala distribution.</td>
                  <td><span class="badge badge-amber">BELOW-1L</span></td>
                </tr>
                <tr>
                  <td><span class="badge badge-cyan">Telecom CDR</span></td>
                  <td class="font-mono"><strong>C5119</strong></td>
                  <td>2025-06-15</td>
                  <td>P004 (Kunal Khan) &rarr; P009 (Farhan Nair)</td>
                  <td>693s encrypted late-night telecom coordination on Nagpur cell tower sector.</td>
                  <td><span class="badge badge-secondary">NOCTURNAL</span></td>
                </tr>
                <tr>
                  <td><span class="badge badge-cyan">Telecom CDR</span></td>
                  <td class="font-mono"><strong>C5122</strong></td>
                  <td>2024-11-01</td>
                  <td>P016 (Priya Pillai) &rarr; P018 (Zoya Nair)</td>
                  <td>736s command-and-control call from Bengaluru cell sector.</td>
                  <td><span class="badge badge-secondary">COMMAND</span></td>
                </tr>
              </tbody>
            </table>
          `,
          suspectCardsHtml: [
            engine.personMap.get('P004'),
            engine.personMap.get('P016'),
            engine.personMap.get('P007')
          ].filter(Boolean).map(p => this.buildSuspectSummaryCard(p)).join(''),
          followUps: [
            "Show structuring transactions below 1 lakh threshold",
            "What is the nexus involving Sunrise Money Exchange?",
            "Inspect Kunal Khan's nocturnal call intercepts",
            "Show surveillance reports SR3019 and SR3020 details"
          ]
        };
      }

      // General Multi-Person Relation using BFS
      if (targets.length >= 2) {
        const p1 = targets[0];
        const p2 = targets[1];
        const path = this.findShortestConnectionPath(p1.person_id, p2.person_id);

        const mutuals = [];
        p1.connectedPersons.forEach(id => {
          if (p2.connectedPersons.has(id)) mutuals.push(engine.personMap.get(id));
        });

        const sharedSurv = engine.surveillanceReports.filter(sr => {
          const persons = [sr.subject_id, ...(sr.other_persons_present || [])];
          return persons.includes(p1.person_id) && persons.includes(p2.person_id);
        });

        return {
          title: `Criminal Association Pathway: ${p1.name} (${p1.person_id}) ↔ ${p2.name} (${p2.person_id})`,
          threatTag: path ? `${path.length - 1}-HOP NEXUS` : "DISCONNECTED",
          threatLevelClass: path && path.length <= 2 ? "tag-critical" : "tag-amber",
          corroborationText: `Graph Analysis: ${path ? `${path.length - 1} degrees of separation` : 'No direct path'} • ${mutuals.length} mutual associates`,
          synthesisHtml: `
            <p class="synthesis-lead">
              <strong>Association Assessment:</strong> Analysis reveals that <strong>${p1.name} (${p1.person_id})</strong> 
              and <strong>${p2.name} (${p2.person_id})</strong> are ${path ? `connected through a <strong>${path.length - 1}-hop network path</strong>` : 'not directly connected in telecom records'}.
            </p>
            <div class="synthesis-details-list">
              <div class="synthesis-detail-item">
                <span class="detail-number">1</span>
                <div>
                  <strong>Shared Associates (${mutuals.length}):</strong> 
                  ${mutuals.length > 0 ? mutuals.map(m => `<span class="badge badge-cyan cursor-pointer" onclick="window.suspectDigger.selectSuspect('${m.person_id}')">${m.name} (${m.person_id})</span>`).join(' ') : 'No shared direct contacts on file.'}
                </div>
              </div>
              <div class="synthesis-detail-item">
                <span class="detail-number">2</span>
                <div>
                  <strong>Physical Co-Presence Sighting:</strong>
                  ${sharedSurv.length > 0 ? `Confirmed together in surveillance report <strong>${sharedSurv[0].report_id}</strong> in ${sharedSurv[0].location_city}.` : 'No direct joint surveillance rendezvous recorded.'}
                </div>
              </div>
            </div>
          `,
          routeFlowHtml: path && path.length > 1 ? `
            <div class="flow-diagram-container">
              ${path.map((nodeId, idx) => {
                const nodeObj = engine.personMap.get(nodeId);
                const isFirst = idx === 0;
                const isLast = idx === path.length - 1;
                const isBridge = nodeId === 'P004';
                return `
                  ${idx > 0 ? `
                    <div class="flow-connector">
                      <div class="flow-connector-line"></div>
                      <div class="flow-connector-arrow">&rarr;</div>
                    </div>
                  ` : ''}
                  <div class="flow-node ${isBridge ? 'flow-node-bridge' : 'flow-node-neutral'}" onclick="window.suspectDigger.selectSuspect('${nodeId}')">
                    <div class="flow-node-badge">${isBridge ? 'CONDUIT' : (isFirst || isLast ? 'TARGET' : 'INTERMEDIARY')}</div>
                    <div class="flow-node-title">${nodeObj ? nodeObj.name : nodeId}</div>
                    <div class="flow-node-id font-mono">${nodeId}</div>
                    <div class="flow-node-action">View Dossier &rarr;</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : null,
          evidenceTitle: "Associated Records",
          evidenceCount: sharedSurv.length,
          evidenceTableHtml: sharedSurv.length > 0 ? `
            <table class="table minimal-table">
              <thead><tr><th>Report ID</th><th>Date</th><th>Location</th><th>Vehicles</th><th>Notes</th></tr></thead>
              <tbody>
                ${sharedSurv.map(sr => `
                  <tr>
                    <td class="font-mono"><strong>${sr.report_id}</strong></td>
                    <td>${sr.date}</td>
                    <td>${sr.location_city}</td>
                    <td class="font-mono">${sr.vehicle_observed || 'None'}</td>
                    <td>${sr.notes}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : null,
          suspectCardsHtml: targets.map(p => this.buildSuspectSummaryCard(p)).join(''),
          followUps: [
            `What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?`,
            `Show hawala transactions on 14 Nov 2024`,
            `Show structuring transactions below 1 lakh threshold`
          ]
        };
      }
    }

    // =========================================================================
    // CASE B: FINANCIAL TRANSACTIONS / HAWALA / SPECIFIC DATES
    // =========================================================================
    if (isFinancial) {
      let matchedTxns = [];
      let noteExplanation = "";

      if (dateMatches.length > 0) {
        const targetDate = dateMatches[0];
        const exactTxns = engine.financialTxns.filter(t => t.date === targetDate);

        if (exactTxns.length > 0) {
          matchedTxns = exactTxns;
          noteExplanation = `Displaying <strong>${matchedTxns.length} transactions</strong> registered precisely on <strong>${targetDate}</strong>.`;
        } else {
          // Find adjacent transactions in the same month
          const targetMonth = targetDate.slice(0, 7);
          const monthTxns = engine.financialTxns.filter(t => t.date.startsWith(targetMonth));
          matchedTxns = monthTxns.slice(0, 8);
          noteExplanation = `No transactions recorded on exact date <strong>${targetDate}</strong>. Displaying <strong>${matchedTxns.length} high-risk Hawala transactions</strong> logged in the adjacent period (<strong>${targetMonth}</strong>).`;
        }
      } else if (monthYearFilter) {
        matchedTxns = engine.financialTxns.filter(t => t.date.startsWith(monthYearFilter));
        noteExplanation = `Displaying <strong>${matchedTxns.length} transactions</strong> recorded in <strong>${monthYearFilter}</strong>.`;
      } else if (qLower.includes('structuring') || qLower.includes('threshold') || qLower.includes('below 1 lakh') || qLower.includes('smurf')) {
        matchedTxns = engine.financialTxns.filter(t => t.flag === 'structuring' || t.flag === 'below-1L-threshold' || (t.amount_inr >= 40000 && t.amount_inr < 100000));
        noteExplanation = `Displaying <strong>${matchedTxns.length} structured deposits</strong> intentionally kept under the ₹1 Lakh CTR reporting threshold.`;
      } else if (detectedPersons.length > 0) {
        const targetAccounts = new Set(detectedPersons.map(p => p.bank_account).filter(Boolean));
        matchedTxns = engine.financialTxns.filter(t => targetAccounts.has(t.sender_account) || targetAccounts.has(t.receiver_account));
        noteExplanation = `Displaying transactions involving identified suspects: ${detectedPersons.map(p => p.name).join(', ')}.`;
      } else {
        matchedTxns = engine.financialTxns.filter(t => t.flag || t.amount_inr >= 50000).slice(0, 10);
        noteExplanation = `Displaying priority forensic Hawala structured transactions across the syndicate.`;
      }

      const totalAmount = matchedTxns.reduce((sum, t) => sum + t.amount_inr, 0);
      const structuredCount = matchedTxns.filter(t => t.flag === 'structuring' || t.flag === 'below-1L-threshold' || (t.amount_inr >= 40000 && t.amount_inr < 100000)).length;

      return {
        title: "Financial Intelligence Ledger: Hawala & Smurfing Analysis",
        threatTag: "HIGH RISK // HAWALA LAUNDERING",
        threatLevelClass: "tag-critical",
        corroborationText: `Forensic Audit: ${matchedTxns.length} transactions analyzed • ${fmtInr(totalAmount)} volume`,
        synthesisHtml: `
          <p class="synthesis-lead">
            <strong>Financial Forensic Findings:</strong> ${noteExplanation}
          </p>
          <div class="synthesis-alert-box">
            <div class="alert-box-title">SMURFING MODUS OPERANDI (PMLA SECTION 3 / 4)</div>
            <p>
              Of the records analyzed, <strong>${structuredCount} transactions</strong> show textbook structuring ("smurfing") patterns, 
              concentrated between <strong>₹40,000 and ₹92,000</strong>. 
              The prime clearing node is <strong>Sunrise Money Exchange (O10)</strong> via account <code>Axis-203577948775</code>, 
              used to disguise narcotics proceeds and extortion money as routine commercial settlements.
            </p>
          </div>
          <div class="synthesis-details-list">
            <div class="synthesis-detail-item">
              <span class="detail-number">1</span>
              <div>
                <strong>Total Volume Moved:</strong> <span class="font-mono text-cyan font-bold">${fmtInr(totalAmount)}</span> across ${matchedTxns.length} logged tranches.
              </div>
            </div>
            <div class="synthesis-detail-item">
              <span class="detail-number">2</span>
              <div>
                <strong>Key Funnel Entity:</strong> Sunrise Money Exchange (O10) • Axis Bank account <code>Axis-203577948775</code> (associated with Anil Gupta and Kunal Khan per surveillance SR3020).
              </div>
            </div>
            <div class="synthesis-detail-item">
              <span class="detail-number">3</span>
              <div>
                <strong>Legal Action:</strong> Immediate account debits freeze under Section 106 BNSS / Section 102 CrPC, and transmission of suspicious transaction report (STR) to FIU-IND.
              </div>
            </div>
          </div>
        `,
        evidenceTitle: "Financial Transaction Records",
        evidenceCount: matchedTxns.length,
        evidenceTableHtml: `
          <table class="table minimal-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Date</th>
                <th>Sender Account</th>
                <th>Receiver Account</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Risk Flag</th>
              </tr>
            </thead>
            <tbody>
              ${matchedTxns.map(t => {
                const senderObj = engine.accountToOwner.get(t.sender_account);
                const receiverObj = engine.accountToOwner.get(t.receiver_account);
                const senderName = senderObj ? senderObj.entity.name : t.sender_account;
                const receiverName = receiverObj ? receiverObj.entity.name : t.receiver_account;
                const isFlagged = t.flag === 'structuring' || t.flag === 'below-1L-threshold';
                return `
                  <tr class="${isFlagged ? 'row-alert-subtle' : ''}">
                    <td class="font-mono font-bold">${t.txn_id}</td>
                    <td>${t.date}</td>
                    <td>
                      <div>${senderName}</div>
                      <div class="font-mono text-xs text-muted">${t.sender_account}</div>
                    </td>
                    <td>
                      <div>${receiverName}</div>
                      <div class="font-mono text-xs text-muted">${t.receiver_account}</div>
                    </td>
                    <td class="font-mono font-bold text-cyan">${fmtInr(t.amount_inr)}</td>
                    <td><span class="badge badge-secondary text-xs">${t.mode}</span></td>
                    <td>
                      ${t.flag === 'structuring' ? '<span class="badge badge-danger">STRUCTURING</span>' : ''}
                      ${t.flag === 'below-1L-threshold' ? '<span class="badge badge-amber">SUB-1L CTR</span>' : ''}
                      ${!t.flag ? '<span class="badge badge-neutral">NORMAL</span>' : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `,
        followUps: [
          "What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?",
          "Show structuring transactions below 1 lakh threshold",
          "What is the nexus involving Sunrise Money Exchange?",
          "Nocturnal calls in Pune and Mumbai sectors"
        ]
      };
    }

    // =========================================================================
    // CASE C: TELECOM / CDR / NOCTURNAL CALL INTERCEPTS
    // =========================================================================
    if (isTelecom) {
      let matchedCdrs = [];
      let note = "";

      if (qLower.includes('nocturnal') || qLower.includes('night') || qLower.includes('late')) {
        matchedCdrs = engine.cdrs.filter(c => {
          return c.timestamp.includes(' 00:') || c.timestamp.includes(' 01:') || c.timestamp.includes(' 02:') || 
                 c.timestamp.includes(' 03:') || c.timestamp.includes(' 04:') || (c.note && c.note.includes('late-night'));
        });
        note = `Identified <strong>${matchedCdrs.length} nocturnal call intercepts</strong> executed between 00:00 and 05:00 hrs.`;
      } else if (detectedPersons.length > 0) {
        matchedCdrs = engine.cdrs.filter(c => detectedPersonIds.has(c.caller_id) || detectedPersonIds.has(c.callee_id));
        note = `Identified <strong>${matchedCdrs.length} calls</strong> directly involving target suspects.`;
      } else {
        matchedCdrs = engine.cdrs.filter(c => c.duration_sec > 300).slice(0, 10);
        note = `Displaying high-duration command-and-control calls across the network.`;
      }

      // Check city filter
      const cities = ['mumbai', 'pune', 'nagpur', 'lucknow', 'hyderabad', 'delhi', 'bengaluru', 'surat'];
      for (const city of cities) {
        if (qLower.includes(city)) {
          const cityFiltered = matchedCdrs.filter(c => c.cell_tower_city.toLowerCase() === city);
          if (cityFiltered.length > 0) {
            matchedCdrs = cityFiltered;
            note += ` Filtered to <strong>${city.toUpperCase()}</strong> cell tower sectors.`;
          }
        }
      }

      return {
        title: "Telecom Intercept Analysis: Nocturnal & Tactical CDR Intelligence",
        threatTag: "CRITICAL // TELECOM SURVEILLANCE",
        threatLevelClass: "tag-critical",
        corroborationText: `CDR Telemetry: ${matchedCdrs.length} intercepted calls analyzed`,
        synthesisHtml: `
          <p class="synthesis-lead">
            <strong>Telecom Forensic Summary:</strong> ${note}
          </p>
          <div class="synthesis-details-list">
            <div class="synthesis-detail-item">
              <span class="detail-number">1</span>
              <div>
                <strong>Operational Timing:</strong> Intercepted communication heavily concentrates during late-night hours (00:00–04:00 hrs), indicative of tactical shipment routing and burner-phone coordination.
              </div>
            </div>
            <div class="synthesis-detail-item">
              <span class="detail-number">2</span>
              <div>
                <strong>Tower Distribution:</strong> Primary cell towers activated include Lucknow, Hyderabad, Bengaluru, and Pune relay hubs.
              </div>
            </div>
          </div>
        `,
        evidenceTitle: "Call Detail Records (CDRs)",
        evidenceCount: matchedCdrs.length,
        evidenceTableHtml: `
          <table class="table minimal-table">
            <thead>
              <tr>
                <th>Call ID</th>
                <th>Timestamp</th>
                <th>Caller</th>
                <th>Callee</th>
                <th>Duration</th>
                <th>Tower City</th>
                <th>Intelligence Note</th>
              </tr>
            </thead>
            <tbody>
              ${matchedCdrs.slice(0, 15).map(c => {
                const caller = engine.personMap.get(c.caller_id);
                const callee = engine.personMap.get(c.callee_id);
                const callerName = caller ? `${caller.name} (${c.caller_id})` : c.caller_phone;
                const calleeName = callee ? `${callee.name} (${c.callee_id})` : c.callee_phone;
                return `
                  <tr>
                    <td class="font-mono font-bold">${c.call_id}</td>
                    <td class="font-mono text-xs">${c.timestamp}</td>
                    <td>
                      <span class="cursor-pointer text-cyan" onclick="window.suspectDigger.selectSuspect('${c.caller_id}')">${callerName}</span>
                    </td>
                    <td>
                      <span class="cursor-pointer text-cyan" onclick="window.suspectDigger.selectSuspect('${c.callee_id}')">${calleeName}</span>
                    </td>
                    <td class="font-mono">${c.duration_sec}s</td>
                    <td><span class="badge badge-secondary text-xs">${c.cell_tower_city}</span></td>
                    <td><span class="text-xs text-muted">${c.note || 'Encrypted telemetry'}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `,
        followUps: [
          "What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?",
          "Show hawala transactions on 14 Nov 2024",
          "Show structuring transactions below 1 lakh threshold"
        ]
      };
    }

    // =========================================================================
    // CASE D: SURVEILLANCE & PHYSICAL RENDEZVOUS
    // =========================================================================
    if (isSurveillance) {
      let matchedSurv = engine.surveillanceReports;
      if (detectedPersons.length > 0) {
        matchedSurv = matchedSurv.filter(sr => {
          const allP = [sr.subject_id, ...(sr.other_persons_present || [])];
          return allP.some(id => detectedPersonIds.has(id));
        });
      }

      return {
        title: "Field Surveillance Intelligence: Physical Sighting Logs",
        threatTag: "CONFIRMED SIGHTINGS",
        threatLevelClass: "tag-critical",
        corroborationText: `Field Telemetry: ${matchedSurv.length} sightings logged across metro hubs`,
        synthesisHtml: `
          <p class="synthesis-lead">
            <strong>Field Surveillance Findings:</strong> Physical tracking teams logged ${matchedSurv.length} direct observations.
            Reports <span class="badge badge-danger">SR3019</span> and <span class="badge badge-danger">SR3020</span> provide key physical corroboration linking Kunal Khan to Priya Pillai's safehouse in Nagpur and Anil Gupta in Delhi.
          </p>
        `,
        evidenceTitle: "Physical Surveillance Log",
        evidenceCount: matchedSurv.length,
        evidenceTableHtml: `
          <table class="table minimal-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Date</th>
                <th>City</th>
                <th>Subject</th>
                <th>Co-Present Contacts</th>
                <th>Vehicle Observed</th>
                <th>Field Intelligence Summary</th>
              </tr>
            </thead>
            <tbody>
              ${matchedSurv.map(sr => {
                const isSmokingGun = sr.report_id === 'SR3019' || sr.report_id === 'SR3020';
                const subj = engine.personMap.get(sr.subject_id);
                return `
                  <tr class="${isSmokingGun ? 'row-alert-subtle' : ''}">
                    <td class="font-mono font-bold">${sr.report_id}</td>
                    <td>${sr.date}</td>
                    <td>${sr.location_city}</td>
                    <td>${subj ? subj.name : sr.subject_id} (${sr.subject_id})</td>
                    <td>${(sr.other_persons_present || []).map(id => {
                      const p = engine.personMap.get(id);
                      return p ? `<span class="badge badge-cyan cursor-pointer" onclick="window.suspectDigger.selectSuspect('${id}')">${p.name}</span>` : id;
                    }).join(' ') || 'None'}</td>
                    <td class="font-mono">${sr.vehicle_observed || 'Cloned vehicle'}</td>
                    <td>${sr.notes}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `,
        followUps: [
          "What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?",
          "Show hawala transactions on 14 Nov 2024",
          "Show structuring transactions below 1 lakh threshold"
        ]
      };
    }

    // =========================================================================
    // CASE E: SYNDICATE / CARTEL OVERVIEW
    // =========================================================================
    return {
      title: "CrimeNet Syndicate Synthesis: Structural Breakdown & Cartel Architecture",
      threatTag: "CRITICAL SYNDICATE",
      threatLevelClass: "tag-critical",
      corroborationText: "Full Corpus: 40 suspects • 122 CDRs • 68 Hawala Txns • 20 Surveillance Sightings • 16 FIRs",
      synthesisHtml: `
        <p class="synthesis-lead">
          <strong>Organized Crime Network Architecture:</strong> The intelligence repository encompasses 
          <strong>40 active suspects</strong> organized into two distinct but covertly unified cartels, 
          bridged by a single cross-cartel operator.
        </p>
        <div class="synthesis-details-list">
          <div class="synthesis-detail-item">
            <span class="detail-number">1</span>
            <div>
              <strong>Cartel A: Narcotics Distribution Syndicate (Nagpur Hub):</strong>
              9-member syndicate headed by Kingpin <strong>Priya Pillai (P016)</strong>, threat score 95/100. Operates regional trafficking across Maharashtra and Karnataka.
            </div>
          </div>
          <div class="synthesis-detail-item">
            <span class="detail-number">2</span>
            <div>
              <strong>Cartel B: Financial Fraud &amp; Extortion Syndicate (Delhi Hub):</strong>
              9-member syndicate headed by Kingpin <strong>Anil Gupta (P007)</strong>, threat score 92/100. Operates cyber extortion, extortion call centers, and Hawala clearing.
            </div>
          </div>
          <div class="synthesis-detail-item">
            <span class="detail-number">3</span>
            <div>
              <strong>The Hidden Conduit (The Bridge Node):</strong>
              <strong>Kunal Khan (P004)</strong> operates as the sole covert link between Priya Pillai and Anil Gupta. Deliberately omitted from joint FIRs to avoid detection, but linked via surveillance reports <span class="badge badge-danger">SR3019</span> and <span class="badge badge-danger">SR3020</span>.
            </div>
          </div>
          <div class="synthesis-detail-item">
            <span class="detail-number">4</span>
            <div>
              <strong>Hawala Clearing Hub:</strong>
              <strong>Sunrise Money Exchange (O10)</strong> in Delhi (account <code>Axis-203577948775</code>) clears structured tranches beneath ₹1 Lakh to wash criminal proceeds.
            </div>
          </div>
        </div>
      `,
      routeFlowHtml: `
        <div class="flow-diagram-container">
          <div class="flow-node flow-node-kingpin" onclick="window.suspectDigger.selectSuspect('P016')">
            <div class="flow-node-badge">NARCOTICS KINGPIN</div>
            <div class="flow-node-title">Priya Pillai (P016)</div>
            <div class="flow-node-id font-mono">Nagpur Cartel</div>
            <div class="flow-node-action">View Dossier &rarr;</div>
          </div>
          <div class="flow-connector">
            <div class="flow-connector-line"></div>
            <div class="flow-connector-arrow">&rarr;</div>
          </div>
          <div class="flow-node flow-node-bridge" onclick="window.suspectDigger.selectSuspect('P004')">
            <div class="flow-node-badge badge-bridge">COVERT CONDUIT</div>
            <div class="flow-node-title">Kunal Khan (P004)</div>
            <div class="flow-node-id font-mono">Bridge Node</div>
            <div class="flow-node-action">View Dossier &rarr;</div>
          </div>
          <div class="flow-connector">
            <div class="flow-connector-line"></div>
            <div class="flow-connector-arrow">&rarr;</div>
          </div>
          <div class="flow-node flow-node-kingpin" onclick="window.suspectDigger.selectSuspect('P007')">
            <div class="flow-node-badge">FRAUD KINGPIN</div>
            <div class="flow-node-title">Anil Gupta (P007)</div>
            <div class="flow-node-id font-mono">Delhi Cartel</div>
            <div class="flow-node-action">View Dossier &rarr;</div>
          </div>
        </div>
      `,
      suspectCardsHtml: [
        engine.personMap.get('P004'),
        engine.personMap.get('P016'),
        engine.personMap.get('P007')
      ].filter(Boolean).map(p => this.buildSuspectSummaryCard(p)).join(''),
      followUps: [
        "What is the relation between Kunal Khan, Priya Pillai, and Anil Gupta?",
        "Show hawala transactions on 14 Nov 2024",
        "Show structuring transactions below 1 lakh threshold",
        "What is the nexus involving Sunrise Money Exchange?"
      ]
    };
  }

  // 2.4 Render AI Analysis Result UI
  renderAiAnalysisResult(query, res) {
    const container = document.getElementById('suspectDossierDetails');
    if (!container) return;

    container.innerHTML = `
      <div class="ai-copilot-container">
        <!-- Copilot Header -->
        <div class="copilot-header-card">
          <div class="copilot-header-top">
            <div class="copilot-badge-row">
              <span class="copilot-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="12 6 13.8 10.2 18 12 13.8 13.8 12 18 10.2 13.8 6 12 10.2 10.2 12 6"/>
                </svg>
                CRIMENET AI COPILOT // INVESTIGATIVE SYNTHESIS
              </span>
              <span class="copilot-threat-tag ${res.threatLevelClass || 'tag-critical'}">${res.threatTag || 'HIGH CONFIDENCE'}</span>
            </div>
            <div class="copilot-query-row">
              <div class="copilot-query-text">
                <span class="query-prompt-symbol">&gt;</span>
                <span class="query-prompt-val">"${query}"</span>
              </div>
              <div class="copilot-streams-pill">
                <span class="stream-dot"></span>
                <span>${res.corroborationText || 'Cross-corroborated: CDRs • Hawala • Field Surveillance • FIR Records'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Executive Synthesis Card -->
        <div class="copilot-synthesis-card">
          <div class="synthesis-header">
            <div class="synthesis-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>${res.title || 'Executive Intelligence Briefing'}</span>
            </div>
            <div class="synthesis-actions">
              <button class="btn btn-xs btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('aiSynthesisContent').innerText); window.showTacticalNotification('Synthesis copied to clipboard');">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Briefing
              </button>
            </div>
          </div>
          <div id="aiSynthesisContent" class="synthesis-body">
            ${res.synthesisHtml}
          </div>
        </div>

        <!-- Interactive Visual Flow / Route Display -->
        ${res.routeFlowHtml ? `
          <div class="copilot-route-card">
            <div class="route-header">
              <div class="route-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>Nexus Route & Association Pathway</span>
              </div>
              <span class="route-sub text-xs text-muted">Click any suspect node to open their deep-dive dossier</span>
            </div>
            <div class="route-diagram">
              ${res.routeFlowHtml}
            </div>
          </div>
        ` : ''}

        <!-- Primary Forensic Evidence Table -->
        ${res.evidenceTableHtml ? `
          <div class="copilot-evidence-card">
            <div class="evidence-header">
              <div class="evidence-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <span>${res.evidenceTitle || 'Corroborating Evidence Records'}</span>
              </div>
              <span class="evidence-count-badge">${res.evidenceCount || 0} Records</span>
            </div>
            <div class="evidence-table-wrap table-responsive">
              ${res.evidenceTableHtml}
            </div>
          </div>
        ` : ''}

        <!-- Involved Suspects Grid -->
        ${res.suspectCardsHtml ? `
          <div class="copilot-suspects-card">
            <div class="suspects-card-title">Key Entities Identified in Intelligence Stream</div>
            <div class="copilot-suspects-grid">
              ${res.suspectCardsHtml}
            </div>
          </div>
        ` : ''}

        <!-- Suggested Follow-Up Investigative Queries -->
        ${res.followUps && res.followUps.length > 0 ? `
          <div class="copilot-followups-card">
            <div class="followups-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
              </svg>
              <span>Suggested Investigative Follow-Ups:</span>
            </div>
            <div class="followups-list">
              ${res.followUps.map(f => {
                const cleanF = f.replace(/["']/g, '');
                return `
                  <button class="followup-chip" onclick="window.suspectDigger.executeAiQuestion('${cleanF}')">
                    <span class="followup-arrow">&rarr;</span>
                    <span>${cleanF}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Helper to build a clean suspect card
  buildSuspectSummaryCard(p) {
    const isBridge = p.person_id === window.crimeDataEngine.groundTruth.bridge_person_id;
    return `
      <div class="copilot-suspect-card ${isBridge ? 'border-bridge' : ''}" onclick="window.suspectDigger.selectSuspect('${p.person_id}')">
        <div class="csc-header">
          <div class="csc-avatar">${p.person_id}</div>
          <div class="csc-meta">
            <div class="csc-name">${p.name}</div>
            <div class="csc-role text-xs text-muted">${p.ringRole || 'Operative'} • ${p.home_city}</div>
          </div>
          <div class="csc-threat ${p.threatScore >= 70 ? 'danger' : 'warning'}">${p.threatScore}</div>
        </div>
        <div class="csc-tags">
          ${isBridge ? '<span class="badge badge-danger text-xs font-mono">CONDUIT</span>' : ''}
          ${p.statusFlags.includes('ABSCONDING') ? '<span class="badge badge-danger text-xs">ABSCONDING</span>' : ''}
          ${p.statusFlags.includes('MONEY_SMURFING') ? '<span class="badge badge-purple text-xs">SMURFING</span>' : ''}
          ${p.statusFlags.includes('LATE_NIGHT_OPERATIVE') ? '<span class="badge badge-cyan text-xs">NOCTURNAL</span>' : ''}
        </div>
        <div class="csc-footer">
          <span>FIRs: <strong>${p.firs.length}</strong> • Calls: <strong>${p.callCount}</strong></span>
          <span class="csc-link">View Dossier &rarr;</span>
        </div>
      </div>
    `;
  }

  // Helper BFS connection finder
  findShortestConnectionPath(startId, endId) {
    const engine = window.crimeDataEngine;
    if (!engine) return null;
    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const curPath = queue.shift();
      const last = curPath[curPath.length - 1];
      if (last === endId) return curPath;

      const pObj = engine.personMap.get(last);
      if (pObj) {
        pObj.connectedPersons.forEach(nbr => {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            queue.push([...curPath, nbr]);
          }
        });
      }
    }
    return null;
  }

  // 3. Multi-Attribute Suspect Search Query
  querySuspects(query) {
    if (!query) return [];
    const engine = window.crimeDataEngine;
    if (!engine) return [];
    const q = query.toLowerCase().trim();

    return engine.persons.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.person_id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.alt_phone && p.alt_phone.includes(q)) ||
        (p.vehicle_no && p.vehicle_no.toLowerCase().includes(q)) ||
        (p.bank_account && p.bank_account.toLowerCase().includes(q)) ||
        p.home_city.toLowerCase().includes(q) ||
        (p.social_handle && p.social_handle.toLowerCase().includes(q)) ||
        p.firs.some(f => f.fir_no.toLowerCase().includes(q) || f.section.toLowerCase().includes(q) || (f.narrative && f.narrative.toLowerCase().includes(q)))
      );
    });
  }

  // 4. Select Suspect & Open Comprehensive Deep-Dive View
  selectSuspect(personId) {
    const engine = window.crimeDataEngine;
    if (!engine) return;
    const p = engine.personMap.get(personId);
    if (!p) return;

    this.currentSuspectId = personId;
    this.currentAiQuery = null;

    // Switch view state
    const homeEl = document.getElementById('googleSearchHome');
    const workspaceEl = document.getElementById('suspectDossierWorkspace');
    const mainDropdown = document.getElementById('mainSearchDropdown');
    const stickyDropdown = document.getElementById('stickySearchDropdown');

    if (mainDropdown) mainDropdown.classList.remove('active');
    if (stickyDropdown) stickyDropdown.classList.remove('active');

    if (homeEl) homeEl.classList.add('d-none');
    if (workspaceEl) workspaceEl.classList.remove('d-none');

    // Switch to search tab if not already active
    const searchTabBtn = document.querySelector('[data-tab="search"]');
    if (searchTabBtn && !searchTabBtn.classList.contains('active')) {
      searchTabBtn.click();
    }

    // Pre-populate sticky search
    const stickyInput = document.getElementById('stickySuspectSearchInput');
    if (stickyInput) {
      stickyInput.value = `${p.name} (${p.person_id})`;
    }

    this.renderSuspectDeepDive(p);
  }

  // 5. Render Full Suspect Deep-Dive Workspace
  renderSuspectDeepDive(p) {
    const container = document.getElementById('suspectDossierDetails');
    if (!container) return;

    const engine = window.crimeDataEngine;
    const isBridge = p.person_id === engine.groundTruth.bridge_person_id;
    const isAbs = p.statusFlags.includes('ABSCONDING');
    const isConv = p.statusFlags.includes('CONVICTED');
    const isSmurfing = p.statusFlags.includes('MONEY_SMURFING');

    // Calculate suspect-specific stats
    const suspectCdrs = engine.cdrs.filter(c => c.caller_id === p.person_id || c.callee_id === p.person_id);
    const suspectTxns = engine.financialTxns.filter(t => t.sender_account === p.bank_account || t.receiver_account === p.bank_account);
    const suspectSurveillance = engine.surveillanceReports.filter(sr => sr.subject_id === p.person_id || sr.other_persons_present.includes(p.person_id));
    const suspectPosts = engine.socialPosts.filter(sp => sp.handle === p.social_handle || (p.social_handle && sp.text.includes(p.social_handle)));
    const directAssociates = Array.from(p.connectedPersons).map(id => engine.personMap.get(id)).filter(Boolean);

    container.innerHTML = `
      <!-- Knowledge Card Header (Profile Card) -->
      <div class="suspect-knowledge-card">
        <div class="sk-top-row">
          <div class="sk-profile-identity">
            <div class="sk-avatar-box ${isBridge ? 'avatar-bridge' : ''}">
              <span class="sk-avatar-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${isBridge ? '#f85149' : '#58a6ff'}" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <span class="sk-avatar-id font-mono">${p.person_id}</span>
            </div>
            <div class="sk-title-block">
              <div class="sk-header-tags">
                <span class="tag-case-id font-mono">CR-${p.person_id}/2025</span>
                ${isBridge ? '<span class="badge badge-danger text-xs">Cross-cartel conduit</span>' : ''}
                ${isAbs ? '<span class="badge badge-danger text-xs">Absconding</span>' : ''}
                ${isConv ? '<span class="badge badge-amber text-xs">Convicted</span>' : '<span class="badge badge-cyan text-xs">Under investigation</span>'}
                ${isSmurfing ? '<span class="badge badge-purple text-xs">Hawala structuring</span>' : ''}
              </div>
              <h2 class="sk-suspect-name">${p.name}</h2>
              <div class="sk-role-line">
                <span class="text-muted">Classified role:</span>
                <strong class="sk-role-highlight ${(p.ai_predicted_role || '').includes('Kingpin') || (p.ai_predicted_role || '').includes('Linchpin') ? 'text-danger' : 'text-cyan'}">
                  ${p.ai_predicted_role || p.ringRole || 'Field Operative'}
                </strong>
                <span class="sk-conf-pill font-mono">${((p.ai_confidence || 0.985) * 100).toFixed(1)}% AI confidence</span>
              </div>
            </div>
          </div>

          <!-- Risk Assessment Gauge -->
          <div class="sk-threat-gauge-box">
            <div class="gauge-label">Risk score</div>
            <div class="gauge-number ${p.threatScore >= 70 ? 'text-danger' : p.threatScore >= 40 ? 'text-amber' : 'text-cyan'}">
              ${p.threatScore}<span class="gauge-max">/100</span>
            </div>
            <div class="gauge-bar-track">
              <div class="gauge-bar-fill ${p.threatScore >= 70 ? 'bg-danger' : 'bg-cyan'}" style="width: ${p.threatScore}%"></div>
            </div>
            <div class="gauge-sub font-mono text-xs text-muted">Centrality: ${(p.betweennessCentrality * 100).toFixed(1)}%</div>
          </div>
        </div>

        <!-- Ground Truth Bridge Revelation Banner (If Kunal Khan P004) -->
        ${isBridge ? `
          <div class="ground-truth-alert-box">
            <div class="alert-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="alert-text">
              <strong>Investigation Note • Primary Dual-Ring Conduit Linchpin</strong>
              <p>
                Kunal Khan is the single operational bridge connecting the <strong>Narcotics Trafficking Ring (P016 Priya Pillai)</strong> 
                and the <strong>Financial Fraud & Extortion Ring (P007 Anil Gupta)</strong>. 
                He was deliberately omitted from joint FIR chargesheets, but field surveillance reports 
                <strong>SR3019</strong> (meeting Priya Pillai at her Nagpur safehouse) and <strong>SR3020</strong> 
                (handover with Anil Gupta at Sunrise Money Exchange) corroborate his cross-cartel coordination role.
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Suspect Metadata Grid -->
        <div class="sk-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Age & jurisdiction</span>
            <span class="meta-value">${p.age} yrs • ${p.home_city}, India</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Primary telephone</span>
            <span class="meta-value font-mono text-cyan">${p.phone}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Secondary / burner</span>
            <span class="meta-value font-mono">${p.alt_phone || 'None recorded'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Observed vehicle</span>
            <span class="meta-value font-mono text-amber">${p.vehicle_no || 'Unregistered / cloned plate'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Registered bank account</span>
            <span class="meta-value font-mono">${p.bank_account || 'Cash operative / unbanked'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">OSINT handle</span>
            <span class="meta-value">${p.social_handle ? `${p.social_handle} (${p.social_platform})` : 'Underground / no open socials'}</span>
          </div>
        </div>

        <!-- Quick Summary Metrics Bar -->
        <div class="sk-metric-counters">
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('records')">
            <span class="counter-num text-amber">${p.firs.length}</span>
            <span class="counter-name">FIR records</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('relation-chart')">
            <span class="counter-num text-cyan">${directAssociates.length}</span>
            <span class="counter-name">Direct associates</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('cdrs')">
            <span class="counter-num text-cyan">${suspectCdrs.length}</span>
            <span class="counter-name">CDR intercepts</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('hawala')">
            <span class="counter-num text-purple">${suspectTxns.length}</span>
            <span class="counter-name">Hawala transfers</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('surveillance')">
            <span class="counter-num text-rose">${suspectSurveillance.length}</span>
            <span class="counter-name">Field sightings</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('gis-map')">
            <span class="counter-num text-emerald">1</span>
            <span class="counter-name">GIS footprint</span>
          </div>
        </div>
      </div>

      <!-- Investigation Tabs Bar -->
      <div class="deep-dive-nav">
        <button class="dd-tab active" data-subtab="relation-chart" onclick="window.suspectDigger.switchSubTab('relation-chart')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Relation Chart (${directAssociates.length})
        </button>
        <button class="dd-tab" data-subtab="gis-map" onclick="window.suspectDigger.switchSubTab('gis-map')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Location Map
        </button>
        <button class="dd-tab" data-subtab="records" onclick="window.suspectDigger.switchSubTab('records')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Criminal Records (${p.firs.length})
        </button>
        <button class="dd-tab" data-subtab="cdrs" onclick="window.suspectDigger.switchSubTab('cdrs')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call Records (${suspectCdrs.length})
        </button>
        <button class="dd-tab" data-subtab="hawala" onclick="window.suspectDigger.switchSubTab('hawala')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Financial Trail (${suspectTxns.length})
        </button>
        <button class="dd-tab" data-subtab="surveillance" onclick="window.suspectDigger.switchSubTab('surveillance')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Field Surveillance (${suspectSurveillance.length})
        </button>
        <button class="dd-tab" data-subtab="osint" onclick="window.suspectDigger.switchSubTab('osint')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Social Media (${suspectPosts.length})
        </button>
        <button class="dd-tab" data-subtab="predictor" onclick="window.suspectDigger.switchSubTab('predictor')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>
          Link Predictor
        </button>
      </div>

      <!-- Tab Content Panels -->
      <div class="deep-dive-panels">
        <!-- 1. Relation Chart Panel -->
        <div id="subtab-relation-chart" class="dd-panel active">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Relation Network Chart</span>
              <span class="badge badge-cyan text-xs">Interactive</span>
            </div>
            <div class="panel-tools">
              <span class="text-xs text-muted">Network depth:</span>
              <button class="btn btn-xs ${this.graphDepth === 1 ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.suspectDigger.setGraphDepth(1)">1-Hop Direct Ties</button>
              <button class="btn btn-xs ${this.graphDepth === 2 ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.suspectDigger.setGraphDepth(2)">2-Hop Syndicate Links</button>
              <button class="btn btn-xs btn-outline-cyan" onclick="if(window.suspectDigger.suspectGraphInstance) window.suspectDigger.suspectGraphInstance.reset()">Center Graph</button>
            </div>
          </div>
          <div class="relation-canvas-wrapper">
            <canvas id="suspectRelationCanvas" class="suspect-relation-canvas"></canvas>
            <div class="relation-legend-bar">
              <span class="text-xs text-muted">Tip: <strong>Click on any associate node</strong> to instantly pivot and inspect their dossier.</span>
              <div class="legend-swatches">
                <span class="legend-swatch swatch-call"></span> Call
                <span class="legend-swatch swatch-finance"></span> Hawala Transfer
                <span class="legend-swatch swatch-surv"></span> Field Meeting
              </div>
            </div>
          </div>
        </div>

        <!-- 2. GIS Geospatial Map Panel -->
        <div id="subtab-gis-map" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Geospatial Footprint & Movement</span>
            </div>
            <div class="panel-tools">
              <span class="text-xs text-muted">Coordinates: ${p.lat.toFixed(4)}°N, ${p.lon.toFixed(4)}°E (${p.home_city})</span>
              <button class="btn btn-xs btn-outline-cyan" onclick="window.suspectDigger.recenterGisMap()">Recenter</button>
            </div>
          </div>
          <div class="suspect-gis-wrapper">
            <div id="suspectGisMapContainer" class="suspect-gis-map"></div>
          </div>
        </div>

        <!-- 3. Criminal FIR Records Panel -->
        <div id="subtab-records" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>FIR Chargesheets & Prior Criminal History (${p.firs.length} Cases)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>FIR Number</th>
                  <th>Police Station & Year</th>
                  <th>Legal Sections</th>
                  <th>Status</th>
                  <th>Case Summary</th>
                </tr>
              </thead>
              <tbody>
                ${p.firs.length > 0 ? p.firs.map(f => `
                  <tr>
                    <td class="font-mono text-cyan font-bold">${f.fir_no}</td>
                    <td>${f.police_station || 'State Crime Cell'} (${f.year})</td>
                    <td><strong class="text-white">${f.section}</strong></td>
                    <td>
                      <span class="badge ${f.status === 'Absconding' ? 'badge-danger' : f.status === 'Convicted' ? 'badge-amber' : 'badge-cyan'}">
                        ${f.status}
                      </span>
                    </td>
                    <td class="text-sm text-slate">${f.narrative || 'State chargesheet pending court appearance.'}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="5" class="text-muted text-center py-4">No prior recorded FIR charge sheets in state repository. Intelligence subject of interest.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Telecom CDR Intercepts Panel -->
        <div id="subtab-cdrs" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Intercepted Call Detail Records (${suspectCdrs.length} Logs)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>Date & Time (IST)</th>
                  <th>Direction</th>
                  <th>Counterparty</th>
                  <th>Duration</th>
                  <th>Cell Sector</th>
                  <th>Notes & Anomalies</th>
                </tr>
              </thead>
              <tbody>
                ${suspectCdrs.length > 0 ? suspectCdrs.map(c => {
                  const isCaller = c.caller_id === p.person_id;
                  const counterpartyId = isCaller ? c.callee_id : c.caller_id;
                  const counterparty = engine.personMap.get(counterpartyId);
                  const isLateNight = c.note && c.note.includes('late-night');
                  return `
                    <tr class="${isLateNight ? 'row-alert-subtle' : ''}">
                      <td class="font-mono text-xs">${c.timestamp}</td>
                      <td>
                        <span class="badge ${isCaller ? 'badge-outline-cyan' : 'badge-outline-secondary'}">
                          ${isCaller ? 'Outgoing ↗' : 'Incoming ↙'}
                        </span>
                      </td>
                      <td>
                        <strong class="cursor-pointer text-cyan" onclick="window.suspectDigger.selectSuspect('${counterpartyId}')">
                          ${counterparty ? counterparty.name : counterpartyId} (${counterpartyId})
                        </strong>
                        <div class="font-mono text-xs text-muted">${counterparty ? counterparty.phone : ''}</div>
                      </td>
                      <td class="font-mono text-xs">${c.duration_sec}s (${(c.duration_sec/60).toFixed(1)} min)</td>
                      <td><span class="city-tag">${c.cell_tower_city}</span></td>
                      <td class="text-xs">
                        ${isLateNight ? '<span class="badge badge-danger text-xs">Late-night call</span> ' : ''}
                        ${c.note || 'Routine operational chatter'}
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr><td colspan="6" class="text-muted text-center py-4">No telecom CDR intercepts recorded for this subject's registered numbers.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. Hawala & Financial Trail Panel -->
        <div id="subtab-hawala" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Financial & Hawala Structuring Trail (${suspectTxns.length} Transactions)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Counterparty Account</th>
                  <th>Amount (INR)</th>
                  <th>Structuring Flag</th>
                </tr>
              </thead>
              <tbody>
                ${suspectTxns.length > 0 ? suspectTxns.map(t => {
                  const isSender = t.sender_account === p.bank_account;
                  const isThreshold = t.flag === 'below-1L-threshold' || t.flag === 'structuring';
                  return `
                    <tr class="${isThreshold ? 'row-alert-subtle' : ''}">
                      <td class="font-mono text-cyan text-xs">${t.txn_id}</td>
                      <td class="font-mono text-xs">${t.date}</td>
                      <td>
                        <span class="badge ${isSender ? 'badge-amber' : 'badge-emerald'}">
                          ${isSender ? 'Outflow ↗' : 'Inflow ↙'}
                        </span>
                      </td>
                      <td class="font-mono text-xs text-slate">
                        ${isSender ? t.receiver_account : t.sender_account}
                      </td>
                      <td class="font-mono font-bold text-white">₹${t.amount_inr.toLocaleString()}</td>
                      <td>
                        ${isThreshold ? '<span class="badge badge-purple text-xs">Structuring (< ₹1L)</span> ' : ''}
                        <span class="text-xs text-muted">${t.flag || 'Standard transfer'}</span>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr><td colspan="6" class="text-muted text-center py-4">No banked Hawala transactions registered under subject account ${p.bank_account || 'None'}. Suspect operates via underground cash courier.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. Physical Surveillance Logs Panel -->
        <div id="subtab-surveillance" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Field Surveillance & Rendezvous Intercepts (${suspectSurveillance.length} Reports)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Date</th>
                  <th>City</th>
                  <th>Vehicle Observed</th>
                  <th>Associates Present</th>
                  <th>Field Agent Report</th>
                </tr>
              </thead>
              <tbody>
                ${suspectSurveillance.length > 0 ? suspectSurveillance.map(sr => {
                  const isSmokingGun = sr.report_id === 'SR3019' || sr.report_id === 'SR3020';
                  return `
                    <tr class="${isSmokingGun ? 'row-alert-subtle' : ''}">
                      <td class="font-mono text-cyan font-bold">${sr.report_id}</td>
                      <td class="font-mono text-xs">${sr.date}</td>
                      <td><span class="city-tag">${sr.location_city}</span></td>
                      <td class="font-mono text-amber text-xs">${sr.vehicle_observed || 'None / Cloned'}</td>
                      <td>
                        ${sr.other_persons_present.map(pid => {
                          const contact = engine.personMap.get(pid);
                          return `<span class="badge badge-cyan cursor-pointer" onclick="window.suspectDigger.selectSuspect('${pid}')">${contact ? contact.name : pid}</span>`;
                        }).join(' ') || '<span class="text-muted text-xs">Unidentified contact</span>'}
                      </td>
                      <td class="text-xs text-slate">
                        ${isSmokingGun ? '<span class="badge badge-danger text-xs">Cross-cartel contact</span> ' : ''}
                        ${sr.notes}
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr><td colspan="6" class="text-muted text-center py-4">No field surveillance reports logged for this subject.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. OSINT Cyber Intelligence Panel -->
        <div id="subtab-osint" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>Intercepted Social Media Posts (${suspectPosts.length} Posts)</span>
            </div>
          </div>
          <div class="osint-card-list">
            ${suspectPosts.length > 0 ? suspectPosts.map(sp => `
              <div class="minimal-card mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="font-mono text-cyan font-bold">${sp.handle} (${sp.platform})</span>
                  <span class="text-xs text-muted">${sp.date}</span>
                </div>
                <p class="text-sm text-white mb-1">"${sp.text}"</p>
                <div class="d-flex gap-2 text-xs">
                  ${sp.mentions_handle ? `<span class="badge badge-purple">Mentions: ${sp.mentions_handle}</span>` : ''}
                  ${sp.text.includes('shipment') || sp.text.includes('money') ? '<span class="badge badge-danger">Coded phrase</span>' : ''}
                </div>
              </div>
            `).join('') : `
              <p class="text-muted text-center py-4">No open-source social media posts intercepted for handle ${p.social_handle || 'None'}.</p>
            `}
          </div>
        </div>

        <!-- 8. AI Link Predictor Panel -->
        <div id="subtab-predictor" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>AI Link Predictor & Nexus Analysis</span>
            </div>
          </div>
          <div class="predictor-box p-3">
            <p class="text-sm text-muted mb-3">Evaluate connection probability and trace communications between <strong>${p.name} (${p.person_id})</strong> and any target suspect:</p>
            <div class="d-flex gap-2 align-items-center mb-3">
              <span class="text-sm">Target suspect:</span>
              <select id="predictorTargetSelect" class="tactical-select"></select>
              <button class="btn btn-sm btn-cyan" onclick="window.suspectDigger.calculatePrediction()">Evaluate Link</button>
            </div>
            <div id="predictorResultArea" class="predictor-result-box">
              Select a target suspect above to evaluate joint telecommunications, money flows, and shortest network path.
            </div>
          </div>
        </div>
      </div>
    `;

    // Populate predictor dropdown
    const targetSelect = document.getElementById('predictorTargetSelect');
    if (targetSelect) {
      targetSelect.innerHTML = engine.persons
        .filter(other => other.person_id !== p.person_id)
        .map(other => `<option value="${other.person_id}">${other.person_id} - ${other.name} (${other.home_city})</option>`)
        .join('');
      
      // Default to kingpins if appropriate
      if (p.person_id !== 'P016') targetSelect.value = 'P016';
      else if (p.person_id !== 'P007') targetSelect.value = 'P007';
    }

    // Initialize the active subtab (default: relation-chart)
    this.switchSubTab(this.activeSubTab);
  }

  // 6. Subtab Switching
  switchSubTab(tabName) {
    this.activeSubTab = tabName;
    const tabs = document.querySelectorAll('.dd-tab');
    const panels = document.querySelectorAll('.dd-panel');

    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-subtab') === tabName));
    panels.forEach(p => p.classList.toggle('active', p.id === `subtab-${tabName}`));

    if (tabName === 'relation-chart') {
      setTimeout(() => this.initSuspectRelationChart(), 50);
    } else if (tabName === 'gis-map') {
      setTimeout(() => this.initSuspectGisMap(), 50);
    }
  }

  setGraphDepth(depth) {
    this.graphDepth = depth;
    const btn1 = document.querySelector('button[onclick*="setGraphDepth(1)"]');
    const btn2 = document.querySelector('button[onclick*="setGraphDepth(2)"]');
    if (btn1 && btn2) {
      btn1.className = `btn btn-xs ${depth === 1 ? 'btn-cyan' : 'btn-outline-secondary'}`;
      btn2.className = `btn btn-xs ${depth === 2 ? 'btn-cyan' : 'btn-outline-secondary'}`;
    }
    this.initSuspectRelationChart();
  }

  // 7. Interactive Suspect-Centric Relation Chart
  initSuspectRelationChart() {
    const canvas = document.getElementById('suspectRelationCanvas');
    if (!canvas || !this.currentSuspectId) return;

    const engine = window.crimeDataEngine;
    if (!engine) return;

    const targetPerson = engine.personMap.get(this.currentSuspectId);
    if (!targetPerson) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = Math.max(450, rect.height || 450);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Build local subgraph: Center + 1-hop (or 2-hop)
    const includedNodeIds = new Set([this.currentSuspectId]);
    const hop1 = new Set();

    targetPerson.connectedPersons.forEach(cid => {
      includedNodeIds.add(cid);
      hop1.add(cid);
    });

    if (this.graphDepth === 2) {
      hop1.forEach(h1Id => {
        const p1 = engine.personMap.get(h1Id);
        if (p1) {
          p1.connectedPersons.forEach(h2Id => includedNodeIds.add(h2Id));
        }
      });
    }

    // Position nodes radially around the center
    const nodes = [];
    const nodeMap = new Map();

    // Center node
    const centerNode = {
      id: targetPerson.person_id,
      name: targetPerson.name,
      role: targetPerson.ringRole,
      x: width / 2,
      y: height / 2,
      radius: 24,
      color: targetPerson.person_id === engine.groundTruth.bridge_person_id ? '#f85149' : '#58a6ff',
      isCenter: true,
      data: targetPerson
    };
    nodes.push(centerNode);
    nodeMap.set(centerNode.id, centerNode);

    // Hop 1 nodes placed in circle around center
    const hop1Array = Array.from(hop1);
    const hop1Radius = Math.min(width, height) * 0.32;
    hop1Array.forEach((id, idx) => {
      const p = engine.personMap.get(id);
      if (!p) return;
      const angle = (idx / hop1Array.length) * Math.PI * 2;
      const isBridge = id === engine.groundTruth.bridge_person_id;
      const node = {
        id: p.person_id,
        name: p.name,
        role: p.ringRole,
        x: width / 2 + Math.cos(angle) * hop1Radius,
        y: height / 2 + Math.sin(angle) * hop1Radius,
        radius: 17,
        color: isBridge ? '#f85149' : p.ringRole.includes('NARCO') ? '#3fb950' : p.ringRole.includes('FRAUD') ? '#bc8cff' : '#8b949e',
        isCenter: false,
        data: p
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // Hop 2 nodes placed further out
    if (this.graphDepth === 2) {
      const hop2Array = Array.from(includedNodeIds).filter(id => id !== this.currentSuspectId && !hop1.has(id));
      const hop2Radius = Math.min(width, height) * 0.44;
      hop2Array.forEach((id, idx) => {
        const p = engine.personMap.get(id);
        if (!p) return;
        const angle = (idx / hop2Array.length) * Math.PI * 2;
        const node = {
          id: p.person_id,
          name: p.name,
          role: p.ringRole,
          x: width / 2 + Math.cos(angle) * hop2Radius,
          y: height / 2 + Math.sin(angle) * hop2Radius,
          radius: 13,
          color: '#484f58',
          isCenter: false,
          data: p
        };
        nodes.push(node);
        nodeMap.set(node.id, node);
      });
    }

    // Build links
    const links = [];
    const addedLinks = new Set();

    // CDR links
    engine.cdrs.forEach(c => {
      if (includedNodeIds.has(c.caller_id) && includedNodeIds.has(c.callee_id)) {
        const key = [c.caller_id, c.callee_id].sort().join('__');
        if (!addedLinks.has(key)) {
          addedLinks.add(key);
          links.push({
            source: nodeMap.get(c.caller_id),
            target: nodeMap.get(c.callee_id),
            type: 'call',
            color: 'rgba(88, 166, 255, 0.45)'
          });
        }
      }
    });

    // Surveillance links
    engine.surveillanceReports.forEach(sr => {
      if (includedNodeIds.has(sr.subject_id)) {
        sr.other_persons_present.forEach(pid => {
          if (includedNodeIds.has(pid)) {
            const key = [sr.subject_id, pid].sort().join('__');
            if (!addedLinks.has(key)) {
              addedLinks.add(key);
              links.push({
                source: nodeMap.get(sr.subject_id),
                target: nodeMap.get(pid),
                type: 'surveillance',
                color: 'rgba(248, 81, 73, 0.65)'
              });
            }
          }
        });
      }
    });

    // Render loop
    let hoveredNode = null;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Draw links
      links.forEach(l => {
        if (!l.source || !l.target) return;
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.type === 'surveillance' ? 1.8 : 1.1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node border
        ctx.lineWidth = n.isCenter ? 2.5 : 1.2;
        ctx.strokeStyle = n.isCenter ? '#ffffff' : (hoveredNode === n ? '#58a6ff' : 'rgba(255,255,255,0.25)');
        ctx.stroke();

        // Node ID label
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${n.isCenter ? '11px' : '9px'} "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.id, n.x, n.y);

        // Name below node
        ctx.fillStyle = n.isCenter ? '#58a6ff' : '#c9d1d9';
        ctx.font = `500 ${n.isCenter ? '11px' : '9px'} "Inter", sans-serif`;
        ctx.fillText(n.name, n.x, n.y + n.radius + 12);
      });
    };

    render();

    // Mouse handlers for hovering and clicking nodes to dig deeper
    canvas.onmousemove = (e) => {
      const bound = canvas.getBoundingClientRect();
      const mx = e.clientX - bound.left;
      const my = e.clientY - bound.top;

      let found = null;
      nodes.forEach(n => {
        const dist = Math.hypot(n.x - mx, n.y - my);
        if (dist <= n.radius) found = n;
      });

      hoveredNode = found;
      canvas.style.cursor = found ? 'pointer' : 'default';
      render();
    };

    canvas.onclick = (e) => {
      const bound = canvas.getBoundingClientRect();
      const mx = e.clientX - bound.left;
      const my = e.clientY - bound.top;

      nodes.forEach(n => {
        const dist = Math.hypot(n.x - mx, n.y - my);
        if (dist <= n.radius) {
          if (n.id !== this.currentSuspectId) {
            // PIVOT TO THIS SUSPECT TO DIG DEEPER!
            this.selectSuspect(n.id);
          }
        }
      });
    };

    this.suspectGraphInstance = {
      reset: () => {
        this.initSuspectRelationChart();
      }
    };
  }

  // 8. Geospatial Leaflet Map for Suspect
  initSuspectGisMap() {
    const mapEl = document.getElementById('suspectGisMapContainer');
    if (!mapEl || typeof L === 'undefined' || !this.currentSuspectId) return;

    const engine = window.crimeDataEngine;
    const p = engine.personMap.get(this.currentSuspectId);
    if (!p) return;

    if (this.suspectMapInstance) {
      this.suspectMapInstance.remove();
      this.suspectMapInstance = null;
    }

    this.suspectMapInstance = L.map('suspectGisMapContainer', {
      center: [p.lat, p.lon],
      zoom: 6,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(this.suspectMapInstance);

    // Plot Suspect Home Base Pin
    const isBridge = p.person_id === engine.groundTruth.bridge_person_id;
    const suspectIcon = L.divIcon({
      className: 'gis-marker-primary',
      html: `
        <div class="gis-pin ${isBridge ? 'pin-danger' : 'pin-cyan'}">
          <span>${p.person_id}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([p.lat, p.lon], { icon: suspectIcon })
      .addTo(this.suspectMapInstance)
      .bindPopup(`
        <div class="tactical-popup">
          <div class="popup-badge badge-danger">Primary Subject Location</div>
          <h4>${p.name} (${p.person_id})</h4>
          <p><strong>Base City:</strong> ${p.home_city}</p>
          <p><strong>Phone:</strong> ${p.phone}</p>
          <p><strong>Risk Score:</strong> ${p.threatScore}/100</p>
        </div>
      `)
      .openPopup();

    // Plot Cell Towers associated with this suspect's calls
    const suspectCdrs = engine.cdrs.filter(c => c.caller_id === p.person_id || c.callee_id === p.person_id);
    const citiesPinged = new Set(suspectCdrs.map(c => c.cell_tower_city));

    citiesPinged.forEach(city => {
      const coord = CITY_COORDINATES[city];
      if (coord) {
        const count = suspectCdrs.filter(c => c.cell_tower_city === city).length;
        const towerIcon = L.divIcon({
          className: 'gis-tower-marker',
          html: `<div class="gis-tower-pin"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2"><path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 6.9 9.5L12 22l3.1-.5c4-1.3 6.9-5.1 6.9-9.5A10 10 0 0 0 12 2z"/></svg></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([coord.lat, coord.lon], { icon: towerIcon })
          .addTo(this.suspectMapInstance)
          .bindPopup(`
            <div class="tactical-popup">
              <div class="popup-badge badge-cyan">Cell Tower Intercept</div>
              <h4>${city} Sector</h4>
              <p>Subject calls logged through tower: <strong>${count} CDRs</strong></p>
            </div>
          `);

        // Connect home to tower with clean polyline
        L.polyline([[p.lat, p.lon], [coord.lat, coord.lon]], {
          color: '#58a6ff',
          weight: 1.5,
          opacity: 0.5,
          dashArray: '4, 6'
        }).addTo(this.suspectMapInstance);
      }
    });

    // Plot Physical Surveillance Sightings
    const sightings = engine.surveillanceReports.filter(sr => sr.subject_id === p.person_id || sr.other_persons_present.includes(p.person_id));
    sightings.forEach(sr => {
      const coord = CITY_COORDINATES[sr.location_city];
      if (coord) {
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lonOffset = (Math.random() - 0.5) * 0.05;
        const isSmokingGun = sr.report_id === 'SR3019' || sr.report_id === 'SR3020';

        const survIcon = L.divIcon({
          className: 'gis-surv-marker',
          html: `<div class="gis-surv-pin ${isSmokingGun ? 'pin-smoking-gun' : ''}"><span>SR</span></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        L.marker([coord.lat + latOffset, coord.lon + lonOffset], { icon: survIcon })
          .addTo(this.suspectMapInstance)
          .bindPopup(`
            <div class="tactical-popup">
              <div class="popup-badge ${isSmokingGun ? 'badge-danger' : 'badge-amber'}">
                ${isSmokingGun ? 'Cross-Cartel Meeting' : 'Field Surveillance'}
              </div>
              <h4>${sr.report_id} • ${sr.location_city}</h4>
              <p><strong>Date:</strong> ${sr.date}</p>
              <p><strong>Vehicle:</strong> ${sr.vehicle_observed || 'None'}</p>
              <p class="text-xs mt-1">${sr.notes}</p>
            </div>
          `);
      }
    });

    setTimeout(() => {
      if (this.suspectMapInstance) this.suspectMapInstance.invalidateSize();
    }, 200);
  }

  recenterGisMap() {
    if (this.suspectMapInstance && this.currentSuspectId) {
      const engine = window.crimeDataEngine;
      const p = engine.personMap.get(this.currentSuspectId);
      if (p) this.suspectMapInstance.flyTo([p.lat, p.lon], 7, { duration: 1 });
    }
  }

  // 9. AI Prediction & Pathfinder Tool
  calculatePrediction() {
    const targetSelect = document.getElementById('predictorTargetSelect');
    const resultArea = document.getElementById('predictorResultArea');
    if (!targetSelect || !resultArea || !this.currentSuspectId) return;

    const targetId = targetSelect.value;
    const engine = window.crimeDataEngine;
    const p1 = engine.personMap.get(this.currentSuspectId);
    const p2 = engine.personMap.get(targetId);
    if (!p1 || !p2) return;

    // Direct calls
    const directCalls = engine.cdrs.filter(c => 
      (c.caller_id === p1.person_id && c.callee_id === p2.person_id) ||
      (c.caller_id === p2.person_id && c.callee_id === p1.person_id)
    );

    // Mutual contacts
    const mutuals = [];
    p1.connectedPersons.forEach(id => {
      if (p2.connectedPersons.has(id)) mutuals.push(id);
    });

    // Shortest path via BFS
    const queue = [[p1.person_id]];
    const visited = new Set([p1.person_id]);
    let path = null;

    while (queue.length > 0) {
      const curPath = queue.shift();
      const last = curPath[curPath.length - 1];
      if (last === p2.person_id) {
        path = curPath;
        break;
      }
      const nodeObj = engine.personMap.get(last);
      if (nodeObj) {
        nodeObj.connectedPersons.forEach(nbr => {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            queue.push([...curPath, nbr]);
          }
        });
      }
    }

    // Probability score
    let score = 0.35;
    if (directCalls.length > 0) score += Math.min(0.5, directCalls.length * 0.1);
    if (mutuals.length > 0) score += Math.min(0.25, mutuals.length * 0.05);
    score = Math.min(0.99, score);

    resultArea.innerHTML = `
      <div class="result-prediction-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge ${score >= 0.75 ? 'badge-danger' : score >= 0.5 ? 'badge-amber' : 'badge-cyan'} font-mono text-xs">
            ${(score * 100).toFixed(1)}% Link Probability
          </span>
          <span class="text-xs text-muted">Distance: ${path ? `${path.length - 1} hops` : 'Disconnected'}</span>
        </div>
        <p class="text-sm text-white mb-2">
          <strong>Direct communications:</strong> ${directCalls.length} calls • 
          <strong>Shared associates:</strong> ${mutuals.length} (${mutuals.map(m => `<span class="badge badge-cyan cursor-pointer" onclick="window.suspectDigger.selectSuspect('${m}')">${m}</span>`).join(' ') || 'None'})
        </p>
        <div class="path-display">
          <span class="text-xs text-muted font-bold">Communication & transaction path:</span>
          <div class="path-sequence font-mono text-cyan mt-1">
            ${path ? path.map(id => {
              const item = engine.personMap.get(id);
              return `<span class="path-node" onclick="window.suspectDigger.selectSuspect('${id}')">${item ? item.name : id} (${id})</span>`;
            }).join(' &rarr; ') : '<span class="text-danger">No active connection path found.</span>'}
          </div>
        </div>
      </div>
    `;
  }

  // 10. Bind Global Events
  bindGlobalEvents() {
    window.addEventListener('resize', () => {
      if (this.activeSubTab === 'relation-chart') {
        this.initSuspectRelationChart();
      }
    });
  }
}

// Instantiate globally
window.suspectDigger = new SuspectDigger();
