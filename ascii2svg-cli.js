#!/usr/bin/env node
/**
 * ASCII to SVG CLI
 * Command-line interface for the ascii2svg-converter
 */

const fs = require('fs');
const path = require('path');
const ascii2svg = require('./ascii2svg-converter.js');

function showHelp() {
  console.log(`
ASCII to SVG Converter CLI

Usage:
  node ascii2svg-cli.js <input.txt> [-o output.svg] [options]
  cat input.txt | node ascii2svg-cli.js [-o output.svg] [options]

Options:
  -o, --output <file>     Output SVG file (default: stdout)
  -w, --width <pixels>    Cell width in pixels (default: 12)
  -h, --height <pixels>   Cell height in pixels (default: 20)
  --font-size <size>      Font size (default: 12)
  --padding <pixels>      SVG padding (default: 20)
  --help                  Show this help

Examples:
  node ascii2svg-cli.js diagram.txt -o diagram.svg
  cat diagram.txt | node ascii2svg-cli.js -o diagram.svg --width 15 --height 25
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    outputFile: null,
    cellWidth: 12,
    cellHeight: 20,
    fontSize: 12,
    padding: 20
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-o' || arg === '--output') {
      options.outputFile = args[++i];
    } else if (arg === '-w' || arg === '--width') {
      options.cellWidth = parseInt(args[++i]);
    } else if (arg === '-h' || arg === '--height') {
      options.cellHeight = parseInt(args[++i]);
    } else if (arg === '--font-size') {
      options.fontSize = parseInt(args[++i]);
    } else if (arg === '--padding') {
      options.padding = parseInt(args[++i]);
    } else if (!arg.startsWith('-') && !options.inputFile) {
      options.inputFile = arg;
    }
  }

  return options;
}

function readInput(inputFile) {
  if (inputFile) {
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file '${inputFile}' not found`);
      process.exit(1);
    }
    return fs.readFileSync(inputFile, 'utf8');
  } else if (!process.stdin.isTTY) {
    return fs.readFileSync(0, 'utf8');
  } else {
    console.error('Error: No input provided');
    showHelp();
    process.exit(1);
  }
}

function main() {
  const options = parseArgs();
  
  try {
    // Read input
    const asciiText = readInput(options.inputFile);
    
    // Convert to SVG
    const converterOptions = {
      cellWidth: options.cellWidth,
      cellHeight: options.cellHeight,
      fontSize: options.fontSize,
      padding: options.padding
    };
    
    const svg = ascii2svg.convert(asciiText, converterOptions);
    
    // Output
    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, svg, 'utf8');
      console.error(`SVG generated: ${options.outputFile}`);
    } else {
      process.stdout.write(svg);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
