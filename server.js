var sqlite3 = require('sqlite3').verbose();
var SerialPort = require("serialport");

var compression = require('compression');
var express = require('express');
var app = express();
app.use(compression());

var SERVER_PORT = 80;

var UPDATE_CO2_SENSOR_PER_MINUTE = 4;
var data = [];

var db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(err){
	if (err) {
		console.log(err);
	} else {
		var limit = 24 * 60 * UPDATE_CO2_SENSOR_PER_MINUTE;
		getValuesFromDB(limit, function(d) {
			data = d;
			runArduinoListener();
			runWebserver();
		});
	}
});

function getValuesFromDB(count, callback) {
	var data = [];
	db.each("SELECT time, ppm FROM ppm_values ORDER BY id LIMIT " + count +" OFFSET (SELECT COUNT(*) FROM ppm_values) - "+ count, function(err, row) {
		if (err) {
			console.log(err);
		} else {
			if (row != null) {
				var timestamp = new Date(row.time).getTime();
				data.push([timestamp, row.ppm]);
			}
		}
	}, function(err, rowcount){
		if (err) {
			console.log(err);
		} else {
			if (callback) {
				callback(data);
			}
		}
	});
}

var port;

function runArduinoListener() {
	port = new SerialPort("COM3", {
	    baudRate: 9600,
	    parser: SerialPort.parsers.readline('\n')
	});

	port.on('open', function() {
			port.write('main turn on', function(err) {
			if (err) {
			    return console.log('Error on write: ', err.message);
			}
			console.log('Arduino connected');
	    });
	});

	port.on('data', function (d) {
		var entry = [
			new Date().toLocaleString(),
			eval(d.trim())
		];
		
		saveNewDataEntry(entry);
	});

	port.on('error', function(err) {
	    console.log('Error: ', err.message);
	});
}

function saveNewDataEntry(entry) {
	var stmt = db.prepare("INSERT INTO ppm_values VALUES (?, ?, ?)");
    stmt.run(null, entry[0], entry[1]);
    stmt.finalize(function () {
		
		var timestamp = new Date(entry[0]).getTime();
				entry[0] = timestamp;
		data.push(entry);
	});
}

function runWebserver() {
	app.use(express.static('public'));

	app.get('/', function (req, res) {
	    res.render('index', {});
	});

	app.get('/data/:period', function (req, res) {
		var period = is_int(req.params.period) ? req.params.period : 10;
		
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
	});

	app.listen(SERVER_PORT, function () {
		console.log('Webservice started on port '+ SERVER_PORT);
	});

	function is_int(value){
	  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
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




















