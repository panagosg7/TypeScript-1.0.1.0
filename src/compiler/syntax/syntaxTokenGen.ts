///<reference path='references.ts' />

module TypeScript.Syntax {

	//RefScript - begin
	function toRsAST(token: ISyntaxToken, helper: RsHelper): RsAST {
		if (token.kind() === SyntaxKind.IdentifierName) {
			return new RsId(helper.getSourceSpan(token), [] /*token.getRsAnnotations(AnnotContext.OtherContext)*/, token.fullText());
		}
		throw new Error("toRsAST not implemented for " +  SyntaxKind[token.kind()]);
	}

    function toRsExp(token: ISyntaxToken, helper: RsHelper): RsExpression {
		switch (token.kind()) {
            case SyntaxKind.IdentifierName:
                return new RsVarRef(
                    helper.getSourceSpan(token),
                    [] /*token.getRsAnnotations(AnnotContext.OtherContext)*/,
                    <RsId>token.toRsAST(helper));

			case SyntaxKind.NumericLiteral:
				if (token.text().indexOf(".") === -1) {
					//No decimal part
					return new RsIntLit(helper.getSourceSpan(token),
						[] /*token.getRsAnnotations(AnnotContext.OtherContext)*/,
						token.value());
				}
				else {
					return new RsNumLit(helper.getSourceSpan(token),
						[] /*token.getRsAnnotations(AnnotContext.OtherContext)*/,
						token.value());
				}
			
			case SyntaxKind.FalseKeyword:
			case SyntaxKind.TrueKeyword:
				return new RsBoolLit(helper.getSourceSpan(token),
					[] /*token.getRsAnnotations(AnnotContext.OtherContext)*/,
					token.value());

			case SyntaxKind.NullKeyword:
				return new RsNullLit(helper.getSourceSpan(token),
					[] /*token.getRsAnnotations(AnnotContext.OtherContext)*/);

	        default:
                throw new Error("NEW: toRsExp not implemented for " + SyntaxKind[token.kind()]);
        }
	}

	function toRsStmt(token: ISyntaxToken, helper: RsHelper): RsStatement {
		throw new Error("toRsStmt not implemented for " + SyntaxKind[token.kind()]);
	}

	export function toRsId(token: ISyntaxToken, helper: RsHelper): RsId {
        return new RsId(helper.getSourceSpan(token), [] /*token.getNanoAnnotations(AnnotContext.OtherContext)*/, token.text());
	}

	function toRsMemList<T extends ISyntaxToken>(token: T, helper: RsHelper): RsASTList<RsAST> {
		throw new Error("toRsMemList not implemented for " + SyntaxKind[token.kind()]);
	}

	function toRsLValue(token: ISyntaxToken, helper: RsHelper): RsLValue {
        return new RsLVar(helper.getSourceSpan(token), [] /*token.getNanoAnnotations(AnnotContext.OtherContext)*/, token.text());
	}

    function toRsClassElt(token: ISyntaxToken, helper: RsHelper): RsClassElt {
        throw new Error("toRsClassElt not implemented for " + SyntaxKind[token.kind()]);
    }

    function toRsForInit(token: ISyntaxToken, helper: RsHelper): RsForInit {
        throw new Error("toRsForInit not implemented for " + SyntaxKind[token.kind()]);
    }

    function toRsVarDecl(token: ISyntaxToken, helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike {
        throw new Error("toRsVarDecl not implemented for " + SyntaxKind[token.kind()]);
    }
	//RefScript - end

    export class VariableWidthTokenWithNoTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new VariableWidthTokenWithNoTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart; }
        public width(): number { return this.fullWidth() - this.leadingTriviaWidth() - this.trailingTriviaWidth(); }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return this.fullText().substr(this.leadingTriviaWidth(), this.width()); }
        public fullText(): string { return this._fullText; }

        public value(): any {
            if ((<any>this)._value === undefined) {
                (<any>this)._value = value(this);
            }

            return (<any>this)._value;
        }

        public valueText(): string {
            if ((<any>this)._valueText === undefined) {
                (<any>this)._valueText = valueText(this);
            }

            return (<any>this)._valueText;
        }

        public hasLeadingTrivia(): boolean { return false; }
        public hasLeadingComment(): boolean { return false; }
        public hasLeadingNewLine(): boolean { return false; }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasTrailingTrivia(): boolean { return false; }
        public hasTrailingComment(): boolean { return false; }
        public hasTrailingNewLine(): boolean { return false; }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return 0; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end

    }

    export class VariableWidthTokenWithLeadingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._leadingTriviaInfo = leadingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new VariableWidthTokenWithLeadingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._leadingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart + getTriviaWidth(this._leadingTriviaInfo); }
        public width(): number { return this.fullWidth() - this.leadingTriviaWidth() - this.trailingTriviaWidth(); }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return this.fullText().substr(this.leadingTriviaWidth(), this.width()); }
        public fullText(): string { return this._fullText; }

        public value(): any {
            if ((<any>this)._value === undefined) {
                (<any>this)._value = value(this);
            }

            return (<any>this)._value;
        }

        public valueText(): string {
            if ((<any>this)._valueText === undefined) {
                (<any>this)._valueText = valueText(this);
            }

            return (<any>this)._valueText;
        }

        public hasLeadingTrivia(): boolean { return true; }
        public hasLeadingComment(): boolean { return hasTriviaComment(this._leadingTriviaInfo); }
        public hasLeadingNewLine(): boolean { return hasTriviaNewLine(this._leadingTriviaInfo); }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return getTriviaWidth(this._leadingTriviaInfo); }
        public leadingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, 0, this.leadingTriviaWidth(), /*isTrailing:*/ false); }

        public hasTrailingTrivia(): boolean { return false; }
        public hasTrailingComment(): boolean { return false; }
        public hasTrailingNewLine(): boolean { return false; }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return 0; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end
    }

    export class VariableWidthTokenWithTrailingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _trailingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, trailingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._trailingTriviaInfo = trailingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new VariableWidthTokenWithTrailingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._trailingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart; }
        public width(): number { return this.fullWidth() - this.leadingTriviaWidth() - this.trailingTriviaWidth(); }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return this.fullText().substr(this.leadingTriviaWidth(), this.width()); }
        public fullText(): string { return this._fullText; }

        public value(): any {
            if ((<any>this)._value === undefined) {
                (<any>this)._value = value(this);
            }

            return (<any>this)._value;
        }

        public valueText(): string {
            if ((<any>this)._valueText === undefined) {
                (<any>this)._valueText = valueText(this);
            }

            return (<any>this)._valueText;
        }

        public hasLeadingTrivia(): boolean { return false; }
        public hasLeadingComment(): boolean { return false; }
        public hasLeadingNewLine(): boolean { return false; }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasTrailingTrivia(): boolean { return true; }
        public hasTrailingComment(): boolean { return hasTriviaComment(this._trailingTriviaInfo); }
        public hasTrailingNewLine(): boolean { return hasTriviaNewLine(this._trailingTriviaInfo); }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return getTriviaWidth(this._trailingTriviaInfo); }
        public trailingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, this.leadingTriviaWidth() + this.width(), this.trailingTriviaWidth(), /*isTrailing:*/ true); }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end
    }

    export class VariableWidthTokenWithLeadingAndTrailingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo: number;
        private _trailingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, trailingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._leadingTriviaInfo = leadingTriviaInfo;
            this._trailingTriviaInfo = trailingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new VariableWidthTokenWithLeadingAndTrailingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._leadingTriviaInfo,
                this._trailingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart + getTriviaWidth(this._leadingTriviaInfo); }
        public width(): number { return this.fullWidth() - this.leadingTriviaWidth() - this.trailingTriviaWidth(); }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); }

        public text(): string { return this.fullText().substr(this.leadingTriviaWidth(), this.width()); }
        public fullText(): string { return this._fullText; }

        public value(): any {
            if ((<any>this)._value === undefined) {
                (<any>this)._value = value(this);
            }

            return (<any>this)._value;
        }

        public valueText(): string {
            if ((<any>this)._valueText === undefined) {
                (<any>this)._valueText = valueText(this);
            }

            return (<any>this)._valueText;
        }

        public hasLeadingTrivia(): boolean { return true; }
        public hasLeadingComment(): boolean { return hasTriviaComment(this._leadingTriviaInfo); }
        public hasLeadingNewLine(): boolean { return hasTriviaNewLine(this._leadingTriviaInfo); }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return getTriviaWidth(this._leadingTriviaInfo); }
        public leadingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, 0, this.leadingTriviaWidth(), /*isTrailing:*/ false); }

        public hasTrailingTrivia(): boolean { return true; }
        public hasTrailingComment(): boolean { return hasTriviaComment(this._trailingTriviaInfo); }
        public hasTrailingNewLine(): boolean { return hasTriviaNewLine(this._trailingTriviaInfo); }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return getTriviaWidth(this._trailingTriviaInfo); }
        public trailingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, this.leadingTriviaWidth() + this.width(), this.trailingTriviaWidth(), /*isTrailing:*/ true); }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
        //RefScript - begin
        public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
        public toRsExp(helper: RsHelper): RsExpression { return toRsExp(this, helper); }
        public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
        public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
        public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); }
        public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); }
        public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); }
        //RefScript - end
    }

    export class FixedWidthTokenWithNoTrivia implements ISyntaxToken {
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullStart: number, kind: SyntaxKind) {
            this._fullStart = fullStart;
            this.tokenKind = kind;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new FixedWidthTokenWithNoTrivia(
                this._fullStart,
                this.tokenKind);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart; }
        public width(): number { return this.text().length; }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return SyntaxFacts.getText(this.tokenKind); }
        public fullText(): string { return this.text(); }

        public value(): any { return value(this); }
        public valueText(): string { return valueText(this); }
        public hasLeadingTrivia(): boolean { return false; }
        public hasLeadingComment(): boolean { return false; }
        public hasLeadingNewLine(): boolean { return false; }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasTrailingTrivia(): boolean { return false; }
        public hasTrailingComment(): boolean { return false; }
        public hasTrailingNewLine(): boolean { return false; }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return 0; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end
    }

    export class FixedWidthTokenWithLeadingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._leadingTriviaInfo = leadingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new FixedWidthTokenWithLeadingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._leadingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart + getTriviaWidth(this._leadingTriviaInfo); }
        public width(): number { return this.text().length; }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return SyntaxFacts.getText(this.tokenKind); }
        public fullText(): string { return this._fullText; }

        public value(): any { return value(this); }
        public valueText(): string { return valueText(this); }
        public hasLeadingTrivia(): boolean { return true; }
        public hasLeadingComment(): boolean { return hasTriviaComment(this._leadingTriviaInfo); }
        public hasLeadingNewLine(): boolean { return hasTriviaNewLine(this._leadingTriviaInfo); }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return getTriviaWidth(this._leadingTriviaInfo); }
        public leadingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, 0, this.leadingTriviaWidth(), /*isTrailing:*/ false); }

        public hasTrailingTrivia(): boolean { return false; }
        public hasTrailingComment(): boolean { return false; }
        public hasTrailingNewLine(): boolean { return false; }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return 0; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end
    }

    export class FixedWidthTokenWithTrailingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _trailingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, trailingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._trailingTriviaInfo = trailingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new FixedWidthTokenWithTrailingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._trailingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart; }
        public width(): number { return this.text().length; }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return SyntaxFacts.getText(this.tokenKind); }
        public fullText(): string { return this._fullText; }

        public value(): any { return value(this); }
        public valueText(): string { return valueText(this); }
        public hasLeadingTrivia(): boolean { return false; }
        public hasLeadingComment(): boolean { return false; }
        public hasLeadingNewLine(): boolean { return false; }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }

        public hasTrailingTrivia(): boolean { return true; }
        public hasTrailingComment(): boolean { return hasTriviaComment(this._trailingTriviaInfo); }
        public hasTrailingNewLine(): boolean { return hasTriviaNewLine(this._trailingTriviaInfo); }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return getTriviaWidth(this._trailingTriviaInfo); }
        public trailingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, this.leadingTriviaWidth() + this.width(), this.trailingTriviaWidth(), /*isTrailing:*/ true); }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
		//RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end

    }

    export class FixedWidthTokenWithLeadingAndTrailingTrivia implements ISyntaxToken {
        private _fullText: string;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo: number;
        private _trailingTriviaInfo: number;
        public parent: ISyntaxElement = null;
        private _syntaxID: number = 0;

        constructor(fullText: string, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, trailingTriviaInfo: number) {
            this._fullText = fullText;
            this._fullStart = fullStart;
            this.tokenKind = kind;
            this._leadingTriviaInfo = leadingTriviaInfo;
            this._trailingTriviaInfo = trailingTriviaInfo;
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public clone(): ISyntaxToken {
            return new FixedWidthTokenWithLeadingAndTrailingTrivia(
                this._fullText,
                this._fullStart,
                this.tokenKind,
                this._leadingTriviaInfo,
                this._trailingTriviaInfo);
        }

        public setFullStart(fullStart: number): void {
            this._fullStart = fullStart;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public isShared(): boolean { return false; }
        public isNode(): boolean { return false; }
        public isToken(): boolean { return true; }
        public isTrivia(): boolean { return true; }
        public isList(): boolean { return false; }
        public isSeparatedList(): boolean { return false; }
        public isTriviaList(): boolean { return false; }

        public kind(): SyntaxKind { return this.tokenKind; }

        public childCount(): number { return 0; }
        public childAt(index: number): ISyntaxElement { throw Errors.argumentOutOfRange('index'); }

        public fullWidth(): number { return this.fullText().length; }
        public fullStart(): number { return this._fullStart; }
        public start(): number { return this._fullStart + getTriviaWidth(this._leadingTriviaInfo); }
        public width(): number { return this.text().length; }

        public end(): number { return this.start() + this.width(); }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); } 

        public text(): string { return SyntaxFacts.getText(this.tokenKind); }
        public fullText(): string { return this._fullText; }

        public value(): any { return value(this); }
        public valueText(): string { return valueText(this); }
        public hasLeadingTrivia(): boolean { return true; }
        public hasLeadingComment(): boolean { return hasTriviaComment(this._leadingTriviaInfo); }
        public hasLeadingNewLine(): boolean { return hasTriviaNewLine(this._leadingTriviaInfo); }
        public hasLeadingSkippedText(): boolean { return false; }
        public leadingTriviaWidth(): number { return getTriviaWidth(this._leadingTriviaInfo); }
        public leadingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, 0, this.leadingTriviaWidth(), /*isTrailing:*/ false); }

        public hasTrailingTrivia(): boolean { return true; }
        public hasTrailingComment(): boolean { return hasTriviaComment(this._trailingTriviaInfo); }
        public hasTrailingNewLine(): boolean { return hasTriviaNewLine(this._trailingTriviaInfo); }
        public hasTrailingSkippedText(): boolean { return false; }
        public trailingTriviaWidth(): number { return getTriviaWidth(this._trailingTriviaInfo); }
        public trailingTrivia(): ISyntaxTriviaList { return Scanner.scanTrivia(this, this._fullText, this._fullStart, this.leadingTriviaWidth() + this.width(), this.trailingTriviaWidth(), /*isTrailing:*/ true); }

        public hasSkippedToken(): boolean { return false; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken(): ISyntaxToken { return this; }
        public lastToken(): ISyntaxToken { return this; }
        public isTypeScriptSpecific(): boolean { return false; }
        public isIncrementallyUnusable(): boolean { return this.fullWidth() === 0 || SyntaxFacts.isAnyDivideOrRegularExpressionToken(this.tokenKind); }
        public accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }
        private realize(): ISyntaxToken { return realizeToken(this); }
        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.previousToken(this, includeSkippedTokens); }
        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken { return Syntax.nextToken(this, includeSkippedTokens); }
        public collectTextElements(elements: string[]): void { collectTokenTextElements(this, elements); }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }
	    
        //RefScript - begin
		public toRsAST(helper: RsHelper): RsAST { return toRsAST(this, helper); }
		public toRsExp(helper: RsHelper): RsExpression {return toRsExp(this, helper); } 
		public toRsStmt(helper: RsHelper): RsStatement { return toRsStmt(this, helper); }
		public toRsId(helper: RsHelper): RsId { return toRsId(this, helper); }
		public toRsMemList(helper: RsHelper): RsASTList<RsAST> { return toRsMemList(this, helper); } 
		public toRsLValue(helper: RsHelper): RsLValue { return toRsLValue(this, helper); }
		public toRsClassElt(helper: RsHelper): RsClassElt { return toRsClassElt(this, helper); } 
		public toRsForInit(helper: RsHelper): RsForInit { return toRsForInit(this, helper); } 
		public toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike { return toRsVarDecl(this, helper, anns); } 
		//RefScript - end

   }

    function collectTokenTextElements(token: ISyntaxToken, elements: string[]): void {
        token.leadingTrivia().collectTextElements(elements);
        elements.push(token.text());
        token.trailingTrivia().collectTextElements(elements);
    }

    function getTriviaWidth(value: number): number {
        return value >>> SyntaxConstants.TriviaFullWidthShift;
    }

    function hasTriviaComment(value: number): boolean {
        return (value & SyntaxConstants.TriviaCommentMask) !== 0;
    }

    function hasTriviaNewLine(value: number): boolean {
        return (value & SyntaxConstants.TriviaNewLineMask) !== 0;
    }
}