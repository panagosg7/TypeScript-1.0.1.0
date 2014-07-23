///<reference path='..\typescript.ts' />

module TypeScript {

	export class RsHelper {

		//constructor(private _compiler: TypeScriptCompiler, private _document: Document) { }
		constructor(private _semanticInfoChain: SemanticInfoChain, private _document: Document) { }

		private _diagnostics: Diagnostic[] = [];

		public getDeclForAST(ast: ISyntaxElement): PullDecl {
			return this._document._getDeclForAST(ast);
		}

		public getSymbolForAST(ast: ISyntaxElement): PullSymbol {
			return this._semanticInfoChain.getSymbolForAST(ast);
		}

		public getSymbolForDecl(decl: PullDecl): PullSymbol {
			return this._semanticInfoChain.getSymbolForDecl(decl);
		}

		public getSourceSpan(ast: ISyntaxElement): RsSourceSpan {
			var lineMap = this._document.lineMap();
			var startLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.start());
			var stopLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.end());
			return new RsSourceSpan(ast.fileName(), startLineAndChar, stopLineAndChar);
		}

		public isLibrary(ast: ISyntaxElement): boolean {
			return ast.fileName().indexOf("lib.d.ts") === -1;
		}

		public postDiagnostic(ast: ISyntaxElement, diagnosticKey: string, _arguments: any[] = null, additionalLocations: Location[] = null) {
			var diagnostic = new Diagnostic(ast.fileName(), this._document.lineMap(), ast.start(), ast.width(), diagnosticKey, _arguments, additionalLocations);
			this._diagnostics.push(diagnostic);
		}

		public diagnostics(): Diagnostic[] {
			return this._diagnostics;
		}

	}

}