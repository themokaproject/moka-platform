/**
*    Dependencies
*       jQuery
*/

var Moka = Moka || {};

Moka.plateform = (function(){
    "use strict";
    
    //private properties & methods
    var pong =  "pong";
    
    //public API -- constructor
    var MokaPlatform = function(){
        //attributes  
    };
    
    //public API -- methods
    MokaPlatform.prototype = {
        
        ping : function(){
            console.log(pong);
        },
    
    };
    
    return MokaPlatform;    
})();


/*
*
*   A naive factory that creates elements for our platform
*
*/
Moka.itemFactory = (function(){
    "use strict";
    
    var createItem = function(id){
        var newItem = $('<div id="'+id+'"class="item"/>');
        newItem.append($('<div class="itemContent"/>'));
        newItem.append($('<div class="itemContributions"/>'));
        return newItem;    
    };   
    
    return {
        createItem      :   createItem,
    }
    
})();



    