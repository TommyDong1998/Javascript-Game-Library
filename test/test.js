const assert = require('assert');
const sword = require('../sword.js');
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
    });

  });


});