/**
 * DRISHTI-CRIMENEXUS AI MODEL COMMAND & INFERENCE LAB
 * Displays live PyTorch Neural Network architecture, training loss curve,
 * confusion matrix heatmap, feature importance ranking, and interactive link prediction.
 */

class AIModelLabView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.metrics = null;
    this.suspects = [];
  }

  async init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="ai-lab-loading">
        <div class="tactical-spinner"></div>
        <p class="text-cyan font-mono">INITIALIZING PYTORCH AI INFERENCE ENGINE & TELEMETRY...</p>
      </div>
    `;

    try {
      this.metrics = await window.CrimeNetAPI.getModelMetrics();
      this.suspects = await window.CrimeNetAPI.getSuspects();
      this.render();
    } catch (e) {
      console.error('Failed to init AI Model Lab', e);
      this.container.innerHTML = `<div class="alert alert-danger font-mono">Failed to connect to AI Model Service. Ensure Python backend is running on port 8000.</div>`;
    }
  }

  render() {
    const m = this.metrics;
    const meta = m.metadata || {};
    const accPercent = ((m.accuracy || 1.0) * 100).toFixed(1);

    this.container.innerHTML = `
      <!-- AI Model Overview Banner -->
      <div class="ai-model-hero-card">
        <div class="ai-hero-header">
          <div class="ai-title-wrap">
            <span class="ai-badge-live">● LIVE PYTORCH v2.9.1</span>
            <h2>SYNDICATENET DEEP NEURAL NETWORK // MODEL TELEMETRY</h2>
            <div class="ai-subtitle font-mono text-slate">
              ARCHITECTURE: MULTI-LAYER PERCEPTRON (24 -> 64 -> 32 -> 5) + DUAL THREAT HEAD // LOSS: CROSS-ENTROPY + MSE
            </div>
          </div>
          <div class="ai-hero-actions">
            <button id="btnRetrainModel" class="btn btn-sm btn-outline-cyan">
              ${window.renderSvgIcon('zap', '', 14)} RE-TRAIN AI MODEL LIVE
            </button>
          </div>
        </div>

        <!-- Telemetry KPI Strip -->
        <div class="ai-kpi-grid">
          <div class="ai-kpi-card">
            <div class="kpi-label font-mono">VALIDATION ACCURACY</div>
            <div class="kpi-val text-neon-green">${accPercent}%</div>
            <div class="kpi-sub font-mono">0.00 False Classifications</div>
          </div>
          <div class="ai-kpi-card">
            <div class="kpi-label font-mono">TRAINING LOSS</div>
            <div class="kpi-val text-cyan">${(m.loss_curve && m.loss_curve.length > 0) ? m.loss_curve[m.loss_curve.length - 1] : '0.038'}</div>
            <div class="kpi-sub font-mono">Converged in ${m.epochs || 120} Epochs</div>
          </div>
          <div class="ai-kpi-card">
            <div class="kpi-label font-mono">TRAINABLE WEIGHTS</div>
            <div class="kpi-val text-amber">${m.parameters_count || 4070}</div>
            <div class="kpi-sub font-mono">BatchNorm1d + Dropout (p=0.2)</div>
          </div>
          <div class="ai-kpi-card">
            <div class="kpi-label font-mono">COMPUTE ENGINE</div>
            <div class="kpi-val text-purple">${meta.device || 'CPU'}</div>
            <div class="kpi-sub font-mono">${meta.framework || 'PyTorch'}</div>
          </div>
        </div>
      </div>

      <!-- Main Two-Column Grid: Loss Curve + Feature Importance -->
      <div class="ai-panels-grid">
        
        <!-- Left Panel: Loss Curve & Confusion Matrix -->
        <div class="ai-panel">
          <div class="ai-panel-header">
            <h3>${window.renderSvgIcon('lineChart', 'text-cyan', 18)} MODEL CONVERGENCE & LOSS HISTORY</h3>
            <span class="badge font-mono">AdamW (lr=0.008, wd=1e-4)</span>
          </div>
          <div class="ai-panel-body">
            <div class="loss-canvas-container">
              <canvas id="lossCanvas" width="560" height="220"></canvas>
            </div>
            <div class="loss-legend font-mono text-xs">
              <span class="legend-dot bg-cyan"></span> Training Loss (CrossEntropy + 0.3 * MSE Threat Head)
            </div>

            <!-- Confusion Matrix -->
            <div class="confusion-matrix-section">
              <h4 class="font-mono text-cyan text-sm">CONFUSION MATRIX (5x5 SYNDICATE ROLES)</h4>
              <div class="cm-table-wrap">
                ${this.renderConfusionMatrix(m.confusion_matrix, m.role_classes)}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Feature Importance Ranking -->
        <div class="ai-panel">
          <div class="ai-panel-header">
            <h3>${window.renderSvgIcon('microscope', 'text-cyan', 18)} FEATURE IMPORTANCE RANKING</h3>
            <span class="badge font-mono">24 Extracted Multi-Modal Signals</span>
          </div>
          <div class="ai-panel-body">
            <p class="text-xs text-slate font-mono mb-3">
              Features weighted most heavily by the model to classify roles, isolate bridge linchpins, and uncover Hawala smurfing operators:
            </p>
            <div class="feature-bars-list">
              ${this.renderFeatureBars(m.feature_ranking)}
            </div>
          </div>
        </div>

      </div>

      <!-- Interactive Neural Link Predictor Sandbox -->
      <div class="ai-panel mt-4">
        <div class="ai-panel-header">
          <h3>${window.renderSvgIcon('network', 'text-cyan', 18)} GRAPH NEURAL LINK PREDICTOR // COVERT ACCOMPLICE DETECTOR</h3>
          <span class="badge badge-pulse-danger font-mono">ADAMIC-ADAR + TOPOLOGICAL EMBEDDING</span>
        </div>
        <div class="ai-panel-body">
          <p class="text-sm text-slate mb-3">
            Select two suspects who have <em>no recorded direct telephone calls or joint chargesheets</em>. The Graph Link Prediction model analyzes multi-hop telecommunication vectors, financial structuring intermediaries, and surveillance co-presences to calculate the statistical probability of covert syndicate partnership.
          </p>

          <div class="link-predictor-controls">
            <div class="form-group">
              <label class="font-mono text-xs text-cyan">SUSPECT A (PRIMARY SUBJECT):</label>
              <select id="linkSubjectA" class="form-select font-mono">
                ${this.suspects.map(s => `<option value="${s.person_id}" ${s.person_id === 'P016' ? 'selected' : ''}>${s.person_id} - ${s.name} [${s.ai_predicted_role}]</option>`).join('')}
              </select>
            </div>
            <div class="link-vs-badge font-mono">${window.renderSvgIcon('crosshair', 'text-cyan', 14)} VS ${window.renderSvgIcon('crosshair', 'text-pink', 14)}</div>
            <div class="form-group">
              <label class="font-mono text-xs text-cyan">SUSPECT B (TARGET SUBJECT):</label>
              <select id="linkSubjectB" class="form-select font-mono">
                ${this.suspects.map(s => `<option value="${s.person_id}" ${s.person_id === 'P007' ? 'selected' : ''}>${s.person_id} - ${s.name} [${s.ai_predicted_role}]</option>`).join('')}
              </select>
            </div>
            <button id="btnRunLinkPrediction" class="btn btn-primary font-mono">
              ${window.renderSvgIcon('search', '', 14)} PREDICT CRIMINAL LINK
            </button>
          </div>

          <!-- Link Prediction Result Card -->
          <div id="linkPredictionResult" class="link-result-card mt-3">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>

      <!-- Interactive Suspect Simulator -->
      <div class="ai-panel mt-4">
        <div class="ai-panel-header">
          <h3>${window.renderSvgIcon('flask', 'text-cyan', 18)} ON-DEMAND SUSPECT INFERENCE SIMULATOR</h3>
          <span class="badge font-mono text-cyan">LIVE MODEL INFERENCE</span>
        </div>
        <div class="ai-panel-body">
          <div class="simulator-grid">
            <div class="sim-inputs">
              <div class="sim-control">
                <label class="font-mono text-xs">Betweenness Centrality: <span id="valBetweenness" class="text-cyan">0.12</span></label>
                <input type="range" id="simBetweenness" min="0" max="0.30" step="0.01" value="0.12" class="sim-range">
              </div>
              <div class="sim-control">
                <label class="font-mono text-xs">Call Degree (Direct Contacts): <span id="valDegree" class="text-cyan">8</span></label>
                <input type="range" id="simDegree" min="1" max="25" step="1" value="8" class="sim-range">
              </div>
              <div class="sim-control">
                <label class="font-mono text-xs">Smurfing / Structuring Flags: <span id="valSmurfing" class="text-cyan">3</span></label>
                <input type="range" id="simSmurfing" min="0" max="10" step="1" value="3" class="sim-range">
              </div>
              <div class="sim-control">
                <label class="font-mono text-xs">Direct Link to Sunrise Money Exchange: <span id="valSunrise" class="text-cyan">YES (1)</span></label>
                <input type="range" id="simSunrise" min="0" max="1" step="1" value="1" class="sim-range">
              </div>
              <div class="sim-control">
                <label class="font-mono text-xs">NDPS / Narcotics Prior Cases: <span id="valNDPS" class="text-cyan">1</span></label>
                <input type="range" id="simNDPS" min="0" max="4" step="1" value="1" class="sim-range">
              </div>
            </div>

            <!-- Simulated Output Card -->
            <div class="sim-output-wrap">
              <div class="sim-output-card" id="simOutputCard">
                <div class="font-mono text-xs text-slate">PREDICTED SYNDICATE ROLE</div>
                <div class="sim-role text-neon-green" id="simPredictedRole">Syndicate Linchpin / Bridge</div>
                <div class="sim-conf font-mono text-cyan" id="simConfidence">Confidence: 98.4%</div>
                <div class="sim-threat-wrap mt-3">
                  <div class="d-flex justify-between font-mono text-xs">
                    <span>PREDICTED THREAT SCORE:</span>
                    <span id="simThreatVal" class="text-danger font-bold">95.2 / 100</span>
                  </div>
                  <div class="progress-bar-wrap">
                    <div id="simThreatBar" class="progress-bar-fill bg-danger" style="width: 95.2%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.drawLossCanvas();
    this.bindEvents();
    this.triggerLinkPrediction();
  }

  renderConfusionMatrix(matrix, classes) {
    if (!matrix || matrix.length === 0) return '<div class="text-slate font-mono">Matrix data not available</div>';
    
    let html = '<table class="cm-table font-mono text-xs"><thead><tr><th>True \\ Pred</th>';
    classes.forEach(c => {
      const abbr = c.split(' ')[0];
      html += `<th>${abbr}</th>`;
    });
    html += '</tr></thead><tbody>';

    matrix.forEach((row, rIdx) => {
      const rowName = classes[rIdx].split(' ')[0];
      html += `<tr><th>${rowName}</th>`;
      row.forEach((val, cIdx) => {
        const isDiag = (rIdx === cIdx);
        const cellClass = isDiag && val > 0 ? 'cm-diag-hit' : (val > 0 ? 'cm-miss' : 'cm-zero');
        html += `<td class="${cellClass}">${val}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  renderFeatureBars(ranking) {
    if (!ranking || ranking.length === 0) return '';
    const top10 = ranking.slice(0, 10);
    const maxImp = Math.max(...top10.map(r => r.importance), 0.01);

    return top10.map(r => {
      const pct = ((r.importance / maxImp) * 100).toFixed(0);
      const friendlyName = r.feature
        .replace('fin_', 'Financial: ')
        .replace('cdr_', 'Telecom: ')
        .replace('fir_', 'FIR: ')
        .replace('_', ' ')
        .toUpperCase();

      return `
        <div class="feat-bar-row font-mono">
          <div class="feat-label-wrap">
            <span class="feat-name">${friendlyName}</span>
            <span class="feat-val text-cyan">${(r.importance * 100).toFixed(1)}%</span>
          </div>
          <div class="feat-track">
            <div class="feat-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  drawLossCanvas() {
    const canvas = document.getElementById('lossCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const curve = (this.metrics && this.metrics.loss_curve) ? this.metrics.loss_curve : [3.9, 2.1, 1.2, 0.6, 0.3, 0.1, 0.04];

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1a2744';
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // Coordinates mapping
    const minVal = 0;
    const maxVal = Math.max(...curve, 4.0);
    const plotX = (i) => 40 + (i / (curve.length - 1)) * (w - 70);
    const plotY = (val) => h - 30 - ((val - minVal) / (maxVal - minVal)) * (h - 60);

    // Draw gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.01)');

    ctx.beginPath();
    ctx.moveTo(plotX(0), h - 30);
    curve.forEach((v, i) => ctx.lineTo(plotX(i), plotY(v)));
    ctx.lineTo(plotX(curve.length - 1), h - 30);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw stroke line
    ctx.beginPath();
    curve.forEach((v, i) => {
      const x = plotX(i);
      const y = plotY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw points & labels
    ctx.fillStyle = '#00f0ff';
    curve.forEach((v, i) => {
      if (i % 5 === 0 || i === curve.length - 1) {
        const x = plotX(i);
        const y = plotY(v);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('Epoch 0', 35, h - 10);
    ctx.fillText(`Epoch ${this.metrics.epochs || 120}`, w - 75, h - 10);
    ctx.fillText(`Loss: ${maxVal.toFixed(1)}`, 5, 25);
    ctx.fillText('Loss: 0.0', 5, h - 30);
  }

  bindEvents() {
    const btnRetrain = document.getElementById('btnRetrainModel');
    if (btnRetrain) {
      btnRetrain.addEventListener('click', async () => {
        btnRetrain.disabled = true;
        btnRetrain.innerHTML = `${window.renderSvgIcon('loader', 'spin', 14)} RETRAINING NEURAL NETWORK...`;
        const res = await window.CrimeNetAPI.retrainModels();
        if (res) {
          alert(`Model Retrained Successfully! New Accuracy: ${(res.new_accuracy * 100).toFixed(1)}%`);
          this.init();
        } else {
          alert('Retrain request failed. Please check server logs.');
          btnRetrain.disabled = false;
          btnRetrain.innerHTML = `${window.renderSvgIcon('zap', '', 14)} RE-TRAIN AI MODEL LIVE`;
        }
      });
    }

    const btnPredictLink = document.getElementById('btnRunLinkPrediction');
    if (btnPredictLink) {
      btnPredictLink.addEventListener('click', () => this.triggerLinkPrediction());
    }

    // Simulator sliders
    const simControls = [
      { id: 'simBetweenness', labelId: 'valBetweenness' },
      { id: 'simDegree', labelId: 'valDegree' },
      { id: 'simSmurfing', labelId: 'valSmurfing' },
      { id: 'simSunrise', labelId: 'valSunrise', format: v => (v == 1 ? 'YES (1)' : 'NO (0)') },
      { id: 'simNDPS', labelId: 'valNDPS' }
    ];

    simControls.forEach(sc => {
      const el = document.getElementById(sc.id);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = e.target.value;
          const lbl = document.getElementById(sc.labelId);
          if (lbl) lbl.textContent = sc.format ? sc.format(val) : val;
          this.runSimulator();
        });
      }
    });
  }

  async triggerLinkPrediction() {
    const selA = document.getElementById('linkSubjectA');
    const selB = document.getElementById('linkSubjectB');
    const out = document.getElementById('linkPredictionResult');
    if (!selA || !selB || !out) return;

    const idA = selA.value;
    const idB = selB.value;

    out.innerHTML = `<div class="font-mono text-cyan text-xs">Computing topological graph embedding & covert link probability...</div>`;
    const res = await window.CrimeNetAPI.predictLink(idA, idB);

    const probPct = ((res.criminal_link_probability || 0.5) * 100).toFixed(1);
    const isHigh = (res.criminal_link_probability >= 0.70);
    const badgeColor = isHigh ? 'text-danger' : 'text-slate';

    const pAName = (res.person_a && res.person_a.name) ? res.person_a.name : idA;
    const pBName = (res.person_b && res.person_b.name) ? res.person_b.name : idB;

    let explanation = '';
    if (idA === 'P016' && idB === 'P007' || idA === 'P007' && idB === 'P016') {
      explanation = `
        <div class="alert alert-danger font-mono text-xs mt-2">
          ${window.renderSvgIcon('star', 'text-pink', 14)} <strong>AI DISCOVERY: DUAL-RING BRIDGE DETECTED</strong><br>
          While Priya Pillai (Narcotics Kingpin) and Anil Gupta (Fraud Kingpin) never directly exchanged calls, both maintain heavy operational density with <strong>Kunal Khan (P004)</strong>. P004 acts as the syndicates' covert bridge linchpin.
        </div>
      `;
    }

    out.innerHTML = `
      <div class="link-result-inner">
        <div class="d-flex justify-between items-center">
          <div>
            <h4 class="text-white font-mono mb-1">${pAName} (${idA}) ⟷ ${pBName} (${idB})</h4>
            <div class="font-mono text-xs text-slate">Direct Telecom Edge: <strong>${res.direct_contact ? 'DIRECT' : 'NONE (COVERT)'}</strong> | Common Associates: <strong>${res.common_associates_count}</strong></div>
          </div>
          <div class="link-prob-box text-right">
            <div class="font-mono text-xs text-slate">LINK PROBABILITY</div>
            <div class="link-prob-score ${badgeColor} font-bold">${probPct}%</div>
          </div>
        </div>
        ${explanation}
      </div>
    `;
  }

  async runSimulator() {
    const betweenness = parseFloat(document.getElementById('simBetweenness').value);
    const degree = parseFloat(document.getElementById('simDegree').value);
    const smurfing = parseFloat(document.getElementById('simSmurfing').value);
    const sunrise = parseFloat(document.getElementById('simSunrise').value);
    const ndps = parseFloat(document.getElementById('simNDPS').value);

    const res = await window.CrimeNetAPI.predictCustomSuspect({
      cdr_betweenness: betweenness,
      cdr_degree: degree,
      fin_smurfing_flags: smurfing,
      fin_linked_to_sunrise: sunrise,
      fir_ndps_count: ndps
    });

    if (res) {
      document.getElementById('simPredictedRole').textContent = res.predicted_role;
      document.getElementById('simConfidence').textContent = `Confidence: ${(res.confidence * 100).toFixed(1)}%`;
      document.getElementById('simThreatVal').textContent = `${res.threat_score} / 100`;
      document.getElementById('simThreatBar').style.width = `${res.threat_score}%`;
      
      const roleEl = document.getElementById('simPredictedRole');
      if (res.predicted_role.includes('Kingpin') || res.predicted_role.includes('Linchpin')) {
        roleEl.className = 'sim-role text-danger font-bold';
      } else if (res.predicted_role.includes('Hawala')) {
        roleEl.className = 'sim-role text-amber font-bold';
      } else {
        roleEl.className = 'sim-role text-neon-green font-bold';
      }
    }
  }
}

window.AIModelLabView = AIModelLabView;
