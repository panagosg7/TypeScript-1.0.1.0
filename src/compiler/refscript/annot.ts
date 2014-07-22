
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

	export enum MutabilityModifiers {
		ReadOnly,
		Mutable,
		Immutable
	}


	export enum AnnotKind {
		RawMeas,		// Measure
		RawBind,		// Function / variable binder
    RawFunc,    // Anonymous function type
		RawExtern,		// External declaration
		RawType,		// Data type definition
		RawClass,		// Class annotations
		RawField,		// Field annotations
		RawMethod,   	// Method annotations
		RawConstr,		// Constructor annotations
		RawStatic,		// Static fields/methods
		RawTAlias,   	// Type alias
		RawPAlias,   	// Predicate alias
		RawQual,     	// Qualifier
		RawInvt,      	// Invariant
		RawCast			// Cast
	}

	export enum AnnotContext {
		ClassMethodContext,		    // Class method
		ClassStaticContext,		    // Class static field/method
		ClassFieldContext,		    // Class field
		ClassContructorContext,		// Class constructor
		OtherContext			    // Rest
	}

	export class RsAnnotation {

		constructor(private _sourceSpan: RsSourceSpan, private _kind: AnnotKind, private _content: string) { }

		public isGlob(): boolean { throw new Error("ABSTRACT: RsAnnotation.isGlob."); }

		/** This will create a RsAnnoation object based on user annotations */
		public static createAnnotation(s: string, ctx: AnnotContext, ss: RsSourceSpan): RsAnnotation {
			var pair = RsAnnotation.stringTag(s);
			switch (pair.fst()) {
				case AnnotKind.RawBind: {
					switch (ctx) {
						case AnnotContext.ClassMethodContext:
							return new RsBindAnnotation(ss, AnnotKind.RawMethod, pair.snd());
						case AnnotContext.ClassStaticContext:
							return new RsBindAnnotation(ss, AnnotKind.RawStatic, pair.snd());
						case AnnotContext.ClassFieldContext:
							return new RsBindAnnotation(ss, AnnotKind.RawField, pair.snd());
						case AnnotContext.ClassContructorContext:
							return new RsBindAnnotation(ss, AnnotKind.RawConstr, pair.snd());
						case AnnotContext.OtherContext:
							return new RsBindAnnotation(ss, pair.fst(), pair.snd());
						default:
							throw new Error("BUG: there is no default context");
					}
				}
				case AnnotKind.RawClass:
					return new RsExplicitNamedTypeAnnotation(ss, pair.snd());
				default:
					return new RsGlobalAnnotation(ss, pair.fst(), pair.snd()); 
			}
		} 

		public sourceSpan(): RsSourceSpan {
			return this._sourceSpan;
		}

		public content(): string {
			return this._content;
		}

		public kind(): AnnotKind {
			return this._kind;
		}

		public toObject(): any {
			var obj: any = {};
			obj[AnnotKind[this.kind()]] = [this.sourceSpan().toObject(), this.content()];
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
				case "cast": return AnnotKind.RawCast;
				case "extern": return AnnotKind.RawExtern;
				case "<anonymous>": return AnnotKind.RawFunc;
				default: return AnnotKind.RawBind;
			}
		}
	}

	export class RsBindAnnotation extends RsAnnotation {

		constructor(sourceSpan: RsSourceSpan, kind: AnnotKind, content: string) {
			super(sourceSpan, kind, content);
		}

		/** Returns true if this is a global annotation (can float to top-level). 
			Compared to function / variable binders that need to be local to 
			particular AST nodes. */
		public isGlob(): boolean {	return true; }

		private _binderName: string = null;

		public binderName(): string {
			if (this._binderName) return this._binderName;
			var content = this.content();
			// variable annotation
			var bs = content.split("::");
			if (bs && bs.length > 1) {
				var lhss = bs[0].split(" ").filter(s => s.length > 0);
				if (lhss && lhss.length === 1) {
					this._binderName = lhss[0];
					return this._binderName;
				}
				//// The first argument may be a mutability modifier.
				//if (lhss && lhss.length === 2) {
				//  this._binderName = lhss[1];
				//  return this._binderName;
				//}
			}
			// field annotation
			bs = content.split(":");
			if (bs && bs.length > 1) {
				var lhss = bs[0].split(" ").filter(s => s.length > 0);
				if (lhss && lhss.length === 1) {
					this._binderName = lhss[0];
					return this._binderName;
				}
				// The first argument may be the static modifier.
				if (lhss && lhss.length === 2) {
				  this._binderName = lhss[1];
				  return this._binderName;
				}
			}

			console.log("Invalid RefScript annotation: " + content);
			console.log("Perhaps you need to replace ':' with '::'.");
			process.exit(1);
		}

		public content(): string {
			return super.content();
		}
	}

	export class RsClassAnnotation extends RsAnnotation { }
	

	/** A class annotation that is inferred bassed on TypeScript information. */
	export class RsInferredClassAnnotation extends RsClassAnnotation {

		constructor(
			sourceSpan: RsSourceSpan,
			private _className: ISyntaxToken,
			private _typeParams: string[],
			private _extends: Serializable,
			private _implements: Serializable[]) {
			super(sourceSpan, AnnotKind.RawClass, RsInferredClassAnnotation.toString(_className, _typeParams, _extends, _implements));
		}


		/** This is not a global annotation (cannot float to top-level). 
			Needs to stick around a class declaration. */
		public isGlob(): boolean { return false; }

		private static toString(_className: ISyntaxToken, _typeParams: string[], _extends: Serializable, _implements: Serializable[]): string {
			var r = "";
			r += "class ";
			r += _className.text();
			if (_typeParams && _typeParams.length > 0) {
				r += " <";
				r += _typeParams.join(", ");
				r += ">";
			}
			if (_extends) {
				r += " extends ";
				r += _extends.toString();
			}
			if (_implements && _implements.length > 0) {
				r += " implements ";
				r += _implements.map(t => t.toString()).join(", ");
			}
			return r;
		}
	}

	/** A class annotation that is provided by the user */
	export class RsExplicitNamedTypeAnnotation extends RsClassAnnotation {
		/** This is not a global annotation (cannot float to top-level). 
			Needs to stick around a class declaration. */
		public isGlob(): boolean { return false; }

		constructor(sourceSpan: RsSourceSpan, content: string) {
			super(sourceSpan, AnnotKind.RawClass, content);
		}

		public content(): string {
			return "class " + super.content();
		}
	}


	export class RsGlobalAnnotation extends RsAnnotation {
		public isGlob(): boolean { return true; }

		constructor(sourceSpan: RsSourceSpan, kind: AnnotKind, content: string) {
			super(sourceSpan, kind, content);
		}

	}

}
