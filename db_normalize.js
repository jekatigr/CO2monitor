/* data migration from old format */

let sqlite3 = require('sqlite3').verbose();
let db;
db = new sqlite3.Database("data.db");

console.time("dbread");

let data = [];
let sql = "SELECT time, ppm FROM ppm_values ORDER BY time";
db.each(sql, function(err, row) {
    if (err) {
        console.log(err);
        console.log(sql);
    } else {
        if (row !== null) {
            data.push([row.time, row.ppm]);
        }
    }
}, function(err, rowcount){
    if (err) {
        console.log(err);
        console.log(sql);
    } else {
        floorTime(data);
    }
    console.timeEnd("dbread");
    console.log("final: "+data.length);
});

function floorTime(data) {
    for(let i = 0; i < data.length; i++) {
        let tt = new Date( data[i][0]);
        let seconds = tt.getSeconds();
        tt.setSeconds(Math.floor(seconds / 15) * 15, 0);
        //console.log(`${tt} = ${tt.toLocaleString() } = ${ new Date(data[i][0]) }`);
        data[i][0] = tt.toLocaleString('ru-RU', {year:"numeric", month:"2-digit", day:"2-digit", hour: "2-digit", minute: "2-digit", second:"2-digit"});
    }

    let data10 = [], datahour = [];
    let iterationTime = new Date(data[0][0]);
    iterationTime.setMinutes(Math.floor(iterationTime.getMinutes() / 10) * 10, 0, 0);
    let stop = new Date(data[data.length - 1][0]);
    let i = 0;

    while (iterationTime <= stop) {
        let next = new Date(iterationTime);
        next.setMinutes(iterationTime.getMinutes() + 10, 0, 0);
        let res = 0, counter = 0;
        while(i < data.length && new Date(data[i][0]) < next) {
            res += data[i][1];
            counter++;
            i++;
        }
        let result = Math.floor(res / counter);
        if (result)
            data10.push([iterationTime.toLocaleString('ru-RU', {year:"numeric", month:"2-digit", day:"2-digit", hour: "2-digit", minute: "2-digit", second:"2-digit"}), result]);
        iterationTime = next;
    }

    let iterationTimeHour = new Date(data[0][0]);
    iterationTimeHour.setMinutes(0, 0, 0);
    let stopHour = new Date(data[data.length - 1][0]);
    i = 0;

    while (iterationTimeHour <= stopHour) {
        let nextHour = new Date(iterationTimeHour);
        nextHour.setHours(iterationTimeHour.getHours() + 1, 0, 0, 0);
        let res = 0, counter = 0;
        while(i < data.length && new Date(data[i][0]) < nextHour) {
            res += data[i][1];
            counter++;
            i++;
        }
        let result = Math.floor(res / counter);
        if (result)
            datahour.push([iterationTimeHour.toLocaleString('ru-RU', {year:"numeric", month:"2-digit", day:"2-digit", hour: "2-digit", minute: "2-digit", second:"2-digit"}), result]);
        iterationTimeHour = nextHour;
    }

console.log(`${data.length}, ${datahour.length}`);
    saveResult(data, datahour, data10);
}

function saveResult(data, datahour, data10) {
    db.run("BEGIN TRANSACTION");
    for(let i = 0; i < data.length; i++) {
        var stmt = db.prepare("INSERT INTO ppm_values_all VALUES (?, ?, ?)");
        stmt.run(null, data[i][0], data[i][1]);
    }

    for(let i = 0; i < datahour.length; i++) {
        var stmt = db.prepare("INSERT INTO ppm_values_hour VALUES (?, ?, ?)");
        stmt.run(null, datahour[i][0], datahour[i][1]);
    }

    for(let i = 0; i < data10.length; i++) {
        var stmt = db.prepare("INSERT INTO ppm_values_10min VALUES (?, ?, ?)");
        stmt.run(null, data10[i][0], data10[i][1]);
    }
    db.run("END");
}





