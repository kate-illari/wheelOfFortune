/* global Sys */

/* DEBUG_START */
console.warn("Any platform specific properties in Sys is deprecated.");

/* DEBUG_END */

/**
 * The Sys-namespace contains critical framework methods and classes which extend/complement the Javascript language.
 *
 * @class Sys
 * @singleton
 */
window.Sys = {};

// Detects the user agent/device type and updates the Sys object upon load.

// ( means that we self-execute the function once it has been defined
// why do we do this? because we do not need it to be called anywhere, we want it to run immediately
(function() {
    // For use within iPad developer UIWebView
    // Thanks to Andrew Hedges!
    var userAgent = navigator.userAgent,
        model,
        displayZoom;

    /**
     * Flag specifies if OpenBet mode should be switched on
     */
    Sys.openBetMode = false;
    if (/callbackurl/i.test(window.location.search) && (/integration=openbet/i.test(window.location.search) || /openbet\.user_id/i.test(window.location.search))) {
        Sys.openBetMode = true;
    }

    Sys.openBetPlayForFunMode = false;
    if (/integration=openbet/i.test(window.location.search) && !Sys.openBetMode) {
        Sys.openBetPlayForFunMode = true;
    }

    /**
     * Flag specifies if GCM mode should be switched on
     */
    Sys.isGcmEnabled = false;
    if (/openbet.gcmMode=true/i.test(window.location.search)) {
        Sys.isGcmEnabled = true;
    }

    /**
     * Flag which indicates if the used device is an iPad
     * @deprecated
     */
    Sys.isiPad = false;

    /**
     * Flag which indicates if the used device is an iPhone
     * @deprecated
     */
    Sys.isiPhone = false;

    /**
     * Flag which indicates if the used device is an iPhone using iOS 7
     * @deprecated
     */
    Sys.isiPhoneIOS7 = false;

    /**
     * Flag which indicates if the used device is an iPhone using iOS 8
     * @deprecated
     */
    Sys.isiPhoneIOS8 = false;

    /**
     * Flag which indicates if the used device is an iPhone using iOS 9
     * @deprecated
     */
    Sys.isiPhoneIOS9 = false;

    /**
     * Flag which indicates if the used device is an iPod
     * @deprecated
     */
    Sys.isiPod = false;

    /**
     * Flag which indicates if the used device is an Android device
     * @deprecated
     */
    Sys.isAndroidDevice = false;

    /**
     * Flag/object which indicates if the used device is a Samsung S-series device or not (S2, S3)
     * @deprecated
     */
    Sys.isSamsungS = false;

    /**
     * Flag which indicates if the used device is a HTC One X or not
     * @deprecated
     */
    Sys.isOneX = false;

    /**
     * Flag which indicates if the used device is a HTC One or not
     * @deprecated
     */
    Sys.isHTCOne = false;

    /**
     * Flag which indicates if the used device is running android 2.3
     * @deprecated
     */
    Sys.isAndroid23Device = false;

    /**
     * Flag which indicates if the used device is running android 4.0
     * @deprecated
     */
    Sys.isAndroid400 = false;

    /**
     * Flag which indicates if the used device is running android 4.1
     * @deprecated
     */
    Sys.isAndroid410 = false;

    /**
     * Flag which indicates if the used device is an Android tablet
     * @deprecated
     */
    Sys.isAndroidTablet = false;

    /**
     * Flag which indicates if the used device is an Android 3 tablet
     * @deprecated
     */
    Sys.isAndroid3Tablet = false;

    /**
     * Flag which indicates if the used device is a desktop
     * @deprecated
     */
    Sys.isDesktop = false;

    // The flag is set by the self-executing anonfunc below it.
    /**
     * Does the device support Webkit's 3D transforms? Inspired by Modernizr.
     * @deprecated
     */
    Sys.has3DTransforms = false;

    /**
     * Flag which indicates if the browser is Chrome
     * @deprecated
     */
    Sys.isChrome = false;

    /**
     * Flag which indicates if the browser is Chrome 28
     * @deprecated
     */
    Sys.isChrome280 = false;

    /**
     * Flag which indicates if the browser is Safari
     * @deprecated
     */
    Sys.isSafari = false;

    /**
     * Flag which indicates if the browser is Chrome for IOS
     * @deprecated
     */
    Sys.isChromeForIOS = false;

    /**
     * @deprecated
     */
    (function() {
        var doc = document,
            div = doc.createElement("div"),
            ret = false,
            st;

        if (div.style.webkitPerspective !== undefined) {
            st = doc.createElement("style");
            st.textContent = "@media (-webkit-transform-3d){#test3d{height:3px}}";
            doc.getElementsByTagName("head")[0].appendChild(st);

            // not needed?
            div.id = "test3d";

            // body does not always exist, that is why we do a check for it. If Sys is run
            // in a test environment, or where body "load" has not finished, body will not exist.
            // If we have no body, we will not have any 3d transforms.
            if (doc.body) {
                doc.body.appendChild(div);

                ret = div.offsetHeight === 3;

                st.parentNode.removeChild(st);
                div.parentNode.removeChild(div);
            }
        }
        Sys.has3DTransforms = ret;
    }());

    // Check for Chrome Browser
    // @deprecated
    if (userAgent.match(/Chrome/i)) {
        Sys.isChrome = true;

        if (userAgent.match(/Chrome\/28[\.\d]/i)) {
            Sys.isChrome280 = true;
        }
    }

    // Check for Chrome of iOS browser
    // @deprecated
    if (userAgent.match(/CriOS/i)) {
        Sys.isChromeForIOS = true;
    }

    // @deprecated
    if (userAgent.match(/Safari/i) && !Sys.isChromeForIOS) {
        Sys.isSafari = true;
    }

    // For use within normal web clients
    // @deprecated
    if (userAgent.match(/iPad/i) !== null) {
        Sys.isiPad = true;
    }
    // @deprecated
    else if ((userAgent.match(/iPod/i))) {
        Sys.isiPod = true;
    }
    // @deprecated
    else if ((userAgent.match(/iPhone/i))) {
        // Default to 3GS, 4 or 4S devices
        model = "3gs,4,4s";
        displayZoom = "standard";

        // iPhone 5, 5s & 5c
        model = (window.screen.height === 568) ? "5" : model;

        // iPhone 6, if in zoomed mode it will be detected as a iPhone 5
        model = (window.screen.height === 667) ? "6" : model;

        // iPhone 6+
        displayZoom = window.matchMedia("(-webkit-min-device-pixel-ratio: 3)").matches && model === "6" ? "zoomed" : displayZoom;
        model = window.matchMedia("(-webkit-min-device-pixel-ratio: 3)").matches ? "6+" : model;

        Sys.isiPhone = {
            series: "iPhone",
            model: model,
            displayZoom: displayZoom
        };
    }
    // @deprecated
    else if ((userAgent.match(/Android/i)) || userAgent.match(/HTC_Sensation/i)) {
        Sys.isAndroidDevice = true;

        if (userAgent.match(/Android 3[\.\d]+/i)) {
            Sys.isAndroid3Tablet = true;
            Sys.isAndroidTablet = true;
        }
        else if (!userAgent.match(/mobile/i)) {
            Sys.isAndroidTablet = true;
        }
        else if (userAgent.match(/Android 2\.3/i)) {
            Sys.isAndroid23Device = true;
        }
        else if (userAgent.match(/Android 4\.0/i)) {
            Sys.isAndroid400 = true;
        }
        else if (userAgent.match(/Android 4\.1/i)) {
            Sys.isAndroid410 = true;
        }
        else if (userAgent.match(/Android 4\.2/i)) {
            Sys.isAndroid420 = true;
        }
        else if (userAgent.match(/Android 4\.3/i)) {
            Sys.isAndroid430 = true;
        }
    }
    else {
        Sys.isDesktop = true;
    }

    // Only use ios7 scaling solution if we have an iPhone or iPod with iOS 7 and we are not in standalone(webapp mode) and we're running a safari browser
    /**
     * Flag which indicates if the device is iPhone with iOS 7
     * @deprecated
     * @ignore
     */
    Sys.isiPhoneIOS7 = (userAgent.indexOf("IEMobile") < 0) && (/(?:OS\s*[7]+_0(?:_\d+)?\s*)/i.test(userAgent) && !window.navigator.standalone) && (Sys.isiPhone || Sys.isiPod) && Sys.isSafari;

    // Only use iOS8 scaling solution if we have an iPhone or iPod with iOS 8 and we are not in standalone(webapp mode) and we're running a safari browser
    /**
     * Flag which indicates if the device is iPhone with iOS 8
     * @deprecated
     * @ignore
     */
    Sys.isiPhoneIOS8 = (/OS\s*8_/i.test(userAgent) && !window.navigator.standalone) && Sys.isiPhone && Sys.isSafari;

    // Only use iOS9 scaling solution if we have an iPhone or iPod with iOS 9 and we are not in standalone(webapp mode) and we're running a safari browser
    /**
     * Flag which indicates if the device is iPhone with iOS 9
     * @deprecated
     * @ignore
     */
    Sys.isiPhoneIOS9 = (/OS\s*9_/i.test(userAgent) && !window.navigator.standalone) && Sys.isiPhone && Sys.isSafari;

    Sys.isiOS9 = (/OS\s*9_/i.test(userAgent));

    /**
     * A flag determining of the device is an iPhone 4/4s
     * @deprecated
     */
    Sys.isIphone4Or4s = Sys.isiPhone && window.matchMedia("(-webkit-min-device-pixel-ratio: 2)").matches && window.screen.width === 320 && window.screen.height === 480;
    Sys.isIphone5Or5sOr5c = Sys.isiPhone && window.screen.width === 320 && window.screen.height === 568;

    // Check if Samsung Galaxy S2
    // @deprecated
    if ((userAgent.match(/GT-I9100/))) {
        Sys.isSamsungS = {
            series: "samsungS",
            model: "s2"
        };
    }
    // Check if Samsung Galaxy S3
    // @deprecated
    else if ((userAgent.match(/GT-I9300/))) {
        Sys.isSamsungS = {
            series: "samsungS",
            model: "s3"
        };
    }
    // Check if Samsung Galaxy S (regular, mini, active)
    // @deprecated
    else if ((userAgent.match(/GT-I9505/)) || (userAgent.match(/GT-I9506/)) || (userAgent.match(/GT-I9521/)) || (userAgent.match(/GT-I9525/))) {
        Sys.isSamsungS = {
            series: "samsungS",
            model: "s4"
        };
    }

    /**
     * Flag which indicates if the device is an iOS device
     * @deprecated
     */
    Sys.isiOSDevice = Sys.isiPad || Sys.isiPhone || Sys.isiPod;

    /**
     * Determines, and returns boolean, if device is a Iphone 3GS by screen resolution and pixel-ratio
     * @deprecated
     */
    Sys.isIphone3GS = (Sys.isiOSDevice && !window.matchMedia("(-webkit-min-device-pixel-ratio: 2)").matches && window.screen.width === 320 && window.screen.height === 480);

    /**
     * Tells if we are using a touch device or not. (http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886)
     * @deprecated Use Utils.Platform.isTouchSupported.
     */
    Sys.isTouchDevice = Boolean("ontouchstart" in window);

    /**
     * @property {String}
     * If using desktop client "click" otherwise "touchend" since it is faster than click
     * @deprecated Should be handled within user input module.
     */
    Sys.clickEvent = Sys.isTouchDevice ? "touchend" : "click";

    /**
     * @property {String}
     * If using desktop client "mousedown" otherwise "touchstart"
     * @deprecated Should be handled within user input module.
     */
    Sys.touchstartEvent = Sys.isTouchDevice ? "touchstart" : "mousedown";

    /**
     * @property {String}
     * If using desktop client "mouseup" otherwise "touchend"
     * @deprecated Should be handled within user input module.
     */
    Sys.touchendEvent = Sys.isTouchDevice ? "touchend" : "mouseup";

    /**
     * Works as expected on the desktop but on the iOS it is triggered when touching other touchable element.
     * @deprecated Should be handled within user input module.
     */
    Sys.touchoutEvent = "mouseout";

    /**
     * @property {String}
     * Event name for touch/mouse movement
     * possible values are:
     *
     * - touchmove
     * - mousemove
     * @deprecated Should be handled within user input module.
     */
    Sys.touchmoveEvent = Sys.isTouchDevice ? "touchmove" : "mousemove";

    /**
     * @property {Boolean}
     * Flag to indicate if game is loaded in iFrame
     * @deprecated Use Utils.Platform.inIframe() instead.
     */
    Sys.isInIFrame = (window !== window.parent);
}());

/**
 * Copies all properties from an object to another, overwriting properties if already existing.
 *
 * @example
 *     // declare "input" object
 *     var obj1 = {
 *         p1 : "banana",
 *         p2 : "apple"
 *     };
 *
 *     // create obj2 where we overwrite fields in obj1 with a newly defined object
 *     var obj2 = Sys.apply(obj1, {
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 *     // output:
 *     console.log(obj2);
 *     >> obj2 = {
 *         p1 : "banana",
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 * @param {Object} existingObject The object to copy properties to.
 * @param {Object} newProperties The new properties in an object form.
 * @returns {Object} Returns the existing object with new properties added.
 */
Sys.apply = function(existingObject, newProperties) {
    var prop;

    /*
     should use object spread instead.
     var newObj = {
        ...oldObj,
        foo: "foo"
     };
     */

    existingObject = existingObject || {};
    if (newProperties === null || !Sys.isDefined(newProperties)) {
        return existingObject;
    }

    // if both input parameters are defined and newProperties is an object
    if (existingObject && newProperties && Sys.isObj(newProperties)) {
        // copy each of the properties to existingObject
        for (prop in newProperties) {
            if (newProperties.hasOwnProperty(prop)) {
                existingObject[prop] = newProperties[prop];
            }
        }
    }
    return existingObject;
};

/**
 * Copies all properties !== undefined from one object to another, overwriting properties if already existing.
 *
 * @example
 *     // declare "input" object
 *     var obj1 = {
 *         p1 : "banana",
 *         p2 : "apple"
 *     };
 *
 *     // create obj2 where we overwrite fields in obj1 with a newly defined object
 *     var obj2 = Sys.apply(obj1, {
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 *     // output:
 *     console.log(obj2);
 *     >> obj2 = {
 *         p1 : "banana",
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 * @deprecated 8.0.0. Use Sys.apply. This function is similar to object spread but does not add undefined values.
 * @param {Object} receiver The object to copy properties to.
 * @param {Object} giver The new properties in an object form.
 * @returns {Object} The receiver with the new properties added.
 */
Sys.applyProperties = function(receiver, giver) {
    var keys = Object.keys(giver),
        keyCount = keys.length,
        i, key;

    for (i = -1; ++i < keyCount;) {
        key = keys[i];
        if (Sys.isDefined(giver[key])) {
            receiver[key] = giver[key];
        }
    }

    return receiver;
};

/**
 * Copies all properties from an object to another only if they do not exist in existing object.
 * Useful when setting default values in methods.
 *
 * @example
 *     // declare "input" object
 *     var obj1 = {
 *         p1 : "banana",
 *         p2 : "apple"
 *     };
 *
 *     var obj2 = Sys.applyIf(obj1, {
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 *     // output
 *     console.log(obj2);
 *     >> obj2 = {
 *         p1 : "banana",
 *         p2 : "apple", // note: apple is still here, since "p2" was previously declared
 *         p3 : "icecream" // since "p3" did not exist, it was added here
 *     };
 *
 * @param {Object} existingObject The object to copy properties to.
 * @param {Object} newProperties The new properties in an object form.
 * @throws {Error}
 * @returns {Object} Returns the existing object with new properties added.
 */
Sys.applyIf = function(existingObject, newProperties) {
    var prop;

    /*
     should use object spread instead.
     var newObj = {
        foo: "foo",
        ...oldObj
     };
     */

    // if both input parameters are defined and newProperties is an object
    if (existingObject && newProperties && Sys.isObj(newProperties)) {
        // copy each of the properties to existingObject
        for (prop in newProperties) {
            if (newProperties.hasOwnProperty(prop) && !existingObject.hasOwnProperty(prop)) {
                existingObject[prop] = newProperties[prop];
            }
        }
    }
    else {
        throw new Error("Error in Sys.applyIf");
    }
    return existingObject;
};

/**
 * Copies all properties !== undefined from one object to another, does not overwrite existing properties.
 *
 * @example
 *     // declare "input" object
 *     var obj1 = {
 *         p1 : "banana",
 *         p2 : "apple"
 *     };
 *
 *     // create obj2 where we overwrite fields in obj1 with a newly defined object
 *     var obj2 = Sys.apply(obj1, {
 *         p2 : "cookie",
 *         p3 : "icecream"
 *     };
 *
 *     // output:
 *     console.log(obj2);
 *     >> obj2 = {
 *         p1 : "banana",
 *         p2 : "apple",
 *         p3 : "icecream"
 *     };
 *
 * @deprecated 8.0.0. Use Sys.applyIf. This function is similar to object spread but does not add undefined values.
 * @param {Object} receiver The object to copy properties to.
 * @param {Object} giver The new properties in an object form.
 * @returns {Object} The receiver with the new properties added.
 */
Sys.applyPropertiesIf = function(receiver, giver) {
    var keys = Object.keys(giver),
        keyCount = keys.length,
        i, key;

    for (i = -1; ++i < keyCount;) {
        key = keys[i];
        if (!Sys.isDefined(receiver[key]) && Sys.isDefined(giver[key])) {
            receiver[key] = giver[key];
        }
    }

    return receiver;
};

/**
 * Handy function to iterate through an object.
 *
 * @example
 *     var o1 = {"k1" : 123, "k2": "456"};
 *     this.o1Keys = [];
 *     this.o1Values = [];
 *
 *     // provide Sys.iterate with scope (else it will be executed in global scope)
 *     Sys.iterate(o1, function(key, value) {
 *          this.o1Keys.push(key);
 *          this.o1Values.push(value);
 *     }, this);
 *
 *     var o2 = {"k1" : 123, "k2": "456"};
 *     var o2Keys = [];
 *     // don't care about scope, we're only using a local variable anyway
 *     Sys.iterate(o1, function(k) {
 *          o2Keys.push(k);
 *     });
 *
 * @deprecated 8.0.0. Use native equivalent instead of Object.keys().forEach().
 * @param {Object} dict The object to iterate through.
 * @param {Function} fun The function to execute for each key/value-pair.
 * @param {Object} [scope] The scope to execute parameter "fun" in. If not specified, it will be the global scope.
 * @returns {Object} The dictionary that has been looped through.
 */
Sys.iterate = function(dict, fun, scope) {
    var i;

    // Make sure that parameters are correct
    if (!Sys.isObj(dict) || typeof fun !== "function") {
        return dict;
    }

    // loop through the object, make sure that each property exists, and execute
    // function with correct scope
    for (i in dict) {
        if (dict.hasOwnProperty(i)) {
            fun.call(scope || dict, i, dict[i]);
        }
    }

    // return input dictionary
    return dict;
};

/**
 * Handy function to iterate through an array.
 *
 * @example
 * using the second parameter: array index
 *
 *     var arr = [1,2,3];
 *     Sys.each(arr, function(value, index) {
 *          console.log("array item " + index + " = " + value);
 *     });
 *
 *     // will output:
 *     // >> array item 0 = 1
 *     // >> array item 1 = 2
 *     // >> array item 2 = 3
 *
 * providing scope to use correct variables
 *
 *     sum1 = 0; // global sum1, actually resides in window.sum1
 *
 *     // Inside class method:
 *     var arr = [1,2,3];
 *     this.sum1 = 0; // set sum1 of class
 *
 *     // provide Sys.each with scope, else it will be executed in global scope
 *     // and the global window.sum1 will be updated as Sys.each default to window
 *     // scope
 *     Sys.each(arr, function(value) {
 *          this.sum1 += value;
 *     }, this);
 *
 * Abort the loop when we encouter a certain value
 * In this case I want to have the first city which is active
 *
 *     var cities = [
 *          {
 *              name : "stockholm",
 *              active : false
 *          },{
 *              name : "rome",
 *              active : true
 *          },{
 *              name : "london"
 *              active : true
 *          }
 *     ],
 *     destination;
 *
 *     // returning false inside a Sys.each will break the loop
 *     Sys.each(cities, function(city) {
 *          if(city.active) {
 *              destination = city;
 *              return false;
 *          }
 *          // alternative version, a bit more non-readable
 *          destination = city;
 *          return !city.active;
 *     });
 *     // destination will be {city: "rome", active: true}
 *
 * @deprecated 8.0.0. Use [Array.prototype.forEach](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) where applicable.
 * @param {Array} arr The array to iterate through.
 * @param {Function} fun The function to execute for each array item. If function returns false, execution is stopped and the index is returned.
 * @param {Object} [scope] The scope to execute fun in. If not specified, it will be the global scope.
 * @returns {Array|boolean|void} The index if returns false, otherwise the array.
 */
Sys.each = function(arr, fun, scope) {
    var i,
        len;

    // Make sure that parameters are correct
    if (!Sys.isArray(arr) || typeof fun !== "function") {
        return arr;
    }

    // loop through the object and execute the function with correct scope
    for (i = 0, len = arr.length; i < len; i += 1) {
        if (fun.call(scope || arr[i], arr[i], i) === false) {
            return i;
        }
    }

    // return input array
    return arr;
};

/**
 * Checks whether an item is present inside an array.
 *
 * @example
 * Sys.contains(["foo", "bar", "baz"], "bar");  //=> true
 * Sys.contains(["foo", "bar", "baz"], "quux"); //=> false
 *
 * @deprecated 8.0.0. Use native equivalent.
 * @param {Array} xs The array to search in.
 * @param {string|number} x The value to search for.
 * @returns {boolean} If item is present.
 */
Sys.contains = function(xs, x) {
    if (Array.prototype.includes) {
        return xs.includes(x);
    }

    return xs.indexOf(x) > -1;
};

/**
 * Combinator for creating variadic functions.
 *
 * @example
 * Sys.variadic(function (x, xs)       { return [x, xs]       })(1,2,3);  //=> [1, [2, 3]]
 * Sys.variadic(function (x, y, xs)    { return [x, y, xs]    })(1,2,3);  //=> [1, 2, [3]]
 * Sys.variadic(function (x, y, z, xs) { return [x, y, z, xs] })(1,2,3);  //=> [1, 2, 3, []]
 *
 * @param {Function} f The function to make variadic.
 * @returns {Function} Variadic function.
 */
Sys.variadic = function(f) {
    var arity = f.length - 1;

    return function() {
        var args = [].slice.call(arguments, 0, arity),
            rest = [].slice.call(arguments, arity);

        return f.apply(this, args.concat([rest]));
    };
};

/**
 * Set namespace.
 *
 * @example
 * Create shallow namespace
 *
 *     Sys.ns("Tools");
 *     Tools.ai = new SomeClass();
 *
 * Create nested namespace.
 * Note that Sys.ns("Tools") is not needed when creating "Tools.Input", it will be created automatically.
 *
 *     Sys.ns("Tools.Input");
 *     Tools.Input.parser = new SomeClass();
 *
 * @param {string} ns The name of the namespace.
 * @returns {void}
 */
Sys.ns = function(ns) {
    var nsArr,
        scope,

        // always use empty string if nothing is provided
        namespace = ns || "";

    // split by dots: "Tools.Input" => ["Tools", "Input"]
    nsArr = namespace.split(".") || [];

    // Set window as scope (global)
    scope = window;

    // While the array of namespaces is not empty
    while (nsArr.length > 0) {
        // Get the first element
        namespace = nsArr.shift();

        // Create it in the current scope
        if (Sys.isEmpty(scope[namespace])) {
            scope[namespace] = {};
        }

        // If iterating, set new scope
        scope = scope[namespace];
    }
};

/**
 * Utility function that fetches a value from each object in an array of objects, and returns them in an array.
 *
 * @example
 *     var items = [
 *         {
 *             "foo" : 1,
 *             "bar" : "a"
 *         },
 *         {
 *             "foo" : 2,
 *             "bar" : "b"
 *         },
 *         {
 *             "foo" : 3,
 *             "bar" : "c"
 *         },
 *     ];
 *
 *     Sys.pluck(items, "foo"); // => [1, 2, 3]
 *     Sys.pluck(items, "bar"); // => ["a", "b", "c"]
 *
 * @param {Object[]} arr The array of objects from which to grab values. Each object in the array MUST have a field named the same as param f.
 * @param {string} f The field from which to grab values in each object.
 * @returns {Array} The array of plucked values.
 */
Sys.pluck = function(arr, f) {
    var r = [];

    // loop through the array, fetching the value from each object
    Sys.each(arr, function(item) {
        r.push(item[f]);
    });

    return r;
};

/**
 * Utility function that determines if the input parameter is empty or not.
 *
 * @example
 *     Sys.isEmpty()          === true
 *     Sys.isEmpty(null)      === true
 *     Sys.isEmpty(undefined) === true
 *     Sys.isEmpty([])        === true
 *     Sys.isEmpty({})        === false
 *     Sys.isEmpty([1])       === false
 *     Sys.isEmpty("")        === false
 *
 * @deprecated 8.0.0. Use native truthy checks instead.
 * @param {*} o The parameter to check.
 * @returns {boolean} True if parameter is empty, false otherwise.
 */
Sys.isEmpty = function(o) {
    return (o === null) || !Sys.isDefined(o) || (Sys.isArray(o) && !o.length);
};

/**
 * Utility function that determines if the input parameter is defined or not.
 *
 * @example
 *     Sys.isDefined()          === false
 *     Sys.isDefined(undefined) === false
 *     Sys.isDefined(null)      === true
 *     Sys.isDefined("")        === true
 *     Sys.isDefined(false)     === true
 *
 * Sys.isDefined is useful when checking input parameters
 *
 *     var foo = function(p1) {
 *          if(!Sys.isDefined(p1)) {
 *              return;
 *          }
 *          // ....
 *     };
 *
 * @deprecated 8.0.0. Use native typeof instead.
 * @param {*} o The parameter to check.
 * @returns {boolean} True if parameter is defined, false otherwise.
 */
Sys.isDefined = function(o) {
    // checking typeof is more secure than just comparing type, since this also handles
    // situations where o is not declared
    return typeof o !== "undefined";
};

/**
 * Utility function that returns a default value if input parameter is empty.
 *
 * @example
 *     Sys.defaultValue(null, "foo");   // => "foo"
 *     Sys.defaultValue([1, 2, 3], []); // => [1, 2, 3]
 *     Sys.defaultValue(undefined, []); // => []
 *     Sys.defaultValue(null, []);      // => []
 *
 * @deprecated 8.0.0. Use OR (||) operator instead.
 * @param {*} v The parameter to test.
 * @param {*} defaultValue The default value to return if input parameter is empty.
 * @returns {*} The input parameter if defined, else default value.
 */
Sys.defaultValue = function(v, defaultValue) {
    return Sys.isEmpty(v) ? defaultValue : v;
};

/**
 * Adds functions to the prototype of a class, overwriting existing functions if they exist.
 *
 * @deprecated 8.0.0. Use Sys.extend instead. Override is bad. Stahp.
 * @param {Object} cls The class to add/override functions to.
 * @param {Object} newProps The object of new properties/functions to add the cls.
 * @returns {void}
 */
Sys.override = function(cls, newProps) {
    if (newProps) {
        Sys.apply(cls.prototype, newProps);
    }
};

/**
 * Overrides the entire class including the constructor.
 *
 * @deprecated 8.0.0. DON'T OVERRIDE. PRETTY PLEASE. WITH SUGAR ON TOP.
 * @param {Object} originalClass The class to override.
 * @param {Object} newProperties The new class properties.
 * @returns {Object} The updated class.
 */
Sys.overrideClass = function(originalClass, newProperties) {
    var prototype,
        superclass;

    if (Sys.isObj(newProperties)) {
        Sys.apply(originalClass.prototype, newProperties);

        prototype = originalClass.prototype;
        superclass = originalClass.superclass;

        if (typeof newProperties.constructor === "function") {
            originalClass = newProperties.constructor;
        }

        originalClass.prototype = prototype;
        originalClass.superclass = superclass;
    }

    return originalClass;
};

/**
 * Utility function that tells if input parameter is an array or not.
 *
 * @deprecated 8.0.0. Use Array.isArray when checking against arrays. This falsely accepts array objects.
 * @param {*} arr Input parameter to examine.
 * @returns {boolean} Returns true if input parameter is array, false otherwise.
 */
Sys.isArray = function(arr) {
    var type = Object.prototype.toString.call(arr);

    return (type === "[object Array]" || type === "[object NodeList]" || type === "[object TouchList]" || type === "[object HTMLCollection]");
};

/**
 * Utility function that tells if input parameter is a string or not.
 *
 * @example
 *     Sys.isString()   === false
 *     Sys.isString({}) === false
 *     Sys.isString([]) === false
 *
 *     Sys.isString("") === true
 *
 * @deprecated 8.0.0. Use native typeof instead.
 * @param {*} str Parameter.
 * @returns {boolean} Returns true if the input parameter is a string, false otherwise.
 */
Sys.isString = function(str) {
    return typeof str === "string";
};

/**
 * Utility function that tells if input parameter is a number or not.
 *
 * @example
 * Sys.isNumber()     === false
 * Sys.isNumber([])   === false
 * Sys.isNumber(null) === false
 * Sys.isNumber(NaN)  === false
 *
 * Sys.isNumber(1)    === true
 * Sys.isNumber(0)    === true
 *
 * @param {*} number Parameter.
 * @returns {boolean} Returns true if the input parameter is a number, false otherwise.
 */
Sys.isNumber = function(number) {
    return !isNaN(number) && typeof number === "number";
};

/**
 * Utility function that tells if input parameter is an object or not.
 *
 * @example
 * Sys.isObj()     === false
 * Sys.isObj([])   === false
 * Sys.isObj("")   === false
 * Sys.isObj(null) === false
 * Sys.isObj({})   === true
 *
 * @param {*} obj Parameter.
 * @returns {boolean} Returns true if the input parameter is object, false otherwise.
 */
Sys.isObj = function(obj) {
    return !Sys.isArray(obj) && typeof obj === "object";
};

/**
 * Utility function that tells if input parameter is an function or not.
 *
 * @example
 * Sys.isFunc()               === false
 * Sys.isFunc({})             === false
 * Sys.isFunc("")             === false
 *
 * Sys.isFunc(function () {}) === true
 * Sys.isFunc(Sys.isFunc)     === true
 *
 * @deprecated 8.0.0. Use native typeof instead.
 * @param {*} obj Parameter.
 * @returns {boolean} Returns true if the input parameter is function, false otherwise.
 */
Sys.isFunc = function(obj) {
    return typeof obj === "function";
};

/**
 * Utility function that tells if the input parameter is an AudioBuffer or not.
 *
 * @param {*} obj Parameter.
 * @returns {boolean} Returns true if the input parameter is function, false otherwise.
 */
Sys.isAudioBuffer = function(obj) {
    return Object.prototype.toString.call(obj) === "[object AudioBuffer]";
};

/**
 * Check if obj is an instance of the provided class reference.
 *
 * @example
 * var a = new Sys.Observable();
 * Sys.isInstanceOf(a, Sys.Observable) === true
 * Sys.isInstanceOf(a, Sys.Element)    === false
 *
 * @deprecated 8.0.0. Use native instanceof instead.
 * @param {Object} obj The object to compare.
 * @param {Object} classReference The class to compare with.
 * @returns {boolean} True if obj is an instance of the class.
 */
Sys.isInstanceOf = function(obj, classReference) {
    var ret = false;

    try {
        ret = (obj instanceof classReference);
    }
    catch (e) {
        // error
    }

    return ret;
};

/**
 * Copies all properties from one object to another and returns it.
 * Unlike Sys.apply, this is an actual copy that returns a new object, not just copies properties to an existing object.
 *
 * @example
 *     var testObj = {
 *          a : "hello",
 *          b : "world!"
 *     };
 *
 *     var copy = Sys.copyObject(testObj);
 *
 *     testObj.c = "again!";
 *
 *     // testObj = {a : "hello", b : "world!", c : "again!"}
 *     // copy    = {a : "hello", b : "world!"}
 *
 * @param {Object} inputObj The object from which to copy properties.
 * @returns {Object} A new object with properties and values from the input object.
 */
Sys.copyObject = function(inputObj) {
    return Sys.apply({}, inputObj);
};

/**
 * @inheritdoc
 */
Sys.copyObj = Sys.copyObject;

/**
 * Recursively deep copies the specified object and returns the clone.
 *
 * @param {*} objToClone Object to clone.
 * @returns {*} A deep-copy of the objToClone.
 */
Sys.clone = function(objToClone) {
    // Create clone
    var clone, len;

    if (Sys.isArray(objToClone)) {
        len = objToClone.length;
        clone = [];

        // Loop through all elements in array and add clones
        for (;--len > -1;) {
            clone[len] = Sys.clone(objToClone[len]);
        }

        return clone;
    }
    else if (Sys.isObj(objToClone)) {
        clone = {};
        // Iterate through the key-value pairs in the object and add clones
        Object.keys(objToClone).forEach(function(key) {
            var value = objToClone[key];

            clone[key] = Sys.clone(value);
        });

        return clone;
    }

    return objToClone;
};

/**
 * Extends a superclass with new functionality.
 *
 * @example
 * Extending from Sys.Observable:
 *
 *     var ClassA = Sys.extend(Sys.Observable, {
 *          foo : function() {
 *              console.log("foo in ClassA");
 *          }
 *     });
 *
 * Extending from ClassA:
 *
 *     var ClassB = Sys.extend(ClassA, {
 *          foo : function() {
 *              console.log("foo in ClassB");
 *              // if we want to call to superclass, this is how to do it
 *              ClassB.superclass.foo.apply(this, arguments);
 *          }
 *     });
 *
 *     var b = new ClassB();
 *     b.foo(); // will output: "foo in ClassB", "foo in ClassA"
 *
 *
 * Adding a custom constructor: extending from Sys.Observable:
 *
 *     var ClassA = Sys.extend(Sys.Observable, {
 *          constructor : function() {
 *              console.log("constructor in ClassA");
 *              ClassA.superclass.constructor.apply(this, arguments);
 *          }
 *          ,
 *          foo : function() {
 *              console.log("foo in ClassA");
 *          }
 *     });
 *
 * Adding a custom constructor: extending from ClassA:
 *
 *     var ClassB = Sys.extend(ClassA, {
 *          constructor : function() {
 *              console.log("constructor in ClassB");
 *              ClassB.superclass.constructor.apply(this, arguments);
 *          }
 *          ,
 *          foo : function() {
 *              console.log("foo in ClassB");
 *              // if we want to call to superclass, this is how to do it
 *              ClassB.superclass.foo.apply(this, arguments);
 *          }
 *     });
 *
 *     var b = new ClassB(); // will output "constructor in ClassB", "constructor in ClassA"
 *     b.foo(); // will output: "foo in ClassB", "foo in ClassA"
 *
 * @param {Function} superClass The superclass to extend from.
 * @param {Object} subClass The new properties and functions that we wish to extend the superclass with. NOTE: If adding a custom constructor, you MUST call the superclass's constructor.
 * @param {string} className The name of the sub class.
 * @returns {Function} The class extended from the superClass. Note that it is a class, not an object. It needs to be instantiated with "new".
 */
Sys.extend = function(superClass, subClass, className) {
    // the object prototype constructor constructor, used later for comparison
    var standardObjectConstructor = Object.prototype.constructor,
        // copy subclass's new properties to a "overrides" variable
        overrides = subClass,
        // create a new empty function (Class)
        PrototypeClass = function() {
            // stub
        };

    // If there is a constructor specified in the subClass object, use it as the constructor function for "subClass". Else, use the constructor of superclass.
    if (overrides.constructor !== standardObjectConstructor) {
        subClass = overrides.constructor;
    }
    else {
        subClass = function() {
            superClass.apply(this, arguments);
        };
    }

    /*
     * Set the prototype of PrototypeClass to the superclass prototype to have it inherit all the methods of the superclass
     * NOTE: If error found here in debugger, make sure that you have spelled the class that you are extending correctly,
     * for example Sys.Observable is spelled with a capital "O"
     * You can also uncomment the following lines to get more helpful output
     *
     *      if(!Sys.isDefined(superClass)){
     *          throw("\nError in inheritance: subClass = " + subClass + ", superclass = " + superClass + ", class name = " + className + "\n");
     *      }
    */
    PrototypeClass.prototype = superClass.prototype;

    // Set the subClass prototype to a new instance of PrototypeClass to give this subclass a unique parent instance of the superclass
    subClass.prototype = new PrototypeClass();

    // assign the (new) subclass constructor the prototype constructor so that we don't get that of superclass due to assigning the prototype above
    subClass.prototype.constructor = subClass;

    // if superClass's prototype's constructor is just the Object constructor, set it to be the superclass constructor instead (this is true for Observable for example)
    if (superClass.prototype.constructor === standardObjectConstructor) {
        superClass.prototype.constructor = superClass;
    }

    // add a reference to subclasses superclass, to be able to get the superClass's init-function for example
    subClass.superclass = superClass.prototype;

    // copy all properties from overrides to subClass class
    Sys.override(subClass, overrides);

    /* DEBUG_START*/
    // create container for Sys.Elements properties
    subClass.prototype._elementProps = {
        name: className
    };

    /* DEBUG_END*/

    return subClass;
};

/**
 * Clamps the value so that the value is kept within: min <= value <= max.
 *
 * @example
 *     Sys.clamp({value : -10, min: 0, max: 100}); // =>   0
 *     Sys.clamp({value :  50, min: 0, max: 100}); // =>  50
 *     Sys.clamp({value : 100, min: 0, max: 100}); // => 100
 *
 * @param {Object} cfg The configuration object.
 * @param {number} cfg.value The value.
 * @param {number} cfg.min The minimum acceptable value.
 * @param {number} cfg.max The maximum acceptable value.
 * @returns {number} Number.
 */
Sys.clamp = function(cfg) {
    /* DEBUG_START*/
    if (!Sys.isDefined(cfg) || !Sys.isDefined(cfg.value) || !Sys.isDefined(cfg.min) && !Sys.isDefined(cfg.max)) {
        console.error("Wrong or no parameters specified in Sys.Clamp");
    }

    /* DEBUG_END*/

    if (cfg.value < cfg.min) {
        return cfg.min;
    }
    else if (cfg.value > cfg.max) {
        return cfg.max;
    }

    return cfg.value;
};

/**
 * Constructs a range between the start and stop values, and with the given step.
 * It also works for building decreasing ranges.
 *
 * @example
 *     Sys.range(0, 100, 10); // => [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
 *     Sys.range(100, 0, 10); // => [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]
 *     Sys.range(0, 10);      // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * @param {number} start Start.
 * @param {number} stop Stop.
 * @param {number} [step=1] Step.
 * @returns {Array} Array.
 */
Sys.range = function(start, stop, step) {
    var result = [start],
        reverse = start > stop,
        newStep,
        nextValue;

    newStep = reverse ? -1 * Math.abs(step) || -1 : Math.abs(step) || 1;
    nextValue = start + newStep;

    while (reverse ? nextValue >= stop : nextValue <= stop) {
        result.push(nextValue);
        nextValue = nextValue + newStep;
    }

    return result;
};

/**
 * Reduces a collection down to a single value.
 *
 * @example
 * Calculate the sum of all the values in an array
 *    Sys.reduce([1,2,3], function (a, b) {return a + b;}); // => 6
 *
 * @deprecated 8.0.0. Use native Array.reduce instead.
 * @param {Array} xs Array to reduce.
 * @param {Function} f Iterator.
 * @param {*} [acc=xs[0]] Accumulator.
 * @returns {*} Value.
 */
Sys.reduce = function(xs, f, acc) {
    var i,
        len;

    if (Array.prototype.reduce) {
        return xs.reduce(f, acc);
    }

    if (!Sys.isDefined(acc)) {
        acc = xs[0];
        xs = xs.slice(1);
    }

    for (i = 0, len = xs.length; i < len; i++) {
        acc = f(acc, xs[i], i, xs);
    }
    return acc;
};

/**
 * Produces a new array of values by mapping each value in list (xs) through a transformation function (f).
 *
 * @example
 * Calculate the square root of all the values in an array
 *     Sys.map([1, 4, 9], Math.sqrt); // => [1, 2, 3]
 *
 * @deprecated 8.0.0. Use native Array.map instead.
 * @param {Array} xs Array to map.
 * @param {Function} f Iterator.
 * @returns {Array} Mapped array.
 */
Sys.map = function(xs, f) {
    if (Array.prototype.map) {
        return xs.map(f);
    }

    return xs.reduce(function(acc, x, i) {
        return acc.concat(f(x, i, xs));
    }, []);
};

/**
 * Returns the first element of the array that passes the predicate function.
 *
 * Note: This is needed as Internet Exploder still does not support it...
 *
 * @example
 * Find a positive number in an array
 *     Sys.find([-1, -6, -10, 0, 10, -4, 9], function (a) { return a > 0; }); // => 10
 *
 * @param {Array} array Array.
 * @param {Function} predicate Predicate.
 * @returns {*} Retrieved value.
 */
Sys.find = function(array, predicate) {
    var i,
        len;

    if (Array.prototype.find) {
        return array.find(predicate);
    }

    for (i = 0, len = array.length; i < len; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }

    return undefined;
};

Sys.toInt = function(value) {
    return parseInt(value, 10);
};
