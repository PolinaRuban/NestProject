'use strict';

var nestToken  = $.cookie('nest_token'),
    thermostats = {},
    state = {
        home: "home",
        away: "away",
        auto_away : "auto-away"
    },
    structures  = {},
    currentStructureId = null,
    currentThermostatId = null;

if (nestToken) {
  var dataRef = new Firebase('wss://developer-api.nest.com');
  dataRef.auth(nestToken);

} else {
  window.location.replace('/auth/nest');
}

$("#logout").on('click', function(event){
    dataRef.unauth();
    window.location.replace('/auth/nest');
});