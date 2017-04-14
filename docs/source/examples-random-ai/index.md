---
layout: example
title: AI playing random moves
date: 2017-04-13 23:35:37
---
{% raw %}
<div class="row">
  <div class="col-xs-6">
    <div id="chart"></div>
  </div>
  <div class="col-xs-6">
    <ul class="list-group">
      <li class="list-group-item">Next turn: <span id="turn"></span></li>
      <li class="list-group-item">Last move: <span id="move"></span></span></li>
    </ul>
    <button class="btn btn-md" id="undo"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Undo</button>
    <button class="btn btn-md" id="redo"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> Redo</button>
  </div>
</div>
<script type="text/javascript" src="/highcharts-chess/assets/random-ai.js"></script>
{% endraw %}

