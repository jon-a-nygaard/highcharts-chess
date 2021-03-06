'use strict'
import H from 'highcharts'
import Board from './board.js'
import ChessGame from './chessGame.js'
const Axis = H.Axis.prototype
const Series = H.Series.prototype
const scatterSeries = H.seriesTypes.scatter.prototype
const extend = H.extend
const each = H.each
const wrap = H.wrap
const seriesType = H.seriesType

/**
 * Returns true if any item in a collection matches a given predicate.
 * @param {Mixed[]} Collection to look in.
 * @param {Function} Predicate to control.
 * @returns {Bool} True if any item in the collection matches the predicate.
 */
const any = (arr, predicate) => arr.some(predicate)
const reduce = (arr, fn, initial) => arr.reduce(fn, initial)
const getPointData = (pos, obj, size, icons) => ({
  color: obj.color,
  marker: {
    height: size,
    symbol: 'url(' + icons + '/' + obj.color + '_' + obj.type + '.png)',
    width: size
  },
  position: pos,
  type: obj.type
})
/**
 * Override the Highcharts axis to always be square.
 * @todo  Instead of overriding, compose the SquareAxis from the default Axis.
 */
wrap(Axis, 'setAxisSize', function (proceed) {
  proceed.call(this)
  this.len = Math.max(Math.min(this.width, this.height), 0)
})

/**
 * Add chess as a new type of series.
 **/
seriesType('chess', 'scatter', {
  dataLabels: {
    enabled: false
  },
  states: {
    hover: {
      enabled: false
    }
  },
  showInLegend: false
}, {
  init: function (chart, options) {
    const series = this
    series.board = new Board(options.board, series, chart.renderer)
    series.board.onSquareClick = function (pos) {
      const piece = series.game.get({ square: pos })
      const color = (piece ? piece.color : undefined)
      series.doClickAction(pos, color)
    }
    if (series.board.options.interactive) {
      options.cursor = 'pointer'
    }
    // Initialize the game tracker
    series.game = new ChessGame()
    scatterSeries.init.call(series, chart, options)
  },
  doClickAction: function (pos, color) {
    const series = this
    const validMoves = series.validMoves
    const validMove = validMoves && any(validMoves, move => move.to === pos)
    if (series.selected === pos) {
      series.removeSelected()
    } else if (series.game.turn() === color) {
      series.setSelected(pos)
    } else if (validMove) {
      // Move selected to this position, if it is a valid move.
      series.move(pos)
    } else {
      series.removeSelected()
    }
    series.isDirty = true
    series.chart.redraw()
  },
  drawChessPieces: function () {
    const series = this
    const options = series.options
    const board = series.board
    const game = series.game
    const width = series.xAxis.translate(2, 0, 0, 0, 1) - series.xAxis.translate(0, 0, 0, 0, 1)
    const height = series.yAxis.translate(2, 0, 0, 0, 1) - series.yAxis.translate(0, 0, 0, 0, 1)
    const size = width > height ? height : width
    const data = reduce(board.positions, (arr, pos) => {
      const piece = game.get(pos)
      if (piece) {
        let point = getPointData(pos, piece, size, options.icons)
        if (board.options.interactive) {
          if (!point.events) {
            point.events = {}
          }
          point.events.click = function () {
            series.doClickAction(this.position, this.color)
          }
        }
        arr.push(point)
      }
      return arr
    }, [])
    // TODO Find a way to set data, before Series.processData is called.
    series.setData(data, false)
  },
  move: function (pos) {
    const series = this
    const selected = series.selected
    const game = series.game
    if (selected) {
      const moved = game.move({
        from: series.selected,
        to: pos,
        promotion: 'q'
      })
      if (moved) {
        series.onMove(moved)
        series.moveStack = []
        series.removeSelected()
      }
    }
  },
  moveStack: [],
  onMove: function (move) {
    const v = this.game
    if (this.options.onMove) {
      this.options.onMove({
        turn: v.turn(),
        move: move
      })
    }
  },
  removeSelected: function () {
    this.selected = null
    this.validMoves = []
  },
  setPointValues: function () {
    const series = this
    const board = series.board
    const points = series.points
    each(points, function (point) {
      point.shapeType = 'circle'
      point.x = board.getXFromPosition(point.position)
      point.y = board.getYFromPosition(point.position)
      point.shapeArgs = {
        x: Math.round(series.xAxis.translate(point.x, 0, 0, 0, 1)),
        y: Math.round(series.yAxis.translate(point.y, 0, 0, 0, 1))
      }
      point.plotX = point.shapeArgs.x
      point.plotY = point.shapeArgs.y
    })
  },
  setSelected: function (pos) {
    this.selected = pos
    this.validMoves = this.game.moves({
      square: this.selected,
      verbose: true
    })
  },
  translate: function () {
    this.board.render()
    this.drawChessPieces()
    // Call original translate to generate points, so we can work with them.
    // TODO setPointValues on the data instead of working with points
    Series.translate.call(this)
    this.setPointValues()
    Series.translate.call(this) // Call again to set correct point values
  },
  undo: function () {
    let move = this.game.undo()
    if (move !== null) {
      this.onMove(move)
      this.isDirty = true
      this.chart.redraw()
      this.moveStack.push(move)
    } else {
      move = false
    }
    return move
  },
  redo: function () {
    let move = (this.moveStack.length) ? this.moveStack.pop() : false
    let moved = this.game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion
    })
    if (moved !== null) {
      this.onMove(moved)
      this.isDirty = true
      this.chart.redraw()
    } else {
      this.moveStack.push(move)
      move = false
    }
    return move
  },
  bindAxes: function () {
    const chessAxis = {
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
    }
    Series.bindAxes.call(this)
    extend(this.yAxis.options, chessAxis)
    extend(this.xAxis.options, chessAxis)
  }
})

export default H
