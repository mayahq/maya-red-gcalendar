const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema");

class ScheduleQuick extends Node {
    static schema = new Schema({
        name: 'schedule-quick',
        label: 'schedule-quick',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            session: new fields.ConfigNode({type: GcalendarAuth}),
            eventText: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            calendarId: new fields.Typed({type: 'str', defaultVal: 'primary', allowedTypes: ['msg', 'flow', 'global']}),
        },

    })

    constructor(node, RED) {
        super(node, RED)
    }

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        this.setStatus("PROGRESS", "scheduling...");
        try{
            var fetch = require("node-fetch"); // or fetch() is native in browsers
            let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events/quickAdd`, {
                method: "POST",
                body:JSON.stringify({
                    text: vals.eventText,
                    sendUpdates: "all"
                }),
                headers: {
                    "Authorization": `Bearer ${this.credentials.session.access_token}`,
                    "Content-Type":"application/json"
                }
            });
            let json = await res.json();
            if(json.error){
                msg.error = json.error;
                this.setStatus("ERROR", json.error.message);
                return msg;
            }
            msg.payload = json;
            this.setStatus("SUCCESS", "scheduled");
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

module.exports = ScheduleQuick