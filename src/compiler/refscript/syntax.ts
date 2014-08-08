///<reference path='..\typescript.ts' />

module TypeScript {

	export class RsAST {
		public toObject(): any {
			throw new Error("RsAST: child class should implement toObject");
		}
	}

	export class RsAnnotatedAST extends RsAST {
		constructor(public ann: RsAnnotation[]) { super(); }

		public mapAnn<T>(f: (a:RsAnnotation) => T): T[] {
			return this.ann.filter(a => a !== null).map(f);
		}
	}

	export class RsSourceSpan {
		public toObject(): any {
			return {
			//Doing the line and col fix here.
				"sp_begin": [this.file, this.start.line() + 1, this.start.character() + 1],
				"sp_end"  : [this.file, this.stop.line() + 1, this.stop.character() + 1]
			};
		}

		public toString(): string {
			return this.file + ": (" + (this.start.line() + 1) + ", " + (this.start.character() + 1) +
				") - (" + (this.stop.line() + 1) + ", " + (this.stop.character() + 1) + ")";
		}

		constructor(private file: string, private start: LineAndCharacter, private stop: LineAndCharacter) { }
	}


	/* ****************************************************************************
	 *
	 *				AST Misc
	 * 
	 * ****************************************************************************/

	export class RsASTList<T extends RsAST> extends RsAST {
		constructor(public members: T[]) { super(); }

		public toObject(): any { return this.members.map(m => m.toObject()); }
	}

	export class RsId extends RsAnnotatedAST {
		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public id: string) { super(ann); }

		public toObject(): any {
			return [[this.span.toObject(), this.mapAnn(a => a.toObject())],
				this.id];
		}
	}

    // Includes normal and ambient declarations
    export interface IRsVarDeclLike {
        toObject(): any;
        span: RsSourceSpan;
        ann: RsAnnotation[];
    } 

	export class RsVarDecl extends RsAnnotatedAST implements IRsVarDeclLike {
		public toObject(): any {
			return [
				[this.span.toObject(), this.mapAnn(a => a.toObject())],
				this.name.toObject(),
				(this.exp) ? this.exp.toObject() : null
			];
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public name: RsId,
			public exp?: RsExpression) { super(ann); }
	}

	export class RsPropId extends RsAnnotatedAST {
		public toObject(): any {
			return {
				PropId: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.f.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public f: RsId) { super(ann); }
	}

	export class RsPropString extends RsAnnotatedAST {
		public toObject(): any {
			return {
				PropString: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.s]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public s: string) { super(ann); }
	}

	export class RsPropNum extends RsAnnotatedAST {
		public toObject(): any {
			return {
				PropNum: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.n]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public n: number) { super(ann); }
	}

	/* ****************************************************************************
	 *
	 *				ForInit
	 * 
	 * ****************************************************************************/


	export class RsForInit extends RsAnnotatedAST { }

	export class RsNoInit extends RsForInit {
		public toObject(): any {
			return { NoInit: [this.span.toObject(), this.mapAnn(a => a.toObject())] };
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) { super(ann); }
	}

	export class RsVarInit extends RsForInit {
		public toObject(): any { return { VarInit: this.vds.toObject() }; }

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public vds: RsASTList<RsVarDecl>) { super(ann); }
	}

	export class RsExprInit extends RsForInit {
		public toObject(): any {
			return {
				ExprInit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.exp.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public exp: RsExpression) {	super(ann); }
	}


	/* ****************************************************************************
	 *
	 *				ForInInit
	 * 
	 * ****************************************************************************/


	export class RsForInInit extends RsAST { }

	export class RsForInVar extends RsForInInit {
		public toObject(): any {
			return { ForInVar: this.id.toObject() };
		}

		constructor(private id: RsId) { super(); }
	}

	export class RsForInLVal extends RsForInInit {
		public toObject(): any {
			return { ForInLVal: this.lval.toObject() };
		}

		constructor(public lval: RsLValue) { super(); }
	}


	/* ****************************************************************************
	 *
	 *				Operators
	 * 
	 * ****************************************************************************/

	export enum RsInfixOpKind {
		OpLT
		, OpLEq
		, OpGT
		, OpGEq
		, OpIn
		, OpInstanceof
		, OpEq
		, OpNEq
		, OpStrictEq
		, OpStrictNEq
		, OpLAnd
		, OpLOr
		, OpMul
		, OpDiv
		, OpMod
		, OpSub
		, OpLShift
		, OpSpRShift
		, OpZfRShift
		, OpBAnd
		, OpBXor
		, OpBOr
		, OpAdd			
	}

	export class RsInfixOp extends RsAST {
		private _opKind: RsInfixOpKind;

		private signToOpKind(): RsInfixOpKind {
			switch (this.sign) {
				case "<": return RsInfixOpKind.OpLT;
				case "<=": return RsInfixOpKind.OpLEq;
				case ">": return RsInfixOpKind.OpGT;
				case ">=": return RsInfixOpKind.OpGEq;
				case "in": return RsInfixOpKind.OpIn;
				case "instanceof": return RsInfixOpKind.OpInstanceof;
				case "==": return RsInfixOpKind.OpEq;
				case "!=": return RsInfixOpKind.OpNEq;
				case "===": return RsInfixOpKind.OpStrictEq;
				case "!==": return RsInfixOpKind.OpStrictNEq;
				case "&&": return RsInfixOpKind.OpLAnd;
				case "||": return RsInfixOpKind.OpLOr;
				case "*": return RsInfixOpKind.OpMul;
				case "/": return RsInfixOpKind.OpDiv;
				case "%": return RsInfixOpKind.OpMod;
				case "-": return RsInfixOpKind.OpSub;
				case "<<": return RsInfixOpKind.OpLShift;
				case ">>": return RsInfixOpKind.OpSpRShift;
				case ">>>": return RsInfixOpKind.OpZfRShift;
				case "&": return RsInfixOpKind.OpBAnd;
				case "^": return RsInfixOpKind.OpBXor;
				case "|": return RsInfixOpKind.OpBOr;
				case "+": return RsInfixOpKind.OpAdd;
			}
			throw new Error("Case: " + this.sign + " not handled in RsInfixOp.signToOpKind");
		}

		public toObject() {
			var obj: any = {};
			obj[RsInfixOpKind[this.signToOpKind()]] = [];
			return obj;
		}

		constructor(public sign: string) {
			super();
			this._opKind = this.signToOpKind();
		}
	}


	export enum RsAssignOpKind {
		OpAssign,
		OpAssignAdd
	}

	export class RsAssignOp extends RsAST {
		private _opKind: RsAssignOpKind;

		private signToOpKind(): RsAssignOpKind {
			switch (this.sign) {
				case "=": return RsAssignOpKind.OpAssign;
				case "+=": return RsAssignOpKind.OpAssignAdd;
			}
			throw new Error("Case: " + this.sign + " not handled in RsAssignOp.signToOpKind");
		}

		public toObject() {
			var obj: any = {};
			obj[RsAssignOpKind[this.signToOpKind()]] = [];
			return obj;
		}

		constructor(public sign: string) {
			super();
			this._opKind = this.signToOpKind();
		}
	}

	export enum RsUnaryAssignOpKind {
		PrefixInc,
		PrefixDec,
		PostfixInc,
		PostfixDec
	}

	export class RsUnaryAssignOp extends RsAST {

		public toObject() {
			var op: any = {};
			op[RsUnaryAssignOpKind[this.opKind]] = [];
			return op;
		}

		constructor(public opKind: RsUnaryAssignOpKind) {
			super();
		}
	}

	export enum RsPrefixOpKind {
		PrefixLNot,
		PrefixBNot,
		PrefixPlus,
		PrefixMinus,
		PrefixTypeof,
		PrefixVoid,
		PrefixDelete
	}
	
	export class RsPrefixOp extends RsAST {
		public toObject() {
			var op: any = {};
			op[RsPrefixOpKind[this.opKind]] = [];
			return op;
		}

		constructor(public opKind: RsPrefixOpKind) { super(); }
	}




	/* ****************************************************************************
	 *
	 *				LValue
	 * 
	 * ****************************************************************************/

	export class RsLValue extends RsAnnotatedAST { }

	export class RsLVar extends RsLValue {
		public toObject(): any {
			return {
				LVar: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.s]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public s: string) { super(ann); }
	}


	export class RsLDot extends RsLValue {
		public toObject(): any {
			return {
				LDot: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.exp.toObject(),
					this.str]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public exp: RsExpression,
			public str: string) { super(ann); }
	}


	export class RsLBracket extends RsLValue {
		public toObject(): any {
			return {
				LBracket: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.e1.toObject(),
					this.e2.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public e1: RsExpression,
			public e2: RsExpression) { super(ann); }
	}



	/* ****************************************************************************
	 *
	 *				Expression
	 * 
	 * ****************************************************************************/

	export class RsExpression extends RsAnnotatedAST {	}

	export class RsInfixExpr extends RsExpression {
		public toObject() {
			return {
				InfixExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.op.toObject(),
					this.operand1.toObject(),
					this.operand2.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public op: RsInfixOp,
					public operand1: RsExpression,
					public operand2: RsExpression) { super(ann); }
	}

	export class RsCondExpr extends RsExpression {
		public toObject() {
			return {
				CondExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.cond.toObject(),
					this.exp1.toObject(),
					this.exp2.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public cond: RsExpression,
					public exp1: RsExpression,
					public exp2: RsExpression) { super(ann); }
	}

	export class RsNumLit extends RsExpression {
		public toObject() {
			return {
				NumLit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.num]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public num: number) { super(ann); }
	}

	export class RsIntLit extends RsExpression {
		public toObject() {
			return {
				IntLit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.num]
			};
		}

		constructor(public span: RsSourceSpan,
        			public ann: RsAnnotation[],
		        	public num: number) { super(ann); }
	}



	export class RsStringLit extends RsExpression {
		public toObject() {
			//Quotes fix
			var l = this.str.length;
			var newStr = this.str;
			if (l > 1 && (newStr[0] === '\"' && newStr[l - 1] === '\"' ||
				newStr[0] === '\'' && newStr[l - 1] === '\'')) {
				newStr = newStr.substring(1, l - 1);
			}
			return { StringLit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],newStr] };
		}

		constructor(public span: RsSourceSpan,
        			public ann: RsAnnotation[],
		        	public str: string) { super(ann); }
	}
	
	export class RsFuncExpr extends RsExpression {
		public toObject() {
			return { FuncExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
				(this.id) ? this.id.toObject() : null,
				this.args.toObject(),
				this.body.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public id: RsId,		// could be null
			public args: RsASTList<RsId>,
			public body: RsASTList<RsStatement>) { super(ann); }
	}

	export class RsVarRef extends RsExpression {
		public toObject() {
			return {
				VarRef: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.id.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public id: RsId) { super(ann); }
	}

	export class RsDotRef extends RsExpression {
		public toObject() {
			return {
				DotRef: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.expression.toObject(), this.id.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public expression: RsExpression,
					public id: RsId) { super(ann); }
	}

	export class RsBracketRef extends RsExpression {
		public toObject() {
			return {
				BracketRef: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.e1.toObject(), this.e2.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public e1: RsExpression,
					public e2: RsExpression) { super(ann); }
	}

	export class RsCallExpr extends RsExpression {
		public toObject() {
			return {
				CallExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.target.toObject(),	this.args.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public target: RsExpression,
					public args: RsASTList<RsExpression>) { super(ann); }
	}

	export class RsObjectLit extends RsExpression {
		public toObject() {
			return {
				ObjectLit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.bindings.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public bindings: RsASTList<RsAST>) { super(ann); }
	}


	export class RsAssignExpr extends RsExpression {

		public toObject() {
			return {
				AssignExpr: [
					[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.assignOp.toObject(),
					this.lval.toObject(),
					this.expression.toObject()
				]
			};
		}
		
		constructor(public span: RsSourceSpan, public ann: RsAnnotation[], public assignOp: RsAssignOp, public lval: RsLValue, public expression: RsExpression) {
			super(ann);
		}
	}

	export class RsThisRef extends RsExpression {

		public toObject() {
			return {
				ThisRef: [this.span.toObject(), this.mapAnn(a => a.toObject())]
			};
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) {
			super(ann);
		}
		
	}

	export class RsSuperRef extends RsExpression {

		public toObject() {
			return {
				SuperRef: [this.span.toObject(), this.mapAnn(a => a.toObject())]
			};
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) {
			super(ann);
		}
		
	}

	export class RsNullLit extends RsExpression {

		public toObject() {
			return {
				NullLit: [this.span.toObject(), this.mapAnn(a => a.toObject())]
			};
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) {
			super(ann);
		}
		
	}

	export class RsBoolLit extends RsExpression {

		public toObject() {
			return {
				BoolLit: [
					[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.b
				]
			};
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[], public b: boolean) {
			super(ann);
		}

	}

	export class RsNewExpr extends RsExpression {
		public toObject() {
			return {
				NewExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.e.toObject(), this.es.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public e: RsExpression,
					public es: RsASTList<RsExpression>) { super(ann); }
	}

    export class RsUnaryAssignExpr extends RsExpression {
		public toObject() {
			return {
				UnaryAssignExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.op.toObject(),	this.lval.toObject() ]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public op: RsUnaryAssignOp,
					public lval: RsLValue) { super(ann); }
	}

	export class RsPrefixExpr extends RsExpression {
		public toObject() {
			return {
				PrefixExpr: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.op.toObject(),	this.exp.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public op: RsPrefixOp,
					public exp: RsExpression) { super(ann); }
	}

	export class RsArrayLit extends RsExpression {
		public toObject() {
			return {
				ArrayLit: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.members.toObject() ]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public members: RsASTList<RsExpression>) { super(ann); }
	}

	export class RsCast extends RsExpression {
		public toObject() {
			return {
				Cast: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.expression.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public expression: RsExpression) { super(ann); }
	}





	/* ****************************************************************************
	 *
	 *				Class Element
	 * 
	 * ****************************************************************************/

	export class RsClassElt extends RsAnnotatedAST {
		public toObject(): any {
			throw new Error("RsClassElt: child class should implement toJSON");
		}
	}

	export class RsConstructor extends RsClassElt {
		public toObject(): any {
			return {
				Constructor: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					(this.args) ? this.args.toObject() : null, this.body.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public /*Maybe*/ args: RsASTList<RsId>,
					public body: RsASTList<RsStatement>) { super(ann); }
	}

	export class RsMemberVarDecl extends RsClassElt {
		public toObject(): any {
			return {
				MemberVarDecl: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.sta,this.vardecl.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public sta: boolean,
					public vardecl: IRsVarDeclLike) { super(ann); }
	}

	export class RsMemberMethDecl extends RsClassElt {
		public toObject(): any {
			return {
				MemberMethDecl: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.sta, this.name.toObject(),	this.args.toObject(), this.body.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public sta: boolean,
					public name: RsId,
					public args: RsASTList<RsId>,
					public body: RsASTList<RsStatement>) { super(ann); }
	}



	/* ****************************************************************************
	 *
	 *				Statement
	 * 
	 * ****************************************************************************/

	export class RsStatement extends RsAnnotatedAST {
		public toObject(): any {
			throw new Error("RsStatement: child class should implement toJSON");
		}
	}

	export class RsEmptyStmt extends RsStatement implements IRsVarDeclLike {
		public toObject(): any {
			return { EmptyStmt: [this.span.toObject(), this.mapAnn(a => a.toObject())] };
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) {
			super(ann);
		}
	}

	export class RsExprStmt extends RsStatement {
		public toObject(): any {
			return {
				ExprStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.exp.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public exp: RsExpression) { super(ann); }
	}

	export class RsVarDeclStmt extends RsStatement {
		public toObject(): any {
			return {
				VarDeclStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.varDecls.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],	
					public varDecls: RsASTList<RsVarDecl>) { super(ann); }
	}

	export class RsFunctionStmt extends RsStatement {
		public toObject() {
			return {
				FunctionStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.id.toObject(), this.args.toObject(), this.body.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public id: RsId,
					public args: RsASTList<RsId>,
					public body: RsASTList<RsStatement>) { super(ann); }
	}

	export class RsFunctionDecl extends RsStatement {
		public toObject() {
			return {
				FunctionDecl: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.id.toObject(), this.args.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public id: RsId,
					public args: RsASTList<RsId>) { super(ann); }
	}

	export class RsReturnStmt extends RsStatement {
		public toObject() {
			return {
				ReturnStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					(this.expression) ? this.expression.toObject() : null]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public expression: RsExpression) {  super(ann);	}
	}

	export class RsBlockStmt extends RsStatement {
		public toObject() {
			return {
				BlockStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.body.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public body: RsASTList<RsStatement>) { super(ann); }
	}

	export class RsClassStmt extends RsStatement {

		public toObject() {
			return {
				ClassStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.id.toObject(),
					(this.extendsClass) ? this.extendsClass.toObject() : null,
					this.implementsInterfaces.toObject(),
					this.body.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
			public ann: RsAnnotation[],
			public id: RsId,
			public extendsClass/* Maybe */: RsId,
			public implementsInterfaces: RsASTList<RsId>,
			public body: RsASTList<RsClassElt>) { super(ann); }
	}

	export class RsWhileStmt extends RsStatement {
		public toObject() {
			return {
				WhileStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.exp.toObject(),this.body.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public exp: RsExpression,
					public body: RsStatement) { super(ann); }
	}

	export class RsForInStmt extends RsStatement {
		public toObject() {
			return {
                ForInStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
                    this.init.toObject(),
					this.exp.toObject(),
					this.body.toObject()]
			};
		}

        constructor(    public span: RsSourceSpan,
                        public ann : RsAnnotation[],
                        public init: RsForInInit,
						public exp : RsExpression,
                        public body: RsStatement) {	super(ann);	}
	}

	export class RsForStmt extends RsStatement {
		public toObject() {
			return {
                ForStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
                    (this.init) ? this.init.toObject() : null,
					(this.test) ? this.test.toObject() : null,
					this.inc.toObject(),
					this.body.toObject()]
			};
		}

        constructor(    public span: RsSourceSpan,
                        public ann : RsAnnotation[],
                        public init: RsForInit,
              /*Maybe*/ public test: RsExpression,
              /*Maybe*/ public inc : RsExpression,
                        public body: RsStatement) {	super(ann);	}
	}

	export class RsIfStmt extends RsStatement {
		public toObject() {
			return {
				IfStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.cond.toObject(), this.s1.toObject(), this.s2.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public cond: RsExpression,
					public s1: RsStatement,
					public s2: RsStatement) { super(ann); }
	}

	export class RsIfSingleStmt extends RsStatement {
		public toObject() {
			return {
				IfSingleStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.cond.toObject(), this.s.toObject()]
			};
		}

		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public cond: RsExpression,
					public s: RsStatement) { super(ann); }
	}

	export class RsThrowStatement extends RsStatement {
		public toObject() {
			return {
				ThrowStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.expression.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public expression: RsExpression) {  super(ann);	}
	}

	export class RsModuleStmt extends RsStatement {
		public toObject() {
			return {
				ModuleStmt: [[this.span.toObject(), this.mapAnn(a => a.toObject())],
					this.body.toObject()]
			};
		}
		
		constructor(public span: RsSourceSpan,
					public ann: RsAnnotation[],
					public name: RsId,
					public body: RsASTList<RsModuleElt>) { super(ann);	}
	}

	export class RsIfaceStmt extends RsStatement implements IRsVarDeclLike {
		public toObject(): any {
			return { IfaceStmt: [this.span.toObject(), this.mapAnn(a => a.toObject())] };
		}

		constructor(public span: RsSourceSpan, public ann: RsAnnotation[]) {
			super(ann);
		}
	}



	/* ****************************************************************************
	 *
	 *				Module Element
	 * 
	 * ****************************************************************************/

	export class RsModuleElt extends RsAST {
		public toObject() {
			return { ModuleElt: [this.exported, this.body.toObject()] };
		}
		
		constructor(public exported: boolean,
					public body: RsStatement) {  super(); }
	}





}
