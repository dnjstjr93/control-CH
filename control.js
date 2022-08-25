/**
 * Created by Wonseok Jung in KETI on 2020-08-25.
 */

const mqtt = require('mqtt');
const {nanoid} = require('nanoid');
const Gpio = require('onoff').Gpio;

let local_mqtt_client = null;
let control_topic = '/Control';

let ch = {}
ch['7'] = new Gpio(17, 'out');
ch['8'] = new Gpio(18, 'out');
ch['9'] = new Gpio(19, 'out');
ch['10'] = new Gpio(10, 'out');
ch['11'] = new Gpio(11, 'out');
ch['12'] = new Gpio(12, 'out');

local_mqtt_connect();

function local_mqtt_connect() {
    if (local_mqtt_client === null) {
        var connectOptions = {
            host: 'localhost',
            port: 1883,
            protocol: "mqtt",
            keepalive: 10,
            clientId: 'TAS_MAV_' + nanoid(15),
            protocolId: "MQTT",
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 2000,
            connectTimeout: 2000,
            rejectUnauthorized: false
        }

        local_mqtt_client = mqtt.connect(connectOptions);

        local_mqtt_client.on('connect', function () {
            console.log('local_mqtt is connected');

            if (control_topic !== '') {
                local_mqtt_client.subscribe(control_topic, function () {
                    console.log('[local_mqtt] control_topic is subscribed: ' + control_topic);
                })
            }
        });

        local_mqtt_client.on('message', function (topic, message) {
            if (topic === control_topic) {
                let msg_obj = JSON.parse(message.toString());
                console.log('[Control]', msg_obj);
                ch[msg_obj.channel].writeSync(msg_obj.value);
            }
        });

        local_mqtt_client.on('error', function (err) {
            console.log('[local_mqtt] (error) ' + err.message);
        });
    }
}
