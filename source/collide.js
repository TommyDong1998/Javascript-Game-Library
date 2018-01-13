const cluster = require('cluster');
var sat= require("sat");

var item=[]
cluster.worker.on("message",(message)=>{
	message.forEach(function(entity){
		var col=[]
		entity.items.forEach(function(polygon){
			if(collide(entity,polygon)){
				col.push(polygon.entity)
			}
		})
		if(col.length)
		item.push({id:entity.entity,item:col})
	})
	//console.log(item)
	cluster.worker.send(item)
})

function collide(entity,polygon,response){
	if(!polygon)
		polygon=this
	if(polygon.polygon.r){
		polygon.polygon=new sat.Circle(new sat.Vector(polygon.polygon.pos.x,polygon.polygon.pos.y),polygon.polygon.r)
		if(entity.polygon.r){
			entity.polygon=new sat.Circle(new sat.Vector(entity.polygon.pos.x,entity.polygon.pos.y),entity.polygon.r)
			return sat.testCircleCircle(polygon.polygon,entity.polygon,response)
		} else{
			entity.polygon=new sat.Polygon(new sat.Vector(entity.polygon.pos.x,entity.polygon.pos.y),entity.polygon.points)
			return sat.testCirclePolygon(polygon.polygon,entity.polygon,response)
		}
	}
	else{
		polygon.polygon=new sat.Polygon(new sat.Vector(polygon.polygon.pos.x,polygon.polygon.pos.y),polygon.polygon.points)
		if(entity.polygon.r){
			entity.polygon=new sat.Circle(new sat.Vector(entity.polygon.pos.x,entity.polygon.pos.y),entity.polygon.r)
			return sat.testPolygonCircle(polygon.polygon,entity.polygon,response)
		}else{
			entity.polygon=new sat.Polygon(new sat.Vector(entity.polygon.pos.x,entity.polygon.pos.y),entity.polygon.points)
			return sat.testPolygonPolygon(polygon.polygon,entity.polygon,response)
		}
	}
}