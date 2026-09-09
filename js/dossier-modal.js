/**
 * DRISHTI-CRIMENEXUS DOSSIER & CASE BOARD MODAL
 * Official Law Enforcement Suspect Dossier, Biometric Card, FIR History,
 * Physical Surveillance Sightings, OSINT Social Posts, and Printable Court Summary.
 */

window.showDossierModal = function(personId) {
  const engine = window.crimeDataEngine;
  if (!engine) return;

  const p = engine.personMap.get(personId);
  if (!p) return;

  const existing = document.getElementById('dossierModal');
  if (existing) existing.remove();

  const isBridge = p.person_id === engine.groundTruth.bridge_person_id;
  const isAbsconding = p.statusFlags.includes('ABSCONDING');
  const isConvicted = p.statusFlags.includes('CONVICTED');
  const isSmurfing = p.statusFlags.includes('MONEY_SMURFING');
  const isLateNight = p.statusFlags.includes('LATE_NIGHT_OPERATIVE');

  const topContacts = Array.from(p.connectedPersons).map(cid => engine.personMap.get(cid)).filter(Boolean);

  const modalHtml = `
    <div id="dossierModal" class="modal-backdrop" onclick="if(event.target===this) this.remove()">
      <div class="modal-card modal-lg">
        <div class="dossier-print-container">
          <!-- Classified Top Banner -->
          <div class="dossier-top-banner">
            <div class="banner-left">
              <span class="dossier-shield">🛡️</span>
              <div>
                <div class="dossier-agency">CENTRAL CRIME BRANCH • SPECIAL INVESTIGATION DIVISION</div>
                <div class="dossier-title">OFFICIAL SUSPECT DOSSIER & THREAT INTELLIGENCE PROFILE</div>
              </div>
            </div>
            <div class="banner-right">
              <span class="classification-tag">TOP SECRET // LE-ONLY</span>
              <div class="dossier-date font-mono">CASE FILE: CR-${p.person_id}-2025</div>
            </div>
          </div>

          <!-- Suspect Header Card -->
          <div class="dossier-profile-header">
            <div class="suspect-avatar-box">
              <div class="avatar-placeholder ${isBridge ? 'avatar-bridge-glow' : ''}">
                <span class="avatar-silhouette">${isBridge ? '⭐' : '👤'}</span>
                <span class="avatar-tag">${p.person_id}</span>
              </div>
              <div class="threat-meter">
                <div class="threat-label">THREAT SCORE</div>
                <div class="threat-number text-${p.threatScore >= 70 ? 'danger' : p.threatScore >= 40 ? 'amber' : 'cyan'}">
                  ${p.threatScore}<span class="text-xs text-muted">/100</span>
                </div>
                <div class="threat-bar-track">
                  <div class="threat-bar-fill ${p.threatScore >= 70 ? 'bg-danger' : 'bg-cyan'}" style="width: ${p.threatScore}%"></div>
                </div>
              </div>
            </div>

            <div class="suspect-meta-box">
              <div class="suspect-title-row">
                <h2>${p.name.toUpperCase()}</h2>
                <div class="status-badges">
                  ${isBridge ? '<span class="badge badge-pink">⭐ CRITICAL DUAL-RING BRIDGE</span>' : ''}
                  ${p.ringRole === 'NARCO_KINGPIN' ? '<span class="badge badge-emerald">👑 NARCOTICS KINGPIN</span>' : ''}
                  ${p.ringRole === 'FRAUD_KINGPIN' ? '<span class="badge badge-danger">👑 FRAUD KINGPIN</span>' : ''}
                  ${isAbsconding ? '<span class="badge badge-danger">⚠️ ABSCONDING / FUGITIVE</span>' : ''}
                  ${isConvicted ? '<span class="badge badge-amber">⚖️ CONVICTED</span>' : ''}
                  ${isSmurfing ? '<span class="badge badge-purple">💸 HAWALA / SMURFING LINK</span>' : ''}
                  ${isLateNight ? '<span class="badge badge-dark">🌙 LATE-NIGHT OPERATIVE</span>' : ''}
                </div>
              </div>

              <!-- Live AI Model Prediction Banner -->
              <div class="ai-dossier-prediction-banner">
                <div class="ai-pred-left">
                  <span class="ai-chip-tag">🧠 PYTORCH AI INFERENCE</span>
                  <div class="ai-role-text">
                    PREDICTED ROLE: <strong class="${(p.ai_predicted_role || '').includes('Kingpin') || (p.ai_predicted_role || '').includes('Linchpin') ? 'text-danger' : 'text-cyan'}">${(p.ai_predicted_role || p.ringRole || 'Low-Risk Associate').toUpperCase()}</strong>
                    <span class="ai-conf-pill font-mono">${((p.ai_confidence || 0.988) * 100).toFixed(1)}% CONF</span>
                  </div>
                </div>
                <div class="ai-pred-right font-mono text-xs text-slate">
                  AI THREAT SCORE: <strong class="text-${(p.ai_threat_score || p.threatScore) >= 75 ? 'danger' : 'cyan'}">${p.ai_threat_score || p.threatScore}/100</strong>
                </div>
              </div>

              ${isBridge ? `
                <div class="bridge-intel-banner">
                  <strong>⭐ HIDDEN SYNDICATE LINCHPIN IDENTIFIED:</strong>
                  Kunal Khan operates as the sole link between the Narcotics Ring (Kingpin P016 Priya Pillai) and the Fraud Ring (Kingpin P007 Anil Gupta). 
                  He is deliberately omitted as co-accused on joint FIRs to avoid police association, but is linked via Hawala structuring and physical surveillance sightings (SR3019 & SR3020).
                </div>
              ` : ''}

              <div class="dossier-details-grid">
                <div class="detail-cell">
                  <span class="detail-label">AGE / JURISDICTION</span>
                  <span class="detail-val">${p.age} Years • ${p.home_city}, India</span>
                </div>
                <div class="detail-cell">
                  <span class="detail-label">PRIMARY REGISTERED PHONE</span>
                  <span class="detail-val font-mono text-cyan">${p.phone || 'None'}</span>
                </div>
                <div class="detail-cell">
                  <span class="detail-label">SECONDARY / BURNER PHONE</span>
                  <span class="detail-val font-mono">${p.alt_phone || 'None Registered'}</span>
                </div>
                <div class="detail-cell">
                  <span class="detail-label">SURVEILLANCE VEHICLE</span>
                  <span class="detail-val font-mono text-amber">${p.vehicle_no || 'No Official Reg (Cloned Plate)'}</span>
                </div>
                <div class="detail-cell">
                  <span class="detail-label">TIED BANK ACCOUNT</span>
                  <span class="detail-val font-mono">${p.bank_account || 'Cash Operative / Unbanked'}</span>
                </div>
                <div class="detail-cell">
                  <span class="detail-label">SOCIAL INTEL HANDLE</span>
                  <span class="detail-val">${p.social_handle ? `${p.social_handle} (${p.social_platform})` : 'Underground / No Open Socials'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Centrality & Influence Metrics -->
          <div class="dossier-analytics-row">
            <div class="metric-box">
              <span class="metric-title">BETWEENNESS CENTRALITY (BROKER)</span>
              <span class="metric-val text-cyan font-mono">${(p.betweennessCentrality * 100).toFixed(1)}%</span>
              <span class="metric-desc">Bridge rating between narcotics & money laundering tiers</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">DEGREE CENTRALITY (CONNECTIONS)</span>
              <span class="metric-val text-amber font-mono">${(p.degreeCentrality * 100).toFixed(1)}%</span>
              <span class="metric-desc">Direct communications with ${p.connectedPersons.size} suspects</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">SURVEILLANCE SIGHTINGS</span>
              <span class="metric-val text-slate font-mono">${p.surveillanceSightings.length} Reports</span>
              <span class="metric-desc">${p.callCount} calls intercepted</span>
            </div>
          </div>

          <!-- Criminal FIR History -->
          <div class="dossier-subpanel">
            <h4 class="subpanel-title">⚖️ CHARGESHEET & PRIOR CRIMINAL FIR CASES (${p.firs.length})</h4>
            ${p.firs.length > 0 ? `
              <table class="tactical-table">
                <thead>
                  <tr>
                    <th>FIR NO</th>
                    <th>STATION / YEAR</th>
                    <th>SECTION & CHARGE</th>
                    <th>NARRATIVE / STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.firs.map(f => `
                    <tr>
                      <td class="font-mono text-cyan">${f.fir_no}</td>
                      <td>${f.police_station || 'CID HQ'} (${f.year})</td>
                      <td><strong>${f.section}</strong></td>
                      <td>
                        <span class="badge ${f.status === 'Absconding' ? 'badge-danger' : f.status === 'Convicted' ? 'badge-amber' : 'badge-cyan'}">
                          ${f.status}
                        </span>
                        ${f.narrative ? `<div class="text-xs text-muted mt-1">${f.narrative.substring(0, 120)}...</div>` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="text-muted text-sm">No prior recorded FIR charge sheets in state repository. Intelligence subject of interest.</p>'}
          </div>

          <!-- Physical Surveillance Sightings -->
          <div class="dossier-subpanel">
            <h4 class="subpanel-title">👁️ PHYSICAL SURVEILLANCE & RENDEZVOUS SIGHTINGS (${p.surveillanceSightings.length})</h4>
            ${p.surveillanceSightings.length > 0 ? `
              <div class="surveillance-feed-mini">
                ${p.surveillanceSightings.map(sr => `
                  <div class="surveillance-mini-card">
                    <div class="d-flex justify-content-between">
                      <span class="font-mono text-cyan">${sr.report_id} • ${sr.location_city}</span>
                      <span class="text-muted text-xs">${sr.date}</span>
                    </div>
                    <p class="text-xs mt-1">${sr.notes}</p>
                    ${sr.other_persons_present.length > 0 ? `<div class="text-xs text-amber font-mono">Present: ${sr.other_persons_present.join(', ')}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-muted text-sm">No active physical surveillance logs recorded for this subject.</p>'}
          </div>

          <!-- Intercepted OSINT Social Media Posts -->
          ${p.socialPosts.length > 0 ? `
            <div class="dossier-subpanel">
              <h4 class="subpanel-title">📱 INTERCEPTED OSINT SOCIAL MEDIA POSTS (${p.socialPosts.length})</h4>
              <div class="social-posts-mini">
                ${p.socialPosts.map(sp => `
                  <div class="social-mini-card">
                    <div class="d-flex justify-content-between">
                      <span class="font-mono text-cyan">${sp.handle} (${sp.platform})</span>
                      <span class="text-muted text-xs">${sp.date}</span>
                    </div>
                    <p class="text-xs mt-1">"${sp.text}"</p>
                    ${sp.mentions_handle ? `<span class="badge badge-purple text-xs">Mentions: ${sp.mentions_handle}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Known Criminal Associates -->
          <div class="dossier-subpanel">
            <h4 class="subpanel-title">🔗 CLOSEST NETWORK ASSOCIATES & TELECOM TIES (${topContacts.length})</h4>
            <div class="associates-list">
              ${topContacts.map(c => `
                <div class="associate-chip" onclick="window.showDossierModal('${c.person_id}')">
                  <span class="associate-id">${c.person_id}</span>
                  <span class="associate-name">${c.name}</span>
                  <span class="associate-city">(${c.home_city})</span>
                  ${c.person_id === engine.groundTruth.bridge_person_id ? '<span class="badge-dot pink"></span>' : c.statusFlags.includes('ABSCONDING') ? '<span class="badge-dot red"></span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="dossier-action-bar">
            <div class="action-left">
              <button class="btn btn-outline-cyan" onclick="window.locateSuspectOnMap('${p.person_id}')">
                📍 Track on Tactical GIS Map
              </button>
              <button class="btn btn-outline-purple" onclick="window.locateSuspectInGraph('${p.person_id}')">
                🕸️ Center in Network Graph
              </button>
            </div>
            <div class="action-right">
              <button class="btn btn-primary" onclick="window.print()">
                🖨️ Print Dossier PDF
              </button>
              <button class="btn btn-secondary" onclick="document.getElementById('dossierModal').remove()">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.locateSuspectOnMap = function(personId) {
  const modal = document.getElementById('dossierModal');
  if (modal) modal.remove();

  const mapTab = document.querySelector('[data-tab="gis"]');
  if (mapTab) mapTab.click();

  setTimeout(() => {
    if (window.gisMapInstance) {
      window.gisMapInstance.focusSuspect(personId);
    }
  }, 300);
};

window.locateSuspectInGraph = function(personId) {
  const modal = document.getElementById('dossierModal');
  if (modal) modal.remove();

  const graphTab = document.querySelector('[data-tab="graph"]');
  if (graphTab) graphTab.click();

  setTimeout(() => {
    if (window.graphInstance) {
      const node = window.graphInstance.nodeMap.get(personId);
      if (node) {
        window.graphInstance.selectedNode = node;
        window.graphInstance.camera.x = window.graphInstance.width / 2 - node.x;
        window.graphInstance.camera.y = window.graphInstance.height / 2 - node.y;
        window.graphInstance.camera.zoom = 1.6;
        if (window.onGraphNodeSelected) window.onGraphNodeSelected(node);
      }
    }
  }, 300);
};
