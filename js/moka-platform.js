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
*       types currently supported : addUser, removeUser, addItem, removeItem, moveItem, selectItem, unselectItem
*       example {type: "myType", content: "myContent"}
*
*       addUser message structure
*       - content : userId, name
*       example {type: "addUser, content: {userId: 12, name:"Vincent B."}}
*
*       removeUser message structure
*       - content : userId
*       example {type: "removeUser, content: {userId: 12}}
*
*       addItem message structure
*       - content : type, itemId
*       example {type: "addItem, content: {type: "umlClass", itemId: 7}}
*
*       removeItem message structure
*       - content : itemId
*       example {type: "removeItem, content: {itemId: 7}}
*
*       moveItem message structure
*       - content : itemId, top, left   
*       example {type: "moveItem, content: {itemId: 7, top: 250, left: 433}}
*
*       selectItem message structure
*       - content : userId, itemId
*       example {type: "selectItem", content: {userId: 12, itemId: 7}}
*
*       unselectItem message structure
*       - content : userId
*       example {type: "unselectItem", content: {userId: 12}}
*
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
            addUser         :   "addUser",
            removeUser      :   "removeUser",
            addItem         :   "addItem",
            removeItem      :   "removeItem",
            moveItem        :   "moveItem",
            selectItem      :   "selectItem",
            unselectItem    :   "unselectItem",
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
                addItem(message.content.type, message.content.id);
                break;

            case configuration.messageType.removeItem :
                removeItem(message.content.id);
                break;

            case configuration.messageType.moveItem :
                moveItem(message.content.id, message.content.top, message.content.left);
                break;

            case configuration.messageType.selectItem :
                selectItem(message.content.userId, message.content.itemId);
                break;
                
            case configuration.messageType.unselectItem :
                unselectItem(message.content.userId);
                break;
        };
    };
    
    var unselectItem = function(userId){
        var userSearch = getUserById(userId);
        if(userSearch != null){
            userSearch.user.unselectItem();
        }
    };
    
    var selectItem = function(userId, itemId){
        var itemRes = getItemById(itemId);
        var userRes = getUserById(userId);
        if(itemRes != null && userRes != null){
            userRes.user.selectItem(itemRes.item);
        }
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
        
        //TODO remove
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
    
    var initUserInfo = function(id, name, color){
        var userInfo = $('<div class="'+configuration.userInfoCssClass+'" id="user_'+id+'" />');
        var userInfoContent = $('<div class="'+configuration.userInfoContentCssClass+'" />');
        userInfoContent.append($('<span class="'+configuration.userInfoPerCentCssClass+'">00%</span>'));
        userInfoContent.append(" "+name);
        userInfo.append(userInfoContent);
        userInfo.append($('<div class="'+configuration.userInfoColorCssClass+'" style="background-color: '+color+'" />'));
        return userInfo;
    };
    
    //constructor
    var User = function(id, name, color){
        this.color = color;
        var userInfo = initUserInfo(id, name, color);
        this.selection = null;
        this.getId = function(){ return id; }; 
        this.getName = function(){ return name; };
        this.getUserInfo = function(){ return userInfo; };
    };  
    
    User.prototype = {
    
        selectItem : function(item){
            if(this.selection === null){
                this.selection = $('<div class="itemContribution"/>');
                this.selection.css("background-color", this.color);
                item.getContributions().append(this.selection);
            }            
        },
        
        unselectItem : function(){
            this.selection.remove();
            this.selection = null;
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
    
    /*
    *   Item Constructor
    */
    var Item = function(id){
        this.jQueryObject;
        this.getId = function(){ return id; };
    };
    
    Item.prototype = { 
    
        /*
        *   Initialize the jQueryObject
        */
        init : function(jQueryObject){
            if(jQueryObject){
                this.jQueryObject = jQueryObject;
            }else{
                this.jQueryObject = $('<div id="'+configuration.itemPrefixId+this.getId()+'"class="'+configuration.itemCssClass+'"/>');
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
        *   Retrieve the "Contributions" division as a jQueryObject        
        */
        getContributions : function(){
            return this.jQueryObject.find("."+configuration.itemContributionsClass);
        },
        
        /*
        *   Set the title of the Item
        *
        *   @Param title
        */
        setTitle : function(title){
            this.getContentTitleObject().text(title);
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