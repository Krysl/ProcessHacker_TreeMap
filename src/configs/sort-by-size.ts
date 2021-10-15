
const sortBySizeCheckBox = document.getElementById('sort-by-size');
export let cfgSortBySize = localStorage.getItem('sort-by-size');
cfgSortBySize = cfgSortBySize == 'true' ? true : false;
if (cfgSortBySize === null) {
  localStorage.setItem('sort-by-size', true);
  cfgSortBySize = true;
}
sortBySizeCheckBox.checked = cfgSortBySize;
sortBySizeCheckBox.onchange = (ev) => {
  localStorage.setItem('sort-by-size', sortBySizeCheckBox.checked);
  cfgSortBySize = sortBySizeCheckBox.checked;
  showTreeMap(null);
}