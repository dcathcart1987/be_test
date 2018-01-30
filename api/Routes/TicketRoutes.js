"use strict";
const TicketController = require('../Controllers/TicketController');

module.exports = (app) => {
    app.route('/api/v1/seats/available')
        .get(TicketController.seeAvalailableSeats)
        .post(TicketController.seeAvalailableSeats);
    
    app.route('/api/v1/seats/holdTheBest')
        .post(TicketController.holdBestSeats);
    
    app.route('/api/v1/seats/reserve')
        .post(TicketController.reserveSeats);
    
    app.route('/api/v1/seats/held')
        .get(TicketController.seeMyHeldSeats)
        .post(TicketController.seeMyHeldSeats);
    
    app.route('/api/v1/seats/reserved')
        .get(TicketController.seeMyReservedSeats)
        .post(TicketController.seeMyReservedSeats);

    app.route('/api/v1/seats/best')
        .get(TicketController.seeBestSeats);
}