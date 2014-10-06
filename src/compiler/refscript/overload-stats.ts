///<reference path='..\typescript.ts' />

module TypeScript {
    class OverloadState {
        constructor(public semanticInfoChain: SemanticInfoChain,
                    public funcs: {[name:string]:number} = {}) { }
    }

    export class OverloadStatGatherer {
        private static pre(ast: ISyntaxElement, state: OverloadState) {
            switch (ast.kind()) {
                //case SyntaxKind.ConstructorDeclaration:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.MemberFunctionDeclaration:
                    var functionDecl = state.semanticInfoChain.getDeclForAST(ast);
                    var name = functionDecl.name;
                    if (name in state.funcs) break;
                    var funcSymbol = functionDecl.getSymbol();
                    var funcTypeSymbol = funcSymbol.type;
                    var signatures = funcTypeSymbol.getCallSignatures();
                    state.funcs[name] = signatures.length;
            }
        }

        public static gather(document: Document, semanticInfoChain: SemanticInfoChain) {
            var sourceUnit = document.sourceUnit();
            var state = new OverloadState(semanticInfoChain);
            getAstWalkerFactory().simpleWalk(document.sourceUnit(),
                OverloadStatGatherer.pre, null, state);

            var normalFuncs = 0;
            var overloadFuncs = 0;
            for (var func in state.funcs) {
                if (state.funcs[func] > 1) overloadFuncs ++;
                else                       normalFuncs++;
            }

            console.log("Overloaded functions: " + overloadFuncs);
            console.log("Other functions: " + normalFuncs);
        }
    }
}
