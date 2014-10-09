///<reference path='..\typescript.ts' />

module TypeScript {
    class OverloadState {
        constructor(public semanticInfoChain: SemanticInfoChain,
                    public funcs = new Map(),
                    public overloadFuncs = 0,
                    public normalFuncs = 0) { }
    }

    // based on d3's map
    class Map {
        private s:{[name:string]:PullTypeSymbol[]};
        private static PREFIX = "\0"; // prevent collision with built-ins
        constructor() { this.s = {}; }
        get(key:string) { return this.s[Map.PREFIX + key]; }
        set(key:string, value:any) { return this.s[Map.PREFIX + key] = value; }
    }

    function contains<T>(arr:T[], val:T) {
        for (var i in arr) { if (arr[i] == val) return true; }
        return false;
    }

    export class OverloadStatGatherer {
        private static pre(ast: ISyntaxElement, state: OverloadState) {
            switch (ast.kind()) {
                //case SyntaxKind.ConstructorDeclaration:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.MemberFunctionDeclaration:
                case SyntaxKind.MethodSignature:
                //case SyntaxKind.CallSignature:
                    var functionDecl = state.semanticInfoChain.getDeclForAST(ast);
                    var name = functionDecl.name;
                    console.log(name);
                    var funcSymbol = functionDecl.getSymbol();
                    var container = funcSymbol.getContainer();
                    var previouslySeenContainers = state.funcs.get(name);
                    if (!previouslySeenContainers) previouslySeenContainers = [];
                    if (contains(previouslySeenContainers, container)) break;
                    previouslySeenContainers.push(container);
                    state.funcs.set(name, previouslySeenContainers);
                    var funcTypeSymbol = funcSymbol.type;
                    var signatures = funcTypeSymbol.getCallSignatures().length;
                    signatures > 1 ? state.overloadFuncs++ : state.normalFuncs++;
            }
        }

        public static gather(document: Document, semanticInfoChain: SemanticInfoChain) {
            var sourceUnit = document.sourceUnit();
            var state = new OverloadState(semanticInfoChain);

            getAstWalkerFactory().simpleWalk(document.sourceUnit(),
                OverloadStatGatherer.pre, null, state);

            console.log("Overloaded functions: " + state.overloadFuncs);
            console.log("Other functions: " + state.normalFuncs);
        }
    }
}
