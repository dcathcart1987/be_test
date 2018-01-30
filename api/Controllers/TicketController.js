"use strict"
let model = require('../DataModel/DataModel');
let venName = 'An Awesome Venue';
let venId = 1;
let venObj = { id: venId, name: venName };

module.exports = {

    /**Controller method to select best seats and hold them for provided email address. */
    holdBestSeats(req, res) {
        if (!req.body.email || !req.body.number ) {
            let errorObj = { error: 'Call requires email and number of seats to hold.' };
            res.status(400).send(errorObj);
            return false;
        }
        let email = req.body.email;
        let numberToHold = req.body.number;
        model.selectBestRowWithTheNumberOfOpenSeatsYouWant({ id: venId, name: venName, email: email, num: numberToHold }).then(
            resolve => {
                let seatsToHold = resolve;
                model.updateSeatsToHeld({ id: venId, name: venName, email: email, seatsToHold: seatsToHold }).then(
                    resolve => {
                        let returnObj = { requester: email, seatsHeld: resolve };
                        res.json(returnObj);
                    },
                    reject => {
                        let errorObj = { error: reject };
                        res.status(400).send(errorObj);
                    }
                );
            },
            reject => {
                let errorObj = { error: reject };
                res.status(400).send(errorObj);
            }
        );
    },
    /**Controller method to reserve held seats. */
    reserveSeats(req, res) {
        if (!req.body.email) {
            let errorObj = { error: 'Call requires email' };
            res.status(400).send(errorObj);
            return false;
        }

        let email = req.body.email;
        model.updateSeatsToReserved( { id: venId, name: venName, email: email }).then(
            resolve => {
                let returnObj = { requester: email, reservedSeats: resolve };
                res.json(returnObj);
            },
            reject => {
                let errorObj = { error: reject };
                res.status(400).send(errorObj);
            }
        )
    },
    /**Controller method to GET seats held by provided email address. */
    seeMyHeldSeats(req, res) {
        if (!req.body.email) {
            let errorObj = { error: 'Call requires email parameter'}
            res.status(400).send(errorObj);
            return false;
        }
        let email = req.body.email;
        model.selectHeldSeatsByHeldByAddress({ id: venId, name: venName, email: email }).then(
            resolve => {
                let returnObj = { requester: email, reservedSeats: resolve };
                res.json(returnObj);
            },
            reject => {
                let errorObj = { error: reject }
                res.status(400).send(errorObj);
            }
        );
    },
    /**Controller method to GET reserved seats for provided email address. */
    seeMyReservedSeats(req, res) {
        if (!req.body.email) {
            let errorObj = { error: 'Call requires email parameter'}
            res.status(400).send(errorObj);
            return false;
        }
        let email = req.body.email;
        model.selectReservedSeatsByHeldByAddress({ id: venId, name: venName, email: email }).then(
            resolve => {
                let returnObj = { requester: email, reservedSeats: resolve};
                res.json(returnObj);
            },
            reject => {
                let errorObj = { error: reject }
                res.status(400).send(errorObj);
            }
        );
    },
    /**Controller method to GET list of best available seats for number of seats provided. */
    seeBestSeats(req,res) {
        if (!req.query.n) {
            let errorObj = { error: 'You did not specify how many seats you need.'};
            res.status(400).send(errorObj);
            return false;
        }
        let num = req.query.n;
        let returnObj;
        model.selectBestRowWithTheNumberOfOpenSeatsYouWant({ id: venId, name: venName, num: num }).then(
            resolve => {
                if (resolve && resolve.length && resolve.length > 0) {
                    returnObj = { bestSeats: resolve, message: 'Found seats for you!' }
                    res.json(returnObj);
                }
                else if (resolve && resolve.length && resolve.length === 0) {
                    returnObj = { bestSeats: [], message: 'No available seats for a party that size!' }
                    res.status(400).send(returnObj);
                }
                else {
                    returnObj = { bestSeats: [], message: 'No available seats for a party that size!' }
                    res.status(400).send(returnObj);
                }
            },
            reject => {
                res.status(400).send(reject);
            }
        )
    },
    /**Controller method to GET all available seats in venue. */
    seeAvalailableSeats(req, res) {
        model.selectOpenSeats(venObj).then(
            resolve => {
                let returnObj = { totalAvailable: resolve.length, availableSeats: resolve }
                res.json(returnObj);
            },
            reject => {
                res.status(400).send(reject);
            }
        );
    }

}