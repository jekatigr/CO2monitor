export let dbFileName = "data.db";
export let baudRate = 9600;
export let serialPortPath = "COM3";
export let PRODUCTION = (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production');
export let serverPort = 3000;


console.log(`Settings loaded:
    Database file:    ${dbFileName}
    Baud rate:        ${baudRate}
    Serial port name: ${serialPortPath}
    Web server port:  ${serverPort}
    Mode:             ${(PRODUCTION) ? "production" : "development"}
`);