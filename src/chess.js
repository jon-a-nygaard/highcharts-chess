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
        showInLegend: false
    });
    
    /* Series functions */
    seriesTypes.chess = extendClass(seriesTypes.scatter, merge({
        type: "chess",
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
                len = 3,
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
        translate: function () {
            Series.prototype.translate.call(this);
            this.drawChessBoard();
        },
        bindAxes: function () {
            var chessAxis = {
                endOnTick: false,
                gridLineWidth: 0,
                lineWidth: 0,
                min: 0,
                minPadding: 0,
                max: 24,
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