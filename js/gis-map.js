/**
 * DRISHTI-CRIMENEXUS GEOSPATIAL INTELLIGENCE (GIS)
 * Tactical spatial tracking engine mapping suspects, cell towers, movement corridors,
 * and physical surveillance intercepts (SR3001 to SR3020).
 */

class TacticalGISMap {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.suspectMarkers = new Map();
    this.towerMarkers = new Map();
    this.surveillanceMarkers = [];
    this.commArcs = [];
    this.activeFilterSuspectId = null;

    this.initMap();
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === 'undefined') return;

    this.map = L.map(this.containerId, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(this.map);

    this.renderCellTowers();
    this.renderSuspects();
    this.renderSurveillanceSightings();
    this.renderCommunicationArcs();
  }

  renderCellTowers() {
    const towers = CITY_COORDINATES;
    const towerIcon = L.divIcon({
      className: 'tactical-tower-marker',
      html: `<div class="tower-beacon"><div class="beacon-pulse"></div><span class="tower-icon">${window.renderSvgIcon('radio', '', 14)}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    for (const [city, data] of Object.entries(towers)) {
      const callCount = window.crimeDataEngine.cdrs.filter(c => c.cell_tower_city === city).length;

      const marker = L.marker([data.lat, data.lon], { icon: towerIcon }).addTo(this.map);
      marker.bindPopup(`
        <div class="tactical-popup">
          <div class="popup-badge">CELL TOWER RADAR</div>
          <h4>${city.toUpperCase()} SECTOR 1</h4>
          <p><strong>State:</strong> ${data.state}</p>
          <p><strong>Logged Intercepts:</strong> <span class="highlight-cyan">${callCount} CDRs</span></p>
          <p class="popup-hint">Monitored by State CID & Telecom Enforcement</p>
        </div>
      `);
      this.towerMarkers.set(city, marker);
    }
  }

  renderSuspects() {
    const engine = window.crimeDataEngine;
    if (!engine) return;

    const gt = engine.groundTruth;

    engine.persons.forEach(p => {
      const isBridge = p.person_id === gt.bridge_person_id;
      const isAbsconding = p.statusFlags.includes('ABSCONDING');
      const isConvicted = p.statusFlags.includes('CONVICTED');
      const colorClass = isBridge ? 'marker-pink' : isAbsconding ? 'marker-red' : isConvicted ? 'marker-orange' : 'marker-cyan';

      const icon = L.divIcon({
        className: 'tactical-suspect-marker',
        html: `
          <div class="suspect-pin ${colorClass}">
            <span class="pin-ring"></span>
            <span class="pin-label">${p.person_id}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([p.lat, p.lon], { icon }).addTo(this.map);
      marker.bindPopup(`
        <div class="tactical-popup">
          <div class="popup-badge ${isBridge ? 'badge-danger' : isAbsconding ? 'badge-danger' : 'badge-info'}">
            ${isBridge ? `${window.renderSvgIcon('star', '', 12)} DUAL-RING HIDDEN BRIDGE` : isAbsconding ? `${window.renderSvgIcon('alertTriangle', '', 12)} ACTIVE FUGITIVE` : 'SUSPECT PROFILE'}
          </div>
          <h4>${p.name} (${p.person_id})</h4>
          <p><strong>Base City:</strong> ${p.home_city}</p>
          <p><strong>Threat Score:</strong> <span class="threat-score-val">${p.threatScore}/100</span></p>
          <p><strong>Syndicate Role:</strong> <span class="text-cyan">${p.ringRole || 'Associate'}</span></p>
          <p><strong>Vehicle:</strong> ${p.vehicle_no || 'None Registered'}</p>
          <p><strong>Linked Phone:</strong> ${p.phone}</p>
          <p><strong>Prior Cases:</strong> ${p.firs.length} FIRs</p>
          <button class="popup-btn" onclick="window.showDossierModal('${p.person_id}')">Open Full Dossier</button>
        </div>
      `);

      this.suspectMarkers.set(p.person_id, marker);
    });
  }

  renderSurveillanceSightings() {
    const engine = window.crimeDataEngine;
    if (!engine) return;

    engine.surveillanceReports.forEach(sr => {
      const coords = CITY_COORDINATES[sr.location_city];
      if (!coords) return;

      // Small offset to avoid exact overlap with tower
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lonOffset = (Math.random() - 0.5) * 0.08;

      const isSmokingGun = sr.report_id === 'SR3019' || sr.report_id === 'SR3020';

      const icon = L.divIcon({
        className: 'tactical-surveillance-marker',
        html: `
          <div class="surveillance-pin ${isSmokingGun ? 'pin-smoking-gun' : ''}">
            <span>${isSmokingGun ? window.renderSvgIcon('star', 'text-pink', 14) : window.renderSvgIcon('eye', 'text-cyan', 14)}</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([coords.lat + latOffset, coords.lon + lonOffset], { icon }).addTo(this.map);
      marker.bindPopup(`
        <div class="tactical-popup">
          <div class="popup-badge ${isSmokingGun ? 'badge-danger' : 'badge-amber'}">
            ${isSmokingGun ? `${window.renderSvgIcon('siren', '', 12)} SMOKING GUN PHYSICAL INTERCEPT` : `${window.renderSvgIcon('eye', '', 12)} FIELD SURVEILLANCE REPORT`}
          </div>
          <h4>REPORT ${sr.report_id} (${sr.location_city})</h4>
          <p><strong>Date:</strong> ${sr.date}</p>
          <p><strong>Subject Sighted:</strong> ${sr.subject_id}</p>
          <p><strong>Vehicle Observed:</strong> <span class="font-mono text-amber">${sr.vehicle_observed || 'Unregistered / Cloned'}</span></p>
          <p><strong>Others Present:</strong> ${sr.other_persons_present.join(', ') || 'Unidentified Contact'}</p>
          <p class="popup-hint" style="color: #cbd5e1; font-size: 0.75rem; margin-top: 0.35rem;">
            ${sr.notes}
          </p>
        </div>
      `);

      this.surveillanceMarkers.push(marker);
    });
  }

  renderCommunicationArcs() {
    const engine = window.crimeDataEngine;
    if (!engine) return;

    this.commArcs.forEach(a => this.map.removeLayer(a));
    this.commArcs = [];

    const cityPairs = new Map();
    engine.cdrs.forEach(c => {
      const caller = engine.personMap.get(c.caller_id);
      const callee = engine.personMap.get(c.callee_id);
      if (!caller || !callee || caller.home_city === callee.home_city) return;

      const key = [caller.home_city, callee.home_city].sort().join('__');
      if (!cityPairs.has(key)) {
        cityPairs.set(key, {
          city1: caller.home_city,
          city2: callee.home_city,
          count: 0,
          hasLateNight: false
        });
      }
      const pair = cityPairs.get(key);
      pair.count++;
      if (c.note && c.note.includes('late-night')) pair.hasLateNight = true;
    });

    cityPairs.forEach(pair => {
      const c1 = CITY_COORDINATES[pair.city1];
      const c2 = CITY_COORDINATES[pair.city2];
      if (!c1 || !c2) return;

      const midLat = (c1.lat + c2.lat) / 2 + (c1.lon - c2.lon) * 0.12;
      const midLon = (c1.lon + c2.lon) / 2 + (c2.lat - c1.lat) * 0.12;

      const polyline = L.polyline(
        [[c1.lat, c1.lon], [midLat, midLon], [c2.lat, c2.lon]],
        {
          color: pair.hasLateNight ? '#ef4444' : '#06b6d4',
          weight: Math.min(5, 1.5 + pair.count * 0.3),
          opacity: pair.hasLateNight ? 0.85 : 0.5,
          dashArray: pair.hasLateNight ? '6, 6' : null
        }
      ).addTo(this.map);

      polyline.bindTooltip(
        `${pair.city1} ⇄ ${pair.city2}: ${pair.count} calls ${pair.hasLateNight ? '(Late-night flagged)' : ''}`,
        { sticky: true, className: 'tactical-tooltip' }
      );

      this.commArcs.push(polyline);
    });
  }

  focusSuspect(personId) {
    const marker = this.suspectMarkers.get(personId);
    const engine = window.crimeDataEngine;
    const person = engine.personMap.get(personId);

    if (marker && person) {
      this.map.flyTo([person.lat, person.lon], 9, { duration: 1.2 });
      setTimeout(() => marker.openPopup(), 1300);
    }
  }

  resetView() {
    if (this.map) {
      this.map.flyTo([20.5937, 78.9629], 5, { duration: 1 });
    }
  }
}

window.TacticalGISMap = TacticalGISMap;
