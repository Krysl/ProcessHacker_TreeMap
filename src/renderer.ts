import * as d3 from 'd3';
import { formatBytes, uid } from './utils';
import * as d3scalechromatic from 'd3-scale-chromatic';

let d3Node: d3.Selection<d3.BaseType | SVGGElement, unknown, d3.BaseType | SVGGElement, unknown>;

const height = () => document.body.clientHeight - document.getElementById('titlebar').clientHeight;
const width = () => document.body.clientWidth
// const color = d3.scaleOrdinal(d3.schemeCategory10);

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
const randomByNameStr = 'random by name';
const colorMode: Map<string, Functon> = new Map<string, Functon>([
  [randomByNameStr, ramdomByNameColor],
])

for (const prop in d3scalechromatic) {
  if (prop.startsWith('interpolate')) {
    console.log(prop)
    const fn = d3scalechromatic[prop]
    console.log(fn)
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
let colorFn = colorMode.get(colorModeSelect.value);
console.log(colorModeSelect.value)

colorModeSelect.onchange = (ev) => {
  colorFn = colorMode.get(colorModeSelect.value);
  localStorage.setItem('color-mode', colorModeSelect.value);
  showTreeMap(null);
}

const sortBySizeCheckBox = document.getElementById('sort-by-size');
let cfgSortBySize = localStorage.getItem('sort-by-size');
cfgSortBySize = cfgSortBySize == 'true' ? true : false;
if (cfgSortBySize === null) {
  localStorage.setItem('sort-by-size', true);
  cfgSortBySize = true;
}
sortBySizeCheckBox.checked = cfgSortBySize;
sortBySizeCheckBox.onchange = (ev) => {
  localStorage.setItem('sort-by-size', sortBySizeCheckBox.checked);
  cfgSortBySize = sortBySizeCheckBox.checked;
  showTreeMap(null);
}


document.body.onresize = () => showTreeMap(null);

const format = d3.format(",d");

const treemap = data => d3.treemap()
  // .tile(d3.treemapBinary)
  // .tile(d3.treemapSquarify)
  .size([width(), height()])
  .paddingOuter(3)
  .paddingTop(19)
  .paddingInner(1)
  .round(true)
  (
    cfgSortBySize ?
      d3
        .hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) =>
          // -(b.data.index - a.data.index)
          b.value - a.value
        ) :
      d3
        .hierarchy(data)
        .sum(d => d.value)
  )

let preData: TreeNode;
export function showTreeMap(data: TreeNode | null): SVGSVGElement {
  if (data === null) {
    data = preData;
  } else
    preData = data
  const root = treemap(data);

  const shadow = uid("shadow");

  const presvg = d3
    .select('#d3-output-svg');
  if (presvg) {
    presvg.remove();
  }

  const svg = d3
    .select('#d3-output')
    .append('svg')
    .attr("id", 'd3-output-svg')
    .attr("viewBox", [0, 0, width(), height()])
    .style("font", "10px sans-serif");
  svg.append("filter")
    .attr("id", shadow.id)
    .append("feDropShadow")
    .attr("flood-opacity", 0.3)
    .attr("dx", 0)
    .attr("stdDeviation", 3);

  const node = svg.selectAll("g")
    .data(d3.group(root, d => d.depth))
    .join("g")
    .attr("filter", shadow)
    .selectAll("g")
    .data(d => d[1])
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  node.append("title")
    .text(d =>
      `${d.ancestors().reverse().map(
        (d, index) => (index == 0) ? null : (
          '\n' +
          '\t'.repeat(index - 1) +
          (index > 1 ? '↪ ' : '') +
          d.data.name.replace('+...', '')
        )
      ).join("")}\n` +
      `memory:\n\t${formatBytes(d.value)}\n` +
      // `index:\n\t${d.data.index}\n` +
      `cmd:\n\t${d.data.commandLine?.replaceAll(' -', '\n\t\t-')}`
    );
  node.append("rect")
    .attr("id", d => (d.nodeUid = uid("node")).id)
    .attr("fill", d => colorFn(d))
    // .attr("fill", d => color(d.data.name))
    // .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
    // .attr("fill-opacity", (d, i, nodes) => 0.7)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

  node.append("clipPath")
    .attr("id", d => (d.clipUid = uid("clip")).id)
    .append("use")
    .attr("xlink:href", d => d.nodeUid.href);

  node.append("text")
    .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => {
      let info = (d.data.name as string).split(/(?=[A-Z][^A-Z ])/g);
      // let info = (d.data.name as string).split(/[ .]/g);
      // if (d.height != 0)
      //   info = ['[', ...info, ']='];
      info = info
        .concat(formatBytes(d.value))
        .concat(d.data.description)
      // .concat(d.data.commandLine)}
      return info;
    }
    )
    .join("tspan")
    .text(d => d);

  node.filter(d => d.children).selectAll("tspan")
    .attr("dx", 3)
    .attr("y", 13);

  node.filter(d => !d.children).selectAll("tspan")
    .attr("x", 3)
    .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i}em`);

  d3Node = svg.node();
  return svg.node();
}
