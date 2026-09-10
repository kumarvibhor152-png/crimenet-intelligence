/**
 * DRISHTI-CRIMENEXUS CDR TELECOMMUNICATION FORENSICS
 * High-velocity call detail records parser, hour-of-day histogram, late-night burner
 * burst detection, and caller-callee communication matrices.
 */

class CDREngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = 'ALL';
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;
    const engine = window.crimeDataEngine;
    if (!engine) return;

    const cdrs = engine.cdrs;
    const lateNightCdrs = cdrs.filter(c => c.note && c.note.includes('late-night'));
    const totalDurationMinutes = Math.round(cdrs.reduce((s, c) => s + c.duration_sec, 0) / 60);

    // Compute hourly distribution
    const hourlyCounts = new Array(24).fill(0);
    cdrs.forEach(c => {
      const parts = c.timestamp.split(' ');
      if (parts[1]) {
        const hour = parseInt(parts[1].split(':')[0], 10);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourlyCounts[hour]++;
        }
      }
    });

    const maxHourVal = Math.max(...hourlyCounts, 1);

    // Compute top communicating pairs
    const pairMap = new Map();
    cdrs.forEach(c => {
      const pair = [c.caller_id, c.callee_id].sort().join(' ⇄ ');
      if (!pairMap.has(pair)) {
        pairMap.set(pair, { pair, count: 0, totalSec: 0, cities: new Set(), hasLateNight: false });
      }
      const p = pairMap.get(pair);
      p.count++;
      p.totalSec += c.duration_sec;
      p.cities.add(c.cell_tower_city);
      if (c.note && c.note.includes('late-night')) p.hasLateNight = true;
    });

    const topPairs = Array.from(pairMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    this.container.innerHTML = `
      <div class="cdr-dashboard">
        <!-- Top Metrics -->
        <div class="hawala-grid">
          <div class="intel-stat-card border-cyan">
            <div class="stat-label">TOTAL CDR INTERCEPTS</div>
            <div class="stat-value text-cyan">${cdrs.length} CALLS</div>
            <div class="stat-meta">Span: Jan 2024 - Jun 2025</div>
          </div>
          <div class="intel-stat-card border-danger">
            <div class="stat-label">LATE-NIGHT BURNER BURST</div>
            <div class="stat-value text-danger">${lateNightCdrs.length} CALLS</div>
            <div class="stat-meta">Midnight - 05:00 hrs Operations</div>
          </div>
          <div class="intel-stat-card border-amber">
            <div class="stat-label">TOTAL INTERCEPTED TALKTIME</div>
            <div class="stat-value text-amber">${totalDurationMinutes.toLocaleString()} MINS</div>
            <div class="stat-meta">Avg Duration: ${Math.round(totalDurationMinutes * 60 / cdrs.length)}s</div>
          </div>
          <div class="intel-stat-card border-purple">
            <div class="stat-label">CELL TOWER HUBS MONITORED</div>
            <div class="stat-value text-purple">8 CITIES</div>
            <div class="stat-meta">Pune, Surat, Mumbai, Lucknow, etc.</div>
          </div>
        </div>

        <!-- 24-Hour Call Frequency Heat Distribution -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('barChart2', 'text-cyan', 18)}</span> 24-HOUR TELECOM TEMPORAL DENSITY HISTOGRAM
            </div>
            <div class="panel-hint text-xs text-muted">
              Red markers indicate anomalous late-night operational window
            </div>
          </div>

          <div class="histogram-wrapper">
            <div class="histogram-bars">
              ${hourlyCounts.map((count, hr) => {
                const heightPct = Math.round((count / maxHourVal) * 100);
                const isLateNight = hr >= 21 || hr <= 5;
                return `
                  <div class="histogram-col" title="${hr}:00 - ${count} calls">
                    <div class="hist-bar ${isLateNight ? 'bar-danger' : 'bar-cyan'}" style="height: ${heightPct}%">
                      <span class="bar-val">${count}</span>
                    </div>
                    <span class="hist-label font-mono">${hr.toString().padStart(2, '0')}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Top Communicating Syndicate Pairs -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('users', 'text-cyan', 18)}</span> HIGH-FREQUENCY CALL CLUSTERS (FREQUENT CALLER PAIRS)
            </div>
          </div>

          <div class="pair-grid">
            ${topPairs.map(p => {
              const [id1, id2] = p.pair.split(' ⇄ ');
              const p1 = engine.personMap.get(id1);
              const p2 = engine.personMap.get(id2);
              return `
                <div class="pair-card ${p.hasLateNight ? 'card-warning' : ''}">
                  <div class="pair-top">
                    <div class="pair-names">
                      <strong>${p1 ? p1.name : id1}</strong> (${id1})
                      <span class="text-cyan">⇄</span>
                      <strong>${p2 ? p2.name : id2}</strong> (${id2})
                    </div>
                    <span class="badge ${p.hasLateNight ? 'badge-danger' : 'badge-cyan'}">${p.count} CALLS</span>
                  </div>
                  <div class="pair-meta">
                    <div>Cumulative Airtime: <strong class="text-slate">${Math.round(p.totalSec / 60)} mins</strong></div>
                    <div>Active Towers: <strong class="text-muted">${Array.from(p.cities).join(', ')}</strong></div>
                    ${p.hasLateNight ? `<div class="text-danger text-xs font-bold">${window.renderSvgIcon('alertTriangle', '', 12)} Regular Midnight Coordination Window</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Filterable Raw CDR Ledger -->
        <div class="panel-section">
          <div class="panel-header">
            <div class="panel-title">
              <span class="icon">${window.renderSvgIcon('fileText', 'text-cyan', 18)}</span> TELECOMMUNICATION INTERCEPT LOGS
            </div>
            <div class="ledger-filters">
              <button class="btn-filter ${this.currentFilter === 'ALL' ? 'active' : ''}" onclick="window.cdrEngineInstance.setFilter('ALL')">All Calls</button>
              <button class="btn-filter ${this.currentFilter === 'LATE_NIGHT' ? 'active' : ''}" onclick="window.cdrEngineInstance.setFilter('LATE_NIGHT')">Late-Night Only</button>
              <button class="btn-filter ${this.currentFilter === 'LONG' ? 'active' : ''}" onclick="window.cdrEngineInstance.setFilter('LONG')">> 10 Mins Duration</button>
              <input type="text" placeholder="Search by Call ID, Phone, City..." class="ledger-search" oninput="window.cdrEngineInstance.onSearch(this.value)">
            </div>
          </div>

          <div class="table-responsive">
            <table class="tactical-table">
              <thead>
                <tr>
                  <th>CALL ID</th>
                  <th>TIMESTAMP</th>
                  <th>CALLER (ID)</th>
                  <th>CALLEE (ID)</th>
                  <th>DURATION</th>
                  <th>CELL TOWER</th>
                  <th>INTELLIGENCE NOTES</th>
                </tr>
              </thead>
              <tbody>
                ${this.getFilteredCdrs().map(c => {
                  const caller = engine.personMap.get(c.caller_id);
                  const callee = engine.personMap.get(c.callee_id);
                  const isLateNight = c.note && c.note.includes('late-night');

                  return `
                    <tr class="${isLateNight ? 'row-alert' : ''}">
                      <td class="font-mono text-cyan">${c.call_id}</td>
                      <td class="font-mono text-xs text-muted">${c.timestamp}</td>
                      <td>
                        <strong>${caller ? caller.name : 'Unknown'}</strong> (${c.caller_id})
                        <div class="font-mono text-xs text-muted">${c.caller_phone}</div>
                      </td>
                      <td>
                        <strong>${callee ? callee.name : 'Unknown'}</strong> (${c.callee_id})
                        <div class="font-mono text-xs text-muted">${c.callee_phone}</div>
                      </td>
                      <td class="font-mono">${Math.floor(c.duration_sec / 60)}m ${c.duration_sec % 60}s</td>
                      <td><span class="city-tag">${c.cell_tower_city}</span></td>
                      <td>
                        ${isLateNight 
                          ? `<span class="badge badge-danger">${window.renderSvgIcon('moon', '', 12)} LATE-NIGHT CALL</span>` 
                          : '<span class="badge badge-muted">STANDARD INTERCEPT</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredCdrs() {
    const engine = window.crimeDataEngine;
    let list = engine.cdrs;

    if (this.currentFilter === 'LATE_NIGHT') {
      list = list.filter(c => c.note && c.note.includes('late-night'));
    } else if (this.currentFilter === 'LONG') {
      list = list.filter(c => c.duration_sec >= 600);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => 
        c.call_id.toLowerCase().includes(q) ||
        c.caller_phone.includes(q) ||
        c.callee_phone.includes(q) ||
        c.caller_id.toLowerCase().includes(q) ||
        c.callee_id.toLowerCase().includes(q) ||
        c.cell_tower_city.toLowerCase().includes(q)
      );
    }

    return list;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  }

  onSearch(val) {
    this.searchQuery = val;
    this.render();
  }
}

window.CDREngine = CDREngine;
