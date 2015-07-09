/**
 * DeskUI app
 *
 * @file DeskUI's app management
 * @version 0.1
 * @requires deskui.js, deskui.menu.js
 */

/**
 * @namespace
 */
DeskUI.app = {};

/**
 * All apps are linked in here
 *
 * @type {array}
 */
DeskUI.app.apps = [];

/**
 * This function registers an app to the DeskUI.app namespace; it also appends the app to the desktop and registers it's load event to jQuery
 *
 * @param {DeskUI.app.App} app - app to be added to the DeskUI.app namespace
 */
DeskUI.app.register = function(app) {
	DeskUI.app.apps.push(app);

	$(document).ready(function() {
		$('#apps').append(app.element);

		app.contextmenu = DeskUI.app.genAppContextMenu(app);

		app.load();
	});
}

/**
 * This function generates a ContextMenu object for the given app
 *
 * @param {DeskUI.app.App} app - the app to which the function generates a context menu
 * @returns {DeskUI.menu.ContextMenu} The generated ContextMenu object
 */
DeskUI.app.genAppContextMenu = function(app) {
	return new DeskUI.menu.ContextMenu()
		.addItem("Launch", function() {app.launch()})
		.addSeparator()
		.addItem("Author", function() {new DeskUI.widget.Dialog().setContent(app.name + ' – Author<br/>' + app.author.name + '<br/>' + app.author.email + '<br/>' + app.author.website).setType(DeskUI.widget.TYPE_INFO).setButton1('OK').show()})
		.addItem("Version", function() {new DeskUI.widget.Dialog().setContent(app.name + ' – Version ' + app.version).setType(DeskUI.widget.TYPE_INFO).setButton1('OK').show()})
		.addSeparator()
		.addItem("Update")
		.addItem("Uninstall")
		.assign(app.element);
}

/**
 * @class Author class
 *
 * @param {string} name - author's name (required)
 * @param {string} email - author's email (optional)
 * @param {string} website - author's website (optional)
 */
DeskUI.app.Author = function(name, email, website) {
	/**
	 * The author's name
	 *
	 * @type {string}
	 */
	this.name = name;

	/**
	 * The author's email address
	 *
	 * @type {string}
	 */
	this.email = email || '';

	/**
	 * The author's website
	 *
	 * @type {string}
	 */
	this.website = website || '';
}

/**
 * @class Class managing a DeskUI app
 *
 * @param {string} id - app id (must match the app's folder name)
 * @param {string} name - app name which is displayed on the desktop
 */
DeskUI.app.App = function(id, name) {
	/**
	 * The app id (must match the app's folder name)
	 *
	 * @type {string}
	 */
	this.id = id;

	/**
	 * The app name which is displayed on the desktop
	 *
	 * @type {string}
	 */
	this.name = name || 'Unnamed app';

	/**
	 * Relative path to the app's folder
	 *
	 * @type {string}
	 */
	this.path = './apps/' + this.id + '/';

	/**
	 * The app icon's relative path
	 *
	 * @type {string}
	 */
	this.icon = this.path + 'app.png';

	/**
	 * The app version
	 *
	 * @type {string}
	 */
	this.version = '';

	/**
	 * The app's author
	 *
	 * @type {DeskUI.app.Author}
	 */
	this.author = new DeskUI.app.Author('');

	/**
	 * Array of callbacks called when the app is loaded
	 *
	 * @type {array}
	 */
	this.loadCallbacks = [];

	/**
	 * Array of callbacks called when the app is launched
	 *
	 * @type {array}
	 */
	this.launchCallbacks = [];

	/**
	 * Array containing the jQuery element for this app
	 *
	 * @type {array}
	 */
	this.element = $('<button class="app"><img src="'+this.icon+'" alt="'+this.name+'"/><h3>'+this.name+'</h3></button>');

	/**
	 * The context menu for this app
	 *
	 * @type {DeskUI.menu.ContextMenu}
	 */
	this.contextmenu;

	// local scope variable
	var app = this;

	// add click event listener for app launch event
	this.element.click(function() {
		app.launch();
	});

	DeskUI.app.register(this);
}

/**
 * This method is called when the app is loaded into the DeskUI environment
 *
 * @fires DeskUI.app.App.onLoad
 */
DeskUI.app.App.prototype.load = function() {
	DeskUI.core.fire(this.loadCallbacks, this);
}

/**
 * This method will register the callback for the app's load event; once the app is getting loaded the callback will be called
 *
 * @event DeskUI.app.App.onLoad
 * @param {function} callback - A function which will be called when the app is getting loaded into the DeskUI environment
 * @returns {DeskUI.app.App} The app context
 */
DeskUI.app.App.prototype.onLoad = function(callback) {
	if(typeof callback === 'function')
		this.loadCallbacks.push(callback);

	return this;
}

/**
 * This method is called when the app is launched by the user
 *
 * @fires DeskUI.app.App.onLaunch
 */
DeskUI.app.App.prototype.launch = function() {
	DeskUI.core.fire(this.launchCallbacks, this);
}

/**
 * This method will register the callback for the app's launch event; once the app is getting launched the callback will be called
 *
 * @event DeskUI.app.App.onLaunch
 * @param {function} callback - A function which will be called when the app is getting launched by the user
 * @returns {DeskUI.app.App} The app context
 */
DeskUI.app.App.prototype.onLaunch = function(callback) {
	if(typeof callback === 'function')
		this.launchCallbacks.push(callback);

	return this;
}

/**
 * This method sets the app's author
 *
 * @param {string} name - author's name (required)
 * @param {string} email - author's email (optional)
 * @param {string} website - author's website (optional)
 * @returns {DeskUI.app.App} The app context
 */
DeskUI.app.App.prototype.setAuthor = function(name, email, website) {
	this.author = new DeskUI.app.Author(name, email, website);

	return this;
}

/**
 * This method sets the app's version
 *
 * @param {string} version - The app version to be set
 * @returns {DeskUI.app.App} The app context
 */
DeskUI.app.App.prototype.setVersion = function(version) {
	this.version = version;

	return this;
}