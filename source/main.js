var statData;
var setting={
	//crafty viewport scale
	vp:false
}
var itemDescription={
	"Fist":"Basic punch.Can improve. Damage is determined by your strength",
	"Fire_ball":"Whoa its a basic fireball. Medium damage.",
	"Speed_Fire_ball":"Self perfected speed oriented basic fireball.",
	"Attack_Fire_ball":"Self perfected attack oriented basic fireball."
}
//progress bar
var guiBar={
	hp:new ProgressBar.Line("#hp",{strokeWidth:3,trailColor:"rgba(252, 60, 60,0.5)",color:"rgb(252, 60, 60)"})
	,qi:new ProgressBar.Line("#qi",{strokeWidth:3,trailColor:"rgba(70, 76, 191,0.5)",color:"rgb(70, 76, 191)"})
	,level:new ProgressBar.Line("#level",{strokeWidth:3,trailColor:"rgba(179, 249, 223,0.5)",color:"rgb(93, 204, 201)"})
}
var guiStat={
	strokeWidth:10,trailWidth:10
}
var guiStatus={
	effect:[],
	add: function(type,amount,time){
		time=Math.floor(time)/1000
		console.log(type)
		var stat=$("<div class=\"status\"></div>");
		if(type=="speed"&&amount<0)
		type="snowflake"
		else if(type=="speed")
		type="boot"
		else if(type=="intelligence")
		type="idea"
		else if(type=="strength")
		type="biceps"
		else if(type=="regeneration")
		type="glass-heart"
		else if(type=="tree")
		type="tree-branch"
		else if(type=="burn"){
			type="burn"
			var prev=this.effect.findIndex((effect)=>{return effect.type=="burn"})
			if(prev!=-1){
				clearInterval(effect[prev].effect)
				this.effect.splice(prev,1)
				effect[prev].html.remove()
			}
		}
		if(amount===0){
			$("#statusContainer img[src=\"effect/"+type+".svg\"]") .parent().remove()
		}else
		stat.append("<div class=\"icon\"><img src=\"effect/"+type+".svg\"></div>");
		if(time>0){
			var sec=$("<div class=\"text\">"+time.toFixed(1)+"</div>");
			stat.append(sec);
			var interval=setInterval(()=>{
				time=parseFloat(time-0.5)
				sec.text(time.toFixed(1))
				if(time<=0){
					stat.remove();
					clearInterval(interval);
					this.effect.splice(this.effect.indexOf(prev),1)
				}
			},500)
		}
		this.effect.push({type:type,html:stat,effect:interval})
		$("#statusContainer").append(stat);
	}
};
var guiInventory={
	select:0,
	inventory:function(number){
		$("#inventory .item").each(function(){
			$(this).css({border:"none"})
		})
		$("#inventory"+number+"   .item").css({border:"3px solid white"})
		this.select=number
	},
	set:function(items){
		$("#inventory span").each(function(){
			$(this).html("")
		})
		items.forEach(function(item,loc){
			$("#inventory"+loc+" span").html(item.name.replace("_"," "))
			var bg=$("<div/>").css({"background":"url(image/"+item.name.toLowerCase()+".svg)","background-size":"contain","background-repeat":"no-repeat"})
			bg.addClass("bg")
			$("#inventory"+loc+" .item").append(bg)
			if(statData[item.name]!=undefined){
				if(statData[item.name]>100)
					$("#inventory"+loc+" .levelbar").css({background:"yellow",height:"100%"})
				else
					$("#inventory"+loc+" .levelbar").css("height",(statData[item.name])+"%")
			}
		})
	}
}
guiInventory.inventory(0)
var items=[]
//setup inventory click
$( "#inventory [id^=inventory]").on("click",function(e){
	guiInventory.inventory(parseInt($(this).attr("id").substr(9)))
	socket.emit("select",$("#inventory"+inventory.select).text())
})
$("#inventory").on("mouseover","div",function(){
	$("#description span").html(itemDescription[$(this).text().replace(" ","_")])
	$("#description #gameloc").hide()
})
$("#inventory").on("mouseout","div",function(){
	$("#description #gameloc").show()
	$("#description span").html("")
})


let Application=PIXI.Application,
loader=PIXI.loader,
resources=PIXI.loader.resources,
sprite=PIXI.Sprite;
let game=new Application({
	width:window.innerWidth,
	height:window.innerHeight,
	antialias:true,
	transparent:true,
	resolution:1
})
game.renderer.autoResize=true;

game.stage.scale.x=window.innerHeight/768
game.stage.scale.y=window.innerHeight/768
//game.stage.x-=(window.innerWidth-1500)*window.innerHeight/768/2
game.stage.x=(window.innerWidth-1500)/-2
              
game.stage.hitArea=new PIXI.Rectangle(0,0,1500,window.innerHeight)
game.renderer.view.style.background="rgb(234, 243, 245)"
game.stage.interactive=true
var images=[];
//List Images
Object.keys(spriteArray).forEach((value)=>{
	images.push("image/"+value+".svg")
})
PIXI.loader.add(images).load(displayStart);
//displayStart()

$("#play button").on("click",startGame)

function displayStart(){
	$("#play").show();
	$("#update").show();
	$("#instruct").show();
	socket=io();
	console.log("Loaded Images")
}
var socket;
var realPosition={}
var currentPosition={}
var follow=new PIXI.Container
game.stage.addChild(follow)
var effect={}
effect.aura={
	"alpha": {
		"start": 0.24,
		"end": 0.11
	},
	"scale": {
		"start": 0.05,
		"end": 0.01,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#00ccff",
		"end": "#0044ff"
	},
	"speed": {
		"start": 0.1,
		"end": 30,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 1,
		"max": 3
	},
	"lifetime": {
		"min": 1,
		"max": 1
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": -1,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "circle",
	"spawnCircle": {
		"x": 0,
		"y": 0,
		"r": 30
	}
}
effect.fireburst={
	"alpha": {
		"start": 1,
		"end": 1
	},
	"scale": {
		"start": 0.03,
		"end": 0.16,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#ff9900",
		"end": "#ff0000"
	},
	"speed": {
		"start": 0.1,
		"end": 100,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 1,
		"max": 3
	},
	"lifetime": {
		"min": 1,
		"max": 1
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": -1,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "circle",
	"spawnCircle": {
		"x": 0,
		"y": 0,
		"r": 100
	}
}
effect.firewisp={
	"alpha": {
		"start": 0.49,
		"end": 1
	},
	"scale": {
		"start": 1,
		"end": 0.5,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#eb4b0c",
		"end": "#f21f0c"
	},
	"speed": {
		"start": 0,
		"end": 0,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 1
	},
	"lifetime": {
		"min": 0.1,
		"max": 0.5
	},
	"blendMode": "normal",
	"frequency": 0.001,
	"emitterLifetime": -1,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "circle",
	"spawnCircle": {
		"x": 0,
		"y": 0,
		"r": 0
	}
}
effect.fireball={
	"alpha": {
		"start": 1,
		"end": 0.32
	},
	"scale": {
		"start": 1,
		"end": 0.5,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#ff9100",
		"end": "#ff2200"
	},
	"speed": {
		"start": 30,
		"end": 20,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 100
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 10
	},
	"lifetime": {
		"min": 0.1,
		"max": 0.5
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": -1,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point"
};
effect.waterball={
	"alpha": {
		"start": 1,
		"end": 0.32
	},
	"scale": {
		"start": 1,
		"end": 0.6,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#229be6",
		"end": "#2f71eb"
	},
	"speed": {
		"start": 5,
		"end": 5,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 0
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 10
	},
	"lifetime": {
		"min": 0.1,
		"max": 0.5
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": -1,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point"
}
var lag=0;
function startGame(){
	document.body.appendChild(game.view);
	$("#play").hide();
	$("#update").hide();
	$("#instruct").hide();
	$("#start").show();
	socket.emit("start",$("#play input").val())
	socket.on("item",triggerItem )
	socket.on("stat",triggerStat)
	socket.on("newitem",triggerNewItem)
	socket.on("dead",stopGame)
	socket.on("feature",triggerFeature)
	socket.on("info",triggerInfo)
	socket.on("visible",triggerView   )
	socket.on("view",triggerUpdate)
	socket.on("notvisible",triggerNot)
	socket.on("qi",()=>{triggerMessage("Not enough ki")})
	
	socket.on("status",(type,amount,sec)=>{guiStatus.add(type,amount,sec)})
socket.on("map",(loc)=>{
			$("#description #gameloc").html('<div style="width:10px;position:absolute;height:10px;background:#577be0;left:'+Math.floor(loc.x/40+5)+'px;top:'+Math.floor(loc.y/40+5)+'px;"></div>');
	})
	socket.on("pong",(latency)=>{
		lag=latency
	})
	window.onkeydown=keyboard;
	window.onkeyup=keyup;
	
	game.stage.on("mousemove",(e)=>{
		//var mouse=e.data.getLocalPosition(follow)
	//console.log(mouse.x,mouse.y)
		//socket.emit("click",Math.floor(mouse.x+follow.x),Math.floor(mouse.y+follow.y))
	})
	game.stage.on("click",(e)=>{
		var mouse=e.data.getLocalPosition(game.stage)
		//console.log(mouse.x,mouse.y)
		socket.emit("click",mouse.x,mouse.y)
		socket.emit("skill",guiInventory.select)
	})
	
	game.ticker.add(gameloop)
}

function updateLayer() {
    follow.children.sort(function(a,b) {
        a.zIndex = a.zIndex || 0;
        b.zIndex = b.zIndex || 0;
        return a.zIndex - b.zIndex
    });
};

$("#restart button").on("click",function(){
		$("#restart").hide();
		startGame()
})
function stopGame(){
	$("#restart").show();
	$("canvas").remove();
	
	$("#update").show();
	$("#start").hide();
	currentPosition[player].visible=false
	socket.removeAllListeners();
	
}
var frameRate=30
function interpolation(current,real,delta){
	if(Math.round(current.x)!=Math.round(real.x)||Math.round(current.y)!=Math.round(real.y)){
		if(current==currentPosition[player]){
		}
		var addx=(real.diffx*delta)*frameRate
		var addy=(real.diffy*delta)*frameRate
		
		if((Math.abs(real.x-current.x))<Math.abs(addx)){
			current.x=real.x
		}
		else{
			current.x+=addx
		}
		if((Math.abs(real.y-current.y))<Math.abs(addy))
			current.y=real.y
		else
			current.y+=addy
	}
}
var player;
var middle={}
function gameloop(delta){
	Object.keys(currentPosition).forEach((item)=>{
		var current=currentPosition[item]
		if(item.visible!=false){
			if(!(current instanceof PIXI.particles.Emitter)){
				interpolation(current,realPosition[item],delta)
			}
		}
	})
	
	
	
	/*if(follow&&currentPosition[player]){
		var current=currentPosition[player]
		var real=realPosition[player]
		var center={}
		center.x=current.x-50
		center.y=current.y-50
		 
		var floc={x:follow.x*-1+(1500/2),y:follow.y*-1+(768/2)}
		var a = (floc.x)-current.x-50
		var b = (floc.y)-current.y-50
		console.log(a)
		var far = Math.sqrt( a*a + b*b );
		if(far>150)
		{
			var loc=new SAT.Vector(floc.x-center.x,floc.y-center.y)
			loc.normalize()
			console.log(loc)
			follow.x+=loc.x*delta/60*statData.speed
			follow.y+=loc.y*delta/60*statData.speed
		}
	}
	
	
	
	
	*/
}

// Calculate the current time
var elapsed = Date.now();
// Update function every frame
var update = function(){
	// Update the next frame
	var now = Date.now();
	Object.keys(currentPosition).forEach((item)=>{
		var current=currentPosition[item]
		if(item.visible!=false){
		if(current instanceof PIXI.particles.Emitter){
				current.updateSpawnPos(realPosition[item].x,realPosition[item].y)
				current.update((now - elapsed) * 0.001);	
		}
		}
	})
	elapsed = now;
	// The emitter requires the elapsed
	// number of seconds since the last update
	// Should re-render the PIXI Stage
	// renderer.render(stage);
	requestAnimationFrame(update);
};

// Start the update
update();

var keyx=0;
var keyy=0;

function move(){
	
}
function keyboardVelocity(){
	if(player){
	realPosition[player].vx=keyx*statData.speed
	realPosition[player].vy=keyy*statData.speed
	}
}
var chat={
	show:true,
	display:function(){
		$("#chat").show();
		$("#chat input").focus()
		this.show=false
	},
	done:function(){
	socket.emit("message",$("#chat input").val())
	$("#chat input").val("")
	$("#chat").hide();
	chat.show=true
	}
}
$("#chat button").on("click",function(){
	chat.done()
})
function keyup(event){
	if(event.keyCode==13&&chat.show){
		chat.display()
	}else if(event.keyCode==13){
		chat.done()
	}
	if(event.keyCode==49||event.keyCode==50||event.keyCode==51||event.keyCode==52||event.keyCode==53||event.keyCode==54||event.keyCode==55||event.keyCode==56||event.keyCode==56||event.keyCode==57){
		guiInventory.inventory(event.keyCode-49)
	}
	if(event.keyCode==97|| event.keyCode==98||event.keyCode== 99||event.keyCode== 100||event.keyCode== 101||event.keyCode== 102||event.keyCode== 103||event.keyCode== 104||event.keyCode== 105){
		guiInventory.inventory(event.keyCode-97)
	}
	else{
		if(event.keyCode==37||event.keyCode==65||event.keyCode==39||event.keyCode==68){
			keyx=0
		}else if(event.keyCode==38||event.keyCode==87||event.keyCode==40||event.keyCode==83){
			keyy=0
		}
		socket.emit("move",keyx,keyy)
	}
}
function keyboard(event){
	if(chat.show){
		if(keyx==0){
			if(event.keyCode==37||event.keyCode==65){
				keyx--;
			}
			else if(event.keyCode==39||event.keyCode==68){
				keyx++;
			}
			socket.emit("move",keyx,keyy)
			//event.preventDefault()
		}
		if(keyy==0){
			if(event.keyCode==38||event.keyCode==87){
				keyy--;
			}else if(event.keyCode==40||event.keyCode==83){
				keyy++;
			}
			socket.emit("move",keyx,keyy)
			//event.preventDefault()
		}
		event.preventDefault()
	}
}
function triggerMessage(message){
	var element=$("<div style='text-align:center;'>"+message+"</div>");
	$("#bottom").prepend(element);
	setTimeout(()=>{
		element.remove();
	},3000)
}
function triggerNot(entity){
	entity.forEach((entity)=>{
		if(currentPosition[entity])
		currentPosition[entity].visible=false
		if(currentPosition[entity] instanceof PIXI.particles.Emitter){
			currentPosition[entity].emit=false
		}
	})
}
function triggerView(view){
	view.forEach((entity)=>{
		if(currentPosition[entity])
		currentPosition[entity].visible=true
		if(currentPosition[entity] instanceof PIXI.particles.Emitter){
			currentPosition[entity].emit=true
		}
	})
}
var camlast;
function triggerUpdate(update,camera){
	update.forEach((item)=>{
		//First time info
		var entity;
		if(!realPosition[item.id]){
			//console.log(item.id,item)
			realPosition[item.id]={}
			if(item.particle){
			   var particle=JSON.parse(JSON.stringify(effect[item.sprite]));
				particle.scale.start*=item.w/100
				particle.scale.end*=item.w/100
				var container=new PIXI.Container
				if(item.sprite=="fireburst")
			   currentPosition[item.id]=new PIXI.particles.Emitter(container,[PIXI.Texture.fromImage('image/Pixel25px.png')],particle)
			   else
			   currentPosition[item.id]=new PIXI.particles.Emitter(container,[PIXI.Texture.fromImage('image/Pixel100px.png')],particle)
			   follow.addChild(container)
				}		else if(item.sprite){
				var resource=resources["image/"+item.sprite+".svg"].texture
				currentPosition[item.id]=new sprite(resource);
				currentPosition[item.id].scale.x*=(item.w/spriteArray[item.sprite].w)
				currentPosition[item.id].scale.y*=(item.w/spriteArray[item.sprite].w)
				currentPosition[item.id].x=item.x
				currentPosition[item.id].y=item.y
				follow.addChild(currentPosition[item.id])
			}
			
			if(item.level!=undefined){
				player=item.id
			}
			if(item.name){
				var name=new PIXI.Text(item.name,{align:"center"})
				name.y-=30
				currentPosition[item.id].addChild(name)
			}
			
		}

		entity=realPosition[item.id]
		
		if(item.chat){
				console.log(item.chat)
				var name=new PIXI.Text(item.chat,{align:"center"})
				name.y-=60
				currentPosition[item.id].addChild(name)
				setTimeout(()=>{
					name.destroy()
				},6000)
		}
		if(item.x)
			entity.x=item.x
		if(item.y)
			entity.y=item.y
		if(item.z){
			currentPosition[item.id].zIndex=item.z
			updateLayer()
			console.log(item.sprite,item.z)
		}
		if(item.w){
			currentPosition[item.id].width=item.w
			realPosition[item.id].w=item.w
		}
		if(item.h){
			currentPosition[item.id].height=item.h
			realPosition[item.id].h=item.h
		}
		
		if(item.time){
			$("#pickbar").show();
				$("#pick").css("width","0")
				$("#pick").animate({"width":item.time*100+"%"},100);
			if(item.time==1){
				$("#pickbar").hide();
				$("#pick").css("width","0")
			}
		}
		entity.diffx=entity.x-currentPosition[item.id].x
		entity.diffy=entity.y-currentPosition[item.id].y
		
		if(item.hp!=undefined){
			guiBar.hp.animate(item.hp/statData.hp)
		}
		if(item.red){
			currentPosition[item.id].tint=0xf44242
			currentPosition[item.id].alpha=0.9
		}
		else if(item.red!=undefined){
			currentPosition[item.id].tint=0xFFFFFF
			currentPosition[item.id].alpha=1
		}
		if(item.qi!=undefined){
			guiBar.qi.animate(item.qi/statData.dantian)
		}
		if(item.level!=undefined){
			guiBar.level.animate(item.level/(100*(statData.sp+1)))
		}
	})
	if(camera)
		camlast=camera
	if(realPosition[player]&&camlast){
			follow.x=(realPosition[player].x+camlast.x)*-1
			follow.y=(realPosition[player].y+camlast.y)*-1
	}
}
function triggerItem(update){
		items=update;
		guiInventory.set(update)
}
var statData;
function triggerStat(info){
	statData=statData||{}
	var statinfo=(({ hp, strength, speed,intelligence,dantian,regeneration}) => ({hp, strength, speed,intelligence,dantian,regeneration}))(info)
	Object.keys(statinfo).forEach((key)=>{
		if(statinfo[key]!=statData[key]){
			var id;
			switch(key){
				case "hp":
					id="health";
				break;
				case "strength":
					id="strength";
				break;
				case "speed":
					id="speed";
					break;
				case "intelligence":
					id="intelligence";
					break;
				case "dantian":
					id="dantian";
					break;
				case "regeneration":
					id="vitality";
					break;
			}
			$("#"+id+" div").text(statinfo[key])
			if(statData[key]!=undefined){
			$("#"+id).animate({color:"yellow"},3000,()=>{
				$("#"+id).animate({color:"#333131"},3000)
				
			})
			}
		}
	})
	statData=info;
	guiInventory.set(items||[])
}
function triggerNewItem(tex,upgrade){
	id=upgrade[0]	
	upgrade=upgrade[1]
	var div=$("<div>").addClass("selection")
	div.append(tex+"<br>")
	upgrade.forEach(function(item){
		div.append("<div><div class=\"preview\" id="+item+"></div><div class=\"text\" id="+item+">"+item+"</div></div>")
	})
	$("body").append(div)
	$(div).on("click","div",function(){
		socket.emit("new"+id,$(this).attr("id"));
		div.remove()
	})
}
function triggerFeature(feature){
	var description;
	switch(feature){
		case "hat":
			description="After a long time. You find a hat. No effect.";break;
		case "sense":
			description="Qi manipulation is easy inside of your Qi sense radius. Weak sheild effect.";break;
		case "shortbeard":
			description="You have gotten old. No effect.";break;
	}
	
	var element=$("<div></div>")
	$("body").append(element)
	element.attr("id","feature");
	element.html(feature+"<br>"+description+"<br><button>Close</button>")
	$("#feature button").click(
		function(){
			$("#feature").remove()
		})
	}
function triggerInfo(){
	var item=map.get(update.id)
	if(info.damage){
		
	}
}