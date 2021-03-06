let Highcharts = require("highcharts/highstock");

let chart;

const TIMEZONE_OFFSET_IN_MINUTES = -3 * 60;

init(start);

function init(fn) { //replace for $(document).ready
	if (document.readyState !== 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

function start() {
	Highcharts.setOptions({
        global: {
            timezoneOffset: TIMEZONE_OFFSET_IN_MINUTES
        },
		lang: {
			loading: 'Загрузка...',
			months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
			weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
			shortMonths: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
			exportButtonTitle: "Экспорт",
			printButtonTitle: "Печать",
			rangeSelectorFrom: "С",
			rangeSelectorTo: "По",
			rangeSelectorZoom: "Период",
			downloadPNG: 'Скачать PNG',
			downloadJPEG: 'Скачать JPEG',
			downloadPDF: 'Скачать PDF',
			downloadSVG: 'Скачать SVG',
			printChart: 'Напечатать график'
		}
    });

	initChart();
	setInterval(updatePpmValue, 15000);
}

function updatePpmValue() {
    getJSON( "/current", function( resp ) {
        setCurrentPpmValue(resp.current);
    });
}

function setCurrentPpmValue(current) {
	let currentLabel = document.getElementById('current');
	currentLabel.innerHTML = current;
}

function initChart() {
    initialRenderData.navigator = [].concat(initialRenderData.navigator, [[Date.now(), null]]);
    chart = new Highcharts.StockChart('chart', {
        chart: {
            zoomType: 'x',
            height: 400,
            marginLeft: 120,
            marginRight: 120
        },
        scrollbar: {
            liveRedraw: true
        },
        title: {
            text: 'UX Room Air Monitor'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Выделите область графика для масштабирования' : 'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime',
            events : {
                afterSetExtremes : setDataWithNewRange
            },
            minRange: 10 * 60 * 1000
        },
        yAxis: [{
            title: {
                text: 'ppm'
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            opposite:false
        },{
            title: {
                text: 'ppm'
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            linkedTo: 0
        }],
        tooltip: {
            formatter: function() {
                return Highcharts.dateFormat('%d.%m.%Y', this.x) + '<br>' +
                    Highcharts.dateFormat('%H:%M:%S', this.x) + '<br>' +
                    '<b>' + Highcharts.numberFormat(this.y, 0) + ' ppm</b>';
            }
        },
        rangeSelector: {
            buttons: [{
                type: 'all',
                count: 1,
                text: ' Всё '
            }, {
                type: 'day',
                count: 7,
                text: 'Неделя'
            }, {
                type: 'day',
                count: 1,
                text: 'Сутки'
            },  {
                type: 'minute',
                count: 10,
                text: '10 Минут'
            }],
            buttonTheme: { // styles for the buttons
                width: 80,
                style: {
                    fontSize: 12,
                    color: '#039',
                    fontWeight: 'bold'
                },
                states: {
                    hover: {},
                    select: {
                        fill: '#039',
                        style: {
                            color: 'white'
                        }
                    }
                }
            },
            selected: 3,
            inputEnabled: false
        },
        navigator : {
            adaptToUpdatedData: false,
            series : {
                data : initialRenderData.navigator
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'ppm',
            data: initialRenderData.data,
            dataGrouping: {
                enabled: false
            }
        }]
    });
}

function updateChart(data) {
    chart.series[0].setData(data);
}

function setDataWithNewRange(e) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`min: ${e.min}, max: ${e.max}, hi:
                ${secondsToString(e.max - e.min)}`);
    }

    chart.showLoading('Загрузка данных...');
    getJSON( "/data?from="+ Math.floor(e.min) +"&to="+ Math.floor(e.max), function( resp ) {
        setCurrentPpmValue(resp.current);
        updateChart(resp.data);
        chart.hideLoading();
    });
}

function getJSON(url, callback) {
	let request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
		let data = JSON.parse(request.responseText);
		callback(data);
	  } else {
		 console.error("Internal server error!");
	  }
	};

	request.onerror = function() {
		console.error("Connection error!");
	};

	request.send();
}

function secondsToString(ms)
{
    let seconds = (ms / 1000).toFixed(0);
    let numyears = Math.floor(seconds / 31536000);
    let numdays = Math.floor((seconds % 31536000) / 86400);
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    let numseconds = ((((seconds % 31536000) % 86400) % 3600) % 60).toFixed(0);
    if (numyears !== 0) return numyears + "y : " +  numdays + "d : " + numhours + "h : " + numminutes + "m : " + numseconds + "s";
    if (numdays !== 0) return numdays + "d : " + numhours + "h : " + numminutes + "m : " + numseconds + "s";
    if (numhours !== 0) return numhours + "h : " + numminutes + "m : " + numseconds + "s";
    if (numminutes !== 0) return numminutes + "m : " + numseconds + "s";
    return numseconds + "s";
}













