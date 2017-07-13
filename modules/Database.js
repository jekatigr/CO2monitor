import { dbFileName, PRODUCTION } from './Config';
import { TABLE_ALL } from "./TableNames";

let fs = require('fs');
let sqlite3 = require('sqlite3').verbose();
let db;

class Database {
    static configure(callback) {
        return new Promise(
            function (resolve, reject) {
                console.log(`Configuring database...`);

                let exists = fs.existsSync(dbFileName);
                db = new sqlite3.Database(dbFileName);

                if (!exists) {
                    db.serialize(function () {
                        db.run('CREATE TABLE "ppm_values_10min" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL)');
                        db.run('CREATE TABLE "ppm_values_hour" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL)');
                        db.run('CREATE TABLE "ppm_values_all" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "ppm" INTEGER NOT NULL)');
                        console.log(`Database file created.`);
                    });
                }

                console.log(`Database configured.`);

                let currentTimestamp = new Date();
                let minutes10Start = new Date(currentTimestamp.getTime());
                minutes10Start.setMinutes(Math.floor(currentTimestamp.getMinutes() / 10) * 10, 0, 0);
                let hourStart = new Date(currentTimestamp.getTime());
                hourStart.setMinutes(0, 0, 0);
                Promise.all([
                    Database.getData(parseInt((hourStart.getTime() / 1000).toFixed(0)), parseInt((currentTimestamp.getTime() / 1000).toFixed(0)), TABLE_ALL),
                    Database.getData(parseInt((minutes10Start.getTime() / 1000).toFixed(0)), parseInt((currentTimestamp.getTime() / 1000).toFixed(0)), TABLE_ALL),
                ])
                .then(([data_all, data_10_min]) => {
                    resolve({
                        data_all: data_all,
                        data_10_min: data_10_min
                    });
                })
                .catch(err => {
                    reject(err);
                });
            });
    }

    /**
     * Get ppm values from DB.
     * @param min unix timestamp (from)
     * @param max unix timestamp (to)
     * @param tableName table, where required data is stored
     */
    static getData(min, max, tableName) {
        return new Promise(
            function (resolve, reject) {
                let data = [];
                let sql = "SELECT CAST(strftime('%s', time, 'utc') AS INT) * 1000 as time, ppm FROM "+ tableName +" WHERE CAST(strftime('%s', time, 'utc') AS INT) BETWEEN "+ min +" AND "+ max +" ORDER BY time";
                if (!PRODUCTION) console.log(sql);
                try {
                    db.each(sql, function (err, row) {
                        if (err) {
                            reject(`${sql}\n${err}`);
                        } else {
                            if (row !== null) {
                                data.push([row.time, row.ppm]);
                            }
                        }
                    }, function (err, rowcount) {
                        if (err) {
                            reject(`${sql}\n${err}`);
                        } else {
                            resolve(data);
                        }
                    });
                } catch (e) {
                    reject(`Error in getData, message: ${e}`);
                }
            });
    }

    static saveData(time, ppm, tableName) {
        try {
            let stmt = db.prepare("INSERT INTO "+ tableName +" VALUES (?, ?, ?)", function(err) {
                if (err) {
                    console.log("prepare");
                    console.log(err);
                }
            });
            stmt.run(null, time, ppm, function(err) {
                if (err) {
                    console.log("run");
                    console.log(err);
                }
            });
            stmt.finalize();
        } catch (e) {
            console.log("Error in saveData, message:" + e);
        }
    }
}

export default Database;