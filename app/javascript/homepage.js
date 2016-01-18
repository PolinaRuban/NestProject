'use strict';

var nestToken  = $.cookie('nest_token'),
    devices = {},
    currentStructure = null,
    structures  = {};

var templateForAwayStatus = _.template("<span class='text-status'>Away status:  </span><button type='button' id='homeaway' class='btn btn-xs btn-primary'></button>");
var homeNameTemplate = _.template("<div><label class='home-name'></label></div>");
var thermostatTemplateView = _.template("<div class='thermostat-circle'><div>");

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
            $(".thermostat-view").append(thermostatTemplateView);

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
    $(".home-container").append(homeNameTemplate);
    $(".home-container").append(templateForAwayStatus);
    
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
        updateHoverLink(thermostatId);
    }
    
    $("#homeaway").text(structure.away);
    
    
    $("#homeaway").on('click', function(event){
        var path = 'structures/' + homeId + '/away';
        
        if(event.target.textContent == "home"){
            dataRef.child(path).set("away");
        }
        else{
            dataRef.child(path).set("home");
        }
    });
}

function updateHoverLink(item){
    if(item == thermostatId){
        $("#" + item).addClass("chosen");
    }
}

function UpdateMenu(structuresIds){
    if(currentStructure == null){
        currentStructure = structuresIds[0];
    }
    $(".nest-menu-container-title").empty();
    $(".nest-menu-container-title").append("<h3>Choose the home</h3>");
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
    $(".loading").hide();
    var data = snapshot.val();
    
    structures = data.structures;
    devices = data.devices;
    
    var thermostats = data.devices.thermostats;
    
    UpdateMenu(getStructureIds(structures));
});