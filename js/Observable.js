/* global Sys, EventHandler */
Sys.ns("Sys");

/**
 * The Observable class adds functionality for listening to and firing events.
 *
 * @class Sys.Observable
 * @param {Object} config Config object.
 */
Sys.Observable = function(config) {
    /**
     * @cfg [eventHandler=EventHandler]
     */
    this.eventHandler = Sys.isDefined(config) && Sys.isDefined(config.eventHandler) ? config.eventHandler : EventHandler;
    this.handlers = {};
};

Sys.Observable.prototype = {

    /**
     * Fire the event with the optional arguments.
     *
     * @protected
     * @returns {void}
     */
    fireEvent: function() {
        if (arguments.length === 0) {
            return;
        }

        this.eventHandler.dispatchEvent.apply(this.eventHandler, arguments);
    },

    /**
     * Add listeners for multiple events at the same time.
     *
     * @example
     * this.on({
     *     eventA: this.eventHandlerA,
     *     eventB: this.eventHandlerB
     * });
     *
     * @protected
     * @param {Object} config The configuration containing event names as keys and execute functions as values.
     * @returns {void}
     */
    on: function(config) {
        var me = this,
            events = Object.keys(config),
            numEvents = events.length,
            event,
            i = 0;

        while (i < numEvents) {
            event = events[i];
            me.addListener(event, config[event]);
            ++i;
        }
    },

    /**
     * Removes all listeners.
     *
     * @returns {void}
     */
    off: function() {
        var me = this,
            events = Object.keys(me.handlers),
            numEvents = events.length,
            event,
            i = 0;

        while (i < numEvents) {
            event = events[i];
            me.removeListener(event);
            ++i;
        }
    },

    /**
     * Start listening to the provided event.
     *
     * @protected
     * @param {string} event The event to listen to.
     * @param {Function} func The function executed when the event is dispatched.
     * @returns {void}
     */
    addListener: function(event, func) {
        this.handlers[event] = func;
        this.eventHandler.addListener(this, event);
    },

    /**
     * Remove the listener for the provided event.
     *
     * @protected
     * @param {string} event The event to stop listening to.
     * @returns {void}
     */
    removeListener: function(event) {
        this.eventHandler.removeListener(this, event);
        this.handlers[event] = undefined;
    },

    /**
     * Returns whether or not the event is being listened to or not.
     *
     * @protected
     * @param {string} event The event.
     * @returns {boolean} If event is listened to.
     */
    hasListener: function(event) {
        return Sys.isDefined(this.handlers[event]);
    }
};
