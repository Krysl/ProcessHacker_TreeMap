import { showTreeMap } from '../renderer';

const idHideIdle = 'hide-idle';
const hideIdleCheckBox = document.querySelector(`#${idHideIdle}`) as HTMLInputElement;
const _cfgHideIdle = localStorage.getItem(idHideIdle);
export let cfgHideIdle = _cfgHideIdle === 'true' ? true : false;
if (cfgHideIdle === null) {
  localStorage.setItem(idHideIdle, 'true');
  cfgHideIdle = true;
}
hideIdleCheckBox.checked = cfgHideIdle;
hideIdleCheckBox.addEventListener('change', (_event) => {
  localStorage.setItem(idHideIdle, hideIdleCheckBox.checked.toString());
  cfgHideIdle = hideIdleCheckBox.checked;
  console.log(`=> Sort by Size: ${cfgHideIdle}`);
  showTreeMap();
});
