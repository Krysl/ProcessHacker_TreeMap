import { showTreeMap } from '../renderer';

import { GetValue, TreeNode } from './../parse-csv';

export const dataSourcePrivatebytes = 'Private bytes';
export const dataSourceWorkingset = 'Working set';
export const dataSourceCPU = 'CPU';

const dataSourceMode: Map<string, GetValue> = new Map<string, GetValue>([
  [dataSourcePrivatebytes, (d: TreeNode) => d.privateBytes],
  [dataSourceWorkingset, (d: TreeNode) => d.workingSet],
  [dataSourceCPU, (d: TreeNode) => d.cpu],
]);

const dataSourceSelect = document.querySelector('#data-src') as HTMLSelectElement;
export let cfgDataSource = localStorage.getItem('data-src');
if (cfgDataSource === null) {
  localStorage.setItem('data-src', dataSourcePrivatebytes);
  cfgDataSource = dataSourcePrivatebytes;
}
for (const [key] of dataSourceMode) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.innerHTML = key;
  if (key === cfgDataSource) {
    opt.selected = true;
  }
  dataSourceSelect.append(opt);
}
console.log(dataSourceSelect.value);

dataSourceSelect.addEventListener('change', (_event) => {
  cfgDataSource = dataSourceSelect.value;
  console.log(`=> Data Source: ${cfgDataSource}`);
  localStorage.setItem('data-src', dataSourceSelect.value);
  showTreeMap();
});

export function getValue(data: TreeNode): number {
  const returnValue = cfgDataSource ? dataSourceMode.get(cfgDataSource)?.(data) : undefined;
  if (returnValue === undefined) {
    const message = `Please Add Column "${cfgDataSource}" in Process Hacker`;
    alert(message);
    throw new Error(message);
  }
  return returnValue;
}
