$(document).ready(function(){	
	Highcharts.setOptions({
        global: {
            timezoneOffset: -3 * 60
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
	
	initBar();
	initChart();
	update();
	setInterval(update, 15000);
	
	$("#period").on('change', update);
});

function update() {
	var period = $("#period").val();
	var periodText = $("#period :selected").text().toLowerCase();
	$.getJSON( "data/"+period, function( resp ) {
		updateData(resp.current, resp.average);
		updateChart(periodText, resp.data);
		updateBar(resp.current);
	});
}

function updateData(current, average) {
	$(".current").html(current + ' ppm');
	$(".average").html(average + ' ppm');
}

function initChart() {	
	$('#chart').highcharts({
		chart: {
			zoomType: 'x', 
			height: 400
		},
		title: {
			text: 'UX Room Air Monitor'
		},
		subtitle: {
			text: document.ontouchstart === undefined ?
					'Выделите область графика для масштабирования' : 'Pinch the chart to zoom in'
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'ppm'
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
			data: []
		}]
	});
}

function updateChart(title, data) {
	var chart = $('#chart').highcharts();
	chart.setTitle({text: 'UX Room Air Monitor (' + title + ')'});
	chart.series[0].setData(data);
}

function initBar() {
	bar = new LinearGauge({
		renderTo: 'bar',
		width: 200,
		height: 600,
		units: "ppm",
		minValue: 0,
		startAngle: 90,
		ticksAngle: 180,
		valueBox: false,
		maxValue: 2000,
		majorTicks: [
			0,
			200,
			400,
			600,
			800,
			1000,
			1200,
			1400,
			1600,
			1800,
			2000
		],
		minorTicks: 2,
		strokeTicks: true,
		highlights: [
			{
				"from": 400,
				"to": 900,
				"color": "rgba(145, 144, 93, .75)"
			},
			{
				"from": 900,
				"to": 1400,
				"color": "rgba(248, 180, 3, .75)"
			},
			{
				"from": 1400,
				"to": 2000,
				"color": "rgba(200, 50, 50, .75)"
			}
		],
		colorPlate: '#fff',
		borderShadowWidth: 0,
		borders: false,
		needleType: "arrow",
		needleWidth: 3,
		needleCircleSize: 7,
		needleCircleOuter: true,
		needleCircleInner: false,
		colorNeedle: 'rgba(0, 0, 0, 1)',
		colorNeedleEnd: 'rgba(0, 0, 0, .9)',
		colorBarProgress: 'rgba(43, 117, 227, 0.75)',
		animationDuration: 500,
		animationRule: "quint",
		tickSide: "both",
		numberSide: "both",
		needleSide: "both",
		barWidth: 12,
		barBeginCircle: false,
		value: 0
	}).draw();
}

function updateBar(value) {
	bar.value = value;
}












