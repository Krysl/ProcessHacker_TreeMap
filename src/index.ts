import * as d3 from 'd3';
import { csvParse } from 'd3-dsv';

interface TreeNode {
  name: string,
  value: number,
  description: string,
  commandLine: string,
  index: number,
  depth: number,
  children: TreeNode[]
}

function getTreeStr(tree: TreeNode): string {
  let str = ''
  if (tree.depth >= 0) {
    str += `${'··'.repeat(tree.depth)}${tree.name}\n`;
  }
  if (tree.children) {
    for (let index = 0; index < tree.children.length; index++) {
      const child = tree.children[index];
      str += getTreeStr(child);
    }
  }
  return str;
}

fetch('Process Hacker Processes.csv')
  .then(function (response) {
    return response.text();
  })
  .then(function (csvData) {
    const csvStart = csvData.indexOf('"');
    const records = csvParse(csvData.slice(csvStart));
    // console.log(records);
    let root: TreeNode = { name: '/', index: -1, depth: -1, children: [] };
    let preDepth = -1;
    let parentObj: TreeNode = root;
    let preObj: TreeNode = root;
    let path: TreeNode[] = [];
    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      let name = row.Name;
      const oldlen = name.length;
      name = name.trim();
      const depth = (oldlen - name.length) / 2;
      let pathStr = "";
      const priBytesStr = row['Private bytes'];
      let priBytes: number = 0;
      if (priBytesStr.includes('kB')) {
        priBytes = parseFloat(priBytesStr) * 1000;
      } else if (priBytesStr.includes('MB')) {
        priBytes = parseFloat(priBytesStr) * 1000 * 1000;
      } else if (priBytesStr.includes('GB')) {
        priBytes = parseFloat(priBytesStr) * 1000 * 1000 * 1000;
      }
      const newObj = {
        name: name.replace(".exe", ''),
        value: priBytes,
        description: row.Description,
        commandLine: row['Command line'],
        index: index,
        depth: depth,
        children: null
      };
      // const newObj = { name: name.replace(".exe", '') + '+...', value: 0, children: [{ name: name.replace(".exe", ''), value: priBytes, children: [] }] };

      if (depth > preDepth) {
        const move2Child = {
          name: preObj.name,
          value: preObj.value,
          description: preObj.description,
          commandLine: preObj.commandLine,
          index: preObj.index + 0.5,
          depth: preObj.depth + 1,
          children: null
        }
        preObj.name += '+...';
        preObj.value = 0;
        preObj.children = [move2Child];
        parentObj = preObj;
        parentObj.children.push(newObj);
        path.push(parentObj);
      } else if (depth == preDepth) {
        parentObj.children.push(newObj);
      } else if (depth < preDepth) {
        let upNum = preDepth - depth;
        while (upNum--)
          path.pop();
        parentObj = path[path.length - 1];
        parentObj.children.push(newObj);
      }



      preDepth = depth;
      preObj = newObj;
      for (const p of path) {
        pathStr += p.name + '/';
      }
      console.log(`${depth}: ${pathStr}-> ${name}`);
      // console.log(JSON.stringify(root, null, '\t'));
      // console.log(row);
    }
    console.log(root);
    // console.log(JSON.stringify(root, null, '\t'));
    console.log(getTreeStr(root));
    showTreeMap(root);
  });

let count = 0;

function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}
function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};
function formatBytes(bytes: number): string {
  let str: string = '';
  const GB = 1000 * 1000 * 1000;
  const MB = 1000 * 1000;
  const kB = 1000;
  if (bytes > GB) {
    str = `${bytes / GB} GB`
  } else if (bytes > MB) {
    str = `${bytes / MB} MB`
  } else if (bytes > kB) {
    str = `${bytes / kB} kB`
  } else {
    str = `${bytes} B`
  }
  return str;//.match(/^\d+(?:\.\d{0,2})?/);
}
function showTreeMap(data) {
  const format = d3.format(",d")
  const color = d3.scaleSequential([8, 0], d3.interpolateMagma)
  // const color = d3.scaleOrdinal(d3.schemeCategory10)
  const height = document.body.clientHeight
  const width = document.body.clientWidth
  const hierarchyData = d3.hierarchy(data)
    .sum(d => d.value);
  console.log(hierarchyData);
  const treemap = data => d3.treemap()
    // .tile(d3.treemapBinary)
    // .tile(d3.treemapSquarify)
    .size([width, height])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)
    .round(true)
    (
      d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) =>
          // -(b.data.index - a.data.index)
          b.value - a.value
        )
    )

  const root = treemap(data);

  // const svg = d3.create("svg")
  const svg = d3
    .select('body')
    .append('svg')
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

  const shadow = uid("shadow");

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

  return svg.node();

}
