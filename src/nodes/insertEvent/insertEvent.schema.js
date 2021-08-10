const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const makeRequestWithRefresh = require('../../util/reqWithRefresh');
const GcalendarAuth = require("../gcalendarAuth/gcalendarAuth.schema");

class InsertEvent extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
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
        this.setStatus("PROGRESS", "Scheduling");
        const request = {
            method: 'POST',
            url: `https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events`,
            data: {
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
            },
            headers: {
                Authorization: `Bearer ${this.tokens.vals.access_token}`
            }
        }

        try {
            const response = await makeRequestWithRefresh(this, request)
            const { data } = response
            if (data.error) {
                console.log(data.error)
                this.setStatus('ERROR', `${data.error.message}`)
                msg.__isError = true
                msg.__error = data.error
                return msg
            }
            msg.returnedData = data
            msg.payload = data
            return msg
        } catch (e) {
            if (e.response) {
                console.log('CONFIG', e.config)
                console.log('STATUS', e.response.status)
                console.log('DATA', e.response.data)
            } else {
                console.log(e)
            }

            this.setStatus('ERROR', `Error: ${e.message}`)
            msg.__isError = true
            msg.__error = e
            return msg
        }
    }
}

module.exports = InsertEvent