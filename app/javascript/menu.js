'use strict';

var chooseTheHome = _.template("<h3>Choose the home</h3>");
var homeNameTemplate = _.template("<div><label class='home-name'></label></div>");
var thermostatTemplateView = _.template("<div class='thermostat-circle'><div>");
var structureItemTemplate = _.template("<div class='structure-item' id='<%= id %>'><div class='link-element'><%= name %></div></div>")

function UpdateMenu(structuresIds){
    if(currentStructureId == null){
        currentStructureId = structuresIds[0];
    }
    $(".nest-menu-container-title").empty();
    $(".nest-menu-container-title").append(chooseTheHome());
    
    $('.nest-menu-container').empty();
    
    _.each(structuresIds, function(num){
        
        _addLogoToMenu(num);
        
        $("#" + num + " .link-element").on('click', function (event) {
            $(".link-element").removeClass("chosen");
            $(".structure-item").removeClass("chosen");
            
            $("#" + num).addClass("chosen");
            $("#" + num + " .link-element").addClass("chosen");
            
            currentStructureId = num;
            
            UpdateHomeView();
            
            $(".thermostat-view").empty();
        });
    });
}

dataRef.on('value', function (snapshot) {
    structures = snapshot.child("structures").val();
    var ids = _getStructureIds(structures);
    _checkCurrentStructureId(ids);
    UpdateMenu(_getStructureIds(structures));
});

function _checkCurrentStructureId(ids){
    if(!_.contains(ids, currentStructureId)){
        currentStructureId = null;
    }
}


function _addLogoToMenu(num){
    var item = structureItemTemplate({id : num, 
                                         name: structures[num].name});
        
    $('.nest-menu-container').append(item);   

    if(structures[num].away == state.home){
          $("#" + num).addClass("homelogo");  
    }

    if(structures[num].away == state.away || structures[num].away == state.auto_away){
          $("#"+ num).addClass("awaylogo");  
    }

    if(num == currentStructureId){
        
        $("#" + num).addClass("chosen");
        $("#" + num + " .link-element").addClass("chosen");
    }
}

function _getStructureIds(object){
    var ids = [];
    for(var key in object) {
        ids.push(object[key].structure_id);
    }
    
    return ids;
}