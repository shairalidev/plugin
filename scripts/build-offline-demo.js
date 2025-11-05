const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'demo', 'offline.template.html');
const cssPath = path.join(root, 'src', 'cinemepic-player.css');
const jsPath = path.join(root, 'src', 'cinemepic-player.js');
const outputDir = path.join(root, 'demo');
const outputPath = path.join(outputDir, 'offline.html');

function build() {
  const template = fs.readFileSync(templatePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');

  const inlinedCss = css.replace(/\s+$/gm, '');
  const inlinedJs = js.replace(/\s+$/gm, '');

  const result = template
    .replace('/*__CINEMEPIC_PLAYER_CSS__*/', `\n${inlinedCss}\n`)
    .replace('/*__CINEMEPIC_PLAYER_JS__*/', `\n${inlinedJs}\n`);

  fs.writeFileSync(outputPath, result);

  console.log(`Offline demo written to ${path.relative(root, outputPath)}`);
}

try {
  build();
} catch (error) {
  console.error('Failed to build offline demo');
  console.error(error);
  process.exitCode = 1;
}
