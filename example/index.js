var sword=require("../sword.js")
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

var monster=new Monster();

monster.setPosition(100,100);

monster.velocityToward(10,)	//Move right at 10 a second

var prev={};
monster.on("NextFrame",()=>{
	if(prev.x!=monster.left().x||prev.y!=monster.left().y){
		console.log("Monster:",monster.left())
		prev=monster.left()
	}
})
monster.onCollide("randomStone",()=>{
	console.log("Touching a stone")
	setTimeout(()=>{
		monster.moveTo(0,1,10)
	},1000);
})