var sword=require("../sword.js")
///////////////
//Monster move right
//Monster touch stone
//Monster move down
var world=new sword();

//Create a monster
sword.monster=function(){
	//Add Component
	this.addComponent("2D,solid,collision")
	this.box(10,10)
}

var monster=world.e("monster")
var stone=world.e("2D,solid,randomStone")
stone.box(10,10)

monster.setLocation(100,100)
stone.setLocation(150,100)

monster.moveTo(1,0,10)	//Move right at 10 a second

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