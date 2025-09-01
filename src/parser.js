// Parse ASCII into a semantic model
module.exports = { parseASCII };


function parseASCII(ascii) {
  const lines = ascii.replace(/\r\n/g, '\n').split('\n');

  // Title: take first non-empty line
  const titleLine = lines.find(l => l.trim().length > 0) || '';
  const title = titleLine.replace(/:$/, '').trim();

  // Column headers: lines with [ ... ]
  const headerIdx = lines.findIndex(l => /\[.*\]/.test(l));
  const headerLine = headerIdx >= 0 ? lines[headerIdx] : '';
  const headerMatches = [...headerLine.matchAll(/\[[^\]]+\]/g)].map(m => m[0]);
  const headers = {
    host: headerMatches[0] || '[ Thin-Client Host ]',
    plugin: headerMatches[1] || '[ Plugins ]',
    conductor: headerMatches[2] || '[ Musical Conductor ]'
  };

  // Boxes: find corners by scanning ┌ and matching to ┐ and bottom corners
  const grid = lines.map(l => l.split(''));
  const height = grid.length;
  const width = Math.max(...lines.map(l => l.length));

  const chAt = (x, y) => (y >= 0 && y < height && x >= 0 && x < (grid[y]?.length || 0)) ? grid[y][x] : ' ';
  const isH = c => c === '─' || c === '-';
  const isV = c => c === '│' || c === '|' || c === '├' || c === '┤' || c === '┼';

  const boxes = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (chAt(x,y) !== '┌') continue;
      // scan right for ┐
      let xr = x+1; while (isH(chAt(xr,y))) xr++; if (chAt(xr,y) !== '┐') continue;
      // scan down for └ (allow junctions)
      let yb = y+1; while (isV(chAt(x,yb))) yb++; if (chAt(x,yb) !== '└') continue;
      // confirm bottom-right
      if (chAt(xr,yb) !== '┘') continue;

      // extract text
      const content = [];
      for (let yi = y+1; yi < yb; yi++) {
        const row = lines[yi].slice(x+1, xr).trimEnd();
        if (row.trim().length) content.push(row.trim());
      }
      boxes.push({ x, y, xr, yb, content });
    }
  }

  // Labels near arrows (simple scan)
  const labels = [];
  const labelPatterns = [
    'mounts via', 'play()', 'callbacks', 'notify-ui()', 'manifest', '"slots"', 'slots'
  ];
  for (let y = 0; y < height; y++) {
    const line = lines[y];
    labelPatterns.forEach(txt => {
      const idx = line.indexOf(txt);
      if (idx >= 0) labels.push({ text: txt, x: idx, y });
    });
  }

  return { title, headers, boxes, labels };
}

