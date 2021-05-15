const {
    Node,
    Schema
} = require('@mayahq/module-sdk');
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema");

class DeleteEvent extends Node {
    static schema = new Schema({
        name: 'delete-event',
        label: 'delete-event',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            session: GcalendarAuth,
            eventId: {
                type: String,
                defaultValue: ''
            },
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
        this.setStatus("PROGRESS", "deleting event...");
        try{
            var fetch = require("node-fetch"); // or fetch() is native in browsers
            let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events/${vals.eventId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${this.credentials.session.access_token}`,
                }
            });
            if(!res.ok){
                msg.error = res.statusText;
                this.setStatus("ERROR", res.statusText);
                return msg;
            }
            msg.payload = res.url;
            this.setStatus("SUCCESS", "deleted");
            return msg;
            
        }
        catch(err){
            console.log(err)
            msg.error = err;
            this.setStatus("ERROR", "error occurred");
            return msg;
        }
    }
}

module.exports = DeleteEvent