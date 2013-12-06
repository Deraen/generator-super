var chai = require('chai');
var should = chai.should();

describe('test', function() {
  it('should test something', function() {
    [1, 2, 3].should.deep.equal([1, 2, 3]);
  });
});
