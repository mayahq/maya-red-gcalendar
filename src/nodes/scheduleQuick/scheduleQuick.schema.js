const {
    Node,
    Schema
} = require('@mayahq/module-sdk');
const Auth = require("../auth/auth.schema")

class ScheduleQuick extends Node {
    static schema = new Schema({
        name: 'schedule-quick',
        label: 'schedule-quick',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            session: Auth,
            eventText: {
                type: String,
                defaultValue: ''
            }
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        this.setStatus("PROGRESS", "scheduling...");
        var fetch = require("node-fetch"); // or fetch() is native in browsers
        fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd", {
            method: "POST",
            body:JSON.stringify({
                text: msg.eventText,
                sendUpdates: "all"
            }),
            headers: {
                "Authorization": `Bearer ${this.credentials.access_token}`,
                "Content-Type":"application/json"
            }
        }).then(res => res.json()).then(json => {
            msg.payload = json;
            this.setStatus("SUCCESS", "scheduled");
            return msg;
        }).catch(err => {
            msg.error = err;
            this.setStatus("ERROR", err.substring(0, 15));
            return msg;
        });
    }
}

module.exports = ScheduleQuick