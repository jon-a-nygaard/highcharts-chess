var chess = require('./chess.js');
var chart = new chess.Chart({
	chart: {
		animation: false,
		renderTo: 'container'
	},
	series: [{
		type: "chess",
		board: {
			// Palette: http://paletton.com/#uid=101050kp5mHv9gRrOjYlRp9ios2
			dark: "#9F1815",
			light: "#B52B27",
			selected: false,
			moves: "#DF625F"
		}
	}],
	title: {
		text: "Chess made with Highcharts"
	},
	tooltip: {
		enabled: false
	}
});
