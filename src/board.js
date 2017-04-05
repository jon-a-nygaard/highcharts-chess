'use strict'
// const each = (arr, fn, ctx) => Array.prototype.forEach.call(arr, fn, ctx)
const any = (arr, predicate) => arr.some(predicate)

function Board (series, renderer) {
  this.renderer = renderer
  this.series = series
  return this
}

Board.prototype = {
  /**
   * Initialization of the board. Should only run once.
   */
  init: function () {
    this.render()
  },
  columns: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  /**
   * Returns an array of all square positions on the board.
   * @return {String[]} The positions.
   */
  getBoardPositions: function () {
    let board = this
    let pos
    let positions = []
    for (let rank = 8; rank > 0; rank--) {
      for (let file = 0; file < 8; file++) {
        pos = board.getPosition(file, rank)
        positions.push(pos)
      }
    }
    return positions
  },
  /**
   * Returns the dark or light fill color of a square, based upon its position.
   * @param {String} pos The board position of the square.
   * @return {String} Color, The dark or light fill color of the board.
   */
  getFillFromPosition: function (pos) {
    let board = this.series.options.board
    let file = this.columns.indexOf(pos.charAt(0)) % 2
    let rank = pos.charAt(1) % 2
    let light = ((file - rank) === 0)
    let fill = light ? board.light : board.dark
    return fill
  },
  /**
   * Returns the position on the board from a file and rank number.
   * @param Number file The number of file.
   * @param Number rank The number of rank.
   * @return String The board position.
   */
  getPosition: function (file, rank) {
    return this.columns[file] + rank
  },
  getSquareSizeFromPosition: function (pos) {
    let series = this.series
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
  setSquareFill: function (element) {
    const board = this
    let series = board.series
    let pos = element.position
    let validMoves = series.validMoves
    let validMove = validMoves && any(validMoves, function (move) {
      return move.to === pos
    })
    let fill
    if (series.selected === pos) {
      fill = (series.options.board.selected ? series.options.board.selected : board.getFillFromPosition(pos))
    } else if (validMove) {
      fill = series.options.board.moves
    } else {
      fill = board.getFillFromPosition(pos)
    }
    element.attr({
      fill: fill
    })
  },
  setSquareSizes: function (element) {
    let size = this.getSquareSizeFromPosition(element.position)
    element.animate(size)
  },
  /**
   * Render the board. Called on initialization and update.
   */
  render: function () {
  }
}

export default Board
