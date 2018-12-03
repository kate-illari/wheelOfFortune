/*global Sys, Animation*/
Sys.ns("Animation");

/**
 * The animation holder is a container class holding properties for a certain holder.
 *
 * This object contains all information needed to perform the animation.
 *
 * The config object sets the initial properties on the holder.
 * So the config object can have all the properties as keys.
 *
 *       var animation = new Animation.Holder({
 *           target : me.logoSprite,                     // a PIXI.Sprite object, but a target can be any object
 *           loop : true,
 *           children : [                                // objects put here will create new Animation.Holder objects and added to the main one
 *               {
 *                   prop : "position",
 *                   animate : {
 *                       0 : {x : 100},                  // this will affect me.logoSprite.position.x
 *                       10000 : {x : 1000},
 *                       20000 : {x : 100}
 *                   }
 *               },
 *               {
 *                   prop : "rotation",
 *                   loop : true,                        // the loop here will be independent of the main loop
 *                   animate : {
 *                       0 : 0,
 *                       500 : Math.PI,
 *                       1000 : Math.PI*2
 *                   },
 *                   onStart : function(){               // this callBack will be called once until we stop and start the whole animation again
 *                       this.tempValue = 0;
 *                   },
 *                   onUpdate : function(){              // this will increase the tempValue every frame
 *                       ++this.tempValue;
 *                   }
 *               },
 *               {
 *                   animate : {
 *                       0 : {alpha : 1 },               // instead of setting prop to "alpha" you can write it like this as well
 *                       5000 : {alpha : 0.3 }
 *                   }
 *               },
 *               {
 *                   prop : "scale",
 *                   animate : [
 *                       {
 *                           time : startTime,           // if you want to set the time with a variable you can do it like this
 *                           value : {x : 1, y : 1}
 *                       },
 *                       {                               // this format is also required if you want to add event, callback or goTo to the keyFram
 *                           time : startTime + 500,
 *                           value : {x : 3, y : 1.5},
 *                           fireEvent : {
 *                               event : "view:scaleHalfway",
 *                               scope : me
 *                           }
 *                       },
 *                       {
 *                           time : startTime + 2000,
 *                           value : {x : 2, y : 1}
 *                       }
 *                   ]
 *               }
 *           ]
 *       });
 *
 *        var test2 = new Animation.Holder({
 *           id : "test animation nr 2",
 *           target : borderSprite,
 *           onStart : function(){
 *               this.target.alpha = 0.3;
 *           },
 *           delay : 500
 *       });
 *
 *       var subTest3 = new Animation.Holder({          // this one is created without a target so it won't do anything
 *           prop : "position",                         // if we try to play it. But as soon as we add it to a parent
 *           animate : {                                // we will try to use the parents target
 *               0 : {x : 67, y : 23},
 *               500 : {x : 123, y : 789}
 *           },
 *           onEnd : function(me){
 *               me.fireEvent("view:testDone");
 *               this.target.visible = false;
 *           }
 *       });
 *
 *       test2.addChild(subTest3);                      // adding a child
 *       // alternative: subTest3.setParent(test2);     // or setting a parent
 *
 *       var animationContainer = new Animation.Holder({
 *          id : "the super animation",
 *       });
 *
 *       animationContainer.addChild([animation, test2]);
 *
 *       Game.stage.view.animationManager.addToAnimationLoop(animationContainer);
 *
 *       animationContainer*.play();
 *
 * @class Animation.Holder
 * @extends Sys.Observable
 */
Animation.Holder =  {
    /**
     * @property {String} [id=""] The identifier for this animation, if you don't specify one we will try to use
     * parent.id + ":" + prop + "Animation"
     */
    /**
     * @property {Object} [target=undefined] The target object we want to animate, if you don't specify one we will
     * try to use the parent.target
     */
    /**
     * @property {String} [prop=undefined] The name of the properties on the target we want to change
     */
    /**
     * @property {Boolean} [running=false] If the animation is active
     */
    /**
     * @property {Number} [playbackSpeed=undefined] If we want to play the animation faster (>1) or slower (<1)
     */
    /**
     * @property {Boolean} [loop=false] Will repeat the whole animation. If it have separate operations with different
     * time the shorter ones will wait at the end key frame until the longest is done. onStart & onEnd will not be
     * called every loop (if that is needed, set callbacks on key frames instead). Will also wait for all it's
     * children to complete.
     */
    /**
     * @property {Boolean} [readyToLoop=false] Since we sometime need to wait for our children we use this to know
     * when we can loop back to the start.
     */
    /**
     * @property {Function} [onStart=undefined] Callback function before the animation starts
     */
    /**
     * @property {Function} [onEnd=undefined] Callback function when the animation is complete
     */
    /**
     * @property {Function} [onUpdate=undefined] Callback function on every frame before the operation run. Will be
     * called regardless if the holder have operation, target etc or not, as long as it is running (and it's parents) the
     * function will be called.
     */
    /**
     * @property {Array} [children=[]] So we can nestle animation
     */
    /**
     * @property {Animation.Holder} [parent=undefined] A reference to the holders parent
     */
    /**
     * @property {Number} [localTime=0] Local time counter
     */
    /**
     * @property {Number} [delay=0] Time before the operations start after the animation starts
     */
    /**
     * @property {Number} [startTimeOffset=0] If we want the animation to start at a specific time (TODO: currently if the offset is beyond the first keyframe it will start at that keyframe instead)
     */
    /**
     * @property {Object} [operations={}] The operations the holder preforms
     */
    /**
     * @property {Object} [operationSteps={}] The current key frame for every operation
     */
    /**
     * @property {Object} [operationEnded={}] If all the operations are done
     */


    /**
     * Constructor
     *
     * @param {Object} config The config object
     */
    constructor : function(config) {
        var me = this,
            defaultProp = {
                id                  : undefined,    // the identifier for this animation
                target              : undefined,    // the target object we want to animate
                prop                : undefined,    // the name of the properties on the target we want to change.
                animation           : {             // object that will hold keyFrames etc.
                    keyFrames : [],
                    step : 0,                       // the current keyFrame we're on
                    complete : false                // if the animation is done
                },
                running             : false,        // if the animation is active.
                playbackSpeed       : undefined,    // if we want to play the animation faster (>1) or slower (<1)
                loop                : false,        // will repeat the whole animation. If it have separate operations
                                                    // with different time the shorter ones will wait at the end key frame
                                                    // until the longest is done. onStart & onEnd will not be called every
                                                    // loop (if that is needed, set callbacks on key frames instead).
                                                    // Will also wait for all it's children to complete.
                readyToLoop         : false,        // since we sometime need to wait for our children we use this to know
                                                    // when we can loop back to the start.
                onStart             : undefined,    // callback before the animation starts
                onEnd               : undefined,    // callback when the animation is complete
                onUpdate            : undefined,    // callback on every frame before the operation run. Will be
                                                    // called regardless if the holder have operation, target etc or not
                children            : [],           // so we can nestle animation
                parent              : undefined,    // a reference to the holders parent
                localTime           : 0,            // local time counter
                delay               : 0,            // time before the operations start after the animation starts
                startTimeOffset     : undefined,    // if we want the animation to start at a specific time
                //operations          : {},           // the operations the holder preforms
                //operationSteps      : {},           // the current key frame for every operation
                //operationsEnded     : false,        // if all the operations are done
                addToAnimationLoop  : false         // adding the holder to the animation loop on creation
            };

        config = Sys.applyProperties(defaultProp, config);

        // Parse the config, this allows us to use several config syntax
        config = me.parseConfig(config);

        me = Sys.applyProperties(me, config);

        //// Set the default parameters needed by the operations
        //me.setOperationDefaultProperties();

        if ( config.addToAnimationLoop ){
            animationBuffer.push(me);
        }

    },

    /**
     * Parse the config so that it matches the actual object properties.
     *
     * @param config
     * @return {Object} The parsed properties
     */
    parseConfig : function (config) {
        var properties = {
                animation : {
                    keyFrames : [],
                    step : 0,
                    complete : false
                }
            },
            //operations = Object.keys(Animation.Operations),
            timeSort = function (a, b) {
                return (a.time - b.time);
            },
            obj;

        // Process all keys on the config object
        Sys.iterate(config, function(key, value){

            // If we have an animation, parse it
            if (key === "animate" ) {

                /*DEBUG_START*/
                if ( key !== "animate" ){
                    // TODO: right now we only support the "animate" operation, when we need more we have to make them.
                    console.warn("You are trying to use a " + key + " operation on a Animation.Holder, for now only 'animate' is supported");
                }
                /*DEBUG_END*/

                // if the operation is an array or object
                if ( Sys.isObj(value) ){

                    Sys.iterate(value, function(time, frameValue){
                        // Define the frame object with the time value
                        obj = { time : parseInt(time, 10) };

                        // If the frame is an object with a defined value then we have non value properties mixed in
                        if (Sys.isObj(frameValue) ) {
                            if ( Sys.isDefined(frameValue.value) ){
                                obj = Sys.applyProperties(obj, frameValue);
                            }
                            else {
                                obj.value = frameValue;
                            }
                        }
                        // Otherwise it is just a plain value
                        else {
                            obj.value = frameValue;
                            /*DEBUG_START*/
                            if ( !Sys.isDefined(config.prop) && config.length > 1 ){
                                console.warn("If we only specify a number value the property 'prop' must exist");
                            }
                            /*DEBUG_END*/
                        }

                        // Push the key frame
                        properties.animation.keyFrames.push(obj);
                    });

                    properties.animation.keyFrames.sort(timeSort);
                }
                else if ( Sys.isArray(value) ){
                    // the operation is already in the right format, add it to the operations object
                    properties.animation.keyFrames = value;
                }
                else {
                    // error
                    console.warn("Operation is in wrong format");
                }
            }
            // Else assign the value
            else {
                properties[key] = value;
            }
        });

        // if target is undefined use the parents target (if it exist)
        if ( !Sys.isDefined(properties.target) && Sys.isDefined(properties.parent) && Sys.isDefined(properties.parent.target) ){
            properties.target = properties.parent.target;
        }

        /*DEBUG_START*/
        if ( Sys.isDefined(properties.target) && !Sys.isObj(properties.target) ){
            console.warn("The target of a Animation.Holder must be a Object");
        }
        /*DEBUG_END*/

        // if the id is undefined use the targets id (if it exist) and the operation type
        if ( !Sys.isDefined(properties.id) && Sys.isDefined(properties.target) && Sys.isDefined(properties.target.id) ){
            var prop = Sys.isDefined(properties.prop) ? properties.prop : "";

            properties.id = properties.target.id + ":" + prop + "Animation";
        }

        // if we already have children in the config, create them and add them
        if ( Sys.isDefined(properties.children) && properties.children.length > 0 ){
            var tempChildrenContainer = [],
                parent = this;

            properties.children.forEach(function(child){
                var animation;

                if ( Sys.isDefined(child.localTime) ){
                    // the child is already a AnimationHolder
                    animation = child;
                }
                else {
                    child.parent = {target : config.target};
                    animation = new Animation.Holder(child);
                }
                animation.parent = parent;
                tempChildrenContainer.push( animation );
            });

            properties.children = tempChildrenContainer;
        }

        return properties;
    },

    /**
     * Run the holder and it's children
     *
     * @param {Object} timeObj The object containing the time
     */
    run : function(timeObj) {
        var me = this,
            timeStep = timeObj.timeStep;

        if (me.localTime === 0 && Sys.isDefined(me.startTimeOffset) ){
            // if this is the first frame of the animation and we have a start offset
            timeStep += me.startTimeOffset;
        }

        if ( Sys.isDefined(me.playbackSpeed) ){
            // adjust the time step based on playback speed
            timeStep *= me.playbackSpeed;
        }

        me.localTime += timeStep; // increase the local timer

        if(me.localTime >= me.delay) {

            // Time step is used to keep track of internal timers on the operation level
            me.doAnimation(timeStep);

            me.children.forEach(function(child){
                if ( child.running ){
                    child.run({timeStep : timeStep, time : timeObj.time});

                    // if the child is still running
                    if ( child.running ){
                        // we should also be running
                        me.running = true;

                        if ( !child.loop && !child.readyToLoop ){
                            // if it's time for us to loop, wait until the children are done
                            // but don't wait on looping children
                            me.readyToLoop = false;
                        }
                    }
                }
            });

            if ( Sys.isDefined(me.onUpdate) ){
                me.onUpdate(timeStep);
            }
        }

        if ( me.loop && me.readyToLoop ){
            // meaning I'm done and all my children are done (ignoring children that are looping)
            me.restoreOnLoop();
        }
        else if ( !me.running ){
            // this animation is done
            if ( Sys.isDefined(me.onEnd) ){
                me.onEnd();
            }

            // restore the animation on completion so we can start it from the beginning on the next play()
            me.restore();
        }
    },

    /**
     * Runs each animation operation that is set for the holder
     *
     * @private
     * @param {Number} currentStepTime the current time step
     */
    doAnimation: function (currentStepTime) {
        var me = this,
            numKeyFrames = me.animation.keyFrames.length;

        // If we don't have any keyFrames or target just return
        if (numKeyFrames < 2 || !Sys.isDefined(me.target) ) {
            me.readyToLoop = true;
            me.running = false;
            return;
        }

        // Check if the animation have finished
        var running = me.performAction(currentStepTime);

        if (!running) {
            // all the operations are done
            me.running = false;
            me.readyToLoop = true;
        }
    },

    /**
     * Play the animation
     *
     * @param {Array|Boolean} [children] An array with children that we want to play. If none is
     * specified (or true) we play all the children. If you send in an empty array [] we'll only play the current.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    play : function(children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        me.running = true;

        me.handleItems("play", children);

        if (me.localTime === 0 && Sys.isDefined(me.onStart)){
            // if we start the game from the beginning do the onStart callback
            me.onStart();
        }

        // make sure the parents are running
        if (isRoot){
            me.runParent();
        }
    },

    runParent : function(){
        var me = this;

        if ( Sys.isDefined(me.parent) ){
            me.parent.running = true;

            me.parent.runParent();
        }
    },

    /**
     * Pause the animation
     *
     * @param {Array} [children] An array with children that we want to pause. If none is
     * specified we pause all the children. If you send in an empty array [] we'll only pause the current holder.
     */
    pause : function(children) {
        this.running = false;

        this.handleItems("pause", children);
    },

    /**
     * Stop the animation and reset it to the beginning. Will do it for all the children as well
     *
     * @param {Array} [children] An array with children that we want to stop. If none is
     * specified we stop all the children. If you send in an empty array [] we'll only stop the current.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    stop : function(children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        me.running = false;

        me.handleItems("stop", children);

        if ( isRoot ){
            me.restore(children, true);
        }
    },

    /**
     * Restores the basic properties of the holder in order to run it again.
     *
     * @param {Array|Boolean} [children] An array with children that we want to restore. If none is
     * specified (or true) we restore all the children. If you send in an empty array [] we'll only restore the current holder.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    restore : function(children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        me.localTime = 0;
        me.readyToLoop = false;

        me.restoreAnimation();

        me.handleItems("restore", children);

        // if we are already running and are the root object we play()
        if ( me.running && isRoot ){
            me.play(children, true);
        }
    },

    /**
     * Restores the basic properties of the holder in order to run it again.
     *
     * @param {Array|Boolean} [children] An array with children that we want to restore. If none is
     * specified (or true) we restore all the children. If you send in an empty array [] we'll only restore the current holder.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    restoreOnLoop : function(children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        if ( isRoot || !me.loop ){
            me.running = true;
            //me.localTime = 0;
            me.readyToLoop = false;

            me.restoreAnimation();

            me.handleItems("restoreOnLoop");
        }
    },

    restoreAnimation : function(){
        this.animation.time = 0;
        this.animation.step = 0;

        this.animation.keyFrames.forEach(function(key){
            if (Sys.isDefined(key.callback)) {
                key.callbackCompleted = false;
            }

            // add more stuff
        });
    },

    /**
     * @private
     * Update the holder with the operation configuration
     *
     * @param {Object} config The configuration
     */
    updateOperation : function(config) {
        var me = this,
            obj = {};

        //me.applyDefaultValuesToItem(me);

        obj.animate = config;

        obj = me.parseConfig(obj);

        me.animation = obj.animation;
        //me.applyDefaultValuesToOperation(me);

        me.restore();
    },

    ///**
    // * Will remove the specified operations from the holder.
    // *
    // * @param {String|Array} operation The operation to remove from the item (or an array with operations)
    // */
    //removeOperation: function (operation) {
    //    var me = this;
    //
    //    if (Sys.isArray(operation)) {
    //        operation.forEach(function(op) {
    //            if (Sys.isDefined(me.operations[op])) {
    //                delete me.operations[op];
    //                delete me.operationSteps[op];
    //            }
    //        });
    //    }
    //    else if (Sys.isDefined(me.operations[operation])) {
    //        delete me.operations[operation];
    //        delete me.operationSteps[operation];
    //    }
    //},

    ///**
    // * @private
    // * Set the default operation properties on the prop object
    // */
    //setOperationDefaultProperties : function() {
    //    Sys.iterate(this.operations, function(key){
    //        Animation.Operations[key].applyDefaultValuesToItem(this);
    //        Animation.Operations[key].applyDefaultValuesToOperation(this);
    //    });
    //},

    /**
     * @private
     * Call the specified function on all the items
     *
     * @param {String} type The function to call on the items
     * @param {Array} [selection] The optional array of items to handle
     */
    handleItems : function(type, selection){
        var items = (Sys.isDefined(selection) && Sys.isArray(selection)) ? selection : this.children;

        items.forEach(function(child){
            child[type](true, false);
        });
    },

    setParent : function(parent){
        this.parent = parent;
        parent.children.push(this);

        // if you don't have a target, use the parents
        if ( !Sys.isDefined(this.target) ){
            this.target = parent.target;
        }
    },

    addChild : function(children){
        var me = this;

        if (Sys.isArray(children) ){
            children.forEach(function(child){
                child.setParent(me);
            });
        }
        else if (Sys.isObj(children)){
            children.setParent(me);
        }
    },

    /**
     * Will search children (and grandchildren) for a Holder that mach the key and value provide.
     *
     * NOTE: if there is more than one match you will get the first one.
     *
     * @param {String} value The value that should match
     * @param {String} [byKey] Which property key we should check against, default "id"
     *
     * @return {object|boolean} the items that match our search criteria, or false if it didn't find anything
     */
    findChild : function(value, byKey){
        var key = Sys.isDefined(byKey) ? byKey : "id",
            item = false,
            searchChildren = function(items) {
                var result = false,
                    subResult = false;

                items.forEach(function(item){
                    if ( Sys.isDefined(item[key]) && item[key] === value ){
                        result = item;
                    }

                    if ( Sys.isDefined(item.children) ){
                        subResult = searchChildren(item.children);

                        if ( Sys.isObj(subResult) ){
                            result = subResult;
                        }
                    }
                });

                return result;
            };

        // start with the main Holder
        if ( this[key] === value ){
            return this;
        }

        if ( Sys.isDefined(this.children) ){
            item = searchChildren(this.children );
        }

        return item;
    },

    /**
     * Performs the specified action on a given object.
     *
     * @param {Number} currentStepTime The time since the last render (ms)
     */
    performAction : function(currentStepTime) {
        var me = this,
            animation = me.animation,
            keyFrames = animation.keyFrames,
            numKeyFrames = keyFrames.length,
            currentTime = me.increaseAnimationTime(currentStepTime),
            currentKeyFrame = keyFrames[animation.step],
            nextKeyFrame = keyFrames[animation.step + 1],
            running = true;

        /*DEBUG_START*/
        if ( numKeyFrames < 2 ){
            console.warn("The Holder " + item + " have an animation with less than two keyFrames, the operation needs a minimum of two keyFrames to be able to animate.");
            return 0;
        }
        /*DEBUG_END*/

        me.handleCallback(currentKeyFrame); // added an extra callback check here to make sure callbacks on keyFrame 0 are fired

        // step through keyFrames, from oldKeyFrameIndex, until we are on the current one
        // loop if necessary
        // fire events and callbacks on every new keyFrame we pass
        // goTo keyFrames

        // check if we have passed the next keyFrame
        if ( nextKeyFrame.time <= currentTime){
            me.progressKeyFrame();

            currentKeyFrame = keyFrames[animation.step];

            // are we at the last keyFrame, ie we're not looping and the animation is complete
            if ( animation.step === numKeyFrames - 1 ){
                nextKeyFrame = currentKeyFrame;
                running = false;
            }
            else {
                nextKeyFrame = keyFrames[animation.step + 1];
            }
        }

        // when we have the current keyFrame, interpolate between that and the next keyFrame
        me.calculate(animation.time, currentKeyFrame, nextKeyFrame);

        return running;


        //// If we have more than one key frame (i.e. we can interpolate between two values)
        //if(numKeyFrames > nextKeyFrameIndex) {
        //    nextKeyFrame = currentOperation[nextKeyFrameIndex];
        //
        //    // If we have reached the next key frame
        //    if(currentTime >= nextKeyFrame.time) {
        //
        //        // Make sure that the callback and events are performed/fired on the current key-frame before we move to the next one
        //        me.handleCallback(currentKeyFrame);
        //        me.handleEvents(currentKeyFrame);
        //        me.restoreCallbackOnIterations(currentKeyFrame);
        //
        //        // Determine the new current key frame
        //        currentKeyFrameIndex = me.getNewKeyFrameIndex(item, nextKeyFrame);
        //
        //        // Set current key frame
        //        currentKeyFrame = currentOperation[currentKeyFrameIndex];
        //
        //        // Set next keyframe
        //        nextKeyFrameIndex = currentKeyFrameIndex + 1;
        //
        //        // If we have key frame remaining
        //        if(numKeyFrames > nextKeyFrameIndex) {
        //            nextKeyFrame = currentOperation[nextKeyFrameIndex];
        //        }
        //        // else make sure we reach the end frame
        //        else {
        //
        //            var loopTimeOverFlow = currentTime - nextKeyFrame.time;
        //            if ( item.loop && loopTimeOverFlow > 0 ){
        //                item.operationSteps.animate = 0;
        //                currentOperation.timeBuffer = loopTimeOverFlow;
        //                currentKeyFrame = currentOperation[0];
        //                nextKeyFrame = currentOperation[1];
        //            }
        //            else {
        //                nextKeyFrame = currentKeyFrame;
        //
        //                // if we pass the last keyFrame the operation is no longer running
        //                running = 0;
        //            }
        //        }
        //    }
        //
        //    // If we have an callback to run on this step and have not already run it
        //    me.handleCallback(currentKeyFrame);
        //
        //    // If we have an event to fire on this step and have not already fired it
        //    me.handleEvents(currentKeyFrame);
        //
        //    // Perform the action given for each frame
        //    me.calculate(item, currentOperation.timeBuffer, currentKeyFrame, nextKeyFrame);
        //
        //    // this value indicate that the operation is still running
        //    return running;
        //}
        //else {
        //    // return zero to indicate that this operation has ended
        //    return 0;
        //}
    },

    progressKeyFrame : function(toIndex){
        var me = this,
            animation = me.animation,
            keyFrames = animation.keyFrames,
            currentKeyFrame;

        // step to next keyFrame
        animation.step = Sys.isDefined(toIndex) ? toIndex : animation.step + 1;

        // do events and callbacks
        currentKeyFrame = keyFrames[animation.step];
        me.handleCallback(currentKeyFrame);

        // check for goTo
        if ( Sys.isDefined(currentKeyFrame.goTo) ) {
            me.doGoTo(currentKeyFrame);
        }

        // if we haven't reached the last keyFrame
        if ( animation.step !== keyFrames.length - 1 ){
            // check if we should move one more
            if ( animation.time >= keyFrames[animation.step + 1].time){
                me.progressKeyFrame();
            }
        }
        else if ( me.loop  ){ // at the last keyFrame and we're looping
            animation.time -= keyFrames[animation.step].time;
            me.progressKeyFrame(0);
        }

    },

    doGoTo : function(keyFrame){
        var me = this;

        me.animation.time = me.animation.keyFrames[keyFrame.goTo].time;
        me.animation.step = keyFrame.goTo;

        /*DEBUG_START*/
        console.warn("Warning: goTo functionality not completed, use at own risk.");
        // TODO: fix goTo, callback resets when going back and callback firing when going forward etc.
        /*DEBUG_END*/
    },

    /**
     * Calculates the time steps and sets the values that should be interpolated.
     *
     * @protected
     * @param {Number} currentTime The current time step
     * @param {Object} currentStep The current frame
     * @param {Object} nextStep The next frame
     */
    calculate : function(currentTime, currentStep, nextStep) {
        var me = this,
            time = me.calculateTime(currentTime, currentStep, nextStep),
            from = currentStep.value,
            to = nextStep.value,
            target;

        if ( Sys.isObj(from) ){
            Sys.iterate(from, function(key, value){
                target = Sys.isDefined(me.prop) ? me.target[me.prop] : me.target;

                target[key] = Animation.utils.getInterpolationValue(value, to[key], time, currentStep.ease, key);
            });
        }
        else { // we only animate one number
            me.target[me.prop] = Animation.utils.getInterpolationValue(from, to, time, currentStep.ease);
        }
    },

    ///**
    // * Update the operation default values.
    // *
    // * @param {Animation.Holder} item The animation item to affect
    // */
    //applyDefaultValuesToOperation : function(item) {
    //    // Intentionally left blank
    //},
    //
    ///**
    // * Applies the default values of the operation to the item.
    // *
    // * @param {Animation.Holder} item The animation item
    // */
    //applyDefaultValuesToItem : function() {
    //    // Intentionally left blank
    //},

    /**
     * @private
     * @param {Object} currentKeyFrame The object holding the current key frame information
     */
    handleCallback : function(currentKeyFrame) {
        var callback = currentKeyFrame.callback,
            container;

        if(Sys.isDefined(callback) && !currentKeyFrame.callbackCompleted) {

            if ( callback.fireImmediately ){
                if ( Sys.isString(callback.func) ){
                    // an event
                    callback.scope.fireEvent(callback.func, callback.args);
                }
                else if ( Sys.isFunc(callback.func) ){
                    // a function
                    callback.func.apply(callback.scope, callback.args);
                }
            }
            else {
                container = Game.stage.view.animationManager.callbackContainer;
                container.push(callback);
            }

            currentKeyFrame.callbackCompleted = true;
        }
    },

    /**
     * Instead of fire the event right away we store them in an array and
     * fire them after the render pass is done.
     *
     * @private
     * @param {Object} currentKeyFrame The object holding the current key frame information
     */
    //handleEvents : function(currentKeyFrame) {
    //    var eventObject = currentKeyFrame.fireEvent,
    //        container = Game.stage.view.animationManager.callbackContainer;
    //
    //    // If there is an event to fire and it has not already been fired
    //    if(Sys.isDefined(eventObject) && !currentKeyFrame.eventFired) {
    //        renderLoopEndEvents.push(eventObject);
    //        currentKeyFrame.eventFired = true;
    //    }
    //},

    /**
     * Restore the event event if it should be fired more than once in a goTo loop.
     *
     * @private
     * @param {Object} currentStep The current animation step
     */
    //restoreEventOnIterations : function(currentStep) {
    //    var event = currentStep.fireEvent;
    //
    //    // If we have iterations
    //    if(Sys.isDefined(event) && Sys.isDefined(event.iterations)) {
    //        // If this is the first time we enter the method
    //        if(!Sys.isDefined(event.remainingIterations)) {
    //            event.remainingIterations = event.iterations;
    //        }
    //
    //        event.remainingIterations--;
    //
    //        if(event.remainingIterations > 0) {
    //            currentStep.eventFired = false;
    //            currentStep.callbackCompleted = false;
    //        }
    //    }
    //},

    /**
     * Restore the callback if it should be called more than once in a goTo loop.
     *
     * @private
     * @param {Object} currentStep The current animation step
     */
    //restoreCallbackOnIterations : function(currentStep) {
    //    var callback = currentStep.callback;
    //
    //    // If we have iterations
    //    if(Sys.isDefined(callback) && callback.looping === true) {
    //        currentStep.callbackCompleted = false;
    //    }
    //},

    /**
     * Returns the current operation step if one is defined or creating one with
     * the default value zero if one is not.
     *
     * @private
     * @param {Animation.Holder} item The animation item
     * @param {String} operation The operation, which step index we want
     * @return {Number} The step index number
     */
    //getCurrentOperationStep : function(item, operation) {
    //    var steps = item.operationSteps;
    //
    //    // If it is not defined, create it and return 0
    //    if(!steps[operation]) {
    //        steps[operation] = 0;
    //    }
    //    return steps[operation];
    //},
    //
    //getCurrentStep : function(item){
    //    if ( !Sys.isDefined(item.operationSteps.animate) ){
    //        item.operationSteps.animate = 0;
    //    }
    //
    //    return item.operationSteps.animate;
    //},
    //
    //getCurrentKeyFrameIndex : function(item, currentOperation, currentTime){
    //
    //},

    /**
     * Calculates the time vars.
     *
     * @private
     * @param {Number} currentTime The current time step
     * @param {Object} currentStep The current frame
     * @param {Object} nextStep The next frame
     */
    calculateTime : function(currentTime, currentStep, nextStep) {
        var timeStep = currentTime - currentStep.time,
            totalTime = nextStep.time - currentStep.time;

        //If timeStep equals 0 and totalTime equals 0. The result will be NaN
        return totalTime !== 0 ? timeStep / totalTime : 1;
    },

    /**
     * Get the index of the next key frame to use.
     *
     * @private
     * @param {Animation.Holder} item The animation item
     * @param {Object} nextKeyFrame The next key frame in the array
     * @return {Number} The index of the new key frame
     */
    //getNewKeyFrameIndex : function(item, nextKeyFrame) {
    //    var me = this,
    //        goTo = nextKeyFrame.goTo,
    //        iterations = Sys.isDefined(goTo) ? me.getIterations(nextKeyFrame) : false,
    //        operation = item.operations[me.operation],
    //
    //        currentKeyFrameIndex = item.operationSteps[me.operation],
    //        newKeyFrameIndex;
    //
    //    // If we are using goTo and have iterations remaining
    //    if(Sys.isDefined(goTo) && (iterations > 1)) {
    //        me.setTimeBuffer(item, operation[goTo].time);
    //        me.restoreEventOnIterations(operation[goTo]);
    //
    //        newKeyFrameIndex = goTo;
    //
    //        // since we never really stop on the keyFrame with the goTo, we'll miss any events on it. so lets do a check here
    //        me.handleEvents(nextKeyFrame);
    //    }
    //    else {
    //        newKeyFrameIndex = currentKeyFrameIndex + 1;
    //    }
    //
    //    item.operationSteps[me.operation] = newKeyFrameIndex;
    //
    //    return newKeyFrameIndex;
    //},

    /**
     * Get the number of remaining iterations if they are defined, returns 2 as a default value.
     *
     * @private
     * @param {Object} nextKeyFrame The next key frame
     * @return {Number} The number of remaining iterations if they are defined, returns 2 as a default value
     */
    //getIterations : function(nextKeyFrame) {
    //    if(Sys.isDefined(nextKeyFrame.iterations)) {
    //        // If this is the first time we enter the method
    //        if(!Sys.isDefined(nextKeyFrame.remainingIterations)) {
    //            nextKeyFrame.remainingIterations = nextKeyFrame.iterations;
    //        }
    //
    //        return --nextKeyFrame.remainingIterations;
    //    }
    //
    //    return 2;
    //},

    /**
     * Increase the timeBuffer
     *
     * @param {Number} time The time the time buffer should be increased
     */
    increaseAnimationTime : function (time) {
        if (!Sys.isDefined(this.animation.time)) {
            this.animation.time = time;
        }
        else {
            this.animation.time += time;
        }

        return this.animation.time;
    },

    animate : function(config, play) {
        this.updateOperation(config);
        if ( play ){
            this.play();
        }
    }

};

Animation.Holder = Sys.extend(Sys.Observable, Animation.Holder, "Animation.Holder");