$(document).ready(function(){
	$.jqplot.config.enablePlugins = true;
	
    $.jsDate.regional['ux'] = {
        monthNames: ['Январь','Февраль','Март','Апрель','МАй','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
        dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
        dayNamesShort: ['Вс','Пон','Вт','Ср','Чт','Пт','Сб'],
        formatString: '%d-%m-%Y %H:%M:%S'
    };
    $.jsDate.regional.getLocale();
	
	initBar();
	update();
	setInterval(update, 15000);
	
	$("#period").on('change', update);
});

function update() {
	var period = $("#period").val();
	var periodText = $("#period :selected").text().toLowerCase();
	$.getJSON( "data/"+period, function( resp ) {
		updateData(resp.current, resp.average);
		loadChart(periodText, resp.data);
		updateBar(resp.current);
	});
}

function updateData(current, average) {
	$(".current").html(current + ' ppm');
	$(".average").html(average + ' ppm');
}

function loadChart(title, data) {
	$("#chart").html('');
	var plot1 = $.jqplot('chart', [data], {
		title:"UX Room Air Monitor ("+ title +")",
		axes:{
			xaxis:{
				renderer:$.jqplot.DateAxisRenderer
			}
		},
		series:[{
			lineWidth:2, 
			markerOptions:{
				style:'circle', 
				size: 2
			},
			color: '#000'
		}],
		highlighter: {
			showMarker:true,
			tooltipAxes: 'xy',
			yvalues: 2,
			tooltipLocation: 'n',
			fadeTooltip: false,
			formatString:'<table style="margin: 10px 15px 10px 8px;"> \
				<tr><td align="center">%s</td></tr> \
				<tr><td align="center">%d ppm</td></tr> \
			</table>'
		},
		canvasOverlay: {
			show: true,
			objects: [
				{horizontalLine: {
					y: 900,
					color: "#5bae21",
					xOffset: 0,
					shadow: false,
					showTooltip: false
				}}
			]
		}
	});
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












