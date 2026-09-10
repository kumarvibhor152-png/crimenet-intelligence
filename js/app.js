/**
 * DRISHTI-CRIMENEXUS MASTER APPLICATION CONTROLLER
 * Tab management, global search, graph inspector callbacks, tactical audio,
 * surveillance renderer, and OSINT social intelligence explorer.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTacticalClock();
  initAudioFeedback();
  if (window.suspectDigger) window.suspectDigger.init();
  initTabs();
  initBackendConnection();
  initGlobalSearch();
  initOverviewTab();
  initSuspectDirectoryTab();
  initSurveillanceTab();
  initOSINTTab();
  initGraphTabControls();
  if (window.dataLabInstance) window.dataLabInstance.init();
});

// 1. Tactical Clock & Live Telemetry
function initTacticalClock() {
  const clockEl = document.getElementById('tacticalClock');
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.textContent = `${now.toISOString().replace('T', ' ').substring(0, 19)} IST`;
  };
  setInterval(update, 1000);
  update();
}

// 2. Audio Feedback - Disabled for silent, authoritative police workstation standard
function initAudioFeedback() {
  // Silent operational standard for law enforcement systems
}

function playTacticalBeep() {
  // Silent operational standard - no audio beeps
}

// 3. Tab Switching
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-view');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetEl = document.getElementById(`tab-${targetTab}`);
      if (targetEl) targetEl.classList.add('active');

      playTacticalBeep(1200, 'triangle', 0.04);

      if (targetTab === 'search' && window.suspectDigger) {
        if (window.suspectDigger.currentSuspectId) {
          if (window.suspectDigger.activeSubTab === 'relation-chart') {
            window.suspectDigger.initSuspectRelationChart();
          } else if (window.suspectDigger.activeSubTab === 'gis-map') {
            window.suspectDigger.initSuspectGisMap();
          }
        }
      }

      if (targetTab === 'datalab' && window.dataLabInstance) {
        window.dataLabInstance.init();
      }

      if (targetTab === 'graph' && !window.graphInstance) {
        window.graphInstance = new window.TacticalGraphEngine('graphCanvas');
        if (window.dataLabInstance) window.dataLabInstance.initNeuralLinkPredictor();
      } else if (targetTab === 'graph' && window.graphInstance) {
        window.graphInstance.initCanvasSize();
        if (window.dataLabInstance) window.dataLabInstance.initNeuralLinkPredictor();
      }

      if (targetTab === 'gis' && !window.gisMapInstance) {
        window.gisMapInstance = new window.TacticalGISMap('gisMapContainer');
      } else if (targetTab === 'gis' && window.gisMapInstance && window.gisMapInstance.map) {
        setTimeout(() => window.gisMapInstance.map.invalidateSize(), 200);
      }

      if (targetTab === 'hawala' && !window.hawalaRadarInstance) {
        window.hawalaRadarInstance = new window.HawalaRadar('hawalaContainer');
      }

      if (targetTab === 'cdr' && !window.cdrEngineInstance) {
        window.cdrEngineInstance = new window.CDREngine('cdrContainer');
      }

      if (targetTab === 'nlp' && !window.nlpEngineInstance) {
        window.nlpEngineInstance = new window.NLPEngine('nlpContainer');
      }

      if (targetTab === 'osint') {
        if (!window.osintEngineInstance && window.OSINTEngine) {
          window.osintEngineInstance = new window.OSINTEngine('osintContainer');
          window.osintEngineInstance.init();
        } else if (window.osintEngineInstance) {
          window.osintEngineInstance.render();
        }
      }

      if (targetTab === 'aimodel' && !window.aiModelLabInstance) {
        window.aiModelLabInstance = new window.AIModelLabView('aiModelLabContainer');
        window.aiModelLabInstance.init();
      }
    });
  });
}

// 3.5. Backend AI Connection & Suspect Enrichment
async function initBackendConnection() {
  const beacon = document.getElementById('backendStatusBeacon');
  if (window.CrimeNetAPI) {
    window.CrimeNetAPI.onStatusChange((status, details) => {
      if (beacon) {
        if (status === 'ONLINE') {
          beacon.textContent = '● AI BACKEND ONLINE (PyTorch v2.9.1)';
          beacon.className = 'badge-pulse-online font-mono text-xs';
        } else {
          beacon.textContent = '○ AI SIMULATOR (OFFLINE)';
          beacon.className = 'badge-offline font-mono text-xs';
        }
      }
    });

    const health = await window.CrimeNetAPI.checkHealth();
    if (health) {
      const enriched = await window.CrimeNetAPI.getSuspects();
      if (enriched && window.crimeDataEngine) {
        enriched.forEach(es => {
          const p = window.crimeDataEngine.personMap.get(es.person_id);
          if (p) {
            p.ai_predicted_role = es.ai_predicted_role;
            p.ai_confidence = es.ai_confidence;
            p.ai_threat_score = es.ai_threat_score;
          }
        });
        initSuspectDirectoryTab();
      }
    }
  }
}

// 4. Executive Overview Initializer
function initOverviewTab() {
  const engine = window.crimeDataEngine;
  if (!engine) return;

  const influencerListEl = document.getElementById('keyInfluencersList');
  if (influencerListEl) {
    const sorted = [...engine.persons].sort((a, b) => (b.betweennessCentrality * 0.5 + (b.threatScore/100)*0.5) - (a.betweennessCentrality * 0.5 + (a.threatScore/100)*0.5)).slice(0, 5);
    influencerListEl.innerHTML = sorted.map((p, idx) => {
      const isBridge = p.person_id === engine.groundTruth.bridge_person_id;
      return `
        <div class="influencer-card ${isBridge ? 'border-pink' : ''}" onclick="window.showDossierModal('${p.person_id}')">
          <div class="rank-badge">${isBridge ? window.renderSvgIcon('star', 'text-pink', 14) : `#${idx + 1}`}</div>
          <div class="influencer-info">
            <div class="influencer-name">
              <strong>${p.name}</strong> (${p.person_id})
              ${isBridge ? '<span class="badge badge-danger font-mono text-xs">CROSS-CARTEL CONDUIT</span>' : ''}
              ${p.statusFlags.includes('ABSCONDING') ? '<span class="badge badge-danger">ABSCONDING</span>' : ''}
            </div>
            <div class="influencer-metrics font-mono text-xs">
              <span>Betweenness: <strong class="text-cyan">${(p.betweennessCentrality * 100).toFixed(1)}%</strong></span> • 
              <span>Role: <strong class="text-pink">${p.ringRole}</strong></span> • 
              <span>Calls: <strong class="text-amber">${p.callCount}</strong></span> • 
              <span>City: <strong class="text-muted">${p.home_city}</strong></span>
            </div>
          </div>
          <div class="influencer-threat">
            <span class="threat-gauge ${p.threatScore >= 70 ? 'danger' : 'warning'}">${p.threatScore}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const alertsListEl = document.getElementById('suspiciousPatternsList');
  if (alertsListEl) {
    alertsListEl.innerHTML = engine.patterns.map(pat => `
      <div class="pattern-alert-card severity-${pat.severity.toLowerCase()}">
        <div class="pattern-top">
          <span class="badge ${pat.id === 'PAT-000' ? 'badge-pink' : pat.severity === 'CRITICAL' ? 'badge-danger' : 'badge-amber'}">${pat.severity} ALERT</span>
          <span class="font-mono text-xs text-muted">${pat.id}</span>
        </div>
        <h4 class="pattern-title">${pat.title}</h4>
        <p class="pattern-desc">${pat.description}</p>
        <div class="pattern-entities">
          <strong>Key Entities:</strong> ${pat.involvedEntities.map(e => `<span class="entity-pill">${e}</span>`).join(' ')}
        </div>
        <div class="pattern-action">
          <span class="action-tag">ACTION RECOMMENDATION:</span> ${pat.actionRecommendation}
        </div>
      </div>
    `).join('');
  }
}

// 5. Suspect Directory Tab
function initSuspectDirectoryTab() {
  const container = document.getElementById('suspectDirectoryGrid');
  if (!container) return;

  const engine = window.crimeDataEngine;
  const gt = engine.groundTruth;

  const renderList = (persons) => {
    container.innerHTML = persons.map(p => {
      const isBridge = p.person_id === gt.bridge_person_id;
      const isAbs = p.statusFlags.includes('ABSCONDING');
      const isConv = p.statusFlags.includes('CONVICTED');
      return `
        <div class="suspect-grid-card ${isBridge ? 'card-border-pink' : isAbs ? 'card-border-red' : ''}" onclick="if(window.suspectDigger){window.suspectDigger.selectSuspect('${p.person_id}');}else{window.showDossierModal('${p.person_id}');}">
          <div class="suspect-card-top">
            <span class="suspect-id-tag font-mono">${p.person_id}</span>
            <span class="badge ${isBridge ? 'badge-danger' : isAbs ? 'badge-danger' : isConv ? 'badge-amber' : 'badge-cyan'}">
              ${isBridge ? `${window.renderSvgIcon('alertTriangle', '', 12)} CROSS-CARTEL CONDUIT` : isAbs ? 'ABSCONDING' : isConv ? 'CONVICTED' : 'SUSPECT'}
            </span>
          </div>
          <div class="suspect-card-body">
            <h4 class="suspect-name">${p.name}</h4>
            <div class="suspect-info-line">
              <span class="text-muted">AI Role:</span>
              <strong class="${(p.ai_predicted_role || '').includes('Kingpin') || (p.ai_predicted_role || '').includes('Linchpin') ? 'text-danger' : 'text-cyan'}">${p.ai_predicted_role || p.ringRole}</strong>
            </div>
            <div class="suspect-info-line">
              <span class="text-muted">Age / City:</span>
              <strong>${p.age} yrs • ${p.home_city}</strong>
            </div>
            <div class="suspect-info-line">
              <span class="text-muted">Phone:</span>
              <span class="font-mono text-cyan">${p.phone}</span>
            </div>
            <div class="suspect-info-line">
              <span class="text-muted">Vehicle:</span>
              <span class="font-mono text-amber">${p.vehicle_no || 'None'}</span>
            </div>
            <div class="suspect-info-line">
              <span class="text-muted">Prior FIRs / Surveillance:</span>
              <strong class="text-slate">${p.firs.length} FIRs • ${p.surveillanceSightings.length} Sightings</strong>
            </div>
          </div>
          <div class="suspect-card-bottom">
            <div class="card-threat-bar">
              <div class="threat-fill ${p.threatScore >= 70 ? 'bg-danger' : 'bg-cyan'}" style="width: ${p.threatScore}%"></div>
            </div>
            <span class="text-xs font-mono font-bold ${p.threatScore >= 70 ? 'text-danger' : 'text-cyan'}">${p.threatScore} THREAT</span>
          </div>
        </div>
      `;
    }).join('');
  };

  renderList(engine.persons);

  const filterInput = document.getElementById('suspectFilterInput');
  const statusFilterSelect = document.getElementById('suspectStatusFilter');

  const doFilter = () => {
    const q = filterInput ? filterInput.value.toLowerCase().trim() : '';
    const st = statusFilterSelect ? statusFilterSelect.value : 'ALL';

    let filtered = engine.persons;
    if (st === 'ABSCONDING') filtered = filtered.filter(p => p.statusFlags.includes('ABSCONDING'));
    if (st === 'CONVICTED') filtered = filtered.filter(p => p.statusFlags.includes('CONVICTED'));
    if (st === 'UNDER_TRIAL') filtered = filtered.filter(p => p.statusFlags.includes('UNDER_TRIAL'));

    if (q) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.person_id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.vehicle_no && p.vehicle_no.toLowerCase().includes(q)) ||
        p.home_city.toLowerCase().includes(q)
      );
    }
    renderList(filtered);
  };

  if (filterInput) filterInput.addEventListener('input', doFilter);
  if (statusFilterSelect) statusFilterSelect.addEventListener('change', doFilter);
}

// 6. Physical Surveillance Tab
function initSurveillanceTab() {
  const tbody = document.getElementById('surveillanceTableBody');
  if (!tbody) return;

  const engine = window.crimeDataEngine;
  const renderTable = (list) => {
    tbody.innerHTML = list.map(sr => {
      const subj = engine.personMap.get(sr.subject_id);
      const isSmokingGun = sr.report_id === 'SR3019' || sr.report_id === 'SR3020';

      return `
        <tr class="${isSmokingGun ? 'row-alert' : ''}">
          <td class="font-mono text-cyan">${sr.report_id}</td>
          <td class="text-muted text-xs">${sr.date}</td>
          <td><span class="city-tag">${sr.location_city}</span></td>
          <td>
            <strong>${subj ? subj.name : 'Unknown'}</strong> (${sr.subject_id})
            ${sr.subject_id === 'P004' ? '<span class="badge badge-pink">BRIDGE</span>' : ''}
          </td>
          <td class="font-mono text-amber text-xs">${sr.vehicle_observed || 'None (Cloned Plate)'}</td>
          <td>
            ${sr.other_persons_present.map(pid => {
              const p = engine.personMap.get(pid);
              return `<span class="badge badge-cyan" onclick="window.showDossierModal('${pid}')" style="cursor:pointer">${p ? p.name : pid}</span>`;
            }).join(' ') || '<span class="text-muted text-xs">Unidentified</span>'}
          </td>
          <td class="text-xs">
            ${isSmokingGun ? '<span class="badge badge-danger">SMOKING GUN</span> ' : ''}
            ${sr.notes}
          </td>
        </tr>
      `;
    }).join('');
  };

  renderTable(engine.surveillanceReports);

  window.filterSurveillanceLogs = (query) => {
    const q = (query || '').toLowerCase().trim();
    const filtered = engine.surveillanceReports.filter(sr => 
      sr.report_id.toLowerCase().includes(q) ||
      sr.location_city.toLowerCase().includes(q) ||
      sr.subject_id.toLowerCase().includes(q) ||
      (sr.vehicle_observed && sr.vehicle_observed.toLowerCase().includes(q)) ||
      sr.notes.toLowerCase().includes(q)
    );
    renderTable(filtered);
  };
}

// 7. OSINT Cyber Intelligence Tab
function initOSINTTab() {
  if (window.OSINTEngine && !window.osintEngineInstance) {
    window.osintEngineInstance = new window.OSINTEngine('osintContainer');
    window.osintEngineInstance.init();
  }
}

// 8. Graph Tab Controls & Inspector Callbacks
function initGraphTabControls() {
  const metricSelect = document.getElementById('graphCentralityMetric');
  if (metricSelect) {
    metricSelect.addEventListener('change', (e) => {
      if (window.graphInstance) {
        window.graphInstance.setCentralityMetric(e.target.value);
        playTacticalBeep(980, 'sine', 0.03);
      }
    });
  }

  const statusFilter = document.getElementById('graphStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      if (window.graphInstance) {
        window.graphInstance.setStatusFilter(e.target.value);
      }
    });
  }

  const pathBtn = document.getElementById('runPathFinderBtn');
  if (pathBtn) {
    pathBtn.addEventListener('click', () => {
      const src = document.getElementById('pathSourceSelect').value;
      const tgt = document.getElementById('pathTargetSelect').value;
      if (window.graphInstance) {
        const path = window.graphInstance.findShortestPath(src, tgt);
        const resEl = document.getElementById('pathResultBox');
        if (resEl) {
          if (path.length > 0) {
            const hops = [];
            for (let i = 0; i < path.length - 1; i++) {
              hops.push(`${path[i]} &rarr; ${path[i+1]}`);
            }
            resEl.innerHTML = `
              <div class="text-cyan font-bold mb-1">Nexus Trace Route (${path.length - 1} intermediary hops):</div>
              <div class="font-mono text-white">${path.join(' &rarr; ')}</div>
            `;
          } else {
            resEl.innerHTML = `<span class="text-danger">No direct or intermediary path found between selected entities.</span>`;
          }
        }
      }
    });
  }

  const srcSelect = document.getElementById('pathSourceSelect');
  const tgtSelect = document.getElementById('pathTargetSelect');
  if (srcSelect && tgtSelect && window.crimeDataEngine) {
    const opts = window.crimeDataEngine.persons.map(p => `<option value="${p.person_id}">${p.person_id} - ${p.name}</option>`).join('');
    srcSelect.innerHTML = opts;
    tgtSelect.innerHTML = opts;
    if (srcSelect.options.length > 6) {
      srcSelect.selectedIndex = 15; // P016 Priya Pillai (Narco Kingpin)
      tgtSelect.selectedIndex = 6;  // P007 Anil Gupta (Fraud Kingpin)
    }
  }

  window.onGraphNodeSelected = (node) => {
    const panel = document.getElementById('graphInspectorPanel');
    if (!panel) return;

    if (node.type === 'person') {
      const p = node.data;
      const isBridge = p.person_id === window.crimeDataEngine.groundTruth.bridge_person_id;
      panel.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <h4>${p.name}</h4>
            <span class="font-mono text-cyan">${p.person_id}</span>
          </div>
          ${isBridge ? `<div class="badge badge-danger w-100 mb-2 text-center font-mono text-xs">${window.renderSvgIcon('alertTriangle', '', 12)} PRIMARY CROSS-CARTEL CONDUIT</div>` : ''}
          <p><strong>Syndicate Ring:</strong> <span class="text-cyan">${p.ringRole}</span></p>
          <p><strong>Base:</strong> ${p.home_city}</p>
          <p><strong>Phone:</strong> <span class="font-mono">${p.phone}</span></p>
          <p><strong>Threat Score:</strong> <span class="text-danger font-bold">${p.threatScore}/100</span></p>
          <p><strong>Betweenness:</strong> ${(p.betweennessCentrality * 100).toFixed(1)}%</p>
          <p><strong>Total Calls:</strong> ${p.callCount}</p>
          <p><strong>Surveillance Sightings:</strong> ${p.surveillanceSightings.length}</p>
          <p><strong>Prior Cases:</strong> ${p.firs.length} FIRs</p>
          <button class="btn btn-sm btn-primary w-100 mt-2" onclick="window.showDossierModal('${p.person_id}')">
            ${window.renderSvgIcon('folder', '', 14)} Open Full Case Dossier
          </button>
        </div>
      `;
    } else if (node.type === 'org') {
      const o = node.data;
      panel.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <h4>${o.name}</h4>
            <span class="font-mono text-purple">${o.org_id}</span>
          </div>
          <p><strong>Jurisdiction:</strong> ${o.registered_city}</p>
          <p><strong>Account:</strong> <span class="font-mono">${o.account_no}</span></p>
          ${o.org_id === 'O10' ? `<p class="text-danger font-bold">${window.renderSvgIcon('alertTriangle', '', 14)} Flagged Hawala Smurfing Hub</p>` : ''}
          <button class="btn btn-sm btn-outline-cyan w-100 mt-2" onclick="window.filterTransactionsByAccount('${o.account_no}')">
            ${window.renderSvgIcon('dollarSign', '', 14)} View Financial Trail
          </button>
        </div>
      `;
    }
  };
}

// 9. Global Omnisearch Bar
function initGlobalSearch() {
  const searchInput = document.getElementById('globalOmniSearch');
  const resultsDropdown = document.getElementById('omniSearchResults');
  if (!searchInput || !resultsDropdown) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    if (!q || q.length < 2) {
      resultsDropdown.classList.remove('active');
      return;
    }

    const engine = window.crimeDataEngine;
    const matches = engine.search(q).slice(0, 6);

    if (matches.length > 0) {
      resultsDropdown.innerHTML = matches.map(m => `
        <div class="omni-result-item" onclick="if(window.suspectDigger){window.suspectDigger.selectSuspect('${m.person_id}');}else{window.showDossierModal('${m.person_id}');} document.getElementById('omniSearchResults').classList.remove('active');">
          <div class="omni-item-top">
            <strong>${m.name}</strong> <span class="font-mono text-cyan">(${m.person_id})</span>
            ${m.person_id === engine.groundTruth.bridge_person_id ? '<span class="badge badge-danger font-mono text-xs">CONDUIT</span>' : ''}
            ${m.statusFlags.includes('ABSCONDING') ? '<span class="badge badge-danger">ABSCONDING</span>' : ''}
          </div>
          <div class="omni-item-sub text-xs text-muted">
            City: ${m.home_city} • Phone: ${m.phone} • Vehicle: ${m.vehicle_no || 'N/A'} • FIRs: ${m.firs.length}
          </div>
        </div>
      `).join('');
      resultsDropdown.classList.add('active');
    } else {
      resultsDropdown.innerHTML = `<div class="omni-no-match">No records matched "${q}"</div>`;
      resultsDropdown.classList.add('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
      resultsDropdown.classList.remove('active');
    }
  });
}

// Notification Toast
window.showTacticalNotification = function(msg) {
  const toast = document.createElement('div');
  toast.className = 'tactical-toast';
  toast.innerHTML = `<span class="toast-icon">${window.renderSvgIcon('zap', 'text-cyan', 16)}</span> <span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 50);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};
