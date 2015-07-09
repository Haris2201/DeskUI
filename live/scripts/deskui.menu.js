/**
 * DeskUI menu
 *
 * @file DeskUI's menu management system
 * @version 0.1
 * @requires deskui.js
 */

/**
 * @namespace
 */
DeskUI.menu = {};

/**
 * Array containing all context menus
 *
 * @type {array}
 */
DeskUI.menu.contextmenus = [];

/**
 * Highest given id for a context menu (minus one)
 *
 * @type {number}
 */
DeskUI.menu.latestContextMenuID = 0;

/**
 * This function registers the necessary events for the menu system
 */
DeskUI.menu.init = function(){
	$(document).ready(function() {
		$(window).mouseup(function(event){DeskUI.menu.click(event)});
	});
}

/**
 * Function which is called every time when the mouse clicks
 */
DeskUI.menu.click = function(event) {
	for(var i = 0; i < DeskUI.menu.contextmenus.length; i++) {
		DeskUI.menu.contextmenus[i].close();
	}
}

/**
 * @class Class that manages a menu item
 *
 * @param {string} name - name of the menu item
 * @param {function} callback - the callback function that is to be called when the menu item gets selected
 */
DeskUI.menu.MenuItem = function(name, callback) {
	/**
	 * The displayed name for the menu item
	 *
	 * @type {string}
	 */
	this.name = name;

	/**
	 * The callback function for when the menu item gets selected
	 *
	 * @type {function}
	 */
	this.callback = callback || function() {};

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<button class="item">'+this.name+'</button>');

	// local scope variable for anonymous function
	var menuitem = this;

	// jQuery event when the menu item gets selected
	this.element.click(function() {
		menuitem.callback.call(menuitem);
		menuitem.render();
	});
}

/**
 * Renders the menu item
 *
 * @returns {DeskUI.menu.MenuItem} The MenuItem context
 */
DeskUI.menu.MenuItem.prototype.render = function() {
	this.element.html(this.name);

	return this;
}

/**
 * Disables the MenuItem button
 *
 * @returns {DeskUI.menu.MenuItem} The MenuItem context
 */
DeskUI.menu.MenuItem.prototype.disable = function() {
	this.element.attr('disabled', true);

	return this;
}

/**
 * Enables the MenuItem button
 *
 * @returns {DeskUI.menu.MenuItem} The MenuItem context
 */
DeskUI.menu.MenuItem.prototype.enable = function() {
	this.element.attr('disabled', false);

	return this;
}

/**
 * @class Class that manages a context menu
 */
DeskUI.menu.ContextMenu = function() {
	/**
	 * A unique id for the context menu
	 */
	this.id = DeskUI.menu.latestContextMenuID++;

	/**
	 * Array containing the menu items for this menu
	 *
	 * @type {array}
	 */
	this.menuitems = [];

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<div class="menu context"></div>');

	// add a reference to the contextmenus array
	DeskUI.menu.contextmenus.push(this);

	// Appends menu into the DOM
	$('#menus').append(this.element);
}

/**
 * Adds a new menu item into the context menu
 *
 * @param {string} name - name of the menu item
 * @param {function} callback - the callback function that is to be called when the menu item gets selected
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.addItem = function(name, callback) {
	// creates a new menu item
	var menuitem = new DeskUI.menu.MenuItem(name, callback);

	// adds menu item to the reference array
	this.menuitems.push(menuitem);

	// appends it to the context menu element
	this.element.append(menuitem.element);

	return this;
}

/**
 * Adds a menu item separator (for design purposes)
 *
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.addSeparator = function() {
	this.element.append($('<span class="separator"></span>'));

	return this;
}

/**
 * Opens the context menu (corrects it's position if needed)
 *
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.open = function(event) {
	event.preventDefault();

	this.element.css('top', event.pageY);
	this.element.css('left', event.pageX);

	this.element.show();

	// corrects the context menu's position to be in vision of the user
	if(this.element.width() + this.element.offset().left > $(window).width()) {
		this.element.css('left', $(window).width() - this.element.width());
	}
	if(this.element.height() + this.element.offset().top > $(window).height()) {
		this.element.css('top', $(window).height() - this.element.height());
	}

	return this;
}

/**
 * Closes the context menu
 *
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.close = function() {
	this.element.hide();

	return this;
}

/**
 * Assigns the context menu to the given item
 *
 * @param {array} element - jQuery element
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.assign = function(element) {
	// local scope variable for anonymous function
	var contextmenu = this;

	// assigns the open function to the contextmenu event from the given element
	element.on('contextmenu', function(event){contextmenu.open(event)});

	return this;
}

/**
 * Destroys the ContextMenu object (i.e. removes the element from the DOM and also removes all references to and from it)
 *
 * @returns {DeskUI.menu.MenuItem} The ContextMenu context
 */
DeskUI.menu.ContextMenu.prototype.destroy = function() {
	// remove the jQuery element from the DOM
	this.element.remove();

	// remove all references to menu items
	this.menuitems = [];

	// removes the context menu from the DeskUI.menu.contextmenus array
	for(var i = 0; i < DeskUI.menu.contextmenus.length; i++) {
		if(DeskUI.menu.contextmenus[i].id === this.id) {
			DeskUI.menu.contextmenus.splice(i, 1);
			break;
		}
	}

	return this;
}

// executing the menu's init function
DeskUI.menu.init();