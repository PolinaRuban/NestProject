'use strict';

var nestToken  = $.cookie('nest_token'),
    devices = {},
    currentStructure = null,
    
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

$("#logout").on('click', function(event){
   alert("Log out"); 
});

function updateThermostatLinkView(thermostats){
    $('.thermostats').empty();
    
    _.each(thermostats, function(thermostat){
        var temperature = getTemperature(thermostat) + thermostat.temperature_scale;
        if(structures[thermostat.structure_id].away == "away"|| structures[thermostat.structure_id].away == "auto-away"){
            temperature = "AWAY";
        }
        $(".thermostats").append("<div class='col-lg-12 thermostat' id=" + thermostat.where_id + ">" + thermostat.name + " " + temperature + "</div>");

        $("#"+ thermostat.where_id).on('click', function(event){
            $(".thermostat-view").empty();
            $(".thermostat").removeClass("chosen");
            $("#" + event.target.id).addClass("chosen");
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
    $(".home-container").append("<div><label class='home-name'></label></div>");
    $(".home-container").append("<span class='text-status'>Away status:  </span><button type='button' id='homeaway' class='btn btn-xs btn-primary'></button>");
    
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
    $("nest-menu-container-title").append("<h3>Choose the home</h3>");
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
            $("#" + num).addClass("chosen");
            $("#" + num + " .link-element").addClass("chosen");
        }
        
        $("#" + num + " .link-element").on('click', function (event) {
            $(".link-element").removeClass("chosen");
            $(".structure-item").removeClass("chosen");
            
            $("#" + num).addClass("chosen");
            $("#" + num + " .link-element").addClass("chosen");
            UpdateHomeView(num);
            $(".thermostat-view").empty();
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