/**
 * DRISHTI-CRIMENEXUS OSINT CYBER INTELLIGENCE ENGINE
 * Real-time Open Source Intelligence (OSINT) Reconnaissance Suite:
 * 1. Sherlock / Maigret Cross-Platform Username Tracker (10+ networks)
 * 2. PhoneInfoga Telecom HLR & Carrier Profiler (Indian Circles & DoT Series)
 * 3. Shodan / WHOIS Network & Domain Threat Recon (DNS, PTR, Geolocation, ASN)
 * 4. Underground Syndicate Intercept Archive (58 Social Media Intercepts)
 */

class OSINTEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeMode = 'USERNAME'; // 'USERNAME' | 'PHONE' | 'NETWORK' | 'ARCHIVE'
    this.currentPlatformFilter = 'ALL';
    this.archiveSearchTerm = '';
    this.cachedUserResult = null;
    this.cachedPhoneResult = null;
    this.cachedNetworkResult = null;
    this.isScanning = false;
  }

  init() {
    this.render();
  }

  setMode(mode) {
    this.activeMode = mode;
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="panel-section">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">${window.renderSvgIcon('eye', 'text-cyan', 18)}</span> OSINT CYBER INTELLIGENCE & UNDERGROUND RECONNAISSANCE
          </div>
          <div class="panel-badge font-mono text-cyan">Live Multi-Threaded OSINT Suite // Palantir-Grade</div>
        </div>

        <!-- OSINT Mode Switcher Navbar -->
        <div class="d-flex gap-2 mb-3 border-bottom border-dark pb-2">
          <button class="btn btn-sm ${this.activeMode === 'USERNAME' ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.osintEngineInstance.setMode('USERNAME')">
            ${window.renderSvgIcon('user', '', 14)} 1. Sherlock Username Recon
          </button>
          <button class="btn btn-sm ${this.activeMode === 'PHONE' ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.osintEngineInstance.setMode('PHONE')">
            ${window.renderSvgIcon('phone', '', 14)} 2. PhoneInfoga Telecom HLR
          </button>
          <button class="btn btn-sm ${this.activeMode === 'NETWORK' ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.osintEngineInstance.setMode('NETWORK')">
            ${window.renderSvgIcon('network', '', 14)} 3. Shodan / WHOIS Network
          </button>
          <button class="btn btn-sm ${this.activeMode === 'ARCHIVE' ? 'btn-cyan' : 'btn-outline-secondary'}" onclick="window.osintEngineInstance.setMode('ARCHIVE')">
            ${window.renderSvgIcon('fileText', '', 14)} 4. Case Intercept Archives (58)
          </button>
        </div>

        <!-- Dynamic Mode Body -->
        <div id="osintModeBody">
          ${this.renderActiveModeHtml()}
        </div>
      </div>
    `;
  }

  renderActiveModeHtml() {
    switch (this.activeMode) {
      case 'USERNAME':
        return this.renderUsernameReconHtml();
      case 'PHONE':
        return this.renderPhoneReconHtml();
      case 'NETWORK':
        return this.renderNetworkReconHtml();
      case 'ARCHIVE':
      default:
        return this.renderArchiveHtml();
    }
  }

  // =========================================================================
  // 1. SHERLOCK USERNAME RECONNAISSANCE
  // =========================================================================
  renderUsernameReconHtml() {
    return `
      <div>
        <p class="text-sm text-muted mb-3">
          Cross-platform digital footprint scanner. Concurrently queries 10+ public platforms to detect active suspect handles, profile presence, and digital exposure.
        </p>

        <div class="row g-2 align-items-center mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text font-mono text-cyan">@</span>
              <input type="text" id="osintHandleInput" class="tactical-input font-mono" placeholder="Enter target username (e.g. kunal_surat, priya_p, torvalds)..." value="${this.cachedUserResult ? this.cachedUserResult.handle : 'kunal_surat'}">
              <button class="btn btn-primary" onclick="window.osintEngineInstance.runUsernameScan()" ${this.isScanning ? 'disabled' : ''}>
                ${this.isScanning ? '<span class="spinner-border spinner-border-sm"></span> Scanning...' : window.renderSvgIcon('zap', '', 14) + ' Execute OSINT Scan'}
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex flex-wrap gap-1 align-items-center">
              <span class="text-xs text-muted">Suspect Presets:</span>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadHandlePreset('kunal_surat')">@kunal_surat (P004)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadHandlePreset('priya_p')">@priya_p (P016)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadHandlePreset('anil_extort')">@anil_extort (P007)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadHandlePreset('torvalds')">@torvalds (Public)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadHandlePreset('durov')">@durov (Telegram)</button>
            </div>
          </div>
        </div>

        <div id="osintUsernameResultBox">
          ${this.cachedUserResult ? this.renderUsernameResultContent(this.cachedUserResult) : `
            <div class="datalab-result-box text-center p-5 text-muted">
              ${window.renderSvgIcon('eye', 'text-muted mb-2', 32)}<br>
              Enter a target handle or click a preset above, then click <strong>EXECUTE OSINT SCAN</strong> to scan live networks.
            </div>
          `}
        </div>
      </div>
    `;
  }

  loadHandlePreset(handle) {
    const input = document.getElementById('osintHandleInput');
    if (input) input.value = handle;
    this.runUsernameScan();
  }

  async runUsernameScan() {
    const input = document.getElementById('osintHandleInput');
    const handle = (input ? input.value : 'kunal_surat').trim().replace(/^@/, '');
    if (!handle) return;

    this.isScanning = true;
    const box = document.getElementById('osintUsernameResultBox');
    if (box) {
      box.innerHTML = `
        <div class="datalab-result-box text-center p-4">
          <div class="spinner-border text-cyan mb-2"></div>
          <div class="font-mono text-sm text-cyan">QUERYING 10+ REAL PUBLIC NETWORKS CONCURRENTLY FOR @${handle}...</div>
          <div class="text-xs text-muted mt-1">GitHub • Telegram • GitLab • HackerNews • Chess.com • Steam • Pastebin • Medium • Pinterest • Linktree</div>
        </div>
      `;
    }

    try {
      let res = null;
      if (window.CrimeNetAPI) {
        res = await window.CrimeNetAPI.scanOSINTUsername(handle);
      }
      this.cachedUserResult = res;
      if (box && res) {
        box.innerHTML = this.renderUsernameResultContent(res);
      }
    } catch (e) {
      if (box) box.innerHTML = `<div class="text-danger p-3">Scan failed: ${e.message}</div>`;
    } finally {
      this.isScanning = false;
      const scanBtn = document.querySelector('#osintModeBody button.btn-primary');
      if (scanBtn) scanBtn.disabled = false;
    }
  }

  renderUsernameResultContent(data) {
    const confirmedList = (data.platforms || []).filter(p => p.status === 'CONFIRMED');
    const confirmedCount = confirmedList.length;
    const totalCount = data.total_platforms_scanned || data.platforms.length;
    const expScore = data.digital_exposure_score || 0;

    return `
      <div class="mb-3">
        <!-- Summary Strip -->
        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <div class="intel-stat-card border-cyan">
              <div class="stat-label">CONFIRMED FOOTPRINTS</div>
              <div class="stat-value text-cyan">${confirmedCount} / ${totalCount}</div>
              <div class="stat-meta">Active Public Accounts</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="intel-stat-card ${expScore >= 50 ? 'border-danger' : expScore >= 25 ? 'border-amber' : 'border-emerald'}">
              <div class="stat-label">DIGITAL EXPOSURE SCORE</div>
              <div class="stat-value ${expScore >= 50 ? 'text-danger' : expScore >= 25 ? 'text-amber' : 'text-emerald'}">${expScore}%</div>
              <div class="stat-meta">Cross-Platform Presence</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="intel-stat-card border-purple">
              <div class="stat-label">SCAN EXECUTION LATENCY</div>
              <div class="stat-value text-purple">${data.execution_latency_ms} ms</div>
              <div class="stat-meta">Concurrent Multi-Threaded I/O</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="intel-stat-card border-emerald">
              <div class="stat-label">GRAPH INTEGRATION</div>
              <button class="btn btn-xs btn-emerald w-100 mt-1" onclick="window.osintEngineInstance.ingestHandleToGraph('${data.handle}')">
                ${window.renderSvgIcon('plus', '', 12)} Ingest Node to Active Graph
              </button>
            </div>
          </div>
        </div>

        <!-- Platform Cards Grid -->
        <div class="row g-2">
          ${(data.platforms || []).map(p => {
            const isConf = p.status === 'CONFIRMED';
            const isRestricted = p.status === 'RESTRICTED';
            const badgeCls = isConf ? 'badge-emerald' : (isRestricted ? 'badge-amber' : 'badge-muted');
            const borderCls = isConf ? 'border-cyan' : 'border-subtle';

            return `
              <div class="col-md-4 col-sm-6">
                <div class="p-2 border ${borderCls} rounded bg-card-subtle h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong>${p.platform}</strong>
                      <span class="badge ${badgeCls} font-mono text-xs">${p.status}</span>
                    </div>
                    <div class="font-mono text-xs text-muted mb-1 truncate" title="${p.profile_url}">
                      ${p.profile_url}
                    </div>
                    ${p.details && p.details.name ? `<div class="text-xs text-cyan"><strong>Name:</strong> ${p.details.name}</div>` : ''}
                    ${p.details && p.details.bio ? `<div class="text-xs text-muted fst-italic">"${p.details.bio}"</div>` : ''}
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2 pt-1 border-top border-dark text-xs text-muted font-mono">
                    <span>${p.latency_ms} ms</span>
                    <a href="${p.profile_url}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-outline-cyan">
                      Open Profile ↗
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  ingestHandleToGraph(handle) {
    if (!window.graphInstance) {
      window.showTacticalNotification('Link Analysis Graph not initialized.');
      return;
    }

    const nodeId = `OSINT-${handle.toUpperCase()}`;
    if (!window.graphInstance.nodeMap.has(nodeId)) {
      const osintNode = {
        id: nodeId,
        name: `@${handle} (OSINT)`,
        type: 'osint',
        threatScore: 65,
        role: 'Digital Footprint Profile',
        color: '#06b6d4',
        radius: 12,
        x: window.graphInstance.width / 2 + (Math.random() - 0.5) * 150,
        y: window.graphInstance.height / 2 + (Math.random() - 0.5) * 150,
        vx: 0,
        vy: 0
      };
      window.graphInstance.nodes.push(osintNode);
      window.graphInstance.nodeMap.set(nodeId, osintNode);

      // Link to Kunal Khan (P004) or primary bridge
      const targetId = 'P004';
      if (window.graphInstance.nodeMap.has(targetId)) {
        window.graphInstance.links.push({
          source: osintNode,
          target: window.graphInstance.nodeMap.get(targetId),
          type: 'osint_link',
          color: 'rgba(6, 182, 212, 0.7)',
          weight: 2
        });
      }
    }

    // Switch to graph tab
    const tabBtn = document.querySelector('[data-tab="graph"]');
    if (tabBtn) tabBtn.click();
    window.showTacticalNotification(`Injected OSINT Handle Node [@${handle}] into active link analysis graph.`);
  }

  // =========================================================================
  // 2. PHONEINFOGA TELECOM HLR & CARRIER PROFILER
  // =========================================================================
  renderPhoneReconHtml() {
    return `
      <div>
        <p class="text-sm text-muted mb-3">
          Telecom Home Location Register (HLR) profiler. Resolves Department of Telecommunications (DoT) MSC series, circle of origin, primary carrier, nocturnal CDR frequency, and burner phone probability.
        </p>

        <div class="row g-2 align-items-center mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text font-mono text-cyan">+91</span>
              <input type="text" id="osintPhoneInput" class="tactical-input font-mono" placeholder="Enter 10-digit phone (e.g. 9697848018)..." value="${this.cachedPhoneResult ? this.cachedPhoneResult.phone_raw : '9697848018'}">
              <button class="btn btn-primary" onclick="window.osintEngineInstance.runPhoneScan()" ${this.isScanning ? 'disabled' : ''}>
                ${this.isScanning ? '<span class="spinner-border spinner-border-sm"></span> Scanning...' : window.renderSvgIcon('phone', '', 14) + ' Profile Phone SIM'}
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex flex-wrap gap-1 align-items-center">
              <span class="text-xs text-muted">Known Suspect Phones:</span>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadPhonePreset('9697848018')">9697848018 (Kunal Khan)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadPhonePreset('9850142940')">9850142940 (Priya Pillai)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadPhonePreset('9509839301')">9509839301 (Anil Gupta)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadPhonePreset('9033092327')">9033092327 (Priya Khan)</button>
            </div>
          </div>
        </div>

        <div id="osintPhoneResultBox">
          ${this.cachedPhoneResult ? this.renderPhoneResultContent(this.cachedPhoneResult) : `
            <div class="datalab-result-box text-center p-5 text-muted">
              ${window.renderSvgIcon('phone', 'text-muted mb-2', 32)}<br>
              Enter a phone number or click a suspect preset, then click <strong>PROFILE PHONE SIM</strong>.
            </div>
          `}
        </div>
      </div>
    `;
  }

  loadPhonePreset(phone) {
    const input = document.getElementById('osintPhoneInput');
    if (input) input.value = phone;
    this.runPhoneScan();
  }

  async runPhoneScan() {
    const input = document.getElementById('osintPhoneInput');
    const phone = (input ? input.value : '9697848018').trim();
    if (!phone) return;

    this.isScanning = true;
    const box = document.getElementById('osintPhoneResultBox');
    if (box) {
      box.innerHTML = `
        <div class="datalab-result-box text-center p-4">
          <div class="spinner-border text-cyan mb-2"></div>
          <div class="font-mono text-sm text-cyan">RESOLVING TELECOM HLR & CARRIER SERIES FOR ${phone}...</div>
        </div>
      `;
    }

    try {
      let res = null;
      if (window.CrimeNetAPI) {
        res = await window.CrimeNetAPI.scanOSINTPhone(phone);
      }
      this.cachedPhoneResult = res;
      if (box && res) {
        box.innerHTML = this.renderPhoneResultContent(res);
      }
    } catch (e) {
      if (box) box.innerHTML = `<div class="text-danger p-3">Phone profiling failed: ${e.message}</div>`;
    } finally {
      this.isScanning = false;
    }
  }

  renderPhoneResultContent(data) {
    const risk = data.burner_risk_score || 0;
    const isHighRisk = risk >= 60;

    return `
      <div class="border ${isHighRisk ? 'border-danger' : 'border-emerald'} rounded p-3 bg-card-subtle">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 class="font-mono text-cyan mb-0">${data.formatted_e164}</h4>
            <span class="text-xs text-muted">${data.status}</span>
          </div>
          <div class="text-end">
            <span class="badge ${isHighRisk ? 'badge-danger' : 'badge-emerald'} font-mono">BURNER RISK: ${risk}/100</span>
            <div class="text-xs text-muted font-mono">Latency: ${data.latency_ms}ms</div>
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">TELECOM CIRCLE</span>
              <div class="font-bold text-slate">${data.telecom_circle}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">PRIMARY CARRIER</span>
              <div class="font-bold text-cyan">${data.primary_carrier}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">CASE INTERCEPTS</span>
              <div class="font-bold text-amber">${data.case_intercepts_count} Calls Logged</div>
              <div class="text-xs text-muted">${data.night_calls_count} Nocturnal Calls (${Math.round(data.nocturnal_ratio * 100)}%)</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">TRANSIT CITIES</span>
              <div class="font-bold text-slate">${(data.cities_pinged || []).join(', ') || 'N/A'}</div>
            </div>
          </div>
        </div>

        ${data.matched_suspect ? `
          <div class="p-2 border border-danger rounded bg-card mb-2 d-flex justify-content-between align-items-center">
            <div>
              <span class="badge badge-danger text-xs font-mono">MATCHED CASE SUSPECT</span>
              <strong>${data.matched_suspect.name}</strong> (${data.matched_suspect.person_id}) — ${data.matched_suspect.role}
            </div>
            <button class="btn btn-xs btn-outline-cyan" onclick="window.showDossierModal('${data.matched_suspect.person_id}')">
              View Police Dossier ↗
            </button>
          </div>
        ` : '<div class="text-xs text-muted mb-2">No direct criminal case identity registered for this SIM.</div>'}

        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-dark text-xs text-muted font-mono">
          <span>Engine: PhoneInfoga-HLR-v2.0</span>
          <button class="btn btn-xs btn-outline-cyan" onclick="window.filterCDRByPhone('${data.phone_raw}')">
            ${window.renderSvgIcon('phone', '', 12)} Filter Calls in Telecom Intercepts Tab
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 3. SHODAN / WHOIS NETWORK & DOMAIN RECONNAISSANCE
  // =========================================================================
  renderNetworkReconHtml() {
    return `
      <div>
        <p class="text-sm text-muted mb-3">
          Network infrastructure reconnaissance. Resolves live DNS records, reverse PTR, geographical ISP/ASN allocation, and Tor/Proxy infrastructure threats.
        </p>

        <div class="row g-2 align-items-center mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <input type="text" id="osintNetworkInput" class="tactical-input font-mono" placeholder="Enter IP or Domain (e.g. 8.8.8.8, 1.1.1.1, google.com)..." value="${this.cachedNetworkResult ? this.cachedNetworkResult.target : '8.8.8.8'}">
              <button class="btn btn-primary" onclick="window.osintEngineInstance.runNetworkScan()" ${this.isScanning ? 'disabled' : ''}>
                ${this.isScanning ? '<span class="spinner-border spinner-border-sm"></span> Scanning...' : window.renderSvgIcon('network', '', 14) + ' Execute Network Recon'}
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex flex-wrap gap-1 align-items-center">
              <span class="text-xs text-muted">Recon Presets:</span>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadNetworkPreset('8.8.8.8')">8.8.8.8 (Google DNS)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadNetworkPreset('1.1.1.1')">1.1.1.1 (Cloudflare)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadNetworkPreset('github.com')">github.com (Git Host)</button>
              <button class="btn btn-xs btn-outline-secondary font-mono" onclick="window.osintEngineInstance.loadNetworkPreset('wikipedia.org')">wikipedia.org</button>
            </div>
          </div>
        </div>

        <div id="osintNetworkResultBox">
          ${this.cachedNetworkResult ? this.renderNetworkResultContent(this.cachedNetworkResult) : `
            <div class="datalab-result-box text-center p-5 text-muted">
              ${window.renderSvgIcon('network', 'text-muted mb-2', 32)}<br>
              Enter a Domain or IP address, then click <strong>EXECUTE NETWORK RECON</strong>.
            </div>
          `}
        </div>
      </div>
    `;
  }

  loadNetworkPreset(target) {
    const input = document.getElementById('osintNetworkInput');
    if (input) input.value = target;
    this.runNetworkScan();
  }

  async runNetworkScan() {
    const input = document.getElementById('osintNetworkInput');
    const target = (input ? input.value : '8.8.8.8').trim();
    if (!target) return;

    this.isScanning = true;
    const box = document.getElementById('osintNetworkResultBox');
    if (box) {
      box.innerHTML = `
        <div class="datalab-result-box text-center p-4">
          <div class="spinner-border text-cyan mb-2"></div>
          <div class="font-mono text-sm text-cyan">EXECUTING LIVE DNS RESOLUTION & IP GEOLOCATION FOR ${target}...</div>
        </div>
      `;
    }

    try {
      let res = null;
      if (window.CrimeNetAPI) {
        res = await window.CrimeNetAPI.scanOSINTNetwork(target);
      }
      this.cachedNetworkResult = res;
      if (box && res) {
        box.innerHTML = this.renderNetworkResultContent(res);
      }
    } catch (e) {
      if (box) box.innerHTML = `<div class="text-danger p-3">Network recon failed: ${e.message}</div>`;
    } finally {
      this.isScanning = false;
    }
  }

  renderNetworkResultContent(data) {
    const threat = data.threat_score || 0;
    const isThreat = threat >= 40;

    return `
      <div class="border ${isThreat ? 'border-amber' : 'border-cyan'} rounded p-3 bg-card-subtle">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 class="font-mono text-cyan mb-0">${data.resolved_ip}</h4>
            <span class="text-xs text-muted font-mono">Target: ${data.target} • Reverse DNS: ${data.reverse_dns}</span>
          </div>
          <div class="text-end">
            <span class="badge ${isThreat ? 'badge-amber' : 'badge-emerald'} font-mono">THREAT RISK: ${threat}/100</span>
            <div class="text-xs text-muted font-mono">Latency: ${data.latency_ms}ms</div>
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">LOCATION / COUNTRY</span>
              <div class="font-bold text-slate">${data.city ? `${data.city}, ` : ''}${data.country}</div>
              <div class="text-xs text-muted">${data.region || 'Unknown Region'}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">ISP PROVIDER</span>
              <div class="font-bold text-cyan">${data.isp}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">ORGANIZATION / ASN</span>
              <div class="font-bold text-slate">${data.org}</div>
              <div class="text-xs text-muted">${data.as_number || ''}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-mini">
              <span class="text-xs text-muted">INFRASTRUCTURE TYPE</span>
              <div class="font-bold ${data.is_private_network ? 'text-amber' : 'text-emerald'}">
                ${data.is_private_network ? 'Private LAN' : 'Public Routable IP'}
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-dark text-xs text-muted font-mono">
          <span>Engine: Shodan-WHOIS-Geo-v2.0</span>
          <button class="btn btn-xs btn-outline-cyan" onclick="window.osintEngineInstance.ingestNetworkToGraph('${data.resolved_ip}', '${data.target}')">
            ${window.renderSvgIcon('plus', '', 12)} Ingest IP Node to Active Graph
          </button>
        </div>
      </div>
    `;
  }

  ingestNetworkToGraph(ip, target) {
    if (!window.graphInstance) {
      window.showTacticalNotification('Link Analysis Graph not initialized.');
      return;
    }

    const nodeId = `IP-${ip.replace(/[^0-9]/g, '_')}`;
    if (!window.graphInstance.nodeMap.has(nodeId)) {
      const node = {
        id: nodeId,
        name: `${target} (${ip})`,
        type: 'network_host',
        threatScore: 45,
        role: 'Server Infrastructure',
        color: '#a855f7',
        radius: 12,
        x: window.graphInstance.width / 2 + (Math.random() - 0.5) * 150,
        y: window.graphInstance.height / 2 + (Math.random() - 0.5) * 150,
        vx: 0,
        vy: 0
      };
      window.graphInstance.nodes.push(node);
      window.graphInstance.nodeMap.set(nodeId, node);
    }

    const tabBtn = document.querySelector('[data-tab="graph"]');
    if (tabBtn) tabBtn.click();
    window.showTacticalNotification(`Injected Server IP Node [${ip}] into active link analysis graph.`);
  }

  // =========================================================================
  // 4. UNDERGROUND INTERCEPT DATABASE
  // =========================================================================
  renderArchiveHtml() {
    const engine = window.crimeDataEngine;
    if (!engine) return '<div class="p-3 text-muted">Data engine not loaded.</div>';

    let list = engine.socialPosts || [];
    if (this.currentPlatformFilter !== 'ALL') {
      list = list.filter(p => p.platform.toLowerCase() === this.currentPlatformFilter.toLowerCase());
    }
    if (this.archiveSearchTerm) {
      const q = this.archiveSearchTerm.toLowerCase();
      list = list.filter(p => p.text.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
    }

    return `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="ledger-filters d-flex gap-1">
            <button class="btn-filter ${this.currentPlatformFilter === 'ALL' ? 'active' : ''}" onclick="window.osintEngineInstance.filterArchive('ALL')">All Platforms (${engine.socialPosts.length})</button>
            <button class="btn-filter ${this.currentPlatformFilter === 'Instagram' ? 'active' : ''}" onclick="window.osintEngineInstance.filterArchive('Instagram')">Instagram</button>
            <button class="btn-filter ${this.currentPlatformFilter === 'Telegram' ? 'active' : ''}" onclick="window.osintEngineInstance.filterArchive('Telegram')">Telegram</button>
            <button class="btn-filter ${this.currentPlatformFilter === 'X' ? 'active' : ''}" onclick="window.osintEngineInstance.filterArchive('X')">X (Twitter)</button>
            <button class="btn-filter ${this.currentPlatformFilter === 'WhatsApp' ? 'active' : ''}" onclick="window.osintEngineInstance.filterArchive('WhatsApp')">WhatsApp</button>
          </div>
          <input type="text" placeholder="Search intercepts by keyword or handle..." class="ledger-search" value="${this.archiveSearchTerm}" oninput="window.osintEngineInstance.searchArchive(this.value)">
        </div>

        <div class="table-responsive">
          <table class="tactical-table">
            <thead>
              <tr>
                <th>POST ID</th>
                <th>PLATFORM</th>
                <th>HANDLE</th>
                <th>SUBJECT</th>
                <th>DATE</th>
                <th>INTERCEPTED POST TEXT</th>
                <th>MENTIONS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => {
                const subj = engine.personMap.get(p.person_id);
                const isContraband = p.text.includes('shipment') || p.text.includes('deal closing') || p.text.includes('money moves') || p.text.includes('consignment');

                return `
                  <tr class="${isContraband ? 'row-alert' : ''}">
                    <td class="font-mono text-cyan">${p.post_id}</td>
                    <td><span class="badge badge-purple">${p.platform}</span></td>
                    <td class="font-mono text-xs text-slate">${p.handle}</td>
                    <td><strong>${subj ? subj.name : 'Unknown'}</strong> (${p.person_id})</td>
                    <td class="text-muted text-xs">${p.date}</td>
                    <td>
                      ${isContraband ? '<span class="badge badge-danger text-xs">CONTRABAND SIGNAL</span> ' : ''}
                      "${p.text}"
                    </td>
                    <td>
                      ${p.mentions_handle ? `<span class="badge badge-cyan">${p.mentions_handle} (${p.mentions_person_id})</span>` : '<span class="text-muted text-xs">None</span>'}
                    </td>
                    <td>
                      <button class="btn btn-xs btn-outline-cyan" onclick="window.osintEngineInstance.investigateHandle('${p.handle}')">
                        Scan Handle
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  filterArchive(platform) {
    this.currentPlatformFilter = platform;
    const body = document.getElementById('osintModeBody');
    if (body) body.innerHTML = this.renderArchiveHtml();
  }

  searchArchive(q) {
    this.archiveSearchTerm = q;
    const body = document.getElementById('osintModeBody');
    if (body) body.innerHTML = this.renderArchiveHtml();
  }

  investigateHandle(handle) {
    this.setMode('USERNAME');
    setTimeout(() => {
      this.loadHandlePreset(handle);
    }, 50);
  }
}

window.OSINTEngine = OSINTEngine;
window.filterCDRByPhone = function(phone) {
  const cdrTab = document.querySelector('[data-tab="cdr"]');
  if (cdrTab) cdrTab.click();
  setTimeout(() => {
    const searchInput = document.getElementById('cdrSearchInput');
    if (searchInput) {
      searchInput.value = phone;
      searchInput.dispatchEvent(new Event('input'));
    }
  }, 100);
};
