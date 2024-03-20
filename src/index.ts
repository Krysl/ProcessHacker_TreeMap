import { parseCSV } from './parse-csv';
import { showTreeMap } from './renderer';

const text = document.querySelector('#tips') as HTMLParagraphElement;

const inputfile = document.querySelector('#inputfile') as HTMLInputElement;

inputfile.addEventListener('change', function () {
  const fr = new FileReader();
  fr.addEventListener('load', function () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = parseCSV(fr.result! as string);
    text.textContent = root.description.split('\r\n').join(', ');
    showTreeMap(root);
  });

  if (this.files) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fr.readAsText(this.files[0]!);
  }
});

// await fetch('Process Hacker Processes.csv')
await fetch('Process Explorer Processes.tsv')
  .then(function (response) {
    return response.text();
  })
  .then(function (csvData) {
    const root = parseCSV(csvData);
    showTreeMap(root);
  });
