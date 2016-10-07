'use strict';

const request = require('request');

function sendQuickReply(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "What's your favorite movie genre?",
            metadata: "DEVELOPER_DEFINED_METADATA",
            quick_replies: [{
                "content_type": "text",
                "title": "Action",
                "payload": "You like action movie"
            }, {
                "content_type": "text",
                "title": "Comedy",
                "payload": "You like comedy movie"
            }, {
                "content_type": "text",
                "title": "Drama",
                "payload": "You like drama movie"
            }]
        }
    };
    return messageData;
}
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };
    return messageData;
}

function display(object) {
    return JSON.stringify(object, null, 2);
}

module.exports.webhook = (event, context, callback) => {
    console.log('Event: ', display(event));

    // FB Page access token
    const PAGE_ACCESS_TOKEN = event.stageVariables.pageAccessToken;
    // FB webhook validation token
    const VALIDATION_TOKEN = event.stageVariables.validationToken;

    if (!VALIDATION_TOKEN) {
        console.error("Missing validation token");
        context.fail(new Error('Missing validation token'));
    }

    function callSendAPI(messageData) {
        console.log('call Send API, messageData = ' + display(messageData));

        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: messageData
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                context.succeed("Successfully");
            } else {
                console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                context.fail(new Error('Failed Send API: statusCode=' + response.statusCode + ', statusMessage=' + response.statusMessage + ', error='+ body.error));
            }
        });
    }

    if (event.method === "GET") {
        let query = event.query;
        if (query['hub.mode'] === 'subscribe' &&
            query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            context.succeed(parseInt(query['hub.challenge']));
        } else {
            context.fail(new Error('[403] Failed validation. Make sure the validation tokens match.'));
        }
    }
    else if (event.method === "POST") {
        let data = event.body;
        if (data.object == 'page') {
            var messagingList = data.entry[0].messaging;

            messagingList.forEach(function(messagingEvent) {
                if (messagingEvent.message) {
                    // Received user message
                    let messageData;
                    if (messagingEvent.message.text === "hello") {
                        messageData = sendQuickReply(messagingEvent.sender.id);
                    } else {
                        if (messagingEvent.message.quick_reply) {
                            let tmp = messagingEvent.message.quick_reply.payload;
                            messageData = sendTextMessage(messagingEvent.sender.id, tmp);
                        } else {
                            messageData = sendTextMessage(messagingEvent.sender.id, "Hello, I am messenger bot\nYou can say \"hello\" to me");
                        }
                    }
                    callSendAPI(messageData);
                }
                else if (messagingEvent.delivery) {
                    // only logging
                    var watermark = messagingEvent.delivery.watermark;
                    console.log("All message before %d were delivered.", watermark);
                }
                else if (messagingEvent.postback) {
                    // Received user postback
                    var payload = messagingEvent.postback.payload;
                    let messageData = sendTextMessage(messagingEvent.sender.id, "You received user postback");
                    callSendAPI(messageData);
                }
                else if (messagingEvent.read) {
                    // only logging
                    console.log("Received message read event for watermark %d and sequence " +
                        "number %d", messagingEvent.read.watermark, messagingEvent.read.seq);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                    let messageData = sendTextMessage(messagingEvent.sender.id, "Webhook received unknown messagingEvent");
                    callSendAPI(messageData)
                }
            });
        }
    } else {
        context.fail(new Error('Unrecognized method "' + event.method + '"'))
    }
};
