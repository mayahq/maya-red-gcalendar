const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const makeRequestWithRefresh = require('../../util/reqWithRefresh')

class DeleteEvent extends Node {
    static schema = new Schema({
        name: 'delete-event',
        label: 'Delete event',
        category: 'Maya Red Gcalendar',
        isConfig: false,
        fields: {
            eventId: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            calendarId: new fields.Typed({type: 'str', defaultVal: 'primary', allowedTypes: ['msg', 'flow', 'global']}),
        }
    })

    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        this.setStatus("PROGRESS", "Deleting event")
        const request = {
            method: 'DELETE',
            url: `https://www.googleapis.com/calendar/v3/calendars/${vals.calendarId}/events/${vals.eventId}`,
            headers: {
                Authorization: `Bearer ${this.tokens.vals.access_token}`
            }
        }

        try {
            await makeRequestWithRefresh(this, request)
            msg.reqUrl = request.url
            this.setStatus('SUCCESS', 'Deleted')
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

module.exports = DeleteEvent