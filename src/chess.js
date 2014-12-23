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

    });
    
    /* Series functions */
    seriesTypes.chess = extendClass(seriesTypes.scatter, merge({
        type: "chess",
        drawChessBoard: function () {
            
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
                // tickPositions: []
            };
            Series.prototype.bindAxes.call(this);
            H.extend(this.yAxis.options, chessAxis);
            H.extend(this.xAxis.options, chessAxis);
        }
    }));

}(Highcharts));