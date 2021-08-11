const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const { color, icon } = require('../../style')

const makeRequestWithRefresh = require('../../util/reqWithRefresh')

class ListEvents extends Node {
    static schema = new Schema({
        name: 'list-events',
        label: 'Get events',
        category: 'Google Calendar',
        isConfig: false,
        fields: {
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
        color: color,
        icon: icon
    })

    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Fetching calendar events");
        var fetch = require("node-fetch"); // or fetch() is native in browsers

        const request = {
            method: 'GET',
            url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURI(vals.calendarId)}/events?singleEvents=${vals.singleEvents}&timeMax=${encodeURI(vals.timeMax)}&timeMin=${encodeURI(vals.timeMin)}`,
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
            this.setStatus('SUCCESS', 'Fetched')
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

module.exports = ListEvents