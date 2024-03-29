const { Polygon } = require('sat');

(function() {
    'use strict';
    // ///////////////
    // Sword Engine///
    // By Tom     ///
    // //////////////
    const QuadNode = require('quad-node');
    const SAT = require('sat');
    const WebSocket = require('ws');
    // Built in
    const EventEmitter = require('events');
    
    const settings = {
        speed: 30,
        width: 5000,
        height: 5000,
        port: 8080,
        gravity: 10,
        debug: true
    };

    // Display basic server information
    function consoleStatus() {
        console.log(`Target ${settings.speed} fps`);
        console.log(`Map ${settings.width} width ${settings.height} height`);
    }

    /*
    Map that contains Entity classes
    */
    class GameMap {
        constructor(server, w=settings.width, h=settings.height) {
            this.server = server;
            this.quadTree = new QuadNode({
                minx: 0,
                miny: 0,
                maxx: w,
                maxy: h
            }, 64, 10);
        }

        //Shorthand for creating an object and inserting it
        e(entity, ...args){
            const Entity=new entity(args);
            this.insert(Entity);
            return Entity;
        }

        insert(object) {
            object.map = this;
            object.bound = {
                minx: object.pos.x,
                miny: object.pos.y,
                maxx: object.pos.x + object.width,
                maxy: object.pos.y + object.height
            };
            this.quadTree.insert(object);
        }
        
        update(object) {
            //Sometimes object is deleted already
            try {
                object.bound = {
                    minx: object.pos.x,
                    miny: object.pos.y,
                    maxx: object.pos.x + object.width,
                    maxy: object.pos.y + object.height
                };
                //If have rotation then increase bounding box
                if (object.rad) {
                    var max = object.height > object.width ? object.height : object.width;
                    object.bound.minx -= max;
                    object.bound.maxx += max;
                    object.bound.miny -= max;
                    object.bound.maxy += max;
                }
                if (object._quadNode)
                    this.quadTree.update(object);
            } catch (e) {
                console.log("error", e);
            }
        }
        // //////////////////////////////////
        // Find any objects that may collide with this object
        // //////////////////////////////////
        find(object) {
            var returnVal = [];
            this.quadTree.any(object.bound, (o) => {
                if (object != o)
                    returnVal.push(o);
            });
            return returnVal;
        }
        // /////////////////////////////////////////////////
        // Find any objects within distance of object
        // /////////////////////////////////////////////////
        findNear(object, distance, cb) {
            var bound = JSON.parse(JSON.stringify(object.bound));
            bound.minx -= distance / 2;
            bound.miny -= distance / 2;
            bound.maxx += distance / 2;
            bound.maxy += distance / 2;
            var returnVal = [];
            this.quadTree.any(bound, (o) => {
                returnVal.push(o);
                if (cb)
                    cb(o);
            });
            return returnVal;
        }
        //Remove object from map
        destroy(object) {
			try{
				this.quadTree.remove(object);
            }catch(e){
				console.log("error:",object,e)
			}
        }
    }

    /*
    All characters/enemies in game are entities
    */
    class Entity extends EventEmitter {
        constructor(w, h) {
            super();
            h = h || w;
            this.degree = 0;
            this.box(w, h);
            this.id = Entity.id++;
            this.velocity = {
                x: 0,
                y: 0
            };
            this.type = [];
            this.attachE = [];
            this.once('remove', () => {
                this.removed = true;
                this.map.destroy(this);
                this.map.server.emit('remove', this.id);
                setImmediate(()=>{
                    this.removeAllListeners();
                })
            });
        }
        //Move towards a object with timeout 
		velocityTimeout(obj,amt,ms){
			var d = new SAT.Vector(obj.x,obj.y);
            d.normalize();
            d.scale(amt, amt);
            this.velocity.x += d.x;
            this.velocity.y += d.y;
			setTimeout(()=>{
				this.velocity.x -= d.x;
				this.velocity.y -= d.y;
			},ms);
            return d;
		}
        //Move towards an object
        velocityToward(obj, amt) {
            var d = new SAT.Vector(obj.pos.x - this.pos.x, obj.pos.y - this.pos.y);
            d.normalize();
            d.scale(amt, amt);
            this.velocity.x += d.x;
            this.velocity.y += d.y;
            return d;
        }
        //Set Velocity
        setVelocity(x,y) {
            this.velocity.x += x;
            this.velocity.y += y;
        }
        /* Set location
        If center is true. Will set position for center of object.
        */
        setPosition(x, y) {
            this.polygon.pos.x = x;
            this.polygon.pos.y = y;
            if (this.map && this._quadNode)
                this.map.update(this);
            return this;
        }
        // Change entity hitbox
        box(w, h) {
            w=Math.floor(w);
            h=Math.floor(h);
            var vector;
            if (this.polygon)
                vector = this.polygon.pos;
            else
                vector = new SAT.Vector();
            this.polygon = new SAT.Box(vector, w,h).toPolygon();
            this.pos = this.polygon.pos;
            this.setOrigin(w / 2, h / 2);
            this.size(w, h);
            return this;
        }
        // Change entity hitbox
        // Note that circle pos is set at middle of circle
        circle(w) {
            w = Math.floor(w);
            var vector;
            if (this.polygon) {
                vector = this.polygon.pos;
            } else {
                vector = new SAT.Vector();
            }

            this.polygon = new SAT.Circle(vector, w / 2);
            this.pos = this.polygon.pos;
            this.setOrigin(w / 2, w / 2);
            this.size(w, w);
            return this;
        }
        size(w, h) {
            this.width = w;
            this.height = h;
            if (this.map && this._quadNode)
                this.map.update(this);
        }
        // set origin
        setOrigin(x, y) {
            this.origin = {
                x: Math.trunc(x),
                y: Math.trunc(y)
            };
        }
        // rotate
        rotate(rad) {
            this.rad = this.rad || 0;
            var diff = rad;
            this.rad += rad;
            if (this.polygon.translate) {
                this.polygon.translate(this.origin.x * -1, this.origin.y * -1);
                this.polygon.rotate(diff);
                this.polygon.translate(this.origin.x, this.origin.y);
            }
            this.map.update(this);
            return this;
        }
        // inherit all prototypes of another object
        extend(type) {
            Object.assign(this.constructor.prototype, type);
            return this;
        }
        // Return what this object collide with
        collideWith(condition) {
            var returnVal = [];
            // Checks if what this object may collide with
            let obj=this.map.find(this)
            for(let i=0;i<obj.length;i++){
                let enemy=obj[i];
                // Check if they actually collide
                const a=this.polygon;
                const b=enemy.polygon;
                var response = new SAT.Response();
                if(a instanceof SAT.Polygon){
                    if(b instanceof SAT.Polygon){
                        if (SAT.testPolygonPolygon(this.polygon, enemy.polygon,response)) {
                            enemy._response=response;
                            returnVal.push(enemy);
                            continue;
                        }
                    }else{
                        if (SAT.testPolygonCircle(this.polygon, enemy.polygon,response)) {
                            enemy._response=response;
                            returnVal.push(enemy);
                            continue;
                        }
                    }
                }
                else{
                    if(b instanceof SAT.Polygon){
                        if (SAT.testCirclePolygon(this.polygon, enemy.polygon,response)) {
                            enemy._response=response;
                            returnVal.push(enemy);
                            continue;
                        }
                    }else{
                        if (SAT.testCircleCircle(this.polygon, enemy.polygon,response)) {
                            enemy._response=response;
                            returnVal.push(enemy);
                            continue;
                        }
                    }
                }
                if(condition && condition(enemy))
                    return returnVal
            };
            return returnVal;
        }
        attach(obj) {
            this.attachE.push(obj);
        }
    }


    // All entity have different id. This will increment
    Entity.id = 0;
    
    /*
    Starts the main game loop
    */
    function constructor(cb,httpServer) {
        // Run one time
        consoleStatus();
        let opt;
        if(httpServer){
            opt={
                server: httpServer,
                perMessageDeflate: false
            }
        }else{
            opt={
            port: settings.port,
            perMessageDeflate: false
            }
        }
        this._socket = new WebSocket.Server(opt);
        this._velocityItems = [];
        this._collisionItems = [];
        let undoVelocity = [];
        this.on('velocity', (object) => {
            this._velocityItems.push(object);
            object.once('remove', () => {
                this._velocityItems.splice(this._velocityItems.indexOf(object), 1);
            });
        });
        this.on('rmVelocity', (object) => {
            this._velocityItems.splice(this._velocityItems.indexOf(object), 1);
        });
        this.on('undoVelocity', (o, x, y) => {
            if (undoVelocity.indexOf(o) == -1)
                undoVelocity.push({
                    object: o,
                    x: x,
                    y: y
                });
        });
        this.on('collision', (object) => {
            this._collisionItems.push(object);
            object.once('remove', () => {
				if(this._collisionItems.indexOf(object)!=-1)
                this._collisionItems.splice(this._collisionItems.indexOf(object), 1);
            });
        });
        this.on('rmCollision', (object) => {
            this._collisionItems.splice(this._collisionItems.indexOf(object), 1);
        });

        let lastTick = Date.now();
        this.loop=setInterval(() => {
            //Calculate delta
            const currentTicket=Date.now();
            let delta=(currentTicket-lastTick)/1000;
            lastTick=currentTicket;

            if (settings.debug && delta > 0.05) {
                console.log("Time(normal " + Math.floor(1 / settings.speed*100)/100 + ")", delta);
            }

            if(delta > 0.05){
                delta=0.05;
            }
            
            this._velocityItems.forEach((entity) => {
                entity.dx = entity.velocity.x * delta;
                entity.dy = entity.velocity.y * delta;
                if(entity.dx!=0||entity.dy!=0){
                    entity.setPosition(entity.polygon.pos.x + entity.dx, entity.polygon.pos.y + entity.dy);
                    entity.emit('velocity', entity.dx, entity.dy);
                    for (var x of entity.attachE) {
                        x.setPosition(x.polygon.pos.x + entity.dx, x.polygon.pos.y + entity.dy);
                    }
                }
            });

            this._collisionItems.forEach((entity) => {
                // Check collision
                const overlapping = entity.collideWith();
                if(overlapping.length>0)
                entity.emit('collide', overlapping);
            });

            undoVelocity.forEach((entity) => {
                let newX = entity.object.polygon.pos.x;
                let newY = entity.object.polygon.pos.y;
                if (entity.x)
                    newX -= entity.object.dx;
                if (entity.y)
                    newY -= entity.object.dy;
                entity.object.setPosition(newX, newY);
                for (let x of entity.object.attachE) {
                    x.setPosition(x.polygon.pos.x - entity.object.dx, x.polygon.pos.y - entity.object.dy);
                }
            });
            undoVelocity = [];
            this.emit('nextFrame');
        }, Math.floor(1000 / settings.speed/10)*10);
        if(cb)
    		cb(settings, this._socket);
    }
    constructor.prototype.stop=function(){
        clearInterval(this.loop);
        this._socket.close();
    }
    Object.assign(constructor.prototype, EventEmitter.prototype);
    Object.assign(constructor, {
        GameMap,
        Entity
    });
    module.exports = constructor;
})();