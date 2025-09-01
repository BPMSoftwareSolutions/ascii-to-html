/**
 * Unit tests for ASCII to SVG converter
 * Tests against the template SVG architecture diagram
 */

const fs = require('fs');
const path = require('path');
const ascii2svg = require('./ascii2svg-converter.js');

describe('ASCII to SVG Converter', () => {
  let templateSVG;
  let inputASCII;
  
  beforeAll(() => {
    // Load template SVG
    templateSVG = fs.readFileSync('prototypes/svg-architecture-diagram.svg', 'utf8');
    
    // Load input ASCII
    inputASCII = fs.readFileSync('example.txt', 'utf8');
  });

  describe('SVG Structure', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should generate valid SVG with correct dimensions', () => {
      expect(generatedSVG).toMatch(/<svg[^>]*width="900"[^>]*height="500"/);
      expect(generatedSVG).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    });

    test('should include arrow marker definitions', () => {
      expect(generatedSVG).toMatch(/<marker id="arrowhead"/);
      expect(generatedSVG).toMatch(/markerWidth="12"[^>]*markerHeight="8"/);
      expect(generatedSVG).toMatch(/<path d="M0,0 L0,8 L12,4 z" fill="#374151"\/>/);
    });

    test('should include gradient definitions for boxes', () => {
      expect(generatedSVG).toMatch(/<linearGradient id="hostGradient"/);
      expect(generatedSVG).toMatch(/<linearGradient id="pluginGradient"/);
      expect(generatedSVG).toMatch(/<linearGradient id="conductorGradient"/);
    });
  });

  describe('Title and Headers', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should include main title', () => {
      expect(generatedSVG).toMatch(/<text[^>]*x="450"[^>]*y="30"[^>]*>Three-Codebase Architecture<\/text>/);
    });

    test('should include column headers', () => {
      expect(generatedSVG).toMatch(/\[ Thin-Client Host \]/);
      expect(generatedSVG).toMatch(/\[ Plugins \]/);
      expect(generatedSVG).toMatch(/\[ Musical Conductor \]/);
    });
  });

  describe('Box Generation', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should generate three main boxes with correct positions', () => {
      // Thin-Client Host box
      expect(generatedSVG).toMatch(/<rect[^>]*x="50"[^>]*y="90"[^>]*width="200"[^>]*height="120"/);
      
      // Plugins box
      expect(generatedSVG).toMatch(/<rect[^>]*x="350"[^>]*y="90"[^>]*width="200"[^>]*height="140"/);
      
      // Musical Conductor box
      expect(generatedSVG).toMatch(/<rect[^>]*x="650"[^>]*y="90"[^>]*width="200"[^>]*height="120"/);
    });

    test('should apply correct gradients to boxes', () => {
      expect(generatedSVG).toMatch(/fill="url\(#hostGradient\)"/);
      expect(generatedSVG).toMatch(/fill="url\(#pluginGradient\)"/);
      expect(generatedSVG).toMatch(/fill="url\(#conductorGradient\)"/);
    });

    test('should include box content text', () => {
      // Host box content
      expect(generatedSVG).toMatch(/App\.tsx\s+PanelSlot/);
      expect(generatedSVG).toMatch(/SlotContainer/);
      expect(generatedSVG).toMatch(/initConductor\(\)/);
      
      // Plugins box content
      expect(generatedSVG).toMatch(/Library \(ui\)/);
      expect(generatedSVG).toMatch(/LibraryComponent \(sym\)/);
      expect(generatedSVG).toMatch(/Canvas \(ui\)/);
      expect(generatedSVG).toMatch(/CanvasComponent \(sym\)/);
      expect(generatedSVG).toMatch(/ControlPanel \(ui\+cfg\)/);
      
      // Conductor box content
      expect(generatedSVG).toMatch(/SequenceEngine/);
      expect(generatedSVG).toMatch(/EventBus \/ Logger/);
      expect(generatedSVG).toMatch(/Correlated logs \(IDs\)/);
    });
  });

  describe('Arrow Generation', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should generate flow arrows with correct paths', () => {
      // Host to Plugins
      expect(generatedSVG).toMatch(/<path d="M 250 130 L 340 130"/);
      
      // Plugins to Conductor
      expect(generatedSVG).toMatch(/<path d="M 550 140 L 640 140"/);
      
      // Conductor to Plugins (callbacks)
      expect(generatedSVG).toMatch(/<path d="M 650 170 L 560 170"/);
    });

    test('should include arrow labels', () => {
      expect(generatedSVG).toMatch(/mounts via/);
      expect(generatedSVG).toMatch(/manifest/);
      expect(generatedSVG).toMatch(/play\(\)/);
      expect(generatedSVG).toMatch(/callbacks/);
      expect(generatedSVG).toMatch(/notify-ui\(\)/);
    });

    test('should include curved arrow for slots feedback', () => {
      expect(generatedSVG).toMatch(/<path d="M 350 200 Q 300 240 250 200"/);
      expect(generatedSVG).toMatch(/"slots"/);
    });
  });

  describe('Connection Indicators', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should include connection circles', () => {
      expect(generatedSVG).toMatch(/<circle[^>]*cx="250"[^>]*cy="130"[^>]*r="4"/);
      expect(generatedSVG).toMatch(/<circle[^>]*cx="340"[^>]*cy="130"[^>]*r="4"/);
      expect(generatedSVG).toMatch(/<circle[^>]*cx="550"[^>]*cy="140"[^>]*r="4"/);
      expect(generatedSVG).toMatch(/<circle[^>]*cx="640"[^>]*cy="140"[^>]*r="4"/);
    });
  });

  describe('Legend and Documentation', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should include legend box', () => {
      expect(generatedSVG).toMatch(/<rect[^>]*x="50"[^>]*y="320"[^>]*width="800"[^>]*height="120"/);
      expect(generatedSVG).toMatch(/Architecture Flow Legend/);
    });

    test('should include legend explanations', () => {
      expect(generatedSVG).toMatch(/Thin-Client Host mounts plugins via manifest/);
      expect(generatedSVG).toMatch(/Plugins call play\(\) method on Musical Conductor/);
      expect(generatedSVG).toMatch(/Musical Conductor sends callbacks/);
      expect(generatedSVG).toMatch(/side-effects are managed in symphonies/);
    });
  });

  describe('Bottom Feedback Loop', () => {
    let generatedSVG;
    
    beforeAll(() => {
      generatedSVG = ascii2svg.convert(inputASCII);
    });

    test('should include dashed feedback loop', () => {
      expect(generatedSVG).toMatch(/<path d="M 150 210 Q 150 260 450 260 Q 750 260 750 210"/);
      expect(generatedSVG).toMatch(/stroke-dasharray="5,5"/);
      expect(generatedSVG).toMatch(/UI renders; side-effects live in symphonies/);
    });
  });
});
