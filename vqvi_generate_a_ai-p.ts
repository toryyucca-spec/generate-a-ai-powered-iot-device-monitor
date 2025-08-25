// IMPORTS
import { Device } from './device';
import { IoTData } from './iot-data';
import * as mqtt from 'mqtt';
import * as brain from 'brain.js';

// GLOBAL VARIABLES
const devices: Device[] = [];
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');

// DEVICE CLASS
class Device {
  id: string;
  name: string;
  data: IoTData[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.data = [];
  }
}

// IOT DATA CLASS
class IoTData {
  timestamp: number;
  value: number;

  constructor(timestamp: number, value: number) {
    this.timestamp = timestamp;
    this.value = value;
  }
}

// GENERATE AI MODEL
const net = new brain.NeuralNetwork();
net.train([
  { input: [0], output: [0] },
  { input: [1], output: [1] },
  // ADD MORE TRAINING DATA HERE
]);

// MQTT LISTENER
mqttClient.on('message', (topic: string, message: Buffer) => {
  const deviceId = topic.split('/')[1];
  const device = devices.find((d) => d.id === deviceId);
  if (device) {
    const data = JSON.parse(message.toString());
    const iotData = new IoTData(data.timestamp, data.value);
    device.data.push(iotData);
    // USE AI MODEL TO ANALYZE DATA
    const output = net.run([iotData.value])[0];
    console.log(`Device ${deviceId} output: ${output}`);
  }
});

// ADD DEVICES
devices.push(new Device('device1', 'Temperature Sensor'));
devices.push(new Device('device2', 'Humidity Sensor'));

// PUBLISH TO MQTT
setInterval(() => {
  devices.forEach((device) => {
    const data = {
      timestamp: Date.now(),
      value: Math.random() * 100,
    };
    mqttClient.publish(`device/${device.id}`, JSON.stringify(data));
  });
}, 1000);