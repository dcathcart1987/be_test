let chalk = require('chalk');
let request = require('request');
let config = require('./config.json');

console.log('Welcome to the ticket reservation system GUI!');

activities = [
    { name: '--seats', action: getAvailableSeats },
    { name: '--best', action: seeBestSeats, arg1: process.argv[3] },
    { name: '--holdBest', action: holdBestSeats, arg1: process.argv[3], arg2: process.argv[4] },
    { name: '--reserve', action: reserveHeldSeats, arg1: process.argv[3] },
    { name: '--held', action: seeHeldSeats, arg1: process.argv[3] },
    { name: '--reserved', action: seeReservedSeats, arg1: process.argv[3] }
];

fire(process.argv[2]);

function fire(action) {
    let act = activities.filter(fil => { return fil.name === action})[0];
    if(act !== -1) {
        let arg1 = act.arg1 ? act.arg1 : null;
        let arg2 = act.arg2 ? act.arg2 : null;
        act.action(arg1, arg2);
    }
    else {
        console.log('No such action available.')
    }
}

function getAvailableSeats() {
    request.get(config.apiUrl + '/api/v1/seats/available',null,
        (error, body) => {
            let obj = JSON.parse(body.body);
            console.log(obj.totalAvailable + ' seats available.');
            for (let i of obj.availableSeats) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber);
            }
        }
    );
}

function seeBestSeats(n) {
    request.get(config.apiUrl + '/api/v1/seats/best?n=' + n,null,
        (error, body) => {
            let obj = JSON.parse(body.body);
            if (obj.bestSeats.length === 0) {
                console.log(obj.message);
                return;
            }
            for (let i of obj.bestSeats) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber);
            }
        }
    );
}

function holdBestSeats(email, number) {
    let reqBody = { email: email, number: parseInt(number) };
    request.post(config.apiUrl + '/api/v1/seats/holdTheBest', { body: JSON.stringify(reqBody), headers: { 'Content-Type':'application/json'} },
        (error, resp, body) => {
            let obj = JSON.parse(body);
            if(!obj.seatsHeld) {
                console.error(chalk.red('Unable to hold best seats.'));
                return;
            }

            console.log(obj.seatsHeld.length + ' seats held for ' + obj.requester);

            for (let i of obj.seatsHeld) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber + ' ; HeldFor: ' + i.heldBy);
            }
        }
    );
}

function reserveHeldSeats(email) {
    let reqBody = { email: email };
    request.post(config.apiUrl + '/api/v1/seats/reserve', { body: JSON.stringify(reqBody), headers: { 'Content-Type':'application/json'}},
        (error, resp, body) => {
            let obj = JSON.parse(body);

            if(!obj.reservedSeats) {
                console.error(chalk.red('Unable to reserve seats.'));
                return;
            }

            console.log(obj.reservedSeats.length + ' seats reserved for ' + obj.requester);

            for (let i of obj.reservedSeats) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber + ' ; HeldFor: ' + i.heldBy);
            }
        }
    );
}

function seeHeldSeats(email) {
    let reqBody = { email: email };
    request.post(config.apiUrl + '/api/v1/seats/held',  { body: JSON.stringify(reqBody), headers: { 'Content-Type':'application/json'} },
        (error, resp,body) => {
            let obj = JSON.parse(body);

            if(!obj.reservedSeats) {
                console.error(chalk.red('Unable to get held seats.'));
                return;
            }

            console.log(obj.reservedSeats.length + ' seats held for ' + obj.requester);

            for (let i of obj.reservedSeats) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber + ' ; HeldFor: ' + i.heldBy);
            }
        }
    );
}

function seeReservedSeats(email) {
    let reqBody = { email: email };
    request.post(config.apiUrl + '/api/v1/seats/reserved',  { body: JSON.stringify(reqBody), headers: { 'Content-Type':'application/json'} },
        (error, resp,body) => {
            let obj = JSON.parse(body);

            if(!obj.reservedSeats) {
                console.error(chalk.red('Unable to get reserved seats.'));
                return;
            }

            console.log(obj.reservedSeats.length + ' seats reserved for ' + obj.requester);

            for (let i of obj.reservedSeats) {
                console.log('SeatID: ' + i.seatid + ' ; Row: ' + i.row + ' ; SeatNumber: ' + i.seatNumber + ' ; ReservedFor: ' + i.heldBy);
            }
        }
    );
}