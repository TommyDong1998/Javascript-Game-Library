# Sword
Example Game made at [here](http://multiplayerdungeon-env.eba-sdwfkmve.us-east-1.elasticbeanstalk.com/)

## To Do
Make bounding box better for rotation

## Example
Look at the example folder

```
var sword=require("sword")
///////////////
//Monster move right
//Monster touch stone
//Monster move down
var world=new sword();

//Create a monster
class Monster extends sword.Entity{
	constructor(){
		super();
		world.emit('velocity', this);
		world.emit('collision', this);
	}
}

var map=new sword.GameMap();

var monster=map.e(Monster);

monster.setPosition(100,100);

monster.setVelocity(10,0);	//Move right at 10 a second

var prev={};
monster.on("NextFrame",()=>{
	if(prev.x!=monster.left().x||prev.y!=monster.left().y){
		console.log("Monster:",monster.left())
		prev=monster.left()
	}
})

monster.on("collide",(collision)=>{
	console.log("Collided",collision)
})
```
