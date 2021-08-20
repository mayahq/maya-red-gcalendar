const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const { color, icon } = require('../../style')

const makeRequestWithRefresh = require('../../util/reqWithRefresh');


class InsertEvent extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    static schema = new Schema({
        name: 'insert-event',
        label: 'Insert event',
        category: 'Google Calendar',
        isConfig: false,
        fields: {
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
            location: new fields.Typed({
                type: 'str', 
                defaultVal: '', 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            description: new fields.Typed({
                type: 'str', 
                defaultVal: 'Asia/Kolkata', 
                allowedTypes: ['msg', 'flow', 'global']
            }),
            additionalProperties: new fields.Typed({
                type: 'json', 
                defaultVal: 'Asia/Kolkata', 
                allowedTypes: ['msg', 'flow', 'global']
            }),
        },
        color: color,
        icon: icon
    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Scheduling");
        let reqData = {
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
        }

        if (vals.description) {
            reqData.description = vals.description
        }

        if (vals.location) {
            reqData.location = vals.location
        }

        if (vals.additionalProperties) {
            reqData = { ...reqData, ...(vals.additionalProperties)}
        }

        const request = {
            method: 'POST',
            url: `https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events`,
            data: reqData,
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
            this.setStatus('SUCCESS', 'Scheduled')
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