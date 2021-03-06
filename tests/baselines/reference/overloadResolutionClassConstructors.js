//// [overloadResolutionClassConstructors.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SomeBase = (function () {
    function SomeBase() {
    }
    return SomeBase;
})();
var SomeDerived1 = (function (_super) {
    __extends(SomeDerived1, _super);
    function SomeDerived1() {
        _super.apply(this, arguments);
    }
    return SomeDerived1;
})(SomeBase);
var SomeDerived2 = (function (_super) {
    __extends(SomeDerived2, _super);
    function SomeDerived2() {
        _super.apply(this, arguments);
    }
    return SomeDerived2;
})(SomeBase);
var SomeDerived3 = (function (_super) {
    __extends(SomeDerived3, _super);
    function SomeDerived3() {
        _super.apply(this, arguments);
    }
    return SomeDerived3;
})(SomeBase);

// Ambiguous call picks the first overload in declaration order
var fn1 = (function () {
    function fn1() {
    }
    return fn1;
})();

new fn1(undefined);

// No candidate overloads found
new fn1({}); // Error

// Generic and non - generic overload where generic overload is the only candidate when called with type arguments
var fn2 = (function () {
    function fn2() {
    }
    return fn2;
})();

var d = new fn2(0, undefined);

// Generic and non - generic overload where generic overload is the only candidate when called without type arguments
var s = new fn2(0, '');

// Generic and non - generic overload where non - generic overload is the only candidate when called with type arguments
new fn2('', 0); // OK

// Generic and non - generic overload where non - generic overload is the only candidate when called without type arguments
new fn2('', 0); // OK

// Generic overloads with differing arity called without type arguments
var fn3 = (function () {
    function fn3() {
    }
    return fn3;
})();

new fn3(3);
new fn3('', 3, '');
new fn3(5, 5, 5);

// Generic overloads with differing arity called with type arguments matching each overload type parameter count
new fn3(4); // Error
new fn3('', '', ''); // Error
new fn3('', '', 3);

// Generic overloads with differing arity called with type argument count that doesn't match any overload
new fn3(); // Error

// Generic overloads with constraints called with type arguments that satisfy the constraints
var fn4 = (function () {
    function fn4() {
    }
    return fn4;
})();
new fn4('', 3);
new fn4(3, ''); // Error
new fn4('', 3); // Error
new fn4(3, ''); // Error

// Generic overloads with constraints called without type arguments but with types that satisfy the constraints
new fn4('', 3);
new fn4(3, ''); // Error
new fn4(3, undefined); // Error
new fn4('', null);

// Generic overloads with constraints called with type arguments that do not satisfy the constraints
new fn4(null, null); // Error

// Generic overloads with constraints called without type arguments but with types that do not satisfy the constraints
new fn4(true, null); // Error
new fn4(null, true); // Error

// Non - generic overloads where contextual typing of function arguments has errors
var fn5 = (function () {
    function fn5() {
        return undefined;
    }
    return fn5;
})();
new fn5(function (n) {
    return n.toFixed();
});
new fn5(function (n) {
    return n.substr(0);
});
new fn5(function (n) {
    return n.blah;
}); // Error
