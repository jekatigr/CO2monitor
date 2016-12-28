/**
 * Created by evgr0715 on 28.12.2016.
 */
import {serverPort} from './config'
import Database from './db'

var compression = require('compression');
var express = require('express');
var app = express();

class WebService {
    static runWebserver() {
        app.use(compression());
        app.use(express.static(__dirname + '/../public'));

        app.get('/', function (req, res) {
            res.render('index', {});
        });

        /*app.get('/data/:period', function (req, res) {
            var periodFrom = is_int(req.query.from) ? req.query.to : 10;

            var data_for_period = data.slice(-UPDATE_CO2_SENSOR_PER_MINUTE*period);

            var result = {
                data: data_for_period
            };

            if(data.length > 0) {
            result.current = data_for_period[data_for_period.length - 1][1];
            result.average = getAverage(data_for_period);
            }
            res.set("Content-type", "application/json");
            res.set("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(result));
         });*/

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

        function getAverage(arr) {
            var res = 0;
            for (var i = 0; i < arr.length; i++) {
                res += arr[i][1];
            }
            return arr.length > 0 ? parseInt(res / arr.length, 10) : -1;
        }
    }
}

export default WebService;