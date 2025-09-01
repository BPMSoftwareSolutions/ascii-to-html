const { parseASCII } = require('./parser.js');
const { layoutTemplate } = require('./layout.js');
const { renderSVG } = require('./renderer.js');

function convert(asciiText, options = {}) {
  const model = parseASCII(asciiText);
  const vm = layoutTemplate(model);
  return renderSVG(vm);
}

module.exports = { convert };

