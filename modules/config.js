/**
 * Created by evgr0715 on 26.12.2016.
 */

export let serverPort = 3000;
export let dbFileName = "data2.db";
export let baudRate = 9600;
export let serialPortPath = "COM3";


console.log(`Settings loaded:
    Database file:    ${dbFileName}
    Baud rate:        ${baudRate}
    Serial port name: ${serialPortPath}
    Web server port:  ${serverPort}
`);