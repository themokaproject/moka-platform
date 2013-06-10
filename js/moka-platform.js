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
*       - content : type, itemId, content, top, left, width, height, rotateX, rotateY, rotateZ
*       example {type: "addItem, content: {type: "umlClass", itemId: 7, content: "[{title: "coucou"}]", top: 250, left: 350, width: 200, height: 300, rotateX, rotateY, rotateZ}}
*
*       removeItem message structure
*       - content : itemId
*       example {type: "removeItem, content: {itemId: 7}}
*
*       moveItem message structure
*       - content : itemId, top, left
*       example {type: "moveItem, content: {itemId: 7, top: 250, left: 433}}
*
*       rotateItem message structure
*       - content : itemId, rotateX, rotateY, rotateZ
*       example {type : "rotateItem", content: {itemId: 7, rotateX: 120, rotateY: 200, rotateZ:200}}
*
*       resizeItem message structure
*       - content : itemId, width, height
*       example {type : "resizeItem", content: {itemId: 7, width: 120, height: 200}}
*
*       selectItem message structure
*       - content : userId, itemId
*       example {type: "selectItem", content: {userId: 12, itemId: 7}}
*
*       unselectItem message structure
*       - content : userId
*       example {type: "unselectItem", content: {userId: 12}}
*
*       editItem message structure
*       - content : itemId, field, content
*       example {type: "unselectItem", content: {itemId: 12, field: "title", content: "my New Title"}}
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
        hostIp                 :   "localhost",
        port                    :   "8887",
        userContainerCssId      :   "userInfoContainer",
        itemContainerCssId      :   "playground",
        statusCssId             :   "platformTextStatus",
        actionCssId             :   "platformIconAction",
        saveCssId               :   "platformIconSave",
        saveBoxCssId            :   "saveInfoBox",
        saveActionCssId         :   "backUpAction",
        saveInputFileNameCssId  :   "backUpFileName",
        uploadCssId             :   "platformIconUpload",
        uploadBoxCssId          :   "uploadBox",
        aboutCssId              :   "platformIconAbout",
        aboutBoxCssId           :   "aboutBox",
        settingCssId            :   "platformIconSetting",
        settingBoxCssId         :   "settingBox",
        hostIpInputCssId        :   "platformHostIp",
        portInputCssId          :   "platformPort",
        dragZoneCssId           :   "dragZone",
        dropZoneCssId           :   "dropZone",
        overlayCssId            :   "fullScreenOverlay",
        lightBoxContainerCssId  :   "lightBoxContainer",
        lightBoxMessageCssId    :   "lightBoxMessage",
        cancelIcon              :   "./images/cancel_icon_dark.png",
        connectionIcon          :   "./images/connection_icon_dark.png",
        rotatingCssClass        :   "rotationAnimation",
        messageType             :   {
            addUser         :   "addUser",
            removeUser      :   "removeUser",
            addItem         :   "addItem",
            removeItem      :   "removeItem",
            moveItem        :   "moveItem",
            resizeItem      :   "resizeItem",
            selectItem      :   "selectItem",
            unselectItem    :   "unselectItem",
            saveWorkSpace   :   "saveWorkSpace",
            rotateItem      :   "rotateItem",
            editItem        :   "editItem",
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
        postItType                  :   "post-it",
        postItTitle                 :   "Post-it",
        postItContentClass          :   "postItContent",
        postItContent               :   "",
        umlClassType                :   "umlClass",
        umlClassContentClass        :   "umlContent",
        umlClassContentTitleClass   :   "umlTitle",
        umlAttributesClass          :   "umlAttributes",
        umlAttributeClass           :   "umlAttribute",
        umlMethodsClass             :   "umlMethods",
        umlMethodClass              :   "umlMethod",
        umlTitle                    :   "Uml Class",
        mediaContainerClass         :   "mediaContainer",
        mediaFillDivClass           :   "fillDiv",
        pictureType                 :   "image",
        pictureContentClass         :   "pictureContent",
        pictureTitle                :   "Picture",
        defaultPictureSrc           :   "./images/default_picture.gif",
        videoType                   :   "video",
        iframeType                  :   "iframe",
        iframeContentClass          :   "iframeContent",
        iframeTitle                 :   "Iframe",
        videoTitle                  :   "Video",
        field                       :   {
                title           :   "title",
                urlSrc          :   "url",
                postItContent   :   "content",
        },
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
    var status = "disconnected";

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
        status = "connected";
        userList = [];
        itemList = [];
        userContainer.empty();
        itemContainer.empty();
        $("#"+configuration.statusCssId).text("Connected");
        $("#"+configuration.actionCssId).attr("src", configuration.cancelIcon);
        $("#"+configuration.actionCssId).removeClass(configuration.rotatingCssClass);
        $('#'+configuration.saveCssId).show();
        $('#'+configuration.uploadCssId).show();
    };

    var onWebSocketClose = function(event){
        console.log("close");
        status = "disconnected";
        $("#"+configuration.statusCssId).text("Disconnected");
        $("#"+configuration.actionCssId).attr("src", configuration.connectionIcon);
        $("#"+configuration.actionCssId).removeClass(configuration.rotatingCssClass);
        $('#'+configuration.saveCssId).hide();
        $("#"+configuration.saveBoxCssId).hide();
        $('#'+configuration.uploadCssId).hide();
        $("#"+configuration.uploadBoxCssId).hide();
    };

    var onWebSocketMessage = function(event){
        try {
            processMessage(eval("("+event.data+")"));
        } catch (syntaxError) {
            console.log(syntaxError.message);
            console.log("Not a valid JSON message :" + event.data);
        }
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

    var saveWorkSpace = function(workSpace){
        $("#"+configuration.settingBoxCssId).hide();
        $("#"+configuration.uploadBoxCssId).hide();
        $("#"+configuration.aboutBoxCssId).hide();
        $("#"+configuration.saveBoxCssId).show();
        var textFileAsBlob = new Blob([workSpace], {type:'text/plain'});
        $("#"+configuration.saveActionCssId).attr("href", window.webkitURL.createObjectURL(textFileAsBlob));
    };

    var processMessage = function(message){
        var messageContent = message.content;
        var messageTypes = configuration.messageType;

        switch(message.type){
            case messageTypes.addUser :
                addUser(messageContent.userId, messageContent.name);
                break;

            case messageTypes.removeUser :
                removeUser(messageContent.userId);
                break;

            case messageTypes.addItem :
                addItem(messageContent.type, messageContent.itemId, messageContent.content, messageContent.top, messageContent.left,
                    messageContent.width, messageContent.height, messageContent.rotateX, messageContent.rotateY, messageContent.rotateZ);
                break;

            case messageTypes.removeItem :
                removeItem(messageContent.itemId);
                break;

            case messageTypes.moveItem :
                moveItem(messageContent.itemId, messageContent.top, messageContent.left);
                break;

            case messageTypes.resizeItem :
                resizeItem(messageContent.itemId, messageContent.width, messageContent.height);
                break;

            case messageTypes.selectItem :
                selectItem(messageContent.userId, messageContent.itemId);
                break;

            case messageTypes.unselectItem :
                unselectItem(messageContent.itemId);
                break;

            case messageTypes.saveWorkSpace :
                saveWorkSpace(JSON.stringify(messageContent));
                break;

            case messageTypes.rotateItem :
                rotateItem(messageContent.itemId, messageContent.rotateX, messageContent.rotateY, messageContent.rotateZ);
                break;

            case messageTypes.editItem :
                editItem(messageContent.itemId, messageContent.field, messageContent.content);
                break;

            default:
                console.log("unsupported message: " + message);
                console.log(message);
                break;
        }
    };

    var editItem = function(itemId, field, content){
        var itemSearch = getItemById(itemId);
        if(itemSearch != null){
            itemSearch.item.edit(field, content);
        }
    };

    var unselectItem = function(itemId){
        var itemSearch = getItemById(itemId);
        if(itemSearch != null){
            itemSearch.item.unLock();
        }
    };

    var selectItem = function(userId, itemId){
        var itemRes = getItemById(itemId);
        var userRes = getUserById(userId);
        if(itemRes != null && userRes != null){
            itemRes.item.lock(userRes.user.color);
        }
    };

    var getUserById = function(id){
        var userListLength = userList.length;
        for(var i=0; i< userListLength; i++){
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

    var addItem = function(type, id, content, top, left, width, height, rotateX, rotateY, rotateZ){
        if(getItemById(id) != null) return false;
        var temp = Moka.itemFactory.createItem(type, id);
        if(temp != null){
            itemList.push(temp);
            itemContainer.append(temp.jQueryObject);
            temp.move(top, left);
            temp.resize(width, height);
            temp.rotate(rotateX,rotateY,rotateZ);
            content = JSON.parse(content);
            for (var i = 0; i < content.length; i++) {
                temp.edit(content[i].field, content[i].content);
            }
        }
        return true;
    };

    var getItemById = function(id){
        var itemListLength = itemList.length;
        for(var i=0; i< itemListLength; i++){
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

    var resizeItem = function(id, width, height){
        var temp = getItemById(id);
        if(temp != null){
            temp.item.resize(width, height);
        }
    };

    var rotateItem = function(id, rotateX, rotateY, rotateZ){
        var temp = getItemById(id);
        if(temp != null){
            temp.item.rotate(rotateX, rotateY, rotateZ);
        }
    };

    var dragEnterHandler = function(event) {
        event.stopPropagation();
        event.preventDefault();
        $("#"+configuration.dropZoneCssId).show();
        $("#"+configuration.overlayCssId).show();
        $("#"+configuration.lightBoxContainerCssId).css("display", "table");
        if(status == "connected") {
            $("#"+configuration.overlayCssId).css("background-color", "#B7DB4C");
            $("#"+configuration.lightBoxMessageCssId).text("Drop a file to load a project");
        } else {
            $("#"+configuration.overlayCssId).css("background-color", "#FF7C7C");
            $("#"+configuration.lightBoxMessageCssId).text("Connect the platform before loading a project");
        }
    };

    var dragOverHandler = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };

    var dragLeaveHandler = function(event) {
        event.stopPropagation();
        event.preventDefault();
        $("#"+configuration.dropZoneCssId).hide();
        $("#"+configuration.overlayCssId).hide();
        $("#"+configuration.lightBoxContainerCssId).hide();
    };

    var dropHandler = function(event) {
        event.stopPropagation();
        event.preventDefault();
        $("#"+configuration.dropZoneCssId).hide();
        $("#"+configuration.overlayCssId).hide();
        $("#"+configuration.lightBoxContainerCssId).hide();
        if(status != "connected") return;


        var files = event.originalEvent.dataTransfer.files;
        var count = files.length;

        if(count >0) {
            var file = files[0];
            var reader = new FileReader();
            reader.onload = uploadProject;
            reader.readAsText(file);
        }
    };

    var uploadProject = function(event) {
        console.log(event.target.result);
        itemList = [];
        itemContainer.empty();
        webSocket.send(JSON.stringify({type:"upload", content : event.target.result }));
    };


    /*
    *   MokaPlatform Constructor
    */
    var MokaPlatform = function(){
        var these = this;
        $("#"+configuration.actionCssId).bind("click", function(){
            if(status === "disconnected") {
                these.run();
            } else if (status === "connected") {
                these.close();
            }
        });

        $("#"+configuration.saveCssId).bind("click", function(){
            if(status === "connected") {
                if($("#"+configuration.saveBoxCssId).is(":visible")){
                    $("#"+configuration.saveBoxCssId).hide();
                }else{
                    askToSaveWorkSpace();
                }
            }
        });

        $("#"+configuration.saveInputFileNameCssId).bind("keyup", function(){
            $("#"+configuration.saveActionCssId).attr("download", $("#"+configuration.saveInputFileNameCssId).val());
        });

        $("#"+configuration.settingCssId).bind("click", function(){
           $("#"+configuration.settingBoxCssId).toggle();
           $("#"+configuration.saveBoxCssId).hide();
           $("#"+configuration.uploadBoxCssId).hide();
           $("#"+configuration.aboutBoxCssId).hide();
        });

        $("#"+configuration.uploadCssId).bind("click", function(){
           $("#"+configuration.settingBoxCssId).hide();
           $("#"+configuration.saveBoxCssId).hide();
           $("#"+configuration.uploadBoxCssId).toggle();
           $("#"+configuration.aboutBoxCssId).hide();
        });

         $("#"+configuration.aboutCssId).bind("click", function(){
           $("#"+configuration.settingBoxCssId).hide();
           $("#"+configuration.saveBoxCssId).hide();
           $("#"+configuration.uploadBoxCssId).hide();
           $("#"+configuration.aboutBoxCssId).toggle();
        });

        $("#"+configuration.hostIpInputCssId).bind("keyup", function(){
            these.setHostIp($("#"+configuration.hostIpInputCssId).val());
        });

        $("#"+configuration.portInputCssId).bind("keyup", function(){
            these.setPort($("#"+configuration.portInputCssId).val());
        });

        $("#"+configuration.hostIpInputCssId).val(configuration.hostIp);
        $("#"+configuration.portInputCssId).val(configuration.port);

        $("#"+configuration.dragZoneCssId).bind("dragenter", dragEnterHandler);
        $("#"+configuration.dropZoneCssId).bind("dragleave", dragLeaveHandler);
        $("#"+configuration.dropZoneCssId).bind("dragover", dragOverHandler);
        $("#"+configuration.dropZoneCssId).bind("drop", dropHandler);
    };

    var askToSaveWorkSpace = function() {
        webSocket.send(JSON.stringify({type:"backUp", content : "" }));
    };

    //public API -- methods
    MokaPlatform.prototype = {

        setHostIp : function(ip){
            configuration.hostIp = ip;
        },

        setPort : function(port){
            configuration.port = port;
        },

        run : function(){
            status = "connecting";
            $("#"+configuration.statusCssId).text("Connecting");
            $("#"+configuration.actionCssId).attr("src", configuration.connectionIcon);
            $("#"+configuration.actionCssId).addClass(configuration.rotatingCssClass);

            //<3 rotation effect, let's spin for at least 1.5sec
            setTimeout(function(){
                webSocket = new WebSocket('ws://'+configuration.hostIp+':'+configuration.port);
                webSocket.onopen    = function(event){ onWebSocketOpen(event);      };
                webSocket.onclose   = function(event){ onWebSocketClose(event);     };
                webSocket.onmessage = function(event){ onWebSocketMessage(event);   };
                webSocket.onerror   = function(event){ onWebSocketError(event);     };
            }, 1500);

        },

        close : function(){
            status = "disconnected";
            webSocket.close();
        },

        //TODO remove
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
        this.getId = function(){ return id; };
        this.getName = function(){ return name; };
        this.getUserInfo = function(){ return userInfo; };
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

        unLock : function(){
            this.getContributions().empty();
        },

        lock : function(color){
            var selection = $('<div class="itemContribution"/>');
            selection.css("background-color", color);
            this.getContributions().append(selection);
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
        move : function(pTop, pLeft){
            this.jQueryObject.animate({top: pTop+"px", left: pLeft+"px"}, 1);
        },

        /*
        *   Resize the item
        *
        *   @Param width
        *   @Param height
        */
        resize : function(pWidth, pHeight){
            this.jQueryObject.animate({width: pWidth+"px", height: pHeight+"px"}, 100);
        },

        /*
        *   Rotate the item
        *
        *   @Param rotateX
        *   @Param rotateY
        *   @Param rotateZ
        */
        rotate : function(rotateX, rotateY, rotateZ){
            this.jQueryObject.css("-webkit-transform", "perspective(300) rotateX("+rotateX+"deg) " + "rotateY("+rotateY+"deg) " +"rotateZ("+rotateZ+"deg)");
        },

        /*
        *   Edit the item
        *
        *   @Param field
        *   @Param content
        */
        edit : function(field, content){
            if(field == configuration.field.title){
                this.setTitle(content);
            }
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

    PostItItem.prototype.edit = function(field, content){
        if(field == configuration.field.postItContent){
            this.setText(content);
        }else{
            Item.prototype.edit.call(this, field, content);
        }
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
            var contentObject = this.getContentObject();
            contentObject.addClass(configuration.umlClassContentClass);
            this.getContentTitleObject().addClass(configuration.umlClassContentTitleClass);
            contentObject.append($('<div class="'+configuration.umlAttributesClass+'" />'));
            contentObject.append($('<div class="'+configuration.umlMethodsClass+'" />'));
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
    *   Picture Item Constructor
    *       extends Item
    */
    var PictureItem = function(id){
        Item.call(this, id);
    };

    PictureItem.prototype = new Item();

    /*
    *   Initialize the jQueryObject
    */
    PictureItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
            this.getContentObject().append(
                $('<div class="'+configuration.mediaContainerClass+'"/>').append(
                    $('<img class="'+configuration.mediaFillDivClass+' '+configuration.pictureContentClass+'" />')));
        }
    };


    PictureItem.prototype.edit = function(field, content){
        if(field == configuration.field.urlSrc){
            this.setSrc(content);
        }else{
            Item.prototype.edit.call(this, field, content);
        }
    };


    PictureItem.prototype.setSrc = function(src){
        this.getContentObject().find('.'+configuration.pictureContentClass).attr("src", src);
    };

    PictureItem.prototype.setAlt = function(alt){
        this.getContentObject().find('.'+configuration.pictureContentClass).attr("alt", alt);
    };


    /*
    *   Iframe Item Constructor
    *       extends Item
    */
    var IframeItem = function(id){
        Item.call(this, id);
    };

    IframeItem.prototype = new Item();

    /*
    *   Initialize the jQueryObject
    */
    IframeItem.prototype.init = function(jQueryObject){
        if(jQueryObject){
            this.jQueryObject = jQueryObject;
        }else{
            Item.prototype.init.call(this, null);
            this.getContentObject().append(
                $('<div class="'+configuration.mediaContainerClass+'"/>').append(
                    $('<iframe class="'+configuration.iframeContentClass+' '+configuration.mediaFillDivClass+'" src="" frameborder="0" allowfullscreen></iframe>')));
        }
    };


    IframeItem.prototype.edit = function(field, content){
        if(field == configuration.field.urlSrc){
            this.setSrc(content);
        }else{
            Item.prototype.edit.call(this, field, content);
        }
    };


    IframeItem.prototype.setSrc = function(src){
        this.getContentObject().find('.'+configuration.iframeContentClass).attr("src", src);
    };



    /*
    *   Video Item Constructor
    *       extends IframeItem
    */
    var VideoItem = function(id){
        IframeItem.call(this, id);
    };

    VideoItem.prototype = new IframeItem();

    VideoItem.prototype.edit = function(field, content){
        if(field == configuration.field.urlSrc){
            content = getURLParameter(content, "v");
            content = "http://www.youtube.com/embed/"+content+"?rel=0";
            this.setSrc(content);
        }else{
            IframeItem.prototype.edit.call(this, field, content);
        }

    }

    var getURLParameter = function(url, name) {
        return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1]);
    };


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

    /*
    *   Create a new picture
    */
    var createPicture = function(id){
        var newPictureItem = new PictureItem(id);
        newPictureItem.init();
        newPictureItem.setTitle(configuration.pictureTitle+" "+id);
        newPictureItem.setAlt(id);
        newPictureItem.setSrc(configuration.defaultPictureSrc);
        return newPictureItem;
    }

     /*
    *   Create a new iframe
    */
    var createIframe = function(id){
        var newIframeItem = new IframeItem(id);
        newIframeItem.init();
        newIframeItem.setTitle(configuration.iframeTitle+" "+id);
        newIframeItem.setSrc("");
        return newIframeItem;
    }

     /*
    *   Create a new video
    */
    var createVideo = function(id){
        var newVideoItem = new VideoItem(id);
        newVideoItem.init();
        newVideoItem.setTitle(configuration.videoTitle+" "+id);
        newVideoItem.setSrc("");
        return newVideoItem;
    }


    var createItem = function(type, id) {
        if(type === configuration.umlClassType){
            return createUmlClass(id);
        }else if( type === configuration.postItType){
            return createPostIt(id);
        }else if(type === configuration.pictureType){
            return createPicture(id);
        }else if(type === configuration.videoType){
            return createVideo(id);
        }else if(type === configuration.iframeType){
            return createIframe(id);
        }
        return null;
    };

    return {
        createItem      :   createItem,
    };

})(Moka.itemFactoryConfiguration);