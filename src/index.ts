import { parseCSV } from './parse_csv';
import { showTreeMap, updateData } from './renderer';

const text = document.getElementById('tips');

const inputfile = document.getElementById('inputfile');

inputfile.addEventListener('change', function () {
  var fr = new FileReader();
  fr.onload = function () {
    const root = parseCSV(fr.result);
    text.innerText = root.description.split('\r\n').join(', ');
    showTreeMap(root);
  }

  fr.readAsText(this.files[0]);
})

fetch('Process Hacker Processes.csv')
  .then(function (response) {
    return response.text();
  })
  .then(function (csvData) {
    const root = parseCSV(csvData);
    showTreeMap(root);
  });
