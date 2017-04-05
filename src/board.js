'use strict'
// const each = (arr, fn, ctx) => Array.prototype.forEach.call(arr, fn, ctx)

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
  /**
   * Render the board. Called on initialization and update.
   */
  render: function () {
  }
}

export default Board
