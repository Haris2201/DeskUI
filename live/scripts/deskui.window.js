/**
 * DeskUI window
 *
 * @file DeskUI's window & taskbar management
 * @version 0.1
 * @requires deskui.js, deskui.menu.js
 */

/**
 * @namespace
 */
DeskUI.window = {};

/**
 * All windows are linked here
 *
 * @type {array}
 */
DeskUI.window.windows = [];

/**
 * The latest given id to a window (minus one)
 *
 * @type {number}
 */
DeskUI.window.latestID = 0;

/**
 * The highest z-index (minus one)
 *
 * @type {number}
 */
DeskUI.window.topZ = 1;

/**
 * true when a windows is currently being dragged
 *
 * @type {boolean}
 */
DeskUI.window.dragging = false;

/**
 * The active (dragging) window
 *
 * @type {DeskUI.window.Window}
 */
DeskUI.window.active = null;

/**
 * This function registers the necessary events for the window drag-and-drop system
 */
DeskUI.window.init = function(){
	$(document).ready(function() {
		$(window).mousemove(function(event){DeskUI.window.move(event)});
		$(window).mouseup(function(){DeskUI.window.drop()});
	});
}

/**
 * A function which is called when a window's started to be dragged
 */
DeskUI.window.drag = function(window) {
	window.element.addClass('moving');
	DeskUI.window.active = window;
	DeskUI.window.dragging = true;
}

/**
 * A function which is called every time a mouse button is being released
 */
DeskUI.window.drop = function() {
	DeskUI.window.dragging = false;
	if(DeskUI.window.active != null) DeskUI.window.active.element.removeClass('moving');
	DeskUI.window.active = null;
}

/**
 * A function which is called every time the mouse is being moved
 */
DeskUI.window.move = function(event) {
	if(DeskUI.window.dragging == false) return false;

	var w = DeskUI.window.active;
	var element = w.element;
	var x = element.offset().left + event.pageX - w.drag_x;
	var y = element.offset().top + event.pageY - w.drag_y;
	x = (x < 0) ? 0 : x;
	y = (y < 0) ? 0 : y;
	w.drag_x = event.pageX < 0 ? 0 : event.pageX;
	w.drag_y = event.pageY < 0 ? 0 : event.pageY;

	w.move(x, y);
}

/**
 * This function generates a ContextMenu object for the given Mindow object
 *
 * @param {DeskUI.window.Mindow} mindow - the mindow to which the function generates a context menu
 * @returns {DeskUI.menu.ContextMenu} The generated ContextMenu object
 * @todo Write this function
 */
DeskUI.window.genMindowContextMenu = function(mindow) {
	return new DeskUI.menu.ContextMenu()
		.addItem(mindow.window.maximized ? 'Unmaximize' : 'Maximize', function() {this.name = (mindow.window.maximized) ? function(){mindow.window.unmaximize(); return 'Maximize'} : function(){mindow.window.maximize(); return 'Unmaximize'}})
		.addItem(mindow.window.minimized ? 'Unminimize' : 'Minimize', function() {this.name = (mindow.window.minimized) ? function(){mindow.window.unminimize(); return 'Minimize'} : function(){mindow.window.minimize(); return 'Unminimize'}})
		.addItem('Reset', function() {mindow.window.reset()})
		.addSeparator()
		.addItem('Close', function() {mindow.window.close()})
		.assign(mindow.element);
}

/**
 * @class Class for a window's mindow (the control element on the taskbar)
 *
 * @param {DeskUI.window.Window} w - the window object for this mindow
 */
DeskUI.window.Mindow = function(w) {
	/**
	 * reference to the given window object
	 *
	 * @type {DeskUI.window.Window}
	 */
	this.window = w;

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<button class="mindow"><img src="'+this.window.icon+'" alt="'+this.window.title+'"/><h3>'+this.window.title+'</h3></button>');

	/**
	 * A generated context menu for the mindow
	 *
	 * @type {DeskUI.menu.ContextMenu}
	 */
	this.contextmenu = DeskUI.window.genMindowContextMenu(this);

	// local scope variable for anonymous functions
	var mindow = this;

	// jQuery event; minimizes the window if it's not already; otherwise it will unminimize it
	this.element.click(function() {
		if(mindow.window.minimized) {
			mindow.window.unminimize();
		}
		else {
			mindow.window.minimize();
		}
	});

	// appends mindow to the DOM
	$('#mindows').append(this.element);
}

/**
 * This method destroys the Mindow object (but not it's window)
 */
DeskUI.window.Mindow.prototype.destroy = function() {
	// unlink the window
	this.window = null;

	// remove the jQuery element from the DOM
	this.element.remove();

	// destroy the context menu
	this.contextmenu.destroy();

	return this;
}

/**
 * @class Class for managing a window
 *
 * @param {string} title - window title
 * @param {string} icon - relative path to the icon's location
 * @param {number} x - window's x position (or CSS 'left' property)
 * @param {number} y - window's y position (or CSS 'top' property)
 * @param {number} w - window's width (or CSS 'width' property)
 * @param {number} h - window's height (or CSS 'height' property)
 */
DeskUI.window.Window = function(title, icon, x, y, w, h) {
	/**
	 * window id
	 *
	 * @type {number}
	 */
	this.id = DeskUI.window.latestID++;

	/**
	 * window title
	 *
	 * @type {string}
	 */
	this.title = title || 'Unnamed window';

	/**
	 * window icon (relative path)
	 *
	 * @type {string}
	 */
	this.icon = icon;

	/**
	 * window's x position (default: 100)
	 *
	 * @type {number}
	 */
	this.x = x || 100;

	/**
	 * window's y position (default: 100)
	 *
	 * @type {number}
	 */
	this.y = y || 100;

	/**
	 * window's width (default: 500)
	 *
	 * @type {number}
	 */
	this.w = w || 500;

	/**
	 * window's height (default: 300)
	 *
	 * @type {number}
	 */
	this.h = h || 300;

	/**
	 * window's original x position (default: 100)
	 *
	 * @type {number}
	 */
	this.orig_x = x || 100;

	/**
	 * window's original y position (default: 100)
	 *
	 * @type {number}
	 */
	this.orig_y = y || 100;

	/**
	 * window's original width (default: 500)
	 *
	 * @type {number}
	 */
	this.orig_w = w || 500;

	/**
	 * window's original height (default: 300)
	 *
	 * @type {number}
	 */
	this.orig_h = h || 300;

	/**
	 * window's dragging x position
	 *
	 * @type {number}
	 */
	this.drag_x = 0;

	/**
	 * window's dragging y position
	 *
	 * @type {number}
	 */
	this.drag_y = 0;

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<div class="window"><header><img src="'+this.icon+'" alt="'+this.title+'"/><h3>'+this.title+'</h3><aside><button class="minimize"></button><button class="unmaximize"></button><button class="maximize"></button><button class="close"></button></aside></header><section class="content"></section></div>');

	/**
	 * onClose callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.closeCallbacks = [];

	/**
	 * onMaximize callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.maximizeCallbacks = [];

	/**
	 * onUnmaximize callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.unmaximizeCallbacks = [];

	/**
	 * onMinimize callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.minimizeCallbacks = [];

	/**
	 * onUnminimize callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.unminimizeCallbacks = [];

	/**
	 * onResize callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.resizeCallbacks = [];

	/**
	 * onMove callbacks (array of functions)
	 *
	 * @type {array}
	 */
	this.moveCallbacks = [];

	/**
	 * Minimized boolean
	 *
	 * @type {boolean}
	 */
	this.minimized = false;

	/**
	 * Maximized boolean
	 *
	 * @type {boolean}
	 */
	this.maximized = false;

	/**
	 * Resizeable boolean
	 *
	 * @type {boolean}
	 */
	this.resizeable = false;

	/**
	 * The mindow for this window
	 *
	 * @type {DeskUI.window.Mindow}
	 */
	this.mindow = new DeskUI.window.Mindow(this);

	// Adds a reference to the window namespace for this window
	DeskUI.window.windows.push(this);

	// add variable to local scope
	var w = this;

	// add event listeners
	this.element.mousedown(function() {
		w.top();
	});

	this.element.children('header').mousedown(function(event) {
		if(w.maximized) return false;
		w.drag_x = event.pageX;
		w.drag_y = event.pageY;
		DeskUI.window.drag(w);
	});

	this.element.find('> header > aside > button').mousedown(function() {
		return false;
	});

	this.element.find('> header > aside > button.minimize').click(function() {
		w.minimize();
	});

	this.element.find('> header > aside > button.unmaximize').click(function() {
		w.unmaximize();
	});

	this.element.find('> header > aside > button.maximize').click(function() {
		w.maximize();
	});

	this.element.find('> header > aside > button.close').click(function() {
		w.close();
	});

	// Appends window into the DOM
	$('#windows').append(this.element);

	// render this window correctly
	this.render();

	// Pushes the window up to the top
	this.top();
}

/**
 * This methods sets the window's content to the parameter 'content'
 *
 * @param {string} content - The content which is to be set
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.setContent = function(content) {
	this.element.children('section.content').html(content);

	return this;
}

/**
 * This method renders the changes (x/y/w/h) to the jQuery element
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.render = function() {
	this.element.css('top', this.y);
	this.element.css('left', this.x);
	this.element.css('width', this.w);
	this.element.css('height', this.h);

	return this;
}

/**
 * @returns {boolean} true when the window is the current top window
 */
DeskUI.window.Window.prototype.isTop = function() {
	return this.element.css('z-index') == (DeskUI.window.topZ-1);
}

/**
 * This method sets the window to the highest (z-index) window and therefore makes it the top window
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.top = function() {
	this.element.css('z-index', DeskUI.window.topZ++);

	return this;
}

/**
 * This method resets the window to its original dimensions and position and also makes it the top element
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.reset = function() {
	this.x = this.orig_x;
	this.y = this.orig_y;
	this.w = this.orig_w;
	this.h = this.orig_h;
	this.unminimize();
	this.unmaximize();
	this.render();

	return this;
}

/**
 * This method corrects the window's position if its title bar is out of the users vision
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.correct = function() {
	if(this.element.width() + this.element.offset().left > $(window).width()) {
		this.x = $(window).width() - this.element.width();
		this.x = this.x < 0 ? 0 : this.x;
	}
	if(this.element.height() + this.element.offset().top > $(window).height()) {
		this.y = $(window).height() - this.element.height();
		this.y = this.y < 0 ? 0 : this.y;
	}
	this.render();

	return this;
}

/**
 * This method centralizes the window
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.centralize = function() {
	this.x = Math.round(($(window).width() - this.w)/2);
	this.y = Math.round(($(window).height() - this.h)/2);
	this.render();
	this.correct();

	return this;
}

/**
 * This method (high) centralizes the window; high means that it's not centralized in the vertical axis but rather set to one third of the browser's height
 *
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.highcentralize = function() {
	this.x = Math.round(($(window).width() - this.w)/2);
	this.y = Math.round(($(window).height() - this.h)/3);
	this.render();
	this.correct();

	return this;
}

/**
 * This method closes the window
 *
 * @fires DeskUI.window.Window.onClose
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.close = function() {
	// removes the jQuery element from the DOM
	this.element.remove();

	// destroys the mindow and then remove the reference
	this.mindow.destroy();
	this.mindow = null;

	// removes the window from the DeskUI.window.windows array
	for(var i = 0; i < DeskUI.window.windows.length; i++) {
		if(DeskUI.window.windows[i].id === this.id) {
			DeskUI.window.windows.splice(i, 1);
			break;
		}
	}

	// fires the event
	DeskUI.core.fire(this.closeCallbacks, this);

	return this;
}

/**
 * This method maximizes the window
 *
 * @fires DeskUI.window.Window.onMaximize
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.maximize = function() {
	this.maximized = true;
	this.element.addClass('maximized');
	this.top();

	// fires the event
	DeskUI.core.fire(this.maximizeCallbacks, this);

	return this;
}

/**
 * This method unmaximizes the window
 *
 * @fires DeskUI.window.Window.onUnaximize
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.unmaximize = function() {
	this.maximized = false;
	this.element.removeClass('maximized');
	this.top();

	// fires the event
	DeskUI.core.fire(this.unmaximizeCallbacks, this);

	return this;
}

/**
 * This method minimizes the window
 *
 * @fires DeskUI.window.Window.onMinimize
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.minimize = function() {
	this.minimized = true;
	this.element.addClass('minimized');

	// fires the event
	DeskUI.core.fire(this.minimizeCallbacks, this);

	return this;
}

/**
 * This method unminimizes the window
 *
 * @fires DeskUI.window.Window.onUnminimize
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.unminimize = function() {
	this.minimized = false;
	this.element.removeClass('minimized');
	this.top();

	// fires the event
	DeskUI.core.fire(this.unminimizeCallbacks, this);

	return this;
}

/**
 * This method resizes the window to the given dimensions
 *
 * @param {number} w - The new width of the window (or CSS 'width' property)
 * @param {number} h - The new height of the window (or CSS 'height' property)
 * @fires DeskUI.window.Window.onResize
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.resize = function(w, h) {
	this.w = w;
	this.h = h;
	this.render();
	this.top();

	// fires the event
	DeskUI.core.fire(this.resizeCallbacks, this);

	return this;
}

/**
 * This method moves the window to the given position
 *
 * @param {number} x - The new x position of the window (or CSS 'left' property)
 * @param {number} y - The new y position of the window (or CSS 'top' property)
 * @fires DeskUI.window.Window.onMove
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.move = function(x, y) {
	this.x = x;
	this.y = y;
	this.render();
	this.top();

	// fires the event
	DeskUI.core.fire(this.moveCallbacks, this);

	return this;
}

/**
 * This function registers the callback; once the window is getting closed the callback will be called
 *
 * @event DeskUI.window.Window.onClose
 * @param {function} callback - The callback function which is to be called when the window is getting closed
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onClose = function(callback) {
	if(typeof callback === 'function')
		this.closeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting maximized the callback will be called
 *
 * @event DeskUI.window.Window.onMaximize
 * @param {function} callback - The callback function which is to be called when the window is getting maximized
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onMaximize = function(callback) {
	if(typeof callback === 'function')
		this.maximizeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting unmaximized the callback will be called
 *
 * @event DeskUI.window.Window.onUnmaximize
 * @param {function} callback - The callback function which is to be called when the window is getting unmaximized
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onUnaximize = function(callback) {
	if(typeof callback === 'function')
		this.unmaximizeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting minimized the callback will be called
 *
 * @event DeskUI.window.Window.onMinimize
 * @param {function} callback - The callback function which is to be called when the window is getting minimized
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onMinimize = function(callback) {
	if(typeof callback === 'function')
		this.minimizeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting unminimized the callback will be called
 *
 * @event DeskUI.window.Window.onUnminimize
 * @param {function} callback - The callback function which is to be called when the window is getting unminimized
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onUnminimize = function(callback) {
	if(typeof callback === 'function')
		this.unminimizeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting resized the callback will be called
 *
 * @event DeskUI.window.Window.onResize
 * @param {function} callback - The callback function which is to be called when the window is getting resized
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onResize = function(callback) {
	if(typeof callback === 'function')
		this.resizeCallbacks.push(callback);

	return this;
}

/**
 * This function registers the callback; once the window is getting moved the callback will be called
 *
 * @event DeskUI.window.Window.onMove
 * @param {function} callback - The callback function which is to be called when the window is getting moved
 * @returns {DeskUI.window.Window} The window context
 */
DeskUI.window.Window.prototype.onMove = function(callback) {
	if(typeof callback === 'function')
		this.moveCallbacks.push(callback);

	return this;
}

// executing the window initialization function
DeskUI.window.init();