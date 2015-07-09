/**
 * DeskUI core
 *
 * @file DeskUI's core
 * @version 0.1
 * @requires deskui.js
 */

/**
 * @namespace
 */
DeskUI.core = {};

/**
 * Includes a JavaScript file into DeskUI's environment
 *
 * @param {string} script - Path to the JavaScript file
 */
DeskUI.core.include = function(script) {
	$(document).ready(function() {
		$('head').append($('<script type="text/javascript" src="'+script+'"></script>'));
	});
}

/**
 * Imports a CSS file into DeskUI's environment
 *
 * @param {string} style - Path to the CSS file
 */
DeskUI.core.import = function(style) {
	$(document).ready(function() {
		$('head').append($('<link rel="stylesheet" type="text/css" href="'+style+'"/>'));
	});
}

/**
 * Fires all events in the given array and sets the given context
 */
DeskUI.core.fire = function(callbacks, context) {
	for(var i = 0; i < callbacks.length; i++) {
		callbacks[i].call(context);
	}
}