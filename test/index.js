// mocha & chai
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var DELAY = 77; //for asnync test

var Owly = require('../src/owly.js');
// var Owly = require('../dist/owly.js');
var owly = Owly.owly;

describe('Basic Test', function() {
  describe('#subscribe()', function() {
    before(reset);
    it('owly should have property named `hungry`', function() {
      owly.subscribe('hungry', noop);
      owly._listeners.should.have.property('hungry');
    })
  });

  describe('#publish()', function() {
    before(reset);
    it('status\'s value should be change to 1 when owly.published', function() {
      var status = 0;
      owly.subscribe('hungry', function() {
        status = 1;
        status.should.equal(1);
      });
      owly.publish('hungry');
    })
  });
});

describe('Wildcard Mode', function() {
  before(reset);
  it('Basic Wildcard Mode', function() {
    var light = false;
    owly.subscribe('core.foo', function() {
      light = true;
    });
    owly.publish('core.*');
    light.should.equal(true);

    var shine = false;
    owly.subscribe('core.bar', function() {
      shine = true;
    });
    owly.publish('*.bar');
    shine.should.equal(true);
  });

  it('Random Wildcard Mode', function() {
    var bright = [];
    owly.subscribe('core.com.foo', function() {
      bright.push(+new Date());
    });
    owly.publish('core.com.*');
    owly.publish('core.*.foo');
    owly.publish('*.com.foo');
    owly.publish('*.*.*');
    owly.publish('*.com.*');
    owly.publish('*.illegal.*');
    owly.publish('*.*.*.illegal');
    bright.should.with.length(5);
  });
});

describe('Asynchronous Calls', function() {
  before(reset);
  it('Asynchronous With Publish-First', function(done) {
    var dark = false;
    owly.publish('sunset');

    setTimeout(function() {
      owly.subscribe('sunset', function() {
        dark = true;
      }, {
        cache: true
      });
      dark.should.equal(true);
      done();
    }, DELAY);
  });
});

describe('Publish-First, Then Subscribe', function() {
  before(reset);
  it('indicate\'value should change to *true* though Subscribe-Then', function() {
    var indicate = false;
    owly.publish('foo');
    owly.subscribe('foo', function() {
      indicate = true;
    }, {
      // cache: true
    });
    indicate.should.equal(true);
  });
});

describe('API #one, #all, #unsubscribe test', function() {

  describe('#one API', function() {
    before(reset);
    it('topic\'s handler should be execute 1 time and be destroyed', function() {
      var status = 0;
      owly.subscribe('jam', noop);
      owly.subscribe('hungry', function() {
        status++;
      }, {
        times: 1
      });
      var another = 0;
      owly.subscribe('hungry', function() {
        another++;
      });
      owly.publish('hungry');
      owly.publish('hungry');

      status.should.equal(1);
      another.should.equal(2);
      owly._listeners.hungry.calls.should.with.length(1);
      Object.keys(owly._listeners).length.should.equal(2);
    });
  });

  describe('#all API', function() {
    describe('Check #all API should be working as expected', function() {
      before(reset);
      it('Check #all API should be working as expected', function(done) {
        var ally = 0;
        var entirety = false;

        owly.publish('foo');
        owly.publish('bar');

        owly.all(['foo', 'bar'], function() {
          ally++;
        }, {
          cache: true //test publish-first
        });

        owly.all(['foo', 'bar'], function(foo, bar) {
          entirety = true;
        }, {
          cache: false
        });

        owly.publish('bar');
        setTimeout(function() {
          owly.publish('foo');
          entirety.should.equal(true);
          ally.should.equal(1);
          done();
        }, DELAY);
      });
    });

    describe('#all API with Arguments', function(){
      before(reset);
      it('arguments should be paired with topic', function(done) {

        owly.all(['foo', 'bar'], function(foo, bar) {
          foo.should.be.a('array').with.length(1)
          foo[0].should.be.a('object').have.property('wa').equal('n');

          bar.should.be.a('array').with.length(3)
          bar[0].should.be.a('string').equal('first');
          bar[1].should.be.a('object').have.property('ni').equal('o');
        }, {
          cache: false
        });

        owly.publish('bar', 'first', {
          ni: 'o'
        }, 'other');
        setTimeout(function() {
          owly.publish('foo', {
            wa: 'n'
          });
          done();
        }, DELAY);
      });
    });
  });

  describe('#unsubscribe API', function() {
    describe('#unsubscribe with no arguments', function() {
      before(reset);
      it('owly should have no prototypes', function() {
        owly.subscribe('exe', function() {});
        owly.subscribe('foo', function() {});
        owly.subscribe('bar', function() {});
        assert.equal(3, Object.keys(owly._listeners).length);
        owly.unsubscribe();
        assert.equal(0, Object.keys(owly._listeners).length);
      })
    });

    describe('#unsubscribe with one argument', function() {
      before(reset);
      it('owly should have two prototypes', function() {
        owly.subscribe('exe', function() {});
        owly.subscribe('foo', function() {});
        owly.subscribe('bar', function() {});
        assert.equal(3, Object.keys(owly._listeners).length);
        owly.unsubscribe('bar');
        assert.equal(2, Object.keys(owly._listeners).length);
      })
    });

    describe('#unsubscribe with two argument', function() {
      before(reset);
      it('foo topic should have one listener', function() {
        owly.subscribe('foo', bounce);
        owly.subscribe('foo', noop);
        Object.keys(owly._listeners.foo.calls).length.should.equal(2)
        owly.unsubscribe('foo', bounce);
        Object.keys(owly._listeners.foo.calls).length.should.equal(1)
      });
    });

    describe('subscribe, publish and unsubscribe', function() {
      before(reset);
      it('variable age should increase to 19, and no longer increase', function() {
        var age = 18;
        var growing = function() {
          age++;
        };
        owly.subscribe('grow', growing);
        owly.publish('grow');
        age.should.equal(19);
        owly.unsubscribe('grow', growing);
        owly.publish('grow');
        age.should.equal(19);
      });
    });
  });
});


describe('Handler With Arguments', function() {

  describe('Publish with Data', function() {
    before(reset);
    it('Check Passed Data should be correct', function() {
      var status = 0;
      owly.subscribe('hungry', function(data) {
        data.should.be.a('object').have.property('nickname').equal('y');
      });
      owly.publish('hungry', {
        nickname: 'y'
      });
    });
  });

  describe('Subscribe with Config.context', function() {
    before(reset);
    it('Check Subscribe with Config.context property', function() {
      var o = {
        nickname: 'y'
      };
      owly.subscribe('hungry', function() {
        this.should.have.property('nickname').equal('y');
        Object.keys(this).length.should.equal(1)
      }, {
        context: o
      });
      owly.publish('hungry');
    });
  });

})

describe('API Calls with Wrong Type of Arguments', function() {

  var types = [null, undefined, 'string', [1], {
      foo: 'bar'
    },
    function() {}
  ];

  describe('#subscribe', function() {
    before(reset);
    it('throw error when execute with wrong type of argument', function() {
      var topic_types = types.slice(0);
      topic_types.splice(2, 1);
      topic_types.forEach(function(item) {
        expect(function() {
          owly.subscribe(item, noop);
        }).to.throw(Error);
      });

      var handler_types = types.slice(0);
      handler_types.splice(5, 1);
      handler_types.forEach(function(item) {
        expect(function() {
          owly.subscribe('o', item);
        }).to.throw(Error);
      });

      expect(function() {
        owly.subscribe('string', noop)
      }).to.not.throw(Error);
    });
  });

  describe('#publish', function() {
    before(reset);
    it('throw error when execute with wrong type of argument', function() {

      expect(function() {
        owly.publish({});
      }).to.throw(Error);

      expect(function() {
        owly.publish('string');
      }).to.not.throw(Error);
    });
  });

  describe('#all', function() {
    before(reset);
    it('throw error when execute with wrong type of argument', function() {

      expect(function() {
        owly.all('error');
      }).to.throw(Error);

      expect(function() {
        owly.all(['ok'], {
          error: ''
        });
      }).to.throw(Error);

      expect(function() {
        owly.all(['bingo'], noop);
      }).to.not.throw(Error);
    });
  });

  describe('#unsubscribe', function() {
    before(reset);
    it('throw error when execute with wrong type of argument', function() {

      expect(function() {
        owly.unsubscribe();
      }).to.not.throw(Error);

      expect(function() {
        owly.unsubscribe('foo');
      }).to.not.throw(Error);

      expect(function() {
        owly.unsubscribe({
          error: ''
        }, noop);
      }).to.throw(Error);
    });
  });
});

describe('Execute with Inner Detail', function() {

  describe('Runtime Details', function() {
    before(reset);
    it('Inspect The Value of `execed` after #publish', function(done) {
      owly.subscribe('self.thirsty', noop);
      expect(owly._listeners['self.thirsty'].execed).to.equal(0);
      owly.publish('self.thirsty');
      expect(owly._listeners['self.thirsty'].execed).to.equal(1);
      setTimeout(function() {
        owly.publish('self.*');
        expect(owly._listeners['self.thirsty'].execed).to.equal(2);
        owly.subscribe('self.happy', noop, {
          cache: true
        });
        expect(owly._listeners['self.happy'].execed).to.equal(1);
        done();
      }, DELAY);
    });
  });
});


//  helper
function reset() {
  owly.unsubscribe();
}

function noop() {}

function bounce() {
  console.log('bounce')
}

/**
example from http://chaijs.com/guide/styles/ 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.length(3);
expect(beverages).to.have.property('tea').with.length(3);
**/