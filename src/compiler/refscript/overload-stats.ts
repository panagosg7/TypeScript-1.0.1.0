///<reference path='..\typescript.ts' />

//TODO (known bug): doesn't handle e.g. interface I { field: () => number; }
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

    function numCallSigChildren(ast: ISyntaxElement) {
        var numChildren = ast.childCount();
        var ans = 0;
        for (var i = 0; i < numChildren; i++) {
            //TODO: not sure why the non-null check is needed
            if (ast.childAt(i) && ast.childAt(i).kind() == SyntaxKind.CallSignature) {
                ans++;
            }
        }
        return ans;
    }

    export class OverloadStatGatherer {
        private static pre(ast: ISyntaxElement, state: OverloadState) {
            switch (ast.kind()) {
                //case SyntaxKind.ConstructorDeclaration:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.MemberFunctionDeclaration:
                case SyntaxKind.MethodSignature:
                    var functionDecl = state.semanticInfoChain.getDeclForAST(ast);
                    var name = functionDecl.name;
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
                    break;
                default:
                    var callSigs = numCallSigChildren(ast);
                    if (callSigs == 1) state.normalFuncs++;
                    if (callSigs > 1) state.overloadFuncs++;
                    break;
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
