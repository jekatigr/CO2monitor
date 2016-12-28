/**
 * Created by evgr0715 on 28.12.2016.
 */
import { baudRate, serialPortPath } from './config';
import Database from './db'

let SerialPort = require("serialport");

let data = {
    all: [],
    minutes10: []
};
let lastSavingMinute = -1;
let lastSavingHour = -1;

class HardwareService {
    static init(initialData) {
        if (initialData && initialData.all && initialData.all.length) {
            debugger;
            for (let value of initialData.all) {
                data.all.push(value[1]);
            }
        }
        if (initialData && initialData.minutes10 && initialData.minutes10.length) {
            for (let value of initialData.minutes10) {
                data.minutes10.push(value[1]);
            }
        }
        HardwareService.runArduinoListener();
    }

    static runArduinoListener() {
        console.log(`Starting arduino listener...`);
        /*port = new SerialPort(serialPortPath, {
            baudRate: baudRate,
            parser: SerialPort.parsers.readline('\n')
        });

        port.on('open', function() {
            console.log('Arduino connected');
        });

        port.on('data', function (d) {
            var ppm = eval(d.trim());
            this.saveData(ppm);
        });

        port.on('error', function(err) {
            console.log('Error: ', err.message);
        });*/
        setInterval(function(){
            HardwareService.saveData(Math.floor(Math.random() * (1000 - 400) + 400));
        }, 15000);
        console.log(`Arduino listener started.`);
    }

    static saveData(ppm) {
        let time = new Date();
        Database.saveData(time.getTime(), ppm, "ppm_values_all");
        data.all.push(ppm);
        let currentMinute = time.getMinutes();
        if (currentMinute % 10 == 0 && Math.floor(currentMinute / 10) != lastSavingMinute) {
            let res = 0;
            for (let value of data.all) {
                res += value;
            }
            Database.saveData(time.getTime(), Math.floor(res / data.all.length), "ppm_values_10min");
            data.all = [];
            data.minutes10.push(res);
            lastSavingMinute = Math.floor(currentMinute / 10);
        }
        if (currentMinute == 0 && time.getHours() != lastSavingHour) {
            let res = 0;
            for (let value of data.minutes10) {
                res += value;
            }
            Database.saveData(time.getTime(), Math.floor(res / data.minutes10.length), "ppm_values_hour");
            data.minutes10 = [];
            lastSavingHour = time.getHours();
        }
    }
}

export default HardwareService;