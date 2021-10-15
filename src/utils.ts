
let count = 0;

export function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}
function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};
export function formatBytes(bytes: number): string {
  let str: string = '';
  const GB = 1000 * 1000 * 1000;
  const MB = 1000 * 1000;
  const kB = 1000;
  if (bytes > GB) {
    str = `${bytes / GB} GB`
  } else if (bytes > MB) {
    str = `${bytes / MB} MB`
  } else if (bytes > kB) {
    str = `${bytes / kB} kB`
  } else if (bytes === 'null') {
    str = `???`
  } else {
    str = `${bytes} B`
  }
  return str;//.match(/^\d+(?:\.\d{0,2})?/);
}
