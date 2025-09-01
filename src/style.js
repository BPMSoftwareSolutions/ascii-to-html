// Styling constants matching the template SVG
// CommonJS exports wrapper for Jest without ESM config
module.exports = {
  SVG_SIZE: undefined,
  FONTS: undefined,
  COLORS: undefined,
  BOX_STYLES: undefined,
  TEMPLATE_POS: undefined,
  defsBlock: undefined,
};


const SVG_SIZE = { width: 900, height: 500 };

const FONTS = {
  family: 'monospace',
  titleSize: 20,
  headerSize: 14,
  textSize: 12,
  labelSize: 11,
  legendSize: 10
};

const COLORS = {
  title: '#1F2937',
  headerHost: '#2563EB',
  headerPlugin: '#059669',
  headerConductor: '#7C3AED',
  arrow: '#374151',
  legend: '#6B7280'
};

const BOX_STYLES = {
  host: { fill: 'url(#hostGradient)', stroke: '#3B82F6', text: '#1E40AF' },
  plugin: { fill: 'url(#pluginGradient)', stroke: '#10B981', text: '#047857' },
  conductor: { fill: 'url(#conductorGradient)', stroke: '#8B5CF6', text: '#5B21B6' }
};

const TEMPLATE_POS = {
  title: { x: 450, y: 30 },
  headers: {
    host: { x: 150, y: 70 },
    plugin: { x: 450, y: 70 },
    conductor: { x: 750, y: 70 }
  },
  boxes: {
    host: { x: 50, y: 90, w: 200, h: 120 },
    plugin: { x: 350, y: 90, w: 200, h: 140 },
    conductor: { x: 650, y: 90, w: 200, h: 120 }
  },
  arrows: {
    hostToPlugin: { d: 'M 250 130 L 340 130' },
    pluginToConductor: { d: 'M 550 140 L 640 140' },
    conductorToPlugin: { d: 'M 650 170 L 560 170' },
    slotsCurve: { d: 'M 350 200 Q 300 240 250 200' },
    bottomCurve: { d: 'M 150 210 Q 150 260 450 260 Q 750 260 750 210' }
  },
  arrowLabels: {
    mountsVia: { x: 295, y: 120 },
    manifest: { x: 295, y: 145 },
    play: { x: 595, y: 130 },
    callbacks: { x: 605, y: 160 },
    notifyUi: { x: 605, y: 185 },
    slots: { x: 300, y: 235 }
  },
  circles: [
    { cx: 250, cy: 130, fill: '#3B82F6' },
    { cx: 340, cy: 130, fill: '#10B981' },
    { cx: 550, cy: 140, fill: '#10B981' },
    { cx: 640, cy: 140, fill: '#8B5CF6' },
    { cx: 650, cy: 170, fill: '#8B5CF6' },
    { cx: 560, cy: 170, fill: '#10B981' },
    { cx: 350, cy: 200, fill: '#10B981' },
    { cx: 250, cy: 200, fill: '#3B82F6' }
  ],
  legend: {
    rect: { x: 50, y: 320, w: 800, h: 120 },
    title: { x: 450, y: 340 },
    lines: [
      { x: 70, y: 365 },
      { x: 70, y: 385 },
      { x: 70, y: 405 },
      { x: 70, y: 425 }
    ]
  }
};

function defsBlock() {
  return `  <defs>
    <marker id="arrowhead" markerWidth="12" markerHeight="8"
            refX="10" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,8 L12,4 z" fill="#374151"/>
    </marker>
    <linearGradient id="hostGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#DBEAFE"/>
      <stop offset="100%" style="stop-color:#BFDBFE"/>
    </linearGradient>
    <linearGradient id="pluginGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#D1FAE5"/>
      <stop offset="100%" style="stop-color:#A7F3D0"/>
    </linearGradient>
    <linearGradient id="conductorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E9D5FF"/>
      <stop offset="100%" style="stop-color:#DDD6FE"/>
    </linearGradient>
  </defs>`;
}


// Assign CommonJS exports
module.exports.SVG_SIZE = SVG_SIZE;
module.exports.FONTS = FONTS;
module.exports.COLORS = COLORS;
module.exports.BOX_STYLES = BOX_STYLES;
module.exports.TEMPLATE_POS = TEMPLATE_POS;
module.exports.defsBlock = defsBlock;
