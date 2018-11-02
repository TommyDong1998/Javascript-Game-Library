//Visualize All objects
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(80);

module.exports=function(sword){
	io.on("connection",function(socket){
		console.log("Debug Mode")
		var debug=sword.e("");
		debug.on("NextFrame",()=>{
			var polygons=[];
			sword.world.map.forEach((entity)=>{
				if(entity.polygon){
					var points=[];
					entity.polygon.points.forEach((point)=>{
						points.push(point.x)
						points.push(point.y)
					})
					polygons.push({id:entity.id,point:points,x:entity.left().x,y:entity.left().y});
				}
			})
			socket.emit("polygon",polygons)
		})
	})
}