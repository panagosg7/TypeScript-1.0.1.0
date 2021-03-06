//// [ExportObjectLiteralAndObjectTypeLiteralWithAccessibleTypesInMemberTypeAnnotations.js]
var A;
(function (A) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();

    A.Origin = { x: 0, y: 0 };

    A.Unity = { start: new Point(0, 0), end: new Point(1, 0) };
})(A || (A = {}));
