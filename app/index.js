/**
 * This example show how to make http requests in node in an ordered way.
 * Due to the async behaviour of nodeJS its tricky to keep on track multiple sequential requests.
 * With this pattern you can sync the requests even with while loops. Meaning that
 * the second function will only begin when the while cycle of the fist function ends all requests.
 * In this example, after fetching all desired data, that same data is saved in mongoDB
 */

var repository = require('../repository');
var Promise = require('bluebird');
var async = require('async');
var request = require("request");
var soap = require('soap');


// major function to run in this example
majorFunctionForSyncMultipleAsyncRequestsAndInsertInMongoDB();


// note : not async way - you should never do this !
// it will saved data in a uncontrolled way ! ( example 1,3,5,2,4 )
// and you want 1,2,3,4,5 right ? So, follow this pattern and you will control the work flow
function loopForInsertInMongoDB() {
    for (var i = 0; i < 5; i++) {
        insertOnMongoDB(i);
    }
}

// Asynchronous ordered way : Do this way
function majorFunctionForSyncMultipleAsyncRequestsAndInsertInMongoDB() {

    /* U S A G E -------------------------------------------------------------------*/

    doingSomethingFirstFunction()
        .then(function () { return firstFunction()
            .then(function () {return secondFunction()
                    .then(function () {return thirdFunction()
                            .then(function () {return fourthFunction()
                            })
                    })
            })
    });


    /* F U N C T I O N S  : ---------------------------------------------------------*/


    function doingSomethingFirstFunction() {
        return new Promise(function (resolve) {
            console.log('> Hi! this is an example how you can control the flow of multiple http or soap requests ');
            console.log("in this function you can prepare some ground for whats coming ");
            resolve();
        });
    }


    function firstFunction() {

        return new Promise(function (resolve) {

            console.log('');
            console.log('> hello! im first function ! This will make 1 http request of the Iceland hospital today baby births ');

            // you pass the resolve through parameter so it can be called when function 'first_http_request' finishes.
            // this way you have sure that secondFunction will only be executed when the firstFunction finishes
            first_http_request(resolve);

        })
    }


    function first_http_request(resolve) {

        var url = 'http://apis.is/hospital';

        request(url, function (error, response, body) {

            var response = JSON.parse(body); // important fucking line..
            var hospital_array = response.results;
            var documentToSaveInMongo = [];

            //  console.log('response.results.length = ' + response.results.length);

            for (var k = 0; k < hospital_array.length; k++) {
                var object = {
                    birthNumbers: ''
                };

                console.log('[index.js] birthNumbers =  ' + hospital_array[k].birthNumbers);
                object.birthNumbers = hospital_array[k].birthNumbers;
                documentToSaveInMongo.push(object);

                // uncomment to save the data in mongoDB through repository.js layer
                // insertOnMongoDB(documentToSaveInMongo);

            }
            console.log('first function done !');
            resolve();
        });

    }


    // function with while http requests loop
    function secondFunction() {

        return new Promise(function (resolve) {

            console.log('');
            console.log('> hello im second function ! This will make loop of 4 http requests for a random name ');
            var stop = 4;
            var current = 0;

            async.whilst(
                function () {
                    return current < stop;
                },
                function (callback) {

                    console.log('request nº ' + current);

                    // put the callback as parameter here, so when makeSecondHttpRequest is finish callback() can be called and make one more iteration in loop.
                    var random_user_name = makeSecondHttpRequest(callback); 

                    // uncomment to save the data in mongoDB through repository.js layer
                    // insertOnMongoDB(random_user_name);
                    
                    current++;
                },
                function () {
                    console.log('second function done ! Now im ready for the next one !');
                    resolve(); // this will be executed after the cycle - its like saying " the progress bar is complete "

                },
                function (err) {
                    console.log('something went wrong..');
                }
            )

        })

    }


    function makeSecondHttpRequest(callback) {

        return new Promise(function (resolve) {

            var url = 'http://api.randomuser.me/';

            request(url, function (error, response, body) {

                var response = JSON.parse(body); // important fucking line..
                var random_user_array = response.results;
                var random_user_name;

                for (var k = 0; k < random_user_array.length; k++) {
                    random_user_name = random_user_array[k].name.first + ' ' + random_user_array[k].name.last;
                    console.log('random name =  ' + random_user_name);
                }

                // this callback is called after each iteration so it can sync the process with the async.whilst
                callback();
                resolve(response);
                
                return random_user_name;

            });

        });

    }


    function thirdFunction() {

        return new Promise(function (resolve) {

            console.log('');
            console.log('> hello im third function ! This example will make 5 loop http requests for a random number ');

            var current = 0;
            var stop = 5;

            async.whilst(
                function () {
                    return current < stop;
                },
                function (callback) {

                    console.log('request nº ' + current);

                    // put the callback as parameter here, so when makeSecondHttpRequest is finish callback() can be called and make one more iteration in loop.
                    var documentToSaveInMongo = makeThirdHttpRequest(callback); 

                    // uncomment to save the data in mongoDB through repository.js layer
                    // insertOnMongoDB(documentToSaveInMongo);
                    
                    current++;

                },
                function () {
                    console.log('function three done !! give me more functions ! ');
                    resolve(); // this will be executed after the cycle - its like saying " the progress bar is complete "

                },
                function (err) {
                    console.log('something went wrong..');
                }
            )

        })


    }


    function makeThirdHttpRequest(callback) {

        return new Promise(function (resolve) {

            var url = 'https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8';

            request(url, function (error, response, body) {

                var response = JSON.parse(body); // parsing to readable JSON
                var random_number_array = response;
                var documentToSaveInMongo = [];

                for (var k = 0; k < random_number_array.length; k++) {

                    var object = {
                        random_number: ''
                    };

                    console.log('random number =  ' + random_number_array.data);
                    object.random_number = random_number_array.data;
                    documentToSaveInMongo.push(object);

                }

                // this callback is called after each iteration so it can sync the process with the async.whilst
                callback();
                resolve(response);

               return documentToSaveInMongo;
                
            });

        });

    }


    function fourthFunction() {
        return new Promise(function (resolve) {
            console.log('');
            console.log('> Hi! i am fourth function ! This just  to demonstrate that you can chain as many requests as you want !');
            console.log("This should be last line.. bye..see you next time ! ");
            resolve();
        });
    }


    function insertOnMongoDB(some_data) {
        var data = {
            date : new Date(),
            things: some_data
        };
        repository.insertDataOnMongoDB(data);
    }


}


