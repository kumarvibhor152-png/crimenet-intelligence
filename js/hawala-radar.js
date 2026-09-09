/**
 * DRISHTI-CRIMENEXUS FINANCIAL CRIMES & HAWALA RADAR
 * Analyzes smurfing funnels, structuring violations under PMLA, and generates
 * official Financial Intelligence Unit (FIU-IND) Suspicious Transaction Reports.
 */

class HawalaRadar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = 'ALL';
    this.searchTerm = '';
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;
    const engine = window.crimeDataEngine;
    if (!engine) return;

    const sunriseAcc = "Axis-203577948775";
    const sunriseIn = engine.financialTxns.filter(t => t.receiver_account === sunriseAcc);
    const sunriseOut = engine.financialTxns.filter(t => t.sender_account === sunriseAcc);
    const structuredTxns = engine.financialTxns.filter(t => t.flag === 'structuring' || t.flag === 'below-1L-threshold');

    const totalInflow = sunriseIn.reduce((s, t) => s + t.amount_inr, 0);
    const totalOutflow = sunriseOut.reduce((s, t) => s + t.amount_inr, 0);

    this.container.innerHTML = `
      <div class="hawala-grid">
        <!-- Top Metrics Cards -->
        <div class="intel-stat-card border-danger">
          <div class="stat-label">PRIMARY HAWALA FUNNEL</div>
          <div class="stat-value text-purple">SUNRISE MONEY EXCH (O10)</div>
          <div class="stat-meta">Axis Bank: ${sunriseAcc}</div>
        </div>

        <div class="intel-stat-card border-amber">
          <div class="stat-label">AGGREGATE FUNNELED INFLOW</div>
          <div class="stat-value text-emerald">₹${totalInflow.toLocaleString()}</div>
          <div class="stat-meta">${sunriseIn.length} Source Deposits</div>
        </div>

        <div class="intel-stat-card border-cyan">
          <div class="stat-label">DISPERSED SMURFING OUTFLOW</div>
          <div class="stat-value text-amber">₹${totalOutflow.toLocaleString()}</div>
          <div class="stat-meta">${sunriseOut.length} Outbound Smurf Payments</div>
        </div>

        <div class="intel-stat-card border-danger">
          <div class="stat-label">FIU-IND STRUCTURING FLAGS</div>
          <div class="stat-value text-danger">${structuredTxns.length} VIOLATIONS</div>
          <div class="stat-meta">Mandatory Threshold Evasions</div>
        </div>
      </div>

      <!-- Hawala Smurfing Funnel Interactive Diagram -->
      <div class="panel-section">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">💸</span> HAWALA LAYERING PIPELINE (VISUAL TRACE)
          </div>
          <div class="panel-controls">
            <button class="btn btn-sm btn-outline-danger" onclick="window.hawalaRadarInstance.generateSTRReport()">
              📄 Generate FIU-IND STR Report
            </button>
          </div>
        </div>

        <div class="funnel-container">
          <!-- Inflow Column -->
          <div class="funnel-col">
            <h5 class="funnel-heading text-emerald">📥 ILLEGAL INFLOW ORIGINS (${sunriseIn.length})</h5>
            <div class="funnel-items">
              ${sunriseIn.map(t => {
                const senderObj = engine.accountToOwner.get(t.sender_account);
                const name = senderObj ? senderObj.entity.name : 'Unknown Account';
                const id = senderObj ? (senderObj.type === 'person' ? senderObj.entity.person_id : senderObj.entity.org_id) : '';
                return `
                  <div class="funnel-card card-inflow" onclick="window.filterTransactionsByAccount('${t.sender_account}')">
                    <div class="card-party"><strong>${name}</strong> (${id})</div>
                    <div class="card-acc font-mono">${t.sender_account}</div>
                    <div class="card-meta">
                      <span class="badge badge-emerald">₹${t.amount_inr.toLocaleString()}</span>
                      <span class="text-muted">${t.mode} • ${t.date}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Central Conduit -->
          <div class="funnel-conduit">
            <div class="conduit-hub">
              <div class="conduit-pulse"></div>
              <div class="conduit-icon">🏦</div>
              <h4>SUNRISE MONEY EXCHANGE</h4>
              <p class="font-mono text-purple">Axis-203577948775</p>
              <div class="conduit-badge">IDENTIFIED HAWALA HUB</div>
              <p class="conduit-desc">
                Operates as an unlicensed intermediary. Ingests criminal cash deposits & NEFT wires, systematically 
                layering into micro-transfers strictly under ₹1,00,000 threshold to evade PMLA reporting.
              </p>
            </div>
          </div>

          <!-- Outflow Column -->
          <div class="funnel-col">
            <h5 class="funnel-heading text-amber">📤 SMURF DISPERSAL DESTINATIONS (${sunriseOut.length})</h5>
            <div class="funnel-items">
              ${sunriseOut.map(t => {
                const recObj = engine.accountToOwner.get(t.receiver_account);
                const name = recObj ? recObj.entity.name : 'Unknown Account';
                const id = recObj ? (recObj.type === 'person' ? recObj.entity.person_id : recObj.entity.org_id) : '';
                return `
                  <div class="funnel-card card-outflow" onclick="window.filterTransactionsByAccount('${t.receiver_account}')">
                    <div class="card-party"><strong>${name}</strong> (${id})</div>
                    <div class="card-acc font-mono">${t.receiver_account}</div>
                    <div class="card-meta">
                      <span class="badge badge-danger">₹${t.amount_inr.toLocaleString()}</span>
                      <span class="badge badge-dark">${t.flag || t.mode}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Searchable Forensic Ledger -->
      <div class="panel-section">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">🔍</span> FORENSIC BANKING TRANSACTION LEDGER (68 RECORDS)
          </div>
          <div class="ledger-filters">
            <button class="btn-filter ${this.currentFilter === 'ALL' ? 'active' : ''}" onclick="window.hawalaRadarInstance.setFilter('ALL')">All</button>
            <button class="btn-filter ${this.currentFilter === 'STRUCTURING' ? 'active' : ''}" onclick="window.hawalaRadarInstance.setFilter('STRUCTURING')">Structuring / Smurfing Only</button>
            <button class="btn-filter ${this.currentFilter === 'CASH' ? 'active' : ''}" onclick="window.hawalaRadarInstance.setFilter('CASH')">Cash Deposits Only</button>
            <input type="text" placeholder="Filter by Account or Person..." class="ledger-search" id="ledgerSearchInput" oninput="window.hawalaRadarInstance.onSearch(this.value)">
          </div>
        </div>

        <div class="table-responsive">
          <table class="tactical-table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>DATE</th>
                <th>SENDER (OWNER)</th>
                <th>RECEIVER (OWNER)</th>
                <th>AMOUNT</th>
                <th>PAYMENT MODE</th>
                <th>FORENSIC AUDIT FLAG</th>
              </tr>
            </thead>
            <tbody>
              ${this.getFilteredTxns().map(t => {
                const sObj = engine.accountToOwner.get(t.sender_account);
                const rObj = engine.accountToOwner.get(t.receiver_account);
                const sName = sObj ? `${sObj.entity.name} (${sObj.type === 'person' ? sObj.entity.person_id : sObj.entity.org_id})` : 'Unregistered';
                const rName = rObj ? `${rObj.entity.name} (${rObj.type === 'person' ? rObj.entity.person_id : rObj.entity.org_id})` : 'Unregistered';

                return `
                  <tr class="${t.flag ? 'row-alert' : ''}">
                    <td class="font-mono text-cyan">${t.txn_id}</td>
                    <td class="text-muted">${t.date}</td>
                    <td>
                      <div><strong>${sName}</strong></div>
                      <div class="font-mono text-xs text-muted">${t.sender_account}</div>
                    </td>
                    <td>
                      <div><strong>${rName}</strong></div>
                      <div class="font-mono text-xs text-muted">${t.receiver_account}</div>
                    </td>
                    <td class="font-mono font-bold ${t.flag ? 'text-danger' : 'text-slate'}">₹${t.amount_inr.toLocaleString()}</td>
                    <td><span class="mode-tag">${t.mode}</span></td>
                    <td>
                      ${t.flag === 'structuring' ? '<span class="badge badge-danger">⚠️ STRUCTURING</span>' :
                        t.flag === 'below-1L-threshold' ? '<span class="badge badge-amber">⚡ BELOW-1L SMURF</span>' :
                        '<span class="badge badge-muted">STANDARD</span>'}
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

  getFilteredTxns() {
    const engine = window.crimeDataEngine;
    let list = engine.financialTxns;

    if (this.currentFilter === 'STRUCTURING') {
      list = list.filter(t => t.flag === 'structuring' || t.flag === 'below-1L-threshold');
    } else if (this.currentFilter === 'CASH') {
      list = list.filter(t => t.mode === 'Cash Deposit');
    }

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(t => 
        t.txn_id.toLowerCase().includes(q) ||
        t.sender_account.toLowerCase().includes(q) ||
        t.receiver_account.toLowerCase().includes(q) ||
        t.mode.toLowerCase().includes(q)
      );
    }
    return list;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  }

  onSearch(term) {
    this.searchTerm = term;
    this.render();
  }

  generateSTRReport() {
    const engine = window.crimeDataEngine;
    const sunriseAcc = "Axis-203577948775";
    const sunriseOut = engine.financialTxns.filter(t => t.sender_account === sunriseAcc);
    const sunriseIn = engine.financialTxns.filter(t => t.receiver_account === sunriseAcc);

    const reportHtml = `
      <div class="official-dossier-print">
        <div class="dossier-header-bar">
          <div class="dossier-emblem">🇮🇳</div>
          <div class="dossier-title-box">
            <h2>FINANCIAL INTELLIGENCE UNIT (FIU-IND)</h2>
            <h3>SUSPICIOUS TRANSACTION REPORT (STR) // CONFIDENTIAL</h3>
            <p>Under Section 12 of Prevention of Money Laundering Act (PMLA), 2002</p>
          </div>
          <div class="dossier-ref">
            <strong>STR REF:</strong> FIU-IND/STR/2025/0842<br>
            <strong>DATE:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
            <strong>SECURITY:</strong> TOP SECRET / RESTRICTED
          </div>
        </div>

        <div class="dossier-section">
          <h4>1. REPORTED ENTITY & PRIMARY NEXUS</h4>
          <table class="report-table">
            <tr><td><strong>Entity Name:</strong> Sunrise Money Exchange (O10)</td><td><strong>Jurisdiction:</strong> Bengaluru, Karnataka</td></tr>
            <tr><td><strong>Bank & Account:</strong> Axis Bank (Axis-203577948775)</td><td><strong>Total Violations:</strong> 18 Transactions</td></tr>
            <tr><td><strong>Aggregate Laundering Volume:</strong> ₹11,38,700</td><td><strong>Primary Modus Operandi:</strong> Micro-Structuring & Layering</td></tr>
          </table>
        </div>

        <div class="dossier-section">
          <h4>2. REASON FOR SUSPICION</h4>
          <p>
            Account Axis-203577948775 exhibited classic Hawala Smurfing behaviour. The account acted as a financial sink 
            absorbing large deposits from known suspects undergoing investigation under NDPS Act (Kunal Khan P004, Sunita Reddy P025) 
            and Extortion (Anil Gupta P007). Immediately following cash deposits, funds were disbursed via 12 automated transfers 
            calibrated strictly between ₹35,000 and ₹91,000 to keep individual entries below the statutory ₹1,00,000 threshold.
          </p>
        </div>

        <div class="dossier-section">
          <h4>3. ACTIONABLE RECOMMENDATIONS</h4>
          <ol>
            <li>Immediate debit freeze on Axis Bank Account Axis-203577948775 under Section 17(1-A) PMLA.</li>
            <li>Summons under Section 50 PMLA to registered authorized signatories in Bengaluru.</li>
            <li>Liaison with Directorate of Enforcement (ED) and Narcotics Control Bureau (NCB).</li>
          </ol>
        </div>

        <div class="dossier-footer">
          <p>Generated by: CRIME BRANCH CID CYBER-INTELLIGENCE PORTAL • DRISHTI-CRIMENEXUS</p>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save STR PDF</button>
          <button class="btn btn-secondary" onclick="document.getElementById('strModal').remove()">Close</button>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'strModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `<div class="modal-card modal-lg">${reportHtml}</div>`;
    document.body.appendChild(modal);
  }
}

window.HawalaRadar = HawalaRadar;
window.filterTransactionsByAccount = function(acc) {
  const el = document.getElementById('ledgerSearchInput');
  if (el) {
    el.value = acc;
    window.hawalaRadarInstance.onSearch(acc);
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
