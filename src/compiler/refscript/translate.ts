///<reference path='..\typescript.ts' />

module TypeScript {

	export class RsHelper {
		constructor(private _semanticInfoChain: SemanticInfoChain) { }

		public getDeclForAST(ast: ISyntaxElement): PullDecl {
			if (this._semanticInfoChain) {
				return this._semanticInfoChain.getDeclForAST(ast);
			}
			throw new Error("ASTHelper: SeminfoChain has not been initialized.");
		}

		public getSymbolForAST(ast: ISyntaxElement): PullSymbol {
			if (this._semanticInfoChain) {
				return this._semanticInfoChain.getSymbolForAST(ast);
			}
			throw new Error("ASTHelper: SeminfoChain has not been initialized.");
		}

		public getSourceSpan(ast: ISyntaxElement): RsSourceSpan {
			var lineMap = this._semanticInfoChain.lineMap(ast.fileName());
			var startLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.start());
			var stopLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.end());
			return new RsSourceSpan(ast.fileName(), startLineAndChar, stopLineAndChar);
		}

		public isLibrary(ast: ISyntaxElement): boolean {
			return ast.fileName().indexOf("lib.d.ts") === -1;
		}
	}

}