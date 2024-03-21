let count = 0;

export function uid(name?: string) {
  return new Id('O-' + (name ?? '' + '-') + ++count);
}
export class Id {
  id: string;
  href: string;
  constructor(id?: string) {
    this.id = id ?? '';
    this.href = new URL(`#${id}`, location.toString()).toString();
  }

  toString() {
    return 'url(' + this.href + ')';
  }
}
export function formatBytes(bytes?: number): string {
  let size: string = '';
  const GB = 1000 * 1000 * 1000;
  const MB = 1000 * 1000;
  const kB = 1000;
  if (bytes === undefined || Number.isNaN(bytes)) {
    size = `???`;
  } else if (bytes > GB) {
    size = `${bytes / GB} GB`;
  } else if (bytes > MB) {
    size = `${bytes / MB} MB`;
  } else if (bytes > kB) {
    size = `${bytes / kB} kB`;
  } else {
    size = `${bytes} B`;
  }
  return size; //.match(/^\d+(?:\.\d{0,2})?/);
}
