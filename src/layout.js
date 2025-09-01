const { TEMPLATE_POS } = require('./style.js');
module.exports = { layoutTemplate };


// Map the parsed model to fixed template coordinates (data-driven labels)
function layoutTemplate(model) {
  // Sort boxes by x to map to host, plugin, conductor
  const sorted = [...model.boxes].sort((a,b)=>a.x-b.x);
  const host = sorted[0] || { content: [] };
  const plugin = sorted[1] || { content: [] };
  const conductor = sorted[2] || { content: [] };

  return {
    title: { text: model.title || 'Three-Codebase Architecture', ...TEMPLATE_POS.title },
    headers: {
      host: { text: model.headers.host, ...TEMPLATE_POS.headers.host },
      plugin: { text: model.headers.plugin, ...TEMPLATE_POS.headers.plugin },
      conductor: { text: model.headers.conductor, ...TEMPLATE_POS.headers.conductor }
    },
    boxes: {
      host: { content: host.content, ...TEMPLATE_POS.boxes.host },
      plugin: { content: plugin.content, ...TEMPLATE_POS.boxes.plugin },
      conductor: { content: conductor.content, ...TEMPLATE_POS.boxes.conductor }
    },
    arrows: TEMPLATE_POS.arrows,
    arrowLabels: TEMPLATE_POS.arrowLabels,
    circles: TEMPLATE_POS.circles,
    legend: TEMPLATE_POS.legend
  };
}

