export let serverPort = 3000;
export let dbFileName = "data.db";
export let baudRate = 9600;
export let serialPortPath = "COM3";


console.log(`Settings loaded:
    Database file:    ${dbFileName}
    Baud rate:        ${baudRate}
    Serial port name: ${serialPortPath}
    Web server port:  ${serverPort}
`);