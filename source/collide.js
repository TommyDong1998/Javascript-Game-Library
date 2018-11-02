var sat= require("sat");

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