/* globals $, Firebase */
'use strict';

var nestToken  = $.cookie('nest_token'),
    id = null,
    thermostat = {},
    template = "<div id='screen'><div id='target-temperature' class='home'><div class='away'>away</div><div class='home'><span class='temp'></span><div class='hvac-mode'></div></div></div><div id='ambient-temperature'><span class='temp'></span><span class='temperature-scale'></span><span class='label'>inside</span></div></div><button id='up-button'>⬆</button><button id='down-button'>⬇︎</button><button id='heating-up-button'>⬆</button><button id='heating-down-button'>⬇︎</button><button id='cooling-up-button'>⬆</button><button id='cooling-down-button'>⬇︎</button><div id='door'><div id='device-name'></div></div>",
    structure  = {};

if (nestToken) { // Simple check for token

  // Create a reference to the API using the provided token
  var dataRef = new Firebase('wss://developer-api.nest.com');
  dataRef.auth(nestToken);

} else {
  // No auth token, go get one
  window.location.replace('/auth/nest');
}

function updateTemperatureDisplay (thermostat) {
  var scale = thermostat.temperature_scale.toLowerCase();

  // For Heat • Cool mode, we display a range of temperatures
  // we support displaying but not changing temps in this mode
  if (thermostat.hvac_mode === 'heat-cool') {
    $('#target-temperature .temp').text(
      thermostat['target_temperature_low_' + scale] + ' • ' +
      thermostat['target_temperature_high_' + scale]
     );

  // Display the string 'off' when the thermostat is turned off
  } else if (thermostat.hvac_mode === 'off') {
    $('#target-temperature .temp').text('off');

  // Otherwise just display the target temperature
  } else {
    $('#target-temperature .temp').text(thermostat['target_temperature_' + scale] + '°');
    $('#heating-up-button, #heating-down-button, #cooling-up-button, #cooling-down-button').hide();
  }

  // Update ambient temperature display
  $('#ambient-temperature .temp').text(thermostat['ambient_temperature_' + scale] + '°');
}

function updateThermostatView(thermostat) {
  var scale = thermostat.temperature_scale;

  $('.temperature-scale').text(scale);
  $('#target-temperature .hvac-mode').text(thermostat.hvac_mode);
  updateTemperatureDisplay(thermostat);
}


function updateStructureView (structure) {
  if (structure.away === 'home') {
    $('#target-temperature').addClass('home');
  } else {
    $('#target-temperature').removeClass('home');
  }
}

function adjustTemperature(degrees, scale, type) {
  scale = scale.toLowerCase();
  type = type ? type + '_' : '';
  var newTemp = thermostat['target_temperature_' + scale] + degrees,
      path = 'devices/thermostats/' + thermostat.device_id + '/target_temperature_' + type + scale;

  if (thermostat.is_using_emergency_heat) {
    console.error("Can't adjust target temperature while using emergency heat.");
  } else if (thermostat.hvac_mode === 'heat-cool' && !type) {
    console.error("Can't adjust target temperature while in Heat • Cool mode, use target_temperature_high/low instead.");
  } else if (type && thermostat.hvac_mode !== 'heat-cool') {
    console.error("Can't adjust target temperature " + type + " while in " + thermostat.hvac_mode +  " mode, use target_temperature instead.");
  } else if (structure.away.indexOf('away') > -1) {
    console.error("Can't adjust target temperature while structure is set to Away or Auto-away.");
  } else { // ok to set target temperature
    dataRef.child(path).set(newTemp);
  }
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function initializeThermostatView(whereId)
{
    $(".thermostat-circle").append(template);
    id = whereId;
    
    dataRef.on('value', function (snapshot){
        var data = snapshot.val();

        if(id != null){
            getThermostatAndStructureByWhereId(data, id);
        }

      updateThermostatView(thermostat);
      updateStructureView(structure);
    });
    
    $('#up-button').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? +1 : +0.5;
  adjustTemperature(adjustment, scale);
});

$('#down-button').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? -1 : -0.5;
  adjustTemperature(adjustment, scale);
});

$('#heating-up-button-heat').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? +1 : +0.5;
  adjustTemperature(adjustment, scale, 'heat');
});

$('#heating-down-button').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? -1 : -0.5;
  adjustTemperature(adjustment, scale, 'heat');
});

/**
  When the user clicks the cooling up button,
  adjust the temperature up 1 degree F
  or 0.5 degrees C

*/
$('#cooling-up-button').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? +1 : +0.5;
  adjustTemperature(adjustment, scale, 'cool');
});

$('#cooling-down-button').on('click', function () {
  var scale = thermostat.temperature_scale,
      adjustment = scale === 'F' ? -1 : -0.5;
  adjustTemperature(adjustment, scale, 'cool');
});
    
}

function getThermostatAndStructureByWhereId(data, whereId){
    if(whereId != undefined){
        _.each(data.devices.thermostats, function(item){
            if(item.where_id == id){
                thermostat = item;
                structure = data.structures[item.structure_id];
            }
        });
    }
}
    
dataRef.on('value', function (snapshot){
    var data = snapshot.val();
    
    if(id != null){
        getThermostatAndStructureByWhereId(data, id);
    
        updateThermostatView(thermostat);
        updateStructureView(structure);
    }

});
