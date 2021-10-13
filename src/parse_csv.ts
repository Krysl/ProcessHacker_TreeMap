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

export function parseCSV(csvData: string): TreeNode {
  const csvStart = csvData.indexOf('"');
  const records = csvParse(csvData.slice(csvStart));
  const csvInfo = csvData.slice(0, csvStart - 2);
  console.log(csvInfo);
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
    // console.log(`${depth}: ${pathStr}-> ${name}`);
    // console.log(JSON.stringify(root, null, '\t'));
    // console.log(row);
  }
  console.log(root);
  // console.log(JSON.stringify(root, null, '\t'));
  // console.log(getTreeStr(root));
  return root;
}