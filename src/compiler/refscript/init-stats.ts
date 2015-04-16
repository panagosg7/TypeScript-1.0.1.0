///<reference path='..\typescript.ts' />

module TypeScript {

	export class StatsContext {
		constructor(private _diagnostics: Diagnostic[]) { }

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

		public postDiagnostic(diagnostic: Diagnostic) {
			this._diagnostics.push(diagnostic);
		}

	}

	export class InitializationValidator {

		static astToSourceSpan(ast: ISyntaxElement) {
			var cstart = ast.fullStart();
			var cstop  = ast.fullEnd();
			var startLineAndChar = ast.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstart);
			var endLineAndChar = ast.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstop);
			return new RsSrcSpan(ast.syntaxTree().sourceUnit().fileName(), startLineAndChar, endLineAndChar);
		}

	    static pre(ast: ISyntaxElement, context: StatsContext) {

			//if (context.inCtor()) {
			//	console.log(SyntaxKind[ast.kind()] + " : " + astToSourceSpan(ast).toString());
			//}

			switch (ast.kind()) {
				case SyntaxKind.ConstructorDeclaration:
					//console.log("In constructor declaration" + astToSourceSpan(ast).toString());
					context.enteringCtor();
					break;

				case SyntaxKind.FunctionDeclaration:
					// Functions Constructor
					var funcName = (<FunctionDeclarationSyntax>ast).identifier.text();
					if (/^[A-Z]/.test(funcName)) context.enteringCtor();
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
						if (!context.isValidId(ast.syntaxID())) {
							context.postDiagnostic(new Diagnostic(ast.fileName(), ast.syntaxTree().lineMap(), ast.start(), ast.width(),
								DiagnosticCode.Invalid_reference_of_this_in_constructor, [], []));
							//console.log("INVALID: " + InitializationValidator.astToSourceSpan(ast).toString());
						}
					}
					break;
			}
		}

		static post(ast: ISyntaxElement, context: StatsContext) {
			switch (ast.kind()) {
				case SyntaxKind.ConstructorDeclaration:
					context.exitingCtor();
					break;
			}
		}

		public validate(document: Document, diagnostics: Diagnostic[]) {
	        var sourceUnit = document.sourceUnit();
			var statsContext = new StatsContext(diagnostics);
			getAstWalkerFactory().simpleWalk(document.sourceUnit(),
				InitializationValidator.pre, InitializationValidator.post, statsContext);
		}

	}

}
