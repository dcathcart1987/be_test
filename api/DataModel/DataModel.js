const Promise = require('bluebird');
const fs = require('fs');
const EventEmitter = require('events');
const config = require('../../config.json');

const holdTimeoutEmitter = new EventEmitter();
holdTimeoutEmitter.on('seatHeld',
    (venueId, seat) => {
        setTimeout(
            () => {
                let data = require('../../data/data.json');
                console.log(data.venues[venueId - 1].seats[data.venues[venueId - 1].seats.indexOf(seat)])
                data.venues[venueId - 1].seats[data.venues[venueId - 1].seats.indexOf(seat)].held = false;
                fs.writeFile('./data/data.json', JSON.stringify(data), (err) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log('Guest waited too long! Seat '+ seat.seatid +' removed from held list.');
                    }
                })
            },
            config.holdTimeout
        );
    }
);

module.exports = {
    /**
     * Retrieves number of open seats from a given venue.
     * @param {{ id:number, name: string }} options Requires id or name parameter corresponding to venue name or venue id.
     */
    selectOpenSeats(options) {
        return new Promise(
            (resolve, reject) => {
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        if (data) {
                            let availableSeats = data.seats.filter(fil => { return fil.reserved === false && fil.held === false; });
                            resolve(availableSeats);
                        }
                        else {
                            let errorMessage = { message: 'No venue with that id or by that name!' };
                            reject(errorMessage);
                        }
                    },
                    error => {
                        reject(error);
                    }
                );
            }
        );
    },
    /**
     * You specify the number of seats and it finds the closest row that contains that number of seats.
     * @param {{ id: number, name: string, num: number }} options 
     */
    selectBestRowWithTheNumberOfOpenSeatsYouWant(options) {
        return new Promise(
            (resolve, reject) => {
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        let num = options.num;
                        let bestSeatsInTheHouse = this.selectBestSeats(data,num);
                        resolve(bestSeatsInTheHouse);
                    },
                     error => {
                         reject(error);
                     }
                )
            }
        )
    },
    /**
     * Returns held seats with heldBy value of email address provided.
     * @param {{ email: string, id: number, name: string }} options 
     */
    selectHeldSeatsByHeldByAddress(options) {
        return new Promise(
            (resolve, reject) => {
                if (!options && !options.email) {
                    let errorMessage = { message: 'No email provided.' };
                    reject(errorMessage);
                }
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        let heldSeats = data.seats.filter(fil => { return fil.heldBy === options.email && fil.held === true });
                        resolve(heldSeats);
                    },
                     error => {
                         reject(error);
                     }
                )
            }
        )
    },
    /**
     * Returns reserved seats with heldBy value of email address provided.
     * @param {{ email: string, id: number, name: string }} options 
     */
    selectReservedSeatsByHeldByAddress(options) {
        return new Promise(
            (resolve, reject) => {
                if (!options && !options.email) {
                    let errorMessage = { message: 'No email provided.' };
                    reject(errorMessage);
                }
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        let heldSeats = data.seats.filter(fil => { return fil.heldBy === options.email && fil.reserved === true; });
                        resolve(heldSeats);
                    },
                     error => {
                         reject(error);
                     }
                )
            }
        )
    },
    /**
     * Updates seats to status of Held, sets timeout and returns all held seats by that email address.
     * @param {{ id: number, name: string, email: string, seatsToHold: array }} options 
     */
    updateSeatsToHeld(options) {
        return new Promise(
            (resolve, reject) => {
                if (!options && (!options.email || !options.seatsToHold)) {
                    let errorMessage = { message: 'Missing email or seats you want held.' };
                    reject(errorMessage);
                }
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        let venueData = data;
                        for (let i of options.seatsToHold) {
                            venueData = this.holdSeat(i, options.email, options.id, venueData);
                            holdTimeoutEmitter.emit('seatHeld',options.id,i);
                        }
                        this.saveChanges(options.id, venueData).then(
                            success => {
                                this.selectHeldSeatsByHeldByAddress({ id: options.id, name: options.name, email: options.email }).then(
                                    data => {
                                        resolve(data);
                                    },
                                    error => {
                                        reject(error);
                                    }
                                );
                            },
                            failure => {
                                reject(failure);
                            }
                        )
                    },
                     error => {
                         reject(error);
                     }
                );
            }
        );
    },
    /**
     * Updates seats to status of Reserved and returns all reserved seats for given email.
     * @param {{ id: number, name: string, email: string}} options 
     */
    updateSeatsToReserved(options) {
        return new Promise(
            (resolve, reject) => {
                if (!options && (!options.email)) {
                    let errorMessage = { message: 'Missing email.' };
                    reject(errorMessage);
                }
                this.selectOneVenueByIdOrName({ id: options.id, name: options.name }).then(
                    data => {
                        this.reserveSeats(data,options.email).then(
                            data => {
                                let newData = data;
                                this.saveChanges(options.id, newData).then(
                                    success => {
                                        this.selectReservedSeatsByHeldByAddress({ id: options.id, name: options.name, email: options.email }).then(
                                            data => {
                                                resolve(data);
                                            },
                                            error => {
                                                reject(error);
                                            }
                                        );
                                    },
                                    failure => {
                                        reject(failure);
                                    }
                                )
                            },
                            error => {
                                reject(error);
                            }
                        )
                    },
                     error => {
                         reject(error);
                     }
                );
            }
        );
    },

    /**"Private" methods */

    selectOneVenueByIdOrName(options) {

        let data = require('../../data/data.json');

        return new Promise(
            (resolve,reject) => {
                if (!options && !options.id && !options.name) {
                    let errorMessage = { message: 'No id or name provided.' };
                    reject(errorMessage);
                }
                else {
                    let venueData = data.venues.filter(fil => { return fil.name === options.name || fil.id === options.id });
                    if (venueData.length > 1) {
                        reject();
                    }
                    resolve(venueData[0]);
                }
            }
        )
    },
    holdSeat(seat, email, venueId, data) {
        let seatID = data.seats.indexOf(seat);
        data.seats[seatID].held = true;
        data.seats[seatID].heldBy = email;
        return data;
    },
    reserveSeats(venue, email) {
        return new Promise(
            (resolve, reject) => {
                let venueData = venue.seats.filter(fil => { return fil.heldBy === email && fil.held === true });
                if (venueData === -1) {
                    let errorObj = { error: 'No seats to reserve.'}
                    reject(errorObj);
                }
                for (let d of venueData) {
                    venue.seats[venue.seats.indexOf(d)].reserved = true;
                }
                resolve(venue);
            }
        );
    },
    selectBestSeats(venue, numSeats) {
        let numSeatsVal = parseInt(numSeats);
        let totalRows = Math.max.apply(null,venue.seats.map(m => {return m.row; }));
        for (let i = 1; i <= totalRows; i++) {
            let rowData = venue.seats.filter(fil => { return fil.row === i });
            let reservedSequences = rowData.map(m => { return rowData.slice(rowData.indexOf(m),rowData.indexOf(m) + numSeatsVal)});
            let reservableSequences = reservedSequences.filter(fil => { return fil.length === numSeatsVal; });
            if (reservableSequences && reservableSequences.length > 0) {
                for (let rs of reservableSequences) {
                    let available = rs.filter(fil => { return fil.held === false && fil.reserved === false});
                    let hasRightNumber = available && available.length === numSeatsVal ? true : false;
                    if (hasRightNumber) {
                        return rs;
                    }
                }
            }
        }
        return false;
    },
    saveChanges(venueid, newData) {
        return new Promise(
            (resolve, reject) => {
                let data = require('../../data/data.json');
                data.venues[venueid - 1] = newData;
                fs.writeFile('./data/data.json', JSON.stringify(data), 
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve({ message: 'Changes saved to file.'});
                }
            );
            });
    }
}