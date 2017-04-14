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
const chart = chess.chart({
  chart: {
    animation: false,
    renderTo: 'chart',
    backgroundColor: '#455A64'
  },
  series: [{
    type: 'chess',
    board: {
      // Palette: http://paletton.com/#uid=101050kp5mHv9gRrOjYlRp9ios2
      dark: '#9F1815',
      light: '#B52B27',
      selected: '#860704',
      moves: '#DF625F',
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
