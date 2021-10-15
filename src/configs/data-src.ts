import { showTreeMap } from '../renderer';
import { TreeNode, GetValue } from './../parse_csv';


export const dataSourcePrivatebytes = 'Private bytes';
export const dataSourceWorkingset = 'Working set';
export const dataSourceCPU = 'CPU';

const dataSrcMode: Map<string, GetValue> = new Map<string, GetValue>([
  [dataSourcePrivatebytes, (d: TreeNode) => d.privateBytes],
  [dataSourceWorkingset, (d: TreeNode) => d.workingSet],
  [dataSourceCPU, (d: TreeNode) => d.cpu],
])
let _alerted: boolean = false;
const alerted_get = () => _alerted;
export const alerted_set = (v: boolean) => _alerted = v;

const dataSourceSelect = document.getElementById('data-src');
export let cfgDataSource = localStorage.getItem('data-src');
if (cfgDataSource === null) {
  localStorage.setItem('data-src', dataSourcePrivatebytes);
  cfgDataSource = dataSourcePrivatebytes;
}
for (let [key, value] of dataSrcMode) {
  var opt = document.createElement('option');
  opt.value = key;
  opt.innerHTML = key;
  if (key == cfgDataSource) {
    opt.selected = true;
  }
  dataSourceSelect.appendChild(opt);
}
console.log(dataSourceSelect.value)

dataSourceSelect.onchange = (ev) => {
  cfgDataSource = dataSourceSelect.value;
  console.log(`=> Data Source: ${cfgDataSource}`)
  localStorage.setItem('data-src', dataSourceSelect.value);
  showTreeMap(null);
}

export function getValue(data: TreeNode): number {
  const ret = dataSrcMode.get(cfgDataSource)(data);
  if (ret === 'null' && alerted_get() === false) {
    alert(`Please Add Column "${cfgDataSource}" in Process Hacker`);
    alerted_set(true);
  }
  return ret;
}
