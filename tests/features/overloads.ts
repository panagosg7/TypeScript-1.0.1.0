


function foo(x: number): HTMLElement;
function foo(x: string): HTMLElement;
/*@ foo :: /\ (x: number) => #HTMLElement
           /\ (x: string) => #HTMLElement */
function foo(x: any): HTMLElement {
  return new HTMLElement();
}