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
    
    let success=false;
    obj2.once("collide",function(){
      success=true;
      Sword.stop();
      done()
    })
  });
});

