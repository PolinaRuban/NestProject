/**
 *  Copyright 2014 Nest Labs Inc. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/* globals $, Firebase */
'use strict';

var nestToken  = $.cookie('nest_token');

if (nestToken) { // Simple check for token

  // Create a reference to the API using the provided token
  var dataRef = new Firebase('wss://developer-api.nest.com');
  dataRef.auth(nestToken);

  // in a production client we would want to
  // handle auth errors here.

} else {
  // No auth token, go get one
  window.location.replace('/auth/nest');
}

function updateThermostatViewPage(thermostats){
    $('.thermostats-list').empty();
    _.each(thermostats, function(thermostat){
        $('.thermostats-list').append("<a href='/thermostat/thermostat.html'>" + thermostat.name + "</a><br/>");
    });
}

dataRef.on('value', function (snapshot) {
  var data = snapshot.val();

  updateThermostatViewPage(data.devices.thermostats);

});


/*
$('.thermostats-list').on('click', function () {
    alert("denuhewudf");
});
*/
