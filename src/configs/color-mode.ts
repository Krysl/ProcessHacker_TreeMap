import * as d3 from 'd3';
import * as d3scalechromatic from 'd3-scale-chromatic';
import { showTreeMap } from '../renderer';

const colorMap: Map<string, string> = new Map<string,string>;

const ramdomByNameColor = (d: d3.HierarchyNode) => {
  if (d.parent === null) {
    d.color = "#888888";
    return d.color
  }
  const name = d.data.name.replace('+...', '');
  let c: string;
  if (colorMap.has(name)) {
    c = colorMap.get(name);
  } else {
    c = Math.random() * 360;
    colorMap.set(name, c);
  }
  return d3.hsl(
    c,
    0.65,
    0.5 + 0.05 * d.depth
  ).toString()
}

// const color = d3.scaleOrdinal(d3.schemeCategory10);

const randomByNameStr = 'random by name';
const colorMode: Map<string, Functon> = new Map<string, Functon>([
  [randomByNameStr, ramdomByNameColor],
])

for (const prop in d3scalechromatic) {
  if (prop.startsWith('interpolate')) {
    // console.log(prop)
    const fn = d3scalechromatic[prop]
    // console.log(fn)
    colorMode.set(prop, d => d3.scaleSequential([8, 0], fn)(d.height))
    colorMode.set(prop + '2', d => d3.scaleSequential([8, 0], fn)(d.depth))
  }
}

const colorModeSelect = document.getElementById('color-mode');
let cfgColorMode = localStorage.getItem('color-mode');
if (cfgColorMode === null) {
  localStorage.setItem('color-mode', randomByNameStr);
  cfgColorMode = randomByNameStr;
}
for (let [key, value] of colorMode) {
  var opt = document.createElement('option');
  opt.value = key;
  opt.innerHTML = key;
  if (key == cfgColorMode) {
    opt.selected = true;
  }
  colorModeSelect.appendChild(opt);
}
export let colorFn = colorMode.get(colorModeSelect.value);
console.log(colorModeSelect.value)

colorModeSelect.onchange = (ev) => {
  colorFn = colorMode.get(colorModeSelect.value);
  localStorage.setItem('color-mode', colorModeSelect.value);
  showTreeMap(null);
}