module.exports = function (RED) {
    function SchedulequickEvents(config) {
        RED.nodes.createNode(this, config);
        this.eventText = config.eventText;
        const node = this;
        this.credentials = RED.nodes.getCredentials(config.session);
        // Retrieve the config node
        this.on("input", async function (msg) {
            node.status({
                text: "scheduling..",
                fill: "yellow",
                shape: "dot"
            })
            var fetch = require("node-fetch"); // or fetch() is native in browsers
            fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd", {
                method: "POST",
                body:JSON.stringify({
                    text: msg.eventText,
                    sendUpdates: "all"
                }),
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
    RED.nodes.registerType("schedule-quick", SchedulequickEvents);
};
