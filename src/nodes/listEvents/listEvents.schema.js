const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema");

class ListEvents extends Node {
    static schema = new Schema({
        name: 'list-events',
        label: 'list-events',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            session: new fields.ConfigNode({type: GcalendarAuth}),
            calendarId: new fields.Typed({type: 'str', defaultVal: 'primary', allowedTypes: ['msg', 'flow', 'global']}),
            timeMin: new fields.Typed({
                type: 'str', 
                defaultVal: (new Date()).toISOString(), 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            timeMax: new fields.Typed({
                type: 'str', 
                defaultVal: (new Date(new Date().getFullYear(), new Date().getMonth(), 23, 59, 59)).toISOString(), 
                allowedTypes: ['msg', 'flow', 'global']}),
            singleEvents: new fields.Typed({type: 'bool', defaultVal: true, allowedTypes: ['msg', 'flow', 'global']}),
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
        this.setStatus("PROGRESS", "fetching calendar events...");
        var fetch = require("node-fetch"); // or fetch() is native in browsers
        try{
            let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURI(vals.calendarId)}/events?singleEvents=${vals.singleEvents}&timeMax=${encodeURI(vals.timeMax)}&timeMin=${encodeURI(vals.timeMin)}`, 
            {
                method: "GET",
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
            this.setStatus("SUCCESS", "fetched");
            return msg;
        }
        catch(err){
            msg.error = err;
            this.setStatus("ERROR", "error occurred");
            return msg;
        }
    }
}

module.exports = ListEvents