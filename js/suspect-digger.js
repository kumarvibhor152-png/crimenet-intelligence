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

  // 1. Render Google-Style Search Interface
  renderSearchHome() {
    const container = document.getElementById('tab-search');
    if (!container) return;

    container.innerHTML = `
      <div id="searchViewWrapper" class="search-view-wrapper">
        <!-- Google Search Home View -->
        <div id="googleSearchHome" class="google-search-home ${this.currentSuspectId ? 'd-none' : ''}">
          <div class="google-brand-zone">
            <div class="google-emblem">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <circle cx="12" cy="11" r="3"/>
                <path d="M12 14v4M10 16h4"/>
              </svg>
            </div>
            <h1 class="google-title">POLICENET <span class="text-cyan">INTELLIGENCE</span></h1>
            <p class="google-subtitle">State Police CID & Central Intelligence Command • National Criminal Database</p>
          </div>

          <!-- Main Google-Style Search Box -->
          <div class="google-search-box-wrap">
            <div class="google-search-bar">
              <span class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input type="text" id="mainSuspectSearchInput" class="google-search-input" 
                placeholder="Search suspect name, alias, ID, phone, vehicle, or FIR no..." autocomplete="off" autofocus>
              <button id="clearMainSearchBtn" class="clear-search-btn d-none" title="Clear input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button id="btnExecuteSearch" class="btn-search-go" title="Search Database">
                <span>Search</span>
              </button>
            </div>

            <!-- Instant Autocomplete Dropdown -->
            <div id="mainSearchDropdown" class="google-autocomplete-dropdown"></div>
          </div>

          <!-- Quick Query Target Chips -->
          <div class="quick-chips-zone">
            <span class="chips-label">Priority Targets of Interest:</span>
            <div class="chips-list">
              <button class="chip chip-danger" onclick="window.suspectDigger.selectSuspect('P004')">
                <span class="chip-dot dot-danger"></span>
                <strong>Kunal Khan</strong> (P004 • Covert Conduit)
              </button>
              <button class="chip chip-emerald" onclick="window.suspectDigger.selectSuspect('P016')">
                <span class="chip-dot dot-emerald"></span>
                <strong>Priya Pillai</strong> (P016 • Narco Kingpin)
              </button>
              <button class="chip chip-purple" onclick="window.suspectDigger.selectSuspect('P007')">
                <span class="chip-dot dot-purple"></span>
                <strong>Anil Gupta</strong> (P007 • Fraud Kingpin)
              </button>
              <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P003')">
                <span>Ahmed Singh (P003)</span>
              </button>
              <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P002')">
                <span>Zoya Verma (P002)</span>
              </button>
              <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P009')">
                <span>Farhan Nair (P009)</span>
              </button>
              <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P010')">
                <span>Faisal Joshi (P010)</span>
              </button>
              <button class="chip chip-neutral" onclick="window.suspectDigger.selectSuspect('P032')">
                <span>Priya Rao (P032)</span>
              </button>
            </div>
          </div>

          <!-- Quick Intelligence Summary Banner -->
          <div class="google-stats-strip">
            <div class="stat-pill"><span class="pill-num">40</span> Monitored Suspects</div>
            <div class="stat-pill"><span class="pill-num">10</span> Shell Entities / Hubs</div>
            <div class="stat-pill"><span class="pill-num">122</span> Telecom CDRs</div>
            <div class="stat-pill"><span class="pill-num">68</span> Hawala Txns</div>
            <div class="stat-pill"><span class="pill-num">20</span> Field Surveillance Logs</div>
            <div class="stat-pill"><span class="pill-num">16</span> Recorded FIRs</div>
          </div>
        </div>

        <!-- Suspect Deep-Dive Investigation Workspace -->
        <div id="suspectDossierWorkspace" class="suspect-workspace ${this.currentSuspectId ? '' : 'd-none'}">
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
                placeholder="Search another suspect, phone, vehicle, or FIR..." autocomplete="off">
              <div id="stickySearchDropdown" class="google-autocomplete-dropdown sticky-dropdown"></div>
            </div>
            <div class="sticky-actions">
              <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Case Dossier
              </button>
            </div>
          </div>

          <!-- Dynamic Deep-Dive Content Injected Here -->
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

      const results = this.querySuspects(q).slice(0, 7);
      if (results.length > 0) {
        dropdownEl.innerHTML = results.map(p => {
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
        dropdownEl.classList.add('active');
      } else {
        dropdownEl.innerHTML = `
          <div class="autocomplete-empty">
            No matching suspects, phones, or FIRs found for "${q}".
          </div>
        `;
        dropdownEl.classList.add('active');
      }
    };

    if (mainInput && mainDropdown) {
      mainInput.addEventListener('input', () => handleInput(mainInput, mainDropdown, clearBtn));
      mainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const matches = this.querySuspects(mainInput.value);
          if (matches.length > 0) {
            this.selectSuspect(matches[0].person_id);
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
        const matches = this.querySuspects(mainInput.value);
        if (matches.length > 0) {
          this.selectSuspect(matches[0].person_id);
        }
      });
    }

    if (stickyInput && stickyDropdown) {
      stickyInput.addEventListener('input', () => handleInput(stickyInput, stickyDropdown, null));
      stickyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const matches = this.querySuspects(stickyInput.value);
          if (matches.length > 0) {
            this.selectSuspect(matches[0].person_id);
          }
        }
      });
    }

    const backBtn = document.getElementById('btnBackToHome');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentSuspectId = null;
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
      <!-- Knowledge Card Header (Google Style Profile Card) -->
      <div class="suspect-knowledge-card">
        <div class="sk-top-row">
          <div class="sk-profile-identity">
            <div class="sk-avatar-box ${isBridge ? 'avatar-bridge' : ''}">
              <span class="sk-avatar-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${isBridge ? '#ef4444' : '#38bdf8'}" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <span class="sk-avatar-id font-mono">${p.person_id}</span>
            </div>
            <div class="sk-title-block">
              <div class="sk-header-tags">
                <span class="tag-case-id font-mono">FILE: CR-${p.person_id}/2025</span>
                ${isBridge ? '<span class="badge badge-danger font-mono text-xs">CRITICAL // CROSS-CARTEL CONDUIT</span>' : ''}
                ${isAbs ? '<span class="badge badge-danger text-xs">ABSCONDING FUGITIVE</span>' : ''}
                ${isConv ? '<span class="badge badge-amber text-xs">CONVICTED</span>' : '<span class="badge badge-cyan text-xs">UNDER INVESTIGATION</span>'}
                ${isSmurfing ? '<span class="badge badge-purple text-xs">HAWALA STRUCTURING NEXUS</span>' : ''}
              </div>
              <h2 class="sk-suspect-name">${p.name.toUpperCase()}</h2>
              <div class="sk-role-line">
                <span class="text-muted">AI Classified Role:</span>
                <strong class="sk-role-highlight ${(p.ai_predicted_role || '').includes('Kingpin') || (p.ai_predicted_role || '').includes('Linchpin') ? 'text-danger' : 'text-cyan'}">
                  ${p.ai_predicted_role || p.ringRole || 'Field Operative'}
                </strong>
                <span class="sk-conf-pill font-mono">${((p.ai_confidence || 0.985) * 100).toFixed(1)}% AI Confidence</span>
              </div>
            </div>
          </div>

          <!-- Threat Assessment Gauge -->
          <div class="sk-threat-gauge-box">
            <div class="gauge-label">THREAT SCORE</div>
            <div class="gauge-number ${p.threatScore >= 70 ? 'text-danger' : p.threatScore >= 40 ? 'text-amber' : 'text-cyan'}">
              ${p.threatScore}<span class="gauge-max">/100</span>
            </div>
            <div class="gauge-bar-track">
              <div class="gauge-bar-fill ${p.threatScore >= 70 ? 'bg-danger' : 'bg-cyan'}" style="width: ${p.threatScore}%"></div>
            </div>
            <div class="gauge-sub font-mono text-xs text-muted">Betweenness: ${(p.betweennessCentrality * 100).toFixed(1)}%</div>
          </div>
        </div>

        <!-- Ground Truth Bridge Revelation Banner (If Kunal Khan P004) -->
        ${isBridge ? `
          <div class="ground-truth-alert-box">
            <div class="alert-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="alert-text">
              <strong>OFFICER CRITICAL ALERT: PRIMARY DUAL-RING CONDUIT LINCHPIN</strong>
              <p>
                Kunal Khan is the single operational bridge connecting the <strong>Narcotics Trafficking Ring (P016 Priya Pillai)</strong> 
                and the <strong>Financial Fraud & Extortion Ring (P007 Anil Gupta)</strong>. 
                He was deliberately <em>omitted from joint FIR chargesheets</em>, but field surveillance reports 
                <strong>SR3019</strong> (meeting Priya Pillai at her Nagpur safehouse) and <strong>SR3020</strong> 
                (handover with Anil Gupta at Sunrise Money Exchange) unequivocally substantiate his cross-cartel coordination role.
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Suspect Metadata Grid -->
        <div class="sk-meta-grid">
          <div class="meta-item">
            <span class="meta-label">AGE / JURISDICTION</span>
            <span class="meta-value">${p.age} yrs • ${p.home_city}, India</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">PRIMARY TELEPHONE</span>
            <span class="meta-value font-mono text-cyan">${p.phone}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">BURNER / ALT PHONE</span>
            <span class="meta-value font-mono">${p.alt_phone || 'None Registered'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">SURVEILLANCE VEHICLE</span>
            <span class="meta-value font-mono text-amber">${p.vehicle_no || 'Unregistered / Cloned Plate'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">REGISTERED BANK ACCOUNT</span>
            <span class="meta-value font-mono">${p.bank_account || 'Cash Operative / Unbanked'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">OSINT SOCIAL INTEL</span>
            <span class="meta-value">${p.social_handle ? `${p.social_handle} (${p.social_platform})` : 'Underground / No Open Socials'}</span>
          </div>
        </div>

        <!-- Quick Summary Metrics Bar -->
        <div class="sk-metric-counters">
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('records')">
            <span class="counter-num text-amber">${p.firs.length}</span>
            <span class="counter-name">Chargesheet FIRs</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('relation-chart')">
            <span class="counter-num text-cyan">${directAssociates.length}</span>
            <span class="counter-name">Direct Associates</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('cdrs')">
            <span class="counter-num text-cyan">${suspectCdrs.length}</span>
            <span class="counter-name">CDR Intercepts</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('hawala')">
            <span class="counter-num text-purple">${suspectTxns.length}</span>
            <span class="counter-name">Hawala Transfers</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('surveillance')">
            <span class="counter-num text-rose">${suspectSurveillance.length}</span>
            <span class="counter-name">Field Sightings</span>
          </div>
          <div class="metric-counter" onclick="window.suspectDigger.switchSubTab('gis-map')">
            <span class="counter-num text-emerald">1</span>
            <span class="counter-name">GIS Footprint</span>
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
          GIS Geospatial Map
        </button>
        <button class="dd-tab" data-subtab="records" onclick="window.suspectDigger.switchSubTab('records')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Criminal FIR Records (${p.firs.length})
        </button>
        <button class="dd-tab" data-subtab="cdrs" onclick="window.suspectDigger.switchSubTab('cdrs')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Telecom CDR Intercepts (${suspectCdrs.length})
        </button>
        <button class="dd-tab" data-subtab="hawala" onclick="window.suspectDigger.switchSubTab('hawala')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Hawala & Financial Trail (${suspectTxns.length})
        </button>
        <button class="dd-tab" data-subtab="surveillance" onclick="window.suspectDigger.switchSubTab('surveillance')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Field Surveillance Logs (${suspectSurveillance.length})
        </button>
        <button class="dd-tab" data-subtab="osint" onclick="window.suspectDigger.switchSubTab('osint')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          OSINT Social Posts (${suspectPosts.length})
        </button>
        <button class="dd-tab" data-subtab="predictor" onclick="window.suspectDigger.switchSubTab('predictor')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>
          AI Link Predictor & Nexus
        </button>
      </div>

      <!-- Tab Content Panels -->
      <div class="deep-dive-panels">
        <!-- 1. Relation Chart Panel -->
        <div id="subtab-relation-chart" class="dd-panel active">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>SUSPECT-CENTRIC RELATION NETWORK CHART</span>
              <span class="badge badge-cyan text-xs">INTERACTIVE</span>
            </div>
            <div class="panel-tools">
              <span class="text-xs text-muted">Network Depth:</span>
              <button class="btn btn-xs ${this.graphDepth === 1 ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.suspectDigger.setGraphDepth(1)">1-Hop Direct Ties</button>
              <button class="btn btn-xs ${this.graphDepth === 2 ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.suspectDigger.setGraphDepth(2)">2-Hop Syndicate Links</button>
              <button class="btn btn-xs btn-outline-cyan" onclick="if(window.suspectDigger.suspectGraphInstance) window.suspectDigger.suspectGraphInstance.reset()">Center Graph</button>
            </div>
          </div>
          <div class="relation-canvas-wrapper">
            <canvas id="suspectRelationCanvas" class="suspect-relation-canvas"></canvas>
            <div class="relation-legend-bar">
              <span class="text-xs text-muted">Tip: <strong>Click on any associate node</strong> to instantly pivot and dig deeper into their dossier.</span>
              <div class="legend-swatches">
                <span class="legend-swatch swatch-call"></span> Telecom Call
                <span class="legend-swatch swatch-finance"></span> Hawala Transfer
                <span class="legend-swatch swatch-surv"></span> Surveillance Meeting
              </div>
            </div>
          </div>
        </div>

        <!-- 2. GIS Geospatial Map Panel -->
        <div id="subtab-gis-map" class="dd-panel">
          <div class="panel-header-minimal">
            <div class="panel-title-minimal">
              <span>GEOSPATIAL TACTICAL FOOTPRINT & CORRIDORS</span>
            </div>
            <div class="panel-tools">
              <span class="text-xs text-muted">Coordinates: ${p.lat.toFixed(4)}°N, ${p.lon.toFixed(4)}°E (${p.home_city})</span>
              <button class="btn btn-xs btn-outline-cyan" onclick="window.suspectDigger.recenterGisMap()">Recenter on Suspect</button>
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
              <span>CHARGESHEET & PRIOR CRIMINAL FIR REGISTER (${p.firs.length} CASES)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>FIR NUMBER</th>
                  <th>STATION / YEAR</th>
                  <th>LEGAL SECTIONS</th>
                  <th>COURT STATUS</th>
                  <th>INVESTIGATIVE NARRATIVE</th>
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
                    <td class="text-sm text-slate">${f.narrative || 'State CID chargesheet pending court appearance.'}</td>
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
              <span>INTERCEPTED TELECOM CDR COMMUNICATIONS (${suspectCdrs.length} LOGS)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>DATE & TIME (IST)</th>
                  <th>COMMUNICATION TYPE</th>
                  <th>INTERCEPTED COUNTERPARTY</th>
                  <th>DURATION</th>
                  <th>CELL TOWER LOCATION</th>
                  <th>OPERATIONAL FLAGS</th>
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
                          ${isCaller ? 'OUTGOING CALL ↗' : 'INCOMING CALL ↙'}
                        </span>
                      </td>
                      <td>
                        <strong class="cursor-pointer text-cyan" onclick="window.suspectDigger.selectSuspect('${counterpartyId}')">
                          ${counterparty ? counterparty.name : counterpartyId} (${counterpartyId})
                        </strong>
                        <div class="font-mono text-xs text-muted">${counterparty ? counterparty.phone : ''}</div>
                      </td>
                      <td class="font-mono text-xs">${c.duration_sec}s (${(c.duration_sec/60).toFixed(1)} min)</td>
                      <td><span class="city-tag">${c.cell_tower_city} Sector</span></td>
                      <td class="text-xs">
                        ${isLateNight ? '<span class="badge badge-danger text-xs">NOCTURNAL BURST</span> ' : ''}
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
              <span>SECTION 12 PMLA FINANCIAL & HAWALA SMURFING TRAIL (${suspectTxns.length} TXNS)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>TXN ID</th>
                  <th>DATE</th>
                  <th>DIRECTION</th>
                  <th>COUNTERPARTY / ACCOUNT</th>
                  <th>AMOUNT (INR)</th>
                  <th>STRUCTURING ANOMALY</th>
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
                          ${isSender ? 'OUTFLOW ↗' : 'INFLOW ↙'}
                        </span>
                      </td>
                      <td class="font-mono text-xs text-slate">
                        ${isSender ? t.receiver_account : t.sender_account}
                      </td>
                      <td class="font-mono font-bold text-white">₹${t.amount_inr.toLocaleString()}</td>
                      <td>
                        ${isThreshold ? '<span class="badge badge-purple text-xs">SMURFING (< ₹1L)</span> ' : ''}
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
              <span>FIELD SURVEILLANCE & RENDEZVOUS INTERCEPTS (${suspectSurveillance.length} REPORTS)</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>REPORT</th>
                  <th>DATE</th>
                  <th>CITY</th>
                  <th>VEHICLE OBSERVED</th>
                  <th>OTHER SUSPECTS PRESENT</th>
                  <th>FIELD AGENT OPERATIONAL REPORT</th>
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
                        ${isSmokingGun ? '<span class="badge badge-danger text-xs">SMOKING GUN</span> ' : ''}
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
              <span>INTERCEPTED OSINT SOCIAL MEDIA POSTS (${suspectPosts.length} POSTS)</span>
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
                  ${sp.text.includes('shipment') || sp.text.includes('money') ? '<span class="badge badge-danger">CODED SYNDICATE LANGUAGE</span>' : ''}
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
              <span>NEURAL LINK PREDICTOR & MULTI-HOP PATHFINDER</span>
            </div>
          </div>
          <div class="predictor-box p-3">
            <p class="text-sm text-muted mb-3">Calculate criminal association probability and trace communications between <strong>${p.name} (${p.person_id})</strong> and any target suspect:</p>
            <div class="d-flex gap-2 align-items-center mb-3">
              <span class="text-sm">Target Suspect:</span>
              <select id="predictorTargetSelect" class="tactical-select"></select>
              <button class="btn btn-sm btn-cyan" onclick="window.suspectDigger.calculatePrediction()">Calculate Nexus</button>
            </div>
            <div id="predictorResultArea" class="predictor-result-box">
              Select a target suspect above to evaluate joint telecommunications, money flows, and shortest graph hops.
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
      radius: 26,
      color: targetPerson.person_id === engine.groundTruth.bridge_person_id ? '#ef4444' : '#38bdf8',
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
        radius: 18,
        color: isBridge ? '#ef4444' : p.ringRole.includes('NARCO') ? '#10b981' : p.ringRole.includes('FRAUD') ? '#8b5cf6' : '#64748b',
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
          radius: 14,
          color: '#475569',
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
            color: '#38bdf8'
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
                color: '#f43f5e'
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
        ctx.lineWidth = l.type === 'surveillance' ? 2 : 1.2;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // White border
        ctx.lineWidth = n.isCenter ? 3 : 1.5;
        ctx.strokeStyle = n.isCenter ? '#ffffff' : (hoveredNode === n ? '#38bdf8' : 'rgba(255,255,255,0.4)');
        ctx.stroke();

        // Node ID label
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${n.isCenter ? '12px' : '10px'} "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.id, n.x, n.y);

        // Name below node
        ctx.fillStyle = n.isCenter ? '#38bdf8' : '#e2e8f0';
        ctx.font = `500 ${n.isCenter ? '12px' : '10px'} "Inter", sans-serif`;
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
          <div class="popup-badge badge-danger">PRIMARY SUBJECT LOCATION</div>
          <h4>${p.name} (${p.person_id})</h4>
          <p><strong>Base City:</strong> ${p.home_city}</p>
          <p><strong>Phone:</strong> ${p.phone}</p>
          <p><strong>Threat Level:</strong> ${p.threatScore}/100</p>
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
          html: `<div class="gis-tower-pin"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 6.9 9.5L12 22l3.1-.5c4-1.3 6.9-5.1 6.9-9.5A10 10 0 0 0 12 2z"/></svg></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([coord.lat, coord.lon], { icon: towerIcon })
          .addTo(this.suspectMapInstance)
          .bindPopup(`
            <div class="tactical-popup">
              <div class="popup-badge badge-cyan">TELECOM TOWER INTERCEPT</div>
              <h4>${city.toUpperCase()} CELL SECTOR</h4>
              <p>Subject calls logged through this tower: <strong>${count} CDRs</strong></p>
            </div>
          `);

        // Connect home to tower with clean polyline
        L.polyline([[p.lat, p.lon], [coord.lat, coord.lon]], {
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.6,
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
                ${isSmokingGun ? 'SMOKING GUN MEETING' : 'SURVEILLANCE RENDEZVOUS'}
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
            ${(score * 100).toFixed(1)}% AI CRIMINAL LINK PROBABILITY
          </span>
          <span class="text-xs text-muted">Distance: ${path ? `${path.length - 1} Hops` : 'Disconnected'}</span>
        </div>
        <p class="text-sm text-white mb-2">
          <strong>Direct Communications:</strong> ${directCalls.length} Intercepted Calls • 
          <strong>Shared Associates:</strong> ${mutuals.length} (${mutuals.map(m => `<span class="badge badge-cyan cursor-pointer" onclick="window.suspectDigger.selectSuspect('${m}')">${m}</span>`).join(' ') || 'None'})
        </p>
        <div class="path-display">
          <span class="text-xs text-muted font-bold">COMMUNICATION & FINANCES TRACE ROUTE:</span>
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
