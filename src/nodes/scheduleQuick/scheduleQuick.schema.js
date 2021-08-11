const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const makeRequestWithRefresh = require('../../util/reqWithRefresh');
const { color, icon } = require('../../style')

class ScheduleQuick extends Node {
    static schema = new Schema({
        name: 'schedule-quick',
        label: 'Quick schedule',
        category: 'Google Calendar',
        isConfig: false,
        fields: {
            eventText: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            calendarId: new fields.Typed({type: 'str', defaultVal: 'primary', allowedTypes: ['msg', 'flow', 'global']}),
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
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        this.setStatus("PROGRESS", "Scheduling");

        const request = {
            method: 'POST',
            url: `https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events/quickAdd`,
            data: {
                text: vals.eventText,
                sendUpdates: "all"
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

module.exports = ScheduleQuick