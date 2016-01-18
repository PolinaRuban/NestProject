'use strict';

var nestToken  = $.cookie('nest_token'),
    devices = {},
    currentStructure = null,
    //cameras ={},
    //smokeCOAlarms={},
    
    structures  = {};

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


function updateThermostatLinkView(thermostats){
    $('.thermostats').empty();
    _.each(thermostats, function(thermostat){
        var temperature = getTemperature(thermostat);
        
        $(".thermostats").append("<div class='thermostat' id=" + thermostat.where_id + ">" + thermostat.name + " " + temperature +  thermostat.temperature_scale + "</div>");

        $("#"+ thermostat.where_id).on('click', function(event){
            $("thermostat-view").removeClass("hidden");
            $(".thermostat-view").empty();
            $(".thermostat-view").append("<div class='thermostat-circle'><div>");

            var id = event.target.id;
            
            initializeThermostatView(id);
        });
    });
}


function getTemperature(thermostat){
    var scale = thermostat.temperature_scale.toLowerCase();
    var result= thermostat['target_temperature_' + scale] + '°';
    
    return result; 
}

function UpdateHomeView(homeId) {
    $(".home-container").empty();
    $(".thermostat-view").empty();
    
    $(".home-container").append("<label class='home-name'></label>");
    $(".home-container").append("<button type='button' id='homeaway' class='btn btn-xs btn-primary''></button>");
    
    var structure = structures[homeId];
    var name = structure.name;
    $('.home-name').text(name);
    
    if(devices.thermostats != undefined){
        $(".thermostats").show();
        var thermostats = [];
        _.each(devices.thermostats, function(thermostat){
           if(thermostat.structure_id == homeId){
               thermostats.push(thermostat);
           } 
        });
         updateThermostatLinkView(thermostats);
    }
    
    if(devices.smoke_co_alarms != undefined){
        $(".co-alarms").show();
        var smokeCOAlarms = [];
        _.each(devices.smoke_co_alarms, function(smokeCOAlarm){
           if(smokeCOAlarm.structure_id == homeId){
               smokeCOAlarms.push(smokeCOAlarm);
           } 
        });
        updateCOAlarmsView(smokeCOAlarms);
    }
    
    if(devices.cameras != undefined){
        $(".cameras").show();
    }
    
    $("#homeaway").text(structure.away);
    
    
    $("#homeaway").on('click', function(event){
        if(event.target.textContent == "home"){
            var path = 'structures/' + homeId + '/away';
            dataRef.child(path).set("away");
        }
        else{
            if(event.target.textContent == "away" || event.target.textContent== "auto-away"){
                var path = 'structures/' + homeId + '/away';
                dataRef.child(path).set("home");
            }
        }
    })
}

function UpdateMenu(structuresIds){
    if(currentStructure == null){
        currentStructure = structuresIds[0];
    }
    $('.nest-menu-container').empty();
    _.each(structuresIds, function(num){
        $('.nest-menu-container').append("<div class='structure-item' id='" + num 
                                         + "'>" + "<div class='link-element'>" + 
                                         structures[num].name + "</div></div>");   
        
        if(structures[num].away == "home"){
              $("#" + num).addClass("homelogo");  
        }
        if(structures[num].away == "away" || structures[num].away == "auto-away"){
              $("#"+ num).addClass("awaylogo");  
        }
        
        if(num == currentStructure){
            UpdateHomeView(num);
        }
        
        $("#" + num + " .link-element").on('click', function (event) {
            UpdateHomeView(num);
            currentStructure = num;
        });
    });
}


function firstChild(object) {
  for(var key in object) {
    return object[key];
  }
}

function getStructureIds(object)
{
    var ids = [];
    for(var key in object) {
        ids.push(object[key].structure_id);
    }
    
    return ids;
}

dataRef.on('value', function (snapshot) {
    
    var data = snapshot.val();
    
    structures = data.structures;
    devices = data.devices;
    
    var thermostats = data.devices.thermostats;
    
    UpdateMenu(getStructureIds(structures));
});