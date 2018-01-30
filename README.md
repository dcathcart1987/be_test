# Node.js RESTful web API challenge

Implements a simple ticket service that facilitates the discovery, temporary hold, and final reservation of seats within a high-demand performance venue. It contains the following endpoints:

* GET http://localhost:3300/api/v1/seats/available - Find the current number of seats available within the venue. Note: available seats are seats that are neither held nor reserved. Returns a JSON  object containing an array of available seats.
* POST http://localhost:3300/api/v1/seats/holdTheBest - Find and hold the best available seats on behalf of a customer. The best available seats will be the ones next to each other horizontally and closest to the front. If no seats are available together, the response contains a message to this effect and status 400 is returned. Note: Once held, each ticket will expire back to available status within 30 seconds if not reserved. Returns a JSON object with an array of heldSeats.
* POST http://localhost:3300/api/v1/seats/reserve - Reserve the specific group of held seats for the customer’s email address (tickets must be held before reserved). Returns a JSON object with an array of reserved seats.
* GET,POST http://localhost:3300/api/v1/seats/best - See best seats available for party size specified in the query string "n" parameter. Example request is http://localhost:3300/api/v1/seats/best?n=2

NOTES:

The project architecture is as follows:

server.js - This is the standard node.js entry point.
package.json - Standard node architecture
config.json - Contains configurable data for the DataModel.js file.
--api
    --Controllers
        TicketController.js - Contains controllers for API routes. Relays data requests to DataModel methods.
    --Routes
        TicketRoutes.js - Contains web API route configurations and verb mapping
    --DataModel
        DataModel.js - Contains all logic to talking to data source
--data - Contains data.json file with venue data
--test
    apiTests.js - Contains mocha and chai tests for the web API endpoints

Something to note, one question regarding API architecture is where to store business logic. E.g. should you place it in the controllers, data repository calls, etc. For ease of development, this example placed all the logic in the DataModel.js file. There are merits and detriments to either architectural style. My personal preference, if, say, this project is using an ORM to talk to an external database would be to place any non-db related logic somewhere other than the data access repository. It would be best, in a multi developer environment, to discuss this architecture and decide as a group the proper path.

This is a basic web API with limited functionality. The data source is a JSON file referenced in a subfolder. Changes are written to that file. Ideally, data would be in a more robust storage mechanism (e.g. mongo, relational database). As this data is located in a file, tracking changes would require essentially creating psuedo-db architecture; thus, tests were made on this data as if it were a basic seed data set.

## Getting Started

Copy entire file directory to your local environment.

### Prerequisites

Node and NPM latest versions available at https://nodejs.org/en/.

### Installing

Here is a step by step series of examples that tell you how to get a development environment running...

Open a terminal and navigate to the directory of the package.json file. Install package.json items.

```
npm install
```

Start project using npm start script.

```
npm start
```

You should receive the following message once start is successful.

```
Ticket Reservation RESTful API server started on: 3300
```

To utilize, you can open a separate terminal and send cURL requests (NOTE: you must have curl installed to perform the below). 

```
curl -X POST \
  http://localhost:3300/api/v1/seats/reserved \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 596071a9-60ec-3dda-3793-a5982ffc0896' \
  -d '{
	"email":"your@email.com"
}'
```
Or create and send HTTP requests in Postman.

## GUI

A small limited-feature Command Line GUI is available. With the API running on port 3300, open a second terminal and navigate to the folder of the package.json file. The GUI source code is in the gui.js file.

To see available seats:

```
node gui.js --seats
```

To see best seats:

```
node gui.js --best 1
```

To hold best seats:

```
node gui.js --holdBest my@email.address 1
```

To reserve held seats:

```
node gui.js --reserve my@email.address
```

To see reserved seats:

```
node gui.js --reserved my@email.address
```

To see held seats:

```
node gui.js --held my@email.address
```

NOTE: Seats that are held will automatically revert to not held in 60 seconds; however, fear not, reserved seats will remain reserved.

## Running the tests

```
npm test
```
## Authors

* **Dan Cathcart**