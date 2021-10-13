import { parseCSV } from './parse_csv';
import { showTreeMap, updateData } from './renderer';

function createTip(txt: string) {
  const text = document.createElement("P");
  text.innerText = txt;
  text.setAttribute('style', 'font-weight: bold;');
  return text;
}

const text = createTip(
  'The following is for demonstration, ' +
  'please upload the "Process Hacker Processes.csv" ' +
  'file to show your own memory usage\'s TeeeMap'
);

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

inputfile.parentNode.appendChild(text);

fetch('Process Hacker Processes.csv')
  .then(function (response) {
    return response.text();
  })
  .then(function (csvData) {
    const root = parseCSV(csvData);
    showTreeMap(root);
  });
