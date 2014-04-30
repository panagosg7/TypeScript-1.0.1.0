
///<reference path='..\typescript.ts' />

module TypeScript {

	export class Pair<A, B> {
		constructor(private _fst: A, private _snd: B) { }

		public fst(): A { return this._fst; }

		public snd(): B { return this._snd;	}
	}

	export class Triple<A, B, C> {
		constructor(private _fst: A, private _snd: B, private _thd: C) { }

		public fst(): A { return this._fst; }

		public snd(): B { return this._snd;	}

		public thd(): C { return this._thd;	}
	}



	export enum AnnotKind {
		RawMeas,		// Measure
		RawBind,		// Function / variable binder
		RawExtern,		// External declaration
		RawType,		// Data type definition
		RawClass,		// Class annotations
		RawField,		// Field annotations
		RawMethod,   	// Method annotations
		RawConstr,		// Method annotations
		RawTAlias,   	// Type alias
		RawPAlias,   	// Predicate alias
		RawQual,     	// Qualifier
		RawInvt      	// Invariant
	}

	export enum AnnotContext {
		ClassMethodContext,		// Class method
		ClassFieldContext,		// Class field
		ClassContructorContext,	// Class constructor
		OtherContext			// Rest
	}

	export class RsAnnotation {
		public isGlob(): boolean { throw new Error("ABSTRACT: RsAnnotation.isGlob."); }

		/** This will create a RsAnnoation object based on user annotations */
		public static createAnnotation(s: string, ctx: AnnotContext): RsAnnotation {
			var pair = RsAnnotation.stringTag(s);
			switch (pair.fst()) {
				case AnnotKind.RawBind: {
					switch (ctx) {
						case AnnotContext.ClassMethodContext:
							return new RsBindAnnotation(AnnotKind.RawMethod, pair.snd());
						case AnnotContext.ClassFieldContext:
							return new RsBindAnnotation(AnnotKind.RawField, pair.snd());
						case AnnotContext.ClassContructorContext:
							return new RsBindAnnotation(AnnotKind.RawConstr, pair.snd());
						case AnnotContext.OtherContext:
							return new RsBindAnnotation(pair.fst(), pair.snd());
						default:
							throw new Error("BUG: there is no default context");
					}
				}
				case AnnotKind.RawClass:
					return new RsExplicitNamedTypeAnnotation(pair.snd());
				default:
					return new RsGlobalAnnotation(pair.fst(), pair.snd()); 
			}
		} 

		//These would have been protected ...
		public _tag: AnnotKind;
		public _content: string;

		constructor(tag: AnnotKind) { this._tag = tag; }

		public getContent(): string { throw new Error("ABSTRACT: RsAnnotation.getContent"); }

		public kind(): AnnotKind { return this._tag;	}

		public toObject(): any {
			var obj: any = {};
			obj[AnnotKind[this._tag]] = this.getContent();
			return obj;
		}

		private static stringTag(s: string): Pair<AnnotKind, string> {
			var tokens = RsAnnotation.stringTokens(s);
			if (tokens && tokens.length > 0) {
				var kind = RsAnnotation.toSpecKind(tokens[0]);
				if (kind === AnnotKind.RawBind) {
					return new Pair(AnnotKind.RawBind, tokens.join(" "));
				}
				else {
					return new Pair(RsAnnotation.toSpecKind(tokens[0]), tokens.slice(1).join(" "));
				}
			}
			throw new Error("RsAnnotation could not parse string tag: " + s);
		}

		/** @stringTokens return an array of string containing \the tokens of the input string */
		private static stringTokens(s: string): string[] {
			return s.split(" ").filter(s => s.length > 0);
		}

		private static toSpecKind(s: string): AnnotKind {
			switch (s) {
				case "measure": return AnnotKind.RawMeas;
				case "qualif": return AnnotKind.RawQual;
				case "interface": return AnnotKind.RawType;
				case "alias": return AnnotKind.RawTAlias;
				case "class": return AnnotKind.RawClass;
				case "predicate": return AnnotKind.RawPAlias;
				case "invariant": return AnnotKind.RawInvt;
				case "extern": return AnnotKind.RawExtern;
				default: return AnnotKind.RawBind;
			}
		}
	}

	export class RsBindAnnotation extends RsAnnotation {
		/** Returns true if this is a global annotation (can float to top-level). 
			Compared to function / variable binders that need to be local to 
			particular AST nodes. */
		public isGlob(): boolean {	return true; }

		private _binderName: string = null;

		public getBinderName(): string {
			if (this._binderName) return this._binderName;
			var content = this.getContent();
			var bs = content.split("::");
			if (bs && bs.length == 2) {
				var lhss = bs[0].split(" ").filter(s => s.length > 0);
				if (lhss && lhss.length == 1) {
					this._binderName = lhss[0];
					return this._binderName;
				}
			}
			console.log("Invalid nano-js annotation: " + content);
			console.log("Perhaps you need to replace ':' with '::'.");
			process.exit(1);
		}

		//constructor(t: AnnotKind, s: string) {
		constructor(tag: AnnotKind, content: string) {
			super(tag);
			this._content = content;
		}

		public getContent(): string { return this._content;	}
	}

	export class RsClassAnnotation extends RsAnnotation { }
	

	/** A class annotation that is inferred bassed on TypeScript information. */
	export class RsInferredClassAnnotation extends RsClassAnnotation {
		/** This is not a global annotation (cannot float to top-level). 
			Needs to stick around a class declaration. */
		public isGlob(): boolean { return false; }

		private toString(): string {
			var r = "";
			r += "class ";
			r += this._className.text();
			if (this._typeParams && this._typeParams.length > 0) {
				r += " <";
				r += this._typeParams.map(t => t.identifier.text()).join(", ");
				r += ">";
			}
			if (this._extends) {
				r += " extends ";
				r += this._extends.toString();
			}
			if (this._implements && this._implements.length > 0) {
				r += " implements ";
				r += this._implements.map(t => t.toString()).join(", ");
			}
			return r;
		}

		public toObject() {
			var obj: any = {};
			obj[AnnotKind[this._tag]] = this.toString();
			return obj;		
		}

		constructor(private _className: ISyntaxToken,
					private _typeParams: TypeParameterSyntax[],
					private _extends: Serializable,
					private _implements: Serializable[]) { super(AnnotKind.RawClass); }

		public getContent(): string {
			if (!this._content) {
				this._content = this.toString();
			}
			return this._content;
		}
	}

	/** A class annotation that is provided by the user */
	export class RsExplicitNamedTypeAnnotation extends RsClassAnnotation {
		/** This is not a global annotation (cannot float to top-level). 
			Needs to stick around a class declaration. */
		public isGlob(): boolean { return false; }

		constructor(content: string) {
			super(AnnotKind.RawClass);
			this._content = content;
		}

		public getContent(): string { return "class " + this._content; }
	}


	export class RsGlobalAnnotation extends RsAnnotation {
		public isGlob(): boolean { return true; }

		constructor(tag: AnnotKind, content: string) {
			super(tag);
			this._content = content;
		}

		public getContent(): string { return this._content;	}
	}

}
