module.exports = function (RED) {
    const {google} = require('googleapis');
    function SchedulequickEvents(config) {
        RED.nodes.createNode(this, config);
        this.eventText = config.eventText;
        const node = this;
        this.credentials = RED.nodes.getCredentials(config.session);
        // Retrieve the config node
        this.on("input", async function (msg) {
            var fetch = require("node-fetch"); // or fetch() is native in browsers
            fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd", {
                method: "post",
                body:{
                    text: this.eventText,
                    sendUpdates: "all"
                },
                headers: {
                    Authorization: `Bearer ${this.credentials.access_token}`
                }
            }).then(res => res.json()).then(json => console.log(json.items.length));
        });
    }
    RED.nodes.registerType("schedule-quick", SchedulequickEvents);
};

let test = {
    "kind": "calendar#event",
    "etag": "\"3228662117972000\"",
    "id": "u9v2ge2a68lqnmn1nta01sgp24",
    "status": "confirmed",
    "htmlLink": "https://www.google.com/calendar/event?eid=dTl2MmdlMmE2OGxxbm1uMW50YTAxc2dwMjQgc2h1YmhhbS5yb290QG0",
    "created": "2021-02-26T09:17:38.000Z",
    "updated": "2021-02-26T09:17:38.986Z",
    "summary": "Set an event reminder for me at",
    "creator": {
     "email": "shubham.root@gmail.com",
     "self": true
    },
    "organizer": {
     "email": "shubham.root@gmail.com",
     "self": true
    },
    "start": {
     "dateTime": "2021-02-26T15:00:00+05:30",
     "timeZone": "Asia/Kolkata"
    },
    "end": {
     "dateTime": "2021-02-26T16:00:00+05:30",
     "timeZone": "Asia/Kolkata"
    },
    "iCalUID": "u9v2ge2a68lqnmn1nta01sgp24@google.com",
    "sequence": 0,
    "reminders": {
     "useDefault": true
    },
    "eventType": "default"
   }
