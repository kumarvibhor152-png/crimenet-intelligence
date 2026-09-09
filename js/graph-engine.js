/**
 * DRISHTI-CRIMENEXUS INTERACTIVE GRAPH ENGINE
 * Canvas-based high-performance force-directed network graph with dual-ring highlight,
 * hidden bridge linchpin detector, surveillance meeting links, and OSINT mention arcs.
 */

class TacticalGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.nodes = [];
    this.links = [];
    this.nodeMap = new Map();

    // Viewport transform
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.selectedNode = null;
    this.hoveredNode = null;
    this.pathHighlight = [];

    // Options
    this.centralityMetric = 'betweenness';
    this.showCalls = true;
    this.showFinances = true;
    this.showOrgs = true;
    this.showSurveillance = true;
    this.showDualRings = true; // Highlight Narcotics vs Fraud rings and P004 bridge
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

    const engine = window.crimeDataEngine;
    if (!engine) return;

    const gt = engine.groundTruth;

    // 1. Suspect Nodes
    engine.persons.forEach((p, idx) => {
      if (this.statusFilter === 'ABSCONDING' && !p.statusFlags.includes('ABSCONDING')) return;
      if (this.statusFilter === 'CONVICTED' && !p.statusFlags.includes('CONVICTED')) return;
      if (this.statusFilter === 'PENDING' && !p.statusFlags.includes('UNDER_TRIAL')) return;

      const angle = (idx / engine.persons.length) * Math.PI * 2;
      const radius = 240 + (Math.random() * 80 - 40);

      let metricScore = p.betweennessCentrality;
      if (this.centralityMetric === 'degree') metricScore = p.degreeCentrality;
      if (this.centralityMetric === 'pagerank') metricScore = p.pageRank * 5;
      if (this.centralityMetric === 'threat') metricScore = p.threatScore / 100;

      const nodeRadius = 15 + Math.max(0, metricScore * 30);

      // Node Coloring based on Dual-Ring ground truth or Threat
      let nodeColor = '#06b6d4';
      if (this.showDualRings) {
        if (p.person_id === gt.bridge_person_id) {
          nodeColor = '#ec4899'; // Linchpin Hot Pink / Red
        } else if (gt.narcotics_ring_ids.includes(p.person_id)) {
          nodeColor = p.person_id === gt.kingpin_narcotics_id ? '#10b981' : '#06b6d4'; // Emerald / Cyan
        } else if (gt.fraud_ring_ids.includes(p.person_id)) {
          nodeColor = p.person_id === gt.kingpin_fraud_id ? '#ef4444' : '#f59e0b'; // Red / Amber
        }
      } else {
        nodeColor = p.statusFlags.includes('ABSCONDING') ? '#ef4444' :
                    p.statusFlags.includes('CONVICTED') ? '#f97316' :
                    p.statusFlags.includes('UNDER_TRIAL') ? '#eab308' : '#06b6d4';
      }

      const node = {
        id: p.person_id,
        type: 'person',
        label: p.name,
        subLabel: p.person_id,
        city: p.home_city,
        data: p,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: p.person_id === gt.bridge_person_id ? nodeRadius + 6 : nodeRadius,
        baseRadius: nodeRadius,
        color: nodeColor,
        isBridge: p.person_id === gt.bridge_person_id
      };

      this.nodes.push(node);
      this.nodeMap.set(node.id, node);
    });

    // 2. Organization Nodes
    if (this.showOrgs) {
      engine.organizations.forEach((o, idx) => {
        const angle = (idx / engine.organizations.length) * Math.PI * 2;
        const radius = 400;
        const node = {
          id: o.org_id,
          type: 'org',
          label: o.name,
          subLabel: o.registered_city,
          data: o,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          radius: o.org_id === 'O10' ? 28 : 18,
          baseRadius: o.org_id === 'O10' ? 28 : 18,
          color: o.org_id === 'O10' ? '#a855f7' : '#6366f1'
        };
        this.nodes.push(node);
        this.nodeMap.set(node.id, node);
      });
    }

    // 3. Call Links
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
        this.links.push({
          type: 'call',
          source: this.nodeMap.get(pair.source),
          target: this.nodeMap.get(pair.target),
          count: pair.count,
          duration: pair.duration,
          hasLateNight: pair.hasLateNight,
          color: pair.hasLateNight ? 'rgba(239, 68, 68, 0.75)' : 'rgba(6, 182, 212, 0.45)',
          width: Math.min(6, 1 + pair.count * 0.7)
        });
      });
    }

    // 4. Financial Transaction Links
    if (this.showFinances) {
      engine.financialTxns.forEach(t => {
        const senderObj = engine.accountToOwner.get(t.sender_account);
        const receiverObj = engine.accountToOwner.get(t.receiver_account);
        if (!senderObj || !receiverObj) return;

        const senderId = senderObj.type === 'person' ? senderObj.entity.person_id : senderObj.entity.org_id;
        const receiverId = receiverObj.type === 'person' ? receiverObj.entity.person_id : receiverObj.entity.org_id;

        if (this.nodeMap.has(senderId) && this.nodeMap.has(receiverId)) {
          this.links.push({
            type: 'financial',
            source: this.nodeMap.get(senderId),
            target: this.nodeMap.get(receiverId),
            amount: t.amount_inr,
            flag: t.flag,
            mode: t.mode,
            color: t.flag === 'structuring' || t.flag === 'below-1L-threshold' 
                   ? 'rgba(236, 72, 153, 0.85)' 
                   : 'rgba(16, 185, 129, 0.6)',
            width: t.flag ? 3.5 : 2
          });
        }
      });
    }

    // 5. Physical Surveillance Sighting Links
    if (this.showSurveillance) {
      engine.surveillanceReports.forEach(sr => {
        if (sr.other_persons_present.length > 0 && this.nodeMap.has(sr.subject_id)) {
          const sNode = this.nodeMap.get(sr.subject_id);
          sr.other_persons_present.forEach(otherId => {
            if (this.nodeMap.has(otherId)) {
              this.links.push({
                type: 'surveillance',
                source: sNode,
                target: this.nodeMap.get(otherId),
                reportId: sr.report_id,
                city: sr.location_city,
                color: 'rgba(245, 158, 11, 0.7)',
                width: 2.5,
                isMeeting: true
              });
            }
          });
        }
      });
    }
  }

  toggleDualRings() {
    this.showDualRings = !this.showDualRings;
    this.buildGraph();
  }

  setCentralityMetric(metric) {
    this.centralityMetric = metric;
    const engine = window.crimeDataEngine;
    this.nodes.forEach(n => {
      if (n.type === 'person') {
        const p = n.data;
        let score = p.betweennessCentrality;
        if (metric === 'degree') score = p.degreeCentrality;
        if (metric === 'pagerank') score = p.pageRank * 5;
        if (metric === 'threat') score = p.threatScore / 100;
        n.radius = 15 + Math.max(0, score * 30) + (n.isBridge ? 6 : 0);
        n.baseRadius = n.radius;
      }
    });
  }

  setStatusFilter(status) {
    this.statusFilter = status;
    this.buildGraph();
  }

  stepPhysics() {
    const kRepel = 1900;
    const kAttract = 0.0035;
    const damping = 0.86;

    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        let dx = n1.x - n2.x;
        let dy = n1.y - n2.y;
        let dist = Math.hypot(dx, dy) || 1;
        if (dist < 360) {
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
      n.vx -= n.x * 0.002;
      n.vy -= n.y * 0.002;
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

    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, this.width, this.height);
    this.drawTacticalGrid();

    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    for (let link of this.links) {
      this.drawLink(link, timestamp);
    }

    for (let node of this.nodes) {
      this.drawNode(node, timestamp);
    }

    ctx.restore();
  }

  drawTacticalGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 33, 64, 0.4)';
    ctx.lineWidth = 1;

    const gridSize = 40 * this.camera.zoom;
    const offsetX = this.camera.x % gridSize;
    const offsetY = this.camera.y % gridSize;

    ctx.beginPath();
    for (let x = offsetX; x < this.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = offsetY; y < this.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawLink(link, timestamp) {
    const ctx = this.ctx;
    const isPathLink = this.pathHighlight.includes(link.source.id) && this.pathHighlight.includes(link.target.id);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);

    if (isPathLink) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
    } else {
      ctx.strokeStyle = link.color;
      ctx.lineWidth = link.width;
      if (link.type === 'financial') {
        ctx.setLineDash([6, 4]);
      } else if (link.type === 'surveillance') {
        ctx.setLineDash([2, 4]);
      }
    }
    ctx.stroke();

    if (link.hasLateNight || link.flag || link.type === 'surveillance') {
      const t = ((timestamp % 2000) / 2000);
      const px = link.source.x + (link.target.x - link.source.x) * t;
      const py = link.source.y + (link.target.y - link.source.y) * t;

      ctx.beginPath();
      ctx.arc(px, py, link.flag ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = link.flag ? '#ec4899' : link.type === 'surveillance' ? '#f59e0b' : '#ef4444';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
    }

    ctx.restore();
  }

  drawNode(node, timestamp) {
    const ctx = this.ctx;
    const isSelected = this.selectedNode === node;
    const isHovered = this.hoveredNode === node;
    const isPath = this.pathHighlight.includes(node.id);

    ctx.save();
    ctx.translate(node.x, node.y);

    // Special Glowing Pulse for Hidden Bridge Linchpin (P004)
    if (node.isBridge) {
      const pulseT = (Math.sin(timestamp * 0.005) + 1) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, node.radius + 8 + pulseT * 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(236, 72, 153, ${0.15 + pulseT * 0.2})`;
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (isSelected || isPath) {
      ctx.beginPath();
      ctx.arc(0, 0, node.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
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

    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = isSelected ? 3.5 : (node.isBridge ? 3 : 2);
    ctx.strokeStyle = node.color;
    ctx.shadowColor = node.color;
    ctx.shadowBlur = isHovered || isSelected || node.isBridge ? 16 : 6;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.subLabel, 0, 0);

    // Outer Label
    ctx.font = node.isBridge ? 'bold 12px Inter, sans-serif' : '500 11px Inter, sans-serif';
    ctx.fillStyle = node.isBridge ? '#f472b6' : (isSelected ? '#38bdf8' : '#cbd5e1');
    ctx.fillText(node.label, 0, node.radius + 14);

    // Badge for Hidden Bridge Linchpin
    if (node.isBridge) {
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ec4899';
      ctx.fillText('⭐ HIDDEN BRIDGE', 0, node.radius + 26);
    }

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
        if (Math.hypot(n.x - worldX, n.y - worldY) <= n.radius + 4) {
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
      adj.get(l.source.id).push(l.target.id);
      adj.get(l.target.id).push(l.source.id);
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

  resetView() {
    this.camera.zoom = 1;
    this.camera.x = this.width / 2;
    this.camera.y = this.height / 2;
    this.pathHighlight = [];
    this.selectedNode = null;
  }
}

window.TacticalGraphEngine = TacticalGraphEngine;
