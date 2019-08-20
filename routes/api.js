/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      // Get json from Url
      var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
      var getJSON = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
          var status = xhr.status;
          if (status === 200) {
            callback(null, xhr.responseText);
          } else {
            callback(status, xhr.responseText);
          }
        };
        xhr.send();
      };
      // Function ends here
    
      if (!Array.isArray(req.query.stock)) {
        const ticker = req.query['stock'];
        let externAPI = `https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=pk_e714f7550a52425a8a4a1394c5ddd830`;
        
        let likeExist = false;
        if (Object.keys(req.query).includes('like')) {
          likeExist = true;
        }
        if (likeExist) {
          var fullip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          let myregex = /^[0-9\.]+/g;
          let ip = fullip.match(myregex).toString();
          MongoClient.connect(CONNECTION_STRING, (err, db) => {
            db.collection('likeip').find({'ip': ip}).toArray((err, data) => {
              if (err) return;
              db.collection('likeip').update({'symbol': ticker}, {$addToSet: {'ip': ip}}, {upsert: true});
            });
          });
        }
        
        getJSON(externAPI, (err, datatext) => {
          if (err) return res.send("error reading data");
          const data = JSON.parse(datatext);
          MongoClient.connect(CONNECTION_STRING, (err, db) => {
            db.collection('likeip').find({symbol: ticker}).toArray((err, doc) => {
              console.log(doc);
              const newObj = {
                stockData: {
                  stock: data.symbol,
                  price: data.latestPrice,
                  likes: doc.length == 1 ? doc[0].ip.length : 0,
                }
              }
              return res.json(newObj);
            });
          });
        });
      }
      else if (req.query.stock.length == 2) {
        const ticker1 = req.query['stock'][0];
        const ticker2 = req.query['stock'][1];
        
        let likeExist = false;
        if (Object.keys(req.query).includes('like')) {
          likeExist = true;
        }
        if (likeExist) {
          var fullip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          let myregex = /^[0-9\.]+/g;
          let ip = fullip.match(myregex).toString();
          MongoClient.connect(CONNECTION_STRING, (err, db) => {
            db.collection('likeip').find({'ip': ip}).toArray((err, data) => {
              if (err) return;
              db.collection('likeip').update({'symbol': ticker1}, {$addToSet: {'ip': ip}}, {upsert: true});
              db.collection('likeip').update({'symbol': ticker2}, {$addToSet: {'ip': ip}}, {upsert: true});
            });
          });
        }
        
        let externAPI1 = `https://cloud.iexapis.com/stable/stock/${ticker1}/quote?token=pk_e714f7550a52425a8a4a1394c5ddd830`;
        let externAPI2 = `https://cloud.iexapis.com/stable/stock/${ticker2}/quote?token=pk_e714f7550a52425a8a4a1394c5ddd830`;
        getJSON(externAPI1, (err, datatext) => {
          if (err) return res.send("error reading data");
          getJSON(externAPI2, (err2, datatext2) => {
            const data = JSON.parse(datatext);
            const data2 = JSON.parse(datatext2);
            MongoClient.connect(CONNECTION_STRING, (err, db) => {
              db.collection('likeip').find({symbol: ticker1}).toArray((err, doc) => {
                db.collection('likeip').find({symbol: ticker2}).toArray((err, doc2) => {
                  let likes1 = doc.length == 1 ? doc[0].ip.length : 0;
                  let likes2 = doc2.length == 1 ? doc2[0].ip.length : 0;
                  const newObj = {
                    stockData: [{
                      stock: data.symbol || '',
                      price: data.latestPrice || '',
                      rel_likes: likes1 - likes2,
                    }, {
                      stock: data2.symbol || "",
                      price: data2.latestPrice || '',
                      rel_likes: likes2 - likes1,
                    }]
                  }
                  return res.json(newObj);
                });
              });
            });

          });
        });
      } else {
        return res.send("too many/little tickers provided");
      }

      
    });
    
};
