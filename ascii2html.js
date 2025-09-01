#!/usr/bin/env node
/**
 * ascii2html.js
 * Convert an ASCII diagram using box-drawing characters into an HTML+SVG diagram.
 *
 * Usage:
 *   node ascii2html.js input.txt > diagram.html
 *   cat input.txt | node ascii2html.js > diagram.html
 */

const fs = require('fs');

const parseArgs = () => {
  const args = process.argv.slice(2);
  let inputFile = null;
  let outputFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
      outputFile = args[i + 1];
      i++; // skip next arg
    } else if (!inputFile && !args[i].startsWith('-')) {
      inputFile = args[i];
    }
  }

  return { inputFile, outputFile };
};

const readAll = (inputFile) => {
  if (inputFile) {
    return fs.readFileSync(inputFile, 'utf8');
  } else if (!process.stdin.isTTY) {
    return fs.readFileSync(0, 'utf8');
  } else {
    console.error('Usage: node ascii2html.js <input.txt> [-o output.html]');
    console.error('   or: cat input.txt | node ascii2html.js [-o output.html]');
    process.exit(1);
  }
};

const { inputFile, outputFile } = parseArgs();
const text = readAll(inputFile).replace(/\r\n/g, '\n');
const lines = text.split('\n');
const height = lines.length;
const width = Math.max(...lines.map(l => l.length));

// grid accessor
const chAt = (x, y) => {
  if (y < 0 || y >= height) return ' ';
  const line = lines[y] || '';
  return x < 0 || x >= line.length ? ' ' : line[x];
};
const isHLine = c => c === '─' || c === '-' || c === '━' || c === '—';
const isVLine = c => c === '│' || c === '|' || c === '┃' || c === '├' || c === '┤' || c === '┼';

function detectBoxes() {
  const boxes = [];
  const used = new Set(); // mark corners to avoid dupes

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = chAt(x, y);
      if (c !== '┌') continue;
      const key = `${x},${y}`;
      if (used.has(key)) continue;

      // find top-right corner on same row
      let xr = x + 1;
      while (xr < width && isHLine(chAt(xr, y))) xr++;
      if (chAt(xr, y) !== '┐') continue;

      // find bottom-left corner on same column
      let yb = y + 1;
      while (yb < height && isVLine(chAt(x, yb))) yb++;
      if (chAt(x, yb) !== '└') continue;

      // confirm bottom-right corner
      if (chAt(xr, yb) !== '┘') continue;

      // lightweight border verification (allow junction chars)
      let ok = true;
      for (let xi = x + 1; xi < xr; xi++) {
        if (!isHLine(chAt(xi, y)) || !isHLine(chAt(xi, yb))) { ok = false; break; }
      }
      if (!ok) continue;
      for (let yi = y + 1; yi < yb; yi++) {
        const leftChar = chAt(x, yi);
        const rightChar = chAt(xr, yi);
        if (!isVLine(leftChar) || !isVLine(rightChar)) { ok = false; break; }
      }
      if (!ok) continue;

      // extract inner text (trim blank margins)
      const inner = [];
      for (let yi = y + 1; yi < yb; yi++) {
        const row = (lines[yi] || '').slice(x + 1, xr);
        inner.push(row);
      }
      // trim common left spaces
      const leftPad = inner
        .filter(s => s.trim().length > 0)
        .reduce((min, s) => Math.min(min, s.match(/^ */)[0].length), Infinity);
      const labelLines = inner.map(s => (leftPad === Infinity ? s : s.slice(leftPad))).map(s => s.replace(/\s+$/,''));
      const label = labelLines.join('\n').trim();

      boxes.push({
        x, y, xr, yb,
        cx: (x + xr) / 2,
        cy: (y + yb) / 2,
        w: xr - x,
        h: yb - y,
        label
      });

      used.add(`${x},${y}`);
    }
  }
  return boxes;
}

function detectHorizontalArrows(boxes) {
  // Map from character cell to the box id whose perimeter covers that cell
  const boxAt = (x, y) => {
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (x >= b.x && x <= b.xr && y >= b.y && y <= b.yb) return i;
    }
    return -1;
  };

  const edges = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < (lines[y] || '').length; x++) {
      const c = chAt(x, y);
      if (c !== '▶' && c !== '◀' && c !== '>' && c !== '<') continue;

      if (c === '▶' || c === '>') {
        // scan left for H-line then find a source box
        let xl = x - 1;
        while (xl >= 0 && (isHLine(chAt(xl, y)) || chAt(xl, y) === ' ')) xl--;
        // xl stopped at first non space/line; source likely just right of this char
        const srcBox = boxAt(xl, y) >= 0 ? boxAt(xl, y) : boxAt(xl + 1, y);
        // scan right to find target box boundary
        let xr = x + 1;
        while (xr < width && (isHLine(chAt(xr, y)) || chAt(xr, y) === ' ')) xr++;
        const dstBox = boxAt(xr, y) >= 0 ? boxAt(xr, y) : boxAt(xr - 1, y);
        if (srcBox >= 0 && dstBox >= 0 && srcBox !== dstBox) {
          edges.push({ from: srcBox, to: dstBox, y, kind: '→' });
        }
      } else if (c === '◀' || c === '<') {
        // scan right for H-line then find a source box on right, dest on left
        let xr = x + 1;
        while (xr < width && (isHLine(chAt(xr, y)) || chAt(xr, y) === ' ')) xr++;
        const srcBox = boxAt(xr, y) >= 0 ? boxAt(xr, y) : boxAt(xr - 1, y);
        let xl = x - 1;
        while (xl >= 0 && (isHLine(chAt(xl, y)) || chAt(xl, y) === ' ')) xl--;
        const dstBox = boxAt(xl, y) >= 0 ? boxAt(xl, y) : boxAt(xl + 1, y);
        if (srcBox >= 0 && dstBox >= 0 && srcBox !== dstBox) {
          edges.push({ from: srcBox, to: dstBox, y, kind: '←' });
        }
      }
    }
  }
  // de-duplicate edges that share same (from,to,y)
  const uniq = new Map();
  edges.forEach(e => {
    const k = `${e.from}->${e.to}@${e.y}`;
    if (!uniq.has(k)) uniq.set(k, e);
  });
  return Array.from(uniq.values());
}

function toHTML(boxes, edges) {
  // Character cell to pixel scale (tweak to taste)
  const CELL_W = 12;    // px per column
  const CELL_H = 22;    // px per row
  const PAD = 12;       // inner padding inside boxes (px)
  const W = (Math.max(width, 60)) * CELL_W + 100;
  const H = (Math.max(height, 20)) * CELL_H + 100;

  const boxRects = boxes.map((b, i) => {
    const x = b.x * CELL_W;
    const y = b.y * CELL_H;
    const w = (b.xr - b.x) * CELL_W;
    const h = (b.yb - b.y) * CELL_H;
    const label = b.label || `Node ${i+1}`;
    // center text
    const textX = x + w / 2;
    const textY = y + h / 2;

    // Use foreignObject for wrapped HTML text; fallback <text> for simple renderers
    return `
      <g class="node" data-id="${i}">
        <rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="10" ry="10" class="box"/>
        <foreignObject x="${x+PAD}" y="${y+PAD}" width="${Math.max(0, w - 2*PAD)}" height="${Math.max(0, h - 2*PAD)}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="label">${escapeHTML(label).replace(/\n/g,'<br/>')}</div>
        </foreignObject>
        <title>${escapeHTML(label)}</title>
      </g>`;
  }).join('\n');

  // Arrow line endpoints: connect midpoints of facing sides
  const edgeLines = edges.map((e) => {
    const from = boxes[e.from];
    const to = boxes[e.to];
    if (!from || !to) return '';

    // from right side center → to left side center (default)
    let x1 = from.xr * CELL_W;
    let y1 = (from.y + from.yb) / 2 * CELL_H;
    let x2 = to.x * CELL_W;
    let y2 = (to.y + to.yb) / 2 * CELL_H;

    // If arrow kind indicates reverse, swap
    if (e.kind === '←') {
      x1 = from.x * CELL_W;
      y1 = (from.y + from.yb) / 2 * CELL_H;
      x2 = to.xr * CELL_W;
      y2 = (to.y + to.yb) / 2 * CELL_H;
    }

    // slight offsets to avoid drawing inside the box stroke
    const OFFSET = 6;
    if (e.kind === '→') x1 += OFFSET, x2 -= OFFSET;
    if (e.kind === '←') x1 -= OFFSET, x2 += OFFSET;

    return `
      <g class="edge">
        <path d="M ${x1} ${y1} L ${x2} ${y2}" marker-end="url(#arrow)"/>
      </g>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ASCII → HTML Diagram</title>
<style>
  html, body { height: 100%; margin: 0; }
  body { background: #0b0d10; color: #e6edf3; font: 14px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; }
  .wrap { padding: 12px; }
  .source {
    white-space: pre;
    background: #11161b;
    border: 1px solid #202833;
    border-radius: 10px;
    padding: 12px;
    overflow: auto;
    max-height: 30vh;
    color: #9bb4d0;
    margin-bottom: 12px;
  }
  svg { width: 100%; height: 64vh; border: 1px solid #202833; border-radius: 10px; background: radial-gradient(ellipse at top, #0f141a, #0b0d10 60%); }
  .box { fill: #111922; stroke: #2b3a4a; stroke-width: 2; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.6)); }
  .label { color: #e6edf3; font-weight: 600; line-height: 1.2; }
  .edge path { fill: none; stroke: #6aa9ff; stroke-width: 2.5; }
  .edge path:hover { stroke-width: 3; }
  .legend { color: #8aa0b7; margin: 8px 0 2px; font-size: 12px; }
</style>
<div class="wrap">
  <div class="legend">Original ASCII (kept for reference)</div>
  <div class="source">${escapeHTML(text)}</div>
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#6aa9ff"></polygon>
      </marker>
    </defs>
    ${boxRects}
    ${edgeLines}
  </svg>
</div>
</html>`;
}

function escapeHTML(s) {
  return s.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}

// Parse
const boxes = detectBoxes();
const edges = detectHorizontalArrows(boxes);

// Generate HTML
const html = toHTML(boxes, edges);

// Output
if (outputFile) {
  fs.writeFileSync(outputFile, html, 'utf8');
  console.error(`Generated: ${outputFile}`);
} else {
  process.stdout.write(html);
}
