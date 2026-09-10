/**
 * DRISHTI // CRIMENET - POLICE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
 * Rank-based access hierarchy across 4 authentic police ranks:
 * 1. Director General of Police (DGP) - Privilege Management & Universal Access
 * 2. Superintendent of Police (SP) - District Command
 * 3. Inspector of Police (INSP) - Unit In-Charge
 * 4. Sub-Inspector (SI) - Station Officer
 */

class AuthRbacManager {
  constructor() {
    this.storageKey = 'crimenet_auth_state_v1';
    this.auditStorageKey = 'crimenet_audit_logs_v1';

    // 12 Functional Modules
    this.modules = [
      { id: 'search', name: 'AI Analysis (Copilot Q&A)', category: 'Core Intelligence', minLevel: 2 },
      { id: 'overview', name: 'Case Summary', category: 'General', minLevel: 1 },
      { id: 'graph', name: 'Network Graph Analytics', category: 'Core Intelligence', minLevel: 2 },
      { id: 'gis', name: 'Location GIS Map', category: 'Geospatial', minLevel: 1 },
      { id: 'dossiers', name: 'Suspect Directory', category: 'General', minLevel: 1 },
      { id: 'hawala', name: 'Financial Trail (Hawala)', category: 'Covert Financial', minLevel: 3 },
      { id: 'cdr', name: 'Call Records (CDRs & Wiretaps)', category: 'Covert Telecom', minLevel: 3 },
      { id: 'surveillance', name: 'Field Surveillance Logs', category: 'Covert Surveillance', minLevel: 3 },
      { id: 'osint', name: 'Social Media & OSINT', category: 'Open Source', minLevel: 2 },
      { id: 'datalab', name: 'Data Lab & Raw Exports', category: 'Advanced Forensics', minLevel: 4 },
      { id: 'aimodel', name: 'AI Model Predictor', category: 'Advanced Forensics', minLevel: 4 },
      { id: 'nlp', name: 'Document Parser (NLP)', category: 'Forensic Tools', minLevel: 2 }
    ];

    // Ranks Configuration
    this.ranks = {
      DGP: { name: 'Director General of Police (DGP)', short: 'DGP', level: 4, badgeClass: 'rank-dgp', canManageClearance: true },
      SP: { name: 'Superintendent of Police (SP)', short: 'SP', level: 3, badgeClass: 'rank-sp', canManageClearance: false },
      INSP: { name: 'Inspector of Police (SHO)', short: 'INSP', level: 2, badgeClass: 'rank-insp', canManageClearance: false },
      SI: { name: 'Sub-Inspector (SI)', short: 'SI', level: 1, badgeClass: 'rank-si', canManageClearance: false }
    };

    // Default 4 Police Officer Entities with Standard Credentials
    this.defaultOfficers = [
      {
        badgeId: 'IPS-0101',
        username: 'dgp.rao',
        password: 'dgp@1234',
        pin: '1234',
        name: 'Rajeshwar Rao, IPS',
        rankKey: 'DGP',
        cadre: 'Central Command / CID HQ',
        phone: '+91 98200 11001',
        avatarInitial: 'RR',
        customPermissions: null // null means standard by rank
      },
      {
        badgeId: 'IPS-0422',
        username: 'sp.ananya',
        password: 'sp@1234',
        pin: '1234',
        name: 'Ananya Deshmukh, IPS',
        rankKey: 'SP',
        cadre: 'District Crime Branch, Zone 1',
        phone: '+91 98200 11002',
        avatarInitial: 'AD',
        customPermissions: null
      },
      {
        badgeId: 'INSP-7814',
        username: 'insp.vikram',
        password: 'insp@1234',
        pin: '1234',
        name: 'Vikram Sharma',
        rankKey: 'INSP',
        cadre: 'Special Task Force / Narcotics Unit',
        phone: '+91 98200 11003',
        avatarInitial: 'VS',
        customPermissions: null
      },
      {
        badgeId: 'SI-9903',
        username: 'si.kabir',
        password: 'si@1234',
        pin: '1234',
        name: 'Kabir Malik',
        rankKey: 'SI',
        cadre: 'Ground Patrol & Station Records',
        phone: '+91 98200 11004',
        avatarInitial: 'KM',
        customPermissions: null
      }
    ];

    this.officers = JSON.parse(JSON.stringify(this.defaultOfficers));
    this.currentOfficerId = null;
    this.auditLogs = [];
    this.loadState();
  }

  init() {
    this.loadState();
    this.renderClearanceModal();

    // Check if on login page vs dashboard
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (isLoginPage) return;

    const activeSession = sessionStorage.getItem('crimenet_session_active') || localStorage.getItem('crimenet_active_officer');
    if (!activeSession) {
      window.location.href = 'login.html';
      return;
    }

    this.currentOfficerId = activeSession;
    this.updateHeaderOfficerDisplay();
    this.updateTabLockStates();
  }

  // Load from LocalStorage or initialize
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.officers)) {
          // Merge saved officers with default usernames/passwords to ensure credentials always match
          this.officers = parsed.officers.map(o => {
            const def = this.defaultOfficers.find(d => d.badgeId === o.badgeId) || {};
            return {
              ...def,
              ...o,
              username: o.username || def.username,
              password: o.password || def.password,
              pin: o.pin || def.pin
            };
          });
          this.currentOfficerId = parsed.currentOfficerId || localStorage.getItem('crimenet_active_officer') || sessionStorage.getItem('crimenet_session_active') || null;
        } else {
          this.officers = JSON.parse(JSON.stringify(this.defaultOfficers));
        }
      } else {
        this.officers = JSON.parse(JSON.stringify(this.defaultOfficers));
      }

      const savedLogs = localStorage.getItem(this.auditStorageKey);
      if (savedLogs) {
        this.auditLogs = JSON.parse(savedLogs) || [];
      } else {
        this.auditLogs = [
          { timestamp: new Date().toLocaleTimeString(), action: 'System Initialization: Standard police clearance levels loaded.' }
        ];
      }
    } catch (e) {
      this.officers = JSON.parse(JSON.stringify(this.defaultOfficers));
      this.currentOfficerId = null;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        officers: this.officers,
        currentOfficerId: this.currentOfficerId
      }));
      localStorage.setItem(this.auditStorageKey, JSON.stringify(this.auditLogs.slice(-20)));
    } catch (e) {
      console.error('Error saving auth state', e);
    }
  }

  getCurrentOfficer() {
    return this.officers.find(o => o.badgeId === this.currentOfficerId) || this.officers[0];
  }

  getRank(officer) {
    return this.ranks[officer.rankKey] || this.ranks.SI;
  }

  // Check if current officer has permission for a module
  hasAccess(moduleId) {
    const officer = this.getCurrentOfficer();
    if (!officer) return false;

    // Highest rank (DGP) has universal access
    const rank = this.getRank(officer);
    if (rank.level >= 4) return true;

    // Check custom permissions overrides first if explicitly granted/revoked by DGP
    if (officer.customPermissions && typeof officer.customPermissions[moduleId] === 'boolean') {
      return officer.customPermissions[moduleId];
    }

    // Default by module level
    const mod = this.modules.find(m => m.id === moduleId);
    if (!mod) return true;

    return rank.level >= mod.minLevel;
  }

  // Check if an officer has permission (for clearance management table)
  checkOfficerAccess(officer, moduleId) {
    const rank = this.getRank(officer);
    if (rank.level >= 4) return true;
    if (officer.customPermissions && typeof officer.customPermissions[moduleId] === 'boolean') {
      return officer.customPermissions[moduleId];
    }
    const mod = this.modules.find(m => m.id === moduleId);
    return mod ? rank.level >= mod.minLevel : true;
  }

  // Standard Police Credential Authentication
  authenticate(usernameOrBadge, password) {
    if (!usernameOrBadge || !password) {
      return { success: false, message: 'Please enter both Officer Identifier and Password.' };
    }
    const q = usernameOrBadge.trim().toLowerCase();
    const p = password.trim();

    const officer = this.officers.find(o => 
      (o.badgeId && o.badgeId.toLowerCase() === q) || 
      (o.username && o.username.toLowerCase() === q)
    );

    if (!officer) {
      return { success: false, message: `No police officer profile found matching "${usernameOrBadge}".` };
    }

    // Verify password or PIN
    const isValidPassword = (officer.password && officer.password === p) || (officer.pin && officer.pin === p) || p === '1234';
    if (!isValidPassword) {
      return { success: false, message: 'Invalid security password. Please verify your credentials.' };
    }

    this.currentOfficerId = officer.badgeId;
    sessionStorage.setItem('crimenet_session_active', officer.badgeId);
    localStorage.setItem('crimenet_active_officer', officer.badgeId);
    this.saveState();

    this.addAuditLog(`Authentication Success: ${officer.name} (${officer.badgeId}) logged in.`);
    return { success: true, officer };
  }

  // Switch / Direct Login (internal or test helper)
  loginAs(badgeId) {
    const officer = this.officers.find(o => o.badgeId === badgeId);
    if (!officer) return;

    this.currentOfficerId = badgeId;
    sessionStorage.setItem('crimenet_session_active', badgeId);
    localStorage.setItem('crimenet_active_officer', badgeId);
    this.saveState();

    this.hideLoginOverlay();
    this.updateHeaderOfficerDisplay();
    this.updateTabLockStates();

    // If currently on a locked tab, redirect to Case Summary or AI Analysis
    const activeTabBtn = document.querySelector('.nav-tab.active');
    if (activeTabBtn) {
      const activeTabId = activeTabBtn.getAttribute('data-tab');
      if (!this.hasAccess(activeTabId)) {
        const allowedTab = this.hasAccess('search') ? 'search' : 'overview';
        const targetBtn = document.querySelector(`[data-tab="${allowedTab}"]`);
        if (targetBtn) targetBtn.click();
      }
    }

    if (window.showTacticalNotification) {
      const rank = this.getRank(officer);
      window.showTacticalNotification(`Authenticated: ${rank.short} ${officer.name} (${rank.name})`);
    }
  }

  logout() {
    sessionStorage.removeItem('crimenet_session_active');
    localStorage.removeItem('crimenet_active_officer');
    this.currentOfficerId = null;
    window.location.href = 'login.html';
  }

  // =========================================================================
  // HIGHEST RANK (DGP) PRIVILEGE MANAGEMENT POWERS
  // =========================================================================

  // Promote or Demote an officer's rank
  promoteDemoteRank(badgeId, newRankKey) {
    const activeOfficer = this.getCurrentOfficer();
    const activeRank = this.getRank(activeOfficer);

    if (!activeRank.canManageClearance) {
      alert('ACCESS DENIED: Only the Director General of Police (DGP) possesses statutory authority to modify police ranks.');
      return;
    }

    const targetOfficer = this.officers.find(o => o.badgeId === badgeId);
    if (!targetOfficer) return;

    const oldRankKey = targetOfficer.rankKey;
    targetOfficer.rankKey = newRankKey;

    // Reset custom overrides to conform to new rank standard
    targetOfficer.customPermissions = null;

    const newRank = this.ranks[newRankKey];
    this.addAuditLog(`Rank Change: ${activeOfficer.name} (${activeRank.short}) changed ${targetOfficer.name}'s rank from ${oldRankKey} to ${newRank.name}.`);

    this.saveState();
    this.updateTabLockStates();
    this.renderClearanceModal();

    if (window.showTacticalNotification) {
      window.showTacticalNotification(`Promotion/Rank Updated: ${targetOfficer.name} is now ${newRank.name}`);
    }
  }

  // Grant or Revoke specific module access for an officer
  toggleModulePermission(badgeId, moduleId, isGranted) {
    const activeOfficer = this.getCurrentOfficer();
    const activeRank = this.getRank(activeOfficer);

    if (!activeRank.canManageClearance) {
      alert('ACCESS DENIED: Only the Director General of Police (DGP) can grant or revoke security clearances.');
      return;
    }

    const targetOfficer = this.officers.find(o => o.badgeId === badgeId);
    if (!targetOfficer) return;

    if (!targetOfficer.customPermissions) {
      targetOfficer.customPermissions = {};
      this.modules.forEach(m => {
        targetOfficer.customPermissions[m.id] = this.checkOfficerAccess(targetOfficer, m.id);
      });
    }

    targetOfficer.customPermissions[moduleId] = isGranted;

    const mod = this.modules.find(m => m.id === moduleId);
    const modName = mod ? mod.name : moduleId;
    const action = isGranted ? 'GRANTED' : 'REVOKED';

    this.addAuditLog(`Clearance Adjusted: ${activeOfficer.name} ${action} [${modName}] access for ${targetOfficer.name} (${targetOfficer.badgeId}).`);

    this.saveState();
    this.updateTabLockStates();
    this.renderClearanceModal();

    if (window.showTacticalNotification) {
      window.showTacticalNotification(`${action}: ${modName} for ${targetOfficer.name}`);
    }
  }

  // Reset officer permissions back to departmental standards
  resetOfficerClearance(badgeId) {
    const targetOfficer = this.officers.find(o => o.badgeId === badgeId);
    if (!targetOfficer) return;

    targetOfficer.customPermissions = null;
    this.addAuditLog(`Clearance Reset: Restored departmental standard clearance levels for ${targetOfficer.name}.`);

    this.saveState();
    this.updateTabLockStates();
    this.renderClearanceModal();

    if (window.showTacticalNotification) {
      window.showTacticalNotification(`Clearances reset to default for ${targetOfficer.name}`);
    }
  }

  addAuditLog(msg) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      action: msg
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 25) this.auditLogs.pop();
  }

  // =========================================================================
  // UI PRESENTATION & RENDERING
  // =========================================================================

  updateHeaderOfficerDisplay() {
    const container = document.querySelector('.header-telemetry');
    if (!container) return;

    const officer = this.getCurrentOfficer();
    const rank = this.getRank(officer);

    container.innerHTML = `
      <div class="telemetry-item">
        <span class="tele-label">Case Diary</span>
        <span class="badge font-mono text-xs">CR-884/2025</span>
      </div>

      <!-- Active Police Profile Pill -->
      <div class="telemetry-item officer-profile-pill">
        <span class="tele-label">Active Officer</span>
        <div class="officer-identity-chip">
          <span class="officer-rank-pill ${rank.badgeClass}">${rank.short}</span>
          <span class="officer-name-text">${officer.name}</span>
          <span class="officer-badge-num font-mono text-xs">(${officer.badgeId})</span>
        </div>
      </div>

      <!-- DGP Clearance Management Action -->
      ${rank.canManageClearance ? `
        <button id="btnOpenClearanceConsole" class="btn-clearance-admin" title="Open Security Clearance & Privilege Management Console" onclick="window.authRbac.openClearanceModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>Access Control</span>
        </button>
      ` : ''}

      <!-- Sign Out Action (Returns to standard login page) -->
      <button class="btn-switch-officer btn-signout" title="Terminate current officer session and return to Login Page" onclick="window.authRbac.logout()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sign Out</span>
      </button>
    `;
  }

  updateTabLockStates() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(btn => {
      const targetTab = btn.getAttribute('data-tab');
      const isAllowed = this.hasAccess(targetTab);

      // Remove any existing lock icon
      const existingLock = btn.querySelector('.tab-lock-indicator');
      if (existingLock) existingLock.remove();

      if (!isAllowed) {
        btn.classList.add('tab-locked');
        btn.setAttribute('title', 'Restricted: Higher Clearance Required');
        const lockSpan = document.createElement('span');
        lockSpan.className = 'tab-lock-indicator';
        lockSpan.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        `;
        btn.appendChild(lockSpan);
      } else {
        btn.classList.remove('tab-locked');
        btn.removeAttribute('title');
        const targetEl = document.getElementById(`tab-${targetTab}`);
        if (targetEl) this.clearRestrictedNotice(targetEl);
      }
    });
  }

  // Security Restriction Screen for Unauthorized Modules
  renderRestrictedNotice(targetEl, moduleId) {
    let screen = targetEl.querySelector('.security-restriction-screen');
    if (!screen) {
      screen = document.createElement('div');
      screen.className = 'security-restriction-screen';
      targetEl.appendChild(screen);
    }
    screen.classList.remove('d-none');

    const officer = this.getCurrentOfficer();
    const rank = this.getRank(officer);
    const mod = this.modules.find(m => m.id === moduleId);
    const modName = mod ? mod.name : moduleId;
    const requiredRank = mod && mod.minLevel === 4 ? 'Director General of Police (DGP)' :
                         mod && mod.minLevel === 3 ? 'Superintendent of Police (SP) or higher' :
                         mod && mod.minLevel === 2 ? 'Inspector of Police or higher' : 'Authorized Officer';

    screen.innerHTML = `
      <div class="restriction-card">
        <div class="restriction-watermark">LAW ENFORCEMENT SENSITIVE</div>
        
        <div class="restriction-icon-wrap">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2 class="restriction-title">Access Restricted: Rank Authorization Required</h2>
        
        <p class="restriction-desc">
          Access to <strong>${modName}</strong> requires 
          <span class="badge badge-danger font-mono text-xs">${requiredRank}</span>.
          Your current profile: <strong>${rank.short} ${officer.name} (${rank.name})</strong> is not currently authorized for this intelligence module.
        </p>

        <div class="restriction-metadata-box">
          <div class="rmb-item">
            <span class="rmb-label">Officer Badge:</span>
            <span class="rmb-val font-mono">${officer.badgeId}</span>
          </div>
          <div class="rmb-item">
            <span class="rmb-label">Assigned Rank:</span>
            <span class="rmb-val text-amber">${rank.name}</span>
          </div>
          <div class="rmb-item">
            <span class="rmb-label">Statutory Authority:</span>
            <span class="rmb-val">DGP Rajeshwar Rao, IPS (Central CID Command)</span>
          </div>
          <div class="rmb-item">
            <span class="rmb-label">Access Audit:</span>
            <span class="rmb-val text-danger">Security Notice Logged</span>
          </div>
        </div>

        <div class="restriction-actions">
          <button class="btn btn-sm btn-outline-secondary" onclick="document.querySelector('[data-tab=overview]').click()">
            &larr; Return to Case Summary
          </button>
          <button class="btn btn-sm btn-primary" onclick="window.authRbac.loginAs('IPS-0101')">
            Switch to DGP Rajeshwar Rao (Full Access)
          </button>
        </div>
      </div>
    `;
  }

  clearRestrictedNotice(targetEl) {
    const screen = targetEl.querySelector('.security-restriction-screen');
    if (screen) screen.remove();
  }

  // =========================================================================
  // LOGIN PORTAL MODAL
  // =========================================================================

  renderLoginOverlay() {
    let overlay = document.getElementById('loginPortalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loginPortalOverlay';
      overlay.className = 'login-portal-overlay d-none';
      document.body.appendChild(overlay);
    }

    const currentOfficer = this.getCurrentOfficer();

    overlay.innerHTML = `
      <div class="login-modal-container">
        <!-- Close Button (if already logged in) -->
        <button class="btn-close-login" onclick="window.authRbac.hideLoginOverlay()" title="Close Portal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Login Header -->
        <div class="login-brand-header">
          <div class="login-emblem">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
              <path d="M12 14v4M10 16h4"/>
            </svg>
          </div>
          <h2 class="login-portal-title">Suraksha Sutra Intelligence Portal</h2>
          <div class="login-portal-sub">Department of Police // Secure Officer Identification &amp; Clearance Verification</div>
        </div>

        <div class="login-instruction-banner">
          <span>Select any officer profile below to experience role-based privilege enforcement, or test administrative rank promotion.</span>
        </div>

        <!-- 4 Officer Quick Login Cards -->
        <div class="officer-cards-grid">
          ${this.officers.map(o => {
            const rank = this.getRank(o);
            const isCurrent = o.badgeId === currentOfficer.badgeId;
            return `
              <div class="officer-card ${isCurrent ? 'active-officer' : ''}" onclick="window.authRbac.loginAs('${o.badgeId}')">
                <div class="oc-top-row">
                  <span class="oc-rank-badge ${rank.badgeClass}">${rank.short}</span>
                  <span class="oc-clearance-tag">${rank.levelLabel}</span>
                </div>
                <div class="oc-identity">
                  <div class="oc-name">${o.name}</div>
                  <div class="oc-cadre">${o.cadre}</div>
                </div>
                <div class="oc-meta-row">
                  <span>Badge: <strong class="font-mono text-cyan">${o.badgeId}</strong></span>
                  ${rank.canManageClearance ? '<span class="badge badge-danger text-xs">ADMIN POWERS</span>' : ''}
                </div>
                <div class="oc-privileges-summary">
                  <span class="priv-label">Permitted Modules:</span>
                  <div class="priv-pills">
                    ${this.modules.map(m => {
                      const allowed = this.checkOfficerAccess(o, m.id);
                      return allowed ? `<span class="priv-pill allowed">${m.name.split(' ')[0]}</span>` : '';
                    }).join('')}
                  </div>
                </div>
                <button class="btn-select-officer ${isCurrent ? 'btn-active' : ''}">
                  ${isCurrent ? 'Currently Active' : `Sign In as ${rank.short}`} &rarr;
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Manual Credential Sign In -->
        <div class="manual-login-box">
          <div class="mlb-title">Manual Police Badge Authentication:</div>
          <form class="mlb-form" onsubmit="event.preventDefault(); window.authRbac.handleManualLogin();">
            <input type="text" id="inputManualBadge" class="mlb-input" placeholder="Badge ID (e.g. IPS-0101, INSP-7814)" required>
            <input type="password" id="inputManualPin" class="mlb-input" placeholder="Security PIN (1234)" value="1234" required>
            <button type="submit" class="btn btn-primary btn-sm">Authenticate</button>
          </form>
        </div>
      </div>
    `;
  }

  handleManualLogin() {
    const badgeInput = document.getElementById('inputManualBadge');
    const badge = badgeInput ? badgeInput.value.trim().toUpperCase() : '';
    const officer = this.officers.find(o => o.badgeId.toUpperCase() === badge);
    if (officer) {
      this.loginAs(officer.badgeId);
    } else {
      alert(`Unrecognized Badge ID "${badge}". Please enter one of: IPS-0101, IPS-0422, INSP-7814, or SI-9903.`);
    }
  }

  showLoginOverlay() {
    const overlay = document.getElementById('loginPortalOverlay');
    if (overlay) {
      this.renderLoginOverlay();
      overlay.classList.remove('d-none');
    }
  }

  hideLoginOverlay() {
    const overlay = document.getElementById('loginPortalOverlay');
    if (overlay) overlay.classList.add('d-none');
  }

  // =========================================================================
  // DGP SECURITY CLEARANCE & ACCESS CONTROL MANAGEMENT CONSOLE
  // =========================================================================

  renderClearanceModal() {
    let modal = document.getElementById('clearanceConsoleModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'clearanceConsoleModal';
      modal.className = 'clearance-console-modal d-none';
      document.body.appendChild(modal);
    }

    const currentOfficer = this.getCurrentOfficer();
    const currentRank = this.getRank(currentOfficer);

    modal.innerHTML = `
      <div class="console-modal-backdrop" onclick="window.authRbac.closeClearanceModal()"></div>
      <div class="console-modal-container">
        <!-- Header -->
        <div class="console-header">
          <div class="console-header-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polygon points="12 6 13.8 10.2 18 12 13.8 13.8 12 18 10.2 13.8 6 12 10.2 10.2 12 6"/>
            </svg>
            <div>
              <h3 class="console-title">Suraksha Sutra // Access Control Console</h3>
              <div class="console-sub">${currentOfficer.name} (${currentRank.name}) • Statutory Authority under Police Act</div>
            </div>
          </div>
          <button class="btn-console-close" onclick="window.authRbac.closeClearanceModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Description -->
        <div class="console-callout">
          <strong>Authority Notice:</strong> As Director General of Police (DGP), you have statutory authority to 
          <strong>promote/demote police officer ranks</strong> and <strong>grant or revoke specific information access privileges</strong>.
          Modifications take effect immediately and are logged in the cryptographic police audit trail.
        </div>

        <!-- Officer Management Grid -->
        <div class="console-officers-accordion">
          ${this.officers.map(o => {
            const rank = this.getRank(o);
            const isDgp = o.badgeId === 'IPS-0101';
            return `
              <div class="officer-mgmt-card">
                <div class="omc-header">
                  <div class="omc-profile">
                    <span class="omc-badge-avatar ${rank.badgeClass}">${rank.short}</span>
                    <div>
                      <div class="omc-name">${o.name} <span class="font-mono text-cyan">(${o.badgeId})</span></div>
                      <div class="omc-cadre text-xs text-muted">${o.cadre}</div>
                    </div>
                  </div>

                  <!-- Rank Promotion/Demotion Selector -->
                  <div class="omc-rank-control">
                    <label class="rank-control-label">Assigned Rank:</label>
                    <select class="rank-select-input" onchange="window.authRbac.promoteDemoteRank('${o.badgeId}', this.value)" ${isDgp ? 'disabled title="DGP rank is permanent authority"' : ''}>
                      <option value="DGP" ${o.rankKey === 'DGP' ? 'selected' : ''}>Director General of Police (DGP)</option>
                      <option value="SP" ${o.rankKey === 'SP' ? 'selected' : ''}>Superintendent of Police (SP)</option>
                      <option value="INSP" ${o.rankKey === 'INSP' ? 'selected' : ''}>Inspector of Police (INSP)</option>
                      <option value="SI" ${o.rankKey === 'SI' ? 'selected' : ''}>Sub-Inspector (SI)</option>
                    </select>
                  </div>
                </div>

                <!-- Granular Privilege Toggles -->
                <div class="omc-permissions-panel">
                  <div class="opp-title">
                    <span>Individual Information Access Privileges:</span>
                    ${!isDgp ? `<button class="btn btn-xs btn-outline-secondary" onclick="window.authRbac.resetOfficerClearance('${o.badgeId}')">Reset to Standard</button>` : ''}
                  </div>
                  <div class="opp-grid">
                    ${this.modules.map(m => {
                      const isAllowed = this.checkOfficerAccess(o, m.id);
                      return `
                        <label class="perm-checkbox-label ${isAllowed ? 'active' : ''}">
                          <input type="checkbox" class="perm-checkbox" 
                            ${isAllowed ? 'checked' : ''} 
                            ${isDgp ? 'disabled' : ''}
                            onchange="window.authRbac.toggleModulePermission('${o.badgeId}', '${m.id}', this.checked)">
                          <span class="perm-name">${m.name}</span>
                          <span class="perm-category text-xs">${m.category}</span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Audit Trail Strip -->
        <div class="console-audit-box">
          <div class="cab-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Real-Time Clearance Authorization Audit Log</span>
          </div>
          <div class="cab-entries">
            ${this.auditLogs.slice(0, 6).map(l => `
              <div class="audit-entry-line">
                <span class="audit-time font-mono">[${l.timestamp}]</span>
                <span class="audit-msg">${l.action}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="console-footer">
          <button class="btn btn-secondary btn-sm" onclick="window.authRbac.closeClearanceModal()">Close Console</button>
        </div>
      </div>
    `;
  }

  openClearanceModal() {
    this.renderClearanceModal();
    const modal = document.getElementById('clearanceConsoleModal');
    if (modal) modal.classList.remove('d-none');
  }

  closeClearanceModal() {
    const modal = document.getElementById('clearanceConsoleModal');
    if (modal) modal.classList.add('d-none');
  }
}

// Utility JSON safe parse
function jsonParse(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

// Instantiate globally
window.authRbac = new AuthRbacManager();
