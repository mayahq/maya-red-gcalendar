// const { isNullOrUndefined } = require('util');

module.exports = function (RED) {
    'use strict'
    function GoogleSession(config) { 
        // the config information needs a runtime API to be set as creds
        const FastMQ = require('fastmq');
        const nodeSchedule = require("node-schedule");
        var crypto = require('crypto');
        var localUserCache = {};
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.fastmqChannel =  config.fastmqChannel;
        this.fastmqTopic = config.fastmqTopic;
        const node = this;
        if (this.credentials.access_token && this.credentials.expiry_date) {
            this.oauth = {
                access_token: this.credentials.access_token
            }
            this.credHash = crypto.createHash('sha1').update(this.credentials.access_token).digest('base64');
            var self = this;
            localUserCache[self.credHash] = config.name;
            if (localUserCache.hasOwnProperty(self.credHash)) {
                this.localIdentityPromise = Promise.resolve(localUserCache[self.credHash]);
            } else {
                self.warn("Failed to authenticate with Google");
            }
            if(node.credentials.expiry_date < Date.now()){
                refreshCreds(node.fastmqChannel, node.fastmqTopic, node.credentials.referenceId);
            }

            function refreshCreds (fastmqChannel, fastmqTopic, referenceId) {
                var requestChannel;
                // create a client with 'requestChannel' channel name and connect to server.
                FastMQ.Client.connect('requestChannel', fastmqChannel).then((channel) => { // client connected
                    requestChannel = channel;
                    // send request to 'master' channel  with topic 'test_cmd' and JSON format payload.
                    let reqPayload = {
                        data: {
                            referenceId: referenceId,
                            configNodes: ["google-session"]
                        }
                    };
                    return requestChannel.request(fastmqChannel, fastmqTopic, reqPayload, 'json');
                }).then((result) => {
                    console.log('Got response from master, data:' + result.payload.data);
                    // client channel disconnect
                    requestChannel.disconnect();
                }).catch((err) => {
                    console.log('Got error:', err.stack);
                });
            }
            nodeSchedule.scheduleJob(new Date(node.credentials.expiry_date - 5000), function () {refreshCreds(node.fastmqChannel, node.fastmqTopic, node.credentials.referenceId)})
        }
    }

    RED.nodes.registerType('google-session', GoogleSession, {
        credentials: {
            access_token: {
                type: String
            },
            expiry_date: {
                type: Number
            },
            referenceId: {
                type: String
            }
        }
    });


}
