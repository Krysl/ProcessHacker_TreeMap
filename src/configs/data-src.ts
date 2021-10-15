import { showTreeMap } from '../renderer';
import { TreeNode } from './../parse_csv';


export const dataSourcePrivatebytes = 'Private bytes';
export const dataSourceWorkingset = 'Working set';
export const dataSourceCPU = 'CPU';

let dataMode: string = dataSourcePrivatebytes;

type GetValue = (data: TreeNode) => number;

const dataSrcMode: Map<string, GetValue> = new Map<string, GetValue>([
  [dataSourcePrivatebytes, (d: TreeNode) => d.privateBytes],
  [dataSourceWorkingset, (d: TreeNode) => d.workingSet],
  [dataSourceCPU, (d: TreeNode) => d.cpu],
])
let _alerted: boolean = false;
const alerted_get = () => _alerted;
export const alerted_set = (v: boolean) => _alerted = v;

export let getValue: GetValue = (data: TreeNode) => {
  const ret = dataSrcMode.get(dataMode)(data);
  if (ret === 'null' && alerted_get() === false) {
    alert(`Please Add Column "${dataMode}" in Process Hacker`);
    alerted_set(true);
  }
  return ret;
}


const dataSourceSelect = document.getElementById('data-src');
let cfgDataSource = localStorage.getItem('data-src');
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
  dataMode = dataSourceSelect.value;
  localStorage.setItem('data-src', dataSourceSelect.value);
  showTreeMap(null);
}