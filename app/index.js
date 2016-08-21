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

// global variable to store all promises results. Global variables should be used when they are useful in global scope. 
var promisesResults = [];

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

    /* U S A G E --------------------------------------------------------------*/

    Promise.resolve(doingSomethingFirstFunction)
        .then(firstFunction)
        .then(secondFunction)
        .then(thirdFunction)
        .then(fourthFunction)
        .error(function (err) {
            console.log('error handler' + err);
        })
        .catch(function (err) {
            console.log('Catch handler ' + err);

        });
}


/* F U N C T I O N S  : ----------------------------------------------------*/

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
        console.log('> hello! im first function ! This will make one http request for the Iceland hospital today\'s baby births ');

        // you pass the resolve through parameter so it can be called when function 'first_http_request' finishes.
        // this way you have sure that secondFunction will only be executed when the firstFunction finishes
        first_http_request(resolve);

    })
}


function first_http_request(resolve) {

    // note: to make a post, just use this sintax (the form is the arguments of the post ): 
    // request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ })

    var url = 'http://apis.is/hospital';

    request.get(url, function (error, response, body) {

        var response = JSON.parse(body); // important fucking line..
        var hospital_array = response.results;
        var data_temp = [];

        //  console.log('response.results.length = ' + response.results.length);

        for (var k = 0; k < hospital_array.length; k++) {
            var object = {
                birthNumbers: ''
            };

            console.log('birthNumbers today = ' + hospital_array[k].birthNumbers + ' new babys !');
            object.birthNumbers = hospital_array[k].birthNumbers;
            data_temp.push(object);

            // uncomment and comment the resolve() line to save the data in mongoDB through repository.js layer
            //insertOnMongoDB(data_temp, resolve); // the resolve goes into this method so it will only go to the next function after its saved in DB

            promisesResults.push(data_temp);

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
        var request_results_array = []; // this is a variable that will store the response request and i will need later

        async.whilst(
            function () {
                return current < stop;
            },
            function (callback) {

                console.log('request nº ' + current);

                // put the callback as parameter here, so when makeSecondHttpRequest is finish callback() can be called and make one more iteration in loop.
                makeSecondHttpRequest(request_results_array, callback);

                current++;
            },
            function () {

                // save data in the promisesResults global variable
                promisesResults.push(request_results_array);

                // uncomment and comment the resolve() line to save the data in mongoDB through repository.js layer
                //insertOnMongoDB(request_results_array, resolve);

                console.log('second function done ! Now im ready for the next one !');
                resolve(); // this will be executed after the cycle - its like saying " the progress bar is complete "

            },
            function (err) {
                console.log('something went wrong..');
            }
        )

    })

}


function makeSecondHttpRequest(all_random_names_array, callback) {

    return new Promise(function (resolve) {

        var url = 'http://api.randomuser.me/';

        request.get(url, function (error, response, body) {

            var response = JSON.parse(body); // important fucking line..
            var response_array = response.results;

            for (var k = 0; k < response_array.length; k++) {

                var random_name = response_array[k].name.first + ' ' + response_array[k].name.last;
                console.log('random name : ' + random_name);


                var object = {
                    random_name: ''
                };

                object.random_name = response_array[k].name.first + ' ' + response_array[k].name.last;
                all_random_names_array.push(object);

            }

            // this callback is called after each iteration so it can sync the process with the async.whilst
            callback();

            resolve();

        });

    });

}


function thirdFunction() {

    return new Promise(function (resolve) {

        console.log('');
        console.log('> hello im third function ! This example will make 5 loop http requests for a random number ');

        var current = 0;
        var stop = 5;
        var all_random_number_array = [];

        async.whilst(
            function () {
                return current < stop;
            },
            function (callback) {

                console.log('request nº ' + current);

                // put the callback as parameter here, so when makeSecondHttpRequest is finish callback() can be called and make one more iteration in loop.
                makeThirdHttpRequest(all_random_number_array, callback);

                current++;

            },
            function () {

                promisesResults.push(all_random_number_array);

                // uncomment and comment the resolve() line to save the data in mongoDB through repository.js layer
                // insertOnMongoDB(all_random_number_array, resolve);

                console.log('| Hey ! Just to remind you that i have access to all the previous promises results !! ( yes, many many times are needed )');
                console.log('| here is an example : the first random name was : ' + promisesResults[1][0].random_name + ' and baby\'s born were :' + promisesResults[0][0].birthNumbers);
                console.log('function three done !! give me more functions ! ');

                resolve(); // this will be executed after the cycle - its like saying " the progress bar is complete "

            },
            function (err) {
                console.log('something went wrong..look at this : ' + err);
            }
        )

    })

}


function makeThirdHttpRequest(all_random_number_array, callback) {

    return new Promise(function (resolve) {

        var url = 'https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8';

        request.get(url, function (error, response, body) {

            var response = JSON.parse(body); // parsing to readable JSON
            var random_number_array = response;

            for (var k = 0; k < random_number_array.length; k++) {

                var object = {
                    random_number: ''
                };

                console.log('random number =  ' + random_number_array.data);
                object.random_number = random_number_array.data;
                all_random_number_array.push(object.random_number);

            }

            // this callback is called after each iteration so it can sync the process with the async.whilst
            callback();

            resolve();

        });

    });

}


function fourthFunction() {
    return new Promise(function (resolve) {
        console.log('');
        console.log('> Hi! i am fourth function ! This just  to demonstrate that you can chain as many requests as you want !');

        console.log('All promises results were kept in a global variable for use anywhere, anytime between promises :');
        console.log('promisesResults.length = ' + promisesResults.length);

        console.log("This should be last line.. bye..see you next time ! ");
        resolve();
    });
}


function insertOnMongoDB(some_data, resolve) {
    var data = {
        date: new Date(),
        things: some_data
    };
    repository.insertDataOnMongoDB(data, resolve);
}





