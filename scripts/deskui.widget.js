/**
 * DeskUI widget
 *
 * @file DeskUI's widget collection
 * @version 0.1
 * @requires deskui.js
 */

/**
 * @namespace
 */
DeskUI.widget = {};

/**
 * Widget type: normal
 *
 * @type {number}
 * @constant
 */
DeskUI.widget.TYPE_NORMAL = 0;

/**
 * Widget type: info
 *
 * @type {number}
 * @constant
 */
DeskUI.widget.TYPE_INFO = 1;

/**
 * Widget type: success
 *
 * @type {number}
 * @constant
 */
DeskUI.widget.TYPE_SUCCESS = 2;

/**
 * Widget type: warning
 *
 * @type {number}
 * @constant
 */
DeskUI.widget.TYPE_WARNING = 3;

/**
 * Widget type: error
 *
 * @type {number}
 * @constant
 */
DeskUI.widget.TYPE_ERROR = 4;

/**
 * Highest given id for a notice (minus one)
 *
 * @type {number}
 */
DeskUI.widget.currentID = 0;

/**
 * Array of all notices
 *
 * @type {array}
 */
DeskUI.widget.notices = [];

/**
 * Array of all dialogs
 *
 * @type {array}
 */
DeskUI.widget.dialogs = [];

/**
 * @class Class that represents a notice
 */
DeskUI.widget.Notice = function() {
	/**
	 * The content of the notice.
	 * Default is '' (empty string)
	 *
	 * @type {string}
	 */
	this.content = '';

	/**
	 * Type of the notice.
	 * Default is TYPE_NORMAL
	 *
	 * @type {number}
	 */
	this.type = DeskUI.widget.TYPE_NORMAL;

	/**
	 * Lifetime of a notice before it disappears.
	 * Default is 3000 (3 seconds)
	 *
	 * @type {number}
	 */
	this.lifetime = 3000;

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<div class="notice"></div>');
}

/**
 * Sets the content of a notice
 *
 * @param {string} content - the message the notice will show
 * @returns {DeskUI.widget.Notice} The Notice context
 */
DeskUI.widget.Notice.prototype.setContent = function(content) {
	this.content = content;

	return this;
}

/**
 * Sets the type of a notice
 *
 * @param {number} type - One of the five types (normal, info, success, warning, error)
 * @returns {DeskUI.widget.Notice} The Notice context
 */
DeskUI.widget.Notice.prototype.setType = function(type) {
	this.type = type;

	return this;
}

/**
 * Sets the lifetime of a notice
 *
 * @param {lifetime} lifetime - the lifetime in seconds
 * @returns {DeskUI.widget.Notice} The Notice context
 */
DeskUI.widget.Notice.prototype.setLifetime = function(lifetime) {
	this.lifetime = lifetime;

	return this;
}

/**
 * Renders changes to the Notice element
 *
 * @returns {DeskUI.widget.Notice} The Notice context
 */
DeskUI.widget.Notice.prototype.render = function() {
	// sets the content
	this.element.html(this.content);

	// remove all types
	this.element
		.removeClass('success')
		.removeClass('info')
		.removeClass('warning')
		.removeClass('error');

	// add the set type as a css class
	switch(this.type) {
		case DeskUI.widget.TYPE_INFO:
			this.element.addClass('info');
			break;
		case DeskUI.widget.TYPE_SUCCESS:
			this.element.addClass('success');
			break;
		case DeskUI.widget.TYPE_WARNING:
			this.element.addClass('warning');
			break;
		case DeskUI.widget.TYPE_ERROR:
			this.element.addClass('error');
			break;
	}

	// set the width (in order for 'margin: auto' to work)
	this.element.css('width', this.element.width()).css('display', 'block');

	return this;
}

/**
 * Shows the notice (for "lifetime" in milliseconds)
 *
 * @returns {DeskUI.widget.Notice} The Notice context
 */
DeskUI.widget.Notice.prototype.show = function() {
	DeskUI.widget.notices.push(this);
	$('#widgets').append(this.element);

	this.render();

	var notice = this;

	this.element
		.show()
		.css('opacity', 0)
		.animate({opacity: 1}, 500)
		.delay(this.lifetime)
		.animate({opacity: 0}, 500)
		.animate({height:0, margin:0, padding:0}, 500,
			function() {
				notice.element.remove();

				for(var i = 0; i < DeskUI.widget.notices.length; i++) {
					if(DeskUI.widget.notices[i].id === notice.id) {
						DeskUI.widget.notices.splice(i, 1);
						break;
					}
				}
			});

	return this;
}

/**
 * @class DialogButton is a button for the DeskUI.widget.Dialog class
 *
 * @param {string} name - the name that will be shown for the button
 * @param {function} callback - the callback function which is called when the button gets pressed
 * @param {DeskUi.widget.Dialog} dialog - the context of the Dialog object
 */
DeskUI.widget.DialogButton = function(name, callback, dialog) {
	/**
	 * The name that will be shown for the button.
	 * Default is '' (empty string)
	 *
	 * @type {string}
	 */
	this.name = name || '';

	/**
	 * The callback function for then the button gets clicked
	 * Default is an empty function
	 *
	 * @type {function}
	 */
	this.callback = callback || function() {};

	/**
	 * The Dialog object context
	 *
	 * @type {DeskUI.widget.Dialog}
	 */
	this.dialog = dialog;

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<button>'+this.name+'</button>');

	// local variable for scoping reasons
	var dialogbutton = this;

	// the click event listener
	this.element.click(function() {
		dialogbutton.dialog.close();
		dialogbutton.callback.call(dialogbutton);
	});
}

/**
 * Renders the content to the jQuery element
 *
 * @returns {DeskUI.widget.DialogButton} The DialogButton context
 */
DeskUI.widget.DialogButton.prototype.render = function() {
	this.element.html(this.name);

	return this;
}

/**
 * @class Dialog is a dialog box; it can be used when the system expects a decision
 */
DeskUI.widget.Dialog = function() {
	/**
	 * The content of the dialog box
	 * Default is '' (empty string)
	 *
	 * @type {string}
	 */
	this.content = '';

	/**
	 * The type of the dialog box (see type attribute for the Notice class).
	 * Default is DeskUI.widget.TYPE_NORMAL
	 *
	 * @type {number}
	 */
	this.type = DeskUI.widget.TYPE_NORMAL;

	/**
	 * The dialog buttons (only visible when set).
	 * Supported up to maximal 4 buttons per box
	 *
	 * @type {DeskUI.widget.DialogButton}
	 */
	this.button1, this.button2, this.button3, this.button4;

	/**
	 * Array containing the jQuery element
	 *
	 * @type {array}
	 */
	this.element = $('<div class="dialog"><div class="content"></div><div class="buttons"></div></div>');

	$('#widgets').append(this.element);

	return this;
}

/**
 * Sets the content of the dialog
 *
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setContent = function(content) {
	this.content = content;

	return this;
}

/**
 * Sets (and therefore also adds) the Button1 to the dialog
 *
 * @param {string} name - button name that will be displayed
 * @param {callback} callback - callback function that will be called when the button gets clicked
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setButton1 = function(name, callback) {
	this.button1 = new DeskUI.widget.DialogButton(name, callback, this);
	this.element.find('> div.buttons').append(this.button1.element);

	return this;
}

/**
 * Sets (and therefore also adds) the Button2 to the dialog
 *
 * @param {string} name - button name that will be displayed
 * @param {callback} callback - callback function that will be called when the button gets clicked
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setButton2 = function(name, callback) {
	this.button2 = new DeskUI.widget.DialogButton(name, callback, this);
	this.element.find('> div.buttons').append(this.button2.element);

	return this;
}

/**
 * Sets (and therefore also adds) the Button3 to the dialog
 *
 * @param {string} name - button name that will be displayed
 * @param {callback} callback - callback function that will be called when the button gets clicked
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setButton3 = function(name, callback) {
	this.button3 = new DeskUI.widget.DialogButton(name, callback, this);
	this.element.find('> div.buttons').append(this.button3.element);

	return this;
}

/**
 * Sets (and therefore also adds) the Button4 to the dialog
 *
 * @param {string} name - button name that will be displayed
 * @param {callback} callback - callback function that will be called when the button gets clicked
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setButton4 = function(name, callback) {
	this.button4 = new DeskUI.widget.DialogButton(name, callback, this);
	this.element.find('> div.buttons').append(this.button4.element);

	return this;
}

/**
 * Sets the type of the dialog
 *
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.setType = function(type) {
	this.type = type;

	return this;
}

/**
 * Renders the complete dialog
 *
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.render = function() {
	this.element
		.removeClass('success')
		.removeClass('info')
		.removeClass('warning')
		.removeClass('error');

	switch(this.type) {
		case DeskUI.widget.TYPE_INFO:
			this.element.addClass('info');
			break;
		case DeskUI.widget.TYPE_SUCCESS:
			this.element.addClass('success');
			break;
		case DeskUI.widget.TYPE_WARNING:
			this.element.addClass('warning');
			break;
		case DeskUI.widget.TYPE_ERROR:
			this.element.addClass('error');
			break;
	}

	this.element.find('> div.content').html(this.content);

	this.element
		.css('display', 'block')
		//.css('width', this.element.width())
		//.css('height', this.element.height())
		.css('left', Math.round(($(window).width() - this.element.width())/2))
		.css('top', Math.round(($(window).height() - this.element.height())/3))
		.css('display', 'none');

	return this;
}

/**
 * Shows the dialog
 *
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.show = function() {
	this.render();

	this.element
		.css('display', 'block')
		.css('opacity', 1);

	return this;
}

/**
 * Closes the dialog
 *
 * @returns {DeskUI.widget.Dialog} The Dialog context
 */
DeskUI.widget.Dialog.prototype.close = function() {
	this.element
		.css('opacity', 0)
		.css('display', 'none');

	this.element.remove();

	return this;
}

// DeskUI.widget.Tooltip = function() {/* [...] */}