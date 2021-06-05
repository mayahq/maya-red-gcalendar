const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema");

class InsertEvent extends Node {
    constructor(node, RED) {
        super(node, RED)
    }

    static schema = new Schema({
        name: 'insert-event',
        label: 'insert-event',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            // Whatever custom fields the node needs.
            session: new fields.ConfigNode({type: GcalendarAuth}),
            summary: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            calendarId: new fields.Typed({type: 'str', defaultVal: 'primary', allowedTypes: ['msg', 'flow', 'global']}),
            startDateTime: new fields.Typed({
                type: 'str', 
                defaultVal: (new Date()).toISOString(), 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            startTimeZone: new fields.Typed({
                type: 'str', 
                defaultVal: 'Asia/Kolkata', 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            endDateTime: new fields.Typed({
                type: 'str', 
                defaultVal: (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours()+1, new Date().getMinutes())).toISOString(), 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            endTimeZone: new fields.Typed({
                type: 'str', 
                defaultVal: 'Asia/Kolkata', 
                allowedTypes: ['msg', 'flow', 'global']
            }),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        this.setStatus("PROGRESS", "scheduling...");
        try{
            var fetch = require("node-fetch"); // or fetch() is native in browsers
            let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events`, {
                method: "POST",
                body:JSON.stringify({
                    summary: vals.summary,
                    sendUpdates: "all",
                    start: {
                        dateTime: vals.startDateTime,
                        timezone: vals.startTimeZone
                    },
                    end: {
                        dateTime: vals.endDateTime,
                        timezone: vals.endTimeZone
                    }
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

module.exports = InsertEvent