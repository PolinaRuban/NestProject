'use strict';

var nestToken  = $.cookie('nest_token'),
    devices = {},
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


function updateThermostatView(thermostats){
    $('.thermostats').empty();
    _.each(thermostats, function(thermostat){
        //$('.thermostats').append("<a href='/thermostat/thermostat.html'>" + thermostat.name + "</a><br/>");
        var temperature = getTemperature(thermostat);
        $(".thermostats").append("<div class='thermostat' id=" + thermostat.where_id + ">" + thermostat.name + " " + temperature +  thermostat.temperature_scale + "</div>");
        //delete and append class with thermostat
    });
}


function getTemperature(thermostat){
    var scale = thermostat.temperature_scale.toLowerCase();
    var result= thermostat['target_temperature_' + scale] + '°';
    
    return result; 
}

function UpdateHomeView(homeId) {
    $(".home").empty();
    
    $(".home").append("<label class='home-name'></label>");
    $(".home").append("<div><button type='button' id='homeaway' class='btn btn-xs btn-primary''></button></div>");
    
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
        updateThermostatView(thermostats);
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
    $('.nest-menu-container').empty();
    _.each(structuresIds, function(num){

        $('.nest-menu-container').append("<div class='structure-item' id='" + num + "'>" + "<div class='link-element'>" + structures[num].name + "</div></div>");   
        
        if(structures[num].away == "home"){
              $("#" + num).addClass("homelogo");  
        }
        if(structures[num].away == "away" || structures[num].away == "auto-away"){
              $("#"+ num).addClass("awaylogo");  
        }
        
        $("#" + num + " .link-element").on('click', function (event) {
            UpdateHomeView(num);
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
    
    //for initialization
    /*var structure = firstChild(structures);
    UpdateHomeView(structure.structure_id);*/
    
    UpdateMenu(getStructureIds(structures));
});

/*$("#menuBtn").bind('click', $.proxy(this.menuButtonClickEventHandler, this));

menuButtonClickEventHandler: function (self, callback) {
    $().toggleClass('open');
    $().find('.panel').removeClass('open');
}*/