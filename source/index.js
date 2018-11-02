var concert= require("eventemitter3");
var gameloop=require("node-gameloop");
var sat= require("sat");
var SpatialHash = require('./spatialhash.js');
var util=require("util")
var Promise = require( "bluebird");
const cluster = require('cluster');

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
	
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
var sword=function(){
	this.world=new sword.map();
	this.sword={width:1500,height:768};
	//Main
	this.swordWorld=this;
	//sword.entity.call(this);
	this.event=["Velocity","NextFrame","LastFrame"];
	
	var totaltime=0;
	this.loop=gameloop.setGameLoop((ms)=>{
		sword.sec=ms;
		totaltime+=ms;
			this.event.forEach((e)=>{
				if(e=="NextFrame")
					getCollisions(this.swordWorld.world);
				this.world.map.forEach((entity)=>{
						entity.emit(e,ms,totaltime);
					})				
			})
	},1000/30);
};
sword.debug=require("./debug")
var nextid=0;
function removeAll(){
		this.notExist=true;
//		console.log(this.component)
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
	object.swordWorld=this
	object.addComponent(component);
	if(this.world)
		this.world.push(object);
	object.on("remove",removeAll)
	return object;
}
sword.prototype.e=sword.e

//////////////////
//Entity is an object with components
///////////////////////
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
	this.on("Velocity",(delta)=>{
		//No more than 10 pixels a frame
		var dx=clamp(this.velocity.x*delta,-10,10);
		var dy=clamp(this.velocity.y*delta,-10,10);
		//At least 1 velocity
		if(Math.abs(this.velocity.x)>=1||Math.abs(this.velocity.y)>=1){
			//Move
			this.setLocation(this.left().x+dx,this.left().y+dy);
			//Check if overlap a solid
			this.simpleCollision((entity)=>{
				//Make sure the solid is not yourself
				return this!=entity&&entity.has("solid")&&(!this.ignore||this.ignore.findIndex((component)=>{return entity.has(component)})==-1)
			}).forEach((entity)=>{
				var response=new sat.Response();
				//Might be colliding
				//If it overlap a solid... undo it
				if(this.collide(entity,undefined,response)&&(Math.abs(response.overlapV.x)>0.1||Math.abs(response.overlapV.y)>0.1)){
					this.setLocation(this.left().x-response.overlapV.x,this.left().y-response.overlapV.y);
				}
				
			})
		}
	})
	this.prevMovement=new sat.Vector();
}
sword["2D"].simpleCollision=function(type){
	return this.swordWorld.world.maphash.query(this.range,type)
}
sword["2D"].attach=function(polygon){
	var x=this.left().x
	var y=this.left().y
	this.child=this.child||[]
	this.child.push(polygon)
	polygon.attached=this
	this.on("Velocity",(loc)=>{
		polygon.setLocation(polygon.left().x+(this.left().x-x),polygon.left().y+(this.left().y-y));
		x=this.left().x;
		y=this.left().y;
	})
	function destroyAttach(){
		polygon.emit("remove")
	}
	this.once("remove",destroyAttach)
	polygon.once("remove",()=>{
		this.removeListener("remove",destroyAttach)
	})
}
sword["2D"].moveTo=function(x,y,distance){
	distance=distance||1
	var move=new sat.Vector(x,y)
	move.normalize()
	move.x*=distance;
	move.y*=distance;
	
	this.velocity.sub(this.prevMovement)
	this.velocity.add(move);
	this.prevMovement.copy(move)
	return this
}
sword["2D"].polygon=function(coord){
	var vector;
	if(this.polygon)
		vector=this.polygon.pos
	else
		vector=new sat.Vector()
	this.polygon=new sat.Polygon(vector,coord)
	this.pos=this.polygon.pos
	return this;
}
sword["2D"].setOrigin=function(x,y){
	this.origin={x:Math.trunc(x),y:Math.trunc(y)}
}

sword["2D"].rotate=function(degree){
	this.degree=this.degree||0
	var diff=degree-this.degree
	this.degree=degree
	if(this.polygon.translate){
		this.polygon.translate(this.origin.x*-1,this.origin.y*-1)
		this.polygon.rotate(diff)
		this.polygon.translate(this.origin.x,this.origin.y)
	}
	this.round();
    return this;
}
sword["2D"].round=function(){
	//make all numbers round to nearest whole or 3 decimal
	this.pos.x=Math.trunc(this.pos.x)
	this.pos.y=Math.trunc(this.pos.y)
}
sword["2D"].box=function(w,h){
	var vector
	if(this.polygon)
		vector=this.polygon.pos
	else
		vector=new sat.Vector()
	this.polygon=new sat.Box(vector,Math.floor(w),Math.floor(h)).toPolygon();
	this.pos=this.polygon.pos;
	this.setOrigin(w/2,h/2);
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
	this.setOrigin(length/2,length/2)
	return this;
}
sword["2D"].setLocation=function(x,y,data){	
	var val=this.left()
	var px=x-val.x;
	var py=y-val.y;
	this.polygon.pos.x+=px;
	this.polygon.pos.y+=py;
	this.emit("updateLocation")
	//this.emit("Set",{x:px,y:py})
	return this;
}
sword["2D"].left=function(){
	if(this.polygon instanceof sat.Circle)
		return {x:this.polygon.pos.x-this.polygon.r,y:this.polygon.pos.y-this.polygon.r}
	return {x:this.polygon.pos.x,y:this.polygon.pos.y}
}
sword["2D"].addVelocity=function(x,y,ms,func){
	this.velocity.x+=x;
	this.velocity.y+=y;
	if(ms){
		var rate=10
		var current=0;
		var dx=x/rate;
		var dy=y/rate;
		if(func){
			if(ms){
				var dec=setInterval(()=>{
					if(rate-current){
						current++;
						this.velocity.x-=dx;
						this.velocity.y-=dy;
					}else{
						clearInterval(dec)
						func()
					}
				},ms/rate)
			}
		}
		else{
			setTimeout(()=>{
			this.velocity.x-=x;
			this.velocity.y-=y;
			},ms)
		}
	}
}
sword["2D"].middle=function(){
	return {x:this.left().x+this.width()/2,y:this.left().y+this.height()/2}
}
sword["2D"].width=function(){
	if(!this._width){
		if(this.polygon instanceof sat.Circle)
				this._width= this.polygon.r*2
		else{
			var list=this.polygon.points;
			var smallest=0;
			var largest=0;
			for(var point=0;point<list.length;point++){
				if(list[point].x<smallest)
					smallest=list[point].x;
				if(list[point].x>largest)
					largest=list[point].x;
			}
			this._width= largest-smallest
		}
	}
	return this._width
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
	if(!this._height){
		if(this.polygon instanceof sat.Circle)
			this._height=this.polygon.r*2
		else{
			var list=this.polygon.points;
			var smallest=0;
			var largest=0;
			for(var point=0;point<list.length;point++){
				if(list[point].y<smallest)
					smallest=list[point].y;
				if(list[point].y>largest)
					largest=list[point].y;
			}
			this._height= largest-smallest
		}
	}
	return this._height
}
/*
sword.solid=function(){
	this.on("Set",(lat)=>{
		if(this.solid((entity,response)=>{
			this.pos.x-=Math.trunc(response.overlapV.x)
			this.pos.y-=Math.trunc(response.overlapV.y)
			this.emit("updateLocation")
			}).length){
			
		}
	})
}
sword.solid.solid=function(solid){
	return this.swordWorld.world.maphash.query(this.range,(entity)=>{
		return this!=entity&&entity.has("solid")&&(!this.ignore||this.ignore.findIndex((component)=>{return entity.has(component)})==-1)
	}).filter((entity)=>{
		var response=new sat.Response();
		if(this.collide(entity,undefined,response)&&(Math.abs(response.overlapV.x)>0||Math.abs(response.overlapV.y)>0)){
			if(solid){
				solid(entity,response)
				response.clear()
			}
			return true
		}
	})
}*/

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
	}, 300);
}
sword.map.prototype.push=function(entity){
	var hash=this
	///////////////////////////
		entity.on("updateLocation",function(){
			if(!entity.notExist){
			//Range must be larger because a overlap distance of zero is still considered collision
			var cen=entity.middle()
			entity.range={
				x:cen.x,
				y:cen.y,
				w:Math.round(entity.width()/2),
				h:Math.round(entity.height()/2)
			}
			hash.maphash.update(entity)
			}
		})
		entity.on("remove",function(){
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

/////////////////
//stats/////////
////////////////
sword.cache=function(){
	this.cache={}
}
sword.cache.push=function(key,value){
	var cache=this.diff(this.cache[key]||{},value);
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