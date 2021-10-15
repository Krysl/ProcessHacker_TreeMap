import { csvParse } from 'd3-dsv';
import { alerted_set } from './configs/data-src';

export interface TreeNode {
  name: string,
  privateBytes: number,
  workingSet: number,
  cpu: number,
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

function parseMemorySize(memSizeStr: string): number {
  let memSize = 0;
  if (memSizeStr.includes('kB')) {
    memSize = parseFloat(memSizeStr) * 1000;
  } else if (memSizeStr.includes('MB')) {
    memSize = parseFloat(memSizeStr) * 1000 * 1000;
  } else if (memSizeStr.includes('GB')) {
    memSize = parseFloat(memSizeStr) * 1000 * 1000 * 1000;
  } else if (memSizeStr === 'null') {
    memSize = 'null';
  }
  return memSize;
}
function parseCPU(cpuStr: string): number {
  let cpu = 0;
  if (cpuStr === 'null') {
    cpu = 'null';
  } else {
    cpu = parseFloat(cpuStr)
  }
  return cpu;
}

export function parseCSV(csvData: string): TreeNode {
  const csvStart = csvData.indexOf('"');
  const records = csvParse(csvData.slice(csvStart));
  const csvInfo = csvData.slice(0, csvStart - 2);
  console.log(csvInfo);
  alerted_set(false);
  // console.log(records);
  let root: TreeNode = { name: '/', description: csvInfo, index: -1, depth: -1, children: [] };
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
    const workingSetStr = row['Working set'] ?? 'null';
    const cpuStr = row['CPU'] ?? 'null';

    const newObj: TreeNode = {
      name: name.replace(".exe", ''),
      privateBytes: parseMemorySize(priBytesStr),
      workingSet: parseMemorySize(workingSetStr),
      cpu: parseCPU(cpuStr),
      description: row.Description,
      commandLine: row['Command line'],
      index: index,
      depth: depth,
      children: null
    };

    if (depth > preDepth) {
      const move2Child: TreeNode = {
        name: preObj.name,
        privateBytes: preObj.privateBytes,
        workingSet: preObj.workingSet,
        description: preObj.description,
        commandLine: preObj.commandLine,
        index: preObj.index + 0.5,
        depth: preObj.depth + 1,
        children: null
      }
      preObj.name += '+...';
      preObj.privateBytes = 0;
      preObj.workingSet = 0;
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
    // console.log(`${depth}: ${pathStr}-> ${name}`);
    // console.log(JSON.stringify(root, null, '\t'));
    // console.log(row);
  }
  console.log(root);
  // console.log(JSON.stringify(root, null, '\t'));
  // console.log(getTreeStr(root));
  return root;
}