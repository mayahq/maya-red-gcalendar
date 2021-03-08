module.exports = function (RED) {
    function SchedulequickEvents(config) {
        RED.nodes.createNode(this, config);
        this.eventText = config.eventText;
        const node = this;
        this.credentials = RED.nodes.getCredentials(config.session);
        function genId () {
            return (1+Math.random()*4294967295).toString(16);
        }
        // Retrieve the config node
        this.on("input", async function (msg) {
            node.status({
                text: "scheduling..",
                fill: "yellow",
                shape: "dot"
            })
            var emails = msg.attendees.split(',')||[];
            var attendees = [];
            var emailTest = /\S+@\S+\.\S+/;
            if(emails.length > 0){
                emails.forEach(emailId => {
                    if(emailTest.test(emailId))
                        attendees.push({'email':emailId});
                })
            }
            // for(let index=0; index < emails.length; index++){
            //     attendees.push({'email':emails[index]});
            // }
            var fetch = require("node-fetch"); // or fetch() is native in 
            let eventBody = {
                'summary': msg.summary,
                'location': '',
                'description': 'Event created with Maya :)',
                'conferenceData':{
                    'createRequest':{
                        'requestId': genId(),
                        'conferenceSolutionKey':{
                            'type':'hangoutsMeet'
                        }
                    }
                },
                'start': {
                  'dateTime': msg.startTime,
                },
                'end': {
                  'dateTime': msg.endTime,
                },
                'recurrence': [],
                'attendees': attendees,
                'reminders': {
                  'useDefault': true
                },
              }
            fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
                method: "POST",
                body:JSON.stringify(eventBody),
                headers: {
                    "Authorization": `Bearer ${this.credentials.access_token}`,
                    "Content-Type":"application/json"
                }
            }).then(res => res.json()).then(json => {
                msg.payload = json.htmlLink;
                node.status({
                    text: "scheduled",
                    fill: "green",
                    shape: "dot"
                });
                node.send(msg);
            }).catch(err => {
                node.status({
                    text: err.substring(0, 15),
                    fill: "red",
                    shape: "dot"
                });
                msg.error = err;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("schedule-google-meet", SchedulequickEvents);
};
