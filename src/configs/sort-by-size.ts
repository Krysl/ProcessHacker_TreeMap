import { showTreeMap } from '../renderer';

const sortBySizeCheckBox = document.querySelector('#sort-by-size') as HTMLInputElement;
const _cfgSortBySize = localStorage.getItem('sort-by-size');
export let cfgSortBySize = _cfgSortBySize === 'true' ? true : false;
if (cfgSortBySize === null) {
  localStorage.setItem('sort-by-size', 'true');
  cfgSortBySize = true;
}
sortBySizeCheckBox.checked = cfgSortBySize;
sortBySizeCheckBox.addEventListener('change', (_event) => {
  localStorage.setItem('sort-by-size', sortBySizeCheckBox.checked.toString());
  cfgSortBySize = sortBySizeCheckBox.checked;
  console.log(`=> Sort by Size: ${cfgSortBySize}`);
  showTreeMap();
});
