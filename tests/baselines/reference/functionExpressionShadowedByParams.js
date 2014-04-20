//// [functionExpressionShadowedByParams.js]
function b1(b1) {
    b1.toPrecision(2); // should not error
    b1(12); // should error
}

var x = {
    b: function b(b) {
        b.toPrecision(2); // should not error
        b.apply(null, null); // should error
    }
};
