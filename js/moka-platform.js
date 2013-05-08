/**
*    Dependencies
*       jQuery
*/

var Moka = Moka || {};

Moka.platformConfiguration = (function(){
    "use strict";
    return {
        host_ip             :   "localhost",
        port                :   "8887",
        userContainerCssId  :   "userInfoContainer",
        userColors          :   [
                "#FF7C7C",
                "#70CBED",
                "#B7DB4C",
                "#FFCF70",
                "#C394DB"                
        ],
        
    };
})();

Moka.plateform = (function(configuration){
    "use strict";
    
    //private properties & methods
    var configuration = configuration;
    var webSocket;
    var userList = [];
    var userContainer = $("#"+configuration.userContainerCssId);
    
    /*
    *   Private Methods
    *
    *   onWebSocketOpen
    *   onWebSocketClose
    *   onWebSocketMessage
    *   onWebSocketError
    */    
    
    var onWebSocketOpen = function(event){
        console.log("open");
    };
    
    var onWebSocketClose = function(event){
        console.log("close");
    };
    
    var onWebSocketMessage = function(event){
        console.log("message: " + event.data);
    };
    
    var onWebSocketError = function(event){
        console.log("error");
    };   
    
    var addUser = function(id, name){
        var color = configuration.userColors[userList.length];
        var newUser = new Moka.User(id, name, color);
        userList.push(newUser);
        userContainer.append(newUser.getUserInfo());
    };
    
    var getUserById = function(id){
        for(var i=0; i< userList.length; i++){
            if(userList[i].getId() === id) return {index: i, user: userList[i]};
        }
        return null;
    };
    
    var removeUser = function(id){
        var temp = getUserById(id);
        if(temp != null){
            temp.user.getUserInfo().remove();
            userList.splice(temp.index, 1);
        }
    };
    
    /*
    *   MokaPlatform Constructor
    */
    var MokaPlatform = function(){

    };
    
    //public API -- methods
    MokaPlatform.prototype = {      
        
        setHostIp : function(ip){
            configuration.host_ip = ip;
        },
        
        setPort : function(port){
            configuration.port = port;
        },
        
        run : function(){
            webSocket = new WebSocket('ws://'+configuration.host_ip+':'+configuration.port);            
            webSocket.onopen    = function(event){ onWebSocketOpen(event);      };            
            webSocket.onclose   = function(event){ onWebSocketClose(event);     };            
            webSocket.onmessage = function(event){ onWebSocketMessage(event);   };            
            webSocket.onerror   = function(event){ onWebSocketError(event);     };       
        },
        
        addUser : addUser,
        removeUser : removeUser,
    
    };
    
    return MokaPlatform;    
})(Moka.platformConfiguration);

/*
*   Moka.User
*/
Moka.User = (function(){
    "use strict";
    
    //private methods & attributes
    var id = -1;
    var name = "";
    var userInfo;
    
    var initUserInfo = function(user){
        userInfo = $('<div class="userInfo" id="user_'+id+'" />');
        var userInfoContent = $('<div class="userInfoContent" />');
        userInfoContent.append($('<span class="userInfoPerCent">00%</span>'));
        userInfoContent.append(" "+name);
        userInfo.append(userInfoContent);
        userInfo.append($('<div class="userInfoColor" style="background-color: '+user.color+'" />'));
    };
    
    //constructor
    var User = function(p_id, p_name, p_color){
        id = p_id;
        name = p_name;
        this.color = p_color;
        initUserInfo(this);
    };
    
    //public methods
    User.prototype = {
    
        getName : function(){
            return name;
        }, 

        getId : function(){
            return id;
        },
        
        getUserInfo : function(){            
            return userInfo;
        },        
    
    };
    
    return User;    
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
        umlMethodsClass             :   "umlMethods",
        umlMethodClass              :   "umlMethod",
        umlTitle                    :   "Uml Class",
    };
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
    *   Item Constructor
    */
    var Item = function(id){
        this.id = id;
        this.jQueryObject;
    };
    
    Item.prototype = { 
    
        /*
        *   Initialize the jQueryObject
        */
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
        
        /*
        *   Retrieve the "Content" division as a jQueryObject
        */
        getContentObject : function(){
            return this.jQueryObject.find("."+cssRules.itemContentClass);
        },
        
        /*
        *   Retrieve the "ContentTitle" division as a jQueryObject
        */
        getContentTitleObject : function(){
            return this.jQueryObject.find("."+cssRules.itemContentTitleClass);
        },
        
        /*
        *   Set the title of the Item
        *
        *   @Param title
        */
        setTitle : function(title){
            this.getContentTitleObject().text(title);
        },
    };
    
    /*
    *   Post-It Item Constructor
    *       extends Item
    */
    var PostItItem = function(id){
        Item.call(this, id);
    };
    
    PostItItem.prototype = new Item();
    
    /*
    *   Initialize the jQueryObject
    */
    PostItItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
            this.getContentObject().append($('<p class="'+cssRules.postItContentClass+'" />'));
        }        
    };
    
    /*
    *   Set the text of the Post-It
    *
    *   @Param text
    */
    PostItItem.prototype.setText = function(text){
        this.jQueryObject.find('.'+cssRules.postItContentClass).text(text);
    };
    
    /*
    *   Uml Class Item Constructor
    *       extends Item
    */
    var UmlClassItem = function(id){
        Item.call(this, id);
        this.attributes = [];
        this.methods = [];
    };
    
    UmlClassItem.prototype = new Item();
    
    /*
    *   Initialize the jQueryObject
    */
    UmlClassItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
            this.getContentObject().addClass(cssRules.umlClassContentClass);
            this.getContentTitleObject().addClass(cssRules.umlClassContentTitleClass);
            this.getContentObject().append($('<div class="'+cssRules.umlAttributesClass+'" />'));
            this.getContentObject().append($('<div class="'+cssRules.umlMethodsClass+'" />'));
        }
    };
    
    /*
    *   Update the displayed methods
    */
    UmlClassItem.prototype.updateMethods = function(){
        var methodContainer = this.jQueryObject.find("."+cssRules.umlMethodsClass);
        for(var i=0; i<this.methods.length; i++){
            if(this.methods[i]){
                methodContainer.append(
                    $('<div class="'+cssRules.umlMethodClass+'" />').text(this.methods[i]));
            }
        }
    };
    
    /*
    *   Add a method to the Uml Class Item
    *
    *   @param method
    */
    UmlClassItem.prototype.addMethod = function(method){
        this.methods.push(method);
        this.updateMethods();
    };
    
    /*
    *   Update the displayed attributes
    */
    UmlClassItem.prototype.updateAttributes = function(){
        var attributeContainer = this.jQueryObject.find("."+cssRules.umlAttributesClass);
        for(var i=0; i<this.attributes.length; i++){
            if(this.attributes[i]){
                attributeContainer.append(
                    $('<div class="'+cssRules.umlAttributeClass+'" />').text(this.attributes[i]));
            }
        }
    };
    
    /*
    *   Add an attribute to the Uml Class Item
    *
    *   @param method
    */
    UmlClassItem.prototype.addAttribute = function(attribute){
        this.attributes.push(attribute);
        this.updateAttributes();
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
        newUmlClassItem.setTitle(cssRules.umlTitle+" "+id);      
        return newUmlClassItem;
    }; 
    
    return {
        createPostIt    :   createPostIt,
        createUmlClass  :   createUmlClass,
    };
    
})(Moka.defaultCssRules);



    