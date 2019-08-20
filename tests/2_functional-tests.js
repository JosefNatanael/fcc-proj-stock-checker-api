/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .set('X-Forwarded-For', '192.168.2.1')
        .end(function(err, res){
          assert.equal(res.status, 200)
          console.log(res);
          done();
        });     

      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .set('X-Forwarded-For', '192.168.2.1')
        .end(function(err, res){
          assert.equal(res.status, 200)
          console.log(res);
          done();
        });    
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .set('X-Forwarded-For', '192.168.2.1')
        .end(function(err, res){
          assert.equal(res.status, 200)
          console.log(res);
          done();
        });    
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .set('X-Forwarded-For', '192.168.2.1')
        .end(function(err, res){
          assert.equal(res.status, 200)
          console.log(res);
          done();
        });    
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .set('X-Forwarded-For', '192.168.2.1')
        .end(function(err, res){
          assert.equal(res.status, 200)
          console.log(res);
          done();
        });    
      });
      
    });

});
