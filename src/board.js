'use strict'
const each = (arr, fn, ctx) => Array.prototype.forEach.call(arr, fn, ctx)
const any = (arr, predicate) => arr.some(predicate)
const map = (arr, fn) => arr.map(fn)
const reduce = (arr, fn, initial) => arr.reduce(fn, initial)
const range = (from, to) => Array.from({ length: (to - from + 1) }).map((_, i) => from + i)
const squareZIndex = 0
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
/**
 * Returns the position on the board from a file and rank number.
 * @param Number file The number of file.
 * @param Number rank The number of rank.
 * @return String The board position.
 */
const getPosition = (file, rank) => columns[file] + rank
/**
 * Returns an array of all square positions on the board.
 * @return {String[]} The positions.
 */
const getBoardPositions = (file, rank) => {
  const ranks = range(1, rank).reverse()
  const files = range(0, file - 1)
  return reduce(ranks, (arr, rank) => {
    const row = files.map(file => getPosition(file, rank))
    return arr.concat(row)
  }, [])
}
/**
 * Returns the dark or light fill color of a square, based upon its position.
 * @param {String} pos The board position of the square.
 * @return {String} Color, The dark or light fill color of the board.
 */
const isDarkOrLight = (pos) => {
  const file = columns.indexOf(pos.charAt(0)) % 2
  const rank = pos.charAt(1) % 2
  // Return dark or light as string
  return ((file - rank) === 0) ? 'light' : 'dark'
}
function Board (options, series, renderer) {
  this.init(options, series, renderer)
  return this
}

Board.prototype = {
  /**
   * Initialization of the board. Should only run once.
   */
  init: function (options, series, renderer) {
    this.renderer = renderer
    this.series = series
    this.options = options
    this.positions = getBoardPositions(8, 8)
    this.group = renderer.g('boardSquares').attr({
      zIndex: 1 // Draw squares above the background
    }).add()
    if (options.interactive) {
      this.group.css({
        cursor: 'pointer'
      })
    }
    // this.render() To early to render
  },
  addBoardSquare: function (pos) {
    const size = this.getSquareSizeFromPosition(pos)
    let element = this.renderer.rect(size.x, size.y, size.width, size.height, 0)
      .attr({
        zIndex: squareZIndex
      }).add(this.group)
    element.position = pos
    return element
  },
  addClickToSquare: function (element) {
    const board = this
    const pos = element.position
    element.on('click', function () {
      board.onSquareClick(pos)
    })
  },
  /**
  * Draws all the rectangles for the chess board
  * @todo: set board size in options.
  */
  drawChessBoard: function () {
    const board = this
    let squares = board.squares
    if (!squares) {
      squares = board.squares = map(board.positions, (pos) => board.addBoardSquare(pos))
    }
    each(squares, function (element) {
      board.setSquareSizes(element)
      board.updateSquareFill(element)
      if (board.options.interactive) {
        board.addClickToSquare(element)
      }
    })
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
  updateSquareFill: function (element) {
    const board = this
    const options = board.options
    const series = board.series
    const validMoves = series.validMoves
    const pos = element.position
    const validMove = validMoves && any(validMoves, move => move.to === pos)
    const defaultFill = options[isDarkOrLight(pos)]
    const fills = {
      default: defaultFill,
      selected: options.selected || defaultFill,
      moves: options.moves || defaultFill
    }
    const state = (series.selected === pos
      ? 'selected'
      : (validMove ? 'moves' : 'default')
    )
    element.attr({
      fill: fills[state]
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
    this.drawChessBoard()
  }
}

export default Board
