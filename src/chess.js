// Highcharts needs an adapter.
// @todo Remove when Highcharts has better support for Node.
window.jQuery = require('jquery');
// Load Highcharts. Highcharts is added to the window object.
// @todo Assign to variable, when Highcharts returns to module.exports.
require('highcharts-release/highcharts.src.js');
(function (H, A) {
	var Chess = require('chess.js').Chess,
		defaultOptions = H.getOptions(),
		each = H.each,
		extendClass = H.extendClass,
		merge = H.merge,
		plotOptions = defaultOptions.plotOptions,
		Series = H.Series,
		seriesTypes = H.seriesTypes;

	/* Default plotting options */
	plotOptions.chess = merge(plotOptions.scatter, {
		dataLabels: {
			enabled: false,
		},
		marker: {
			radius: 15
		},
		states: {
			hover: {
				enabled: false
			}
		},
		showInLegend: false
	});
	
	/* Series functions */
	seriesTypes.chess = extendClass(seriesTypes.scatter, merge({
		type: "chess",
		/**
		 * Creates a single rectangle, representing one board square, and returns the created element.
		 * @param string fill The color of the square.
		 * @param Number x The starting x position of the square.
		 * @param Number y The starting y position of the square.
		 * @param Number length The length of the sides on the square.
		 * @return Element Returns a Highcharts Element.
		 */
		addBoardSquare: function (fill, x, y, length) {
			var series = this,
				xAxis = series.xAxis,
				yAxis = series.yAxis,
				x1 = xAxis.left + Math.round(xAxis.translate(x, 0, 0, 0, 1)),
				x2 = xAxis.left + Math.round(xAxis.translate(x + length, 0, 0, 0, 1)),
				y1 = xAxis.top + Math.round(yAxis.translate(y, 0, 0, 0, 1)),
				y2 = xAxis.top + Math.round(yAxis.translate(y + length, 0, 0, 0, 1)),
				renderer = series.chart.renderer,
				element = renderer.rect(x1, y1, x2 - x1, y2 - y1, 0)
				.attr({
					fill: fill,
					zIndex: 0
				}).add();
				return element;
		},
		addClickToMove: function (element, file, rank) {
			var series = this;
			element.on("click", function () {
				series.selected.position = series.columns[file] + rank;
				series.isDirty = true;
				series.chart.redraw();
			});
		},
		addPiece: function (pos, obj) {
			var series = this,
				data = series.options.data,
				piece = {
					color: obj.color,
					position: pos,
					type: obj.type
				};
			data.push(piece);
		},
		columns: ["a", "b", "c", "d", "e", "f", "g", "h"],
		columnsToPosition: { "a": 1, "b": 3, "c": 5, "d": 7, "e": 9, "f": 11, "g": 13, "h": 15 },
		/**
		* Draws all the rectangles for the chess board
		* @todo: add shapes to new group. set board size in options.
		*/
		drawChessBoard: function () {
			var series = this,
				validation = series.validation,
				board = series.options.board,
				dark = board.dark,
				light = board.light,
				fill,
				pos,
				x = 0,
				y = 0,
				len = 2;
			for (var rank = 8; rank > 0; rank--) {
				for (var file = 0; file < 8; file++) {
					fill = fill === light ? dark : light;
					square = series.addBoardSquare(fill, x, y, len);
					x += len;
					pos = series.getPosition(file, rank);
					piece = validation.get(pos);
					if (piece) {
						series.addPiece(pos, piece);
					}
				}
				y += len;
				x = 0;
				fill = fill === light ? dark : light;
			}
			// Set the data
			// @todo Find a way to set data, before Series.processData is called.
			series.setData(series.options.data, false);          
		},
		/**
		 *
		 */
		getPosition: function (file, rank) {
			return this.columns[file] + rank;
		},
		/**
		 * Loops over all data and adds a default symbol marker.
		 * @todo Let the users override both symbol sizes and url.
		 */
		setDefaultSymbols: function () {
			var data = this.options.data,
				url,
				xAxis = this.xAxis,
				yAxis = this.yAxis,
				width = xAxis.translate(2, 0, 0, 0, 1) - xAxis.translate(0, 0, 0, 0, 1),
				height = yAxis.translate(2, 0, 0, 0, 1) - yAxis.translate(0, 0, 0, 0, 1),
				size = width > height ? height : width;
			each(data, function (d) {
				url = "url(icons/" + d.color + "_" + d.type + ".png)";
				d.marker = {
					symbol: url,
					width: size,
					height: size
				};
			});
		},
		setPointValues: function () {
			var series = this,
				points = series.points,
				getXValue = function (pos) {
					var x = series.columnsToPosition[pos.charAt(0)];
						return x;
				},
				getYValue = function (pos) {
					var y = 2 * +pos.charAt(1) - 1;
					return y;
				};
			each(points, function (point) {
				point.shapeType = "circle";
				point.x = getXValue(point.position);
				point.y = getYValue(point.position);
				point.shapeArgs = {
					x: Math.round(series.xAxis.translate(point.x, 0, 0, 0, 1)),
					y: Math.round(series.yAxis.translate(point.y, 0, 0, 0, 1)),
				};
				point.plotX = point.shapeArgs.x;
				point.plotY = point.shapeArgs.y;
			});
		},
		translate: function () {
			if (!this.validation) {
				// Initialize the game tracker
				this.validation = new Chess();
				this.drawChessBoard();
			}
			this.setDefaultSymbols();
			// Call original translate to generate points, so we can work with them.
			// @todo setPointValues on the data instead of working with points, then this is is 
			Series.prototype.translate.call(this);
			this.setPointValues();
			Series.prototype.translate.call(this); // Call again to set correct point values
		},
		bindAxes: function () {
			var chessAxis = {
				endOnTick: false,
				gridLineWidth: 0,
				lineWidth: 0,
				min: 0,
				minPadding: 0,
				max: 16,
				maxPadding: 0,
				startOnTick: false,
				title: null,
				tickPositions: []
			};
			Series.prototype.bindAxes.call(this);
			H.extend(this.yAxis.options, chessAxis);
			H.extend(this.xAxis.options, chessAxis);
		}
	}));

	// Return Highcharts object to node
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = H;
	}
}(Highcharts, HighchartsAdapter));