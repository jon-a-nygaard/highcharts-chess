/*global HighchartsAdapter */
(function (H) {
    var defaultOptions = H.getOptions(),
        each = H.each,
        extendClass = H.extendClass,
        merge = H.merge,
        plotOptions = defaultOptions.plotOptions,
        Series = H.Series,
        seriesTypes = H.seriesTypes;

    /* Default plotting options */
    plotOptions.chess = merge(plotOptions.scatter, {
        dataLabels: {
            align: 'center',
            enabled: true,
            verticalAlign: 'middle',
            // verticalAlign: 'middle',
            formatter: function () {
                return this.point.piece;
            }
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
        * Draws all the rectangles for the chess board
        * @todo: add shapes to new group. set board size in options.
        */
        drawChessBoard: function () {
            var series = this,
                renderer = series.chart.renderer,
                fill,
                xAxis = series.xAxis,
                yAxis = series.yAxis,
                board = series.options.board,
                x = 0,
                y = 0,
                dark = board.dark,
                light = board.light,
                len = 2,
                x1, x2, y1, y2;

            for (var i = 1; i <= 8; i++) {
                for (var j = 1; j <= 8; j++) {
                    x1 = xAxis.left + Math.round(xAxis.translate(x, 0, 0, 0, 1));
                    x2 = xAxis.left + Math.round(xAxis.translate(x + len, 0, 0, 0, 1));
                    y1 = xAxis.top + Math.round(yAxis.translate(y, 0, 0, 0, 1));
                    y2 = xAxis.top + Math.round(yAxis.translate(y + len, 0, 0, 0, 1));
                    fill = fill === light ? dark : light;
                    renderer.rect(x1, y1, x2 - x1, y2 - y1, 0)
                    .attr({
                        fill: fill,
                        zIndex: 0
                    }).add();
                    x += len;    
                }
                y += len;
                x = 0;
                fill = fill === light ? dark : light;
            }            
        },
        setPointValues: function () {
            var series = this,
                points = series.points,
                getXValue = function (pos) {
                    var arr = {
                            "A": 1,
                            "B": 3,
                            "C": 5,
                            "D": 7,
                            "E": 9,
                            "F": 11,
                            "H": 13
                        },
                        x = arr[pos.charAt(0)];
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
            // Call original translate to generate points, so we can work with them.
            // @todo setPointValues on the data instead of working with points, then this is is 
            Series.prototype.translate.call(this);
            this.drawChessBoard();
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

}(Highcharts));