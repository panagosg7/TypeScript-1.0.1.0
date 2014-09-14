
///<reference path='..\typescript.ts' />

module TypeScript {

	class StatsContext {
		constructor(private document: Document, private semanticInfoChain: SemanticInfoChain) { }

		private _inCtor = false;
		private _inAsgn = false;
		private _inMemAccess = false;

		public enteringCtor() {
			this._inCtor = true;
		}

		public exitingCtor() {
			this._inCtor = false;
		}

		public inCtor(): boolean {
			return this._inCtor;
		}

		private _validIds: any = { };

		public registerValidId(id: number): void {
			this._validIds[id] = true;
		}

		public isValidId(id: number): boolean {
			return (id in this._validIds);
		}

	}

	function astToSourceSpan(ast: ISyntaxElement) {
		var cstart = ast.fullStart();
		var cstop  = ast.fullEnd();
		var startLineAndChar = ast.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstart);
		var endLineAndChar = ast.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstop);
		return new RsSourceSpan(ast.syntaxTree().sourceUnit().fileName(), startLineAndChar, endLineAndChar);
	}

    function pre(ast: ISyntaxElement, context: StatsContext) {

		//if (context.inCtor()) {
		//	console.log(SyntaxKind[ast.kind()] + " : " + astToSourceSpan(ast).toString());
		//}

		switch (ast.kind()) {
			case SyntaxKind.ConstructorDeclaration:
				//console.log("In constructor declaration" + astToSourceSpan(ast).toString());
				context.enteringCtor();
				break;

			case SyntaxKind.AssignmentExpression:
				// register a assignment of the form:
				// this._ = _;
				if (context.inCtor()) {
					var asgnExpr = <BinaryExpressionSyntax>ast;
					var lhsAsgn = asgnExpr.left;
					if (lhsAsgn.kind() === SyntaxKind.MemberAccessExpression) {
						var memAccess = <MemberAccessExpressionSyntax> lhsAsgn;
						if (memAccess.expression.kind() === SyntaxKind.ThisKeyword) {
							context.registerValidId(memAccess.expression.syntaxID());
						}
					}
				}
				break;

			case SyntaxKind.ThisKeyword:
				if (context.inCtor()) {
					if (context.isValidId(ast.syntaxID())) {
						console.log("VALID: " + astToSourceSpan(ast).toString());
					}
					else {
						console.log("INVALID: " + astToSourceSpan(ast).toString());
					}
				}
				break;
		}
	}

	function post(ast: ISyntaxElement, context: StatsContext) {
		switch (ast.kind()) {
			case SyntaxKind.ConstructorDeclaration:
				context.exitingCtor();
				break;

		}
	}

    export function initStats(semanticInfoChain: SemanticInfoChain, document: Document): void {
        var sourceUnit = document.sourceUnit();
        var resolver = semanticInfoChain.getResolver();
		var statsContext = new StatsContext(document, semanticInfoChain);

		getAstWalkerFactory().simpleWalk(document.sourceUnit(), pre, post, statsContext);

    }

}
