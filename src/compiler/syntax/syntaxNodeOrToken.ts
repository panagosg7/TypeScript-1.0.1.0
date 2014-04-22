///<reference path='references.ts' />

module TypeScript {
    export interface ISyntaxNodeOrToken extends ISyntaxElement {
        withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxNodeOrToken;
        withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxNodeOrToken;

        accept(visitor: ISyntaxVisitor): any;

        //RefScript - begin
		toRsAST(helper: RsHelper): RsAST;
		toRsExp(helper: RsHelper): RsExpression;
		toRsStmt(helper: RsHelper): RsStatement;
		toRsId(helper: RsHelper): RsId;
		toRsLValue(helper: RsHelper): RsLValue;
		toRsClassElt(helper: RsHelper): RsClassElt;
		toRsForInit(helper: RsHelper): RsForInit;
        toRsMemList<T extends RsAST>(helper: RsHelper): RsASTList<T>;
		toRsVarDecl(helper: RsHelper, anns: RsBindAnnotation[]): IRsVarDeclLike;
		//RefScript - end

    }
}