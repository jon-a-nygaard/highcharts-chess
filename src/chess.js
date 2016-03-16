(function () {
	var any,
		H = Highcharts = require('highcharts'),
		Chess = require('chess.js').Chess,
		defaultOptions = H.getOptions(),
		each = H.each,
		extendClass = H.extendClass,
		merge = H.merge,
		plotOptions = defaultOptions.plotOptions,
		Series = H.Series,
		seriesTypes = H.seriesTypes;

	/**
	 * Returns true if any item in a collection matches a given predicate.
	 * Inspired by Underscore.js _.any function.
	 * @param {Mixed[]} Collection to look in.
	 * @param {Function} Predicate to control.
	 * @returns {Bool} True if any item in the collection matches the predicate.
	 * @todo Only works for arrays, should modif to work with objects
	 */
	any = function (obj, predicate) {
		var found = false,
			result;
		H.each(obj, function (item) {
			result = predicate(item);
			if (result) {
				found = true;
				// @todo break the loop.
			}
		});
		return found;
	}

	/* Default plotting options */
	plotOptions.chess = merge(plotOptions.scatter, {
		dataLabels: {
			enabled: false,
		},
		interactive: true,
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
		 * @param {String} The position of the square.
		 * @return {Element} Returns a Highcharts Element.
		 */
		addBoardSquare: function (pos) {
			var size = this.getSquareSizeFromPosition(pos),
				element = this.chart.renderer.rect(size.x, size.y, size.width, size.height, 0)
				.attr({
					zIndex: 0,
				}).add(this.boardGroup);
				element.position = pos;
				return element;
		},
		addClickToPiece: function (piece) {
			var series = this;
			if (!piece.events) {
				piece.events = {};
			}
			piece.events.click = function () {
				series.doClickAction(this.position, this.color);
			};
		},
		addClickToSquare: function (element) {
			var series = this,
				pos = element.position;
			element.on("click", function () {
				var piece = series.validation.get({ square: pos }),
					color = (piece ? piece.color : undefined);
				series.doClickAction(pos, color);
			});
		},
		addPiece: function (pos, obj, size) {
			var series = this,
				piece = {
					color: obj.color,
					marker: {
						height: size,
						symbol: "url(icons/" + obj.color + "_" + obj.type + ".png)",
						width: size
					},
					position: pos,
					type: obj.type
				};
			return piece;
		},
		columns: ["a", "b", "c", "d", "e", "f", "g", "h"],
		doClickAction: function (pos, color) {
			var series = this,
				validMove,
				validMoves = series.validMoves;
			validMove = validMoves && any(validMoves, function (move) {
				return move.to === pos;
			});
			if (series.selected === pos) {
				series.removeSelected();
			} else if (series.validation.turn() === color) {
				series.setSelected(pos);
			} else if (validMove) {
				// Move selected to this position, if it is a valid move.
				series.move(pos);
			} else {
				series.removeSelected();
			}
			series.isDirty = true;
			series.chart.redraw();
		},
		/**
		* Draws all the rectangles for the chess board
		* @todo: set board size in options.
		*/
		drawChessBoard: function () {
			var series = this,
				board = series.board,
				validation = series.validation,
				square;
			if (!board) {
				board = series.board = [];
				each(series.boardPositions, function (pos) {
					square = series.addBoardSquare(pos);
					board.push(square);
				});
			}
			each(series.board, function (element) {
				series.setSquareSizes(element);
				series.setSquareFill(element);
				if (series.options.interactive) {
					series.addClickToSquare(element);
				}
			})
		},
		drawChessPieces: function () {
			var series = this,
				validation = series.validation,
				width = series.xAxis.translate(2, 0, 0, 0, 1) - series.xAxis.translate(0, 0, 0, 0, 1),
				height = series.yAxis.translate(2, 0, 0, 0, 1) - series.yAxis.translate(0, 0, 0, 0, 1),
				size = width > height ? height : width,				
				data = [],
				point,
				piece;
			each(series.boardPositions, function (pos) {
				piece = validation.get(pos);
				if (piece) {
					point = series.addPiece(pos, piece, size);
					data.push(point);
					if (series.options.interactive) {
						series.addClickToPiece(point);
					}
				}	
			});
			// @todo Find a way to set data, before Series.processData is called.
			series.setData(data, false);
		},
		/**
		 * Returns an array of all square positions on the board.
		 * @return {String[]} The positions.
		 */
		getBoardPositions: function () {
			var series = this,
				pos,
				positions = [];
			for (var rank = 8; rank > 0; rank--) {
				for (var file = 0; file < 8; file++) {
					pos = series.getPosition(file, rank);
					positions.push(pos);
				}
			}
			return positions;
		},
		/**
		 * Returns the dark or light fill color of a square, based upon its position.
		 * @param {String} pos The board position of the square.
		 * @return {String} Color, The dark or light fill color of the board.
		 */
		getFillFromPosition: function (pos) {
			var board = this.options.board,
				file = this.columns.indexOf(pos.charAt(0)) % 2,
				rank = pos.charAt(1) % 2,
				light = ((file - rank) === 0),
				fill = light ? board.light : board.dark;
			return fill;
		},
		/**
		 * Returns the position on the board from a file and rank number.
		 * @param Number file The number of file.
		 * @param Number rank The number of rank.
		 * @return String The board position. 
		 */
		getPosition: function (file, rank) {
			return this.columns[file] + rank;
		},
		getSquareSizeFromPosition: function (pos) {
			var series = this,
				xAxis = series.xAxis,
				yAxis = series.yAxis,
				x = series.getXFromPosition(pos),
				y = series.getYFromPosition(pos),
				x1 = xAxis.left + Math.round(xAxis.translate(x - 1, 0, 0, 0, 1)),
				x2 = xAxis.left + Math.round(xAxis.translate(x + 1, 0, 0, 0, 1)),
				y1 = xAxis.top + Math.round(yAxis.translate(16 - y - 1, 0, 0, 0, 1)),
				y2 = xAxis.top + Math.round(yAxis.translate(16 - y + 1, 0, 0, 0, 1)),
				size = {
					x: x1,
					y: y1,
					width: x2 - x1,
					height: y2 - y1
				};
			return size;
		},
		/**
		 * Returns the X value of a board position.
		 * @param String pos The board position.
		 * @return Number The X value.
		 */
		getXFromPosition: function (pos) {
			var columnsToPosition = { "a": 1, "b": 3, "c": 5, "d": 7, "e": 9, "f": 11, "g": 13, "h": 15 };
			return columnsToPosition[pos.charAt(0)];
		},
		/**
		 * Returns the Y value of a board position.
		 * @param String pos The board position.
		 * @return Number The Y value.
		 */
		getYFromPosition: function (pos) {
			return 2 * +pos.charAt(1) - 1;
		},
		move: function (pos) {
			var series = this,
				selected = series.selected,
				validation = series.validation,
				moved;
			if (selected) {
				moved = validation.move({
					from: series.selected,
					to: pos,
					promotion: 'q'
				});
				if (moved) {
					series.moveStack = [];
					series.removeSelected();
				}
			}
		},
		moveStack: [],
		removeSelected: function () {
			delete this.selected;
			delete this.validMoves;
		},
		setPointValues: function () {
			var series = this,
				points = series.points;
			each(points, function (point) {
				point.shapeType = "circle";
				point.x = series.getXFromPosition(point.position);
				point.y = series.getYFromPosition(point.position);
				point.shapeArgs = {
					x: Math.round(series.xAxis.translate(point.x, 0, 0, 0, 1)),
					y: Math.round(series.yAxis.translate(point.y, 0, 0, 0, 1)),
				};
				point.plotX = point.shapeArgs.x;
				point.plotY = point.shapeArgs.y;
			});
		},
		setSelected: function (pos) {
			this.selected = pos;
			this.validMoves = this.validation.moves({
				square: this.selected,
				verbose: true
			});
		},
		setSquareFill: function (element) {
			var series = this,
				pos = element.position,
				validMoves = series.validMoves,
				validMove = validMoves && any(validMoves, function (move) {
					return move.to === pos;
				}),
				fill;
			if (series.selected === pos) {
				fill = (series.options.board.selected ? series.options.board.selected : series.getFillFromPosition(pos));
			} else if (validMove) {
				fill = series.options.board.moves;
			} else {
				fill = series.getFillFromPosition(pos);
			}
			element.attr({
				fill: fill
			});
		},
		setSquareSizes: function (element) {
			var size = this.getSquareSizeFromPosition(element.position);
			element.animate(size);
		},
		translate: function () {
			var subtitle;
			if (!this.validation) {
				// Initialize the game tracker
				this.validation = new Chess();
				this.boardPositions = this.getBoardPositions();
				this.boardGroup = this.chart.renderer.g("boardSquares").add();
				if (this.options.interactive) {
					this.boardGroup.css({
						cursor: "pointer"
					});
					this.options.cursor = "pointer";
				}
			}
			// @todo Move this logic to more suitable location. Title logic is already performed, therefore subtitle margins is not correctly calculated.
			subtitle = (this.validation.turn() === "w" ? "White" : "Black") + " to move";
			this.chart.setTitle(null, { text: subtitle }, false);

			this.drawChessBoard();
			this.drawChessPieces();
			// Call original translate to generate points, so we can work with them.
			// @todo setPointValues on the data instead of working with points, then this is is 
			Series.prototype.translate.call(this);
			this.setPointValues();
			Series.prototype.translate.call(this); // Call again to set correct point values
		},
		undo: function () {
			var move = this.validation.undo();
			if (move !== null) {
				this.isDirty = true;
				this.chart.redraw();
				this.moveStack.push(move);
			} else {
				move = false;
			}
			return move;
		},
		redo: function () {
			var move = (this.moveStack.length) ? this.moveStack.pop() : false,
				moved = this.validation.move({
					from: move.from,
					to: move.to,
					promotion: move.promotion
				});
			if (moved !== null) {
				this.isDirty = true;
				this.chart.redraw();
			} else {
				this.moveStack.push(move);
				move = false;
			}
			return move;
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
}());