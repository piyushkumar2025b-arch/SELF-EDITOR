/* ═══════════════════════════════════════════════════════════════
   js/mindmap.js — Interactive Visual Plot & Character Mindmap Canvas
   ═══════════════════════════════════════════════════════════════ */

let mmNodes = [];
let mmConnections = [];
let mmSelectedNode = null;
let mmDraggingNode = null;
let mmDragOffset = { x: 0, y: 0 };
let mmLinkingSourceNode = null;
let mmCanvas = null;
let mmCtx = null;

const MM_COLORS = {
  primary:   '#a78bfa', // pastel violet
  secondary: '#38bdf8', // pastel sky blue
  success:   '#34d399', // pastel emerald
  warning:   '#fbbf24', // pastel amber
  danger:    '#f87171'  // pastel coral
};

function initMindmap() {
  mmCanvas = document.getElementById('mindmap-canvas');
  if (!mmCanvas) return;
  mmCtx = mmCanvas.getContext('2d');

  // Load saved mindmap
  try {
    const saved = localStorage.getItem('inkwell-mindmap-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      mmNodes = parsed.nodes || [];
      mmConnections = parsed.connections || [];
    } else {
      // Default template nodes
      mmNodes = [
        { id: '1', x: 120, y: 150, label: 'Hero: Arthur', color: MM_COLORS.primary },
        { id: '2', x: 280, y: 150, label: 'Conflict: The Ring', color: MM_COLORS.warning },
        { id: '3', x: 440, y: 150, label: 'Villain: Malakor', color: MM_COLORS.danger }
      ];
      mmConnections = [
        { from: '1', to: '2' },
        { from: '3', to: '2' }
      ];
    }
  } catch(e) {
    console.warn('Failed to load mindmap:', e);
  }

  // Setup Event Listeners
  mmCanvas.addEventListener('mousedown', handleMMMouseDown);
  mmCanvas.addEventListener('mousemove', handleMMMouseMove);
  mmCanvas.addEventListener('mouseup', handleMMMouseUp);
  mmCanvas.addEventListener('dblclick', handleMMDblClick);

  window.addEventListener('resize', resizeMMCanvas);
  resizeMMCanvas();

  drawMindmap();
}

function saveMindmap() {
  try {
    localStorage.setItem('inkwell-mindmap-data', JSON.stringify({
      nodes: mmNodes,
      connections: mmConnections
    }));
  } catch(e) {}
}

function resizeMMCanvas() {
  if (!mmCanvas) return;
  // Let it fit container width, keep height at 350
  const container = mmCanvas.parentElement;
  if (container) {
    mmCanvas.width = container.clientWidth || 500;
    mmCanvas.height = 350;
  }
  drawMindmap();
}

function drawMindmap() {
  if (!mmCanvas || !mmCtx) return;
  mmCtx.clearRect(0, 0, mmCanvas.width, mmCanvas.height);

  // 1. Draw Grid Background (sleek tech feel)
  mmCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  mmCtx.lineWidth = 1;
  const grid = 20;
  for (let x = 0; x < mmCanvas.width; x += grid) {
    mmCtx.beginPath();
    mmCtx.moveTo(x, 0);
    mmCtx.lineTo(x, mmCanvas.height);
    mmCtx.stroke();
  }
  for (let y = 0; y < mmCanvas.height; y += grid) {
    mmCtx.beginPath();
    mmCtx.moveTo(0, y);
    mmCtx.lineTo(mmCanvas.width, y);
    mmCtx.stroke();
  }

  // 2. Draw Connections
  mmCtx.lineWidth = 2;
  mmConnections.forEach(conn => {
    const fromNode = mmNodes.find(n => n.id === conn.from);
    const toNode = mmNodes.find(n => n.id === conn.to);
    if (fromNode && toNode) {
      mmCtx.beginPath();
      mmCtx.moveTo(fromNode.x, fromNode.y);
      mmCtx.lineTo(toNode.x, toNode.y);
      // Soft glowing connector gradient
      const grad = mmCtx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
      grad.addColorStop(0, fromNode.color);
      grad.addColorStop(1, toNode.color);
      mmCtx.strokeStyle = grad;
      mmCtx.stroke();
    }
  });

  // 3. Draw Active Link-Building line
  if (mmLinkingSourceNode) {
    mmCtx.beginPath();
    mmCtx.moveTo(mmLinkingSourceNode.x, mmLinkingSourceNode.y);
    // Draw line to current mouse position or selected node
    const lastMouse = getCanvasMouseCoords(lastMouseEvent);
    mmCtx.lineTo(lastMouse.x, lastMouse.y);
    mmCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    mmCtx.lineWidth = 1.5;
    mmCtx.setLineDash([4, 4]);
    mmCtx.stroke();
    mmCtx.setLineDash([]);
  }

  // 4. Draw Nodes
  mmNodes.forEach(node => {
    const isSelected = mmSelectedNode && mmSelectedNode.id === node.id;
    const isLinkingSource = mmLinkingSourceNode && mmLinkingSourceNode.id === node.id;
    
    // Draw glow if selected
    if (isSelected) {
      mmCtx.beginPath();
      mmCtx.arc(node.x, node.y, 48, 0, Math.PI * 2);
      mmCtx.fillStyle = 'rgba(255,255,255,0.05)';
      mmCtx.fill();
    }

    // Node Body
    mmCtx.beginPath();
    mmCtx.arc(node.x, node.y, 40, 0, Math.PI * 2);
    mmCtx.fillStyle = '#1e1e24';
    mmCtx.fill();

    // Node Border
    mmCtx.beginPath();
    mmCtx.arc(node.x, node.y, 40, 0, Math.PI * 2);
    mmCtx.strokeStyle = isLinkingSource ? '#ffffff' : node.color;
    mmCtx.lineWidth = isSelected ? 3.5 : 2;
    mmCtx.stroke();

    // Node Text
    mmCtx.fillStyle = '#e4e4e7';
    mmCtx.font = '10px sans-serif';
    mmCtx.textAlign = 'center';
    mmCtx.textBaseline = 'middle';

    // Wrap text into multiple lines if needed
    wrapText(mmCtx, node.label, node.x, node.y, 65, 12);
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Adjust starting Y to center block vertically
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i].trim(), x, startY + i * lineHeight);
  }
}

// Coordinate extraction helper
let lastMouseEvent = null;
function getCanvasMouseCoords(evt) {
  if (!evt || !mmCanvas) return { x: 0, y: 0 };
  const rect = mmCanvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getNodeAt(x, y) {
  return mmNodes.find(node => {
    const dist = Math.hypot(node.x - x, node.y - y);
    return dist <= 40; // radius of node is 40
  });
}

function handleMMMouseDown(e) {
  lastMouseEvent = e;
  const coords = getCanvasMouseCoords(e);
  const clickedNode = getNodeAt(coords.x, coords.y);

  if (clickedNode) {
    if (mmLinkingSourceNode) {
      // Create connection
      if (mmLinkingSourceNode.id !== clickedNode.id) {
        // Prevent duplicate connection
        const exists = mmConnections.some(c => 
          (c.from === mmLinkingSourceNode.id && c.to === clickedNode.id) ||
          (c.from === clickedNode.id && c.to === mmLinkingSourceNode.id)
        );
        if (!exists) {
          mmConnections.push({ from: mmLinkingSourceNode.id, to: clickedNode.id });
          saveMindmap();
        }
      }
      mmLinkingSourceNode = null;
    } else {
      mmDraggingNode = clickedNode;
      mmSelectedNode = clickedNode;
      mmDragOffset.x = coords.x - clickedNode.x;
      mmDragOffset.y = coords.y - clickedNode.y;
      updateControlPanelUI();
    }
  } else {
    mmSelectedNode = null;
    mmLinkingSourceNode = null;
    updateControlPanelUI();
  }
  drawMindmap();
}

function handleMMMouseMove(e) {
  lastMouseEvent = e;
  const coords = getCanvasMouseCoords(e);

  if (mmDraggingNode) {
    mmDraggingNode.x = Math.max(40, Math.min(mmCanvas.width - 40, coords.x - mmDragOffset.x));
    mmDraggingNode.y = Math.max(40, Math.min(mmCanvas.height - 40, coords.y - mmDragOffset.y));
    drawMindmap();
  } else if (mmLinkingSourceNode) {
    drawMindmap();
  }
}

function handleMMMouseUp() {
  if (mmDraggingNode) {
    saveMindmap();
    mmDraggingNode = null;
  }
}

function handleMMDblClick(e) {
  const coords = getCanvasMouseCoords(e);
  const existingNode = getNodeAt(coords.x, coords.y);
  if (!existingNode) {
    addNewNode(coords.x, coords.y);
  }
}

function addNewNode(x = null, y = null) {
  const id = Date.now().toString();
  const newNode = {
    id,
    x: x || mmCanvas.width / 2,
    y: y || mmCanvas.height / 2,
    label: 'New Idea',
    color: MM_COLORS.primary
  };
  mmNodes.push(newNode);
  mmSelectedNode = newNode;
  saveMindmap();
  updateControlPanelUI();
  drawMindmap();
  showToast('✓ Node added');
}

function deleteSelectedNode() {
  if (!mmSelectedNode) return;
  
  // Remove node
  mmNodes = mmNodes.filter(n => n.id !== mmSelectedNode.id);
  // Remove associated connections
  mmConnections = mmConnections.filter(c => c.from !== mmSelectedNode.id && c.to !== mmSelectedNode.id);
  
  mmSelectedNode = null;
  saveMindmap();
  updateControlPanelUI();
  drawMindmap();
  showToast('✓ Node deleted');
}

function startConnectionFromSelected() {
  if (!mmSelectedNode) return;
  mmLinkingSourceNode = mmSelectedNode;
  showToast('Click target node to connect');
  drawMindmap();
}

function clearAllConnectionsForSelected() {
  if (!mmSelectedNode) return;
  mmConnections = mmConnections.filter(c => c.from !== mmSelectedNode.id && c.to !== mmSelectedNode.id);
  saveMindmap();
  drawMindmap();
  showToast('✓ Links cleared for node');
}

function updateControlPanelUI() {
  const labelInput = document.getElementById('mm-label');
  const details = document.getElementById('mm-node-details');
  
  if (!labelInput || !details) return;

  if (mmSelectedNode) {
    details.style.display = 'block';
    labelInput.value = mmSelectedNode.label;
  } else {
    details.style.display = 'none';
  }
}

function updateSelectedNodeLabel(val) {
  if (!mmSelectedNode) return;
  mmSelectedNode.label = val;
  saveMindmap();
  drawMindmap();
}

function changeSelectedNodeColor(colorName) {
  if (!mmSelectedNode || !MM_COLORS[colorName]) return;
  mmSelectedNode.color = MM_COLORS[colorName];
  saveMindmap();
  drawMindmap();
}

function clearWholeMindmap() {
  if (confirm('Clear the entire Mindmap board?')) {
    mmNodes = [];
    mmConnections = [];
    mmSelectedNode = null;
    mmLinkingSourceNode = null;
    saveMindmap();
    updateControlPanelUI();
    drawMindmap();
    showToast('✓ Mindmap cleared');
  }
}

// ── AUTO-INIT ───────────────────────────────────────────────
if (typeof editor !== 'undefined') {
  // Let DOM elements render first
  setTimeout(initMindmap, 200);
}
