//// [numericIndexerConstraint1.js]
var Foo = (function () {
    function Foo() {
    }
    Foo.prototype.foo = function () {
    };
    return Foo;
})();
var x;
var result = x["one"];
