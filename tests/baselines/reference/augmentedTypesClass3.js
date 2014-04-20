//// [augmentedTypesClass3.ts]
// class then module
class c5 { public foo() { } }
module c5 { } // should be ok

class c5a { public foo() { } }
module c5a { var y = 2; } // should be ok

class c5b { public foo() { } }
module c5b { export var y = 2; } // should be ok

//// class then import
class c5c { public foo() { } }
//import c5c = require('');

//// [augmentedTypesClass3.js]
// class then module
var c5 = (function () {
    function c5() {
    }
    c5.prototype.foo = function () {
    };
    return c5;
})();

var c5a = (function () {
    function c5a() {
    }
    c5a.prototype.foo = function () {
    };
    return c5a;
})();
var c5a;
(function (c5a) {
    var y = 2;
})(c5a || (c5a = {}));

var c5b = (function () {
    function c5b() {
    }
    c5b.prototype.foo = function () {
    };
    return c5b;
})();
var c5b;
(function (c5b) {
    c5b.y = 2;
})(c5b || (c5b = {}));

//// class then import
var c5c = (function () {
    function c5c() {
    }
    c5c.prototype.foo = function () {
    };
    return c5c;
})();
//import c5c = require('');
