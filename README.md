# Javascript Game Library
Example Game made at [here](https://usurpthenight.com)

Test Coverage

![Statements](https://img.shields.io/badge/statements-91.45%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-71.21%25-red.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-87.5%25-yellow.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-91.45%25-brightgreen.svg?style=flat)


## How to install
npm install swordengine

![npm version](https://img.shields.io/npm/v/swordengine)

## Example
Look at the example folder

```
const sword=require("../sword.js")
const world=new sword();

//Create a monster
class Monster extends sword.Entity{
	constructor(){
		super();
		world.emit('velocity', this);
		world.emit('collision', this);
		this.size(1,1)
	}
}

const map=new sword.GameMap();

const monster=map.e(Monster);


monster.setPosition(100,100);

monster.setVelocity(10,0);	//Move right at 10 a second

const grass=map.e(Monster);

grass.setPosition(150,100);

monster.on("collide",(collision)=>{
	console.log("Walking through grass")
})
```

## Class Entity

velocityTimeout(obj,amt,ms)

velocityToward(obj, amt)

setVelocity(x,y)

setPosition(x,y)

box(w, h)

circle(rad)

size(w, h)

setOrigin(x, y)

rotate(rad)

extend(type)

collideWith()

attach(obj)

## Class GameMap
e(entity, ...args)

insert(object)

update(object)

update(object)

findNear(object, distance, cb)

destroy(object)

