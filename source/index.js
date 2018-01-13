var concert= require("eventemitter3");
var gameloop=require("node-gameloop");
var sat= require("sat");
var SpatialHash = require('./spatialhash.js');
var util=require("util")
//const cluster = require('cluster');
//var myCache = require('cluster-node-cache')(cluster);
const numCPUs = require('os').cpus().length;
var Promise = require("bluebird");

/*
//2D Collision
cluster.setupMaster({
  exec: __dirname+'/collide.js'
})
// Fork workers.
for (let i = 0; i < numCPUs; i++) {
	cluster.fork();
}
cluster.on('exit', (worker, code, signal) => {
	console.log(`worker ${worker.process.pid} died`);
});
*/
function getCollisions(sword){
//	return new Promise((resolve)=>{
	var collision=[]
		sword.map.forEach((entity)=>{
			if(entity.has("collision")){
				var collide=sword.search(entity.polygon,(item)=>{
						return entity!=item
					});
					if(collide.length){
						collision.push({entity,collide})
				}
			}
		})
		
		collision.forEach((a)=>{
			a.collide.forEach(function(entity){
				if(a.entity.colFn){
					var component=a.entity.colFn.find((func)=>{return entity.has(func)})
					if(component){
						a.entity.emit("collision"+component,entity)
					}
				}
			})
			a.entity.emit("collision",a.collide)
		})
			//resolve()
		//})
		/*
	var collide=[];
	sword.map.forEach((entity)=>{
		var items=[]
		if(entity.range&&entity.has("collision")){
			var item=sword.maphash.query(entity.range,(item)=>{
				return entity!=item
			}).forEach((item)=>{
				items.push({entity:sword.map.indexOf(item),polygon:item.polygon})
			})
			if(items.length){
				collide.push({entity:sword.map.indexOf(entity),polygon:entity.polygon,items})
			}
		}
	})
	
	var fork=[]
	var item=Math.ceil(collide.length/numCPUs)
	for (const id in cluster.workers){
		if(collide.length){
		fork.push(new Promise((resolve)=>{
			cluster.workers[id].once('message',(message)=>{
				message.forEach((entity)=>{
					if(sword.map[entity.id]){
						var collide=[]
						entity.item.forEach((entity)=>{
							if(sword.map[entity])
								collide.push(sword.map[entity])
						})
						if(collide.length)
							sword.map[entity.id].emit("collision",collide)
					}
				})
				resolve();
			});
			cluster.workers[id].send(collide.slice(0,item))
			collide=collide.slice(item)
		}).catch((error)=>{console.log(error)}))
		}
	}
	return Promise.all(fork)
	*/
}

var sword=function(){
	this.world=new sword.map();
	this.sword={width:1500,height:768};
	var swordWorld=this;
	sword.entity.call(this);
	this.event=["Velocity","NextFrame","LastFrame"];
	
	
	this.loop=gameloop.setGameLoop(function(delta){
		sword.sec=delta;
			swordWorld.event.forEach(function(e){
			if(e=="NextFrame")
			getCollisions(swordWorld.world);
				swordWorld.world.map.forEach(function(entity){
						if(entity.has("collision")||entity.has("screen")){
							entity.emit(e,delta);
						}
					})				
			})
	},1000/30);
	gameloop.setGameLoop((delta)=>{
		swordWorld.event.forEach(function(e){	
				swordWorld.world.map.forEach(function(entity){
						if(entity.has("player")){
							entity.emit("Display",delta);
						}
				})
		})
	},1000/30)
};
var nextid=0;
function removeAll(){
		this.notExist=true;
		//Not for events
		process.nextTick(()=>{
			//console.log("test")
			this.removeAllListeners();
		})
	}
sword.matchMiddle=function(entity,character){
	character=character.middle()
	return {x:character.x-entity.width()/2,y:character.y-entity.height()/2}
}
sword.e=function(component){
	var object=new concert;
	Object.assign(object,sword.entity.prototype);
	sword.entity.call(object);
	object.world=this.world	
	object.addComponent(component);
	if(this.world)
		this.world.push(object);
	object.on("remove",removeAll)
	return object;
}
sword.prototype.e=sword.e
//entity
sword.entity=function(){
	this.component=[]
	this.id=nextid++;
};
sword.entity.prototype.addComponent=function(component){
	var tha=this
	component.split(",").forEach(function(component){
		tha.component.push(component)
		if(sword[component]){
			Object.assign(tha,sword[component]);
			sword[component].call(tha)
		}
	})
	return this
}
sword.entity.prototype.has=function(component){
	return this.component.indexOf(component)!=-1
}
sword["2D"]=function(){
	this.polygon=null;
	this.sprite=null;
	this.velocity=new sat.Vector();
	this.on("Velocity",function(delta){
		if(Math.abs(this.velocity.x)>=1||Math.abs(this.velocity.y)>=1){
			this.pos.x+=this.velocity.x*delta
			this.pos.y+=this.velocity.y*delta
			this.emit("Set",{x:this.velocity.x*delta,y:this.velocity.y*delta})
		}
	})
	this.prev=new sat.Vector();
}
sword["2D"].attach=function(polygon){
	var x=this.left().x
	var y=this.left().y
	this.child=this.child||[]
	this.child.push(polygon)
	polygon.attached=this
	this.on("Velocity",(loc)=>{
		polygon.setLocation(polygon.left().x+(this.left().x-x),polygon.left().y+(this.left().y-y))
		x=this.left().x
		y=this.left().y
	})
	function destroyAttach(){
		polygon.emit("remove")
	}
	this.once("remove",destroyAttach)
	polygon.once("remove",function(){
		this.attached.removeListener("remove",destroyAttach)
	})
}
sword["2D"].moveTo=function(x,y,distance){
	distance=distance||1
	var move=new sat.Vector(x,y)
	move.normalize()
	move.x*=distance;
	move.y*=distance;
	this.velocity.sub(this.prev)
	this.velocity.add(move);
	this.prev.copy(move)
	return this
}
sword["2D"].polygon=function(coord){
	var vector
	if(this.polygon)
		vector=this.polygon.pos
	else
		vector=new sat.Vector()
	this.polygon=new sat.Polygon(vector,coord)
	this.pos=this.polygon.pos
	return this;
}

sword["2D"].box=function(w,h){
	var vector
	if(this.polygon)
		vector=this.polygon.pos
	else
		vector=new sat.Vector()
	this.polygon=new sat.Box(vector,w,h).toPolygon();
	this.pos=this.polygon.pos
	return this;
}

sword["2D"].circle=function(length){
	var vector
	if(this.polygon)
		vector=this.polygon.pos
	else
		vector=new sat.Vector()
	this.polygon=new sat.Circle(vector,length/2)
	this.pos=this.polygon.pos
	return this;
}
sword["2D"].setLocation=function(x,y){
	var px=x-this.left().x;
	var py=y-this.left().y
	this.polygon.pos.x+=px;
	this.polygon.pos.y+=py;
	this.emit("updateLocation")
	//this.once("LastFrame",()=>{
		this.emit("Set",{x:px,y:py})	
	//})
	return this;
}
sword["2D"].left=function(){
	if(this.polygon instanceof sat.Circle)
		return {x:this.polygon.pos.x-this.polygon.r,y:this.polygon.pos.y-this.polygon.r}
	return {x:this.polygon.pos.x,y:this.polygon.pos.y}
}
sword["2D"].addVelocity=function(x,y,ms){
	this.velocity.x+=x;
	this.velocity.y+=y;
	if(ms){
		setTimeout(()=>{
			this.velocity.x-=x;
			this.velocity.y-=y;
		},ms)
	}
}
sword["2D"].middle=function(){
	return {x:this.left().x+this.width()/2,y:this.left().y+this.height()/2}
}
sword["2D"].width=function(){
	if(this.polygon instanceof sat.Circle)
		return this.polygon.r*2
	var list=this.polygon.points;
	var smallest=0;
	var largest=0;
	for(var point=0;point<list.length;point++){
		if(list[point].x<smallest)
			smallest=list[point].x;
		if(list[point].x>largest)
			largest=list[point].x;
	}
	return largest-smallest
}
sword["2D"].resize=function(w,h){
	var size={}
	if(w&&h){
		size.w=w
		size.h=h
	}
	else if(this.polygon){
		if(w){
			size.w=w;
			size.h=this.height()/this.width()*w
		}else if(h){
			size.h=h;
			size.w=this.width()/this.height()*h
		}
	}
	if(size.w&&size.h){
		if(this.polygon instanceof sat.Polygon)
			this.box(size.w,size.h)
		else
			this.circle(size.h)
		this.emit("updateLocation")
		return size
	}
	return null;
}
sword["2D"].height=function(){
	if(this.polygon instanceof sat.Circle)
		return this.polygon.r*2
	var list=this.polygon.points;
	var smallest=0;
	var largest=0;
	for(var point=0;point<list.length;point++){
		if(list[point].y<smallest)
			smallest=list[point].y;
		if(list[point].y>largest)
			largest=list[point].y;
	}
	return largest-smallest
}



sword["2D"].collide=function(entity,polygon,response){
	if(!polygon)
		polygon=this
	if(polygon.polygon instanceof sat.Circle){
		if(entity.polygon instanceof sat.Polygon){
			return sat.testCirclePolygon(polygon.polygon,entity.polygon,response)
		}else if(entity.polygon instanceof sat.Circle){
			return sat.testCircleCircle(polygon.polygon,entity.polygon,response)
		}
	}
	else{
		if(entity.polygon instanceof sat.Polygon){
			return sat.testPolygonPolygon(polygon.polygon,entity.polygon,response)
		}else if(entity.polygon instanceof sat.Circle){
			return sat.testPolygonCircle(polygon.polygon,entity.polygon,response)
		}
	}
}


sword.collision=function(){
	/*var that=this
	this.on("NextFrame",()=>{
		var collide=this.world.search(this.polygon,(entity)=>{
			return entity!=this
		});
		if(collide.length){
			this.emit("collision", collide)
		}
	})
	return this;
	*/
}
sword.collision.onCollide=function(type,callback){
	this.colFn=this.colFn||[]
	if(this.colFn.indexOf(type)==-1)
	this.colFn.push(type)
	this.on("collision"+type,callback)
}
sword.map=function(){
	this.map=[]
	this.maphash = new SpatialHash({
		x:5000,
		y:5000,
		w:5000,
		h:5000
	}, 100);
}
sword.map.prototype.push=function(entity){
	var hash=this
	///////////////////////////
		entity.on("Set",function(){
			entity.emit("updateLocation")
		})
		entity.on("updateLocation",function(){
			if(!entity.notExist){
			var cen=entity.middle()
			entity.range={
				x:cen.x,
				y:cen.y,
				w:entity.width()/2,
				h:entity.height()/2
			}
			hash.maphash.update(entity)
			}
		})
		entity.on("remove",function(){
			//if(entity.component.indexOf("stone")!=-1)
			//console.log(entity.add,entity.__b)
			hash.maphash.remove(entity)
		})
	//////////////////////////
	this.map.push(entity)
	var tha=this
	entity.once("remove",function(){
		tha.map.splice(tha.map.indexOf(entity),1)
	})
}
sword.map.prototype.search=function(polygon,req){
	var hit=[]
	var range=sword.e("2D")
	range.polygon=polygon
	range.pos=polygon.pos
	range={
		x:range.middle().x,
		y:range.middle().y,
		h:range.height()/2,
		w:range.width()/2
	}
	var t=this
	this.maphash.query(range,req).forEach(function(entity){
			if(sword["2D"].collide(entity,{polygon:polygon})){				
				hit.push(entity)
			}
	})
	return hit
}

//////////////////
////
//////////////////

//var game={width:1500,height:768}

/////////////////
//stats/////////
////////////////
sword.cache=function(){
	this.cache={}
}
sword.cache.keep=function(key,value){
	var cache=this.diff(this.cache[key]||{},value)
	if(this.cache[key])
		this.cache[key]=Object.assign(this.cache[key],value);
	else
		this.cache[key]=value
	return cache
}

sword.cache.diff=function(object,object3){
	var diff={}
	for(var obj in object3){
		if(!object.hasOwnProperty(obj)||object3[obj]!=object[obj]){
			diff[obj]=object3[obj];
		}
	}
	return diff;
}
//SWORD

module.exports=sword