import { serverPort, PRODUCTION } from './Config'
import Database from './Database'
import { TABLE_ALL, TABLE_HOUR, TABLE_10_MIN } from './TableNames'
import CurrentCO2Value from './CurrentCO2Value'

let compression = require('compression');
let express = require('express');
let app = express();

let engine = require('express-dot-engine');

class WebService {
    static runWebserver() {
        app.use(compression());
        app.use(express.static(__dirname + '/../public'));

        app.engine('dot', engine.__express);
        app.set('views', (__dirname + '/../views'));
        app.set('view engine', 'dot');

        app.get('/', function (req, res) {
            let from = 0;
            let to = Date.now();

            to = convertJsToUnixTimestamp(to);

            Promise.all([
                Database.getData(from, to, TABLE_HOUR),
                Database.getData(to - 10 * 60, to, TABLE_ALL)
            ])
            .then(([navigator_data, data]) => {
                let result = {
                    current: CurrentCO2Value.getCurrentValue(),
                    data: data,
                    navigator: navigator_data
                };

                res.render('index', result);
            })
            .catch(err => {
                console.error(err);
            });
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

                if (!PRODUCTION) console.log(`from: ${from}, to: ${to}`);

                if (to - from <= 24 * (60 + 1) * 60 * 1000) { //1 day
                    tableName = TABLE_ALL;
                } else {
                    if (to - from < 2 * 7 * 24 * (60 + 1) * 60 * 1000) { //two weeks
                        tableName = TABLE_10_MIN;
                    } else { //and more
                        tableName = TABLE_HOUR;
                    }
                }

                from = convertJsToUnixTimestamp(from);
                to = convertJsToUnixTimestamp(to);

                Database.getData(from, to, tableName)
                    .then((result) => {
                        let data = {
                            current: CurrentCO2Value.getCurrentValue(),
                            data: result
                        };

                        res.send(JSON.stringify(data));
                    })
                    .catch(err => {
                        console.error(err);
                    })
            } else {
                res.status(500).send('Wrong request params!');
            }
        });

        app.get('/current', function (req, res) {
            res.set("Content-type", "application/json");
            res.set("Access-Control-Allow-Origin", "*");

            let result = {
                current: CurrentCO2Value.getCurrentValue(),
            };

            res.send(JSON.stringify(result));
        });

        app.listen(serverPort, function () {
            console.log(`Webservice started on port ${serverPort}`);
        });

        function is_int(value) {
            return (parseFloat(value) === parseInt(value)) && !isNaN(value);
        }

        function convertJsToUnixTimestamp(value) {
            return (value > 1000) ? parseInt((value / 1000).toFixed(0)) : 0;
        }
    }
}

export default WebService;