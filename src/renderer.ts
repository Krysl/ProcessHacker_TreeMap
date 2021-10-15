import { TreeNode } from './parse_csv';
import { cfgSortBySize } from './configs/sort-by-size';
import { colorFn } from './configs/color-mode';
import * as d3 from 'd3';
import { formatBytes, uid } from './utils';
import { getValue, dataSourcePrivatebytes, dataSourceWorkingset, dataSourceCPU, cfgDataSource } from './configs/data-src';

let d3Node: d3.Selection<d3.BaseType | SVGGElement, unknown, d3.BaseType | SVGGElement, unknown>;

const height = () => document.body.clientHeight - document.getElementById('titlebar').clientHeight;
const width = () => document.body.clientWidth
document.body.onresize = () => showTreeMap(null);

const format = d3.format(",d");

function treemap(data: TreeNode) {
  let hierarchyData = d3
    .hierarchy(data)
    // .sum(d => getValue(d.data))
    .eachAfter(d => {
      d.value = getValue(d.data)
      // console.log(`T${"\t".repeat(d.depth)}${d.data.name}: ${d.value}`)
    });
  if (cfgSortBySize) {
    hierarchyData = hierarchyData.sort((a, b) =>
      // -(b.data.index - a.data.index)
      getValue(b.data) - getValue(a.data)
    )
  }
  console.log(hierarchyData);
  return d3.treemap()
    // .tile(d3.treemapBinary)
    // .tile(d3.treemapSquarify)
    .size([width(), height()])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)
    .round(true)
    (hierarchyData);
}

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
      `${dataSourcePrivatebytes}:\n\t${formatBytes(d.data.privateBytes)}\n` +
      `${dataSourceWorkingset}:\n\t${formatBytes(d.data.workingSet)}\n` +
      `${dataSourceCPU}:\n\t${d.data.cpu}\n` +
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
      if (cfgDataSource === dataSourcePrivatebytes || cfgDataSource === dataSourceWorkingset)
        info = info
          .concat(formatBytes(d.value))
      if (cfgDataSource === dataSourceCPU)
        info = info
          .concat(d.value)
      info = info
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
