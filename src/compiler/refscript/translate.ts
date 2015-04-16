///<reference path='..\typescript.ts' />

module TypeScript {

	export class RsHelper {

		private _initValidator: InitializationValidator;

		constructor(private _semanticInfoChain: SemanticInfoChain) {
			this._initValidator = new InitializationValidator();
		}

		public ctorValidate() {
			this._initValidator.validate(this._document, this._diagnostics);
		}

		private _document: Document;

		public setDocument(document: Document) {
			this._document = document;
		}

		public clearDiagnostics() {
			this._diagnostics = [];
		}

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

		public getSourceSpan(ast: ISyntaxElement): RsSrcSpan {
			var lineMap = this._document.lineMap();
			var startLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.start());
			var stopLineAndChar = lineMap.getLineAndCharacterFromPosition(ast.end());
			return new RsSrcSpan(ast.fileName(), startLineAndChar, stopLineAndChar);
		}

		public isLibrary(ast: ISyntaxElement): boolean {
			return ast.fileName().indexOf("lib.d.ts") === -1;
		}

		public postDiagnostic(ast: ISyntaxElement, diagnosticKey: string, _arguments: any[] = null, additionalLocations: Location[] = null) {
			var diagnostic = new Diagnostic(ast.fileName(), this._document.lineMap(), 
                ast.start(), ast.width(), diagnosticKey, _arguments, additionalLocations);
			this._diagnostics.push(diagnostic);
		}

		public diagnostics(): Diagnostic[] {
			return this._diagnostics;
		}

		private _parentNode: ISyntaxNode[] = [];

		public getParentNode(): ISyntaxNode {
			if (this._parentNode && this._parentNode.length > 0) {
				return this._parentNode[this._parentNode.length-1];
			}
			return null;
		}

		public pushParentNode(p: ISyntaxNode) {
			if (!this._parentNode) {
				this._parentNode = [];
			}
			this._parentNode.push(p);
		}

		public popParentNode(): ISyntaxNode {
			if (this._parentNode && this._parentNode.length > 0) {
				this._parentNode.pop();
			}
			return null;
		}

	}

	export class FixResult {
		public toObject(): any {
			throw new Error("FixResult.toObject - abstract");
		}
	}

	export class FPSrcPos {
		constructor(private name: string, private line: number, private column: number) { }

		public toObject() {
			return [ this.name, this.line + 1, this.column + 1 ]; // Calibrating off by one 
				//"name": this.name, "line": this.line, "column": this.column
		}
	}

	export class FPSrcSpan {
		constructor(private sp_start: FPSrcPos, private sp_stop: FPSrcPos) { }

		public serialize(): any {
			return {
				"sp_start": this.sp_start.toObject(),
				"sp_stop": this.sp_stop.toObject()
			};
		}
	}

	export class FPError {
		constructor(private errMsg: string, private errLoc: FPSrcSpan) { }

		static mkFixError(diagnostic: Diagnostic): FPError {
			var lineMap = diagnostic.lineMap();
			var startLineAndCharacter = lineMap.getLineAndCharacterFromPosition(diagnostic.start());
			var stopLineAndCharacter = lineMap.getLineAndCharacterFromPosition(diagnostic.start() + diagnostic.length());
			return new FPError(
				diagnostic.text(),
				new FPSrcSpan(
					new FPSrcPos(diagnostic.fileName(), startLineAndCharacter.line(), startLineAndCharacter.character()),
					new FPSrcPos(diagnostic.fileName(), stopLineAndCharacter.line(), stopLineAndCharacter.character())));			
		}

		public toObject() {
			return {
				"errMsg": this.errMsg,
				"errLoc": this.errLoc.serialize()
			};
		}

	}

	export class FRCrash extends FixResult {
		constructor(private errs: FPError[], private msg: string) {
			super();
		}

		public toObject() {
			return { "Crash": [this.errs.map(err => err.toObject()), this.msg] };
		}
	}

	export class FRSafe extends FixResult { 
		public toObject(): any {
			return { "Safe": [] };
		}
  }

	export class FRUnsafe extends FixResult {
		constructor(private errs: FPError[]) {
			super();
		}

		public toObject() {
			return { "Unsafe": this.errs.map(err => err.toObject()) };
		}
	}

	export class FRUnknownError extends FixResult {
		constructor(private msg: string) {
			super();
		}

		public toObject() {
			return { "UnknownError": this.msg };
		}
	}

  // FIXRESULT
  //
  // [{"Safe":[]},
  //  {"Crash":[[],"stack"]},
  //  {"Unsafe":[{"errMsg":"AAA",
  //              "errLoc": 
  //                { "sp_start":{"line":1,"column":1},
  //                  "sp_stop" :{"line":1,"column":1}
  //                }
  //             },
  //             {"errMsg":"BBB","errLoc":{"sp_start":{"line":1,"column":1},"sp_stop":{"line":1,"column":1}}}]},
  //  {"UnknownError":"Unkowntext"}]


}
