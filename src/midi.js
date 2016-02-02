/**
 * #Midi#
 */

/**
 * global vars for midi
 * @type {Object}
 * @private
 */
var _midi_access = null,
    _midi_inputs = null,
    _midi_outputs = null,
    _midi_callbacks = {noteon:function(){},noteoff:function(){},control:function(){}};

/**
 * Is midi supported?
 * @public
 * @returns {boolean}
 */
cracked.midi_supported = function(){
    return typeof navigator.requestMIDIAccess === "function";
};

/**
 * Initialize midi. Callback is invoked when ready.
 * @param {Function} callback
 * @public
 */
cracked.midi_init = function(callback) {
    if(_midi_access) {
        //midi already initialized
        callback.apply(cracked,[true]);
    } else if(__.midi_supported()) {
        navigator.requestMIDIAccess().then( function(access) {
            _midi_access = access;
            _midi_inputs = access.inputs; // inputs = MIDIInputMaps, you can retrieve the inputs with iterators
            _midi_outputs = access.outputs; // outputs = MIDIOutputMaps, you can retrieve the outputs with iterators
            callback.apply(cracked,[true]);
        }, function( err ) {
            console.error( "midi_init: Initialization failed. Error code: " + err.code );
            callback.apply(cracked,[false]);
        } );
    } else {
        console.error("midi_init: Failed. Midi not supported by your browser");
        callback.apply(cracked,[false]);
    }
};

/**
 * Midi input. Bind handler for the onMIDIMessage event.
 * @param {Function} callback
 * @public
 */
cracked.midi_receive = function(callback){
    if(_midi_access) {
        var fun = __.isFun(callback) ? callback : function(){};
        var inputs = _midi_inputs.values();
        // loop over all available inputs and listen for any MIDI input
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            // each time there is a midi message call the onMIDIMessage function
            input.value.onmidimessage = function(ev){
                fun(ev);
                if(ev.data && ev.data[0]===144) {
                    _midi_callbacks.noteon(ev.data);
                } else if(ev.data && ev.data[0]===128) {
                    _midi_callbacks.noteoff(ev.data);
                } else if(ev.data && ev.data[0]===176) {
                    _midi_callbacks.control(ev.data);
                }
            }
        }
    } else {
        console.error("midi_receive: midi not available");
    }
};

/**
 * Midi input. Shorthand binding for note ons
 * @param {Function} callback
 * @public
 */
cracked.midi_noteon = function(callback) {
    _midi_callbacks.noteon = callback;
    cracked.midi_receive();
};

/**
 * Midi input. Shorthand binding for note offs
 * @param {Function} callback
 * @public
 */
cracked.midi_noteoff = function(callback) {
    _midi_callbacks.noteoff = callback;
    cracked.midi_receive();
};

/**
 * Midi input. Shorthand binding for midi control messages
 * @param {Function} callback
 * @public
 */
cracked.midi_control = function(callback) {
    _midi_callbacks.control = callback;
};

