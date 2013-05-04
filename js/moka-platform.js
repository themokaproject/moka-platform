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
    }
    
    //public API -- methods
    MokaPlatform.prototype = {
        
        ping : function(){
            console.log(pong);
        },
    
    };
    
    return MokaPlatform;    
})();



    