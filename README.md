# node_looping_promises_template
by Bruno Devesa

This example show how to make multiple http requests in nodeJS in an ordered way.
Due to the async behaviour of nodeJS its tricky to keep on track multiple sequential requests.
With this pattern, you can sync the requests even with while loops. Meaning that
the second function will only begin when the while cycle of the fist function ends all requests.
In this example, after fetching all desired data, that same data can be saved in mongoDB.

note: This example works out of the box for you to test.
To save data in mongoDB, uncomment the respective lines and write your own mongo url or use localhost.

usage:
-------
to install all node_modules and append them in your package.json
> npm install --save

to run:
> node index.js
