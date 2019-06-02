import {animationBuffer} from "./main"

export class AnimationHolder {
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
    constructor (config) {
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

    }

    /**
     * Parse the config so that it matches the actual object properties.
     *
     * @param config
     * @return {Object} The parsed properties
     */
    parseConfig  (config) {
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
                    animation = new AnimationHolder(child);
                }
                animation.parent = parent;
                tempChildrenContainer.push( animation );
            });

            properties.children = tempChildrenContainer;
        }

        return properties;
    }

    /**
     * Run the holder and it's children
     *
     * @param {Object} timeObj The object containing the time
     */
    run (timeObj) {
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
    }

    /**
     * Runs each animation operation that is set for the holder
     *
     * @private
     * @param {Number} currentStepTime the current time step
     */
    doAnimation (currentStepTime) {
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
    }

    /**
     * Play the animation
     *
     * @param {Array|Boolean} [children] An array with children that we want to play. If none is
     * specified (or true) we play all the children. If you send in an empty array [] we'll only play the current.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    play (children, root) {
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
    }

    runParent (){
        var me = this;

        if ( Sys.isDefined(me.parent) ){
            me.parent.running = true;

            me.parent.runParent();
        }
    }

    /**
     * Pause the animation
     *
     * @param {Array} [children] An array with children that we want to pause. If none is
     * specified we pause all the children. If you send in an empty array [] we'll only pause the current holder.
     */
    pause (children) {
        this.running = false;

        this.handleItems("pause", children);
    }

    /**
     * Stop the animation and reset it to the beginning. Will do it for all the children as well
     *
     * @param {Array} [children] An array with children that we want to stop. If none is
     * specified we stop all the children. If you send in an empty array [] we'll only stop the current.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    stop (children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        me.running = false;

        me.handleItems("stop", children);

        if ( isRoot ){
            me.restore(children, true);
        }
    }

    /**
     * Restores the basic properties of the holder in order to run it again.
     *
     * @param {Array|Boolean} [children] An array with children that we want to restore. If none is
     * specified (or true) we restore all the children. If you send in an empty array [] we'll only restore the current holder.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    restore (children, root) {
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
    }

    /**
     * Restores the basic properties of the holder in order to run it again.
     *
     * @param {Array|Boolean} [children] An array with children that we want to restore. If none is
     * specified (or true) we restore all the children. If you send in an empty array [] we'll only restore the current holder.
     * @param {Boolean} [root] If this is the first object we call this function on (will be false for all it's children)
     */
    restoreOnLoop (children, root) {
        var me = this,
            isRoot = Sys.isDefined(root) ? root : true;

        if ( isRoot || !me.loop ){
            me.running = true;
            //me.localTime = 0;
            me.readyToLoop = false;

            me.restoreAnimation();

            me.handleItems("restoreOnLoop");
        }
    }

    restoreAnimation (){
        this.animation.time = 0;
        this.animation.step = 0;

        this.animation.keyFrames.forEach(function(key){
            if (Sys.isDefined(key.callback)) {
                key.callbackCompleted = false;
            }

            // add more stuff
        });
    }

    /**
     * @private
     * Update the holder with the operation configuration
     *
     * @param {Object} config The configuration
     */
    updateOperation (config) {
        var me = this,
            obj = {};

        //me.applyDefaultValuesToItem(me);

        obj.animate = config;

        obj = me.parseConfig(obj);

        me.animation = obj.animation;
        //me.applyDefaultValuesToOperation(me);

        me.restore();
    }

    /**
     * @private
     * Call the specified function on all the items
     *
     * @param {String} type The function to call on the items
     * @param {Array} [selection] The optional array of items to handle
     */
    handleItems (type, selection){
        var items = (Sys.isDefined(selection) && Sys.isArray(selection)) ? selection : this.children;

        items.forEach(function(child){
            child[type](true, false);
        });
    }

    setParent (parent){
        this.parent = parent;
        parent.children.push(this);

        // if you don't have a target, use the parents
        if ( !Sys.isDefined(this.target) ){
            this.target = parent.target;
        }
    }

    addChild (children){
        var me = this;

        if (Sys.isArray(children) ){
            children.forEach(function(child){
                child.setParent(me);
            });
        }
        else if (Sys.isObj(children)){
            children.setParent(me);
        }
    }

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
    findChild (value, byKey){
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
    }

    /**
     * Performs the specified action on a given object.
     *
     * @param {Number} currentStepTime The time since the last render (ms)
     */
    performAction (currentStepTime) {
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
    }

    progressKeyFrame (toIndex){
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

    }

    doGoTo (keyFrame){
        var me = this;

        me.animation.time = me.animation.keyFrames[keyFrame.goTo].time;
        me.animation.step = keyFrame.goTo;

        /*DEBUG_START*/
        console.warn("Warning: goTo functionality not completed, use at own risk.");
        // TODO: fix goTo, callback resets when going back and callback firing when going forward etc.
        /*DEBUG_END*/
    }

    /**
     * Calculates the time steps and sets the values that should be interpolated.
     *
     * @protected
     * @param {Number} currentTime The current time step
     * @param {Object} currentStep The current frame
     * @param {Object} nextStep The next frame
     */
    calculate (currentTime, currentStep, nextStep) {
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
    }

    /**
     * @private
     * @param {Object} currentKeyFrame The object holding the current key frame information
     */
    handleCallback (currentKeyFrame) {
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
    }

    /**
     * Calculates the time vars.
     *
     * @private
     * @param {Number} currentTime The current time step
     * @param {Object} currentStep The current frame
     * @param {Object} nextStep The next frame
     */
    calculateTime (currentTime, currentStep, nextStep) {
        var timeStep = currentTime - currentStep.time,
            totalTime = nextStep.time - currentStep.time;

        //If timeStep equals 0 and totalTime equals 0. The result will be NaN
        return totalTime !== 0 ? timeStep / totalTime : 1;
    }


    /**
     * Increase the timeBuffer
     *
     * @param {Number} time The time the time buffer should be increased
     */
    increaseAnimationTime  (time) {
        if (!Sys.isDefined(this.animation.time)) {
            this.animation.time = time;
        }
        else {
            this.animation.time += time;
        }

        return this.animation.time;
    }

    animate (config, play) {
        this.updateOperation(config);
        if ( play ){
            this.play();
        }
    }

}