# ASCII to HTML

Convert ASCII box-drawing sketches into clean, interactive HTML+SVG diagrams.

This tool makes it easy to take diagrams like:

```
Three-Codebase Architecture:

[ Thin-Client Host ]                     [ Plugins ]                               [ Musical Conductor ]
┌──────────────────────┐                 ┌─────────────────────────┐               ┌───────────────────────┐
│ App.tsx  PanelSlot   │   mounts via    │ Library (ui)            │   play()      │ SequenceEngine        │
│ SlotContainer        ├───────────────▶ │ LibraryComponent (sym)  ├──────────────▶│ EventBus / Logger     │
│ initConductor()      │                 │ Canvas (ui)             │               │ Correlated logs (IDs) │
└──────────────────────┘   manifest      │ CanvasComponent (sym)   │   callbacks   └───────────────────────┘
          ▲                              │ ControlPanel (ui+cfg)   │◀──────────────┐
          │                              └─────────────────────────┘   notify-ui()
          └──────────── "slots" <───────────── UI renders; side-effects live in symphonies
```

…and render them as styled HTML diagrams with boxes, labels, and arrows.

---

## Features

* ✅ Detects ASCII boxes made with `┌─┐ │ │ └─┘`.
* ✅ Extracts labels and multi-line content inside boxes.
* ✅ Converts horizontal arrows (`▶────` / `◀────`) into SVG connectors.
* ✅ Preserves the original ASCII as a reference block.
* ✅ Clean dark-mode HTML output with CSS styling.
* ⚡️ Output is a self-contained `.html` file—no runtime dependencies.

---

## Installation

Clone the repo:

```bash
git clone https://github.com/BPMSoftwareSolutions/ascii-to-html.git
cd ascii-to-html
```

Install dependencies (just Node.js required):

```bash
npm install
```

Make the CLI executable:

```bash
chmod +x ascii2html.js
```

---

## Usage

Convert an ASCII file into HTML:

```bash
node ascii2html.js input.txt > diagram.html
```

Or pipe directly:

```bash
cat input.txt | node ascii2html.js > diagram.html
```

Open `diagram.html` in your browser.

---

## Example

**Input (input.txt):**

```
┌──────────────┐      ┌───────────┐
│   Frontend   ├────▶ │ Backend   │
└──────────────┘      └───────────┘
```

**Output (diagram.html):**

* Interactive HTML page with styled boxes and arrows.
* Original ASCII shown above the rendered diagram.

---

## Roadmap

* [ ] Support vertical + elbow connectors (`│ ┐ └` paths).
* [ ] Auto-layout option (graph layout instead of ASCII coordinates).
* [ ] Export to Mermaid / PNG / SVG directly.
* [ ] Configurable color themes.

---

## Contributing

Pull requests welcome!
If you find ASCII styles that don’t parse correctly, please open an issue with an example.

---

## License

MIT © [BPM Software Solutions](https://github.com/BPMSoftwareSolutions)
