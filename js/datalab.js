/**
 * DRISHTI-CRIMENEXUS AI DATA INGESTION & NEURAL WORKBENCH
 * Empowers investigators to ingest live CDRs, run PyTorch Autoencoder on custom
 * bank ledgers, execute neural link predictions, and simulate SyndicateNet roles.
 */

// Sample CDR batch for 1-click live demo
const SAMPLE_CDR_CSV = `caller,receiver,duration,timestamp,city
9697848018,9850142940,340,2025-06-12 23:45:00,Surat
9850142940,9731781080,180,2025-06-13 01:15:00,Pune
9509839301,9697848018,420,2025-06-13 02:30:00,Nagpur
9033092327,9509839301,150,2025-06-13 03:10:00,Hyderabad
9697848018,9350305641,210,2025-06-13 04:05:00,Surat
9350305641,9489513433,95,2025-06-13 11:20:00,Lucknow
9489513433,9509839301,310,2025-06-13 14:15:00,Bengaluru
9103413164,9697848018,520,2025-06-13 16:40:00,Mumbai`;

// Sample Hawala transaction ledger for 1-click smurfing audit
const SAMPLE_HAWALA_CSV = `sender,receiver,amount,timestamp,bank
Axis-203577948775,ICICI-273665994394,48500,2025-06-14 02:15:00,Axis Bank
Axis-203577948775,HDFC-643354278056,49200,2025-06-14 02:22:00,Axis Bank
Axis-203577948775,Bank of Baroda-334013073383,47800,2025-06-14 02:30:00,Axis Bank
ICICI-273665994394,Axis-259961695156,48900,2025-06-14 02:45:00,ICICI Bank
SBI-984721948231,Axis-203577948775,150000,2025-06-14 11:00:00,State Bank of India
HDFC-462488651216,Bank of Baroda-851347210313,35000,2025-06-14 14:20:00,HDFC Bank
Axis-203577948775,Axis-110999011248,49500,2025-06-14 03:15:00,Axis Bank
Axis-203577948775,ICICI-928623824187,48200,2025-06-14 03:25:00,Axis Bank`;

class DataLabEngine {
  constructor() {
    this.ingestedCDRCount = 0;
    this.ingestedTxnCount = 0;
  }

  init() {
    this.renderDataLabTab();
    this.initNeuralLinkPredictor();
    this.initHawalaInteractiveScanner();
    this.initSyndicateNetSimulator();
    this.initTelemetryConsole();
  }

  renderDataLabTab() {
    const container = document.getElementById('tab-datalab');
    if (!container) return;

    container.innerHTML = `
      <div class="datalab-grid">
        <!-- Section Header -->
        <div class="panel-section full-width">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('cpu', 'text-cyan', 18)}</span> AI DATA INGESTION & NEURAL INTELLIGENCE LAB
            </div>
            <div class="panel-actions">
              <span class="badge badge-pulse-online">● LIVE MODEL INFERENCE</span>
              <span class="badge font-mono text-xs">PyTorch v2.9 CPU</span>
            </div>
          </div>
          <p class="text-sm text-muted">
            Upload raw CDR logs, bank statements, or new suspect leads to run real-time neural network inference. 
            The graph analytics engine, PyTorch Autoencoder, and SyndicateNet will dynamically process the incoming feeds.
          </p>
        </div>

        <!-- 1. CDR Stream Ingestion Studio -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('phone', 'text-cyan', 16)}</span> 1. CDR CALL SHEET INGESTION & GRAPH BUILDER
            </div>
            <button class="btn btn-xs btn-outline-secondary" onclick="window.dataLabInstance.loadSampleCDR()">
              Load Intercept Sample CSV
            </button>
          </div>
          <div class="datalab-box-body">
            <label class="text-xs text-muted">Upload CSV or Paste Raw Telecom CDR Records (caller, receiver, duration, timestamp, city):</label>
            <textarea id="rawCDRInput" class="nlp-textarea" rows="7" placeholder="caller,receiver,duration,timestamp,city...">${SAMPLE_CDR_CSV}</textarea>
            <div class="datalab-action-row">
              <button class="btn btn-sm btn-cyan" onclick="window.dataLabInstance.ingestCDR()">
                ${window.renderSvgIcon('zap', '', 14)} Run AI Graph Ingestion
              </button>
              <span id="cdrIngestStatus" class="text-xs text-muted font-mono">Ready for ingestion</span>
            </div>
            <div id="cdrIngestResult" class="datalab-result-box hidden"></div>
          </div>
        </div>

        <!-- 2. Hawala Transaction Autoencoder Scanner -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('bank', 'text-amber', 16)}</span> 2. HAWALA LEDGER INGESTION & AUTOENCODER AUDIT
            </div>
            <button class="btn btn-xs btn-outline-secondary" onclick="window.dataLabInstance.loadSampleHawala()">
              Load Smurfing Ledger CSV
            </button>
          </div>
          <div class="datalab-box-body">
            <label class="text-xs text-muted">Upload CSV or Paste Bank Transactions (sender, receiver, amount, timestamp, bank):</label>
            <textarea id="rawHawalaInput" class="nlp-textarea" rows="7" placeholder="sender,receiver,amount,timestamp,bank...">${SAMPLE_HAWALA_CSV}</textarea>
            <div class="datalab-action-row">
              <button class="btn btn-sm btn-amber" onclick="window.dataLabInstance.ingestTransactions()">
                ${window.renderSvgIcon('shieldAlert', '', 14)} Run PyTorch Hawala Autoencoder Audit
              </button>
              <span id="hawalaIngestStatus" class="text-xs text-muted font-mono">Ready for audit</span>
            </div>
            <div id="hawalaIngestResult" class="datalab-result-box hidden"></div>
          </div>
        </div>

        <!-- 3. Dynamic Suspect Enrolment -->
        <div class="panel-section full-width">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('user', 'text-purple', 16)}</span> 3. REGISTER NEW SUBJECT & RUN NEURAL ROLE PREDICTION
            </div>
          </div>
          <div class="suspect-entry-grid">
            <div class="form-group">
              <label class="form-label text-xs">Full Name</label>
              <input type="text" id="newSuspectName" class="form-control-sm" placeholder="e.g. Vikram Malhotra" value="Vikram Malhotra">
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Primary Phone</label>
              <input type="text" id="newSuspectPhone" class="form-control-sm" placeholder="10-digit mobile" value="9820154820">
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Operating City</label>
              <select id="newSuspectCity" class="form-control-sm">
                <option value="Surat">Surat</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
                <option value="Nagpur">Nagpur</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Suspected Hawala Volume (₹)</label>
              <input type="number" id="newSuspectVolume" class="form-control-sm" value="450000">
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Initial Degree Centrality</label>
              <input type="number" id="newSuspectDegree" class="form-control-sm" value="8" min="1" max="30">
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Action</label>
              <button class="btn btn-sm btn-purple" style="width:100%; height:36px;" onclick="window.dataLabInstance.addNewSuspect()">
                ${window.renderSvgIcon('plus', '', 14)} Spawn Node in Graph
              </button>
            </div>
          </div>
          <div id="newSuspectResult" class="new-suspect-badge-result hidden"></div>
        </div>
      </div>
    `;
  }

  loadSampleCDR() {
    const el = document.getElementById('rawCDRInput');
    if (el) el.value = SAMPLE_CDR_CSV.trim();
  }

  loadSampleHawala() {
    const el = document.getElementById('rawHawalaInput');
    if (el) el.value = SAMPLE_HAWALA_CSV.trim();
  }

  async ingestCDR() {
    const el = document.getElementById('rawCDRInput');
    const status = document.getElementById('cdrIngestStatus');
    const resultBox = document.getElementById('cdrIngestResult');
    if (!el || !el.value.trim()) return;

    if (status) status.innerHTML = '<span class="text-cyan">Processing call graph through PyTorch/NetworkX...</span>';
    
    try {
      const data = await window.CrimeNetAPI.ingestCDR({ raw_csv: el.value.trim() });
      if (data && data.status === 'SUCCESS') {
        this.ingestedCDRCount += data.records_processed;
        
        // Dynamically add edges into live client graph
        if (data.edges && window.crimeDataEngine) {
          data.edges.forEach(e => {
            window.crimeDataEngine.cdrs.push({
              cdr_id: `ING-CDR-${Math.floor(Math.random()*9000+1000)}`,
              caller_phone: e.caller,
              receiver_phone: e.callee,
              duration_sec: e.duration,
              timestamp: e.timestamp,
              tower_city: e.city,
              is_night_call: e.timestamp.includes(' 23:') || e.timestamp.includes(' 01:') || e.timestamp.includes(' 02:')
            });
          });
          window.crimeDataEngine.computeCentralities();
          if (window.graphInstance) {
            window.graphInstance.buildGraph();
          }
        }

        if (status) status.innerHTML = `<span class="text-emerald font-bold">✓ Ingested ${data.records_processed} CDRs in ${data.processing_latency_ms}ms</span>`;
        if (resultBox) {
          resultBox.classList.remove('hidden');
          resultBox.innerHTML = `
            <div class="result-stat-strip">
              <span class="badge badge-cyan">${data.unique_identities_discovered} UNIQUE PHONES</span>
              <span class="badge badge-emerald">${data.edges_generated} CALL EDGES</span>
              <span class="badge badge-danger">${data.night_calls_flagged} NOCTURNAL ANOMALIES</span>
              <span class="badge badge-purple">${data.processing_latency_ms}ms INFERENCE</span>
            </div>
            <p class="text-xs text-slate" style="margin-top:0.4rem;">
              Call graph centralities recalculated. New links have been dynamically rendered on the <strong>Link Analysis Graph</strong>.
            </p>
          `;
        }
        window.showTacticalNotification(`AI Ingestion Complete: ${data.records_processed} CDRs merged into active intelligence graph.`);
      }
    } catch (err) {
      if (status) status.innerHTML = `<span class="text-danger">Ingestion error: ${err.message}</span>`;
    }
  }

  async ingestTransactions() {
    const el = document.getElementById('rawHawalaInput');
    const status = document.getElementById('hawalaIngestStatus');
    const resultBox = document.getElementById('hawalaIngestResult');
    if (!el || !el.value.trim()) return;

    if (status) status.innerHTML = '<span class="text-amber">Running PyTorch HawalaAutoencoder reconstruction...</span>';

    try {
      const data = await window.CrimeNetAPI.ingestTransactions({ raw_csv: el.value.trim() });
      if (data && data.status === 'SUCCESS') {
        this.ingestedTxnCount += data.transactions_processed;

        if (status) status.innerHTML = `<span class="text-emerald font-bold">✓ Audited ${data.transactions_processed} transfers in ${data.processing_latency_ms}ms</span>`;
        if (resultBox) {
          resultBox.classList.remove('hidden');
          resultBox.innerHTML = `
            <div class="result-stat-strip">
              <span class="badge badge-amber">${data.transactions_processed} TXNS AUDITED</span>
              <span class="badge badge-danger font-bold">${data.smurfing_anomalies_flagged} SMURFING ANOMALIES FLAGGED</span>
              <span class="badge badge-cyan">${data.processing_latency_ms}ms NEURAL LATENCY</span>
            </div>
            <div class="mini-table-scroll" style="max-height:160px; overflow-y:auto; margin-top:0.5rem;">
              <table class="tactical-table text-xs">
                <thead>
                  <tr><th>TXN ID</th><th>SENDER</th><th>RECEIVER</th><th>AMOUNT</th><th>MSE LOSS</th><th>PMLA STR STATUS</th></tr>
                </thead>
                <tbody>
                  ${data.transactions.map(t => `
                    <tr class="${t.ai_is_smurfing_anomaly ? 'row-alert' : ''}">
                      <td class="font-mono text-cyan">${t.txn_id}</td>
                      <td class="font-mono">${t.sender_account}</td>
                      <td class="font-mono">${t.receiver_account}</td>
                      <td class="font-bold">₹${Number(t.amount).toLocaleString()}</td>
                      <td class="font-mono ${t.ai_reconstruction_mse > 0.022 ? 'text-danger font-bold' : 'text-slate'}">${t.ai_reconstruction_mse}</td>
                      <td>${t.ai_is_smurfing_anomaly ? '<span class="badge badge-danger text-xs">SECTION 12 VIOLATION</span>' : '<span class="badge badge-emerald text-xs">NORMAL</span>'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
        window.showTacticalNotification(`Hawala Autoencoder flagged ${data.smurfing_anomalies_flagged} Section 12 PMLA smurfing violations!`);
      }
    } catch (err) {
      if (status) status.innerHTML = `<span class="text-danger">Audit error: ${err.message}</span>`;
    }
  }

  async addNewSuspect() {
    const name = document.getElementById('newSuspectName')?.value || 'Vikram Malhotra';
    const phone = document.getElementById('newSuspectPhone')?.value || '9820154820';
    const city = document.getElementById('newSuspectCity')?.value || 'Surat';
    const volume = parseFloat(document.getElementById('newSuspectVolume')?.value || 450000);
    const degree = parseFloat(document.getElementById('newSuspectDegree')?.value || 8);
    const resultBox = document.getElementById('newSuspectResult');

    // Run real-time PyTorch forward pass for this new subject
    try {
      const pred = await window.CrimeNetAPI.predictCustomSuspect({
        cdr_degree: degree,
        cdr_betweenness: degree * 0.02,
        call_night_ratio: 0.65,
        fin_amount_sent: volume,
        fin_smurfing_flags: volume > 100000 ? 3.0 : 0.0,
        is_absconding: 0.0
      });

      const newId = `P${String(window.crimeDataEngine.persons.length + 1).padStart(3, '0')}`;
      const newPerson = {
        person_id: newId,
        name: name,
        phone: phone,
        home_city: city,
        statusFlags: ['ACTIVE_LEAD', 'INGESTED'],
        threat_score: pred ? pred.threat_score : 75,
        ai_predicted_role: pred ? pred.predicted_role : 'Core Lieutenant',
        ai_confidence: pred ? pred.confidence : 0.94,
        role: pred ? pred.predicted_role : 'Core Lieutenant',
        degreeCentrality: degree / 25.0,
        betweennessCentrality: 0.08,
        pageRank: 0.04
      };

      // Add to data engine and active graph
      window.crimeDataEngine.persons.push(newPerson);
      window.crimeDataEngine.personMap.set(newId, newPerson);
      if (window.graphInstance) {
        window.graphInstance.buildGraph();
      }

      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-3 bg-card border rounded flex items-center justify-between">
            <div>
              <strong>${name}</strong> (${newId}) registered in tactical registry.
              <span class="badge badge-purple text-xs">${newPerson.ai_predicted_role}</span>
              <span class="badge badge-danger text-xs">THREAT: ${newPerson.threat_score}/100</span>
              <span class="text-xs text-muted font-mono">Inference: ${pred?.neural_latency_ms || 1.8}ms</span>
            </div>
            <button class="btn btn-xs btn-cyan" onclick="window.showDossierModal('${newId}')">View Dossier</button>
          </div>
        `;
      }
      window.logNeuralTelemetry('SyndicateNet (PyTorch)', `Spawned new subject ${name} (${newId}) -> Role: ${newPerson.ai_predicted_role} (Threat: ${newPerson.threat_score})`, pred?.neural_latency_ms || 2.1);
      window.showTacticalNotification(`Subject ${name} (${newId}) created & plotted onto Link Analysis Graph!`);
    } catch (err) {
      console.error(err);
    }
  }

  // =======================================================
  // 2. Interactive Neural Link Predictor (In Graph Tab)
  // =======================================================
  initNeuralLinkPredictor() {
    const selA = document.getElementById('linkPredSubjectA');
    const selB = document.getElementById('linkPredSubjectB');
    if (!selA || !selB || !window.crimeDataEngine) return;

    const persons = window.crimeDataEngine.persons;
    const options = persons.map(p => `<option value="${p.person_id}">${p.name} (${p.person_id})</option>`).join('');
    selA.innerHTML = options;
    selB.innerHTML = options;
    selA.value = 'P004';
    selB.value = 'P007';

    window.runNeuralLinkPrediction = async () => {
      const u = selA.value;
      const v = selB.value;
      const badge = document.getElementById('linkPredResultBadge');
      if (badge) {
        badge.classList.remove('hidden');
        badge.innerHTML = `<span class="text-cyan font-mono text-xs">Calculating Adamic-Adar graph topology...</span>`;
      }

      try {
        const res = await window.CrimeNetAPI.predictLink(u, v);
        if (res) {
          const probPct = Math.round((res.criminal_link_probability || 0.05) * 100);
          const isHigh = probPct > 40;
          if (badge) {
            badge.innerHTML = `
              <div class="link-pred-hud-box">
                <span class="font-bold text-xs">${res.person_a?.name || u} ⟷ ${res.person_b?.name || v}</span>
                <span class="badge ${isHigh ? 'badge-danger font-bold' : 'badge-emerald'} text-xs">${probPct}% LINK PROBABILITY</span>
                <span class="badge badge-purple text-xs font-mono">Adamic-Adar: ${res.adamic_adar_score || 0}</span>
                <span class="badge badge-cyan text-xs font-mono">${res.common_associates_count || 0} Shared Associates</span>
                <span class="text-xs text-muted font-mono">${res.neural_latency_ms || 0.5}ms</span>
              </div>
            `;
          }
          window.logNeuralTelemetry('GraphLinkPredictor', `Evaluated link ${u} <-> ${v}: Adamic-Adar = ${res.adamic_adar_score || 0} -> Prob: ${probPct}% (${res.status})`, res.neural_latency_ms || 1.1);

          // Focus graph on suspect A
          if (window.graphInstance && window.graphInstance.nodeMap.has(u)) {
            const nodeA = window.graphInstance.nodeMap.get(u);
            window.graphInstance.selectedNode = nodeA;
            window.graphInstance.camera.x = window.graphInstance.width / 2 - nodeA.x;
            window.graphInstance.camera.y = window.graphInstance.height / 2 - nodeA.y;
            window.graphInstance.camera.zoom = 1.4;
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  }

  // =======================================================
  // 3. Interactive Hawala Autoencoder Scanner (In Hawala Tab)
  // =======================================================
  initHawalaInteractiveScanner() {
    window.runInteractiveHawalaScan = async () => {
      const amt = parseFloat(document.getElementById('hawalaScanAmt')?.value || 48500);
      const hr = parseInt(document.getElementById('hawalaScanHour')?.value || 2);
      const vel = parseFloat(document.getElementById('hawalaScanVelocity')?.value || 5);
      const resultEl = document.getElementById('hawalaScanResult');

      if (resultEl) {
        resultEl.innerHTML = `<span class="text-cyan font-mono text-xs">Passing 6D tensor through HawalaAutoencoder...</span>`;
      }

      try {
        const res = await window.CrimeNetAPI.scanHawalaTransaction({
          amount: amt,
          hour: hr,
          velocity_txns_per_hr: vel
        });

        if (res && resultEl) {
          resultEl.innerHTML = `
            <div class="p-3 bg-card border rounded" style="margin-top:0.5rem; border-color: ${res.is_smurfing_anomaly ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}">
              <div class="flex justify-between items-center">
                <strong>₹${Number(res.amount).toLocaleString()} (${hr}:00 IST, ${vel} txns/hr)</strong>
                <span class="badge ${res.is_smurfing_anomaly ? 'badge-danger font-bold' : 'badge-emerald'}">${res.is_smurfing_anomaly ? 'SMURFING ANOMALY DETECTED' : 'NORMAL TRANSACTION'}</span>
              </div>
              <div class="result-stat-strip" style="margin-top:0.35rem;">
                <span class="badge badge-purple font-mono text-xs">MSE Loss: ${res.reconstruction_loss_mse}</span>
                <span class="badge badge-cyan font-mono text-xs">Baseline Threshold: ${res.threshold}</span>
                <span class="badge badge-danger font-mono text-xs">Anomaly Score: ${res.anomaly_score}/100</span>
                <span class="badge badge-slate font-mono text-xs">${res.neural_latency_ms}ms</span>
              </div>
              <ul class="text-xs text-muted" style="margin: 0.35rem 0 0 1rem;">
                ${res.flag_reasons.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `;
        }
      } catch (err) {
        console.error(err);
      }
    };
  }

  // =======================================================
  // 4. Interactive PyTorch SyndicateNet Role Simulator
  // =======================================================
  initSyndicateNetSimulator() {
    window.runSyndicateNetSimulation = async () => {
      const degree = parseFloat(document.getElementById('simDegree')?.value || 8);
      const nightRatio = parseFloat(document.getElementById('simNightRatio')?.value || 0.4);
      const volume = parseFloat(document.getElementById('simVolume')?.value || 250000);
      const ndps = parseFloat(document.getElementById('simNdps')?.value || 1);
      const absconding = document.getElementById('simAbsconding')?.checked ? 1.0 : 0.0;
      const resultEl = document.getElementById('simResultBox');

      try {
        const res = await window.CrimeNetAPI.predictCustomSuspect({
          cdr_degree: degree,
          call_night_ratio: nightRatio,
          fin_amount_sent: volume,
          fin_smurfing_flags: volume > 100000 ? 3.0 : 0.0,
          fir_ndps_count: ndps,
          is_absconding: absconding
        });

        if (res && resultEl) {
          resultEl.innerHTML = `
            <div class="sim-output-card">
              <div class="flex justify-between items-center">
                <span class="text-sm font-bold text-cyan">PREDICTED ROLE: ${res.predicted_role}</span>
                <span class="badge badge-danger font-bold text-xs">THREAT SCORE: ${res.threat_score}/100</span>
              </div>
              <div class="text-xs text-muted font-mono" style="margin-top:0.25rem;">
                Confidence: ${(res.confidence * 100).toFixed(1)}% | Forward Pass Latency: ${res.neural_latency_ms}ms (PyTorch CPU)
              </div>
              <!-- Role probabilities bars -->
              <div class="role-bars-container" style="margin-top:0.5rem;">
                ${Object.entries(res.role_probabilities || {}).map(([role, prob]) => `
                  <div class="role-bar-row">
                    <span class="role-name text-xs">${role}</span>
                    <div class="role-bar-track">
                      <div class="role-bar-fill" style="width: ${Math.round(prob * 100)}%;"></div>
                    </div>
                    <span class="role-pct text-xs font-mono">${Math.round(prob * 100)}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          window.logNeuralTelemetry('SyndicateNet (PyTorch)', `Simulated profile -> Predicted: ${res.predicted_role} (${Math.round(res.confidence*100)}% conf) | Threat: ${res.threat_score}`, res.neural_latency_ms);
        }
      } catch (err) {
        console.error(err);
      }
    };
  }

  // =======================================================
  // 5. Real-Time AI Neural Telemetry Console (Docked HUD)
  // =======================================================
  initTelemetryConsole() {
    // Check if HUD container exists, otherwise create it
    if (document.getElementById('aiTelemetryDock')) return;

    const dock = document.createElement('div');
    dock.id = 'aiTelemetryDock';
    dock.className = 'telemetry-dock collapsed';
    dock.innerHTML = `
      <div class="telemetry-dock-header" onclick="window.toggleTelemetryConsole()">
        <div class="flex items-center gap-2">
          <span class="telemetry-beacon">●</span>
          <span class="font-mono text-xs font-bold text-cyan">AI NEURAL ENGINE LIVE TELEMETRY</span>
          <span id="aiTelemetryCount" class="badge badge-cyan text-xs">0 EVENTS</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted font-mono">Click to toggle stream</span>
          <span id="telemetryToggleArrow" class="text-xs text-slate">▲</span>
        </div>
      </div>
      <div id="aiTelemetryConsole" class="telemetry-console-body">
        <div class="telemetry-log-row text-muted text-xs font-mono">
          [READY] DRISHTI-CRIMENEXUS Neural Telemetry Stream Active (PyTorch CPU). Listening for tensor operations...
        </div>
      </div>
    `;
    document.body.appendChild(dock);

    window.toggleTelemetryConsole = () => {
      dock.classList.toggle('collapsed');
      const arrow = document.getElementById('telemetryToggleArrow');
      if (arrow) arrow.textContent = dock.classList.contains('collapsed') ? '▲' : '▼';
    };

    // Log initial engine startup event
    window.logNeuralTelemetry('SystemInit', 'PyTorch SyndicateNet & HawalaAutoencoder loaded into active memory', 0.2);
  }
}

window.DataLabEngine = DataLabEngine;
window.dataLabInstance = new DataLabEngine();
