'use strict';

var nestToken  = $.cookie('nest_token'),
    devices = {},
    currentStructure = null,
    structures  = {};

var templateForAwayStatus = _.template("<span class='text-status'>Away status:  </span><button type='button' id='homeaway' class='btn btn-xs btn-primary'></button>");
var homeNameTemplate = _.template("<div><label class='home-name'></label></div>");
var thermostatTemplateView = _.template("<div class='thermostat-circle'><div>");
var thermostatTemplate = _.template("<div class='col-lg-12 thermostat' id='<%= id %>'><%= name %> <%= temperature %></div>");

function updateThermostatLinkViews(currentThermostats){
    $('.thermostats').empty();
    
    _.each(currentThermostats, function(thermostat){
        var temperature = _getTemperature(thermostat) + thermostat.temperature_scale;
        
        if(structures[thermostat.structure_id].away == state.away || structures[thermostat.structure_id].away == state.auto_away){
            temperature = state.away;
        }
        $(".thermostats").append(thermostatTemplate({id: thermostat.where_id, name: thermostat.name, temperature: temperature}));
        
        $("#"+ thermostat.where_id).on('click', function(event){
            $(".thermostat-view").empty();
            $(".thermostat").removeClass("chosen");
            
            $("#" + event.target.id).addClass("chosen");
            $(".thermostat-view").append(thermostatTemplateView);

            currentThermostatId = event.target.id;
            _updateHoverLink(currentThermostatId);
            
            initializeThermostatView();
        });
    });
}

function UpdateHomeView() {
    if(currentStructureId == null){
        return;
    }
    
    $(".home-container").empty();
    
    $(".home-container").append(homeNameTemplate);
    $(".home-container").append(templateForAwayStatus);
    
    var structure = structures[currentStructureId];
    
    $('.home-name').text(structure.name);
    
    if(thermostats != undefined){
        $(".thermostats").show();
        var currentThermostats = [];
        _.each(thermostats, function(thermostat){
           if(thermostat.structure_id == currentStructureId){
               currentThermostats.push(thermostat);
           } 
        });
        
        updateThermostatLinkViews(currentThermostats);
    }
    
    $("#homeaway").text(structure.away);
    
    
    $("#homeaway").on('click', function(event){
        var path = 'structures/' + currentStructureId + '/away';
        
        if(event.target.textContent == state.home){
            dataRef.child(path).set(state.away);
        }
        else{
            dataRef.child(path).set(state.home);
        }
    });
    
    $(".loading").hide();
}

function _updateHoverLink(item){
    if(item == currentThermostatId){
        $("#" + item).addClass("chosen");
    }
}

function _getTemperature(thermostat){
    var scale = thermostat.temperature_scale.toLowerCase();
    var result= thermostat['target_temperature_' + scale] + '°';
    
    return result; 
}

dataRef.on('value', function (snapshot) {
    thermostats = snapshot.child("devices/thermostats").val();
    if(currentStructureId != null){
        UpdateHomeView();
    }
});