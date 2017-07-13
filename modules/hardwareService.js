import { baudRate, serialPortPath } from './Config';
import Database from './Database'
import {TABLE_ALL, TABLE_HOUR, TABLE_10_MIN} from './TableNames'
import CurrentCO2Value from './CurrentCO2Value'

let SerialPort = require("serialport");
let port;

let dataForLastHour = [];
let dataForLast10Minutes = [];
let lastSavingMinute = -1;
let lastSavingHour = -1;

class HardwareService {
    static init(initialData) {
        if (initialData && initialData.data_all && initialData.data_all.length) {
            for (let value of initialData.data_all) {
                dataForLastHour.push(value[1]);
            }
        }
        if (initialData && initialData.data_10_min && initialData.data_10_min.length) {
            for (let value of initialData.data_10_min) {
                dataForLast10Minutes.push(value[1]);
            }
        }
        HardwareService.runArduinoListener();
    }

    static runArduinoListener() {
        console.log(`Starting arduino listener...`);
        port = new SerialPort(serialPortPath, {
            baudRate: baudRate,
            parser: SerialPort.parsers.readline('\n')
        });

        port.on('open', function() {
            console.log('Arduino connected.');
        });

        port.on('data', function (d) {
            let ppm = eval(d.trim());
            CurrentCO2Value.updateCurrentValue(ppm);
            HardwareService.saveData(ppm);
        });

        port.on('error', function(err) {
            console.log('Error: ', err.message);
        });
    }

    static saveData(ppm) {
        let time = new Date();
        let seconds = time.getSeconds();
        time.setSeconds(Math.floor(seconds / 15) * 15, 0);
        let time_string = time.toLocaleString('ru-RU', {year:"numeric", month:"2-digit", day:"2-digit", hour: "2-digit", minute: "2-digit", second:"2-digit"});
        Database.saveData(time_string, ppm, TABLE_ALL);
        dataForLastHour.push(ppm);
        let currentMinute = time.getMinutes();

        if (currentMinute % 10 === 0 && time.getMinutes() !== lastSavingMinute) {
            let res = 0;
            for (let value of dataForLast10Minutes) {
                res += value;
            }
            console.log(`saving 10 min result: ${time_string}, ${Math.floor(res / dataForLast10Minutes.length)}, ${TABLE_10_MIN}`);
            Database.saveData(time_string, Math.floor(res / dataForLast10Minutes.length), TABLE_10_MIN);
            dataForLast10Minutes = [];
            lastSavingMinute = time.getMinutes();
        }

        if (currentMinute === 0 && time.getHours() !== lastSavingHour) {
            let res = 0;
            for (let value of dataForLastHour) {
                res += value;
            }
            console.log(`saving hour result: ${time_string}, ${Math.floor(res / dataForLastHour.length)}, ${TABLE_HOUR}`);
            Database.saveData(time_string, Math.floor(res / dataForLastHour.length), TABLE_HOUR);
            dataForLastHour = [];
            lastSavingHour = time.getHours();
        }
    }
}

export default HardwareService;