# Sword
Example Game made at [here](http://multiplayerdungeon-env.eba-sdwfkmve.us-east-1.elasticbeanstalk.com/)

![npm version](https://img.shields.io/npm/v/swordengine)
![Statements](https://img.shields.io/badge/statements-74.24%25-red.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-61.29%25-red.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-70%25-red.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-74.24%25-red.svg?style=flat)

## How to install
npm install swordengine

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

