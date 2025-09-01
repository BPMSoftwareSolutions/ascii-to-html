const { SVG_SIZE, FONTS, COLORS, BOX_STYLES, defsBlock } = require('./style.js');
module.exports = { renderSVG };


function renderSVG(vm) {
  let svg = `<svg width="${SVG_SIZE.width}" height="${SVG_SIZE.height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += defsBlock() + "\n\n";

  // Title
  svg += `  <text x="${vm.title.x}" y="${vm.title.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.titleSize}" font-weight="bold" fill="${COLORS.title}">${escape(vm.title.text)}</text>\n`;

  // Headers
  svg += `  <text x="${vm.headers.host.x}" y="${vm.headers.host.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.headerSize}" font-weight="bold" fill="#2563EB">${escape(vm.headers.host.text)}</text>\n`;
  svg += `  <text x="${vm.headers.plugin.x}" y="${vm.headers.plugin.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.headerSize}" font-weight="bold" fill="#059669">${escape(vm.headers.plugin.text)}</text>\n`;
  svg += `  <text x="${vm.headers.conductor.x}" y="${vm.headers.conductor.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.headerSize}" font-weight="bold" fill="#7C3AED">${escape(vm.headers.conductor.text)}</text>\n\n`;

  // Boxes
  svg += boxBlock(vm.boxes.host, BOX_STYLES.host);
  svg += boxBlock(vm.boxes.plugin, BOX_STYLES.plugin);
  svg += boxBlock(vm.boxes.conductor, BOX_STYLES.conductor);

  // Arrows
  svg += `  <path d="${vm.arrows.hostToPlugin.d}" stroke="#374151" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>\n`;
  svg += `  <text x="${vm.arrowLabels.mountsVia.x}" y="${vm.arrowLabels.mountsVia.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.labelSize}" fill="#374151">mounts via</text>\n`;
  svg += `  <text x="${vm.arrowLabels.manifest.x}" y="${vm.arrowLabels.manifest.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="9" fill="#6B7280">manifest</text>\n`;
  svg += `  <path d="${vm.arrows.pluginToConductor.d}" stroke="#374151" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>\n`;
  svg += `  <text x="${vm.arrowLabels.play.x}" y="${vm.arrowLabels.play.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.labelSize}" fill="#374151">play()</text>\n`;
  svg += `  <path d="${vm.arrows.conductorToPlugin.d}" stroke="#374151" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>\n`;
  svg += `  <text x="${vm.arrowLabels.callbacks.x}" y="${vm.arrowLabels.callbacks.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.labelSize}" fill="#374151">callbacks</text>\n`;
  svg += `  <text x="${vm.arrowLabels.notifyUi.x}" y="${vm.arrowLabels.notifyUi.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="9" fill="#6B7280">notify-ui()</text>\n`;
  svg += `  <path d="${vm.arrows.slotsCurve.d}" stroke="#374151" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>\n`;
  svg += `  <text x="${vm.arrowLabels.slots.x}" y="${vm.arrowLabels.slots.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.labelSize}" fill="#374151">"slots"</text>\n`;

  // Connection circles
  vm.circles.forEach(c => {
    svg += `  <circle cx="${c.cx}" cy="${c.cy}" r="4" fill="${c.fill}"/>\n`;
  });

  // Bottom feedback loop
  svg += `  <path d="${vm.arrows.bottomCurve.d}" stroke="#6B7280" stroke-width="2" fill="none" stroke-dasharray="5,5"/>\n`;
  svg += `  <text x="450" y="280" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.legendSize}" fill="#6B7280" font-style="italic">UI renders; side-effects live in symphonies</text>\n`;

  // Legend box and text
  svg += `  <rect x="${vm.legend.rect.x}" y="${vm.legend.rect.y}" width="${vm.legend.rect.w}" height="${vm.legend.rect.h}" rx="8" ry="8" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="1"/>\n`;
  svg += `  <text x="${vm.legend.title.x}" y="${vm.legend.title.y}" text-anchor="middle" font-family="${FONTS.family}" font-size="12" font-weight="bold" fill="#1F2937">Architecture Flow Legend</text>\n`;
  svg += `  <text x="70" y="365" font-family="${FONTS.family}" font-size="11" fill="#1F2937">1. Thin-Client Host mounts plugins via manifest configuration</text>\n`;
  svg += `  <text x="70" y="385" font-family="${FONTS.family}" font-size="11" fill="#1F2937">2. Plugins call play() method on Musical Conductor to execute sequences</text>\n`;
  svg += `  <text x="70" y="405" font-family="${FONTS.family}" font-size="11" fill="#1F2937">3. Musical Conductor sends callbacks and notify-ui() responses back to plugins</text>\n`;
  svg += `  <text x="70" y="425" font-family="${FONTS.family}" font-size="11" fill="#1F2937">4. Plugins render UI through &quot;slots&quot; while side-effects are managed in symphonies</text>\n`;

  svg += '</svg>';
  return svg;
}

function boxBlock(box, style) {
  let s = '';
  s += `  <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="8" ry="8" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"/>\n`;
  box.content.forEach((line, idx) => {
    const textY = box.y + 25 + idx * 20;
    const weight = idx === 0 ? 'bold' : 'normal';
    s += `  <text x="${box.x + box.w/2}" y="${textY}" text-anchor="middle" font-family="${FONTS.family}" font-size="${FONTS.textSize}" font-weight="${weight}" fill="${style.text}">${escape(line)}</text>\n`;
  });
  return s;
}

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

