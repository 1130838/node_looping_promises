//Imports and global variables. 
// customize with your own url's

var Promise = require('bluebird');
// the promisify function will also make automatic sync in all that uses MongoClient. Pretty Useful
var MongoClient = Promise.promisify(require('mongodb').MongoClient);

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url_orionhistory = 'mongodb://10.10.10.202:27017/orion_history';


module.exports = {

    insertDataOnMongoDB: function (data, resolve) {
        MongoClient.connect(url_orionhistory, function (err, db) {
            assert.equal(null, err);
            db.collection('testing_data').insert(data, function (err, result) {
                assert.equal(err, null);
                console.log("Inserted requested data on database in 'testing_data' collection wih timestamp " + result.ops[0].date);
                db.close();
                resolve();
            });
        });
    }
            
};