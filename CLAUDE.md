# Project notes for Claude

## p5.js and p5.brush
- Installed as dependencies: `p5` 2.3.4 and `p5.brush` 2.2.3 (`npm install` restores them).
- p5.brush requires p5.js 2.x. Load `p5.min.js` before `p5.brush.js`.
- Browser files: `node_modules/p5/lib/p5.min.js`, `node_modules/p5.brush/dist/p5.brush.js`.
- Demo sketch: `sketches/brush-demo.html`. Open it through a local server at the repo root, since it uses relative paths to `node_modules`.
- Build (p5 build) needs `createCanvas(w, h, WEBGL)`. Use `brush.set(name, color, weight)`, `brush.line`, `brush.rect`, `brush.circle`, `brush.fill`, `brush.hatch`, and `brush.scaleBrushes(n)`.
- Reference: `node_modules/p5.brush/README.md`.
