import {serverPort} from './Config'
import Database from './Database'
import {TABLE_ALL, TABLE_HOUR, TABLE_10_MIN} from './TableNames'

let compression = require('compression');
let express = require('express');
let app = express();

class WebService {
    static runWebserver() {
        app.use(compression());
        app.use(express.static(__dirname + '/../public'));

        app.get('/', function (req, res) {
            res.render('index', {});
        });

        app.get('/data', function (req, res) {
            res.set("Content-type", "application/json");
            res.set("Access-Control-Allow-Origin", "*");

            let tableName, from, to, isInitial = false;
            if (req.query.from && req.query.to) {
                from = req.query.from;
                to = req.query.to;
                if (!is_int(from) || !is_int(to) || from > to) {
                    res.status(500).send('Wrong request params!');
                }

                console.log(`from: ${from}, to: ${to}`);

                if (to - from <= 2 * 24 * (60 + 1) * 60 * 1000) { //2 days
                    tableName = TABLE_ALL;
                } else {
                    if (to - from < 2 * 7 * 24 * (60 + 1) * 60 * 1000) { //two weeks
                        tableName = TABLE_10_MIN;
                    } else { //and more
                        tableName = TABLE_HOUR;
                    }
                }
            } else {
                from = 0;
                to = Date.now();
                isInitial = true;
            }

            //converting js timestamps to unix timestamps:
            from = (from > 1000) ? parseInt((from / 1000).toFixed(0)) : 0;
            to = (to > 1000) ? parseInt((to / 1000).toFixed(0)) : 0;

            if (!isInitial) {
                Database.getData(from, to, tableName, function (result) {
                    let data = {
                        current: (result && result.length) ? result[result.length - 1][1] : -1,
                        data: result
                    };

                    res.send(JSON.stringify(data));
                })
            } else { //fill data with two arrays - for navigator and for chart
                Database.getData(from, to, TABLE_HOUR, function (navigator_data) {

                    Database.getData(to - 10 * 60, to, TABLE_ALL, function (result) {
                        let data = {
                            current: (result && result.length) ? result[result.length - 1][1] : -1,
                            data: result,
                            navigator: navigator_data
                        };

                        res.send(JSON.stringify(data));
                    })
                })
            }
         });

        app.listen(serverPort, function () {
            console.log(`Webservice started on port ${serverPort}`);
        });

        function is_int(value) {
            if ((parseFloat(value) == parseInt(value)) && !isNaN(value)) {
                return true;
            } else {
                return false;
            }
        }

        /*function getAverage(arr) {
            var res = 0;
            for (var i = 0; i < arr.length; i++) {
                res += arr[i][1];
            }
            return arr.length > 0 ? parseInt(res / arr.length, 10) : -1;
        }*/
    }
}

export default WebService;