const assert = require('assert');
const { resolve } = require('path');
const sword = require('../sword.js');


describe('Entity', function () {

  describe('setPosition', function () {

    it('set position should change polygon pos', function () {
      const obj=new sword.Entity(1,1);
      obj.setPosition(1,2);
      assert.equal(obj.polygon.pos.x,1);
      assert.equal(obj.polygon.pos.y,2);
    });

  });

  describe('collideWith', function () {

    it('should work with circle polygon', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change size
      obj.box(1,1);
      obj2.circle(1);
      assert.equal(TestMap.find(obj).length, 1);
      obj2.setPosition(100,100)
      assert.equal(TestMap.find(obj).length, 0);
      obj.box(101,101)
      assert.equal(TestMap.find(obj2).length, 1);
      obj.circle(5)
      assert.equal(TestMap.find(obj2).length, 0);
    });

  });

  describe('collideWith', function () {

    it('should work with circle polygon', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change size
      obj.box(1,1);
      obj2.box(1,10);
      obj2.setPosition(1,9);
      assert.equal(TestMap.find(obj).length, 0);
      obj.setOrigin(0,0)
      assert.equal(TestMap.find(obj).length, 1);
    });

  });
});


/* Test the GameMap Class */
describe('GameMap', function () {

  describe('insert', function () {

    it('should be able to detect nearby object after inserting', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);
      //Detect nearby
      assert.equal(TestMap.find(obj).length, 1);
    });

    it('e destroy', function () {
      const TestMap=new sword.GameMap();
      const obj=TestMap.e(sword.Entity,1,1);
      //Detect nearby
      assert.equal(obj.map, TestMap);
    });
  });

  describe('find box circle', function () {


    it('should be able to detect nearby object after changing position', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change location
      obj.setPosition(1,0);
      assert.equal(TestMap.find(obj).length, 0);
    });

    it('should be able to detect nearby object after changing size', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change location
      obj.setPosition(1,0);
      assert.equal(TestMap.find(obj).length, 0);

      //Change size
      obj2.size(2,1);
      assert.equal(TestMap.find(obj).length, 1);
    });

    it('should be able to detect nearby object after changing box size', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change location
      obj.setPosition(1,0);
      assert.equal(TestMap.find(obj).length, 0);

      //Change size
      obj2.box(2,1);
      assert.equal(TestMap.find(obj).length, 1);
    });

    it('should be able to detect nearby object after changing circle size', function () {
      const TestMap=new sword.GameMap();
      const obj=new sword.Entity(1,1);
      const obj2=new sword.Entity(1,1);
      TestMap.insert(obj);
      TestMap.insert(obj2);

      //Change location
      obj.setPosition(1,0);
      assert.equal(TestMap.find(obj).length, 0);

      //Change size
      obj2.circle(2,1);
      assert.equal(TestMap.find(obj).length, 1);
    });
  });
});

/* Test the GameMap Class */
describe('Sword', function () {
  it('collide should trigger', function (done) {
    const Sword= new sword();
    const TestMap=new sword.GameMap();
    const obj=new sword.Entity(1,1);
    obj.box(1,1);

    const obj2=new sword.Entity(1,1);
    obj2.box(1,1);
    
    TestMap.insert(obj);
    TestMap.insert(obj2);

    Sword.emit('collision',obj);
    Sword.emit('collision',obj2);
    //Change size
    obj2.circle(2,1);
    assert.equal(TestMap.find(obj).length, 1);
    
    obj2.once("collide",function(){
      Sword.stop();
      done()
    })
  });

  it('velocity should trigger', function (done) {
    const Sword= new sword();
    const TestMap=new sword.GameMap();
    const obj=new sword.Entity(1,1);
    Sword.emit('velocity',obj);
    obj.box(1,1);
    obj.setVelocity(1,1);

    obj.once("velocity",function(){
      Sword.stop();
      done()
    })
  });

  it('objects that emit undoVelocity return to original location', function (done) {
    const Sword= new sword();
    const TestMap=new sword.GameMap();
    const obj=new sword.Entity(1,1);
    Sword.emit('velocity',obj);
    obj.box(1,1);
    obj.setVelocity(1,3);
    obj.once("velocity",function(dx,dy){
      assert.equal(obj.polygon.pos.x,dx);
      assert.equal(obj.polygon.pos.y,dy);
      Sword.emit('undoVelocity', obj, true, true);
      Sword.once("nextFrame",function(){
        assert.equal(obj.polygon.pos.x,0);
        assert.equal(obj.polygon.pos.y,0);
        Sword.stop()
        done()
      })
    });
  });

  it('should not move after removing velocity', function (done) {
    const Sword= new sword();
    const TestMap=new sword.GameMap();
    const obj=new sword.Entity(1,1);
    Sword.emit('velocity',obj);
    
    obj.setVelocity(1,3);
    Sword.emit('rmVelocity',obj);
    obj.box(1,1);
    setTimeout(function(){
      assert.equal(obj.polygon.pos.x,0);
      assert.equal(obj.polygon.pos.y,0);
      Sword.stop();
      done()
    },1);
  });
});

