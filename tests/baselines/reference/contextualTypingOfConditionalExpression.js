//// [contextualTypingOfConditionalExpression.ts]
var x: (a: number) => void = true ? (a) => a.toExponential() : (b) => b.toFixed();

class A {
    foo: number;
}
class B extends A {
    bar: number;
}
class C extends A {
    baz: number;
}

var x2: (a: A) => void = true ? (a) => a.foo : (b) => b.foo;


//// [contextualTypingOfConditionalExpression.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var x = true ? function (a) {
    return a.toExponential();
} : function (b) {
    return b.toFixed();
};

var A = (function () {
    function A() {
    }
    return A;
})();
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        _super.apply(this, arguments);
    }
    return B;
})(A);
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        _super.apply(this, arguments);
    }
    return C;
})(A);

var x2 = true ? function (a) {
    return a.foo;
} : function (b) {
    return b.foo;
};
