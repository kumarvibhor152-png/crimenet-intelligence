/**
 * DRISHTI-CRIMENEXUS LAW ENFORCEMENT LINK ANALYSIS GRAPH ENGINE
 * Professional intelligence-grade network analysis engine (Palantir Gotham / i2 Analyst's Notebook standard).
 * Features:
 * - High-contrast forensic node identity badges
 * - Directional edge indicators (Caller -> Callee, Sender -> Recipient)
 * - Interactive single-click syndicate neighborhood focus (dims unconnected nodes)
 * - Evidence Export to High-Resolution PNG for court exhibits & FIR chargesheets
 * - Multi-hop shortest path nexus computation
 * - Fully silent and professional (no arcade animations or game SFX)
 */

class TacticalGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.nodes = [];
    this.links = [];
    this.nodeMap = new Map();
    this.adjacencyMap = new Map();

    // Viewport transform
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.selectedNode = null;
    this.hoveredNode = null;
    this.pathHighlight = [];

    // Investigation Filters
    this.centralityMetric = 'betweenness';
    this.showCalls = true;
    this.showFinances = true;
    this.showOrgs = true;
    this.showSurveillance = true;
    this.showDualRings = true;
    this.statusFilter = 'ALL';

    this.animFrameId = null;

    this.initCanvasSize();
    this.buildGraph();
    this.attachEventListeners();
    this.startSimulation();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = (rect.height || 680) * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height || 680}px`;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height || 680;
    this.camera.x = this.width / 2;
    this.camera.y = this.height / 2;
  }

  buildGraph() {
    this.nodes = [];
    this.links = [];
    this.nodeMap.clear();
    this.adjacencyMap.clear();

    const engine = window.crimeDataEngine;
    if (!engine) return;

    const gt = engine.groundTruth;

    // 1. Suspect Nodes
    engine.persons.forEach((p, idx) => {
      if (this.statusFilter === 'ABSCONDING' && !p.statusFlags.includes('ABSCONDING')) return;
      if (this.statusFilter === 'CONVICTED' && !p.statusFlags.includes('CONVICTED')) return;
      if (this.statusFilter === 'PENDING' && !p.statusFlags.includes('UNDER_TRIAL')) return;

      const angle = (idx / engine.persons.length) * Math.PI * 2;
      const radius = 230 + (Math.random() * 60 - 30);

      let metricScore = p.betweennessCentrality;
      if (this.centralityMetric === 'degree') metricScore = p.degreeCentrality;
      if (this.centralityMetric === 'pagerank') metricScore = p.pageRank * 5;
      if (this.centralityMetric === 'threat') metricScore = p.threatScore / 100;

      const nodeRadius = 16 + Math.max(0, metricScore * 28);
      const isBridge = (p.person_id === gt.bridge_person_id);
      const isNarcoKingpin = (p.person_id === gt.kingpin_narcotics_id);
      const isFraudKingpin = (p.person_id === gt.kingpin_fraud_id);
      const isNarcoRing = gt.narcotics_ring_ids.includes(p.person_id);
      const isFraudRing = gt.fraud_ring_ids.includes(p.person_id);

      // Color scheme according to law enforcement syndicate classification
      let nodeColor = '#38bdf8';
      let ringLabel = 'OPERATIVE';

      if (this.showDualRings) {
        if (isBridge) {
          nodeColor = '#e11d48'; // Law-Enforcement Ruby Crimson
          ringLabel = 'CONDUIT LINCHPIN';
        } else if (isNarcoRing) {
          nodeColor = isNarcoKingpin ? '#059669' : '#10b981'; // Emerald Narcotics Cartel
          ringLabel = isNarcoKingpin ? 'NARCO KINGPIN' : 'NARCOTICS RING';
        } else if (isFraudRing) {
          nodeColor = isFraudKingpin ? '#1d4ed8' : '#3b82f6'; // Police Blue Fraud Cartel
          ringLabel = isFraudKingpin ? 'FRAUD KINGPIN' : 'FRAUD & EXTORTION';
        }
      } else {
        nodeColor = p.statusFlags.includes('ABSCONDING') ? '#ef4444' :
                    p.statusFlags.includes('CONVICTED') ? '#f59e0b' :
                    p.statusFlags.includes('UNDER_TRIAL') ? '#eab308' : '#38bdf8';
        ringLabel = p.statusFlags.includes('ABSCONDING') ? 'ABSCONDING' :
                    p.statusFlags.includes('CONVICTED') ? 'CONVICTED' : 'UNDER TRIAL';
      }

      const node = {
        id: p.person_id,
        type: 'person',
        label: p.name,
        subLabel: p.person_id,
        city: p.home_city,
        roleTag: ringLabel,
        data: p,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: isBridge ? nodeRadius + 5 : (isNarcoKingpin || isFraudKingpin ? nodeRadius + 3 : nodeRadius),
        baseRadius: nodeRadius,
        color: nodeColor,
        isBridge,
        isNarcoKingpin,
        isFraudKingpin
      };

      this.nodes.push(node);
      this.nodeMap.set(node.id, node);
      this.adjacencyMap.set(node.id, new Set());
    });

    // 2. Organization Nodes (e.g. Sunrise Money Exchange)
    if (this.showOrgs) {
      engine.organizations.forEach((o, idx) => {
        const angle = (idx / engine.organizations.length) * Math.PI * 2 + 0.5;
        const radius = 380;
        const isSunrise = (o.org_id === 'O10');

        const node = {
          id: o.org_id,
          type: 'org',
          label: o.name,
          subLabel: o.org_id,
          city: o.registered_city,
          roleTag: isSunrise ? 'HAWALA HUB' : 'CORPORATE ENTITY',
          data: o,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          radius: isSunrise ? 26 : 18,
          baseRadius: isSunrise ? 26 : 18,
          color: isSunrise ? '#8b5cf6' : '#64748b',
          isSunrise
        };

        this.nodes.push(node);
        this.nodeMap.set(node.id, node);
        this.adjacencyMap.set(node.id, new Set());
      });
    }

    // 3. Telecommunication Intercept Links (CDRs)
    if (this.showCalls) {
      const callPairs = new Map();
      engine.cdrs.forEach(c => {
        if (!this.nodeMap.has(c.caller_id) || !this.nodeMap.has(c.callee_id)) return;
        const key = [c.caller_id, c.callee_id].sort().join('__');
        if (!callPairs.has(key)) {
          callPairs.set(key, {
            source: c.caller_id,
            target: c.callee_id,
            count: 0,
            duration: 0,
            hasLateNight: false
          });
        }
        const pair = callPairs.get(key);
        pair.count++;
        pair.duration += c.duration_sec;
        if (c.note && c.note.includes('late-night')) pair.hasLateNight = true;
      });

      callPairs.forEach(pair => {
        const sNode = this.nodeMap.get(pair.source);
        const tNode = this.nodeMap.get(pair.target);
        this.links.push({
          type: 'call',
          source: sNode,
          target: tNode,
          count: pair.count,
          duration: pair.duration,
          hasLateNight: pair.hasLateNight,
          color: pair.hasLateNight ? 'rgba(239, 68, 68, 0.65)' : 'rgba(56, 189, 248, 0.45)',
          width: Math.min(5, 1.2 + pair.count * 0.55)
        });
        this.adjacencyMap.get(sNode.id)?.add(tNode.id);
        this.adjacencyMap.get(tNode.id)?.add(sNode.id);
      });
    }

    // 4. Financial Hawala Transaction Links
    if (this.showFinances) {
      engine.financialTxns.forEach(t => {
        const senderObj = engine.accountToOwner.get(t.sender_account);
        const receiverObj = engine.accountToOwner.get(t.receiver_account);
        if (!senderObj || !receiverObj) return;

        const senderId = senderObj.type === 'person' ? senderObj.entity.person_id : senderObj.entity.org_id;
        const receiverId = receiverObj.type === 'person' ? receiverObj.entity.person_id : receiverObj.entity.org_id;

        if (this.nodeMap.has(senderId) && this.nodeMap.has(receiverId)) {
          const sNode = this.nodeMap.get(senderId);
          const tNode = this.nodeMap.get(receiverId);
          const isStructuring = (t.flag === 'structuring' || t.flag === 'below-1L-threshold');

          this.links.push({
            type: 'financial',
            source: sNode,
            target: tNode,
            amount: t.amount_inr,
            flag: t.flag,
            mode: t.mode,
            color: isStructuring ? 'rgba(168, 85, 247, 0.85)' : 'rgba(52, 211, 153, 0.65)',
            width: isStructuring ? 2.8 : 1.8
          });
          this.adjacencyMap.get(sNode.id)?.add(tNode.id);
          this.adjacencyMap.get(tNode.id)?.add(sNode.id);
        }
      });
    }

    // 5. Physical Surveillance Rendezvous Links
    if (this.showSurveillance) {
      engine.surveillanceReports.forEach(sr => {
        if (sr.other_persons_present.length > 0 && this.nodeMap.has(sr.subject_id)) {
          const sNode = this.nodeMap.get(sr.subject_id);
          sr.other_persons_present.forEach(otherId => {
            if (this.nodeMap.has(otherId)) {
              const tNode = this.nodeMap.get(otherId);
              this.links.push({
                type: 'surveillance',
                source: sNode,
                target: tNode,
                reportId: sr.report_id,
                city: sr.location_city,
                color: 'rgba(245, 158, 11, 0.75)',
                width: 2.2,
                isMeeting: true
              });
              this.adjacencyMap.get(sNode.id)?.add(tNode.id);
              this.adjacencyMap.get(tNode.id)?.add(sNode.id);
            }
          });
        }
      });
    }
  }

  toggleDualRings() {
    this.showDualRings = !this.showDualRings;
    const btn = document.getElementById('btnToggleRings');
    if (btn) btn.classList.toggle('active', this.showDualRings);
    this.buildGraph();
  }

  toggleCalls() {
    this.showCalls = !this.showCalls;
    const btn = document.getElementById('btnToggleCalls');
    if (btn) btn.classList.toggle('active', this.showCalls);
    this.buildGraph();
  }

  toggleFinances() {
    this.showFinances = !this.showFinances;
    const btn = document.getElementById('btnToggleFinances');
    if (btn) btn.classList.toggle('active', this.showFinances);
    this.buildGraph();
  }

  toggleSurveillance() {
    this.showSurveillance = !this.showSurveillance;
    const btn = document.getElementById('btnToggleSurveillance');
    if (btn) btn.classList.toggle('active', this.showSurveillance);
    this.buildGraph();
  }

  zoomIn() {
    this.camera.zoom = Math.min(3.5, this.camera.zoom * 1.25);
  }

  zoomOut() {
    this.camera.zoom = Math.max(0.3, this.camera.zoom / 1.25);
  }

  resetView() {
    this.fitToScreen();
    this.pathHighlight = [];
    this.selectedNode = null;
  }

  fitToScreen() {
    if (this.nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      minX = Math.min(minX, n.x - n.radius);
      maxX = Math.max(maxX, n.x + n.radius);
      minY = Math.min(minY, n.y - n.radius);
      maxY = Math.max(maxY, n.y + n.radius);
    });

    const graphWidth = maxX - minX || 500;
    const graphHeight = maxY - minY || 500;
    const padding = 120;
    const scaleX = (this.width - padding) / graphWidth;
    const scaleY = (this.height - padding) / graphHeight;
    this.camera.zoom = Math.min(1.4, Math.max(0.4, Math.min(scaleX, scaleY)));
    this.camera.x = this.width / 2 - ((minX + maxX) / 2) * this.camera.zoom;
    this.camera.y = this.height / 2 - ((minY + maxY) / 2) * this.camera.zoom;
  }

  setCentralityMetric(metric) {
    this.centralityMetric = metric;
    this.nodes.forEach(n => {
      if (n.type === 'person') {
        const p = n.data;
        let score = p.betweennessCentrality;
        if (metric === 'degree') score = p.degreeCentrality;
        if (metric === 'pagerank') score = p.pageRank * 5;
        if (metric === 'threat') score = p.threatScore / 100;
        n.radius = 16 + Math.max(0, score * 28) + (n.isBridge ? 5 : 0);
        n.baseRadius = n.radius;
      }
    });
  }

  setStatusFilter(status) {
    this.statusFilter = status;
    this.buildGraph();
  }

  stepPhysics() {
    const kRepel = 2100;
    const kAttract = 0.0032;
    const damping = 0.86;

    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        let dx = n1.x - n2.x;
        let dy = n1.y - n2.y;
        let dist = Math.hypot(dx, dy) || 1;
        if (dist < 380) {
          let force = kRepel / (dist * dist);
          let fx = (dx / dist) * force;
          let fy = (dy / dist) * force;
          n1.vx += fx;
          n1.vy += fy;
          n2.vx -= fx;
          n2.vy -= fy;
        }
      }
    }

    for (let l of this.links) {
      let dx = l.target.x - l.source.x;
      let dy = l.target.y - l.source.y;
      let dist = Math.hypot(dx, dy) || 1;
      let targetDist = l.type === 'financial' ? 140 : l.type === 'surveillance' ? 120 : 190;
      let force = (dist - targetDist) * kAttract;
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }

    for (let n of this.nodes) {
      if (n === this.draggedNode) continue;
      n.vx -= n.x * 0.0022;
      n.vy -= n.y * 0.0022;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  startSimulation() {
    const loop = (timestamp) => {
      this.stepPhysics();
      this.render(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  render(timestamp = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Deep slate intelligence background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, this.width, this.height);

    // Precision Dot Matrix Forensic Grid
    this.drawForensicDotGrid();

    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // Active focus evaluation
    const activeFocusNode = this.hoveredNode || this.selectedNode;

    // Draw Links
    for (let link of this.links) {
      this.drawLink(link, activeFocusNode);
    }

    // Draw Nodes
    for (let node of this.nodes) {
      this.drawNode(node, activeFocusNode);
    }

    ctx.restore();
  }

  drawForensicDotGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';

    const gridSize = 45 * this.camera.zoom;
    if (gridSize < 12) {
      ctx.restore();
      return;
    }

    const offsetX = this.camera.x % gridSize;
    const offsetY = this.camera.y % gridSize;

    for (let x = offsetX; x < this.width; x += gridSize) {
      for (let y = offsetY; y < this.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawLink(link, activeFocusNode) {
    const ctx = this.ctx;
    const isPathLink = this.pathHighlight.includes(link.source.id) && this.pathHighlight.includes(link.target.id);
    const isConnectedToFocus = activeFocusNode && (link.source.id === activeFocusNode.id || link.target.id === activeFocusNode.id);

    ctx.save();

    // Dimming logic for Palantir-grade neighborhood focus
    if (activeFocusNode && !isConnectedToFocus && !isPathLink) {
      ctx.globalAlpha = 0.10;
    } else if (activeFocusNode && isConnectedToFocus) {
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalAlpha = 0.70;
    }

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);

    if (isPathLink) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4.0;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = link.color;
      ctx.lineWidth = isConnectedToFocus ? link.width + 1.2 : link.width;

      if (link.type === 'financial') {
        ctx.setLineDash([5, 4]);
      } else if (link.type === 'surveillance') {
        ctx.setLineDash([2, 3]);
      } else {
        ctx.setLineDash([]);
      }
    }
    ctx.stroke();

    // Clean directional arrow for call & financial flow
    if (link.type !== 'surveillance') {
      this.drawEdgeDirectionArrow(link.source, link.target, link.color, link.target.radius + 6);
    }

    ctx.restore();
  }

  drawEdgeDirectionArrow(source, target, color, offsetDist) {
    const ctx = this.ctx;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 30) return;

    // Position arrow 60% of the way along link
    const t = 0.58;
    const px = source.x + dx * t;
    const py = source.y + dy * t;
    const angle = Math.atan2(dy, dx);
    const arrowLen = 7;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - arrowLen * Math.cos(angle - Math.PI / 6), py - arrowLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(px - arrowLen * Math.cos(angle + Math.PI / 6), py - arrowLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawNode(node, activeFocusNode) {
    const ctx = this.ctx;
    const isSelected = this.selectedNode === node;
    const isHovered = this.hoveredNode === node;
    const isPath = this.pathHighlight.includes(node.id);
    const isNeighbor = activeFocusNode && this.adjacencyMap.get(activeFocusNode.id)?.has(node.id);
    const isFocal = (node === activeFocusNode);

    ctx.save();
    ctx.translate(node.x, node.y);

    // Dimming logic
    if (activeFocusNode && !isFocal && !isNeighbor && !isPath) {
      ctx.globalAlpha = 0.18;
    } else {
      ctx.globalAlpha = 1.0;
    }

    // Professional Selection Ring
    if (isSelected || isHovered || isPath) {
      ctx.beginPath();
      ctx.arc(0, 0, node.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = isPath ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // High-Value Target Double Ring (Conduit Linchpin & Kingpins)
    if (node.isBridge) {
      ctx.beginPath();
      ctx.arc(0, 0, node.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (node.isNarcoKingpin || node.isFraudKingpin) {
      ctx.beginPath();
      ctx.arc(0, 0, node.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Node body
    ctx.beginPath();
    if (node.type === 'org') {
      const r = node.radius;
      ctx.moveTo(r, 0);
      for (let i = 1; i <= 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      ctx.closePath();
    } else {
      ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
    }

    // Dark solid card fill
    ctx.fillStyle = node.type === 'org' ? '#17152b' : '#0f172a';
    ctx.fill();

    ctx.lineWidth = isSelected ? 3.0 : 2.0;
    ctx.strokeStyle = node.color;
    ctx.stroke();

    // Suspect ID Center Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.subLabel, 0, 0);

    // Primary Label (Full Name)
    ctx.font = isSelected || node.isBridge ? 'bold 11px Inter, sans-serif' : '500 11px Inter, sans-serif';
    ctx.fillStyle = isSelected ? '#38bdf8' : (node.isBridge ? '#f43f5e' : '#e2e8f0');
    ctx.fillText(node.label, 0, node.radius + 14);

    // Classification Badge (Under Node)
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = node.color;
    ctx.fillText(node.roleTag || node.city, 0, node.radius + 25);

    ctx.restore();
  }

  attachEventListeners() {
    const getMousePos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      const worldX = (mouseX - this.camera.x) / this.camera.zoom;
      const worldY = (mouseY - this.camera.y) / this.camera.zoom;
      return { mouseX, mouseY, worldX, worldY };
    };

    const getNodeAt = (worldX, worldY) => {
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        if (Math.hypot(n.x - worldX, n.y - worldY) <= n.radius + 6) {
          return n;
        }
      }
      return null;
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const { mouseX, mouseY, worldX, worldY } = getMousePos(e);
      const clicked = getNodeAt(worldX, worldY);

      if (clicked) {
        this.draggedNode = clicked;
        this.selectedNode = clicked;
        if (window.onGraphNodeSelected) window.onGraphNodeSelected(clicked);
      } else {
        this.isPanning = true;
        this.panStart = { x: mouseX - this.camera.x, y: mouseY - this.camera.y };
        // Click background to unselect
        if (e.target === this.canvas) {
          this.selectedNode = null;
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      const { mouseX, mouseY, worldX, worldY } = getMousePos(e);

      if (this.draggedNode) {
        this.draggedNode.x = worldX;
        this.draggedNode.y = worldY;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else if (this.isPanning) {
        this.camera.x = mouseX - this.panStart.x;
        this.camera.y = mouseY - this.panStart.y;
      } else {
        const hover = getNodeAt(worldX, worldY);
        this.hoveredNode = hover;
        this.canvas.style.cursor = hover ? 'pointer' : 'default';
      }
    });

    window.addEventListener('mouseup', () => {
      this.draggedNode = null;
      this.isPanning = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.min(3.5, Math.max(0.3, this.camera.zoom * zoomFactor));

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.camera.x = mouseX - (mouseX - this.camera.x) * (newZoom / this.camera.zoom);
      this.camera.y = mouseY - (mouseY - this.camera.y) * (newZoom / this.camera.zoom);
      this.camera.zoom = newZoom;
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });
  }

  findShortestPath(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) {
      this.pathHighlight = [];
      return [];
    }

    const queue = [[sourceId]];
    const visited = new Set([sourceId]);

    const adj = new Map();
    this.nodes.forEach(n => adj.set(n.id, []));
    this.links.forEach(l => {
      adj.get(l.source.id)?.push(l.target.id);
      adj.get(l.target.id)?.push(l.source.id);
    });

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === targetId) {
        this.pathHighlight = path;
        return path;
      }

      const neighbors = adj.get(node) || [];
      for (const nbr of neighbors) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push([...path, nbr]);
        }
      }
    }

    this.pathHighlight = [];
    return [];
  }

  exportEvidencePng() {
    // Generate official police evidence diagram with agency header
    const exportCanvas = document.createElement('canvas');
    const headerHeight = 70;
    const footerHeight = 40;
    exportCanvas.width = this.width * 2;
    exportCanvas.height = (this.height + headerHeight + footerHeight) * 2;
    const eCtx = exportCanvas.getContext('2d');
    eCtx.scale(2, 2);

    // Dark Background
    eCtx.fillStyle = '#080c14';
    eCtx.fillRect(0, 0, this.width, this.height + headerHeight + footerHeight);

    // Official Police Header
    eCtx.fillStyle = '#0f172a';
    eCtx.fillRect(0, 0, this.width, headerHeight);
    eCtx.strokeStyle = '#334155';
    eCtx.lineWidth = 1;
    eCtx.beginPath();
    eCtx.moveTo(0, headerHeight);
    eCtx.lineTo(this.width, headerHeight);
    eCtx.stroke();

    eCtx.fillStyle = '#f8fafc';
    eCtx.font = 'bold 13px "JetBrains Mono", monospace';
    eCtx.fillText('CENTRAL CRIME INVESTIGATION DIVISION // SPECIAL CYBER-INTELLIGENCE CELL', 20, 26);
    eCtx.font = '500 11px Inter, sans-serif';
    eCtx.fillStyle = '#94a3b8';
    eCtx.fillText('EXHIBIT A: CRIMINAL SYNDICATE TOPOLOGICAL LINK ANALYSIS // CASE CR-884/2025/CID', 20, 44);
    eCtx.font = '10px "JetBrains Mono", monospace';
    eCtx.fillStyle = '#38bdf8';
    eCtx.fillText(`GENERATED: ${new Date().toISOString()} // CLASSIFICATION: CONFIDENTIAL - LAW ENFORCEMENT ONLY`, 20, 60);

    // Copy Current Graph Render
    eCtx.drawImage(this.canvas, 0, headerHeight, this.width, this.height);

    // Official Footer
    eCtx.fillStyle = '#0f172a';
    eCtx.fillRect(0, this.height + headerHeight, this.width, footerHeight);
    eCtx.fillStyle = '#64748b';
    eCtx.font = '10px "JetBrains Mono", monospace';
    eCtx.fillText(`DRISHTI-CRIMENEXUS FORENSIC EVIDENCE EXPORT • 40 ENTITIES MONITORED • ALL RIGHTS RESERVED`, 20, this.height + headerHeight + 24);

    // Trigger instant download
    const link = document.createElement('a');
    link.download = `Syndicate_Link_Analysis_CR884_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    window.showTacticalNotification('Forensic Evidence Graph PNG exported successfully.');
  }
}

window.TacticalGraphEngine = TacticalGraphEngine;
