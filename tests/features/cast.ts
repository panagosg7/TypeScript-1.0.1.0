


/*@ foo :: (elt: #HTMLElement) => #HTMLCanvasElement */
function foo(elt: HTMLElement): HTMLDivElement {

  if (elt instanceof HTMLCanvasElement) {
    var div = <HTMLDivElement>elt;
    return div;
  }

  throw new Error("");

}