import * as d3 from 'd3';
import * as d3scalechromatic from 'd3-scale-chromatic';

import { TreeNode } from '../parse-csv';
import { showTreeMap } from '../renderer';

const colorMap = new Map<string, number>();

export function isIdle(name: string) {
  return /^System Idle Process(\+...)?$/.test(name);
}

const ramdomByNameColor = (d: d3.HierarchyNode<TreeNode>) => {
  if (d.parent === null) {
    d.data.color = '#888888';
    return d.data.color;
  }
  const name = d.data.name.replace('+...', '');
  let c: number;
  if (colorMap.has(name)) {
    c = colorMap.get(name) ?? 0;
  } else {
    c = Math.random() * 360;
    colorMap.set(name, c);
  }
  return d3.hsl(c, 0.65, 0.5 + 0.05 * d.depth).toString();
};

// const color = d3.scaleOrdinal(d3.schemeCategory10);

const randomByNameString = 'random by name';
const colorMode = new Map<string, typeof ramdomByNameColor>([[randomByNameString, ramdomByNameColor]]);

for (const property in d3scalechromatic) {
  if (property.startsWith('interpolate')) {
    // console.log(prop)
    const function_ = d3scalechromatic[property] as typeof d3scalechromatic.interpolateBrBG;
    // console.log(fn)
    colorMode.set(property, (d) => d3.scaleSequential([8, 0], function_)(d.height));
    colorMode.set(property + '2', (d) => d3.scaleSequential([8, 0], function_)(d.depth));
  }
}

const colorModeSelect = document.querySelector('#color-mode') as HTMLSelectElement;
let cfgColorMode = localStorage.getItem('color-mode');
if (cfgColorMode === null) {
  localStorage.setItem('color-mode', randomByNameString);
  cfgColorMode = randomByNameString;
}
for (const [key, _value] of colorMode) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.innerHTML = key;
  if (key === cfgColorMode) {
    opt.selected = true;
  }
  colorModeSelect.append(opt);
}
export let colorFunction = colorMode.get(colorModeSelect.value) ?? ramdomByNameColor;
console.log(colorModeSelect.value);

colorModeSelect.addEventListener('change', (_event) => {
  colorFunction = colorMode.get(colorModeSelect.value) ?? ramdomByNameColor;
  localStorage.setItem('color-mode', colorModeSelect.value);
  showTreeMap();
});
