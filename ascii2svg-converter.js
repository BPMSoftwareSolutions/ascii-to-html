/**
 * ASCII to SVG Converter - Robust Version
 * Specifically designed for architecture diagrams with Unicode box characters
 */

class ASCII2SVG {
  constructor(options = {}) {
    this.options = {
      cellWidth: 8,
      cellHeight: 20,
      fontSize: 12,
      fontFamily: 'monospace',
      padding: 40,
      boxPadding: 16,
      colors: {
        text: '#374151',
        border: '#6B7280',
        arrow: '#374151',
        connection: '#10B981'
      },
      boxStyles: [
        { fill: '#DBEAFE', stroke: '#3B82F6', textColor: '#1E40AF' },
        { fill: '#D1FAE5', stroke: '#10B981', textColor: '#047857' },
        { fill: '#E9D5FF', stroke: '#8B5CF6', textColor: '#5B21B6' },
        { fill: '#FEF3C7', stroke: '#F59E0B', textColor: '#92400E' },
        { fill: '#FECACA', stroke: '#EF4444', textColor: '#991B1B' }
      ],
      ...options
    };
    
    this.grid = [];
    this.boxes = [];
    this.arrows = [];
    this.labels = [];
    this.width = 0;
    this.height = 0;
  }

  /**
   * Convert ASCII text to SVG
   */
  convert(asciiText) {
    console.log('Input ASCII:', asciiText.substring(0, 200)); // Debug
    
    this.parseASCII(asciiText);
    console.log(`Grid dimensions: ${this.width} x ${this.height}`); // Debug
    
    this.detectBoxesAdvanced();
    console.log('Detected boxes:', this.boxes.length); // Debug
    
    this.detectArrowsSimple();
    this.detectLabels();
    
    return this.generateSVG();
  }

  /**
   * Parse ASCII text into a 2D grid
   */
  parseASCII(text) {
    // Clean up different line endings
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) return;
    
    const maxWidth = Math.max(...lines.map(line => line.length));
    
    this.grid = lines.map(line => {
      return line.padEnd(maxWidth, ' ').split('');
    });
    
    this.width = maxWidth;
    this.height = lines.length;
    
    console.log('First few lines:');
    for (let i = 0; i < Math.min(5, this.height); i++) {
      console.log(`Row ${i}: "${this.grid[i].join('')}"`);
    }
  }

  /**
   * Advanced box detection that looks for rectangular patterns
   */
  detectBoxesAdvanced() {
    // Find all potential top-left corners
    const corners = [];
    
    for (let y = 0; y < this.height - 2; y++) {
      for (let x = 0; x < this.width - 2; x++) {
        if (this.couldBeTopLeft(x, y)) {
          corners.push({x, y});
        }
      }
    }
    
    console.log('Found potential corners:', corners.length);
    
    // For each corner, try to find a complete box
    for (const corner of corners) {
      const box = this.findBoxFromCorner(corner.x, corner.y);
      if (box && box.width >= 10 && box.height >= 3) {
        console.log(`Found box at (${box.x}, ${box.y}) size ${box.width}x${box.height}`);
        this.boxes.push(box);
      }
    }
  }

  /**
   * Check if a position could be a top-left corner
   */
  couldBeTopLeft(x, y) {
    const char = this.grid[y][x];
    
    // Check for various top-left corner characters
    const topLeftChars = ['┌', '┏', '╔', '╭', '+', '┼'];
    if (!topLeftChars.includes(char)) return false;
    
    // Look for horizontal line to the right
    let hasHorizontal = false;
    for (let i = x + 1; i < Math.min(x + 5, this.width); i++) {
      const rightChar = this.grid[y][i];
      if (['─', '━', '═', '-', '┬', '┼'].includes(rightChar)) {
        hasHorizontal = true;
        break;
      }
    }
    
    // Look for vertical line downward
    let hasVertical = false;
    for (let i = y + 1; i < Math.min(y + 5, this.height); i++) {
      const downChar = this.grid[i][x];
      if (['│', '┃', '║', '|', '├', '┼'].includes(downChar)) {
        hasVertical = true;
        break;
      }
    }
    
    return hasHorizontal && hasVertical;
  }

  /**
   * Find complete box starting from a corner
   */
  findBoxFromCorner(startX, startY) {
    // Scan right to find the end of top border
    let endX = startX;
    for (let x = startX; x < this.width; x++) {
      const char = this.grid[startY][x];
      if (['─', '━', '═', '-', '┌', '┬', '┐', '┼', '+'].includes(char)) {
        endX = x;
      } else {
        break;
      }
    }
    
    // Scan down to find the end of left border
    let endY = startY;
    for (let y = startY; y < this.height; y++) {
      const char = this.grid[y][startX];
      if (['│', '┃', '║', '|', '┌', '├', '└', '┼', '+'].includes(char)) {
        endY = y;
      } else {
        break;
      }
    }
    
    const width = endX - startX + 1;
    const height = endY - startY + 1;
    
    // Validate this is actually a complete rectangle
    if (width < 5 || height < 3) return null;
    
    // Check if bottom-right corner exists
    if (endX < this.width && endY < this.height) {
      const bottomRightChar = this.grid[endY][endX];
      if (!['┘', '┛', '╝', '╯', '+', '┼'].includes(bottomRightChar)) {
        // Try to find the actual bottom-right
        let found = false;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const newY = endY + dy;
            const newX = endX + dx;
            if (newY >= 0 && newY < this.height && newX >= 0 && newX < this.width) {
              const testChar = this.grid[newY][newX];
              if (['┘', '┛', '╝', '╯', '+', '┼'].includes(testChar)) {
                endX = newX;
                endY = newY;
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
      }
    }
    
    // Extract content
    const content = [];
    for (let y = startY + 1; y < endY; y++) {
      let line = '';
      for (let x = startX + 1; x < endX; x++) {
        if (x < this.width && y < this.height) {
          line += this.grid[y][x];
        }
      }
      const trimmed = line.trim();
      if (trimmed && !this.isBorderChar(trimmed)) {
        content.push(trimmed);
      }
    }
    
    return {
      x: startX,
      y: startY,
      width: endX - startX + 1,
      height: endY - startY + 1,
      content: content,
      styleIndex: this.boxes.length % this.options.boxStyles.length
    };
  }

  /**
   * Check if a string is just border characters
   */
  isBorderChar(str) {
    const borderChars = /^[─━═│┃║┌┏╔┐┓╗└┗╚┘┛╝├┣╠┤┫╣┬┳╦┴┻╩┼╋╬\-\|\+\s]*$/;
    return borderChars.test(str);
  }

  /**
   * Simple arrow detection based on directional characters
   */
  detectArrowsSimple() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width - 1; x++) {
        const char = this.grid[y][x];
        
        // Look for arrow characters
        if (['▶', '►', '>', '→', '⇒', '⟶'].includes(char)) {
          // Try to trace back to find the start of the arrow
          let startX = x;
          for (let backX = x - 1; backX >= 0; backX--) {
            const backChar = this.grid[y][backX];
            if (['─', '-', '═'].includes(backChar)) {
              startX = backX;
            } else {
              break;
            }
          }
          
          if (startX < x) {
            this.arrows.push({
              startX: startX,
              startY: y,
              endX: x + 1,
              endY: y,
              type: 'horizontal'
            });
          }
        }
      }
    }
    
    console.log('Found arrows:', this.arrows.length);
  }

  /**
   * Detect connection labels
   */
  detectLabels() {
    const patterns = [
      { regex: /mounts?\s+via/gi, priority: 1 },
      { regex: /play\s*\(\s*\)/gi, priority: 1 },
      { regex: /callbacks?/gi, priority: 1 },
      { regex: /notify[_-]?ui\s*\(\s*\)/gi, priority: 1 },
      { regex: /manifest/gi, priority: 2 },
      { regex: /"?slots?"?/gi, priority: 2 },
      { regex: /side[_-]?effects/gi, priority: 2 }
    ];
    
    for (let y = 0; y < this.height; y++) {
      const line = this.grid[y].join('');
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          this.labels.push({
            text: match[0].trim(),
            x: match.index,
            y: y,
            priority: pattern.priority
          });
        }
      });
    }
    
    console.log('Found labels:', this.labels.length);
  }

  /**
   * Generate SVG from parsed elements
   */
  generateSVG() {
    const svgWidth = Math.max(800, this.width * this.options.cellWidth + 2 * this.options.padding);
    const svgHeight = Math.max(400, this.height * this.options.cellHeight + 2 * this.options.padding + 60);
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;
    
    // Add definitions
    svg += this.generateDefs();
    
    // Add title
    svg += `  <text x="${svgWidth/2}" y="30" text-anchor="middle" font-family="${this.options.fontFamily}" font-size="${this.options.fontSize + 4}" font-weight="bold" fill="${this.options.colors.text}">Three-Codebase Architecture</text>\n`;
    
    // Add boxes
    this.boxes.forEach(box => {
      svg += this.generateBox(box);
    });
    
    // Add arrows
    this.arrows.forEach(arrow => {
      svg += this.generateArrow(arrow);
    });
    
    // Add labels
    this.labels.forEach(label => {
      svg += this.generateLabel(label);
    });
    
    // If no boxes were found, add debug info
    if (this.boxes.length === 0) {
      svg += `  <text x="${svgWidth/2}" y="100" text-anchor="middle" font-family="${this.options.fontFamily}" font-size="14" fill="red">No boxes detected - check ASCII format</text>\n`;
      
      // Show first few characters for debugging
      for (let y = 0; y < Math.min(10, this.height); y++) {
        const line = this.grid[y].join('').substring(0, 50);
        svg += `  <text x="20" y="${140 + y * 16}" font-family="${this.options.fontFamily}" font-size="10" fill="#666">${this.escapeXML(line)}</text>\n`;
      }
    }
    
    svg += '</svg>';
    
    return svg;
  }

  /**
   * Generate SVG definitions
   */
  generateDefs() {
    return `  <defs>
    <marker id="arrowhead" markerWidth="12" markerHeight="8" 
            refX="10" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,8 L12,4 z" fill="${this.options.colors.arrow}"/>
    </marker>
  </defs>
`;
  }

  /**
   * Generate SVG for a box
   */
  generateBox(box) {
    const x = box.x * this.options.cellWidth + this.options.padding;
    const y = box.y * this.options.cellHeight + this.options.padding + 50;
    const width = box.width * this.options.cellWidth - this.options.boxPadding;
    const height = box.height * this.options.cellHeight - this.options.boxPadding;
    
    const style = this.options.boxStyles[box.styleIndex];
    
    let svg = `  <rect x="${x}" y="${y}" width="${width}" height="${height}" 
           rx="8" ry="8" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"/>\n`;
    
    // Add text content
    if (box.content && box.content.length > 0) {
      const lineHeight = 18;
      const startY = y + 25;
      
      box.content.forEach((line, index) => {
        if (line.trim()) {
          const textY = startY + (index * lineHeight);
          const textX = x + width / 2;
          const weight = index === 0 ? 'bold' : 'normal';
          
          svg += `  <text x="${textX}" y="${textY}" text-anchor="middle" 
                 font-family="${this.options.fontFamily}" font-size="${this.options.fontSize}" 
                 font-weight="${weight}" fill="${style.textColor}">${this.escapeXML(line)}</text>\n`;
        }
      });
    }
    
    return svg;
  }

  /**
   * Generate SVG for an arrow
   */
  generateArrow(arrow) {
    const x1 = arrow.startX * this.options.cellWidth + this.options.padding;
    const y1 = arrow.startY * this.options.cellHeight + this.options.padding + 50;
    const x2 = arrow.endX * this.options.cellWidth + this.options.padding;
    const y2 = arrow.endY * this.options.cellHeight + this.options.padding + 50;
    
    return `  <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${this.options.colors.arrow}" 
           stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>\n`;
  }

  /**
   * Generate SVG for a label
   */
  generateLabel(label) {
    const x = label.x * this.options.cellWidth + this.options.padding;
    const y = label.y * this.options.cellHeight + this.options.padding + 50;
    
    return `  <text x="${x}" y="${y}" font-family="${this.options.fontFamily}" 
           font-size="${this.options.fontSize - 1}" fill="${this.options.colors.text}">${this.escapeXML(label.text)}</text>\n`;
  }

  /**
   * Escape XML special characters
   */
  escapeXML(text) {
    if (!text) return '';
    return text.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}

// Export and usage functions remain the same
const ascii2svg = {
  convert: function(asciiText, options = {}) {
    const converter = new ASCII2SVG(options);
    return converter.convert(asciiText);
  },

  saveToFile: function(asciiText, filename, options = {}) {
    const svg = this.convert(asciiText, options);
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      fs.writeFileSync(filename, svg);
      console.log(`SVG saved to ${filename}`);
    } else {
      console.log('File saving not available in browser environment');
      return svg;
    }
  },

  createDownload: function(asciiText, filename = 'diagram.svg', options = {}) {
    const svg = this.convert(asciiText, options);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  },

  // Debug helper
  debug: function(asciiText) {
    const converter = new ASCII2SVG();
    return converter.convert(asciiText);
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ascii2svg;
} else if (typeof window !== 'undefined') {
  window.ascii2svg = ascii2svg;
}