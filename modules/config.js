export let dbFileName = "data.db";
export let baudRate = 9600;
export let serialPortPath = "COM3";
export let PRODUCTION = (process.env.ENV_VARIABLE && process.env.ENV_VARIABLE.trim() === 'production');
export let serverPort = (PRODUCTION) ? 80 : 3000;


console.log(`Settings loaded:
    Database file:    ${dbFileName}
    Baud rate:        ${baudRate}
    Serial port name: ${serialPortPath}
    Web server port:  ${serverPort}
    Mode:             ${(PRODUCTION) ? "production" : "development"}
`);