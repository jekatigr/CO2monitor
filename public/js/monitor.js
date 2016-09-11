$(document).ready(function(){
	$.jqplot.config.enablePlugins = true;
	
	 // Add a new localization
    $.jsDate.regional['ux'] = {
        monthNames: ['Январь','Февраль','Март','Апрель','МАй','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
        dayNames: ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
        dayNamesShort: ['Пон','Вт','Ср','Чт','Пт','Сб','Вс'],
        formatString: '%d-%m-%Y %H:%M:%S'
    };
    $.jsDate.regional.getLocale();
	
	loadChart();
	setInterval(loadChart, 15000);
	
	$("#period").on('change', loadChart);
});

function loadChart() {
	var period = $("#period").val();
	var periodText = $("#period :selected").text().toLowerCase();
	$.getJSON( "data/"+period, function( resp ) {
		$("#chart").html('');
		$(".current").html(resp.current + ' ppm');
		$(".average").html(resp.average + ' ppm')		
		
		var plot1 = $.jqplot('chart', [resp.data], {
			title:"UX Room Air Monitor ("+ periodText +")",
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
						y: 800,
						color: "#5bae21",
						xOffset: 0,
						shadow: false,
						showTooltip: false
					}}
				]
			}
		});
	});
}