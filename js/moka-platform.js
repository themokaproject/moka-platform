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
*   The default css rules to use for the item factory.
*
*/
Moka.defaultCssRules = (function(){
    return {
        itemContentClass            :   "itemContent",
        itemContributionsClass      :   "itemContributions",
    }
})();


/*
*
*   A naive factory that creates elements for our platform
*
*/
Moka.itemFactory = (function(cssRules){
    "use strict";
    
    var cssRules = cssRules;
    
    var createItem = function(id){
        var newItem = $('<div id="'+id+'"class="item"/>');
        newItem.append($('<div class="'+cssRules.itemContentClass+'"/>'));
        newItem.append($('<div class="'+cssRules.itemContributionsClass+'"/>'));
        return newItem;    
    };   
    
    return {
        createItem      :   createItem,
    }
    
})(Moka.defaultCssRules);



    