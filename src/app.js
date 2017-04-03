'use strict'
import chess from './chess.js'
// TODO Add own chess constructor to Highchart. Highcharts.chess
chess.chart({
  chart: {
    animation: false,
    renderTo: 'container'
  },
  series: [{
    type: 'chess',
    board: {
      // Palette: http://paletton.com/#uid=101050kp5mHv9gRrOjYlRp9ios2
      dark: '#9F1815',
      light: '#B52B27',
      selected: false,
      moves: '#DF625F'
    }
  }],
  title: {
    text: 'Chess made with Highcharts'
  },
  tooltip: {
    enabled: false
  }
})
