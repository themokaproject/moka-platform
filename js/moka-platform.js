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
*   The default css rules used by the item factory.
*
*/
Moka.defaultCssRules = (function(){
    return {
        itemPrefixId                :   "item_",
        itemContentClass            :   "itemContent",
        itemContributionsClass      :   "itemContributions",
        itemContentTitleClass       :   "itemContentTitle", 
        postItTitle                 :   "Post-it",
        postItContentClass          :   "postItContent",
        postItContent               :   "Here goes your note [...]",
        umlClassContentClass        :   "umlContent",
        umlClassContentTitleClass   :   "umlTitle",
        umlAttributesClass          :   "umlAttributes",
        umlAttributeClass           :   "umlAttribute",
        umlMethods                  :   "umlMethods",
        umlMethod                   :   "umlMethod",
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
    
    /*
    *   Item
    */
    var Item = function(id){
        this.id = id;
        this.jQueryObject;
    };
    
    Item.prototype = { 

        init : function(jQueryObject){
            if(jQueryObject){
                this.jQueryObject = jQueryObject;
            }else{
                this.jQueryObject = $('<div id="'+cssRules.itemPrefixId+this.id+'"class="item"/>');
                this.jQueryObject.append($('<div class="'+cssRules.itemContentClass+'"/>')
                    .append('<div class="'+cssRules.itemContentTitleClass+'" />'));
                this.jQueryObject.append($('<div class="'+cssRules.itemContributionsClass+'"/>')); 
            }                   
        },
        
        getContentObject : function(){
            return this.jQueryObject.find("."+cssRules.itemContentClass);
        },
    
        getContentTitleObject : function(){
            return this.jQueryObject.find("."+cssRules.itemContentTitleClass);
        },
        
        setTitle : function(title){
            this.getContentTitleObject().text(title);
        },
    };
    
    /*
    *   Post-It Item
    *       extends Item
    */
    var PostItItem = function(id){
        Item.call(this, id);
    };
    
    PostItItem.prototype = new Item();
    
    PostItItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
            this.getContentObject().append($('<p class="'+cssRules.postItContentClass+'" />'));
        }        
    };
    
    PostItItem.prototype.setText = function(text){
        this.jQueryObject.find('.'+cssRules.postItContentClass).text(text);
    };
    
    /*
    *   Uml Class Item
    *       extends Item
    */
    var UmlClassItem = function(id){
        Item.call(this, id);
    }
    
    UmlClassItem.prototype = new Item();
    
    UmlClassItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
        }
    }
    
    
    /*
    *   Create a new post it
    */
    var createPostIt = function(id){
        var newPostIt = new PostItItem(id); 
        newPostIt.init();
        newPostIt.setTitle(cssRules.postItTitle+" "+id);               
        newPostIt.setText($("<p>"+cssRules.postItContent+"</p>").text());        
        return newPostIt;
    }; 

    /*
    *   Create a new uml class
    */
    var createUmlClass = function(id){
        var newUmlClassItem = new UmlClassItem(id); 
        newUmlClassItem.init();      
        return newUmlClassItem;
    }; 
    
    return {
        createPostIt    :   createPostIt,
        createUmlClass  :   createUmlClass,
    }
    
})(Moka.defaultCssRules);



    