const sword=require("../sword.js")
///////////////
//Monster move right
//Monster touch stone
//Monster move down
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

const map=new sword.GameMap(world);

const monster=map.e(Monster);


monster.setPosition(100,100);

monster.setVelocity(10,0);	//Move right at 10 a second

const grass=map.e(Monster);

grass.setPosition(150,100);

monster.on("collide",(collision)=>{
	console.log("Walking through grass")
})