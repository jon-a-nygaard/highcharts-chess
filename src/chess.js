'use strict'
import H from 'highcharts'
import { Chess } from 'chess.js'
import Board from './board.js'
let each = H.each
let Series = H.Series

/**
 * Returns true if any item in a collection matches a given predicate.
 * Inspired by Underscore.js _.any function.
 * @param {Mixed[]} Collection to look in.
 * @param {Function} Predicate to control.
 * @returns {Bool} True if any item in the collection matches the predicate.
 * @todo Only works for arrays, should modif to work with objects
 */
const any = (obj, predicate) => {
  let found = false
  let result
  H.each(obj, function (item) {
    result = predicate(item)
    if (result) {
      found = true
      // @todo break the loop.
    }
  })
  return found
}

/**
 * Override the Highcharts axis to always be square.
 * @todo  Instead of overriding, compose the SquareAxis from the default Axis.
 */
H.wrap(H.Axis.prototype, 'setAxisSize', function (proceed) {
  proceed.call(this)
  this.len = Math.max(Math.min(this.width, this.height), 0)
})

/**
 * Add chess as a new type of series.
 **/
H.seriesType('chess', 'scatter', {
  dataLabels: {
    enabled: false
  },
  interactive: true,
  states: {
    hover: {
      enabled: false
    }
  },
  showInLegend: false
}, {
  init: function (chart, options) {
    this.board = new Board(this, chart.renderer)
    H.seriesTypes.scatter.prototype.init.call(this, chart, options)
  },
  /**
   * Creates a single rectangle, representing one board square, and returns the created element.
   * @param {String} The position of the square.
   * @return {Element} Returns a Highcharts Element.
   */
  addBoardSquare: function (pos) {
    let size = this.getSquareSizeFromPosition(pos)
    let element = this.chart.renderer.rect(size.x, size.y, size.width, size.height, 0)
      .attr({
        zIndex: 0
      }).add(this.boardGroup)
    element.position = pos
    return element
  },
  addClickToPiece: function (piece) {
    let series = this
    if (!piece.events) {
      piece.events = {}
    }
    piece.events.click = function () {
      series.doClickAction(this.position, this.color)
    }
  },
  addClickToSquare: function (element) {
    let series = this
    let pos = element.position
    element.on('click', function () {
      let piece = series.validation.get({ square: pos })
      let color = (piece ? piece.color : undefined)
      series.doClickAction(pos, color)
    })
  },
  addPiece: function (pos, obj, size) {
    let piece = {
      color: obj.color,
      marker: {
        height: size,
        symbol: 'url(icons/' + obj.color + '_' + obj.type + '.png)',
        width: size
      },
      position: pos,
      type: obj.type
    }
    return piece
  },
  doClickAction: function (pos, color) {
    let series = this
    let validMove
    let validMoves = series.validMoves
    validMove = validMoves && any(validMoves, function (move) {
      return move.to === pos
    })
    if (series.selected === pos) {
      series.removeSelected()
    } else if (series.validation.turn() === color) {
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
  /**
  * Draws all the rectangles for the chess board
  * @todo: set board size in options.
  */
  drawChessBoard: function () {
    let series = this
    let boardSquares = series.boardSquares
    let square
    if (!boardSquares) {
      boardSquares = series.boardSquares = []
      each(series.boardPositions, function (pos) {
        square = series.addBoardSquare(pos)
        boardSquares.push(square)
      })
    }
    each(series.boardSquares, function (element) {
      series.setSquareSizes(element)
      series.setSquareFill(element)
      if (series.options.interactive) {
        series.addClickToSquare(element)
      }
    })
  },
  drawChessPieces: function () {
    let series = this
    let validation = series.validation
    let width = series.xAxis.translate(2, 0, 0, 0, 1) - series.xAxis.translate(0, 0, 0, 0, 1)
    let height = series.yAxis.translate(2, 0, 0, 0, 1) - series.yAxis.translate(0, 0, 0, 0, 1)
    let size = width > height ? height : width
    let data = []
    let point
    let piece
    each(series.boardPositions, function (pos) {
      piece = validation.get(pos)
      if (piece) {
        point = series.addPiece(pos, piece, size)
        data.push(point)
        if (series.options.interactive) {
          series.addClickToPiece(point)
        }
      }
    })
    // @todo Find a way to set data, before Series.processData is called.
    series.setData(data, false)
  },
  getSquareSizeFromPosition: function (pos) {
    let series = this
    let xAxis = series.xAxis
    let yAxis = series.yAxis
    let x = series.getXFromPosition(pos)
    let y = series.getYFromPosition(pos)
    let x1 = xAxis.left + Math.round(xAxis.translate(x - 1, 0, 0, 0, 1))
    let x2 = xAxis.left + Math.round(xAxis.translate(x + 1, 0, 0, 0, 1))
    let y1 = xAxis.top + Math.round(yAxis.translate(16 - y - 1, 0, 0, 0, 1))
    let y2 = xAxis.top + Math.round(yAxis.translate(16 - y + 1, 0, 0, 0, 1))
    let size = {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    }
    return size
  },
  /**
   * Returns the X value of a board position.
   * @param String pos The board position.
   * @return Number The X value.
   */
  getXFromPosition: function (pos) {
    let columnsToPosition = { 'a': 1, 'b': 3, 'c': 5, 'd': 7, 'e': 9, 'f': 11, 'g': 13, 'h': 15 }
    return columnsToPosition[pos.charAt(0)]
  },
  /**
   * Returns the Y value of a board position.
   * @param String pos The board position.
   * @return Number The Y value.
   */
  getYFromPosition: function (pos) {
    return 2 * +pos.charAt(1) - 1
  },
  move: function (pos) {
    let series = this
    let selected = series.selected
    let validation = series.validation
    let moved
    if (selected) {
      moved = validation.move({
        from: series.selected,
        to: pos,
        promotion: 'q'
      })
      if (moved) {
        series.moveStack = []
        series.removeSelected()
      }
    }
  },
  moveStack: [],
  removeSelected: function () {
    delete this.selected
    delete this.validMoves
  },
  setPointValues: function () {
    let series = this
    let points = series.points
    each(points, function (point) {
      point.shapeType = 'circle'
      point.x = series.getXFromPosition(point.position)
      point.y = series.getYFromPosition(point.position)
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
    this.validMoves = this.validation.moves({
      square: this.selected,
      verbose: true
    })
  },
  setSquareFill: function (element) {
    let series = this
    let pos = element.position
    let validMoves = series.validMoves
    let validMove = validMoves && any(validMoves, function (move) {
      return move.to === pos
    })
    let fill
    if (series.selected === pos) {
      fill = (series.options.board.selected ? series.options.board.selected : series.board.getFillFromPosition(pos))
    } else if (validMove) {
      fill = series.options.board.moves
    } else {
      fill = series.board.getFillFromPosition(pos)
    }
    element.attr({
      fill: fill
    })
  },
  setSquareSizes: function (element) {
    let size = this.getSquareSizeFromPosition(element.position)
    element.animate(size)
  },
  translate: function () {
    let subtitle
    if (!this.validation) {
      // Initialize the game tracker
      this.validation = new Chess()
      this.boardPositions = this.board.getBoardPositions()
      this.boardGroup = this.chart.renderer.g('boardSquares').add()
      if (this.options.interactive) {
        this.boardGroup.css({
          cursor: 'pointer'
        })
        this.options.cursor = 'pointer'
      }
    }
    // @todo Move this logic to more suitable location. Title logic is already performed, therefore subtitle margins is not correctly calculated.
    subtitle = (this.validation.turn() === 'w' ? 'White' : 'Black') + ' to move'
    this.chart.setTitle(null, { text: subtitle }, false)

    this.drawChessBoard()
    this.drawChessPieces()
    // Call original translate to generate points, so we can work with them.
    // @todo setPointValues on the data instead of working with points, then this is
    Series.prototype.translate.call(this)
    this.setPointValues()
    Series.prototype.translate.call(this) // Call again to set correct point values
  },
  undo: function () {
    let move = this.validation.undo()
    if (move !== null) {
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
    let moved = this.validation.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion
    })
    if (moved !== null) {
      this.isDirty = true
      this.chart.redraw()
    } else {
      this.moveStack.push(move)
      move = false
    }
    return move
  },
  bindAxes: function () {
    let chessAxis = {
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
    Series.prototype.bindAxes.call(this)
    H.extend(this.yAxis.options, chessAxis)
    H.extend(this.xAxis.options, chessAxis)
  }
})

export default H
