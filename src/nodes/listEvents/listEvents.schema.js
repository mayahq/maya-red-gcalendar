const {
    Node,
    Schema
} = require('@mayahq/module-sdk');
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema")

class ListEvents extends Node {
    static schema = new Schema({
        name: 'list-events',
        label: 'list-events',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            session: GcalendarAuth,
            calendarId: {
                type: String,
                defaultValue: 'primary'
            }
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        this.setStatus("PROGRESS", "fetching calendar events...");
        var fetch = require("node-fetch"); // or fetch() is native in browsers
        fetch(`https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.credentials.session.access_token}`,
                "Content-Type":"application/json"
            }
        })
        .then(res => res.json())
        .then(json => {
            if(json.error){
                msg.error = err;
                this.setStatus("ERROR", err.substring(0, 15));
                return msg;
            }
            console.log(json)
            msg.payload = json;
            this.setStatus("SUCCESS", "fetched");
            return msg;
        })
        .catch(err => {
            console.log(err)
            msg.error = err;
            this.setStatus("ERROR", err.substring(0, 15));
            return msg;
        });
    }
}

module.exports = ListEvents