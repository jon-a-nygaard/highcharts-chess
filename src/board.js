'use strict'
// const each = (arr, fn, ctx) => Array.prototype.forEach.call(arr, fn, ctx)

function Board (series, renderer) {
  this.renderer = renderer
  this.series = series
  return this
}

Board.prototype = {
}

export default Board
