var jQuery = require('jquery'),
	chess = require('./chess.js');
jQuery(document).ready(function () {
	var chart = new chess.Chart({
		chart: {
			animation: false,
			renderTo: 'container',
			width: 400,
			height: 400,
			plotBorderWidth: 1,
			plotBorderColor: '#000000'
		},
		series: [{
			type: "chess",
			board: {
				dark: "#206629",
				light: "white",
				white: {
					fill: "#FFFFFF",
					border: "#000000"
				},
				black: {
					fill: "#000000",
					border: "#FFFFFF"
				}
			}
		}],
		title: {
			text: "Chess made with Highcharts"
		},
		tooltip: {
			enabled: false
		}
	});
});