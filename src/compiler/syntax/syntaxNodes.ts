///<reference path='references.ts' />

module TypeScript {

    //RefScript - TODO - begin
    /* Get the annotations that lead a token */

    export function leadingTokenAnnots(token: ISyntaxElement, context?: AnnotContext): RsAnnotation[] {
        return tokenAnnots(token, true, context);
    }

    export function trailingTokenAnnots(token: ISyntaxElement, context?: AnnotContext): RsAnnotation[] {
        return tokenAnnots(token, false, context);
    }

    function tokenAnnots(token: ISyntaxElement, lead: boolean, context?: AnnotContext): RsAnnotation[] {

        if (!token) return [];

        var ctx = (context !== undefined) ? context : AnnotContext.OtherContext;

        var commentTrivia = (lead) ? token.leadingTrivia().toArray().filter(t => t.kind() === SyntaxKind.MultiLineCommentTrivia) :
            token.trailingTrivia().toArray().filter(t => t.kind() === SyntaxKind.MultiLineCommentTrivia);

        var match = commentTrivia.map(ct => {
            var cstart = ct.fullStart();
            var matchStr = ct.fullText().match(/\/\*@([^]*)\*\//g);
            if (matchStr && matchStr[0]) {
                var fullStr = matchStr[0];
                var cstring = fullStr.substring(3, fullStr.length - 2);
                var startLineAndChar = ct.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstart);
                var endLineAndChar = ct.syntaxTree().lineMap().getLineAndCharacterFromPosition(cstart + cstring.length);
                var ss = new RsSrcSpan(ct.syntaxTree().sourceUnit().fileName(), startLineAndChar, endLineAndChar);
                return new Pair(ss, cstring);
            }
            return null;
        });

        return match.filter(t => t !== null).map(t => RsAnnotation.createAnnotation(t.snd(), ctx, t.fst()));
    }
    //RefScript - end


    export class SourceUnitSyntax extends SyntaxNode {
        public _syntaxTree: SyntaxTree = null;
        constructor(public moduleElements: ISyntaxList<IModuleElementSyntax>,
            public endOfFileToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitSourceUnit(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.SourceUnit;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.moduleElements;
                case 1: return this.endOfFileToken;
                default: throw Errors.invalidOperation();
            }
        }

        public syntaxTree(): SyntaxTree {
            return this._syntaxTree;
        }

        public update(moduleElements: ISyntaxList<IModuleElementSyntax>,
            endOfFileToken: ISyntaxToken): SourceUnitSyntax {
            if (this.moduleElements === moduleElements && this.endOfFileToken === endOfFileToken) {
                return this;
            }

            return new SourceUnitSyntax(moduleElements, endOfFileToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(endOfFileToken: ISyntaxToken): SourceUnitSyntax {
            return new SourceUnitSyntax(Syntax.emptyList<IModuleElementSyntax>(), endOfFileToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(endOfFileToken: ISyntaxToken): SourceUnitSyntax {
            return new SourceUnitSyntax(Syntax.emptyList<IModuleElementSyntax>(), endOfFileToken, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): SourceUnitSyntax {
            return <SourceUnitSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): SourceUnitSyntax {
            return <SourceUnitSyntax>super.withTrailingTrivia(trivia);
        }

        public withModuleElements(moduleElements: ISyntaxList<IModuleElementSyntax>): SourceUnitSyntax {
            return this.update(moduleElements, this.endOfFileToken);
        }

        public withModuleElement(moduleElement: IModuleElementSyntax): SourceUnitSyntax {
            return this.withModuleElements(Syntax.list<IModuleElementSyntax>([moduleElement]));
        }

        public withEndOfFileToken(endOfFileToken: ISyntaxToken): SourceUnitSyntax {
            return this.update(this.moduleElements, endOfFileToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.moduleElements.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - DONE - begin
        public toRsAST(helper: RsHelper): RsAST {

            //Top-level should be a statement
            return this.moduleElements.toRsStmt(helper);

        }
        //RefScript - end
    }

    export class ExternalModuleReferenceSyntax extends SyntaxNode implements IModuleReferenceSyntax {
        constructor(public requireKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public stringLiteral: ISyntaxToken,
            public closeParenToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitExternalModuleReference(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ExternalModuleReference;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.requireKeyword;
                case 1: return this.openParenToken;
                case 2: return this.stringLiteral;
                case 3: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleReference(): boolean {
            return true;
        }

        public update(requireKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            stringLiteral: ISyntaxToken,
            closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax {
            if (this.requireKeyword === requireKeyword && this.openParenToken === openParenToken && this.stringLiteral === stringLiteral && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ExternalModuleReferenceSyntax(requireKeyword, openParenToken, stringLiteral, closeParenToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(stringLiteral: ISyntaxToken): ExternalModuleReferenceSyntax {
            return new ExternalModuleReferenceSyntax(Syntax.token(SyntaxKind.RequireKeyword), Syntax.token(SyntaxKind.OpenParenToken), stringLiteral, Syntax.token(SyntaxKind.CloseParenToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExternalModuleReferenceSyntax {
            return <ExternalModuleReferenceSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExternalModuleReferenceSyntax {
            return <ExternalModuleReferenceSyntax>super.withTrailingTrivia(trivia);
        }

        public withRequireKeyword(requireKeyword: ISyntaxToken): ExternalModuleReferenceSyntax {
            return this.update(requireKeyword, this.openParenToken, this.stringLiteral, this.closeParenToken);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ExternalModuleReferenceSyntax {
            return this.update(this.requireKeyword, openParenToken, this.stringLiteral, this.closeParenToken);
        }

        public withStringLiteral(stringLiteral: ISyntaxToken): ExternalModuleReferenceSyntax {
            return this.update(this.requireKeyword, this.openParenToken, stringLiteral, this.closeParenToken);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax {
            return this.update(this.requireKeyword, this.openParenToken, this.stringLiteral, closeParenToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ModuleNameModuleReferenceSyntax extends SyntaxNode implements IModuleReferenceSyntax {
        constructor(public moduleName: INameSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitModuleNameModuleReference(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ModuleNameModuleReference;
        }

        public childCount(): number {
            return 1;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.moduleName;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleReference(): boolean {
            return true;
        }

        public update(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax {
            if (this.moduleName === moduleName) {
                return this;
            }

            return new ModuleNameModuleReferenceSyntax(moduleName, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ModuleNameModuleReferenceSyntax {
            return <ModuleNameModuleReferenceSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ModuleNameModuleReferenceSyntax {
            return <ModuleNameModuleReferenceSyntax>super.withTrailingTrivia(trivia);
        }

        public withModuleName(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax {
            return this.update(moduleName);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ImportDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public importKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public equalsToken: ISyntaxToken,
            public moduleReference: IModuleReferenceSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitImportDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ImportDeclaration;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.importKeyword;
                case 2: return this.identifier;
                case 3: return this.equalsToken;
                case 4: return this.moduleReference;
                case 5: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            importKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            equalsToken: ISyntaxToken,
            moduleReference: IModuleReferenceSyntax,
            semicolonToken: ISyntaxToken): ImportDeclarationSyntax {
            if (this.modifiers === modifiers && this.importKeyword === importKeyword && this.identifier === identifier && this.equalsToken === equalsToken && this.moduleReference === moduleReference && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ImportDeclarationSyntax(modifiers, importKeyword, identifier, equalsToken, moduleReference, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(importKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            equalsToken: ISyntaxToken,
            moduleReference: IModuleReferenceSyntax,
            semicolonToken: ISyntaxToken): ImportDeclarationSyntax {
            return new ImportDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), importKeyword, identifier, equalsToken, moduleReference, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken,
            moduleReference: IModuleReferenceSyntax): ImportDeclarationSyntax {
            return new ImportDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.ImportKeyword), identifier, Syntax.token(SyntaxKind.EqualsToken), moduleReference, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ImportDeclarationSyntax {
            return <ImportDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ImportDeclarationSyntax {
            return <ImportDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): ImportDeclarationSyntax {
            return this.update(modifiers, this.importKeyword, this.identifier, this.equalsToken, this.moduleReference, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): ImportDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withImportKeyword(importKeyword: ISyntaxToken): ImportDeclarationSyntax {
            return this.update(this.modifiers, importKeyword, this.identifier, this.equalsToken, this.moduleReference, this.semicolonToken);
        }

        public withIdentifier(identifier: ISyntaxToken): ImportDeclarationSyntax {
            return this.update(this.modifiers, this.importKeyword, identifier, this.equalsToken, this.moduleReference, this.semicolonToken);
        }

        public withEqualsToken(equalsToken: ISyntaxToken): ImportDeclarationSyntax {
            return this.update(this.modifiers, this.importKeyword, this.identifier, equalsToken, this.moduleReference, this.semicolonToken);
        }

        public withModuleReference(moduleReference: IModuleReferenceSyntax): ImportDeclarationSyntax {
            return this.update(this.modifiers, this.importKeyword, this.identifier, this.equalsToken, moduleReference, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ImportDeclarationSyntax {
            return this.update(this.modifiers, this.importKeyword, this.identifier, this.equalsToken, this.moduleReference, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ExportAssignmentSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public exportKeyword: ISyntaxToken,
            public equalsToken: ISyntaxToken,
            public identifier: ISyntaxToken,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitExportAssignment(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ExportAssignment;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.exportKeyword;
                case 1: return this.equalsToken;
                case 2: return this.identifier;
                case 3: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(exportKeyword: ISyntaxToken,
            equalsToken: ISyntaxToken,
            identifier: ISyntaxToken,
            semicolonToken: ISyntaxToken): ExportAssignmentSyntax {
            if (this.exportKeyword === exportKeyword && this.equalsToken === equalsToken && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ExportAssignmentSyntax(exportKeyword, equalsToken, identifier, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(identifier: ISyntaxToken): ExportAssignmentSyntax {
            return new ExportAssignmentSyntax(Syntax.token(SyntaxKind.ExportKeyword), Syntax.token(SyntaxKind.EqualsToken), identifier, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExportAssignmentSyntax {
            return <ExportAssignmentSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExportAssignmentSyntax {
            return <ExportAssignmentSyntax>super.withTrailingTrivia(trivia);
        }

        public withExportKeyword(exportKeyword: ISyntaxToken): ExportAssignmentSyntax {
            return this.update(exportKeyword, this.equalsToken, this.identifier, this.semicolonToken);
        }

        public withEqualsToken(equalsToken: ISyntaxToken): ExportAssignmentSyntax {
            return this.update(this.exportKeyword, equalsToken, this.identifier, this.semicolonToken);
        }

        public withIdentifier(identifier: ISyntaxToken): ExportAssignmentSyntax {
            return this.update(this.exportKeyword, this.equalsToken, identifier, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ExportAssignmentSyntax {
            return this.update(this.exportKeyword, this.equalsToken, this.identifier, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ClassDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public classKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public typeParameterList: TypeParameterListSyntax,
            public heritageClauses: ISyntaxList<HeritageClauseSyntax>,
            public openBraceToken: ISyntaxToken,
            public classElements: ISyntaxList<IClassElementSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitClassDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ClassDeclaration;
        }

        public childCount(): number {
            return 8;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.classKeyword;
                case 2: return this.identifier;
                case 3: return this.typeParameterList;
                case 4: return this.heritageClauses;
                case 5: return this.openBraceToken;
                case 6: return this.classElements;
                case 7: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            classKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            typeParameterList: TypeParameterListSyntax,
            heritageClauses: ISyntaxList<HeritageClauseSyntax>,
            openBraceToken: ISyntaxToken,
            classElements: ISyntaxList<IClassElementSyntax>,
            closeBraceToken: ISyntaxToken): ClassDeclarationSyntax {
            if (this.modifiers === modifiers && this.classKeyword === classKeyword && this.identifier === identifier && this.typeParameterList === typeParameterList && this.heritageClauses === heritageClauses && this.openBraceToken === openBraceToken && this.classElements === classElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ClassDeclarationSyntax(modifiers, classKeyword, identifier, typeParameterList, heritageClauses, openBraceToken, classElements, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(classKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): ClassDeclarationSyntax {
            return new ClassDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), classKeyword, identifier, null, Syntax.emptyList<HeritageClauseSyntax>(), openBraceToken, Syntax.emptyList<IClassElementSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): ClassDeclarationSyntax {
            return new ClassDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.ClassKeyword), identifier, null, Syntax.emptyList<HeritageClauseSyntax>(), Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptyList<IClassElementSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ClassDeclarationSyntax {
            return <ClassDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ClassDeclarationSyntax {
            return <ClassDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): ClassDeclarationSyntax {
            return this.update(modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withModifier(modifier: ISyntaxToken): ClassDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withClassKeyword(classKeyword: ISyntaxToken): ClassDeclarationSyntax {
            return this.update(this.modifiers, classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withIdentifier(identifier: ISyntaxToken): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, this.identifier, typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withHeritageClauses(heritageClauses: ISyntaxList<HeritageClauseSyntax>): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, heritageClauses, this.openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withHeritageClause(heritageClause: HeritageClauseSyntax): ClassDeclarationSyntax {
            return this.withHeritageClauses(Syntax.list<HeritageClauseSyntax>([heritageClause]));
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, openBraceToken, this.classElements, this.closeBraceToken);
        }

        public withClassElements(classElements: ISyntaxList<IClassElementSyntax>): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, classElements, this.closeBraceToken);
        }

        public withClassElement(classElement: IClassElementSyntax): ClassDeclarationSyntax {
            return this.withClassElements(Syntax.list<IClassElementSyntax>([classElement]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ClassDeclarationSyntax {
            return this.update(this.modifiers, this.classKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.openBraceToken, this.classElements, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }


        //RefScript - TODO - begin
        private makeid(length: number) {
            var text = "";
            var possible = "0123456789";
            return text;
        }

        private headerAnnotation(helper: RsHelper, anns: RsAnnotation[]): { ann: RsAnnotation; mut: TTVar } {

            //No class annotation given - generate one based on class information from TypeScript.
            if (anns.length === 0) {
                //Type parameters
                var typeParams = (this.typeParameterList ? this.typeParameterList.typeParameters.toNonSeparatorArray() : []).
                    map(t => t.identifier.text());

                //Mutability parameter
                var mutParam = 'M';
                while (typeParams.indexOf(mutParam) !== -1) {
                    var possible = "0123456789";
                    mutParam += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                typeParams.unshift(mutParam);
                var mutType = new TTVar(mutParam);

                //Extends Heritage
                var extendsHeritage = ArrayUtilities.concat(this.heritageClauses.toArray()
                    .map(t => t.toRsHeritage(helper, SyntaxKind.ExtendsKeyword, mutType))
                    .filter(t => t !== null));
                if (extendsHeritage) {
                    switch (extendsHeritage.length) {
                        case 0: var extendsSerial: Serializable = null; break;
                        case 1: var extendsSerial = extendsHeritage[0]; break;
                        default: helper.postDiagnostic(this, DiagnosticCode.Classes_can_only_extend_a_single_class);
                    }
                }
                else {
                    var extendsSerial: Serializable = null;
                }
                //Implements Heritage
                var implementsHeritage = ArrayUtilities.concat(this.heritageClauses.toArray()
                    .map(t => t.toRsHeritage(helper, SyntaxKind.ImplementsKeyword, mutType))
                    .filter(t => t !== null));
                var sourceSpan = helper.getSourceSpan(this);
                return {
                    ann: new RsInferredClassAnnotation(sourceSpan, this.identifier, typeParams, extendsSerial, implementsHeritage),
                    mut: mutType
                };
            }
            else if (anns.length === 1) {
                //TODO: Add sanity checks here - do these annotations agree with the TypeScript ones?
                //This might not be very straightforward because we might need to parse refinement types.
                return {
                    ann: <RsExplicitClassAnnotation> anns[0],
                    mut: undefined
                };
            }
            else {
                helper.postDiagnostic(this, this.identifier.text());
            }
        }

        public toRsStmt(helper: RsHelper): RsStatement {

            helper.pushParentNode(this);

            //Class header annotations
            var originalAnnots = leadingTokenAnnots(this.firstToken());
            //Remove all class annotations and keep the rest
            var restAnnots: RsAnnotation[] = originalAnnots.filter(a => a.kind() !== AnnotKind.RawClass);
            //Is there a class annotation given?
            var classAnnots: RsAnnotation[] = originalAnnots.filter(a => a.kind() === AnnotKind.RawClass);
            //Add the type annotation to the rest

            var _headerAnnotation = this.headerAnnotation(helper, classAnnots);
            var mutabilityVar = _headerAnnotation.mut;

            restAnnots.push(_headerAnnotation.ann);

            var ext = ArrayUtilities.concat(this.heritageClauses.toArray().map(t => t.toRsHeritageIds(helper, SyntaxKind.ExtendsKeyword)));
            var imp = new RsList(ArrayUtilities.concat(this.heritageClauses.toArray().map(t => t.toRsHeritageIds(helper, SyntaxKind.ImplementsKeyword))));

            if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.ExportKeyword)) {
                restAnnots.push(new RsExported(this.getSourceSpan(helper), AnnotKind.RawExported, ""));
            }


            if (this.classElements.toArray().some(v => v.kind() === SyntaxKind.ConstructorDeclaration) ||
                this.firstToken().kind() === SyntaxKind.DeclareKeyword) {
                // A constructor exists
                var classElts = this.classElements.toRsClassElt(helper, mutabilityVar);
            }
            else {


                helper.postDiagnostic(this, DiagnosticCode.Class_0_needs_to_have_an_explicit_constructor, [this.identifier.text()]);

                // TODO : allow missing constructor -- this requires the right initialization
                //        assignments to be added to the inferred one.

            }

            helper.popParentNode();

            return new RsClassStmt(helper.getSourceSpan(this),
                restAnnots, this.identifier.toRsId(helper),
                (ext && ext.length > 0) ? new RsJust(ext[0]) : new RsNothing(),
                imp, classElts);
        }
        //RefScript - end

    }

    export class InterfaceDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public interfaceKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public typeParameterList: TypeParameterListSyntax,
            public heritageClauses: ISyntaxList<HeritageClauseSyntax>,
            public body: ObjectTypeSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitInterfaceDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.InterfaceDeclaration;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.interfaceKeyword;
                case 2: return this.identifier;
                case 3: return this.typeParameterList;
                case 4: return this.heritageClauses;
                case 5: return this.body;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            interfaceKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            typeParameterList: TypeParameterListSyntax,
            heritageClauses: ISyntaxList<HeritageClauseSyntax>,
            body: ObjectTypeSyntax): InterfaceDeclarationSyntax {
            if (this.modifiers === modifiers && this.interfaceKeyword === interfaceKeyword && this.identifier === identifier && this.typeParameterList === typeParameterList && this.heritageClauses === heritageClauses && this.body === body) {
                return this;
            }

            return new InterfaceDeclarationSyntax(modifiers, interfaceKeyword, identifier, typeParameterList, heritageClauses, body, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(interfaceKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            body: ObjectTypeSyntax): InterfaceDeclarationSyntax {
            return new InterfaceDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), interfaceKeyword, identifier, null, Syntax.emptyList<HeritageClauseSyntax>(), body, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): InterfaceDeclarationSyntax {
            return new InterfaceDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.InterfaceKeyword), identifier, null, Syntax.emptyList<HeritageClauseSyntax>(), ObjectTypeSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): InterfaceDeclarationSyntax {
            return <InterfaceDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): InterfaceDeclarationSyntax {
            return <InterfaceDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): InterfaceDeclarationSyntax {
            return this.update(modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.body);
        }

        public withModifier(modifier: ISyntaxToken): InterfaceDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withInterfaceKeyword(interfaceKeyword: ISyntaxToken): InterfaceDeclarationSyntax {
            return this.update(this.modifiers, interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, this.body);
        }

        public withIdentifier(identifier: ISyntaxToken): InterfaceDeclarationSyntax {
            return this.update(this.modifiers, this.interfaceKeyword, identifier, this.typeParameterList, this.heritageClauses, this.body);
        }

        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): InterfaceDeclarationSyntax {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, typeParameterList, this.heritageClauses, this.body);
        }

        public withHeritageClauses(heritageClauses: ISyntaxList<HeritageClauseSyntax>): InterfaceDeclarationSyntax {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, heritageClauses, this.body);
        }

        public withHeritageClause(heritageClause: HeritageClauseSyntax): InterfaceDeclarationSyntax {
            return this.withHeritageClauses(Syntax.list<HeritageClauseSyntax>([heritageClause]));
        }

        public withBody(body: ObjectTypeSyntax): InterfaceDeclarationSyntax {
            return this.update(this.modifiers, this.interfaceKeyword, this.identifier, this.typeParameterList, this.heritageClauses, body);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }


        //RefScript - TODO - begin

        public toRsStmt(helper: RsHelper): RsStatement {
            var originalAnnots = leadingTokenAnnots(this.firstToken());

            // Is this exported?
            if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.ExportKeyword)) {
                originalAnnots.push(new RsExported(this.getSourceSpan(helper), AnnotKind.RawExported, ""));
            }


            //Is there an interface annotation given?
            var headerAnnots: RsAnnotation[] = originalAnnots.filter(a => a.kind() === AnnotKind.RawIface);
            var restAnnots: RsAnnotation[] = originalAnnots.filter(a => a.kind() !== AnnotKind.RawIface);
            var annotStr = "";

            //No interface annotation given - generate one based on the existing interface header
            if (headerAnnots.length === 0) {
                //Name
                annotStr += this.identifier.text() + " ";
                //Type parameters
                var typeParams: string[] = [];
                if (this.typeParameterList) {
                    typeParams = this.typeParameterList.typeParameters.toNonSeparatorArray().map(p=> p.identifier.text());
                }

                //Mutability parameter
                var mutParam = 'M';
                while (typeParams.indexOf(mutParam) !== -1) {
                    var possible = "0123456789";
                    mutParam += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                var mutType = new TTVar(mutParam);

                typeParams.unshift(mutParam);

                annotStr += (typeParams.length > 0) ? ("<" + typeParams.join(", ") + "> ") : " ";

                // Extends Heritage
                var extendsHeritage = ArrayUtilities.concat(this.heritageClauses.toArray()
                    .map(t => t.toRsHeritage(helper, SyntaxKind.ExtendsKeyword, mutParam))
                    .filter(t => t !== null));
                if (extendsHeritage && extendsHeritage.length > 0) {
                    annotStr += "extends " + extendsHeritage.map(h => h.toString()).join(", ") + " ";
                }
            }
            //Otherwise - Use the given annotations
            else if (headerAnnots.length === 1) {
                //TODO: Add sanity checks here - do these annotations agree with the TypeScript ones?
                //This might not be very straightforward because we might need to parse refinement types.
                var headerAnnot = <RsExplicitInterfaceAnnotation> headerAnnots[0];
                annotStr = headerAnnot.content() + " ";
            }
            else {
                helper.postDiagnostic(this, DiagnosticCode.Interface_0_has_multiple_interface_annoatations, [this.identifier.text()]);
            }

            //Body of the interface declaration
            var members: string[][] = this.body.typeMembers.toNonSeparatorArray().map((m: ITypeMemberSyntax) => {
                switch (m.kind()) {

                    case SyntaxKind.MethodSignature:			// Method signature
                        var v = <PropertySignatureSyntax> m;
                        var anns = leadingTokenAnnots(v.propertyName);
                        if (anns.length === 0) {
                            //If there is no annotation
                            var eltDecl = helper.getDeclForAST(v);
                            return [new RsMethSig(eltDecl.name, eltDecl.getSignatureSymbol().toRsTMeth()).toString()];
                        }
                        else {
                            //Annotation provided by user
                            return anns.map(m => m.content());
                        }

                    case SyntaxKind.PropertySignature:			// Field signature
                        var v = <PropertySignatureSyntax> m;
                        var anns = leadingTokenAnnots(v.propertyName);


                        if (anns.length === 0) {
                            //If there is no annotation
                            var eltSymbol = helper.getSymbolForAST(v);
                            return [new RsFieldSig(v.propertyName.text(),
                                eltSymbol.isOptional, eltSymbol.type.toRsType()).toString()];
                        }
                        else {
                            return anns.map(m => m.content());
                        }

                    case SyntaxKind.ConstructSignature:         // Constructor signature
                        var c = <ConstructSignatureSyntax> m;
                        var anns = leadingTokenAnnots(c.newKeyword);
                        if (anns.length === 0) {
                            //If there is no annotation
                            var eltSymbol = helper.getSymbolForAST(c);
                            var ss = <PullSignatureSymbol>eltSymbol;
                            var tParams = ss.getTypeParameters().map(p => p.type.toRsTypeParameter());
                            var tArgs = ss.parameters.map(p => new BoundedRsType(p.name, p.type.toRsType()));
                            if (mutType) {
                                var tRet = ss.returnType.toRsType(MutabilityKind.PresetK, mutType);
                            }
                            else {
                                var tRet = ss.returnType.toRsType();
                            }
                            return [new RsConsSig(new RsTFun(tParams, tArgs, tRet)).toString()];
                        }
                        else {
                            return anns.map(m => m.content());
                        }

                    case SyntaxKind.CallSignature:              // Call signature
                        var cs = <CallSignatureSyntax> m;
                        var anns = leadingTokenAnnots(cs);
                        if (anns.length === 0) {
                            //If there is no annotation
                            var csDecl = helper.getDeclForAST(cs);
                            return [new RsCallSig(csDecl.getSignatureSymbol().toRsTFun()).toString()];
                        }
                        else {
                            return anns.map(m => m.content());
                        }

                    case SyntaxKind.IndexSignature:				// Index signature
                        var is = <IndexSignatureSyntax> m;
                        var symb = helper.getSymbolForAST(is);
                        if (symb.isSignature()) {
                            var sign = <PullSignatureSymbol>symb;
                            //meh ... convert to string
                            if (sign.parameters.length === 1) {
                                return ["[" + sign.parameters.toString() + "]: " + sign.returnType.toRsType().toString()];
                            }
                        }
                    default:
                        helper.postDiagnostic(this, DiagnosticCode.InterfaceDeclaration_member);
                }
            });

            var r: string[] = [];
            for (var i = 0; i < members.length; i++) {
                r = r.concat(members[i]);
            }

            annotStr += "{" + r.join("; ") + "}";

            var sourceSpan = helper.getSourceSpan(this);

            restAnnots.push(new RsBindAnnotation(sourceSpan, AnnotKind.RawIface, Assignability.AErrorAssignability, annotStr));

            // Returning an empty statement
            return new RsIfaceStmt(helper.getSourceSpan(this), restAnnots,
                this.identifier.toRsId(helper));
        }
        //RefScript - end

    }

    export class HeritageClauseSyntax extends SyntaxNode {
        private _kind: SyntaxKind;

        constructor(kind: SyntaxKind,
            public extendsOrImplementsKeyword: ISyntaxToken,
            public typeNames: ISeparatedSyntaxList<INameSyntax>,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            this._kind = kind;
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitHeritageClause(this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.extendsOrImplementsKeyword;
                case 1: return this.typeNames;
                default: throw Errors.invalidOperation();
            }
        }

        public kind(): SyntaxKind {
            return this._kind;
        }

        public update(kind: SyntaxKind,
            extendsOrImplementsKeyword: ISyntaxToken,
            typeNames: ISeparatedSyntaxList<INameSyntax>): HeritageClauseSyntax {
            if (this._kind === kind && this.extendsOrImplementsKeyword === extendsOrImplementsKeyword && this.typeNames === typeNames) {
                return this;
            }

            return new HeritageClauseSyntax(kind, extendsOrImplementsKeyword, typeNames, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): HeritageClauseSyntax {
            return <HeritageClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): HeritageClauseSyntax {
            return <HeritageClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withKind(kind: SyntaxKind): HeritageClauseSyntax {
            return this.update(kind, this.extendsOrImplementsKeyword, this.typeNames);
        }

        public withExtendsOrImplementsKeyword(extendsOrImplementsKeyword: ISyntaxToken): HeritageClauseSyntax {
            return this.update(this._kind, extendsOrImplementsKeyword, this.typeNames);
        }

        public withTypeNames(typeNames: ISeparatedSyntaxList<INameSyntax>): HeritageClauseSyntax {
            return this.update(this._kind, this.extendsOrImplementsKeyword, typeNames);
        }

        public withTypeName(typeName: INameSyntax): HeritageClauseSyntax {
            return this.withTypeNames(Syntax.separatedList<INameSyntax>([typeName]));
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsHeritage(helper: RsHelper, extendsOrImplements: SyntaxKind, mutParam: RsType): Serializable[] {
            if (this.extendsOrImplementsKeyword.kind() === extendsOrImplements) {
                var r = this.typeNames.toNonSeparatorArray().map(t => {
                    switch (t.kind()) {
                        case SyntaxKind.IdentifierName:
                        case SyntaxKind.GenericType:
                        case SyntaxKind.QualifiedName:
                            return helper.getSymbolForAST(t).type.toRsType(MutabilityKind.PresetK, mutParam);
                        default:
                            helper.postDiagnostic(this, DiagnosticCode.HeritageClauses_to_RefScript);
                    }
                });
                return r;
            }
            return null;
        }

        public toRsHeritageIds(helper: RsHelper, extendsOrImplements: SyntaxKind): RsId[] {
            if (this.extendsOrImplementsKeyword.kind() === extendsOrImplements) {
                return this.typeNames.toNonSeparatorArray().map(t => {
                    switch (t.kind()) {
                        case SyntaxKind.IdentifierName:
                        case SyntaxKind.GenericType:
                        case SyntaxKind.QualifiedName:
                            return t.toRsId(helper);
                        default:
                            helper.postDiagnostic(this, DiagnosticCode.HeritageClauses_to_RefScript);
                    }
                });
            }
            return [];
        }
        //RefScript - end

    }

    export class ModuleDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public moduleKeyword: ISyntaxToken,
            public name: INameSyntax,
            public stringLiteral: ISyntaxToken,
            public openBraceToken: ISyntaxToken,
            public moduleElements: ISyntaxList<IModuleElementSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitModuleDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ModuleDeclaration;
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.moduleKeyword;
                case 2: return this.name;
                case 3: return this.stringLiteral;
                case 4: return this.openBraceToken;
                case 5: return this.moduleElements;
                case 6: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            moduleKeyword: ISyntaxToken,
            name: INameSyntax,
            stringLiteral: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            moduleElements: ISyntaxList<IModuleElementSyntax>,
            closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax {
            if (this.modifiers === modifiers && this.moduleKeyword === moduleKeyword && this.name === name && this.stringLiteral === stringLiteral && this.openBraceToken === openBraceToken && this.moduleElements === moduleElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ModuleDeclarationSyntax(modifiers, moduleKeyword, name, stringLiteral, openBraceToken, moduleElements, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(moduleKeyword: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax {
            return new ModuleDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), moduleKeyword, null, null, openBraceToken, Syntax.emptyList<IModuleElementSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ModuleDeclarationSyntax {
            return new ModuleDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.ModuleKeyword), null, null, Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptyList<IModuleElementSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ModuleDeclarationSyntax {
            return <ModuleDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ModuleDeclarationSyntax {
            return <ModuleDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): ModuleDeclarationSyntax {
            return this.update(modifiers, this.moduleKeyword, this.name, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        }

        public withModifier(modifier: ISyntaxToken): ModuleDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withModuleKeyword(moduleKeyword: ISyntaxToken): ModuleDeclarationSyntax {
            return this.update(this.modifiers, moduleKeyword, this.name, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        }

        public withName(name: INameSyntax): ModuleDeclarationSyntax {
            return this.update(this.modifiers, this.moduleKeyword, name, this.stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        }

        public withStringLiteral(stringLiteral: ISyntaxToken): ModuleDeclarationSyntax {
            return this.update(this.modifiers, this.moduleKeyword, this.name, stringLiteral, this.openBraceToken, this.moduleElements, this.closeBraceToken);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): ModuleDeclarationSyntax {
            return this.update(this.modifiers, this.moduleKeyword, this.name, this.stringLiteral, openBraceToken, this.moduleElements, this.closeBraceToken);
        }

        public withModuleElements(moduleElements: ISyntaxList<IModuleElementSyntax>): ModuleDeclarationSyntax {
            return this.update(this.modifiers, this.moduleKeyword, this.name, this.stringLiteral, this.openBraceToken, moduleElements, this.closeBraceToken);
        }

        public withModuleElement(moduleElement: IModuleElementSyntax): ModuleDeclarationSyntax {
            return this.withModuleElements(Syntax.list<IModuleElementSyntax>([moduleElement]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax {
            return this.update(this.modifiers, this.moduleKeyword, this.name, this.stringLiteral, this.openBraceToken, this.moduleElements, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            var originalAnnots = leadingTokenAnnots(this);
            // Is this exported?
            if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.ExportKeyword)) {
                originalAnnots.push(new RsExported(this.getSourceSpan(helper), AnnotKind.RawExported, ""));
            }
            return new RsModuleStmt(helper.getSourceSpan(this), originalAnnots, this.name.toRsId(helper), this.moduleElements.toRsStmt(helper, []));
        }
        //RefScript - end

    }

    export class FunctionDeclarationSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public functionKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            public block: BlockSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitFunctionDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.FunctionDeclaration;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.functionKeyword;
                case 2: return this.identifier;
                case 3: return this.callSignature;
                case 4: return this.block;
                case 5: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            functionKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax,
            semicolonToken: ISyntaxToken): FunctionDeclarationSyntax {
            if (this.modifiers === modifiers && this.functionKeyword === functionKeyword && this.identifier === identifier && this.callSignature === callSignature && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new FunctionDeclarationSyntax(modifiers, functionKeyword, identifier, callSignature, block, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(functionKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            callSignature: CallSignatureSyntax): FunctionDeclarationSyntax {
            return new FunctionDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), functionKeyword, identifier, callSignature, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): FunctionDeclarationSyntax {
            return new FunctionDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.FunctionKeyword), identifier, CallSignatureSyntax.create1(), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionDeclarationSyntax {
            return <FunctionDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionDeclarationSyntax {
            return <FunctionDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): FunctionDeclarationSyntax {
            return this.update(modifiers, this.functionKeyword, this.identifier, this.callSignature, this.block, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): FunctionDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withFunctionKeyword(functionKeyword: ISyntaxToken): FunctionDeclarationSyntax {
            return this.update(this.modifiers, functionKeyword, this.identifier, this.callSignature, this.block, this.semicolonToken);
        }

        public withIdentifier(identifier: ISyntaxToken): FunctionDeclarationSyntax {
            return this.update(this.modifiers, this.functionKeyword, identifier, this.callSignature, this.block, this.semicolonToken);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): FunctionDeclarationSyntax {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, callSignature, this.block, this.semicolonToken);
        }

        public withBlock(block: BlockSyntax): FunctionDeclarationSyntax {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, this.callSignature, block, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): FunctionDeclarationSyntax {
            return this.update(this.modifiers, this.functionKeyword, this.identifier, this.callSignature, this.block, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.modifiers.childCount() > 0) { return true; }
            if (this.callSignature.isTypeScriptSpecific()) { return true; }
            if (this.block !== null && this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - DONE - begin
        public toRsStmt(helper: RsHelper): RsStatement {

            this.callSignature.parameterList.parameters.toNonSeparatorArray().forEach(p => {
                if (p.equalsValueClause) {
                    helper.postDiagnostic(this, DiagnosticCode.Initialization_of_parameter_0_at_the_signature_site_is_not_supported, [p.identifier.text()]);
                }
            });

            var name = this.identifier.text();
            var anns = leadingTokenAnnots(this.firstToken());

            var declID = PullHelpers.getSignatureForFuncDecl(helper.getDeclForAST(this)).signature.pullSymbolID;

            var decl: PullDecl = helper.getDeclForAST(this);

            if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.ExportKeyword)) {
                anns.push(new RsAnnotation(this.getSourceSpan(helper), AnnotKind.RawExported, ""));
            }

            var bindAnns: RsBindAnnotation[] = <RsBindAnnotation[]> anns.filter(a => a.kind() === AnnotKind.RawBind);
            var bindAnnNames: string[] = bindAnns.map(a => (<RsBindAnnotation>a).binderName(this, helper));

            if (bindAnnNames.length === 0) {
                // no annotation -- get the TS inferred one
                var type = decl.getSignatureSymbol().toRsTFun();
                var typeStr = type.toString();
                anns.push(new RsBindAnnotation(helper.getSourceSpan(this), AnnotKind.RawBind, Assignability.AErrorAssignability, this.identifier.text() + " :: " + typeStr));
            }
            else if (bindAnnNames.length !== 1 || bindAnnNames[0] !== name) {
                helper.postDiagnostic(this, DiagnosticCode.Function_0_can_have_at_most_one_type_annotation, [name]);
            }

            if (!this.block) {
                if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.DeclareKeyword)) {
                    // Ambient function declaration
                    return new RsFunctionAmbientDecl(
                        helper.getSourceSpan(this), anns, this.identifier.toRsId(helper),
                        <RsList<RsId>>this.callSignature.parameterList.parameters.toRsAST(helper));
                }
                else {
                    return new RsFunctionOverload(
                        helper.getSourceSpan(this), anns, this.identifier.toRsId(helper),
                        <RsList<RsId>>this.callSignature.parameterList.parameters.toRsAST(helper));
                }
            }
            else {

                // XXX: Disabling this for now


                //var funcName = this.identifier.text();
                // if (/^[A-Z]/.test(funcName)) {
                //	// Constructor Function
                //	return new RsFuncCtorStmt(
                //		helper.getSourceSpan(this), anns, this.identifier.toRsId(helper),
                //		<RsASTList<RsId>>this.callSignature.parameterList.parameters.toRsAST(helper),
                //		new RsASTList([this.block.toRsStmt(helper)]));
                //}
                //else {
                // Function definition
                return new RsFunctionStmt(
                    helper.getSourceSpan(this), anns, this.identifier.toRsId(helper),
                    <RsList<RsId>>this.callSignature.parameterList.parameters.toRsAST(helper),
                    new RsList([this.block.toRsStmt(helper)]));
                //}
            }
        }

        //RefScript - end

    }

    export class VariableStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public variableDeclaration: VariableDeclarationSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitVariableStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.VariableStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.variableDeclaration;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            variableDeclaration: VariableDeclarationSyntax,
            semicolonToken: ISyntaxToken): VariableStatementSyntax {
            if (this.modifiers === modifiers && this.variableDeclaration === variableDeclaration && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new VariableStatementSyntax(modifiers, variableDeclaration, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(variableDeclaration: VariableDeclarationSyntax,
            semicolonToken: ISyntaxToken): VariableStatementSyntax {
            return new VariableStatementSyntax(Syntax.emptyList<ISyntaxToken>(), variableDeclaration, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(variableDeclaration: VariableDeclarationSyntax): VariableStatementSyntax {
            return new VariableStatementSyntax(Syntax.emptyList<ISyntaxToken>(), variableDeclaration, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableStatementSyntax {
            return <VariableStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableStatementSyntax {
            return <VariableStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): VariableStatementSyntax {
            return this.update(modifiers, this.variableDeclaration, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): VariableStatementSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): VariableStatementSyntax {
            return this.update(this.modifiers, variableDeclaration, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): VariableStatementSyntax {
            return this.update(this.modifiers, this.variableDeclaration, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.modifiers.childCount() > 0) { return true; }
            if (this.variableDeclaration.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsAST(helper: RsHelper): RsAST {
            return this.variableDeclaration.toRsAST(helper);
        }

        public toRsStmt(helper: RsHelper): RsStatement {
            var anns: RsAnnotation[] = ArrayUtilities.concat(
                this.modifiers.toArray().map(m => leadingTokenAnnots(m)));

            if (this.modifiers.toArray().some(m => m.tokenKind === SyntaxKind.ExportKeyword)) {
                anns.push(new RsAnnotation(this.getSourceSpan(helper), AnnotKind.RawExported, ""));
            }
            // Pass over the annotations to the lower levels.
            return this.variableDeclaration.toRsStmt(helper, anns);
        }
        //RefScript - end
    }

    export class VariableDeclarationSyntax extends SyntaxNode {
        constructor(public varKeyword: ISyntaxToken,
            public variableDeclarators: ISeparatedSyntaxList<VariableDeclaratorSyntax>,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitVariableDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.VariableDeclaration;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.varKeyword;
                case 1: return this.variableDeclarators;
                default: throw Errors.invalidOperation();
            }
        }

        public update(varKeyword: ISyntaxToken,
            variableDeclarators: ISeparatedSyntaxList<VariableDeclaratorSyntax>): VariableDeclarationSyntax {
            if (this.varKeyword === varKeyword && this.variableDeclarators === variableDeclarators) {
                return this;
            }

            return new VariableDeclarationSyntax(varKeyword, variableDeclarators, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(variableDeclarators: ISeparatedSyntaxList<VariableDeclaratorSyntax>): VariableDeclarationSyntax {
            return new VariableDeclarationSyntax(Syntax.token(SyntaxKind.VarKeyword), variableDeclarators, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableDeclarationSyntax {
            return <VariableDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableDeclarationSyntax {
            return <VariableDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withVarKeyword(varKeyword: ISyntaxToken): VariableDeclarationSyntax {
            return this.update(varKeyword, this.variableDeclarators);
        }

        public withVariableDeclarators(variableDeclarators: ISeparatedSyntaxList<VariableDeclaratorSyntax>): VariableDeclarationSyntax {
            return this.update(this.varKeyword, variableDeclarators);
        }

        public withVariableDeclarator(variableDeclarator: VariableDeclaratorSyntax): VariableDeclarationSyntax {
            return this.withVariableDeclarators(Syntax.separatedList<VariableDeclaratorSyntax>([variableDeclarator]));
        }

        public isTypeScriptSpecific(): boolean {
            if (this.variableDeclarators.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin

		/* The for init case has the annotations before the "for" keyword, so it inherits the annotations
			from its parent. */
        public toRsForInit(helper: RsHelper, parentAnns?: RsAnnotation[]): RsForInit {
            if (parentAnns) {
                var anns = parentAnns;
            } else {
                var anns: RsAnnotation[] = [];
            }
            //All variable declarators need to be translated to either RsVarDecls or EmptyStatements
            var bindAnns = anns.filter(a => a.kind() === AnnotKind.RawBind);
            var noBindAnns = anns.filter(a => a.kind() !== AnnotKind.RawBind);

            var decls = this.variableDeclarators.toRsVarDecl(helper, bindAnns);

            if (decls.members.every(d => d instanceof RsVarDecl)) {
                return new RsVarInit(helper.getSourceSpan(this), noBindAnns, <RsList<RsVarDecl>>decls);
            }
            helper.postDiagnostic(this, DiagnosticCode.For_in_only_non_ambient_variable_declarators_are_allowed_here);
        }

        public toRsStmt(helper: RsHelper, parentAnns?: RsAnnotation[]): RsStatement {

            var anns = leadingTokenAnnots(this.firstToken(), AnnotContext.OtherContext);

            //var anns: RsAnnotation[] = this.varKeyword.leadingTrivia().toArray()
            //	.filter(t => t.kind() === SyntaxKind.MultiLineCommentTrivia)
            //	.map(t => { var r = t.fullText().match("/\*@(([^])*)\\*/"); return (r && r[1]) ? r[1] : null; })
            //	.filter(t => t !== null)
            //	.map(t => RsAnnotation.createAnnotation(t, AnnotContext.OtherContext));

            //All variable declarators need to be translated to either RsVarDecls or EmptyStatements
            var bindAnns = parentAnns.concat(anns).filter(a => a.kind() === AnnotKind.RawBind);
            var noBindAnns = parentAnns.concat(anns).filter(a => a.kind() !== AnnotKind.RawBind);

            //Descend into the variable declarators
            var decls = this.variableDeclarators.toRsVarDecl(helper, bindAnns);

            if (decls.members.every(d => d instanceof RsVarDecl)) {
                return new RsVarDeclStmt(helper.getSourceSpan(this), noBindAnns, <RsList<RsVarDecl>>decls);
            }
            // NO EMPTY STATEMENTS ANY MORE
            //else if (decls.members.every(d => d instanceof RsEmptyStmt)) {
            //    //Here we are dealing with Ambient definitions, so keep all the no-binder annotations as they are,
            //    //and translate the binder ones to extern annotations.
            //    var declAnnots: RsAnnotation[] =
            //        noBindAnns.concat(bindAnns.map(b => new RsGlobalAnnotation(b.sourceSpan(), AnnotKind.RawExtern, b.content())));
            //    return new RsEmptyStmt(helper.getSourceSpan(this), declAnnots);
            //}
            else {
                helper.postDiagnostic(this, DiagnosticCode.All_variable_declarators_need_to_be_translated_to_either_RsVarDecls_or_RsEmptyStmts);
            }
        }
        //RefScript - end
    }

    export class VariableDeclaratorSyntax extends SyntaxNode {
        constructor(public propertyName: ISyntaxToken,
            public typeAnnotation: TypeAnnotationSyntax,
            public equalsValueClause: EqualsValueClauseSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitVariableDeclarator(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.VariableDeclarator;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.typeAnnotation;
                case 2: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }

        public update(propertyName: ISyntaxToken,
            typeAnnotation: TypeAnnotationSyntax,
            equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax {
            if (this.propertyName === propertyName && this.typeAnnotation === typeAnnotation && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new VariableDeclaratorSyntax(propertyName, typeAnnotation, equalsValueClause, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(propertyName: ISyntaxToken): VariableDeclaratorSyntax {
            return new VariableDeclaratorSyntax(propertyName, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): VariableDeclaratorSyntax {
            return new VariableDeclaratorSyntax(propertyName, null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableDeclaratorSyntax {
            return <VariableDeclaratorSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableDeclaratorSyntax {
            return <VariableDeclaratorSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): VariableDeclaratorSyntax {
            return this.update(propertyName, this.typeAnnotation, this.equalsValueClause);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): VariableDeclaratorSyntax {
            return this.update(this.propertyName, typeAnnotation, this.equalsValueClause);
        }

        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax {
            return this.update(this.propertyName, this.typeAnnotation, equalsValueClause);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.typeAnnotation !== null) { return true; }
            if (this.equalsValueClause !== null && this.equalsValueClause.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsVarDecl(helper: RsHelper, anns?: RsBindAnnotation[]): IRsVarDeclLike {

            if (anns) {

                // binderAnns: keep just the relevant binder annotations
                var binderAnns = anns.filter(a => a.binderName(this, helper) === this.propertyName.text());

                var pullDecl = helper.getDeclForAST(this);

                if ((pullDecl.flags & PullElementFlags.Ambient) === PullElementFlags.Ambient) {

                    // Refscript treats ambient variable declarations as normal declarations.
                    if (binderAnns.length === 0) {
                        var type: RsType = helper.getDeclForAST(this).getSymbol().type.toRsType();
                        if (type instanceof TError) {
                            var tError = <TError>type;
                            helper.postDiagnostic(this, DiagnosticCode.Cannot_translate_type_0_into_RefScript_type, [tError.message()]);
                        }
                        var typeStr = type.toString();
                        anns.push(new RsBindAnnotation(helper.getSourceSpan(this), AnnotKind.RawAmbBind, Assignability.AErrorAssignability, this.propertyName.text() + " :: " + typeStr));
                        return new RsVarDecl(helper.getSourceSpan(this), anns, this.propertyName.toRsId(helper), new RsNothing());

                    }
                    else if (binderAnns.length === 1) {

                        binderAnns[0]["_kind"] = AnnotKind.RawAmbBind;
                        return new RsVarDecl(helper.getSourceSpan(this), binderAnns, this.propertyName.toRsId(helper), new RsNothing());

                    }
                    helper.postDiagnostic(this, DiagnosticCode.Ambient_variable_declarator_for_0_needs_to_have_at_least_one_type_annotation,
                        [this.propertyName.text()]);
                }

                //This is a normal declaration
                if (binderAnns.length < 2) {

                    //All necessary binders need to be in @anns@
                    return new RsVarDecl(helper.getSourceSpan(this),
                        ArrayUtilities.concat([binderAnns]), this.propertyName.toRsId(helper),
                        (this.equalsValueClause) ? new RsJust(this.equalsValueClause.toRsExp(helper)) : new RsNothing());
                }

                helper.postDiagnostic(this, DiagnosticCode.Variable_declarator_for_0_needs_to_have_at_most_one_type_annotation,
                    [this.propertyName.text()]);
            }
        }
        ////RefScript - end
    }

    export class EqualsValueClauseSyntax extends SyntaxNode {
        constructor(public equalsToken: ISyntaxToken,
            public value: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitEqualsValueClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.EqualsValueClause;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.equalsToken;
                case 1: return this.value;
                default: throw Errors.invalidOperation();
            }
        }

        public update(equalsToken: ISyntaxToken,
            value: IExpressionSyntax): EqualsValueClauseSyntax {
            if (this.equalsToken === equalsToken && this.value === value) {
                return this;
            }

            return new EqualsValueClauseSyntax(equalsToken, value, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(value: IExpressionSyntax): EqualsValueClauseSyntax {
            return new EqualsValueClauseSyntax(Syntax.token(SyntaxKind.EqualsToken), value, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): EqualsValueClauseSyntax {
            return <EqualsValueClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): EqualsValueClauseSyntax {
            return <EqualsValueClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withEqualsToken(equalsToken: ISyntaxToken): EqualsValueClauseSyntax {
            return this.update(equalsToken, this.value);
        }

        public withValue(value: IExpressionSyntax): EqualsValueClauseSyntax {
            return this.update(this.equalsToken, value);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.value.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return this.value.toRsExp(helper);
        }
        //RefScript - end
    }

    export class PrefixUnaryExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        private _kind: SyntaxKind;

        constructor(kind: SyntaxKind,
            public operatorToken: ISyntaxToken,
            public operand: IUnaryExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            this._kind = kind;
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitPrefixUnaryExpression(this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.operatorToken;
                case 1: return this.operand;
                default: throw Errors.invalidOperation();
            }
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public kind(): SyntaxKind {
            return this._kind;
        }

        public update(kind: SyntaxKind,
            operatorToken: ISyntaxToken,
            operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax {
            if (this._kind === kind && this.operatorToken === operatorToken && this.operand === operand) {
                return this;
            }

            return new PrefixUnaryExpressionSyntax(kind, operatorToken, operand, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): PrefixUnaryExpressionSyntax {
            return <PrefixUnaryExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): PrefixUnaryExpressionSyntax {
            return <PrefixUnaryExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withKind(kind: SyntaxKind): PrefixUnaryExpressionSyntax {
            return this.update(kind, this.operatorToken, this.operand);
        }

        public withOperatorToken(operatorToken: ISyntaxToken): PrefixUnaryExpressionSyntax {
            return this.update(this._kind, operatorToken, this.operand);
        }

        public withOperand(operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax {
            return this.update(this._kind, this.operatorToken, operand);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.operand.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            var anns = leadingTokenAnnots(this.operatorToken);
            switch (this.kind()) {
                case SyntaxKind.ObjectLiteralExpression:
                    return new RsObjectLit(helper.getSourceSpan(this), anns, this.operand.toRsMemList(helper));
                case SyntaxKind.PostIncrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), anns, new RsUnaryAssignOp(RsUnaryAssignOpKind.PostfixInc), this.operand.toRsLValue(helper));
                case SyntaxKind.PreIncrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), anns, new RsUnaryAssignOp(RsUnaryAssignOpKind.PrefixInc), this.operand.toRsLValue(helper));
                case SyntaxKind.PostDecrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), anns, new RsUnaryAssignOp(RsUnaryAssignOpKind.PostfixDec), this.operand.toRsLValue(helper));
                case SyntaxKind.PreDecrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), anns, new RsUnaryAssignOp(RsUnaryAssignOpKind.PrefixDec), this.operand.toRsLValue(helper));

                case SyntaxKind.PlusExpression:
                    return new RsPrefixExpr(helper.getSourceSpan(this), anns, new RsPrefixOp(RsPrefixOpKind.PrefixPlus), this.operand.toRsExp(helper));

                case SyntaxKind.NegateExpression:
                    return new RsPrefixExpr(helper.getSourceSpan(this), anns, new RsPrefixOp(RsPrefixOpKind.PrefixMinus), this.operand.toRsExp(helper));

                case SyntaxKind.LogicalNotExpression:
                    return new RsPrefixExpr(helper.getSourceSpan(this), anns, new RsPrefixOp(RsPrefixOpKind.PrefixLNot), this.operand.toRsExp(helper));

                case SyntaxKind.TypeOfExpression:
                    return new RsPrefixExpr(helper.getSourceSpan(this), anns, new RsPrefixOp(RsPrefixOpKind.PrefixTypeof), this.operand.toRsExp(helper));

                case SyntaxKind.BitwiseNotExpression:
                    return new RsPrefixExpr(helper.getSourceSpan(this), anns, new RsPrefixOp(RsPrefixOpKind.PrefixBNot), this.operand.toRsExp(helper));

                case SyntaxKind.CastExpression:
                    return this.toRsExp(helper);
                default:
                    helper.postDiagnostic(this, DiagnosticCode.
                        Cannot_call_toRsExp_on_a_UnaryExpression_with_SyntaxKind_0,
                        [SyntaxKind[this.kind()]]);
            }
        }
        //RefScript - end
    }

    export class ArrayLiteralExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        constructor(public openBracketToken: ISyntaxToken,
            public expressions: ISeparatedSyntaxList<IExpressionSyntax>,
            public closeBracketToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitArrayLiteralExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ArrayLiteralExpression;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBracketToken;
                case 1: return this.expressions;
                case 2: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isPrimaryExpression(): boolean {
            return true;
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(openBracketToken: ISyntaxToken,
            expressions: ISeparatedSyntaxList<IExpressionSyntax>,
            closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax {
            if (this.openBracketToken === openBracketToken && this.expressions === expressions && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ArrayLiteralExpressionSyntax(openBracketToken, expressions, closeBracketToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openBracketToken: ISyntaxToken,
            closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax {
            return new ArrayLiteralExpressionSyntax(openBracketToken, Syntax.emptySeparatedList<IExpressionSyntax>(), closeBracketToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ArrayLiteralExpressionSyntax {
            return new ArrayLiteralExpressionSyntax(Syntax.token(SyntaxKind.OpenBracketToken), Syntax.emptySeparatedList<IExpressionSyntax>(), Syntax.token(SyntaxKind.CloseBracketToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArrayLiteralExpressionSyntax {
            return <ArrayLiteralExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArrayLiteralExpressionSyntax {
            return <ArrayLiteralExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenBracketToken(openBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax {
            return this.update(openBracketToken, this.expressions, this.closeBracketToken);
        }

        public withExpressions(expressions: ISeparatedSyntaxList<IExpressionSyntax>): ArrayLiteralExpressionSyntax {
            return this.update(this.openBracketToken, expressions, this.closeBracketToken);
        }

        public withExpression(expression: IExpressionSyntax): ArrayLiteralExpressionSyntax {
            return this.withExpressions(Syntax.separatedList<IExpressionSyntax>([expression]));
        }

        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax {
            return this.update(this.openBracketToken, this.expressions, closeBracketToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expressions.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - DONE - begin

        public toRsExp(helper: RsHelper): RsExpression {
            return new RsArrayLit(helper.getSourceSpan(this), leadingTokenAnnots(this.openBracketToken), this.expressions.toRsExp(helper));
        }
        //RefScript - end
    }

    export class OmittedExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        constructor(parsedInStrictMode: boolean) {
            super(parsedInStrictMode);
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitOmittedExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.OmittedExpression;
        }

        public childCount(): number {
            return 0;
        }

        public childAt(slot: number): ISyntaxElement {
            throw Errors.invalidOperation();
        }

        public isExpression(): boolean {
            return true;
        }

        public update(): OmittedExpressionSyntax {
            return this;
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): OmittedExpressionSyntax {
            return <OmittedExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): OmittedExpressionSyntax {
            return <OmittedExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public isTypeScriptSpecific(): boolean {
            return false;
        }
    }

    export class ParenthesizedExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        constructor(public openParenToken: ISyntaxToken,
            public expression: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitParenthesizedExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ParenthesizedExpression;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openParenToken;
                case 1: return this.expression;
                case 2: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isPrimaryExpression(): boolean {
            return true;
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(openParenToken: ISyntaxToken,
            expression: IExpressionSyntax,
            closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax {
            if (this.openParenToken === openParenToken && this.expression === expression && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ParenthesizedExpressionSyntax(openParenToken, expression, closeParenToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IExpressionSyntax): ParenthesizedExpressionSyntax {
            return new ParenthesizedExpressionSyntax(Syntax.token(SyntaxKind.OpenParenToken), expression, Syntax.token(SyntaxKind.CloseParenToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParenthesizedExpressionSyntax {
            return <ParenthesizedExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParenthesizedExpressionSyntax {
            return <ParenthesizedExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ParenthesizedExpressionSyntax {
            return this.update(openParenToken, this.expression, this.closeParenToken);
        }

        public withExpression(expression: IExpressionSyntax): ParenthesizedExpressionSyntax {
            return this.update(this.openParenToken, expression, this.closeParenToken);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax {
            return this.update(this.openParenToken, this.expression, closeParenToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toNanoAST(helper: RsHelper): RsAST {
            return this.expression.toRsAST(helper);
        }

        public toRsExp(helper: RsHelper): RsExpression {
            return this.expression.toRsExp(helper);
        }
        //NanoJS - end

    }

    export class SimpleArrowFunctionExpressionSyntax extends SyntaxNode implements IArrowFunctionExpressionSyntax {
        constructor(public identifier: ISyntaxToken,
            public equalsGreaterThanToken: ISyntaxToken,
            public block: BlockSyntax,
            public expression: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitSimpleArrowFunctionExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.SimpleArrowFunctionExpression;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.equalsGreaterThanToken;
                case 2: return this.block;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isArrowFunctionExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(identifier: ISyntaxToken,
            equalsGreaterThanToken: ISyntaxToken,
            block: BlockSyntax,
            expression: IExpressionSyntax): SimpleArrowFunctionExpressionSyntax {
            if (this.identifier === identifier && this.equalsGreaterThanToken === equalsGreaterThanToken && this.block === block && this.expression === expression) {
                return this;
            }

            return new SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, block, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(identifier: ISyntaxToken,
            equalsGreaterThanToken: ISyntaxToken): SimpleArrowFunctionExpressionSyntax {
            return new SimpleArrowFunctionExpressionSyntax(identifier, equalsGreaterThanToken, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): SimpleArrowFunctionExpressionSyntax {
            return new SimpleArrowFunctionExpressionSyntax(identifier, Syntax.token(SyntaxKind.EqualsGreaterThanToken), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): SimpleArrowFunctionExpressionSyntax {
            return <SimpleArrowFunctionExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): SimpleArrowFunctionExpressionSyntax {
            return <SimpleArrowFunctionExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withIdentifier(identifier: ISyntaxToken): SimpleArrowFunctionExpressionSyntax {
            return this.update(identifier, this.equalsGreaterThanToken, this.block, this.expression);
        }

        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): SimpleArrowFunctionExpressionSyntax {
            return this.update(this.identifier, equalsGreaterThanToken, this.block, this.expression);
        }

        public withBlock(block: BlockSyntax): SimpleArrowFunctionExpressionSyntax {
            return this.update(this.identifier, this.equalsGreaterThanToken, block, this.expression);
        }

        public withExpression(expression: IExpressionSyntax): SimpleArrowFunctionExpressionSyntax {
            return this.update(this.identifier, this.equalsGreaterThanToken, this.block, expression);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ParenthesizedArrowFunctionExpressionSyntax extends SyntaxNode implements IArrowFunctionExpressionSyntax {
        constructor(public callSignature: CallSignatureSyntax,
            public equalsGreaterThanToken: ISyntaxToken,
            public block: BlockSyntax,
            public expression: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitParenthesizedArrowFunctionExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ParenthesizedArrowFunctionExpression;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.callSignature;
                case 1: return this.equalsGreaterThanToken;
                case 2: return this.block;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isArrowFunctionExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(callSignature: CallSignatureSyntax,
            equalsGreaterThanToken: ISyntaxToken,
            block: BlockSyntax,
            expression: IExpressionSyntax): ParenthesizedArrowFunctionExpressionSyntax {
            if (this.callSignature === callSignature && this.equalsGreaterThanToken === equalsGreaterThanToken && this.block === block && this.expression === expression) {
                return this;
            }

            return new ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, block, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(callSignature: CallSignatureSyntax,
            equalsGreaterThanToken: ISyntaxToken): ParenthesizedArrowFunctionExpressionSyntax {
            return new ParenthesizedArrowFunctionExpressionSyntax(callSignature, equalsGreaterThanToken, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ParenthesizedArrowFunctionExpressionSyntax {
            return new ParenthesizedArrowFunctionExpressionSyntax(CallSignatureSyntax.create1(), Syntax.token(SyntaxKind.EqualsGreaterThanToken), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParenthesizedArrowFunctionExpressionSyntax {
            return <ParenthesizedArrowFunctionExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParenthesizedArrowFunctionExpressionSyntax {
            return <ParenthesizedArrowFunctionExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): ParenthesizedArrowFunctionExpressionSyntax {
            return this.update(callSignature, this.equalsGreaterThanToken, this.block, this.expression);
        }

        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): ParenthesizedArrowFunctionExpressionSyntax {
            return this.update(this.callSignature, equalsGreaterThanToken, this.block, this.expression);
        }

        public withBlock(block: BlockSyntax): ParenthesizedArrowFunctionExpressionSyntax {
            return this.update(this.callSignature, this.equalsGreaterThanToken, block, this.expression);
        }

        public withExpression(expression: IExpressionSyntax): ParenthesizedArrowFunctionExpressionSyntax {
            return this.update(this.callSignature, this.equalsGreaterThanToken, this.block, expression);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class QualifiedNameSyntax extends SyntaxNode implements INameSyntax {
        constructor(public left: INameSyntax,
            public dotToken: ISyntaxToken,
            public right: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitQualifiedName(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.QualifiedName;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.left;
                case 1: return this.dotToken;
                case 2: return this.right;
                default: throw Errors.invalidOperation();
            }
        }

        public isName(): boolean {
            return true;
        }

        public isType(): boolean {
            return true;
        }

        public update(left: INameSyntax,
            dotToken: ISyntaxToken,
            right: ISyntaxToken): QualifiedNameSyntax {
            if (this.left === left && this.dotToken === dotToken && this.right === right) {
                return this;
            }

            return new QualifiedNameSyntax(left, dotToken, right, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(left: INameSyntax,
            right: ISyntaxToken): QualifiedNameSyntax {
            return new QualifiedNameSyntax(left, Syntax.token(SyntaxKind.DotToken), right, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): QualifiedNameSyntax {
            return <QualifiedNameSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): QualifiedNameSyntax {
            return <QualifiedNameSyntax>super.withTrailingTrivia(trivia);
        }

        public withLeft(left: INameSyntax): QualifiedNameSyntax {
            return this.update(left, this.dotToken, this.right);
        }

        public withDotToken(dotToken: ISyntaxToken): QualifiedNameSyntax {
            return this.update(this.left, dotToken, this.right);
        }

        public withRight(right: ISyntaxToken): QualifiedNameSyntax {
            return this.update(this.left, this.dotToken, right);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        // RefScript - TODO - begin
        public toRsId(helper: RsHelper): RsId {
            return new RsId(helper.getSourceSpan(this),
                leadingTokenAnnots(this.firstToken()),
                this.left.fullText() + "_" + this.right.fullText());
        }
        // RefScript - end

    }

    export class TypeArgumentListSyntax extends SyntaxNode {
        constructor(public lessThanToken: ISyntaxToken,
            public typeArguments: ISeparatedSyntaxList<ITypeSyntax>,
            public greaterThanToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeArgumentList(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeArgumentList;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.typeArguments;
                case 2: return this.greaterThanToken;
                default: throw Errors.invalidOperation();
            }
        }

        public update(lessThanToken: ISyntaxToken,
            typeArguments: ISeparatedSyntaxList<ITypeSyntax>,
            greaterThanToken: ISyntaxToken): TypeArgumentListSyntax {
            if (this.lessThanToken === lessThanToken && this.typeArguments === typeArguments && this.greaterThanToken === greaterThanToken) {
                return this;
            }

            return new TypeArgumentListSyntax(lessThanToken, typeArguments, greaterThanToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(lessThanToken: ISyntaxToken,
            greaterThanToken: ISyntaxToken): TypeArgumentListSyntax {
            return new TypeArgumentListSyntax(lessThanToken, Syntax.emptySeparatedList<ITypeSyntax>(), greaterThanToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): TypeArgumentListSyntax {
            return new TypeArgumentListSyntax(Syntax.token(SyntaxKind.LessThanToken), Syntax.emptySeparatedList<ITypeSyntax>(), Syntax.token(SyntaxKind.GreaterThanToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeArgumentListSyntax {
            return <TypeArgumentListSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeArgumentListSyntax {
            return <TypeArgumentListSyntax>super.withTrailingTrivia(trivia);
        }

        public withLessThanToken(lessThanToken: ISyntaxToken): TypeArgumentListSyntax {
            return this.update(lessThanToken, this.typeArguments, this.greaterThanToken);
        }

        public withTypeArguments(typeArguments: ISeparatedSyntaxList<ITypeSyntax>): TypeArgumentListSyntax {
            return this.update(this.lessThanToken, typeArguments, this.greaterThanToken);
        }

        public withTypeArgument(typeArgument: ITypeSyntax): TypeArgumentListSyntax {
            return this.withTypeArguments(Syntax.separatedList<ITypeSyntax>([typeArgument]));
        }

        public withGreaterThanToken(greaterThanToken: ISyntaxToken): TypeArgumentListSyntax {
            return this.update(this.lessThanToken, this.typeArguments, greaterThanToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ConstructorTypeSyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public newKeyword: ISyntaxToken,
            public typeParameterList: TypeParameterListSyntax,
            public parameterList: ParameterListSyntax,
            public equalsGreaterThanToken: ISyntaxToken,
            public type: ITypeSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitConstructorType(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ConstructorType;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.typeParameterList;
                case 2: return this.parameterList;
                case 3: return this.equalsGreaterThanToken;
                case 4: return this.type;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(newKeyword: ISyntaxToken,
            typeParameterList: TypeParameterListSyntax,
            parameterList: ParameterListSyntax,
            equalsGreaterThanToken: ISyntaxToken,
            type: ITypeSyntax): ConstructorTypeSyntax {
            if (this.newKeyword === newKeyword && this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.equalsGreaterThanToken === equalsGreaterThanToken && this.type === type) {
                return this;
            }

            return new ConstructorTypeSyntax(newKeyword, typeParameterList, parameterList, equalsGreaterThanToken, type, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(newKeyword: ISyntaxToken,
            parameterList: ParameterListSyntax,
            equalsGreaterThanToken: ISyntaxToken,
            type: ITypeSyntax): ConstructorTypeSyntax {
            return new ConstructorTypeSyntax(newKeyword, null, parameterList, equalsGreaterThanToken, type, /*parsedInStrictMode:*/ false);
        }

        public static create1(type: ITypeSyntax): ConstructorTypeSyntax {
            return new ConstructorTypeSyntax(Syntax.token(SyntaxKind.NewKeyword), null, ParameterListSyntax.create1(), Syntax.token(SyntaxKind.EqualsGreaterThanToken), type, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructorTypeSyntax {
            return <ConstructorTypeSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructorTypeSyntax {
            return <ConstructorTypeSyntax>super.withTrailingTrivia(trivia);
        }

        public withNewKeyword(newKeyword: ISyntaxToken): ConstructorTypeSyntax {
            return this.update(newKeyword, this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        }

        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): ConstructorTypeSyntax {
            return this.update(this.newKeyword, typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        }

        public withParameterList(parameterList: ParameterListSyntax): ConstructorTypeSyntax {
            return this.update(this.newKeyword, this.typeParameterList, parameterList, this.equalsGreaterThanToken, this.type);
        }

        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): ConstructorTypeSyntax {
            return this.update(this.newKeyword, this.typeParameterList, this.parameterList, equalsGreaterThanToken, this.type);
        }

        public withType(type: ITypeSyntax): ConstructorTypeSyntax {
            return this.update(this.newKeyword, this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, type);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class FunctionTypeSyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public typeParameterList: TypeParameterListSyntax,
            public parameterList: ParameterListSyntax,
            public equalsGreaterThanToken: ISyntaxToken,
            public type: ITypeSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitFunctionType(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.FunctionType;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeParameterList;
                case 1: return this.parameterList;
                case 2: return this.equalsGreaterThanToken;
                case 3: return this.type;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(typeParameterList: TypeParameterListSyntax,
            parameterList: ParameterListSyntax,
            equalsGreaterThanToken: ISyntaxToken,
            type: ITypeSyntax): FunctionTypeSyntax {
            if (this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.equalsGreaterThanToken === equalsGreaterThanToken && this.type === type) {
                return this;
            }

            return new FunctionTypeSyntax(typeParameterList, parameterList, equalsGreaterThanToken, type, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(parameterList: ParameterListSyntax,
            equalsGreaterThanToken: ISyntaxToken,
            type: ITypeSyntax): FunctionTypeSyntax {
            return new FunctionTypeSyntax(null, parameterList, equalsGreaterThanToken, type, /*parsedInStrictMode:*/ false);
        }

        public static create1(type: ITypeSyntax): FunctionTypeSyntax {
            return new FunctionTypeSyntax(null, ParameterListSyntax.create1(), Syntax.token(SyntaxKind.EqualsGreaterThanToken), type, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionTypeSyntax {
            return <FunctionTypeSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionTypeSyntax {
            return <FunctionTypeSyntax>super.withTrailingTrivia(trivia);
        }

        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): FunctionTypeSyntax {
            return this.update(typeParameterList, this.parameterList, this.equalsGreaterThanToken, this.type);
        }

        public withParameterList(parameterList: ParameterListSyntax): FunctionTypeSyntax {
            return this.update(this.typeParameterList, parameterList, this.equalsGreaterThanToken, this.type);
        }

        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): FunctionTypeSyntax {
            return this.update(this.typeParameterList, this.parameterList, equalsGreaterThanToken, this.type);
        }

        public withType(type: ITypeSyntax): FunctionTypeSyntax {
            return this.update(this.typeParameterList, this.parameterList, this.equalsGreaterThanToken, type);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ObjectTypeSyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public openBraceToken: ISyntaxToken,
            public typeMembers: ISeparatedSyntaxList<ITypeMemberSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitObjectType(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ObjectType;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.typeMembers;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(openBraceToken: ISyntaxToken,
            typeMembers: ISeparatedSyntaxList<ITypeMemberSyntax>,
            closeBraceToken: ISyntaxToken): ObjectTypeSyntax {
            if (this.openBraceToken === openBraceToken && this.typeMembers === typeMembers && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ObjectTypeSyntax(openBraceToken, typeMembers, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): ObjectTypeSyntax {
            return new ObjectTypeSyntax(openBraceToken, Syntax.emptySeparatedList<ITypeMemberSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ObjectTypeSyntax {
            return new ObjectTypeSyntax(Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptySeparatedList<ITypeMemberSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectTypeSyntax {
            return <ObjectTypeSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectTypeSyntax {
            return <ObjectTypeSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): ObjectTypeSyntax {
            return this.update(openBraceToken, this.typeMembers, this.closeBraceToken);
        }

        public withTypeMembers(typeMembers: ISeparatedSyntaxList<ITypeMemberSyntax>): ObjectTypeSyntax {
            return this.update(this.openBraceToken, typeMembers, this.closeBraceToken);
        }

        public withTypeMember(typeMember: ITypeMemberSyntax): ObjectTypeSyntax {
            return this.withTypeMembers(Syntax.separatedList<ITypeMemberSyntax>([typeMember]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ObjectTypeSyntax {
            return this.update(this.openBraceToken, this.typeMembers, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ArrayTypeSyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public type: ITypeSyntax,
            public openBracketToken: ISyntaxToken,
            public closeBracketToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitArrayType(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ArrayType;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.type;
                case 1: return this.openBracketToken;
                case 2: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(type: ITypeSyntax,
            openBracketToken: ISyntaxToken,
            closeBracketToken: ISyntaxToken): ArrayTypeSyntax {
            if (this.type === type && this.openBracketToken === openBracketToken && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ArrayTypeSyntax(type, openBracketToken, closeBracketToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(type: ITypeSyntax): ArrayTypeSyntax {
            return new ArrayTypeSyntax(type, Syntax.token(SyntaxKind.OpenBracketToken), Syntax.token(SyntaxKind.CloseBracketToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArrayTypeSyntax {
            return <ArrayTypeSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArrayTypeSyntax {
            return <ArrayTypeSyntax>super.withTrailingTrivia(trivia);
        }

        public withType(type: ITypeSyntax): ArrayTypeSyntax {
            return this.update(type, this.openBracketToken, this.closeBracketToken);
        }

        public withOpenBracketToken(openBracketToken: ISyntaxToken): ArrayTypeSyntax {
            return this.update(this.type, openBracketToken, this.closeBracketToken);
        }

        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ArrayTypeSyntax {
            return this.update(this.type, this.openBracketToken, closeBracketToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class GenericTypeSyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public name: INameSyntax,
            public typeArgumentList: TypeArgumentListSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitGenericType(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.GenericType;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.name;
                case 1: return this.typeArgumentList;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(name: INameSyntax,
            typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax {
            if (this.name === name && this.typeArgumentList === typeArgumentList) {
                return this;
            }

            return new GenericTypeSyntax(name, typeArgumentList, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(name: INameSyntax): GenericTypeSyntax {
            return new GenericTypeSyntax(name, TypeArgumentListSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): GenericTypeSyntax {
            return <GenericTypeSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): GenericTypeSyntax {
            return <GenericTypeSyntax>super.withTrailingTrivia(trivia);
        }

        public withName(name: INameSyntax): GenericTypeSyntax {
            return this.update(name, this.typeArgumentList);
        }

        public withTypeArgumentList(typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax {
            return this.update(this.name, typeArgumentList);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsId(helper: RsHelper): RsId {
            return new RsId(helper.getSourceSpan(this),
                leadingTokenAnnots(this.name.firstToken()),
                this.name.fullText());
        }
        //RefScript - end
    }

    export class TypeQuerySyntax extends SyntaxNode implements ITypeSyntax {
        constructor(public typeOfKeyword: ISyntaxToken,
            public name: INameSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeQuery(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeQuery;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeOfKeyword;
                case 1: return this.name;
                default: throw Errors.invalidOperation();
            }
        }

        public isType(): boolean {
            return true;
        }

        public update(typeOfKeyword: ISyntaxToken,
            name: INameSyntax): TypeQuerySyntax {
            if (this.typeOfKeyword === typeOfKeyword && this.name === name) {
                return this;
            }

            return new TypeQuerySyntax(typeOfKeyword, name, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(name: INameSyntax): TypeQuerySyntax {
            return new TypeQuerySyntax(Syntax.token(SyntaxKind.TypeOfKeyword), name, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeQuerySyntax {
            return <TypeQuerySyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeQuerySyntax {
            return <TypeQuerySyntax>super.withTrailingTrivia(trivia);
        }

        public withTypeOfKeyword(typeOfKeyword: ISyntaxToken): TypeQuerySyntax {
            return this.update(typeOfKeyword, this.name);
        }

        public withName(name: INameSyntax): TypeQuerySyntax {
            return this.update(this.typeOfKeyword, name);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class TypeAnnotationSyntax extends SyntaxNode {
        constructor(public colonToken: ISyntaxToken,
            public type: ITypeSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeAnnotation(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeAnnotation;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.colonToken;
                case 1: return this.type;
                default: throw Errors.invalidOperation();
            }
        }

        public update(colonToken: ISyntaxToken,
            type: ITypeSyntax): TypeAnnotationSyntax {
            if (this.colonToken === colonToken && this.type === type) {
                return this;
            }

            return new TypeAnnotationSyntax(colonToken, type, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(type: ITypeSyntax): TypeAnnotationSyntax {
            return new TypeAnnotationSyntax(Syntax.token(SyntaxKind.ColonToken), type, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeAnnotationSyntax {
            return <TypeAnnotationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeAnnotationSyntax {
            return <TypeAnnotationSyntax>super.withTrailingTrivia(trivia);
        }

        public withColonToken(colonToken: ISyntaxToken): TypeAnnotationSyntax {
            return this.update(colonToken, this.type);
        }

        public withType(type: ITypeSyntax): TypeAnnotationSyntax {
            return this.update(this.colonToken, type);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class BlockSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public openBraceToken: ISyntaxToken,
            public statements: ISyntaxList<IStatementSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitBlock(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.Block;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.statements;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(openBraceToken: ISyntaxToken,
            statements: ISyntaxList<IStatementSyntax>,
            closeBraceToken: ISyntaxToken): BlockSyntax {
            if (this.openBraceToken === openBraceToken && this.statements === statements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new BlockSyntax(openBraceToken, statements, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): BlockSyntax {
            return new BlockSyntax(openBraceToken, Syntax.emptyList<IStatementSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): BlockSyntax {
            return new BlockSyntax(Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptyList<IStatementSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): BlockSyntax {
            return <BlockSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): BlockSyntax {
            return <BlockSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): BlockSyntax {
            return this.update(openBraceToken, this.statements, this.closeBraceToken);
        }

        public withStatements(statements: ISyntaxList<IStatementSyntax>): BlockSyntax {
            return this.update(this.openBraceToken, statements, this.closeBraceToken);
        }

        public withStatement(statement: IStatementSyntax): BlockSyntax {
            return this.withStatements(Syntax.list<IStatementSyntax>([statement]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): BlockSyntax {
            return this.update(this.openBraceToken, this.statements, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.statements.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            return new RsBlockStmt(helper.getSourceSpan(this),
                leadingTokenAnnots(this.openBraceToken),
                this.statements.toRsStmt(helper));
        }
        //RefScript - end

    }

    export class ParameterSyntax extends SyntaxNode {
        constructor(public dotDotDotToken: ISyntaxToken,
            public modifiers: ISyntaxList<ISyntaxToken>,
            public identifier: ISyntaxToken,
            public questionToken: ISyntaxToken,
            public typeAnnotation: TypeAnnotationSyntax,
            public equalsValueClause: EqualsValueClauseSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitParameter(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.Parameter;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.dotDotDotToken;
                case 1: return this.modifiers;
                case 2: return this.identifier;
                case 3: return this.questionToken;
                case 4: return this.typeAnnotation;
                case 5: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }

        public update(dotDotDotToken: ISyntaxToken,
            modifiers: ISyntaxList<ISyntaxToken>,
            identifier: ISyntaxToken,
            questionToken: ISyntaxToken,
            typeAnnotation: TypeAnnotationSyntax,
            equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax {
            if (this.dotDotDotToken === dotDotDotToken && this.modifiers === modifiers && this.identifier === identifier && this.questionToken === questionToken && this.typeAnnotation === typeAnnotation && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new ParameterSyntax(dotDotDotToken, modifiers, identifier, questionToken, typeAnnotation, equalsValueClause, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(identifier: ISyntaxToken): ParameterSyntax {
            return new ParameterSyntax(null, Syntax.emptyList<ISyntaxToken>(), identifier, null, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): ParameterSyntax {
            return new ParameterSyntax(null, Syntax.emptyList<ISyntaxToken>(), identifier, null, null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParameterSyntax {
            return <ParameterSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParameterSyntax {
            return <ParameterSyntax>super.withTrailingTrivia(trivia);
        }

        public withDotDotDotToken(dotDotDotToken: ISyntaxToken): ParameterSyntax {
            return this.update(dotDotDotToken, this.modifiers, this.identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): ParameterSyntax {
            return this.update(this.dotDotDotToken, modifiers, this.identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        }

        public withModifier(modifier: ISyntaxToken): ParameterSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withIdentifier(identifier: ISyntaxToken): ParameterSyntax {
            return this.update(this.dotDotDotToken, this.modifiers, identifier, this.questionToken, this.typeAnnotation, this.equalsValueClause);
        }

        public withQuestionToken(questionToken: ISyntaxToken): ParameterSyntax {
            return this.update(this.dotDotDotToken, this.modifiers, this.identifier, questionToken, this.typeAnnotation, this.equalsValueClause);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): ParameterSyntax {
            return this.update(this.dotDotDotToken, this.modifiers, this.identifier, this.questionToken, typeAnnotation, this.equalsValueClause);
        }

        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax {
            return this.update(this.dotDotDotToken, this.modifiers, this.identifier, this.questionToken, this.typeAnnotation, equalsValueClause);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.dotDotDotToken !== null) { return true; }
            if (this.modifiers.isTypeScriptSpecific()) { return true; }
            if (this.questionToken !== null) { return true; }
            if (this.typeAnnotation !== null) { return true; }
            if (this.equalsValueClause !== null) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsAST(helper: RsHelper): RsAST {
            return this.identifier.toRsAST(helper);
        }

        public toRsId(helper: RsHelper): RsId {
            return this.identifier.toRsId(helper);
        }
        //RefScript - end

    }

    export class MemberAccessExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax, ICallExpressionSyntax {
        constructor(public expression: ILeftHandSideExpressionSyntax,
            public dotToken: ISyntaxToken,
            public name: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitMemberAccessExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.MemberAccessExpression;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.dotToken;
                case 2: return this.name;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isCallExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(expression: ILeftHandSideExpressionSyntax,
            dotToken: ISyntaxToken,
            name: ISyntaxToken): MemberAccessExpressionSyntax {
            if (this.expression === expression && this.dotToken === dotToken && this.name === name) {
                return this;
            }

            return new MemberAccessExpressionSyntax(expression, dotToken, name, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: ILeftHandSideExpressionSyntax,
            name: ISyntaxToken): MemberAccessExpressionSyntax {
            return new MemberAccessExpressionSyntax(expression, Syntax.token(SyntaxKind.DotToken), name, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberAccessExpressionSyntax {
            return <MemberAccessExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberAccessExpressionSyntax {
            return <MemberAccessExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withExpression(expression: ILeftHandSideExpressionSyntax): MemberAccessExpressionSyntax {
            return this.update(expression, this.dotToken, this.name);
        }

        public withDotToken(dotToken: ISyntaxToken): MemberAccessExpressionSyntax {
            return this.update(this.expression, dotToken, this.name);
        }

        public withName(name: ISyntaxToken): MemberAccessExpressionSyntax {
            return this.update(this.expression, this.dotToken, name);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsLValue(helper: RsHelper): RsLValue {
            switch (this.kind()) {
                case SyntaxKind.MemberAccessExpression: {
                    return new RsLDot(helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        this.expression.toRsExp(helper),
                        this.name.text());
                }
                //case SyntaxKind.ElementAccessExpression:
                //    return new RsLBracket(helper.getSourceSpan(this), this.getRsAnnotations(AnnotContext.OtherContext), this.operand1.toRsExp(helper), this.operand2.toRsExp(helper));
                default: {
                    helper.postDiagnostic(this,
                        DiagnosticCode.Cannot_call_toRsLValue_on_BinaryExpression);
                }
            }
        }

        public toRsExp(helper: RsHelper): RsExpression {
            switch (this.name.kind()) {
                case SyntaxKind.IdentifierName: {
                    return new RsDotRef(helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        this.expression.toRsExp(helper),
                        this.name.toRsId(helper));
                }
                default: helper.postDiagnostic(this, DiagnosticCode.Cannot_call_toRsExp_on_BinaryExpression);
            }
        }
        //RefScript - end
    }

    export class PostfixUnaryExpressionSyntax extends SyntaxNode implements IPostfixExpressionSyntax {
        private _kind: SyntaxKind;

        constructor(kind: SyntaxKind,
            public operand: ILeftHandSideExpressionSyntax,
            public operatorToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            this._kind = kind;
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitPostfixUnaryExpression(this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.operand;
                case 1: return this.operatorToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public kind(): SyntaxKind {
            return this._kind;
        }

        public update(kind: SyntaxKind,
            operand: ILeftHandSideExpressionSyntax,
            operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax {
            if (this._kind === kind && this.operand === operand && this.operatorToken === operatorToken) {
                return this;
            }

            return new PostfixUnaryExpressionSyntax(kind, operand, operatorToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): PostfixUnaryExpressionSyntax {
            return <PostfixUnaryExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): PostfixUnaryExpressionSyntax {
            return <PostfixUnaryExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withKind(kind: SyntaxKind): PostfixUnaryExpressionSyntax {
            return this.update(kind, this.operand, this.operatorToken);
        }

        public withOperand(operand: ILeftHandSideExpressionSyntax): PostfixUnaryExpressionSyntax {
            return this.update(this._kind, operand, this.operatorToken);
        }

        public withOperatorToken(operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax {
            return this.update(this._kind, this.operand, operatorToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.operand.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            switch (this.kind()) {
                case SyntaxKind.PostIncrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), leadingTokenAnnots(this), new RsUnaryAssignOp(RsUnaryAssignOpKind.PostfixInc), this.operand.toRsLValue(helper));
                case SyntaxKind.PostDecrementExpression:
                    return new RsUnaryAssignExpr(helper.getSourceSpan(this), leadingTokenAnnots(this), new RsUnaryAssignOp(RsUnaryAssignOpKind.PostfixDec), this.operand.toRsLValue(helper));
                default:
                    helper.postDiagnostic(this,
                        DiagnosticCode.Cannot_call_toRsExp_on_PostfixUnaryExpression_with_SyntaxKind_0,
                        [SyntaxKind[this.kind()]]);
            }
        }
        //RefScript - end

    }

    export class ElementAccessExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax, ICallExpressionSyntax {
        constructor(public expression: ILeftHandSideExpressionSyntax,
            public openBracketToken: ISyntaxToken,
            public argumentExpression: IExpressionSyntax,
            public closeBracketToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitElementAccessExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ElementAccessExpression;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.openBracketToken;
                case 2: return this.argumentExpression;
                case 3: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isCallExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(expression: ILeftHandSideExpressionSyntax,
            openBracketToken: ISyntaxToken,
            argumentExpression: IExpressionSyntax,
            closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax {
            if (this.expression === expression && this.openBracketToken === openBracketToken && this.argumentExpression === argumentExpression && this.closeBracketToken === closeBracketToken) {
                return this;
            }

            return new ElementAccessExpressionSyntax(expression, openBracketToken, argumentExpression, closeBracketToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: ILeftHandSideExpressionSyntax,
            argumentExpression: IExpressionSyntax): ElementAccessExpressionSyntax {
            return new ElementAccessExpressionSyntax(expression, Syntax.token(SyntaxKind.OpenBracketToken), argumentExpression, Syntax.token(SyntaxKind.CloseBracketToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ElementAccessExpressionSyntax {
            return <ElementAccessExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ElementAccessExpressionSyntax {
            return <ElementAccessExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withExpression(expression: ILeftHandSideExpressionSyntax): ElementAccessExpressionSyntax {
            return this.update(expression, this.openBracketToken, this.argumentExpression, this.closeBracketToken);
        }

        public withOpenBracketToken(openBracketToken: ISyntaxToken): ElementAccessExpressionSyntax {
            return this.update(this.expression, openBracketToken, this.argumentExpression, this.closeBracketToken);
        }

        public withArgumentExpression(argumentExpression: IExpressionSyntax): ElementAccessExpressionSyntax {
            return this.update(this.expression, this.openBracketToken, argumentExpression, this.closeBracketToken);
        }

        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax {
            return this.update(this.expression, this.openBracketToken, this.argumentExpression, closeBracketToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.argumentExpression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsLValue(helper: RsHelper): RsLValue {
            return new RsLBracket(helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.expression.toRsExp(helper),
                this.argumentExpression.toRsExp(helper));
        }

        public toRsExp(helper: RsHelper): RsExpression {
            return new RsBracketRef(helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.expression.toRsExp(helper),
                this.argumentExpression.toRsExp(helper));
        }
        //Refscript - end
    }

    export class InvocationExpressionSyntax extends SyntaxNode implements ICallExpressionSyntax, IExpressionWithArgumentListSyntax {
        constructor(public expression: ILeftHandSideExpressionSyntax,
            public argumentList: ArgumentListSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitInvocationExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.InvocationExpression;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.argumentList;
                default: throw Errors.invalidOperation();
            }
        }

        public isCallExpression(): boolean {
            return true;
        }

        public isExpressionWithArgumentList(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(expression: ILeftHandSideExpressionSyntax,
            argumentList: ArgumentListSyntax): InvocationExpressionSyntax {
            if (this.expression === expression && this.argumentList === argumentList) {
                return this;
            }

            return new InvocationExpressionSyntax(expression, argumentList, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: ILeftHandSideExpressionSyntax): InvocationExpressionSyntax {
            return new InvocationExpressionSyntax(expression, ArgumentListSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): InvocationExpressionSyntax {
            return <InvocationExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): InvocationExpressionSyntax {
            return <InvocationExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withExpression(expression: ILeftHandSideExpressionSyntax): InvocationExpressionSyntax {
            return this.update(expression, this.argumentList);
        }

        public withArgumentList(argumentList: ArgumentListSyntax): InvocationExpressionSyntax {
            return this.update(this.expression, argumentList);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.argumentList.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - DONE - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return new RsCallExpr(helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.expression.toRsExp(helper),
                this.argumentList.arguments.toRsExp(helper));
        }
        //RefScript - end

    }

    export class ArgumentListSyntax extends SyntaxNode {
        public arguments: ISeparatedSyntaxList<IExpressionSyntax>;
        constructor(public typeArgumentList: TypeArgumentListSyntax,
            public openParenToken: ISyntaxToken,
            _arguments: ISeparatedSyntaxList<IExpressionSyntax>,
            public closeParenToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            this.arguments = _arguments;
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitArgumentList(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ArgumentList;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeArgumentList;
                case 1: return this.openParenToken;
                case 2: return this.arguments;
                case 3: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }

        public update(typeArgumentList: TypeArgumentListSyntax,
            openParenToken: ISyntaxToken,
            _arguments: ISeparatedSyntaxList<IExpressionSyntax>,
            closeParenToken: ISyntaxToken): ArgumentListSyntax {
            if (this.typeArgumentList === typeArgumentList && this.openParenToken === openParenToken && this.arguments === _arguments && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ArgumentListSyntax(typeArgumentList, openParenToken, _arguments, closeParenToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openParenToken: ISyntaxToken,
            closeParenToken: ISyntaxToken): ArgumentListSyntax {
            return new ArgumentListSyntax(null, openParenToken, Syntax.emptySeparatedList<IExpressionSyntax>(), closeParenToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ArgumentListSyntax {
            return new ArgumentListSyntax(null, Syntax.token(SyntaxKind.OpenParenToken), Syntax.emptySeparatedList<IExpressionSyntax>(), Syntax.token(SyntaxKind.CloseParenToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArgumentListSyntax {
            return <ArgumentListSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArgumentListSyntax {
            return <ArgumentListSyntax>super.withTrailingTrivia(trivia);
        }

        public withTypeArgumentList(typeArgumentList: TypeArgumentListSyntax): ArgumentListSyntax {
            return this.update(typeArgumentList, this.openParenToken, this.arguments, this.closeParenToken);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ArgumentListSyntax {
            return this.update(this.typeArgumentList, openParenToken, this.arguments, this.closeParenToken);
        }

        public withArguments(_arguments: ISeparatedSyntaxList<IExpressionSyntax>): ArgumentListSyntax {
            return this.update(this.typeArgumentList, this.openParenToken, _arguments, this.closeParenToken);
        }

        public withArgument(_argument: IExpressionSyntax): ArgumentListSyntax {
            return this.withArguments(Syntax.separatedList<IExpressionSyntax>([_argument]));
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ArgumentListSyntax {
            return this.update(this.typeArgumentList, this.openParenToken, this.arguments, closeParenToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.typeArgumentList !== null && this.typeArgumentList.isTypeScriptSpecific()) { return true; }
            if (this.arguments.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class BinaryExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        private _kind: SyntaxKind;

        constructor(kind: SyntaxKind,
            public left: IExpressionSyntax,
            public operatorToken: ISyntaxToken,
            public right: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            this._kind = kind;
            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitBinaryExpression(this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.left;
                case 1: return this.operatorToken;
                case 2: return this.right;
                default: throw Errors.invalidOperation();
            }
        }

        public isExpression(): boolean {
            return true;
        }

        public kind(): SyntaxKind {
            return this._kind;
        }

        public update(kind: SyntaxKind,
            left: IExpressionSyntax,
            operatorToken: ISyntaxToken,
            right: IExpressionSyntax): BinaryExpressionSyntax {
            if (this._kind === kind && this.left === left && this.operatorToken === operatorToken && this.right === right) {
                return this;
            }

            return new BinaryExpressionSyntax(kind, left, operatorToken, right, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): BinaryExpressionSyntax {
            return <BinaryExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): BinaryExpressionSyntax {
            return <BinaryExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withKind(kind: SyntaxKind): BinaryExpressionSyntax {
            return this.update(kind, this.left, this.operatorToken, this.right);
        }

        public withLeft(left: IExpressionSyntax): BinaryExpressionSyntax {
            return this.update(this._kind, left, this.operatorToken, this.right);
        }

        public withOperatorToken(operatorToken: ISyntaxToken): BinaryExpressionSyntax {
            return this.update(this._kind, this.left, operatorToken, this.right);
        }

        public withRight(right: IExpressionSyntax): BinaryExpressionSyntax {
            return this.update(this._kind, this.left, this.operatorToken, right);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.left.isTypeScriptSpecific()) { return true; }
            if (this.right.isTypeScriptSpecific()) { return true; }
            return false;
        }


        //RefScript - TODO - begin

        //public toRsAST(helper: RsHelper): RsExpression {
        //    switch (this.SyntaxKind()) {
        //        case SyntaxKind.MemberAccessExpression: {
        //            switch (this.operand2.SyntaxKind()) {
        //                case SyntaxKind.Name:
        //                    return new RsLDot(helper.getSourceSpan(this), this.getRsAnnotations(AnnotContext.OtherContext), this.operand1.toRsExp(helper), (<Identifier>this.operand2).actualText);
        //            }
        //            throw new Error("UNIMMPLEMENTED:BinaryExpression:toRsAST:MemberAccessExpression:op2-nonId");
        //        }
        //        default: {
        //            throw new Error("UNIMMPLEMENTED:BinaryExpression:toRsAST:Expression");
        //        }
        //    }
        //}

        //public toRsLValue(helper: RsHelper): RsLValue {
        //    switch (this.SyntaxKind()) {
        //        case SyntaxKind.MemberAccessExpression: {
        //            switch (this.operand2.SyntaxKind()) {
        //                case SyntaxKind.Name:
        //                    return new RsLDot(helper.getSourceSpan(this), this.getRsAnnotations(AnnotContext.OtherContext), this.operand1.toRsExp(helper), (<Identifier>this.operand2).actualText);
        //            }
        //        }
        //        case SyntaxKind.ElementAccessExpression:
        //            return new RsLBracket(helper.getSourceSpan(this), this.getRsAnnotations(AnnotContext.OtherContext), this.operand1.toRsExp(helper), this.operand2.toRsExp(helper));
        //        default: {
        //            throw new Error("UNIMMPLEMENTED:BinaryExpression:toRsLValue");
        //        }
        //    }
        //}

        public toRsExp(helper: RsHelper): RsExpression {
            switch (this.kind()) {
                case SyntaxKind.MemberAccessExpression: {
                    switch (this.right.kind()) {
                        case SyntaxKind.IdentifierName:
                            return new RsDotRef(
                                helper.getSourceSpan(this),
                                leadingTokenAnnots(this),
                                this.left.toRsExp(helper),
                                <RsId>this.right.toRsAST(helper));
                    }
                    //throw new Error("UNIMMPLEMENTED:BinaryExpression:toRsAST:MemberAccessExpression:op2-nonId");
                    helper.postDiagnostic(this,
                        DiagnosticCode.Cannot_call_toRsAST_on_MemberAccessExpression);

                }

                case SyntaxKind.AssignmentExpression:
                    return new RsAssignExpr(
                        helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        new RsAssignOp(this.operatorToken.text()),
                        this.left.toRsLValue(helper),
                        this.right.toRsExp(helper));

                case SyntaxKind.ElementAccessExpression:
                    return new RsBracketRef(
                        helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        this.left.toRsExp(helper),
                        this.right.toRsExp(helper));

                case SyntaxKind.AddExpression:
                case SyntaxKind.SubtractExpression:
                case SyntaxKind.MultiplyExpression:
                case SyntaxKind.DivideExpression:
                case SyntaxKind.ModuloExpression:
                case SyntaxKind.EqualsExpression:
                case SyntaxKind.EqualsWithTypeConversionExpression:
                case SyntaxKind.GreaterThanExpression:
                case SyntaxKind.GreaterThanOrEqualExpression:
                case SyntaxKind.LessThanExpression:
                case SyntaxKind.LessThanOrEqualExpression:
                case SyntaxKind.LogicalOrExpression:
                case SyntaxKind.LogicalAndExpression:
                case SyntaxKind.NotEqualsWithTypeConversionExpression:
                case SyntaxKind.NotEqualsExpression:
                case SyntaxKind.LeftShiftExpression:
                case SyntaxKind.SignedRightShiftExpression:
                case SyntaxKind.UnsignedRightShiftExpression:
                case SyntaxKind.BitwiseOrExpression:
                case SyntaxKind.BitwiseExclusiveOrExpression:
                case SyntaxKind.BitwiseAndExpression:
                    return new RsInfixExpr(
                        helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        new RsInfixOp(this.operatorToken.text()),
                        this.left.toRsExp(helper),
                        this.right.toRsExp(helper));

                case SyntaxKind.AddAssignmentExpression:
                case SyntaxKind.SubtractAssignmentExpression:
                case SyntaxKind.DivideAssignmentExpression:
                case SyntaxKind.MultiplyAssignmentExpression:
                case SyntaxKind.LeftShiftAssignmentExpression:
                case SyntaxKind.SignedRightShiftAssignmentExpression:
                case SyntaxKind.UnsignedRightShiftAssignmentExpression:
                case SyntaxKind.AndAssignmentExpression:
                case SyntaxKind.ExclusiveOrAssignmentExpression:
                case SyntaxKind.OrAssignmentExpression:
                    return new RsAssignExpr(
                        helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        new RsAssignOp(this.operatorToken.text()),
                        this.left.toRsLValue(helper),
                        this.right.toRsExp(helper));

                case SyntaxKind.InstanceOfExpression:
                    return new RsInfixExpr(helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        new RsInfixOp("instanceof"),
                        this.left.toRsExp(helper),
                        this.right.toRsExp(helper));

                case SyntaxKind.InExpression:
                    return new RsInfixExpr(helper.getSourceSpan(this),
                        leadingTokenAnnots(this),
                        new RsInfixOp("in"),
                        this.left.toRsExp(helper),
                        this.right.toRsExp(helper));

                default:
                    //throw new Error("UNIMMPLEMENTED:BinaryExpression:toRsExp:Expression for: " + SyntaxKind[this.kind()]);
                    helper.postDiagnostic(this,
                        DiagnosticCode.Cannot_call_toRsExp_on_BinaryExpression_with_SyntaxKind_0,
                        [SyntaxKind[this.kind()]]);
            }
        }
        //RefScript - end

    }

    export class ConditionalExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        constructor(public condition: IExpressionSyntax,
            public questionToken: ISyntaxToken,
            public whenTrue: IExpressionSyntax,
            public colonToken: ISyntaxToken,
            public whenFalse: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitConditionalExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ConditionalExpression;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.condition;
                case 1: return this.questionToken;
                case 2: return this.whenTrue;
                case 3: return this.colonToken;
                case 4: return this.whenFalse;
                default: throw Errors.invalidOperation();
            }
        }

        public isExpression(): boolean {
            return true;
        }

        public update(condition: IExpressionSyntax,
            questionToken: ISyntaxToken,
            whenTrue: IExpressionSyntax,
            colonToken: ISyntaxToken,
            whenFalse: IExpressionSyntax): ConditionalExpressionSyntax {
            if (this.condition === condition && this.questionToken === questionToken && this.whenTrue === whenTrue && this.colonToken === colonToken && this.whenFalse === whenFalse) {
                return this;
            }

            return new ConditionalExpressionSyntax(condition, questionToken, whenTrue, colonToken, whenFalse, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(condition: IExpressionSyntax,
            whenTrue: IExpressionSyntax,
            whenFalse: IExpressionSyntax): ConditionalExpressionSyntax {
            return new ConditionalExpressionSyntax(condition, Syntax.token(SyntaxKind.QuestionToken), whenTrue, Syntax.token(SyntaxKind.ColonToken), whenFalse, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConditionalExpressionSyntax {
            return <ConditionalExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConditionalExpressionSyntax {
            return <ConditionalExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withCondition(condition: IExpressionSyntax): ConditionalExpressionSyntax {
            return this.update(condition, this.questionToken, this.whenTrue, this.colonToken, this.whenFalse);
        }

        public withQuestionToken(questionToken: ISyntaxToken): ConditionalExpressionSyntax {
            return this.update(this.condition, questionToken, this.whenTrue, this.colonToken, this.whenFalse);
        }

        public withWhenTrue(whenTrue: IExpressionSyntax): ConditionalExpressionSyntax {
            return this.update(this.condition, this.questionToken, whenTrue, this.colonToken, this.whenFalse);
        }

        public withColonToken(colonToken: ISyntaxToken): ConditionalExpressionSyntax {
            return this.update(this.condition, this.questionToken, this.whenTrue, colonToken, this.whenFalse);
        }

        public withWhenFalse(whenFalse: IExpressionSyntax): ConditionalExpressionSyntax {
            return this.update(this.condition, this.questionToken, this.whenTrue, this.colonToken, whenFalse);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.condition.isTypeScriptSpecific()) { return true; }
            if (this.whenTrue.isTypeScriptSpecific()) { return true; }
            if (this.whenFalse.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return new RsCondExpr(helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.condition.toRsExp(helper),
                this.whenTrue.toRsExp(helper),
                this.whenFalse.toRsExp(helper));
        }
        //Refscript - end

    }

    export class ConstructSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        constructor(public newKeyword: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitConstructSignature(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ConstructSignature;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.callSignature;
                default: throw Errors.invalidOperation();
            }
        }

        public isTypeMember(): boolean {
            return true;
        }

        public update(newKeyword: ISyntaxToken,
            callSignature: CallSignatureSyntax): ConstructSignatureSyntax {
            if (this.newKeyword === newKeyword && this.callSignature === callSignature) {
                return this;
            }

            return new ConstructSignatureSyntax(newKeyword, callSignature, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(): ConstructSignatureSyntax {
            return new ConstructSignatureSyntax(Syntax.token(SyntaxKind.NewKeyword), CallSignatureSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructSignatureSyntax {
            return <ConstructSignatureSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructSignatureSyntax {
            return <ConstructSignatureSyntax>super.withTrailingTrivia(trivia);
        }

        public withNewKeyword(newKeyword: ISyntaxToken): ConstructSignatureSyntax {
            return this.update(newKeyword, this.callSignature);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): ConstructSignatureSyntax {
            return this.update(this.newKeyword, callSignature);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class MethodSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        constructor(public propertyName: ISyntaxToken,
            public questionToken: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitMethodSignature(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.MethodSignature;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.questionToken;
                case 2: return this.callSignature;
                default: throw Errors.invalidOperation();
            }
        }

        public isTypeMember(): boolean {
            return true;
        }

        public update(propertyName: ISyntaxToken,
            questionToken: ISyntaxToken,
            callSignature: CallSignatureSyntax): MethodSignatureSyntax {
            if (this.propertyName === propertyName && this.questionToken === questionToken && this.callSignature === callSignature) {
                return this;
            }

            return new MethodSignatureSyntax(propertyName, questionToken, callSignature, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(propertyName: ISyntaxToken,
            callSignature: CallSignatureSyntax): MethodSignatureSyntax {
            return new MethodSignatureSyntax(propertyName, null, callSignature, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): MethodSignatureSyntax {
            return new MethodSignatureSyntax(propertyName, null, CallSignatureSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): MethodSignatureSyntax {
            return <MethodSignatureSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): MethodSignatureSyntax {
            return <MethodSignatureSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): MethodSignatureSyntax {
            return this.update(propertyName, this.questionToken, this.callSignature);
        }

        public withQuestionToken(questionToken: ISyntaxToken): MethodSignatureSyntax {
            return this.update(this.propertyName, questionToken, this.callSignature);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): MethodSignatureSyntax {
            return this.update(this.propertyName, this.questionToken, callSignature);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.callSignature.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class IndexSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        constructor(public openBracketToken: ISyntaxToken,
            public parameter: ParameterSyntax,
            public closeBracketToken: ISyntaxToken,
            public typeAnnotation: TypeAnnotationSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitIndexSignature(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.IndexSignature;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBracketToken;
                case 1: return this.parameter;
                case 2: return this.closeBracketToken;
                case 3: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }

        public isTypeMember(): boolean {
            return true;
        }

        public update(openBracketToken: ISyntaxToken,
            parameter: ParameterSyntax,
            closeBracketToken: ISyntaxToken,
            typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax {
            if (this.openBracketToken === openBracketToken && this.parameter === parameter && this.closeBracketToken === closeBracketToken && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, typeAnnotation, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openBracketToken: ISyntaxToken,
            parameter: ParameterSyntax,
            closeBracketToken: ISyntaxToken): IndexSignatureSyntax {
            return new IndexSignatureSyntax(openBracketToken, parameter, closeBracketToken, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(parameter: ParameterSyntax): IndexSignatureSyntax {
            return new IndexSignatureSyntax(Syntax.token(SyntaxKind.OpenBracketToken), parameter, Syntax.token(SyntaxKind.CloseBracketToken), null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): IndexSignatureSyntax {
            return <IndexSignatureSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): IndexSignatureSyntax {
            return <IndexSignatureSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenBracketToken(openBracketToken: ISyntaxToken): IndexSignatureSyntax {
            return this.update(openBracketToken, this.parameter, this.closeBracketToken, this.typeAnnotation);
        }

        public withParameter(parameter: ParameterSyntax): IndexSignatureSyntax {
            return this.update(this.openBracketToken, parameter, this.closeBracketToken, this.typeAnnotation);
        }

        public withCloseBracketToken(closeBracketToken: ISyntaxToken): IndexSignatureSyntax {
            return this.update(this.openBracketToken, this.parameter, closeBracketToken, this.typeAnnotation);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax {
            return this.update(this.openBracketToken, this.parameter, this.closeBracketToken, typeAnnotation);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class PropertySignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        constructor(public propertyName: ISyntaxToken,
            public questionToken: ISyntaxToken,
            public typeAnnotation: TypeAnnotationSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitPropertySignature(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.PropertySignature;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.questionToken;
                case 2: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }

        public isTypeMember(): boolean {
            return true;
        }

        public update(propertyName: ISyntaxToken,
            questionToken: ISyntaxToken,
            typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax {
            if (this.propertyName === propertyName && this.questionToken === questionToken && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new PropertySignatureSyntax(propertyName, questionToken, typeAnnotation, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(propertyName: ISyntaxToken): PropertySignatureSyntax {
            return new PropertySignatureSyntax(propertyName, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): PropertySignatureSyntax {
            return new PropertySignatureSyntax(propertyName, null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): PropertySignatureSyntax {
            return <PropertySignatureSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): PropertySignatureSyntax {
            return <PropertySignatureSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): PropertySignatureSyntax {
            return this.update(propertyName, this.questionToken, this.typeAnnotation);
        }

        public withQuestionToken(questionToken: ISyntaxToken): PropertySignatureSyntax {
            return this.update(this.propertyName, questionToken, this.typeAnnotation);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax {
            return this.update(this.propertyName, this.questionToken, typeAnnotation);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class CallSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        constructor(public typeParameterList: TypeParameterListSyntax,
            public parameterList: ParameterListSyntax,
            public typeAnnotation: TypeAnnotationSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitCallSignature(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.CallSignature;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeParameterList;
                case 1: return this.parameterList;
                case 2: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }

        public isTypeMember(): boolean {
            return true;
        }

        public update(typeParameterList: TypeParameterListSyntax,
            parameterList: ParameterListSyntax,
            typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax {
            if (this.typeParameterList === typeParameterList && this.parameterList === parameterList && this.typeAnnotation === typeAnnotation) {
                return this;
            }

            return new CallSignatureSyntax(typeParameterList, parameterList, typeAnnotation, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(parameterList: ParameterListSyntax): CallSignatureSyntax {
            return new CallSignatureSyntax(null, parameterList, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(): CallSignatureSyntax {
            return new CallSignatureSyntax(null, ParameterListSyntax.create1(), null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): CallSignatureSyntax {
            return <CallSignatureSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): CallSignatureSyntax {
            return <CallSignatureSyntax>super.withTrailingTrivia(trivia);
        }

        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): CallSignatureSyntax {
            return this.update(typeParameterList, this.parameterList, this.typeAnnotation);
        }

        public withParameterList(parameterList: ParameterListSyntax): CallSignatureSyntax {
            return this.update(this.typeParameterList, parameterList, this.typeAnnotation);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax {
            return this.update(this.typeParameterList, this.parameterList, typeAnnotation);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.typeParameterList !== null) { return true; }
            if (this.parameterList.isTypeScriptSpecific()) { return true; }
            if (this.typeAnnotation !== null) { return true; }
            return false;
        }
    }

    export class ParameterListSyntax extends SyntaxNode {
        constructor(public openParenToken: ISyntaxToken,
            public parameters: ISeparatedSyntaxList<ParameterSyntax>,
            public closeParenToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitParameterList(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ParameterList;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openParenToken;
                case 1: return this.parameters;
                case 2: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }

        public update(openParenToken: ISyntaxToken,
            parameters: ISeparatedSyntaxList<ParameterSyntax>,
            closeParenToken: ISyntaxToken): ParameterListSyntax {
            if (this.openParenToken === openParenToken && this.parameters === parameters && this.closeParenToken === closeParenToken) {
                return this;
            }

            return new ParameterListSyntax(openParenToken, parameters, closeParenToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openParenToken: ISyntaxToken,
            closeParenToken: ISyntaxToken): ParameterListSyntax {
            return new ParameterListSyntax(openParenToken, Syntax.emptySeparatedList<ParameterSyntax>(), closeParenToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ParameterListSyntax {
            return new ParameterListSyntax(Syntax.token(SyntaxKind.OpenParenToken), Syntax.emptySeparatedList<ParameterSyntax>(), Syntax.token(SyntaxKind.CloseParenToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParameterListSyntax {
            return <ParameterListSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParameterListSyntax {
            return <ParameterListSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ParameterListSyntax {
            return this.update(openParenToken, this.parameters, this.closeParenToken);
        }

        public withParameters(parameters: ISeparatedSyntaxList<ParameterSyntax>): ParameterListSyntax {
            return this.update(this.openParenToken, parameters, this.closeParenToken);
        }

        public withParameter(parameter: ParameterSyntax): ParameterListSyntax {
            return this.withParameters(Syntax.separatedList<ParameterSyntax>([parameter]));
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ParameterListSyntax {
            return this.update(this.openParenToken, this.parameters, closeParenToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.parameters.isTypeScriptSpecific()) { return true; }
            return false;
        }

    }

    export class TypeParameterListSyntax extends SyntaxNode {
        constructor(public lessThanToken: ISyntaxToken,
            public typeParameters: ISeparatedSyntaxList<TypeParameterSyntax>,
            public greaterThanToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeParameterList(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeParameterList;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.typeParameters;
                case 2: return this.greaterThanToken;
                default: throw Errors.invalidOperation();
            }
        }

        public update(lessThanToken: ISyntaxToken,
            typeParameters: ISeparatedSyntaxList<TypeParameterSyntax>,
            greaterThanToken: ISyntaxToken): TypeParameterListSyntax {
            if (this.lessThanToken === lessThanToken && this.typeParameters === typeParameters && this.greaterThanToken === greaterThanToken) {
                return this;
            }

            return new TypeParameterListSyntax(lessThanToken, typeParameters, greaterThanToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(lessThanToken: ISyntaxToken,
            greaterThanToken: ISyntaxToken): TypeParameterListSyntax {
            return new TypeParameterListSyntax(lessThanToken, Syntax.emptySeparatedList<TypeParameterSyntax>(), greaterThanToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): TypeParameterListSyntax {
            return new TypeParameterListSyntax(Syntax.token(SyntaxKind.LessThanToken), Syntax.emptySeparatedList<TypeParameterSyntax>(), Syntax.token(SyntaxKind.GreaterThanToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeParameterListSyntax {
            return <TypeParameterListSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeParameterListSyntax {
            return <TypeParameterListSyntax>super.withTrailingTrivia(trivia);
        }

        public withLessThanToken(lessThanToken: ISyntaxToken): TypeParameterListSyntax {
            return this.update(lessThanToken, this.typeParameters, this.greaterThanToken);
        }

        public withTypeParameters(typeParameters: ISeparatedSyntaxList<TypeParameterSyntax>): TypeParameterListSyntax {
            return this.update(this.lessThanToken, typeParameters, this.greaterThanToken);
        }

        public withTypeParameter(typeParameter: TypeParameterSyntax): TypeParameterListSyntax {
            return this.withTypeParameters(Syntax.separatedList<TypeParameterSyntax>([typeParameter]));
        }

        public withGreaterThanToken(greaterThanToken: ISyntaxToken): TypeParameterListSyntax {
            return this.update(this.lessThanToken, this.typeParameters, greaterThanToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class TypeParameterSyntax extends SyntaxNode {
        constructor(public identifier: ISyntaxToken,
            public constraint: ConstraintSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeParameter(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeParameter;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.constraint;
                default: throw Errors.invalidOperation();
            }
        }

        public update(identifier: ISyntaxToken,
            constraint: ConstraintSyntax): TypeParameterSyntax {
            if (this.identifier === identifier && this.constraint === constraint) {
                return this;
            }

            return new TypeParameterSyntax(identifier, constraint, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(identifier: ISyntaxToken): TypeParameterSyntax {
            return new TypeParameterSyntax(identifier, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): TypeParameterSyntax {
            return new TypeParameterSyntax(identifier, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeParameterSyntax {
            return <TypeParameterSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeParameterSyntax {
            return <TypeParameterSyntax>super.withTrailingTrivia(trivia);
        }

        public withIdentifier(identifier: ISyntaxToken): TypeParameterSyntax {
            return this.update(identifier, this.constraint);
        }

        public withConstraint(constraint: ConstraintSyntax): TypeParameterSyntax {
            return this.update(this.identifier, constraint);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ConstraintSyntax extends SyntaxNode {
        constructor(public extendsKeyword: ISyntaxToken,
            public type: ITypeSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitConstraint(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.Constraint;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.extendsKeyword;
                case 1: return this.type;
                default: throw Errors.invalidOperation();
            }
        }

        public update(extendsKeyword: ISyntaxToken,
            type: ITypeSyntax): ConstraintSyntax {
            if (this.extendsKeyword === extendsKeyword && this.type === type) {
                return this;
            }

            return new ConstraintSyntax(extendsKeyword, type, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(type: ITypeSyntax): ConstraintSyntax {
            return new ConstraintSyntax(Syntax.token(SyntaxKind.ExtendsKeyword), type, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstraintSyntax {
            return <ConstraintSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstraintSyntax {
            return <ConstraintSyntax>super.withTrailingTrivia(trivia);
        }

        public withExtendsKeyword(extendsKeyword: ISyntaxToken): ConstraintSyntax {
            return this.update(extendsKeyword, this.type);
        }

        public withType(type: ITypeSyntax): ConstraintSyntax {
            return this.update(this.extendsKeyword, type);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ElseClauseSyntax extends SyntaxNode {
        constructor(public elseKeyword: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitElseClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ElseClause;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.elseKeyword;
                case 1: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public update(elseKeyword: ISyntaxToken,
            statement: IStatementSyntax): ElseClauseSyntax {
            if (this.elseKeyword === elseKeyword && this.statement === statement) {
                return this;
            }

            return new ElseClauseSyntax(elseKeyword, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(statement: IStatementSyntax): ElseClauseSyntax {
            return new ElseClauseSyntax(Syntax.token(SyntaxKind.ElseKeyword), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ElseClauseSyntax {
            return <ElseClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ElseClauseSyntax {
            return <ElseClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withElseKeyword(elseKeyword: ISyntaxToken): ElseClauseSyntax {
            return this.update(elseKeyword, this.statement);
        }

        public withStatement(statement: IStatementSyntax): ElseClauseSyntax {
            return this.update(this.elseKeyword, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            return this.statement.toRsStmt(helper);
        }
        //RefScript - end

    }

    export class IfStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public ifKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public condition: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public statement: IStatementSyntax,
            public elseClause: ElseClauseSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitIfStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.IfStatement;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.ifKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                case 5: return this.elseClause;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(ifKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            condition: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax,
            elseClause: ElseClauseSyntax): IfStatementSyntax {
            if (this.ifKeyword === ifKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement && this.elseClause === elseClause) {
                return this;
            }

            return new IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, elseClause, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(ifKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            condition: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): IfStatementSyntax {
            return new IfStatementSyntax(ifKeyword, openParenToken, condition, closeParenToken, statement, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(condition: IExpressionSyntax,
            statement: IStatementSyntax): IfStatementSyntax {
            return new IfStatementSyntax(Syntax.token(SyntaxKind.IfKeyword), Syntax.token(SyntaxKind.OpenParenToken), condition, Syntax.token(SyntaxKind.CloseParenToken), statement, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): IfStatementSyntax {
            return <IfStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): IfStatementSyntax {
            return <IfStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withIfKeyword(ifKeyword: ISyntaxToken): IfStatementSyntax {
            return this.update(ifKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement, this.elseClause);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): IfStatementSyntax {
            return this.update(this.ifKeyword, openParenToken, this.condition, this.closeParenToken, this.statement, this.elseClause);
        }

        public withCondition(condition: IExpressionSyntax): IfStatementSyntax {
            return this.update(this.ifKeyword, this.openParenToken, condition, this.closeParenToken, this.statement, this.elseClause);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): IfStatementSyntax {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, closeParenToken, this.statement, this.elseClause);
        }

        public withStatement(statement: IStatementSyntax): IfStatementSyntax {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, this.closeParenToken, statement, this.elseClause);
        }

        public withElseClause(elseClause: ElseClauseSyntax): IfStatementSyntax {
            return this.update(this.ifKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement, elseClause);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.condition.isTypeScriptSpecific()) { return true; }
            if (this.statement.isTypeScriptSpecific()) { return true; }
            if (this.elseClause !== null && this.elseClause.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            if (this.elseClause) {
                return new RsIfStmt(helper.getSourceSpan(this), leadingTokenAnnots(this),
                    this.condition.toRsExp(helper), this.statement.toRsStmt(helper), this.elseClause.toRsStmt(helper));
            }
            else {
                return new RsIfSingleStmt(helper.getSourceSpan(this), leadingTokenAnnots(this.ifKeyword), // tokenAnnots(this),
                    this.condition.toRsExp(helper), this.statement.toRsStmt(helper));
            }
        }
        //RefScript -end

    }

    export class ExpressionStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public expression: IExpressionSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitExpressionStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ExpressionStatement;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(expression: IExpressionSyntax,
            semicolonToken: ISyntaxToken): ExpressionStatementSyntax {
            if (this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ExpressionStatementSyntax(expression, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IExpressionSyntax): ExpressionStatementSyntax {
            return new ExpressionStatementSyntax(expression, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExpressionStatementSyntax {
            return <ExpressionStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExpressionStatementSyntax {
            return <ExpressionStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withExpression(expression: IExpressionSyntax): ExpressionStatementSyntax {
            return this.update(expression, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ExpressionStatementSyntax {
            return this.update(this.expression, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - DONE - begin
        public toRsStmt(helper: RsHelper): RsExprStmt {
            // The annotations will be provided by the contents
            return new RsExprStmt(helper.getSourceSpan(this), /* tokenAnnots(this) */[], this.expression.toRsExp(helper));
        }
        //RefScript - end

    }

    export class ConstructorDeclarationSyntax extends SyntaxNode implements IClassElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public constructorKeyword: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            public block: BlockSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitConstructorDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ConstructorDeclaration;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.constructorKeyword;
                case 2: return this.callSignature;
                case 3: return this.block;
                case 4: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            constructorKeyword: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax,
            semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax {
            if (this.modifiers === modifiers && this.constructorKeyword === constructorKeyword && this.callSignature === callSignature && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ConstructorDeclarationSyntax(modifiers, constructorKeyword, callSignature, block, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(constructorKeyword: ISyntaxToken,
            callSignature: CallSignatureSyntax): ConstructorDeclarationSyntax {
            return new ConstructorDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), constructorKeyword, callSignature, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ConstructorDeclarationSyntax {
            return new ConstructorDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.ConstructorKeyword), CallSignatureSyntax.create1(), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructorDeclarationSyntax {
            return <ConstructorDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructorDeclarationSyntax {
            return <ConstructorDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): ConstructorDeclarationSyntax {
            return this.update(modifiers, this.constructorKeyword, this.callSignature, this.block, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): ConstructorDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withConstructorKeyword(constructorKeyword: ISyntaxToken): ConstructorDeclarationSyntax {
            return this.update(this.modifiers, constructorKeyword, this.callSignature, this.block, this.semicolonToken);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): ConstructorDeclarationSyntax {
            return this.update(this.modifiers, this.constructorKeyword, callSignature, this.block, this.semicolonToken);
        }

        public withBlock(block: BlockSyntax): ConstructorDeclarationSyntax {
            return this.update(this.modifiers, this.constructorKeyword, this.callSignature, block, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax {
            return this.update(this.modifiers, this.constructorKeyword, this.callSignature, this.block, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin


        private memberInitializations(helper: RsHelper, parentClass: ClassDeclarationSyntax) {

            var statements: RsStatement[] = [];

            for (var i = 0, n = parentClass.classElements.childCount(); i < n; i++) {
                if (parentClass.classElements.childAt(i).kind() === SyntaxKind.MemberVariableDeclaration) {
                    var varDecl = <MemberVariableDeclarationSyntax>parentClass.classElements.childAt(i);
                    if (!hasModifier(varDecl.modifiers, PullElementFlags.Static) && varDecl.variableDeclarator.equalsValueClause) {
                        statements.push(
                            new RsExprStmt(helper.getSourceSpan(this), [],
                                new RsAssignExpr(helper.getSourceSpan(this), [], new RsAssignOp("="),
                                    new RsLDot(helper.getSourceSpan(this), [], new RsThisRef(helper.getSourceSpan(this), []), varDecl.variableDeclarator.propertyName.text()),
                                    varDecl.variableDeclarator.equalsValueClause.toRsExp(helper)))
                            );
                    }
                    else {
                        statements.push(
                            new RsExprStmt(helper.getSourceSpan(this), [],
                                new RsAssignExpr(helper.getSourceSpan(this), [], new RsAssignOp("="),
                                    new RsLDot(helper.getSourceSpan(this), [], new RsThisRef(helper.getSourceSpan(this), []),
                                        varDecl.variableDeclarator.propertyName.text()), new RsNullLit(helper.getSourceSpan(this), [])))
                            );

                    }
                }
            }
            return statements;
        }


        public toRsClassElt(helper: RsHelper, mut: RsType): RsClassElt {

            this.callSignature.parameterList.parameters.toNonSeparatorArray().forEach(p => {
                if (p.equalsValueClause) {
                    helper.postDiagnostic(this, DiagnosticCode.Initialization_of_parameter_0_at_the_signature_site_is_not_supported, [p.identifier.text()]);
                }
            });

            var anns = leadingTokenAnnots(this.firstToken(), AnnotContext.ClassContructorContext);
            var bindAnns: RsBindAnnotation[] = <RsBindAnnotation[]> anns.filter(a => a.kind() === AnnotKind.RawConstr);

            if (bindAnns.length === 0) {
                // no annotation -- get the TS inferred one
                var decl: PullDecl = helper.getDeclForAST(this);
                var type = decl.getSignatureSymbol().toRsTCtor(mut);
                var typeStr = type.toString();
                anns.push(new RsBindAnnotation(helper.getSourceSpan(this), AnnotKind.RawConstr, Assignability.AErrorAssignability, "new " + typeStr));
            }
            if (bindAnns.length > 1) {
                helper.postDiagnostic(this, DiagnosticCode.Constructors_should_have_at_most_one_annotation);
                return null;
                //new RsConstructor(helper.getSourceSpan(this), anns,
                //new RsASTList(this.callSignature.parameterList.parameters.toNonSeparatorArray().map(t => t.toRsId(helper))),
                //new RsASTList([this.block.toRsStmt(helper)]));
            }

            // Constructor block prelude

            var list = this.block.statements;
            var parent = helper.getParentNode();

            var rsBlock: RsStatement[] = [];

            if (parent && parent.kind() === SyntaxKind.ClassDeclaration) {
                var parentClass = <ClassDeclarationSyntax> parent;

                var emitPropertyAssignmentsAfterSuperCall = ASTHelpers.getExtendsHeritageClause(parentClass.heritageClauses) !== null;

                var propertyAssignmentIndex = emitPropertyAssignmentsAfterSuperCall ? 1 : 0;

                for (var i = 0, n = list.childCount(); i < n; i++) {
                    // In some circumstances, class property initializers must be emitted immediately after the 'super' constructor
                    // call which, in these cases, must be the first statement in the constructor body
                    if (i === propertyAssignmentIndex) {
                        rsBlock = ArrayUtilities.concat([rsBlock, this.memberInitializations(helper, parentClass)]);
                    }
                    var node = list.childAt(i);
                    rsBlock.push(node.toRsStmt(helper));
                }

                if (i === propertyAssignmentIndex) {
                    rsBlock = ArrayUtilities.concat([rsBlock, this.memberInitializations(helper, parentClass)]);
                }

            }
            else {
                helper.postDiagnostic(this, DiagnosticCode.Constructor_parent_has_not_been_set);
            }

            return new RsConstructor(helper.getSourceSpan(this), anns,
                new RsList(this.callSignature.parameterList.parameters.toNonSeparatorArray().map(t => t.toRsId(helper))),
                new RsList(rsBlock));
        }
        //RefScript - end

    }

    export class MemberFunctionDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public propertyName: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            public block: BlockSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitMemberFunctionDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.MemberFunctionDeclaration;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.propertyName;
                case 2: return this.callSignature;
                case 3: return this.block;
                case 4: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberDeclaration(): boolean {
            return true;
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            propertyName: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax,
            semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax {
            if (this.modifiers === modifiers && this.propertyName === propertyName && this.callSignature === callSignature && this.block === block && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new MemberFunctionDeclarationSyntax(modifiers, propertyName, callSignature, block, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(propertyName: ISyntaxToken,
            callSignature: CallSignatureSyntax): MemberFunctionDeclarationSyntax {
            return new MemberFunctionDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), propertyName, callSignature, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): MemberFunctionDeclarationSyntax {
            return new MemberFunctionDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), propertyName, CallSignatureSyntax.create1(), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberFunctionDeclarationSyntax {
            return <MemberFunctionDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberFunctionDeclarationSyntax {
            return <MemberFunctionDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): MemberFunctionDeclarationSyntax {
            return this.update(modifiers, this.propertyName, this.callSignature, this.block, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): MemberFunctionDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withPropertyName(propertyName: ISyntaxToken): MemberFunctionDeclarationSyntax {
            return this.update(this.modifiers, propertyName, this.callSignature, this.block, this.semicolonToken);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): MemberFunctionDeclarationSyntax {
            return this.update(this.modifiers, this.propertyName, callSignature, this.block, this.semicolonToken);
        }

        public withBlock(block: BlockSyntax): MemberFunctionDeclarationSyntax {
            return this.update(this.modifiers, this.propertyName, this.callSignature, block, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax {
            return this.update(this.modifiers, this.propertyName, this.callSignature, this.block, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsClassElt(helper: RsHelper, mut: RsType): RsClassElt {

            this.callSignature.parameterList.parameters.toNonSeparatorArray().forEach(p => {
                if (p.equalsValueClause) {
                    helper.postDiagnostic(this, DiagnosticCode.Initialization_of_parameter_0_at_the_signature_site_is_not_supported, [p.identifier.text()]);
                }
            });

            var methodName = this.propertyName.text();
            var isStatic = this.modifiers.toArray().some(t => t.kind() === SyntaxKind.StaticKeyword);

            var ctx = AnnotContext.ClassMethodContext;

            var anns = leadingTokenAnnots(this.firstToken(), ctx);

            var bindAnns: RsBindAnnotation[] = <RsBindAnnotation[]> anns.filter(a => a.kind() === AnnotKind.RawMethod);

            if (bindAnns.length === 0) {
                //If there is no annotation
                var methDecl = helper.getDeclForAST(this);
                var sym = methDecl.getSignatureSymbol();

                anns.push(new RsBindAnnotation(
                    helper.getSourceSpan(this),
                    AnnotKind.RawMethod,
                    Assignability.AErrorAssignability,
                    new RsMethSig(methodName, sym.toRsTMeth()).toString()));
            }

            if (this.block) {
                return new RsMemberMethDef(helper.getSourceSpan(this), anns, isStatic,
                    this.propertyName.toRsId(helper),
                    new RsList(this.callSignature.parameterList.parameters.toNonSeparatorArray().map(t => t.toRsId(helper))),
                    new RsList([this.block.toRsStmt(helper)]));
            }
            else {
                return new RsMemberMethDecl(helper.getSourceSpan(this), anns, isStatic,
                    this.propertyName.toRsId(helper),
                    new RsList(this.callSignature.parameterList.parameters.toNonSeparatorArray().map(t => t.toRsId(helper))));
            }
        }
        //RefScript - end

    }

    export class GetAccessorSyntax extends SyntaxNode implements IMemberDeclarationSyntax, IPropertyAssignmentSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public getKeyword: ISyntaxToken,
            public propertyName: ISyntaxToken,
            public parameterList: ParameterListSyntax,
            public typeAnnotation: TypeAnnotationSyntax,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitGetAccessor(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.GetAccessor;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.getKeyword;
                case 2: return this.propertyName;
                case 3: return this.parameterList;
                case 4: return this.typeAnnotation;
                case 5: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberDeclaration(): boolean {
            return true;
        }

        public isPropertyAssignment(): boolean {
            return true;
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            getKeyword: ISyntaxToken,
            propertyName: ISyntaxToken,
            parameterList: ParameterListSyntax,
            typeAnnotation: TypeAnnotationSyntax,
            block: BlockSyntax): GetAccessorSyntax {
            if (this.modifiers === modifiers && this.getKeyword === getKeyword && this.propertyName === propertyName && this.parameterList === parameterList && this.typeAnnotation === typeAnnotation && this.block === block) {
                return this;
            }

            return new GetAccessorSyntax(modifiers, getKeyword, propertyName, parameterList, typeAnnotation, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(getKeyword: ISyntaxToken,
            propertyName: ISyntaxToken,
            parameterList: ParameterListSyntax,
            block: BlockSyntax): GetAccessorSyntax {
            return new GetAccessorSyntax(Syntax.emptyList<ISyntaxToken>(), getKeyword, propertyName, parameterList, null, block, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): GetAccessorSyntax {
            return new GetAccessorSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.GetKeyword), propertyName, ParameterListSyntax.create1(), null, BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): GetAccessorSyntax {
            return <GetAccessorSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): GetAccessorSyntax {
            return <GetAccessorSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): GetAccessorSyntax {
            return this.update(modifiers, this.getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, this.block);
        }

        public withModifier(modifier: ISyntaxToken): GetAccessorSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withGetKeyword(getKeyword: ISyntaxToken): GetAccessorSyntax {
            return this.update(this.modifiers, getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, this.block);
        }

        public withPropertyName(propertyName: ISyntaxToken): GetAccessorSyntax {
            return this.update(this.modifiers, this.getKeyword, propertyName, this.parameterList, this.typeAnnotation, this.block);
        }

        public withParameterList(parameterList: ParameterListSyntax): GetAccessorSyntax {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, parameterList, this.typeAnnotation, this.block);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): GetAccessorSyntax {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, this.parameterList, typeAnnotation, this.block);
        }

        public withBlock(block: BlockSyntax): GetAccessorSyntax {
            return this.update(this.modifiers, this.getKeyword, this.propertyName, this.parameterList, this.typeAnnotation, block);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.modifiers.childCount() > 0) { return true; }
            if (this.parameterList.isTypeScriptSpecific()) { return true; }
            if (this.typeAnnotation !== null) { return true; }
            if (this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class SetAccessorSyntax extends SyntaxNode implements IMemberDeclarationSyntax, IPropertyAssignmentSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public setKeyword: ISyntaxToken,
            public propertyName: ISyntaxToken,
            public parameterList: ParameterListSyntax,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitSetAccessor(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.SetAccessor;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.setKeyword;
                case 2: return this.propertyName;
                case 3: return this.parameterList;
                case 4: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberDeclaration(): boolean {
            return true;
        }

        public isPropertyAssignment(): boolean {
            return true;
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            setKeyword: ISyntaxToken,
            propertyName: ISyntaxToken,
            parameterList: ParameterListSyntax,
            block: BlockSyntax): SetAccessorSyntax {
            if (this.modifiers === modifiers && this.setKeyword === setKeyword && this.propertyName === propertyName && this.parameterList === parameterList && this.block === block) {
                return this;
            }

            return new SetAccessorSyntax(modifiers, setKeyword, propertyName, parameterList, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(setKeyword: ISyntaxToken,
            propertyName: ISyntaxToken,
            parameterList: ParameterListSyntax,
            block: BlockSyntax): SetAccessorSyntax {
            return new SetAccessorSyntax(Syntax.emptyList<ISyntaxToken>(), setKeyword, propertyName, parameterList, block, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): SetAccessorSyntax {
            return new SetAccessorSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.SetKeyword), propertyName, ParameterListSyntax.create1(), BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): SetAccessorSyntax {
            return <SetAccessorSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): SetAccessorSyntax {
            return <SetAccessorSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): SetAccessorSyntax {
            return this.update(modifiers, this.setKeyword, this.propertyName, this.parameterList, this.block);
        }

        public withModifier(modifier: ISyntaxToken): SetAccessorSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withSetKeyword(setKeyword: ISyntaxToken): SetAccessorSyntax {
            return this.update(this.modifiers, setKeyword, this.propertyName, this.parameterList, this.block);
        }

        public withPropertyName(propertyName: ISyntaxToken): SetAccessorSyntax {
            return this.update(this.modifiers, this.setKeyword, propertyName, this.parameterList, this.block);
        }

        public withParameterList(parameterList: ParameterListSyntax): SetAccessorSyntax {
            return this.update(this.modifiers, this.setKeyword, this.propertyName, parameterList, this.block);
        }

        public withBlock(block: BlockSyntax): SetAccessorSyntax {
            return this.update(this.modifiers, this.setKeyword, this.propertyName, this.parameterList, block);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class MemberVariableDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public variableDeclarator: VariableDeclaratorSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitMemberVariableDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.MemberVariableDeclaration;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.variableDeclarator;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberDeclaration(): boolean {
            return true;
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            variableDeclarator: VariableDeclaratorSyntax,
            semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax {
            if (this.modifiers === modifiers && this.variableDeclarator === variableDeclarator && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new MemberVariableDeclarationSyntax(modifiers, variableDeclarator, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(variableDeclarator: VariableDeclaratorSyntax,
            semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax {
            return new MemberVariableDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), variableDeclarator, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(variableDeclarator: VariableDeclaratorSyntax): MemberVariableDeclarationSyntax {
            return new MemberVariableDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), variableDeclarator, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberVariableDeclarationSyntax {
            return <MemberVariableDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberVariableDeclarationSyntax {
            return <MemberVariableDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): MemberVariableDeclarationSyntax {
            return this.update(modifiers, this.variableDeclarator, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): MemberVariableDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withVariableDeclarator(variableDeclarator: VariableDeclaratorSyntax): MemberVariableDeclarationSyntax {
            return this.update(this.modifiers, variableDeclarator, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax {
            return this.update(this.modifiers, this.variableDeclarator, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsClassElt(helper: RsHelper, mut: RsType): RsClassElt {

            var isStatic = this.modifiers.toArray().some(t => t.kind() === SyntaxKind.StaticKeyword);
            var ctx = AnnotContext.ClassFieldContext;

            var anns = leadingTokenAnnots(this.firstToken(), ctx);

            var bindAnns: RsBindAnnotation[] = <RsBindAnnotation[]> anns.filter(a => a.kind() === AnnotKind.RawField);

            var bindAnnNames: string[] = bindAnns.map(a => (<RsBindAnnotation>a).binderName(this, helper));

            if (bindAnns.length === 0) {
                //If there is no annotation
                var fieldDecl = helper.getDeclForAST(this);
                var sym = fieldDecl.getSymbol();

                anns.push(new RsBindAnnotation(
                    helper.getSourceSpan(this),
                    AnnotKind.RawField,
                    Assignability.AErrorAssignability,
                    new RsFieldSig(this.variableDeclarator.propertyName.text(),
                        sym.isOptional, sym.type.toRsType()).toString()));
            }

            //var binderNames = <RsBindAnnotation[]>anns.filter(
            //	b => b.kind() === AnnotKind.RawField || b.kind() === AnnotKind.RawStatic);

            // Adding the annotations in the enclosing RsVarDecl instead of the top-level.


            if (!this.variableDeclarator) {
                helper.postDiagnostic(this, DiagnosticCode.Fields_should_have_at_least_one_declaration);
            }

            if (this.variableDeclarator.equalsValueClause) {
                return new RsMemberVarDecl(helper.getSourceSpan(this), anns, isStatic,
                    this.variableDeclarator.propertyName.toRsId(helper),
                    new RsJust(this.variableDeclarator.equalsValueClause.toRsExp(helper)));
            }
            else {
                return new RsMemberVarDecl(helper.getSourceSpan(this), anns, isStatic,
                    this.variableDeclarator.propertyName.toRsId(helper),
                    new RsNothing());
            }
        }
        //RefScript - end

    }

    export class IndexMemberDeclarationSyntax extends SyntaxNode implements IClassElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public indexSignature: IndexSignatureSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitIndexMemberDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.IndexMemberDeclaration;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.indexSignature;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isClassElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            indexSignature: IndexSignatureSyntax,
            semicolonToken: ISyntaxToken): IndexMemberDeclarationSyntax {
            if (this.modifiers === modifiers && this.indexSignature === indexSignature && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new IndexMemberDeclarationSyntax(modifiers, indexSignature, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(indexSignature: IndexSignatureSyntax,
            semicolonToken: ISyntaxToken): IndexMemberDeclarationSyntax {
            return new IndexMemberDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), indexSignature, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(indexSignature: IndexSignatureSyntax): IndexMemberDeclarationSyntax {
            return new IndexMemberDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), indexSignature, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): IndexMemberDeclarationSyntax {
            return <IndexMemberDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): IndexMemberDeclarationSyntax {
            return <IndexMemberDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): IndexMemberDeclarationSyntax {
            return this.update(modifiers, this.indexSignature, this.semicolonToken);
        }

        public withModifier(modifier: ISyntaxToken): IndexMemberDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withIndexSignature(indexSignature: IndexSignatureSyntax): IndexMemberDeclarationSyntax {
            return this.update(this.modifiers, indexSignature, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): IndexMemberDeclarationSyntax {
            return this.update(this.modifiers, this.indexSignature, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }
    }

    export class ThrowStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public throwKeyword: ISyntaxToken,
            public expression: IExpressionSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitThrowStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ThrowStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.throwKeyword;
                case 1: return this.expression;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(throwKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            semicolonToken: ISyntaxToken): ThrowStatementSyntax {
            if (this.throwKeyword === throwKeyword && this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ThrowStatementSyntax(throwKeyword, expression, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IExpressionSyntax): ThrowStatementSyntax {
            return new ThrowStatementSyntax(Syntax.token(SyntaxKind.ThrowKeyword), expression, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ThrowStatementSyntax {
            return <ThrowStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ThrowStatementSyntax {
            return <ThrowStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withThrowKeyword(throwKeyword: ISyntaxToken): ThrowStatementSyntax {
            return this.update(throwKeyword, this.expression, this.semicolonToken);
        }

        public withExpression(expression: IExpressionSyntax): ThrowStatementSyntax {
            return this.update(this.throwKeyword, expression, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ThrowStatementSyntax {
            return this.update(this.throwKeyword, this.expression, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            var ret = this.expression.toRsExp(helper);
            return new RsThrowStatement(helper.getSourceSpan(this), leadingTokenAnnots(this), ret);
        }
        //RefScript - end

    }

    export class ReturnStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public returnKeyword: ISyntaxToken,
            public expression: IExpressionSyntax,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitReturnStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ReturnStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.returnKeyword;
                case 1: return this.expression;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(returnKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            semicolonToken: ISyntaxToken): ReturnStatementSyntax {
            if (this.returnKeyword === returnKeyword && this.expression === expression && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ReturnStatementSyntax(returnKeyword, expression, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(returnKeyword: ISyntaxToken,
            semicolonToken: ISyntaxToken): ReturnStatementSyntax {
            return new ReturnStatementSyntax(returnKeyword, null, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ReturnStatementSyntax {
            return new ReturnStatementSyntax(Syntax.token(SyntaxKind.ReturnKeyword), null, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ReturnStatementSyntax {
            return <ReturnStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ReturnStatementSyntax {
            return <ReturnStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withReturnKeyword(returnKeyword: ISyntaxToken): ReturnStatementSyntax {
            return this.update(returnKeyword, this.expression, this.semicolonToken);
        }

        public withExpression(expression: IExpressionSyntax): ReturnStatementSyntax {
            return this.update(this.returnKeyword, expression, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ReturnStatementSyntax {
            return this.update(this.returnKeyword, this.expression, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression !== null && this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            return new RsReturnStmt(helper.getSourceSpan(this), leadingTokenAnnots(this),
                (this.expression) ? new RsJust(this.expression.toRsExp(helper)) : new RsNothing());
        }
        //RefScript - end

    }

    export class ObjectCreationExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax, IExpressionWithArgumentListSyntax {
        constructor(public newKeyword: ISyntaxToken,
            public expression: IMemberExpressionSyntax,
            public argumentList: ArgumentListSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitObjectCreationExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ObjectCreationExpression;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.expression;
                case 2: return this.argumentList;
                default: throw Errors.invalidOperation();
            }
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isExpressionWithArgumentList(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(newKeyword: ISyntaxToken,
            expression: IMemberExpressionSyntax,
            argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax {
            if (this.newKeyword === newKeyword && this.expression === expression && this.argumentList === argumentList) {
                return this;
            }

            return new ObjectCreationExpressionSyntax(newKeyword, expression, argumentList, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(newKeyword: ISyntaxToken,
            expression: IMemberExpressionSyntax): ObjectCreationExpressionSyntax {
            return new ObjectCreationExpressionSyntax(newKeyword, expression, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(expression: IMemberExpressionSyntax): ObjectCreationExpressionSyntax {
            return new ObjectCreationExpressionSyntax(Syntax.token(SyntaxKind.NewKeyword), expression, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectCreationExpressionSyntax {
            return <ObjectCreationExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectCreationExpressionSyntax {
            return <ObjectCreationExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withNewKeyword(newKeyword: ISyntaxToken): ObjectCreationExpressionSyntax {
            return this.update(newKeyword, this.expression, this.argumentList);
        }

        public withExpression(expression: IMemberExpressionSyntax): ObjectCreationExpressionSyntax {
            return this.update(this.newKeyword, expression, this.argumentList);
        }

        public withArgumentList(argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax {
            return this.update(this.newKeyword, this.expression, argumentList);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.argumentList !== null && this.argumentList.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return new RsNewExpr(helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.expression.toRsExp(helper),
                this.argumentList.arguments.toRsExp(helper));
        }
        //Refscript - end

    }

    export class SwitchStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public switchKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public expression: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public openBraceToken: ISyntaxToken,
            public switchClauses: ISyntaxList<ISwitchClauseSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitSwitchStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.SwitchStatement;
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.switchKeyword;
                case 1: return this.openParenToken;
                case 2: return this.expression;
                case 3: return this.closeParenToken;
                case 4: return this.openBraceToken;
                case 5: return this.switchClauses;
                case 6: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(switchKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            expression: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            switchClauses: ISyntaxList<ISwitchClauseSyntax>,
            closeBraceToken: ISyntaxToken): SwitchStatementSyntax {
            if (this.switchKeyword === switchKeyword && this.openParenToken === openParenToken && this.expression === expression && this.closeParenToken === closeParenToken && this.openBraceToken === openBraceToken && this.switchClauses === switchClauses && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, switchClauses, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(switchKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            expression: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): SwitchStatementSyntax {
            return new SwitchStatementSyntax(switchKeyword, openParenToken, expression, closeParenToken, openBraceToken, Syntax.emptyList<ISwitchClauseSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(expression: IExpressionSyntax): SwitchStatementSyntax {
            return new SwitchStatementSyntax(Syntax.token(SyntaxKind.SwitchKeyword), Syntax.token(SyntaxKind.OpenParenToken), expression, Syntax.token(SyntaxKind.CloseParenToken), Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptyList<ISwitchClauseSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): SwitchStatementSyntax {
            return <SwitchStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): SwitchStatementSyntax {
            return <SwitchStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withSwitchKeyword(switchKeyword: ISyntaxToken): SwitchStatementSyntax {
            return this.update(switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): SwitchStatementSyntax {
            return this.update(this.switchKeyword, openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        }

        public withExpression(expression: IExpressionSyntax): SwitchStatementSyntax {
            return this.update(this.switchKeyword, this.openParenToken, expression, this.closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): SwitchStatementSyntax {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, closeParenToken, this.openBraceToken, this.switchClauses, this.closeBraceToken);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): SwitchStatementSyntax {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, openBraceToken, this.switchClauses, this.closeBraceToken);
        }

        public withSwitchClauses(switchClauses: ISyntaxList<ISwitchClauseSyntax>): SwitchStatementSyntax {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, switchClauses, this.closeBraceToken);
        }

        public withSwitchClause(switchClause: ISwitchClauseSyntax): SwitchStatementSyntax {
            return this.withSwitchClauses(Syntax.list<ISwitchClauseSyntax>([switchClause]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): SwitchStatementSyntax {
            return this.update(this.switchKeyword, this.openParenToken, this.expression, this.closeParenToken, this.openBraceToken, this.switchClauses, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.switchClauses.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class CaseSwitchClauseSyntax extends SyntaxNode implements ISwitchClauseSyntax {
        constructor(public caseKeyword: ISyntaxToken,
            public expression: IExpressionSyntax,
            public colonToken: ISyntaxToken,
            public statements: ISyntaxList<IStatementSyntax>,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitCaseSwitchClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.CaseSwitchClause;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.caseKeyword;
                case 1: return this.expression;
                case 2: return this.colonToken;
                case 3: return this.statements;
                default: throw Errors.invalidOperation();
            }
        }

        public isSwitchClause(): boolean {
            return true;
        }

        public update(caseKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            colonToken: ISyntaxToken,
            statements: ISyntaxList<IStatementSyntax>): CaseSwitchClauseSyntax {
            if (this.caseKeyword === caseKeyword && this.expression === expression && this.colonToken === colonToken && this.statements === statements) {
                return this;
            }

            return new CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, statements, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(caseKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            colonToken: ISyntaxToken): CaseSwitchClauseSyntax {
            return new CaseSwitchClauseSyntax(caseKeyword, expression, colonToken, Syntax.emptyList<IStatementSyntax>(), /*parsedInStrictMode:*/ false);
        }

        public static create1(expression: IExpressionSyntax): CaseSwitchClauseSyntax {
            return new CaseSwitchClauseSyntax(Syntax.token(SyntaxKind.CaseKeyword), expression, Syntax.token(SyntaxKind.ColonToken), Syntax.emptyList<IStatementSyntax>(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): CaseSwitchClauseSyntax {
            return <CaseSwitchClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): CaseSwitchClauseSyntax {
            return <CaseSwitchClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withCaseKeyword(caseKeyword: ISyntaxToken): CaseSwitchClauseSyntax {
            return this.update(caseKeyword, this.expression, this.colonToken, this.statements);
        }

        public withExpression(expression: IExpressionSyntax): CaseSwitchClauseSyntax {
            return this.update(this.caseKeyword, expression, this.colonToken, this.statements);
        }

        public withColonToken(colonToken: ISyntaxToken): CaseSwitchClauseSyntax {
            return this.update(this.caseKeyword, this.expression, colonToken, this.statements);
        }

        public withStatements(statements: ISyntaxList<IStatementSyntax>): CaseSwitchClauseSyntax {
            return this.update(this.caseKeyword, this.expression, this.colonToken, statements);
        }

        public withStatement(statement: IStatementSyntax): CaseSwitchClauseSyntax {
            return this.withStatements(Syntax.list<IStatementSyntax>([statement]));
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.statements.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class DefaultSwitchClauseSyntax extends SyntaxNode implements ISwitchClauseSyntax {
        constructor(public defaultKeyword: ISyntaxToken,
            public colonToken: ISyntaxToken,
            public statements: ISyntaxList<IStatementSyntax>,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitDefaultSwitchClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.DefaultSwitchClause;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.defaultKeyword;
                case 1: return this.colonToken;
                case 2: return this.statements;
                default: throw Errors.invalidOperation();
            }
        }

        public isSwitchClause(): boolean {
            return true;
        }

        public update(defaultKeyword: ISyntaxToken,
            colonToken: ISyntaxToken,
            statements: ISyntaxList<IStatementSyntax>): DefaultSwitchClauseSyntax {
            if (this.defaultKeyword === defaultKeyword && this.colonToken === colonToken && this.statements === statements) {
                return this;
            }

            return new DefaultSwitchClauseSyntax(defaultKeyword, colonToken, statements, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(defaultKeyword: ISyntaxToken,
            colonToken: ISyntaxToken): DefaultSwitchClauseSyntax {
            return new DefaultSwitchClauseSyntax(defaultKeyword, colonToken, Syntax.emptyList<IStatementSyntax>(), /*parsedInStrictMode:*/ false);
        }

        public static create1(): DefaultSwitchClauseSyntax {
            return new DefaultSwitchClauseSyntax(Syntax.token(SyntaxKind.DefaultKeyword), Syntax.token(SyntaxKind.ColonToken), Syntax.emptyList<IStatementSyntax>(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): DefaultSwitchClauseSyntax {
            return <DefaultSwitchClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): DefaultSwitchClauseSyntax {
            return <DefaultSwitchClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withDefaultKeyword(defaultKeyword: ISyntaxToken): DefaultSwitchClauseSyntax {
            return this.update(defaultKeyword, this.colonToken, this.statements);
        }

        public withColonToken(colonToken: ISyntaxToken): DefaultSwitchClauseSyntax {
            return this.update(this.defaultKeyword, colonToken, this.statements);
        }

        public withStatements(statements: ISyntaxList<IStatementSyntax>): DefaultSwitchClauseSyntax {
            return this.update(this.defaultKeyword, this.colonToken, statements);
        }

        public withStatement(statement: IStatementSyntax): DefaultSwitchClauseSyntax {
            return this.withStatements(Syntax.list<IStatementSyntax>([statement]));
        }

        public isTypeScriptSpecific(): boolean {
            if (this.statements.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class BreakStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public breakKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitBreakStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.BreakStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.breakKeyword;
                case 1: return this.identifier;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(breakKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            semicolonToken: ISyntaxToken): BreakStatementSyntax {
            if (this.breakKeyword === breakKeyword && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new BreakStatementSyntax(breakKeyword, identifier, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(breakKeyword: ISyntaxToken,
            semicolonToken: ISyntaxToken): BreakStatementSyntax {
            return new BreakStatementSyntax(breakKeyword, null, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): BreakStatementSyntax {
            return new BreakStatementSyntax(Syntax.token(SyntaxKind.BreakKeyword), null, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): BreakStatementSyntax {
            return <BreakStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): BreakStatementSyntax {
            return <BreakStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withBreakKeyword(breakKeyword: ISyntaxToken): BreakStatementSyntax {
            return this.update(breakKeyword, this.identifier, this.semicolonToken);
        }

        public withIdentifier(identifier: ISyntaxToken): BreakStatementSyntax {
            return this.update(this.breakKeyword, identifier, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): BreakStatementSyntax {
            return this.update(this.breakKeyword, this.identifier, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return false;
        }
    }

    export class ContinueStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public continueKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitContinueStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ContinueStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.continueKeyword;
                case 1: return this.identifier;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(continueKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            semicolonToken: ISyntaxToken): ContinueStatementSyntax {
            if (this.continueKeyword === continueKeyword && this.identifier === identifier && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new ContinueStatementSyntax(continueKeyword, identifier, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(continueKeyword: ISyntaxToken,
            semicolonToken: ISyntaxToken): ContinueStatementSyntax {
            return new ContinueStatementSyntax(continueKeyword, null, semicolonToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ContinueStatementSyntax {
            return new ContinueStatementSyntax(Syntax.token(SyntaxKind.ContinueKeyword), null, Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ContinueStatementSyntax {
            return <ContinueStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ContinueStatementSyntax {
            return <ContinueStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withContinueKeyword(continueKeyword: ISyntaxToken): ContinueStatementSyntax {
            return this.update(continueKeyword, this.identifier, this.semicolonToken);
        }

        public withIdentifier(identifier: ISyntaxToken): ContinueStatementSyntax {
            return this.update(this.continueKeyword, identifier, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): ContinueStatementSyntax {
            return this.update(this.continueKeyword, this.identifier, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return false;
        }
    }

    export class ForStatementSyntax extends SyntaxNode implements IIterationStatementSyntax {
        constructor(public forKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public variableDeclaration: VariableDeclarationSyntax,
            public initializer: IExpressionSyntax,
            public firstSemicolonToken: ISyntaxToken,
            public condition: IExpressionSyntax,
            public secondSemicolonToken: ISyntaxToken,
            public incrementor: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitForStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ForStatement;
        }

        public childCount(): number {
            return 10;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.forKeyword;
                case 1: return this.openParenToken;
                case 2: return this.variableDeclaration;
                case 3: return this.initializer;
                case 4: return this.firstSemicolonToken;
                case 5: return this.condition;
                case 6: return this.secondSemicolonToken;
                case 7: return this.incrementor;
                case 8: return this.closeParenToken;
                case 9: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public isIterationStatement(): boolean {
            return true;
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(forKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            variableDeclaration: VariableDeclarationSyntax,
            initializer: IExpressionSyntax,
            firstSemicolonToken: ISyntaxToken,
            condition: IExpressionSyntax,
            secondSemicolonToken: ISyntaxToken,
            incrementor: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): ForStatementSyntax {
            if (this.forKeyword === forKeyword && this.openParenToken === openParenToken && this.variableDeclaration === variableDeclaration && this.initializer === initializer && this.firstSemicolonToken === firstSemicolonToken && this.condition === condition && this.secondSemicolonToken === secondSemicolonToken && this.incrementor === incrementor && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new ForStatementSyntax(forKeyword, openParenToken, variableDeclaration, initializer, firstSemicolonToken, condition, secondSemicolonToken, incrementor, closeParenToken, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(forKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            firstSemicolonToken: ISyntaxToken,
            secondSemicolonToken: ISyntaxToken,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): ForStatementSyntax {
            return new ForStatementSyntax(forKeyword, openParenToken, null, null, firstSemicolonToken, null, secondSemicolonToken, null, closeParenToken, statement, /*parsedInStrictMode:*/ false);
        }

        public static create1(statement: IStatementSyntax): ForStatementSyntax {
            return new ForStatementSyntax(Syntax.token(SyntaxKind.ForKeyword), Syntax.token(SyntaxKind.OpenParenToken), null, null, Syntax.token(SyntaxKind.SemicolonToken), null, Syntax.token(SyntaxKind.SemicolonToken), null, Syntax.token(SyntaxKind.CloseParenToken), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ForStatementSyntax {
            return <ForStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ForStatementSyntax {
            return <ForStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withForKeyword(forKeyword: ISyntaxToken): ForStatementSyntax {
            return this.update(forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ForStatementSyntax {
            return this.update(this.forKeyword, openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withInitializer(initializer: IExpressionSyntax): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withFirstSemicolonToken(firstSemicolonToken: ISyntaxToken): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withCondition(condition: IExpressionSyntax): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withSecondSemicolonToken(secondSemicolonToken: ISyntaxToken): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, secondSemicolonToken, this.incrementor, this.closeParenToken, this.statement);
        }

        public withIncrementor(incrementor: IExpressionSyntax): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, incrementor, this.closeParenToken, this.statement);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, closeParenToken, this.statement);
        }

        public withStatement(statement: IStatementSyntax): ForStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.initializer, this.firstSemicolonToken, this.condition, this.secondSemicolonToken, this.incrementor, this.closeParenToken, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.variableDeclaration !== null && this.variableDeclaration.isTypeScriptSpecific()) { return true; }
            if (this.initializer !== null && this.initializer.isTypeScriptSpecific()) { return true; }
            if (this.condition !== null && this.condition.isTypeScriptSpecific()) { return true; }
            if (this.incrementor !== null && this.incrementor.isTypeScriptSpecific()) { return true; }
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            //For the moment force variable declarations to be null. We'll only support initializers.
            var anns = leadingTokenAnnots(this.forKeyword);
            if (this.variableDeclaration && !this.initializer) {
                return new RsForStmt(
                    helper.getSourceSpan(this),
                    leadingTokenAnnots(this),
                    this.variableDeclaration.toRsForInit(helper, anns),
                    (this.condition) ? new RsJust(this.condition.toRsExp(helper)) : new RsNothing(),
                    (this.incrementor) ? new RsJust(this.incrementor.toRsExp(helper)) : new RsNothing(),
                    this.statement.toRsStmt(helper));
            }
            else if (this.initializer && !this.variableDeclaration) {
                return new RsForStmt(
                    helper.getSourceSpan(this),
                    leadingTokenAnnots(this),
                    new RsExprInit(this.initializer.toRsExp(helper)),
                    (this.condition) ? new RsJust(this.condition.toRsExp(helper)) : new RsNothing(),
                    (this.incrementor) ? new RsJust(this.incrementor.toRsExp(helper)) : new RsNothing(),
                    this.statement.toRsStmt(helper));
            }
            helper.postDiagnostic(this, DiagnosticCode.Variable_declarations_are_only_supported_in_the_first_part_of_the_loop_in_0, [this.initializer.fullText()]);
        }
        //RefScript - end

    }

    export class ForInStatementSyntax extends SyntaxNode implements IIterationStatementSyntax {
        constructor(public forKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public variableDeclaration: VariableDeclarationSyntax,
            public left: IExpressionSyntax,
            public inKeyword: ISyntaxToken,
            public expression: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitForInStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ForInStatement;
        }

        public childCount(): number {
            return 8;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.forKeyword;
                case 1: return this.openParenToken;
                case 2: return this.variableDeclaration;
                case 3: return this.left;
                case 4: return this.inKeyword;
                case 5: return this.expression;
                case 6: return this.closeParenToken;
                case 7: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public isIterationStatement(): boolean {
            return true;
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(forKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            variableDeclaration: VariableDeclarationSyntax,
            left: IExpressionSyntax,
            inKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): ForInStatementSyntax {
            if (this.forKeyword === forKeyword && this.openParenToken === openParenToken && this.variableDeclaration === variableDeclaration && this.left === left && this.inKeyword === inKeyword && this.expression === expression && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new ForInStatementSyntax(forKeyword, openParenToken, variableDeclaration, left, inKeyword, expression, closeParenToken, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(forKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            inKeyword: ISyntaxToken,
            expression: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): ForInStatementSyntax {
            return new ForInStatementSyntax(forKeyword, openParenToken, null, null, inKeyword, expression, closeParenToken, statement, /*parsedInStrictMode:*/ false);
        }

        public static create1(expression: IExpressionSyntax,
            statement: IStatementSyntax): ForInStatementSyntax {
            return new ForInStatementSyntax(Syntax.token(SyntaxKind.ForKeyword), Syntax.token(SyntaxKind.OpenParenToken), null, null, Syntax.token(SyntaxKind.InKeyword), expression, Syntax.token(SyntaxKind.CloseParenToken), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ForInStatementSyntax {
            return <ForInStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ForInStatementSyntax {
            return <ForInStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withForKeyword(forKeyword: ISyntaxToken): ForInStatementSyntax {
            return this.update(forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): ForInStatementSyntax {
            return this.update(this.forKeyword, openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        }

        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        }

        public withLeft(left: IExpressionSyntax): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, left, this.inKeyword, this.expression, this.closeParenToken, this.statement);
        }

        public withInKeyword(inKeyword: ISyntaxToken): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, inKeyword, this.expression, this.closeParenToken, this.statement);
        }

        public withExpression(expression: IExpressionSyntax): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, expression, this.closeParenToken, this.statement);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, closeParenToken, this.statement);
        }

        public withStatement(statement: IStatementSyntax): ForInStatementSyntax {
            return this.update(this.forKeyword, this.openParenToken, this.variableDeclaration, this.left, this.inKeyword, this.expression, this.closeParenToken, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.variableDeclaration !== null && this.variableDeclaration.isTypeScriptSpecific()) { return true; }
            if (this.left !== null && this.left.isTypeScriptSpecific()) { return true; }
            if (this.expression.isTypeScriptSpecific()) { return true; }
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            if (this.left) {
                var rsForInInit: RsForInInit = new RsForInLVal(this.left.toRsLValue(helper));
            }
            else {

                var vars = this.variableDeclaration.variableDeclarators.toNonSeparatorArray();

                if (vars.length === 1) {
                    var _var = vars[0];
                    var varId = _var.propertyName.toRsId(helper);
                    var rsForInInit: RsForInInit = new RsForInVar(varId);
                }
                else {
                    helper.postDiagnostic(this, DiagnosticCode.ForInStatementSyntax_to_RsStatement);
                }
            }
            return new RsForInStmt(helper.getSourceSpan(this), leadingTokenAnnots(this),
                rsForInInit,
                this.expression.toRsExp(helper),
                this.statement.toRsStmt(helper));
        }
        //RefScript - end

    }

    export class WhileStatementSyntax extends SyntaxNode implements IIterationStatementSyntax {
        constructor(public whileKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public condition: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitWhileStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.WhileStatement;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.whileKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public isIterationStatement(): boolean {
            return true;
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(whileKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            condition: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): WhileStatementSyntax {
            if (this.whileKeyword === whileKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new WhileStatementSyntax(whileKeyword, openParenToken, condition, closeParenToken, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(condition: IExpressionSyntax,
            statement: IStatementSyntax): WhileStatementSyntax {
            return new WhileStatementSyntax(Syntax.token(SyntaxKind.WhileKeyword), Syntax.token(SyntaxKind.OpenParenToken), condition, Syntax.token(SyntaxKind.CloseParenToken), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): WhileStatementSyntax {
            return <WhileStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): WhileStatementSyntax {
            return <WhileStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withWhileKeyword(whileKeyword: ISyntaxToken): WhileStatementSyntax {
            return this.update(whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): WhileStatementSyntax {
            return this.update(this.whileKeyword, openParenToken, this.condition, this.closeParenToken, this.statement);
        }

        public withCondition(condition: IExpressionSyntax): WhileStatementSyntax {
            return this.update(this.whileKeyword, this.openParenToken, condition, this.closeParenToken, this.statement);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): WhileStatementSyntax {
            return this.update(this.whileKeyword, this.openParenToken, this.condition, closeParenToken, this.statement);
        }

        public withStatement(statement: IStatementSyntax): WhileStatementSyntax {
            return this.update(this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.condition.isTypeScriptSpecific()) { return true; }
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            return new RsWhileStmt(
                helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.condition.toRsExp(helper),
                this.statement.toRsStmt(helper));
        }
        //RefScript - end

    }

    export class WithStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public withKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public condition: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitWithStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.WithStatement;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.withKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(withKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            condition: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            statement: IStatementSyntax): WithStatementSyntax {
            if (this.withKeyword === withKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.statement === statement) {
                return this;
            }

            return new WithStatementSyntax(withKeyword, openParenToken, condition, closeParenToken, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(condition: IExpressionSyntax,
            statement: IStatementSyntax): WithStatementSyntax {
            return new WithStatementSyntax(Syntax.token(SyntaxKind.WithKeyword), Syntax.token(SyntaxKind.OpenParenToken), condition, Syntax.token(SyntaxKind.CloseParenToken), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): WithStatementSyntax {
            return <WithStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): WithStatementSyntax {
            return <WithStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withWithKeyword(withKeyword: ISyntaxToken): WithStatementSyntax {
            return this.update(withKeyword, this.openParenToken, this.condition, this.closeParenToken, this.statement);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): WithStatementSyntax {
            return this.update(this.withKeyword, openParenToken, this.condition, this.closeParenToken, this.statement);
        }

        public withCondition(condition: IExpressionSyntax): WithStatementSyntax {
            return this.update(this.withKeyword, this.openParenToken, condition, this.closeParenToken, this.statement);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): WithStatementSyntax {
            return this.update(this.withKeyword, this.openParenToken, this.condition, closeParenToken, this.statement);
        }

        public withStatement(statement: IStatementSyntax): WithStatementSyntax {
            return this.update(this.withKeyword, this.openParenToken, this.condition, this.closeParenToken, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.condition.isTypeScriptSpecific()) { return true; }
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class EnumDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        constructor(public modifiers: ISyntaxList<ISyntaxToken>,
            public enumKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public openBraceToken: ISyntaxToken,
            public enumElements: ISeparatedSyntaxList<EnumElementSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitEnumDeclaration(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.EnumDeclaration;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.enumKeyword;
                case 2: return this.identifier;
                case 3: return this.openBraceToken;
                case 4: return this.enumElements;
                case 5: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(modifiers: ISyntaxList<ISyntaxToken>,
            enumKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            enumElements: ISeparatedSyntaxList<EnumElementSyntax>,
            closeBraceToken: ISyntaxToken): EnumDeclarationSyntax {
            if (this.modifiers === modifiers && this.enumKeyword === enumKeyword && this.identifier === identifier && this.openBraceToken === openBraceToken && this.enumElements === enumElements && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new EnumDeclarationSyntax(modifiers, enumKeyword, identifier, openBraceToken, enumElements, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(enumKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): EnumDeclarationSyntax {
            return new EnumDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), enumKeyword, identifier, openBraceToken, Syntax.emptySeparatedList<EnumElementSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): EnumDeclarationSyntax {
            return new EnumDeclarationSyntax(Syntax.emptyList<ISyntaxToken>(), Syntax.token(SyntaxKind.EnumKeyword), identifier, Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptySeparatedList<EnumElementSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): EnumDeclarationSyntax {
            return <EnumDeclarationSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): EnumDeclarationSyntax {
            return <EnumDeclarationSyntax>super.withTrailingTrivia(trivia);
        }

        public withModifiers(modifiers: ISyntaxList<ISyntaxToken>): EnumDeclarationSyntax {
            return this.update(modifiers, this.enumKeyword, this.identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        }

        public withModifier(modifier: ISyntaxToken): EnumDeclarationSyntax {
            return this.withModifiers(Syntax.list<ISyntaxToken>([modifier]));
        }

        public withEnumKeyword(enumKeyword: ISyntaxToken): EnumDeclarationSyntax {
            return this.update(this.modifiers, enumKeyword, this.identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        }

        public withIdentifier(identifier: ISyntaxToken): EnumDeclarationSyntax {
            return this.update(this.modifiers, this.enumKeyword, identifier, this.openBraceToken, this.enumElements, this.closeBraceToken);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): EnumDeclarationSyntax {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, openBraceToken, this.enumElements, this.closeBraceToken);
        }

        public withEnumElements(enumElements: ISeparatedSyntaxList<EnumElementSyntax>): EnumDeclarationSyntax {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, this.openBraceToken, enumElements, this.closeBraceToken);
        }

        public withEnumElement(enumElement: EnumElementSyntax): EnumDeclarationSyntax {
            return this.withEnumElements(Syntax.separatedList<EnumElementSyntax>([enumElement]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): EnumDeclarationSyntax {
            return this.update(this.modifiers, this.enumKeyword, this.identifier, this.openBraceToken, this.enumElements, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        // RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsEnumStmt {
            var originalAnnots = leadingTokenAnnots(this.firstToken());
            var sourceSpan = helper.getSourceSpan(this);
            return new RsEnumStmt(sourceSpan, originalAnnots,
                this.identifier.toRsId(helper),
                new RsList(this.enumElements.toNonSeparatorArray().map(e => e.toRsEnumElt(helper))))
        }
        // RefScript - end

    }

    export class EnumElementSyntax extends SyntaxNode {
        constructor(public propertyName: ISyntaxToken,
            public equalsValueClause: EqualsValueClauseSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitEnumElement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.EnumElement;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }

        public update(propertyName: ISyntaxToken,
            equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax {
            if (this.propertyName === propertyName && this.equalsValueClause === equalsValueClause) {
                return this;
            }

            return new EnumElementSyntax(propertyName, equalsValueClause, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(propertyName: ISyntaxToken): EnumElementSyntax {
            return new EnumElementSyntax(propertyName, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(propertyName: ISyntaxToken): EnumElementSyntax {
            return new EnumElementSyntax(propertyName, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): EnumElementSyntax {
            return <EnumElementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): EnumElementSyntax {
            return <EnumElementSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): EnumElementSyntax {
            return this.update(propertyName, this.equalsValueClause);
        }

        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax {
            return this.update(this.propertyName, equalsValueClause);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.equalsValueClause !== null && this.equalsValueClause.isTypeScriptSpecific()) { return true; }
            return false;
        }

        // RefScript - TODO - begin
        public toRsEnumElt(helper: RsHelper): RsEnumElt {
            var anns = leadingTokenAnnots(this.firstToken());

            // If there's no value provided, try to infer it
            if (!this.equalsValueClause) {
                // Inferred (Int) literal
                var enumDecl = <PullEnumElementDecl>helper.getDeclForAST(this);
                if (Syntax.isIntLit(enumDecl.constantValue.toString())) {

                    return new RsEnumElt(helper.getSourceSpan(this), anns, this.propertyName.toRsId(helper),
                        new RsIntLit(helper.getSourceSpan(this), [], enumDecl.constantValue));
                }

                helper.postDiagnostic(this, DiagnosticCode.Invalid_enumeration_entry_for_0, [this.propertyName.text()]);
            }

            // Otherwise get an expression
            return new RsEnumElt(helper.getSourceSpan(this), anns,
                this.propertyName.toRsId(helper), this.equalsValueClause.toRsExp(helper));

        }
        // RefScript - end
    }

    export class CastExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        constructor(public lessThanToken: ISyntaxToken,
            public type: ITypeSyntax,
            public greaterThanToken: ISyntaxToken,
            public expression: IUnaryExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitCastExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.CastExpression;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.type;
                case 2: return this.greaterThanToken;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(lessThanToken: ISyntaxToken,
            type: ITypeSyntax,
            greaterThanToken: ISyntaxToken,
            expression: IUnaryExpressionSyntax): CastExpressionSyntax {
            if (this.lessThanToken === lessThanToken && this.type === type && this.greaterThanToken === greaterThanToken && this.expression === expression) {
                return this;
            }

            return new CastExpressionSyntax(lessThanToken, type, greaterThanToken, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(type: ITypeSyntax,
            expression: IUnaryExpressionSyntax): CastExpressionSyntax {
            return new CastExpressionSyntax(Syntax.token(SyntaxKind.LessThanToken), type, Syntax.token(SyntaxKind.GreaterThanToken), expression, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): CastExpressionSyntax {
            return <CastExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): CastExpressionSyntax {
            return <CastExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withLessThanToken(lessThanToken: ISyntaxToken): CastExpressionSyntax {
            return this.update(lessThanToken, this.type, this.greaterThanToken, this.expression);
        }

        public withType(type: ITypeSyntax): CastExpressionSyntax {
            return this.update(this.lessThanToken, type, this.greaterThanToken, this.expression);
        }

        public withGreaterThanToken(greaterThanToken: ISyntaxToken): CastExpressionSyntax {
            return this.update(this.lessThanToken, this.type, greaterThanToken, this.expression);
        }

        public withExpression(expression: IUnaryExpressionSyntax): CastExpressionSyntax {
            return this.update(this.lessThanToken, this.type, this.greaterThanToken, expression);
        }

        public isTypeScriptSpecific(): boolean {
            return true;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            var sourceSpan = helper.getSourceSpan(this);

            var castType: RsType;

            switch (this.type.kind()) {
                case SyntaxKind.AnyKeyword:
                    castType = TTop;
                    break;
                case SyntaxKind.BooleanKeyword:
                    castType = TBoolean
                    break;
                case SyntaxKind.NumberKeyword:
                    castType = TNumber;
                    break;
                case SyntaxKind.StringKeyword:
                    castType = TString;
                    break;
                case SyntaxKind.VoidKeyword:
                    castType = TVoid;
                    break;
                default:
                    var eltSymbol = helper.getSymbolForAST(this.type);
                    if (eltSymbol && eltSymbol.type) {
                        castType = eltSymbol.type.toRsType(MutabilityKind.ParametricK);
                    }
                    else {
                        castType = TError;
                        helper.postDiagnostic(this, DiagnosticCode.RefScript_does_not_support_the_cast_0, [this.fullText()]);
                    }
                    break;
            }

            var castAnn = new RsBindAnnotation(sourceSpan, AnnotKind.RawCast, Assignability.AErrorAssignability, castType.toString());
            return new RsCast(helper.getSourceSpan(this), [castAnn], this.expression.toRsExp(helper));
        }
        //RefScript - end
    }

    export class ObjectLiteralExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        constructor(public openBraceToken: ISyntaxToken,
            public propertyAssignments: ISeparatedSyntaxList<IPropertyAssignmentSyntax>,
            public closeBraceToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitObjectLiteralExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.ObjectLiteralExpression;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.propertyAssignments;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isPrimaryExpression(): boolean {
            return true;
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(openBraceToken: ISyntaxToken,
            propertyAssignments: ISeparatedSyntaxList<IPropertyAssignmentSyntax>,
            closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax {
            if (this.openBraceToken === openBraceToken && this.propertyAssignments === propertyAssignments && this.closeBraceToken === closeBraceToken) {
                return this;
            }

            return new ObjectLiteralExpressionSyntax(openBraceToken, propertyAssignments, closeBraceToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(openBraceToken: ISyntaxToken,
            closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax {
            return new ObjectLiteralExpressionSyntax(openBraceToken, Syntax.emptySeparatedList<IPropertyAssignmentSyntax>(), closeBraceToken, /*parsedInStrictMode:*/ false);
        }

        public static create1(): ObjectLiteralExpressionSyntax {
            return new ObjectLiteralExpressionSyntax(Syntax.token(SyntaxKind.OpenBraceToken), Syntax.emptySeparatedList<IPropertyAssignmentSyntax>(), Syntax.token(SyntaxKind.CloseBraceToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectLiteralExpressionSyntax {
            return <ObjectLiteralExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectLiteralExpressionSyntax {
            return <ObjectLiteralExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withOpenBraceToken(openBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax {
            return this.update(openBraceToken, this.propertyAssignments, this.closeBraceToken);
        }

        public withPropertyAssignments(propertyAssignments: ISeparatedSyntaxList<IPropertyAssignmentSyntax>): ObjectLiteralExpressionSyntax {
            return this.update(this.openBraceToken, propertyAssignments, this.closeBraceToken);
        }

        public withPropertyAssignment(propertyAssignment: IPropertyAssignmentSyntax): ObjectLiteralExpressionSyntax {
            return this.withPropertyAssignments(Syntax.separatedList<IPropertyAssignmentSyntax>([propertyAssignment]));
        }

        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax {
            return this.update(this.openBraceToken, this.propertyAssignments, closeBraceToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.propertyAssignments.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return new RsObjectLit(
                helper.getSourceSpan(this),
                leadingTokenAnnots(this),
                this.propertyAssignments.toRsMemList(helper));
        }
        //RefScript - end

    }

    export class SimplePropertyAssignmentSyntax extends SyntaxNode implements IPropertyAssignmentSyntax {
        constructor(public propertyName: ISyntaxToken,
            public colonToken: ISyntaxToken,
            public expression: IExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitSimplePropertyAssignment(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.SimplePropertyAssignment;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.colonToken;
                case 2: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isPropertyAssignment(): boolean {
            return true;
        }

        public update(propertyName: ISyntaxToken,
            colonToken: ISyntaxToken,
            expression: IExpressionSyntax): SimplePropertyAssignmentSyntax {
            if (this.propertyName === propertyName && this.colonToken === colonToken && this.expression === expression) {
                return this;
            }

            return new SimplePropertyAssignmentSyntax(propertyName, colonToken, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(propertyName: ISyntaxToken,
            expression: IExpressionSyntax): SimplePropertyAssignmentSyntax {
            return new SimplePropertyAssignmentSyntax(propertyName, Syntax.token(SyntaxKind.ColonToken), expression, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): SimplePropertyAssignmentSyntax {
            return <SimplePropertyAssignmentSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): SimplePropertyAssignmentSyntax {
            return <SimplePropertyAssignmentSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): SimplePropertyAssignmentSyntax {
            return this.update(propertyName, this.colonToken, this.expression);
        }

        public withColonToken(colonToken: ISyntaxToken): SimplePropertyAssignmentSyntax {
            return this.update(this.propertyName, colonToken, this.expression);
        }

        public withExpression(expression: IExpressionSyntax): SimplePropertyAssignmentSyntax {
            return this.update(this.propertyName, this.colonToken, expression);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsMemList(helper: RsHelper) {
            var pName = this.propertyName;
            return new RsList(
                [new RsPropId(helper.getSourceSpan(pName), [], this.propertyName.toRsId(helper)),
                    this.expression.toRsExp(helper)]);
        }
        //RefScript - end
    }

    export class FunctionPropertyAssignmentSyntax extends SyntaxNode implements IPropertyAssignmentSyntax {
        constructor(public propertyName: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitFunctionPropertyAssignment(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.FunctionPropertyAssignment;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.callSignature;
                case 2: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public isPropertyAssignment(): boolean {
            return true;
        }

        public update(propertyName: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax): FunctionPropertyAssignmentSyntax {
            if (this.propertyName === propertyName && this.callSignature === callSignature && this.block === block) {
                return this;
            }

            return new FunctionPropertyAssignmentSyntax(propertyName, callSignature, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(propertyName: ISyntaxToken): FunctionPropertyAssignmentSyntax {
            return new FunctionPropertyAssignmentSyntax(propertyName, CallSignatureSyntax.create1(), BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionPropertyAssignmentSyntax {
            return <FunctionPropertyAssignmentSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionPropertyAssignmentSyntax {
            return <FunctionPropertyAssignmentSyntax>super.withTrailingTrivia(trivia);
        }

        public withPropertyName(propertyName: ISyntaxToken): FunctionPropertyAssignmentSyntax {
            return this.update(propertyName, this.callSignature, this.block);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): FunctionPropertyAssignmentSyntax {
            return this.update(this.propertyName, callSignature, this.block);
        }

        public withBlock(block: BlockSyntax): FunctionPropertyAssignmentSyntax {
            return this.update(this.propertyName, this.callSignature, block);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.callSignature.isTypeScriptSpecific()) { return true; }
            if (this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class FunctionExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        constructor(public functionKeyword: ISyntaxToken,
            public identifier: ISyntaxToken,
            public callSignature: CallSignatureSyntax,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitFunctionExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.FunctionExpression;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.functionKeyword;
                case 1: return this.identifier;
                case 2: return this.callSignature;
                case 3: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public isPrimaryExpression(): boolean {
            return true;
        }

        public isMemberExpression(): boolean {
            return true;
        }

        public isLeftHandSideExpression(): boolean {
            return true;
        }

        public isPostfixExpression(): boolean {
            return true;
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(functionKeyword: ISyntaxToken,
            identifier: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax): FunctionExpressionSyntax {
            if (this.functionKeyword === functionKeyword && this.identifier === identifier && this.callSignature === callSignature && this.block === block) {
                return this;
            }

            return new FunctionExpressionSyntax(functionKeyword, identifier, callSignature, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(functionKeyword: ISyntaxToken,
            callSignature: CallSignatureSyntax,
            block: BlockSyntax): FunctionExpressionSyntax {
            return new FunctionExpressionSyntax(functionKeyword, null, callSignature, block, /*parsedInStrictMode:*/ false);
        }

        public static create1(): FunctionExpressionSyntax {
            return new FunctionExpressionSyntax(Syntax.token(SyntaxKind.FunctionKeyword), null, CallSignatureSyntax.create1(), BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionExpressionSyntax {
            return <FunctionExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionExpressionSyntax {
            return <FunctionExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withFunctionKeyword(functionKeyword: ISyntaxToken): FunctionExpressionSyntax {
            return this.update(functionKeyword, this.identifier, this.callSignature, this.block);
        }

        public withIdentifier(identifier: ISyntaxToken): FunctionExpressionSyntax {
            return this.update(this.functionKeyword, identifier, this.callSignature, this.block);
        }

        public withCallSignature(callSignature: CallSignatureSyntax): FunctionExpressionSyntax {
            return this.update(this.functionKeyword, this.identifier, callSignature, this.block);
        }

        public withBlock(block: BlockSyntax): FunctionExpressionSyntax {
            return this.update(this.functionKeyword, this.identifier, this.callSignature, block);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.callSignature.isTypeScriptSpecific()) { return true; }
            if (this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {

            this.callSignature.parameterList.parameters.toNonSeparatorArray().forEach(p => {
                if (p.equalsValueClause) {
                    helper.postDiagnostic(this, DiagnosticCode.Initialization_of_parameter_0_at_the_signature_site_is_not_supported, [p.identifier.text()]);
                }
            });

            var anns = ArrayUtilities.concat([leadingTokenAnnots(this.functionKeyword), trailingTokenAnnots(this.callSignature), leadingTokenAnnots(this.block)]);
            var funcAnns: RsBindAnnotation[] = <RsBindAnnotation[]> anns.filter(a => a.kind() === AnnotKind.RawFunc);

            if (funcAnns.length !== 1) {
                helper.postDiagnostic(this, DiagnosticCode.Anonymous_function_should_have_exactly_one_type_annotation);
            }

            return new RsFuncExpr(helper.getSourceSpan(this), anns,
                (this.identifier) ? new RsJust(this.identifier.toRsId(helper)) : new RsNothing(),
                new RsList<RsId>(this.callSignature.parameterList.parameters.toNonSeparatorArray().map(p => p.toRsId(helper))),
                new RsList<RsStatement>(this.block.statements.toArray().map(s => s.toRsStmt(helper))));
        }
        //RefScript - end

    }

    export class EmptyStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitEmptyStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.EmptyStatement;
        }

        public childCount(): number {
            return 1;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(semicolonToken: ISyntaxToken): EmptyStatementSyntax {
            if (this.semicolonToken === semicolonToken) {
                return this;
            }

            return new EmptyStatementSyntax(semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(): EmptyStatementSyntax {
            return new EmptyStatementSyntax(Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): EmptyStatementSyntax {
            return <EmptyStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): EmptyStatementSyntax {
            return <EmptyStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): EmptyStatementSyntax {
            return this.update(semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return false;
        }

        //RefScript - TODO - begin
        public toRsStmt(helper: RsHelper): RsStatement {
            return new RsEmptyStmt(helper.getSourceSpan(this), leadingTokenAnnots(this.semicolonToken));
        }
        //RefScript - end

    }

    export class TryStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public tryKeyword: ISyntaxToken,
            public block: BlockSyntax,
            public catchClause: CatchClauseSyntax,
            public finallyClause: FinallyClauseSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTryStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TryStatement;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.tryKeyword;
                case 1: return this.block;
                case 2: return this.catchClause;
                case 3: return this.finallyClause;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(tryKeyword: ISyntaxToken,
            block: BlockSyntax,
            catchClause: CatchClauseSyntax,
            finallyClause: FinallyClauseSyntax): TryStatementSyntax {
            if (this.tryKeyword === tryKeyword && this.block === block && this.catchClause === catchClause && this.finallyClause === finallyClause) {
                return this;
            }

            return new TryStatementSyntax(tryKeyword, block, catchClause, finallyClause, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(tryKeyword: ISyntaxToken,
            block: BlockSyntax): TryStatementSyntax {
            return new TryStatementSyntax(tryKeyword, block, null, null, /*parsedInStrictMode:*/ false);
        }

        public static create1(): TryStatementSyntax {
            return new TryStatementSyntax(Syntax.token(SyntaxKind.TryKeyword), BlockSyntax.create1(), null, null, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TryStatementSyntax {
            return <TryStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TryStatementSyntax {
            return <TryStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withTryKeyword(tryKeyword: ISyntaxToken): TryStatementSyntax {
            return this.update(tryKeyword, this.block, this.catchClause, this.finallyClause);
        }

        public withBlock(block: BlockSyntax): TryStatementSyntax {
            return this.update(this.tryKeyword, block, this.catchClause, this.finallyClause);
        }

        public withCatchClause(catchClause: CatchClauseSyntax): TryStatementSyntax {
            return this.update(this.tryKeyword, this.block, catchClause, this.finallyClause);
        }

        public withFinallyClause(finallyClause: FinallyClauseSyntax): TryStatementSyntax {
            return this.update(this.tryKeyword, this.block, this.catchClause, finallyClause);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.block.isTypeScriptSpecific()) { return true; }
            if (this.catchClause !== null && this.catchClause.isTypeScriptSpecific()) { return true; }
            if (this.finallyClause !== null && this.finallyClause.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class CatchClauseSyntax extends SyntaxNode {
        constructor(public catchKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public identifier: ISyntaxToken,
            public typeAnnotation: TypeAnnotationSyntax,
            public closeParenToken: ISyntaxToken,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitCatchClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.CatchClause;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.catchKeyword;
                case 1: return this.openParenToken;
                case 2: return this.identifier;
                case 3: return this.typeAnnotation;
                case 4: return this.closeParenToken;
                case 5: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public update(catchKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            identifier: ISyntaxToken,
            typeAnnotation: TypeAnnotationSyntax,
            closeParenToken: ISyntaxToken,
            block: BlockSyntax): CatchClauseSyntax {
            if (this.catchKeyword === catchKeyword && this.openParenToken === openParenToken && this.identifier === identifier && this.typeAnnotation === typeAnnotation && this.closeParenToken === closeParenToken && this.block === block) {
                return this;
            }

            return new CatchClauseSyntax(catchKeyword, openParenToken, identifier, typeAnnotation, closeParenToken, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create(catchKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            identifier: ISyntaxToken,
            closeParenToken: ISyntaxToken,
            block: BlockSyntax): CatchClauseSyntax {
            return new CatchClauseSyntax(catchKeyword, openParenToken, identifier, null, closeParenToken, block, /*parsedInStrictMode:*/ false);
        }

        public static create1(identifier: ISyntaxToken): CatchClauseSyntax {
            return new CatchClauseSyntax(Syntax.token(SyntaxKind.CatchKeyword), Syntax.token(SyntaxKind.OpenParenToken), identifier, null, Syntax.token(SyntaxKind.CloseParenToken), BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): CatchClauseSyntax {
            return <CatchClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): CatchClauseSyntax {
            return <CatchClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withCatchKeyword(catchKeyword: ISyntaxToken): CatchClauseSyntax {
            return this.update(catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, this.block);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): CatchClauseSyntax {
            return this.update(this.catchKeyword, openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, this.block);
        }

        public withIdentifier(identifier: ISyntaxToken): CatchClauseSyntax {
            return this.update(this.catchKeyword, this.openParenToken, identifier, this.typeAnnotation, this.closeParenToken, this.block);
        }

        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): CatchClauseSyntax {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, typeAnnotation, this.closeParenToken, this.block);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): CatchClauseSyntax {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, closeParenToken, this.block);
        }

        public withBlock(block: BlockSyntax): CatchClauseSyntax {
            return this.update(this.catchKeyword, this.openParenToken, this.identifier, this.typeAnnotation, this.closeParenToken, block);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.typeAnnotation !== null && this.typeAnnotation.isTypeScriptSpecific()) { return true; }
            if (this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class FinallyClauseSyntax extends SyntaxNode {
        constructor(public finallyKeyword: ISyntaxToken,
            public block: BlockSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitFinallyClause(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.FinallyClause;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.finallyKeyword;
                case 1: return this.block;
                default: throw Errors.invalidOperation();
            }
        }

        public update(finallyKeyword: ISyntaxToken,
            block: BlockSyntax): FinallyClauseSyntax {
            if (this.finallyKeyword === finallyKeyword && this.block === block) {
                return this;
            }

            return new FinallyClauseSyntax(finallyKeyword, block, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(): FinallyClauseSyntax {
            return new FinallyClauseSyntax(Syntax.token(SyntaxKind.FinallyKeyword), BlockSyntax.create1(), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): FinallyClauseSyntax {
            return <FinallyClauseSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): FinallyClauseSyntax {
            return <FinallyClauseSyntax>super.withTrailingTrivia(trivia);
        }

        public withFinallyKeyword(finallyKeyword: ISyntaxToken): FinallyClauseSyntax {
            return this.update(finallyKeyword, this.block);
        }

        public withBlock(block: BlockSyntax): FinallyClauseSyntax {
            return this.update(this.finallyKeyword, block);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.block.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class LabeledStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public identifier: ISyntaxToken,
            public colonToken: ISyntaxToken,
            public statement: IStatementSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitLabeledStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.LabeledStatement;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.colonToken;
                case 2: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(identifier: ISyntaxToken,
            colonToken: ISyntaxToken,
            statement: IStatementSyntax): LabeledStatementSyntax {
            if (this.identifier === identifier && this.colonToken === colonToken && this.statement === statement) {
                return this;
            }

            return new LabeledStatementSyntax(identifier, colonToken, statement, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(identifier: ISyntaxToken,
            statement: IStatementSyntax): LabeledStatementSyntax {
            return new LabeledStatementSyntax(identifier, Syntax.token(SyntaxKind.ColonToken), statement, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): LabeledStatementSyntax {
            return <LabeledStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): LabeledStatementSyntax {
            return <LabeledStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withIdentifier(identifier: ISyntaxToken): LabeledStatementSyntax {
            return this.update(identifier, this.colonToken, this.statement);
        }

        public withColonToken(colonToken: ISyntaxToken): LabeledStatementSyntax {
            return this.update(this.identifier, colonToken, this.statement);
        }

        public withStatement(statement: IStatementSyntax): LabeledStatementSyntax {
            return this.update(this.identifier, this.colonToken, statement);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.statement.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class DoStatementSyntax extends SyntaxNode implements IIterationStatementSyntax {
        constructor(public doKeyword: ISyntaxToken,
            public statement: IStatementSyntax,
            public whileKeyword: ISyntaxToken,
            public openParenToken: ISyntaxToken,
            public condition: IExpressionSyntax,
            public closeParenToken: ISyntaxToken,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitDoStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.DoStatement;
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.doKeyword;
                case 1: return this.statement;
                case 2: return this.whileKeyword;
                case 3: return this.openParenToken;
                case 4: return this.condition;
                case 5: return this.closeParenToken;
                case 6: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isIterationStatement(): boolean {
            return true;
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(doKeyword: ISyntaxToken,
            statement: IStatementSyntax,
            whileKeyword: ISyntaxToken,
            openParenToken: ISyntaxToken,
            condition: IExpressionSyntax,
            closeParenToken: ISyntaxToken,
            semicolonToken: ISyntaxToken): DoStatementSyntax {
            if (this.doKeyword === doKeyword && this.statement === statement && this.whileKeyword === whileKeyword && this.openParenToken === openParenToken && this.condition === condition && this.closeParenToken === closeParenToken && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new DoStatementSyntax(doKeyword, statement, whileKeyword, openParenToken, condition, closeParenToken, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(statement: IStatementSyntax,
            condition: IExpressionSyntax): DoStatementSyntax {
            return new DoStatementSyntax(Syntax.token(SyntaxKind.DoKeyword), statement, Syntax.token(SyntaxKind.WhileKeyword), Syntax.token(SyntaxKind.OpenParenToken), condition, Syntax.token(SyntaxKind.CloseParenToken), Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): DoStatementSyntax {
            return <DoStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): DoStatementSyntax {
            return <DoStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withDoKeyword(doKeyword: ISyntaxToken): DoStatementSyntax {
            return this.update(doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        }

        public withStatement(statement: IStatementSyntax): DoStatementSyntax {
            return this.update(this.doKeyword, statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        }

        public withWhileKeyword(whileKeyword: ISyntaxToken): DoStatementSyntax {
            return this.update(this.doKeyword, this.statement, whileKeyword, this.openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        }

        public withOpenParenToken(openParenToken: ISyntaxToken): DoStatementSyntax {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, openParenToken, this.condition, this.closeParenToken, this.semicolonToken);
        }

        public withCondition(condition: IExpressionSyntax): DoStatementSyntax {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, condition, this.closeParenToken, this.semicolonToken);
        }

        public withCloseParenToken(closeParenToken: ISyntaxToken): DoStatementSyntax {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, closeParenToken, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): DoStatementSyntax {
            return this.update(this.doKeyword, this.statement, this.whileKeyword, this.openParenToken, this.condition, this.closeParenToken, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.statement.isTypeScriptSpecific()) { return true; }
            if (this.condition.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class TypeOfExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        constructor(public typeOfKeyword: ISyntaxToken,
            public expression: IUnaryExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitTypeOfExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.TypeOfExpression;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeOfKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(typeOfKeyword: ISyntaxToken,
            expression: IUnaryExpressionSyntax): TypeOfExpressionSyntax {
            if (this.typeOfKeyword === typeOfKeyword && this.expression === expression) {
                return this;
            }

            return new TypeOfExpressionSyntax(typeOfKeyword, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IUnaryExpressionSyntax): TypeOfExpressionSyntax {
            return new TypeOfExpressionSyntax(Syntax.token(SyntaxKind.TypeOfKeyword), expression, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeOfExpressionSyntax {
            return <TypeOfExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeOfExpressionSyntax {
            return <TypeOfExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withTypeOfKeyword(typeOfKeyword: ISyntaxToken): TypeOfExpressionSyntax {
            return this.update(typeOfKeyword, this.expression);
        }

        public withExpression(expression: IUnaryExpressionSyntax): TypeOfExpressionSyntax {
            return this.update(this.typeOfKeyword, expression);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }

        //RefScript - TODO - begin
        public toRsExp(helper: RsHelper): RsExpression {
            return new RsPrefixExpr(helper.getSourceSpan(this),
                leadingTokenAnnots(this.firstToken()),
                new RsPrefixOp(RsPrefixOpKind.PrefixTypeof),
                this.expression.toRsExp(helper));
        }
        //RefScript - end
    }

    export class DeleteExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        constructor(public deleteKeyword: ISyntaxToken,
            public expression: IUnaryExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitDeleteExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.DeleteExpression;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.deleteKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(deleteKeyword: ISyntaxToken,
            expression: IUnaryExpressionSyntax): DeleteExpressionSyntax {
            if (this.deleteKeyword === deleteKeyword && this.expression === expression) {
                return this;
            }

            return new DeleteExpressionSyntax(deleteKeyword, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IUnaryExpressionSyntax): DeleteExpressionSyntax {
            return new DeleteExpressionSyntax(Syntax.token(SyntaxKind.DeleteKeyword), expression, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): DeleteExpressionSyntax {
            return <DeleteExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): DeleteExpressionSyntax {
            return <DeleteExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withDeleteKeyword(deleteKeyword: ISyntaxToken): DeleteExpressionSyntax {
            return this.update(deleteKeyword, this.expression);
        }

        public withExpression(expression: IUnaryExpressionSyntax): DeleteExpressionSyntax {
            return this.update(this.deleteKeyword, expression);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class VoidExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        constructor(public voidKeyword: ISyntaxToken,
            public expression: IUnaryExpressionSyntax,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitVoidExpression(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.VoidExpression;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.voidKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }

        public isUnaryExpression(): boolean {
            return true;
        }

        public isExpression(): boolean {
            return true;
        }

        public update(voidKeyword: ISyntaxToken,
            expression: IUnaryExpressionSyntax): VoidExpressionSyntax {
            if (this.voidKeyword === voidKeyword && this.expression === expression) {
                return this;
            }

            return new VoidExpressionSyntax(voidKeyword, expression, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(expression: IUnaryExpressionSyntax): VoidExpressionSyntax {
            return new VoidExpressionSyntax(Syntax.token(SyntaxKind.VoidKeyword), expression, /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): VoidExpressionSyntax {
            return <VoidExpressionSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): VoidExpressionSyntax {
            return <VoidExpressionSyntax>super.withTrailingTrivia(trivia);
        }

        public withVoidKeyword(voidKeyword: ISyntaxToken): VoidExpressionSyntax {
            return this.update(voidKeyword, this.expression);
        }

        public withExpression(expression: IUnaryExpressionSyntax): VoidExpressionSyntax {
            return this.update(this.voidKeyword, expression);
        }

        public isTypeScriptSpecific(): boolean {
            if (this.expression.isTypeScriptSpecific()) { return true; }
            return false;
        }
    }

    export class DebuggerStatementSyntax extends SyntaxNode implements IStatementSyntax {
        constructor(public debuggerKeyword: ISyntaxToken,
            public semicolonToken: ISyntaxToken,
            parsedInStrictMode: boolean) {
            super(parsedInStrictMode);

            Syntax.setParentForChildren(this);
        }

        public accept(visitor: ISyntaxVisitor): any {
            return visitor.visitDebuggerStatement(this);
        }

        public kind(): SyntaxKind {
            return SyntaxKind.DebuggerStatement;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.debuggerKeyword;
                case 1: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }

        public isStatement(): boolean {
            return true;
        }

        public isModuleElement(): boolean {
            return true;
        }

        public update(debuggerKeyword: ISyntaxToken,
            semicolonToken: ISyntaxToken): DebuggerStatementSyntax {
            if (this.debuggerKeyword === debuggerKeyword && this.semicolonToken === semicolonToken) {
                return this;
            }

            return new DebuggerStatementSyntax(debuggerKeyword, semicolonToken, /*parsedInStrictMode:*/ this.parsedInStrictMode());
        }

        public static create1(): DebuggerStatementSyntax {
            return new DebuggerStatementSyntax(Syntax.token(SyntaxKind.DebuggerKeyword), Syntax.token(SyntaxKind.SemicolonToken), /*parsedInStrictMode:*/ false);
        }

        public withLeadingTrivia(trivia: ISyntaxTriviaList): DebuggerStatementSyntax {
            return <DebuggerStatementSyntax>super.withLeadingTrivia(trivia);
        }

        public withTrailingTrivia(trivia: ISyntaxTriviaList): DebuggerStatementSyntax {
            return <DebuggerStatementSyntax>super.withTrailingTrivia(trivia);
        }

        public withDebuggerKeyword(debuggerKeyword: ISyntaxToken): DebuggerStatementSyntax {
            return this.update(debuggerKeyword, this.semicolonToken);
        }

        public withSemicolonToken(semicolonToken: ISyntaxToken): DebuggerStatementSyntax {
            return this.update(this.debuggerKeyword, semicolonToken);
        }

        public isTypeScriptSpecific(): boolean {
            return false;
        }
    }
}
