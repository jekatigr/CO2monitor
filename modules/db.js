import { dbFileName } from './config';

let fs = require('fs');
let sqlite3 = require('sqlite3').verbose();
let db;

class Database {
    static configure(callback) {
        console.log(`Configuring database...`);

        let exists = fs.existsSync(dbFileName);
        db = new sqlite3.Database(dbFileName);

        if (!exists) {
            db.serialize(function () {
                db.run('CREATE TABLE "ppm_values_10min" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "time" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL )');
                db.run('CREATE TABLE "ppm_values_hour" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "time" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL )');
                db.run('CREATE TABLE "ppm_values_all" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "time" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL )');
                console.log(`Database file created.`);
            });
        }

        console.log(`Database configured.`);
        if (callback) {
            let currentTimestamp = new Date();
            let minutes10Start = new Date(currentTimestamp.getTime());
            minutes10Start.setMinutes(Math.floor(currentTimestamp.getMinutes() / 10) * 10, 0, 0);
            let hourStart = new Date(currentTimestamp.getTime());
            hourStart.setMinutes(0, 0, 0);
            Database.getData(hourStart.getTime(), currentTimestamp.getTime(), "ppm_values_all", function(dataAll) {
                Database.getData(minutes10Start.getTime(), currentTimestamp.getTime(), "ppm_values_10min", function(data10Min) {
                    let initialData = {
                        all: dataAll,
                        minutes10: data10Min
                    };
                    callback(initialData);
                })
            });
        }
    }

    static getData(min, max, tableName, callback) {
        let data = [];
        let sql = "SELECT time, ppm FROM "+ tableName +" WHERE time BETWEEN "+ min +" AND "+ max +" ORDER BY time";
        db.each(sql, function(err, row) {
            if (err) {
                console.log(err);
                console.log(sql);
            } else {
                if (row != null) {
                    data.push([row.time, row.ppm]);
                }
            }
        }, function(err, rowcount){
            if (err) {
                console.log(err);
                console.log(sql);
            } else {
                if (callback) {
                    callback(data);
                }
            }
        });
    }

    static saveData(time, ppm, tableName) {
        var stmt = db.prepare("INSERT INTO "+ tableName +" VALUES (?, ?, ?)");
        stmt.run(null, time, ppm);
        stmt.finalize();
    }
}

export default Database;