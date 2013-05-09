/**
*    Dependencies
*       jQuery
*/

var Moka = Moka || {};

/***************************************************************************
****************************************************************************
*   Communication Specification (JSON format)
*
*   WebSocket message structure
*
*       main structure
*       - type
*       - content       
*       types currently supported : addUser, removeUser, addItem, removeItem, moveItem
*       example {type: "myType", content: "myContent"}
*
*       addUser message structure
*       - content : id, name
*       example {type: "addUser, content: {id: 12, name:"Vincent B."}}
*
*       removeUser message structure
*       - content : id
*       example {type: "removeUser, content: {id: 12}}
*
*       addItem message structure
*       - content : type, id
*       example {type: "addItem, content: {type: "umlClass", id: 7}}
*
*       removeItem message structure
*       - content : id
*       example {type: "removeItem, content: {id: 7}}
*
*       moveItem message structure
*       - content : id, top, left   
*       example {type: "moveItem, content: {id: 7, top: 250, left: 433}}
*
*
****************************************************************************
****************************************************************************/

/*
*   The different values used within the platform
*/
Moka.platformConfiguration = (function(){
    "use strict";
    return {
        host_ip                 :   "localhost",
        port                    :   "8887",
        userContainerCssId      :   "userInfoContainer",
        itemContainerCssId      :   "playground",
        messageType             :   {
                addUser     :   "addUser",
                removeUser  :   "removeUser",
                addItem     :   "addItem",
                removeItem  :   "removeItem",
                moveItem    :   "moveItem"    
        },
        userColors              :   [
                "#FF7C7C",
                "#70CBED",
                "#B7DB4C",
                "#FFCF70",
                "#C394DB"                
        ],
        
    };
})();

/*
*   The different values used within the itemFactory
*/
Moka.itemFactoryConfiguration = (function(){
    "use strict";
    return {
        itemCssClass                :   "item",
        itemPrefixId                :   "item_",
        itemContentClass            :   "itemContent",
        itemContributionsClass      :   "itemContributions",
        itemContentTitleClass       :   "itemContentTitle", 
        postItType                  :   "simpleNote",
        postItTitle                 :   "Post-it",
        postItContentClass          :   "postItContent",
        postItContent               :   "Here goes your note [...]",
        umlClassType                :   "umlClass",
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
*   The different values used within the User module
*/
Moka.userConfiguration = (function(){
    "use strict";
    return {
        userInfoCssClass            :   "userInfo",
        userInfoContentCssClass     :   "userInfoContent",
        userInfoPerCentCssClass     :   "userInfoPerCent",
        userInfoColorCssClass       :   "userInfoColor",
        
    };
})();

Moka.platform = (function(configuration){
    "use strict";
    
    //private properties & methods
    var webSocket;
    var userList = [];
    var userContainer = $("#"+configuration.userContainerCssId);
    var itemList = [];
    var itemContainer = $("#"+configuration.itemContainerCssId);
    
    /*
    *   Private Methods
    *
    *   onWebSocketOpen
    *   onWebSocketClose
    *   onWebSocketMessage
    *   onWebSocketError
    *   addUser
    *   removeUser
    *   getUserById
    *   addItem
    *   removeItem
    *   getItemById
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
        if(getUserById(id) != null) return false;
        var color = configuration.userColors[userList.length];
        var newUser = new Moka.User(id, name, color);
        userList.push(newUser);
        userContainer.append(newUser.getUserInfo());
        return true;
    }; 
    
    var processMessage = function(message){
        switch(message.type){
        
            case configuration.messageType.addUser :
                addUser(message.content.id, message.content.name);
                break;
                
            case configuration.messageType.removeUser :
                removeUser(message.content.id);
                break;
            
            case configuration.messageType.addItem :
                //TODO addItem
                break;

            case configuration.messageType.removeItem :
                //TODO removeItem
                break;

            case configuration.messageType.moveItem :
                //TODO moveItem
                break;                        
        };
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
    
    var addItem = function(type, id){
        if(getItemById(id) != null) return false;
        var temp = Moka.itemFactory.createItem(type, id);
        if(temp != null){
            itemList.push(temp);
            itemContainer.append(temp.jQueryObject);
        }
        return true;
    };
    
    var getItemById = function(id){
        for(var i=0; i< itemList.length; i++){
            if(itemList[i].getId() === id) return {index: i, item: itemList[i]};
        }
        return null;
    };
    
    var removeItem = function(id){
        var temp = getItemById(id);
        if(temp != null){
            temp.item.jQueryObject.remove();
            itemList.splice(temp.index, 1);
        }
    };
    
    var moveItem = function(id, top, left){
        var temp = getItemById(id);
        if(temp != null){
            temp.item.move(top, left);
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
        addItem : addItem,
        removeItem : removeItem,
        moveItem : moveItem,
        processMessage : processMessage,
    };
    
    return MokaPlatform;    
})(Moka.platformConfiguration);

/*
*   Moka.User
*/
Moka.User = (function(configuration){
    "use strict";
    
    //private methods & attributes
    var id = -1;
    var name = "";
    var userInfo;
    
    var initUserInfo = function(user){
        userInfo = $('<div class="'+configuration.userInfoCssClass+'" id="user_'+id+'" />');
        var userInfoContent = $('<div class="'+configuration.userInfoContentCssClass+'" />');
        userInfoContent.append($('<span class="'+configuration.userInfoPerCentCssClass+'">00%</span>'));
        userInfoContent.append(" "+name);
        userInfo.append(userInfoContent);
        userInfo.append($('<div class="'+configuration.userInfoColorCssClass+'" style="background-color: '+user.color+'" />'));
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
})(Moka.userConfiguration);



/*
*
*   A naive factory that creates elements for our platform
*
*/
Moka.itemFactory = (function(configuration){
    "use strict"; 

    var itemId;
    
    /*
    *   Item Constructor
    */
    var Item = function(id){
        itemId = id;
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
                this.jQueryObject = $('<div id="'+configuration.itemPrefixId+itemId+'"class="'+configuration.itemCssClass+'"/>');
                this.jQueryObject.append($('<div class="'+configuration.itemContentClass+'"/>')
                    .append('<div class="'+configuration.itemContentTitleClass+'" />'));
                this.jQueryObject.append($('<div class="'+configuration.itemContributionsClass+'"/>')); 
            }                   
        },
        
        /*
        *   Retrieve the "Content" division as a jQueryObject
        */
        getContentObject : function(){
            return this.jQueryObject.find("."+configuration.itemContentClass);
        },
        
        /*
        *   Retrieve the "ContentTitle" division as a jQueryObject
        */
        getContentTitleObject : function(){
            return this.jQueryObject.find("."+configuration.itemContentTitleClass);
        },
        
        /*
        *   Set the title of the Item
        *
        *   @Param title
        */
        setTitle : function(title){
            this.getContentTitleObject().text(title);
        },
        
        getId : function(){
            return itemId;
        },
        
        /*
        *   Move the item 
        *
        *   @Param top
        *   @Param left
        */
        move : function(top, left){
            this.jQueryObject.css("top", top+"px");
            this.jQueryObject.css("left", left+"px");
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
            this.getContentObject().append($('<p class="'+configuration.postItContentClass+'" />'));
        }        
    };
    
    /*
    *   Set the text of the Post-It
    *
    *   @Param text
    */
    PostItItem.prototype.setText = function(text){
        this.jQueryObject.find('.'+configuration.postItContentClass).text(text);
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
            this.getContentObject().addClass(configuration.umlClassContentClass);
            this.getContentTitleObject().addClass(configuration.umlClassContentTitleClass);
            this.getContentObject().append($('<div class="'+configuration.umlAttributesClass+'" />'));
            this.getContentObject().append($('<div class="'+configuration.umlMethodsClass+'" />'));
        }
    };
    
    /*
    *   Update the displayed methods
    */
    UmlClassItem.prototype.updateMethods = function(){
        var methodContainer = this.jQueryObject.find("."+configuration.umlMethodsClass);
        for(var i=0; i<this.methods.length; i++){
            if(this.methods[i]){
                methodContainer.append(
                    $('<div class="'+configuration.umlMethodClass+'" />').text(this.methods[i]));
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
        var attributeContainer = this.jQueryObject.find("."+configuration.umlAttributesClass);
        for(var i=0; i<this.attributes.length; i++){
            if(this.attributes[i]){
                attributeContainer.append(
                    $('<div class="'+configuration.umlAttributeClass+'" />').text(this.attributes[i]));
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
        newPostIt.setTitle(configuration.postItTitle+" "+id);               
        newPostIt.setText($("<p>"+configuration.postItContent+"</p>").text());        
        return newPostIt;
    }; 

    /*
    *   Create a new uml class
    */
    var createUmlClass = function(id){
        var newUmlClassItem = new UmlClassItem(id); 
        newUmlClassItem.init();      
        newUmlClassItem.setTitle(configuration.umlTitle+" "+id);      
        return newUmlClassItem;
    }; 
    
    
    var createItem = function(type, id) {
        if(type === configuration.umlClassType){
            return createUmlClass(id);
        }else if( type === configuration.postItType){
            return createPostIt(id);
        }        
        return null;
    };
    
    return {
        createItem      :   createItem,
    };
    
})(Moka.itemFactoryConfiguration);   