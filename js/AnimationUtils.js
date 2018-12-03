/*global Sys, Animation */
Sys.ns("Animation");

/**
 * The static object containing all the utility functions for the Canvas Animation Framework.
 *
 * @class Animation.utils
 */
Animation.utils = {

    /**
     * Get a random value in the given span.
     *
     * @param {Number} min The minimum value
     * @param {Number} max The maximum value
     * @return {Number} The random value
     */
    randomBetween: function (min, max) {
        return min + (max - min) * Math.random();
    },

    /**
     * Converts a number to a max of decimal points.
     *
     * @param {Number} num The number to be converted
     * @param {Number} [numOfDecimals = 1] the number of decimal points the degree should be calculated to
     * @return {Number} The converted number
     */
    toNthDecimalPlace: function (num, numOfDecimals) {
        var decimalPoints = Sys.isDefined(numOfDecimals) ? numOfDecimals : 1,
            pow = Math.pow(10, decimalPoints);

        return Math.round(num * pow) / pow;
    },

    /**
     * Fourth Order Runge-Kutta Algorithm for solving equations of motion
     *
     * @param {Number} x Initial position
     * @param {Number} v Initial velocity
     * @param {Function} a Acceleration function
     * @param {Number} dt Time step
     * @returns {Array} The final (position, velocity) array after time dt has passed.
     */
    rk4 : function (x, v, a, dt) {
        var x1 = x,
            v1 = v,
            a1 = a(x1, v1, 0),

            x2 = x + 0.5 * v1 * dt,
            v2 = v + 0.5 * a1 * dt,
            a2 = a(x2, v2, dt / 2),

            x3 = x + 0.5 * v2 * dt,
            v3 = v + 0.5 * a2 * dt,
            a3 = a(x3, v3, dt / 2),

            x4 = x + v3 * dt,
            v4 = v + a3 * dt,
            a4 = a(x4, v4, dt),

            xf = x + (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4),
            vf = v + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);

        return [xf, vf];
    },

    /**
     * Will jump an list/item forward to a specified time
     *
     * @param {object} obj The list or item to fast forward
     * @param {number} time To what time
     * @param {boolean} [onlyIfSmaller] Meaning we will only jump forward, have we passed the time we'll don't change it
     * @param {boolean} [eventSkipping] if true we will not fire any events that we pass
     *
     * TODO: this function needs to be updated (if we want to use it)
     */
    goToTime : function(obj, time, onlyIfSmaller, eventSkipping){
        var me = this,
            smaller = Sys.isDefined(onlyIfSmaller) ? onlyIfSmaller : true,
            skipEvents = Sys.isDefined(eventSkipping) ? eventSkipping : false,
            prop, lastKeyFrame, timeStep, totalTime, step, frameIndex,
            setTimeBuffer = function(){
                prop = obj.prop;

                Sys.iterate(prop.operations, function(key, operation) {
                    if ( !smaller || (smaller && operation.timeBuffer < time)){
                        Animation.utils.setTimeBuffer(obj, key, time);
                    }

                    if ( skipEvents ){
                        // go through all keyFrames <= time and set fired = true
                        Sys.each(operation, function(keyFrame){
                            if ( Sys.isDefined(keyFrame.fireEvent) && keyFrame.time <= time){
                                keyFrame.fireEvent.fired = true;
                            }

                            if ( Sys.isDefined(keyFrame.events) ){
                                // if we find events on a keyFrame, check what frame and set all <= to fired
                                timeStep = time - lastKeyFrame.time;
                                totalTime = keyFrame.time - lastKeyFrame.time;
                                step = totalTime !== 0 ? timeStep / totalTime : 1;
                                frameIndex = Math.round(Animation.utils.getInterpolationValue(lastKeyFrame.value, keyFrame.value, step));

                                Sys.each(keyFrame.events, function(event){
                                    if ( event.onFrame <= frameIndex ){
                                        event.fired = true;
                                    }
                                });
                            }

                            lastKeyFrame = keyFrame;
                        });
                    }
                });
            };

        // do the obj's operations
        setTimeBuffer();

        // loop obj's items, if any
        if ( Sys.isDefined(obj.items) ){
            Sys.each(obj.items, function(item){
                me.goToTime(item, time, smaller, skipEvents);
            });
        }
    },

    /**
     * Fire events on the specified frame
     *
     * @param {Number} frameIndex The current frame index
     * @param {Object} step The next keyFrame object (will hold the events array)
     *
     * TODO: this function needs to be updated (if we want to use it)
     */
    fireEventOnFrame : function(frameIndex, step) {
        var renderLoopEndEvents = Game.stage.view.animationManager.renderLoopEndEvents;

        // Process all events
        Sys.each(step.events, function(eventObject) {
            // If we are on or has passed the correct frame and the event has not been fired
            if(frameIndex >= eventObject.onFrame && !eventObject.fired) {
                // add it to the event list
                renderLoopEndEvents.push(eventObject);
                eventObject.fired = true;
            }
        });
    },

    /**
     * Will add the specified event to the last keyFrame of an item
     *
     * @param {Object} item A canvas animation item
     * @param {Object} event The event to add
     *
     * TODO: this function needs to be updated (if we want to use it)
     */
    addEndEvent : function(item, event){
        var prop = item.prop,
            operations = prop.operations,
            maxTime = 0,
            finalKeyFrame,
            keyFrame;

        // find longest running operation
        Sys.iterate(operations, function(key, value){
            keyFrame = value[value.length - 1];

            if ( maxTime < keyFrame.time ){
                // found new maxTime
                maxTime = keyFrame.time;
                finalKeyFrame = keyFrame;
            }
        });

        if (Sys.isDefined(finalKeyFrame)) {
            // add event to last keyFrame
            if (!Sys.isDefined(finalKeyFrame.fireEvent)) {
                finalKeyFrame.fireEvent = event;
            }
            /*DEBUG_START*/
            else {
                // if an event already exist, don't override it and throw a warning
                console.warn("Event already exist on keyFrame");
            }
            /*DEBUG_END*/
        }

    },

    /**
     * Interpolates the value based on the interval, support point and time.
     *
     * @param {Number} from The start value
     * @param {Number} to The end value
     * @param {Number} time The time value determining where between the start and end values we are
     * @param {Function} [ease] easing function
     * @param {String} [prop] the property currently being interpolated
     *
     * @return {Number} The interpolated value
     */
    getInterpolationValue : function (from, to, time, ease, prop) {

        if (time > 1) {
            time = 1;
        } else if (time < 0) {
            time = 0;
        }

        if ( Sys.isDefined(ease) ){
            if ( Sys.isFunc(ease) ){
                return ease(from, to, time);
            }
            else {
                var cfg = Sys.isDefined(ease.cfg) ? ease.cfg : undefined;
                return ease.func(from, to, time, prop, cfg);
            }
        }

        return from + time * (to - from);
    },


    /**
     * Easing functions
     */

    noInterpolation : function( from, to, time ){
        return time === 1 ? to : from;
    },

    powerOneIn : function( from, to, time ){
        return ((1 - time) * (1 - time)) * from + 2 * time * (1 - time) * from + (time * time) * to;
    },

    powerOneOut : function( from, to, time ){
        return ((1 - time) * (1 - time)) * from + 2 * time * (1 - time) * to + (time * time) * to;
    },

    powerTwoIn : function( from, to, time ){
        return Math.pow(1 - time, 3) * from + 3 * time * Math.pow(1 - time, 2) * from + 3 * Math.pow(time, 2) * (1 - time) * from + Math.pow(time, 3) * to;
    },

    powerTwoOut : function( from, to, time ){
        return Math.pow(1 - time, 3) * from + 3 * time * Math.pow(1 - time, 2) * to + 3 * Math.pow(time, 2) * (1 - time) * to + Math.pow(time, 3) * to;
    },

    powerNIn : function( from, to, time, prop, cfg ){
        // Bezier with n number of control points
        var tmp = Sys.utils.initArray(cfg + 1, from),
            i, n, k;

        tmp.push(to);

        n = tmp.length;

        for (k = 1; k < n; k++) {
            for (i = 0; i < (n - k); i++) {
                tmp[i] = (1 - time) * tmp[i] + time * tmp[i + 1];
            }
        }

        return tmp[0];
    },

    powerNOut : function( from, to, time, prop, cfg ){
        // Bezier with n number of control points
        var tmp = Sys.utils.initArray(cfg + 1, to),
            i, n, k;

        tmp.unshift(from);

        n = tmp.length;

        for (k = 1; k < n; k++) {
            for (i = 0; i < (n - k); i++) {
                tmp[i] = (1 - time) * tmp[i] + time * tmp[i + 1];
            }
        }

        return tmp[0];
    },

    powerOneSupportPoint : function(from, to, time, prop, cfg){
        var point = cfg;

        if ( Sys.isDefined(prop) && Sys.isObj(cfg) ){
            point = cfg[prop];
        }

        return ((1 - time) * (1 - time)) * from + 2 * time * (1 - time) * point + (time * time) * to;
    },

    backOut : function(from, to, time, prop, cfg){
        var overshoot = Sys.isDefined(cfg) ? cfg : 1,
            ratio = (time -= 1) * time * ((overshoot + 1) * time + overshoot) + 1;

        return ((to - from) * ratio) + from;
    }
};