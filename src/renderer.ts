import * as d3 from 'd3';
import { formatBytes, uid } from './utils';

let d3Node: d3.Selection<d3.BaseType | SVGGElement, unknown, d3.BaseType | SVGGElement, unknown>;

const height = document.body.clientHeight - 23;
const width = document.body.clientWidth
const color = d3.scaleSequential([8, 0], d3.interpolateMagma);
// const color = d3.scaleOrdinal(d3.schemeCategory10);
const format = d3.format(",d");

const treemap = data => d3.treemap()
  // .tile(d3.treemapBinary)
  // .tile(d3.treemapSquarify)
  .size([width, height])
  .paddingOuter(3)
  .paddingTop(19)
  .paddingInner(1)
  .round(true)
  (
    d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) =>
        // -(b.data.index - a.data.index)
        b.value - a.value
      )
  )


export function showTreeMap(data: TreeNode): SVGSVGElement {
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
    .attr("viewBox", [0, 0, width, height])
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
    // .attr("filter", shadow)
    .selectAll("g")
    .data(d => d[1])
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  node.append("title")
    .text(d =>
      `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n` +
      `${formatBytes(d.value)}\n` +
      `${d.data.index}\n` +
      `${d.data.commandLine}`
    );

  node.append("rect")
    .attr("id", d => (d.nodeUid = uid("node")).id)
    .attr("fill", d => color(d.height))
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
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)
      .concat(formatBytes(d.value))
      .concat(d.data.description)
      // .concat(d.data.commandLine)
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
