'use strict'
import chess from './chess.js'
const updateStatus = (status) => {
  const turn = document.getElementById('turn')
  const move = document.getElementById('move')
  turn.innerHTML = (status.turn === 'w' ? 'White' : 'Black') + ' to move'
  if (status.move) {
    move.innerHTML = 'From ' + status.move.from + ' to ' + status.move.to
  }
}
// TODO Add own chess constructor to Highchart. Highcharts.chess
const chart = chess.chart('chart', {
  chart: {
    animation: false
  },
  series: [{
    type: 'chess',
    board: {
      // Palette: http://paletton.com/#uid=101050kp5mHv9gRrOjYlRp9ios2
      dark: '#5785A3',
      light: '#D9DDE7',
      selected: '#87AFC1',
      moves: '#87AFC1',
      interactive: true
    },
    icons: '/highcharts-chess/assets/icons',
    onMove: updateStatus
  }],
  title: {
    text: null
  },
  tooltip: {
    enabled: false
  }
})
const series = chart.series[0]
updateStatus({
  turn: series.game.turn()
})
document.getElementById('undo').onclick = () => series.undo()
document.getElementById('redo').onclick = () => series.redo()
