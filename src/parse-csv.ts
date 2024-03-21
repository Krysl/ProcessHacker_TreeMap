import { DSVRowArray, DSVRowString, csvParse, tsvParse } from 'd3-dsv';

import { Id } from './utils';
import { cfgHideIdle } from './configs/hide-idle';

export interface TreeNode {
  name: string;
  privateBytes: number;
  workingSet: number;
  cpu: number;
  description: string;
  commandLine: string;
  index: number;
  depth: number;
  children?: TreeNode[];
  color?: string;
  nodeUid?: Id;
  clipUid?: Id;
}

export type GetValue = (data: TreeNode) => number;
export type SetValue = (data: TreeNode, value: number) => void;

function parseMemorySize(memSizeString: string): number {
  let memSize: number | string = 0;
  if (!isProcHacker) {
    memSizeString = memSizeString.replace(',', '');
  }

  if (memSizeString.includes('kB') || !isProcHacker) {
    memSize = Number.parseFloat(memSizeString) * 1000;
  } else if (memSizeString.includes('MB')) {
    memSize = Number.parseFloat(memSizeString) * 1000 * 1000;
  } else if (memSizeString.includes('GB')) {
    memSize = Number.parseFloat(memSizeString) * 1000 * 1000 * 1000;
  } else if (memSizeString === 'null') {
    memSize = 0;
  }
  return memSize;
}
function parseCPU(cpuString: string): number {
  let cpu = 0;
  if (!isProcHacker) {
    cpuString = cpuString.replace('< ', '').replace('Suspended', '');
  }
  if (cpuString === 'null') {
    cpu = 0;
  } else if (cpuString === '') {
    cpu = 0;
  } else {
    cpu = Number.parseFloat(cpuString);
  }
  return cpu;
}
const procHackerCols = ['Name', 'Private bytes', 'Working set', 'CPU', 'Command line', 'Description'] as const;
const procExplorerCols = ['Process', 'Private Bytes', 'Working Set', 'CPU', 'Command Line', 'Description'] as const;
type ProcHackerCols = (typeof procHackerCols)[number];
type ProcExplorerCols = (typeof procExplorerCols)[number];

/* colume name translate for `procHacker => procExplorer` */
const columnMapping = (function () {
  const map = new Map<ProcHackerCols, ProcExplorerCols>();
  for (const [index, procHackerCol] of procHackerCols.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    map.set(procHackerCol, procExplorerCols[index]!);
  }
  return map;
})();

let isProcHacker = true;
function col(row: DSVRowString<ProcHackerCols | ProcExplorerCols>, cols: ProcHackerCols): string {
  const name = isProcHacker ? cols : (columnMapping.get(cols) as ProcExplorerCols);
  return row[name];
}

export function parseCSV(csvData: string): TreeNode {
  csvData = csvData.trim();
  isProcHacker = csvData.startsWith('System Informer') || csvData.startsWith('Process Hacker');
  let records: DSVRowArray<ProcHackerCols | ProcExplorerCols>;
  let csvInfo: string;

  if (isProcHacker) {
    const csvStart = csvData.indexOf('"');
    records = csvParse(csvData.slice(csvStart));
    csvInfo = csvData.slice(0, csvStart - 2);
  } else {
    const tsvEnd = csvData.search(/(\r?\n){2}/);
    csvInfo = 'From process Explorer';
    records = tsvParse(csvData.slice(0, tsvEnd));
  }
  console.log(csvInfo);
  // console.log(records);
  const root: TreeNode = {
    name: '/',
    privateBytes: 0,
    workingSet: 0,
    cpu: 0,
    description: csvInfo,
    commandLine: '',
    index: -1,
    depth: -1,
  };
  let preDepth = -1;
  let parentObject: TreeNode = root;
  let preObject: TreeNode = root;
  const path: TreeNode[] = [];
  for (const [index, row] of records.entries()) {
    let name = col(row, 'Name');
    // if (name == "System Idle Process")
    //   continue;
    const oldlen = name.length;
    name = name.trim();
    const depth = (oldlen - name.length) / (isProcHacker ? 2 : 1);
    // let pathString = '';
    const priBytesString = col(row, 'Private bytes');
    const workingSetString = col(row, 'Working set') ?? 'null';
    const cpuString = col(row, 'CPU') ?? 'null';

    const newObject: TreeNode = {
      name: name.replace('.exe', ''),
      privateBytes: parseMemorySize(priBytesString),
      workingSet: parseMemorySize(workingSetString),
      cpu: parseCPU(cpuString),
      description: col(row, 'Description'),
      commandLine: col(row, 'Command line'),
      index: index,
      depth: depth,
    };

    if (depth > preDepth) {
      const move2Child: TreeNode = {
        name: preObject.name,
        privateBytes: preObject.privateBytes,
        workingSet: preObject.workingSet,
        cpu: preObject.cpu,
        description: preObject.description,
        commandLine: preObject.commandLine,
        index: preObject.index + 0.5,
        depth: preObject.depth + 1,
      };
      preObject.name += '+...';
      preObject.privateBytes = 0;
      preObject.workingSet = 0;
      preObject.children = [move2Child];
      parentObject = preObject;
      parentObject.children ??= [];
      parentObject.children.push(newObject);
      path.push(parentObject);
    } else if (depth === preDepth) {
      parentObject.children ??= [];
      parentObject.children.push(newObject);
    } else if (depth < preDepth) {
      let upNumber = preDepth - depth;
      while (upNumber--) {
        path.pop();
      }
      parentObject = path.at(-1) ?? root;
      parentObject.children ??= [];
      parentObject.children.push(newObject);
    }

    preDepth = depth;
    preObject = newObject;
    // for (const p of path) {
    //   pathString += p.name + '/';
    // }
    // console.log(`${depth}: ${pathStr}-> ${name}`);
    // console.log(JSON.stringify(root, null, '\t'));
    // console.log(row);
  }
  // if (cfgHideIdle && root.children) {
  //   const index = root.children.findIndex(
  //     (node) => node.name === 'System Idle Process' || node.name === 'System Idle Process' + '+...'
  //   );
  //   if (index > -1) {
  //     root.children.splice(index, 1);
  //   }
  // }
  console.log(root);
  // console.log(JSON.stringify(root, null, '\t'));
  // console.log(getTreeStr(root));

  return root;
}

export function calculateSum(data: TreeNode, getValue: GetValue, setValue: SetValue): number {
  let sum = 0;
  // console.log("\t".repeat(Math.ceil(data.depth) + 1) + data.name)
  sum = data.children
    ? data.children
        .map((child) => calculateSum(child, getValue, setValue))
        .reduce((previous, current) => previous + current)
    : getValue(data);
  setValue(data, sum);
  return sum;
}

export function calculate(root: TreeNode) {
  calculateSum(
    root,
    (d) => d.privateBytes,
    (d, v) => (d.privateBytes = v)
  );
  calculateSum(
    root,
    (d) => d.workingSet,
    (d, v) => (d.workingSet = v)
  );
  calculateSum(
    root,
    (d) => d.cpu,
    (d, v) => (d.cpu = v)
  );
}
