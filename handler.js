'use strict';

const request = require('request');

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

    // FB粉絲專頁存取權杖
    const PAGE_ACCESS_TOKEN = event.stageVariables.pageAccessToken;
    // FB webhook驗證token
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
                    // 收到使用者訊息
                    let messageData = sendTextMessage(messagingEvent.sender.id, "你好，我是聊天機器人BOT");
                    callSendAPI(messageData);
                }
                else if (messagingEvent.delivery) {
                    // 僅記錄log不動作
                    var watermark = messagingEvent.delivery.watermark;
                    console.log("All message before %d were delivered.", watermark);
                }
                else if (messagingEvent.postback) {
                    // 收到使用者互動回傳
                    var payload = messagingEvent.postback.payload;
                    let messageData = sendTextMessage(messagingEvent.sender.id, display(payload));
                    callSendAPI(messageData);
                }
                else if (messagingEvent.read) {
                    // 僅記錄log不動作
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
