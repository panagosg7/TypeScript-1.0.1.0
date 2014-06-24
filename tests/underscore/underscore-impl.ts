///<reference path='.\underscore.d.ts' />

module _Implementation {

	var breaker = {};

	// Internal function: creates a callback bound to its context if supplied
	var createCallback =
		function (func: (x: any, y?: any, z?: any) => any, context: any, argCount?: any): (x: any, y?: any, z?: any, w?: any) => any {
			if (context === void 0) return func;
			switch (argCount == null ? 3 : argCount) {
				case 1: return function (value) {
					return func.call(context, value);
				};
				case 2: return function (value, other) {
					return func.call(context, value, other);
				};
				case 3: return function (value, index, collection) {
					return func.call(context, value, index, collection);
				};
				case 4: return function (accumulator, value, index, collection) {
					return func.call(context, accumulator, value, index, collection);
				};
			}
			return function () {
				return func.apply(context, arguments);
			};
		};

	//GOAL
	class Underscore implements IUnderscoreStatic {

		public each<T>(list: _.List<T>, iterator: _.ListIterator<T, void>, context?: any): _.List<T>;
		public each<T>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, void>, context?: any): _.Dictionary<T>;

		public each<T>(obj: any, iterator: any, context?: any): any {

			var i, length;
			if (obj == null) return obj;
			iterator = createCallback(iterator, context);
			if (obj.length === +obj.length) {
				for (i = 0, length = obj.length; i < length; i++) {
					if (iterator(obj[i], i, obj) === breaker) break;
				}
			} else {
				var keys = _.keys(obj);
				for (i = 0, length = keys.length; i < length; i++) {
					if (iterator(obj[keys[i]], keys[i], obj) === breaker) break;
				}
			}
			return obj;
		}

		public forEach<T>(obj: _.List<T>, iterator: _.ListIterator<T, any>, context?: any): _.List<T> {
			// public forEach<T>(obj: _.Dictionary<T>, iterator: _.ObjectIterator<T, void>, context?: any): _.Dictionary<T>;

			//// This is the signature used for typechecking this method:
			//public forEach<T>(obj: any, iterator: any, context?: any): any {

			var i: number, length: number;
			if (obj == null) return obj;
			iterator = createCallback(iterator, context);
			if (obj.length === +obj.length) {
				for (i = 0, length = obj.length; i < length; i++) {
					if (iterator(obj[i], i, obj) === breaker) break;
				}
			} else {
				var keys = _.keys(obj);
				for (i = 0, length = keys.length; i < length; i++) {
					if (iterator(obj[keys[i]], keys[i], obj) === breaker) break;
				}
			}
			return obj;
		}




		public static lastIndexOf<T>(array: _.List<T>, T, from?: number): number {
			if (array == null) return -1;
			var i = from == null ? array.length : from;
			while (i--) if (array[i] === item) return i;
			return -1;
		}



		// Carry on with the rest of the methods that are missing:
		// map, collect, ... 
		// Until tsc does not complain any more about missing methods.

	}

}
