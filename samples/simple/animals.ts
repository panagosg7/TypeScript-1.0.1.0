class Animal {
	constructor(public name) {
		this.name = name;
		//this.move(<any>this.name);
	}

    move(meters) {
        alert(this.name + " moved " + meters + "m.");
    }
}

class Snake extends Animal {
    move() {
        alert("Slithering...");
        super.move(5);
    }
}

class Horse extends Animal {
    move() {
        alert("Galloping...");
        super.move(45);
    }
}

var sam = new Snake("Sammy the Python")
var tom: Animal = new Horse("Tommy the Palomino")

sam.move()
tom.move(34)
