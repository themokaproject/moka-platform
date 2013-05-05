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
        itemPrefixId                :   "item_",
        itemContentClass            :   "itemContent",
        itemContributionsClass      :   "itemContributions",
        itemContentTitleClass       :   "itemContentTitle", 
        postItTitle                 :   "Post-it",
        postItContent               :   "Here goes your note [...]",
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
        var newItem = $('<div id="'+cssRules.itemPrefixId+id+'"class="item"/>');
        newItem.append($('<div class="'+cssRules.itemContentClass+'"/>')
            .append('<div class="'+cssRules.itemContentTitleClass+'" />'));
        newItem.append($('<div class="'+cssRules.itemContributionsClass+'"/>'));
        return newItem;    
    };
    
    var createPostIt = function(id){
        var newPostIt = createItem(id);
        
        newPostIt.find("."+cssRules.itemContentTitleClass)
            .append(cssRules.postItTitle+" "+id);
        
        newPostIt.find("."+cssRules.itemContentClass)
            .append($("<p>"+cssRules.postItContent+"</p>"));
        
        return newPostIt;
    }
    
    return {
        createPostIt      :   createPostIt,
    }
    
})(Moka.defaultCssRules);



    