/**
 * File Browser
 */

/**
 * @namespace
 */
_a.filebrowser = {};

// latest given ID to a file browser
_a.filebrowser.latestID = 0;

// all (active) file browser
_a.filebrowser.filebrowsers = [];

// for clipboard functionalities
_a.filebrowser.clipboard = null;
_a.filebrowser.clipboard_cut = false;

// drag
_a.filebrowser.drag = function(event, file) {
	event.originalEvent.dataTransfer.setData('filebrowser', file.filebrowser.id);
	event.originalEvent.dataTransfer.setData('path', file.path);
}

// drop
_a.filebrowser.drop = function(event, filebrowser) {
	var filebrowserID = event.originalEvent.dataTransfer.getData('filebrowser');
	var path = event.originalEvent.dataTransfer.getData('path');
	if(filebrowserID == filebrowser.id) return false;
	filebrowser.dropFile(path);
}

// drop over
_a.filebrowser.dragOver = function(event) {
	event.preventDefault();
}

// quick fix for context menu bug when new file was copied after an other file browser was opened
_a.filebrowser.contextmenuFix = function() {
	for(var i = 0; i < _a.filebrowser.filebrowsers.length; i++) {
		var filebrowser = _a.filebrowser.filebrowsers[i];

		(filebrowser.history_back.length == 0) ? filebrowser.contextmenu.menuitems[0].element.attr('disabled', true) : filebrowser.contextmenu.menuitems[0].element.attr('disabled', false);
		(filebrowser.history_forw.length == 0) ? filebrowser.contextmenu.menuitems[1].element.attr('disabled', true) : filebrowser.contextmenu.menuitems[1].element.attr('disabled', false);
		(_a.filebrowser.clipboard === null) ? filebrowser.contextmenu.menuitems[3].element.attr('disabled', true) : filebrowser.contextmenu.menuitems[3].element.attr('disabled', false);
	}
}

// navigation element
_a.filebrowser.NavigationElement = function(name, path, filebrowser) {
	this.name = name;
	this.path = path;
	this.filebrowser = filebrowser;

	this.element = $('<button>'+this.name+'</button>');

	var navigationelement = this;

	this.element.click(function() {
		navigationelement.filebrowser.browse(navigationelement.path);
	});
}

// file class
_a.filebrowser.File = function(api, filebrowser) {
	this.name = api.name;
	this.filebrowser = filebrowser;
	this.path = this.filebrowser.location + '/' + this.name;
	this.api = api;

	if(api.dir && api.readable) var image = '<img src="./apps/filebrowser/images/folder.png" alt="Folder"/>';
	if(api.dir && !api.readable) var image = '<img src="./apps/filebrowser/images/folder-forbidden.png" alt="Folder (forbidden)"/>';
	if(!api.dir) {
		var extension = this.name.split('.').pop();
		//alert(extension);
		if(extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
			var image = '<img src="./apps/filebrowser/images/image.png" alt="Image"/>';
		}
		else if(extension == 'js') {
			var image = '<img src="./apps/filebrowser/images/js.png" alt="JavaScript"/>';
		}
		else if(extension == 'php') {
			var image = '<img src="./apps/filebrowser/images/php.png" alt="PHP"/>';
		}
		else if(extension == 'css') {
			var image = '<img src="./apps/filebrowser/images/css.png" alt="CSS"/>';
		}
		else if(extension == 'pdf') {
			var image = '<img src="./apps/filebrowser/images/pdf.png" alt="PDF"/>';
		}
		else if(extension == 'mp3' || extension == 'ogg') {
			var image = '<img src="./apps/filebrowser/images/audio.png" alt="Audio"/>';
		}
		else if(extension == 'py') {
			var image = '<img src="./apps/filebrowser/images/py.png" alt="Python"/>';
		}
		else if(extension == 'jar') {
			var image = '<img src="./apps/filebrowser/images/jar.png" alt="JAR"/>';
		}
		else if(extension == 'xcf') {
			var image = '<img src="./apps/filebrowser/images/xcf.png" alt="XCF"/>';
		}
		else {
			var image = '<img src="./apps/filebrowser/images/txt.png" alt="File"/>'
		}
	}

	this.element = $('<button class="file" draggable="true">'+image+'<h3>'+this.name+'</h3></button>');

	var file = this;

	this.element.click(function() {
		if(file.api.readable) {
			if(file.api.dir) {
				file.filebrowser.browse(file.path);
			}
			else {
				file.filebrowser.download(file);
			}
		}
	});

	this.contextmenu = new _m.ContextMenu()
		.assign(this.element)
		.addItem('Paste', function(){
			file.filebrowser.paste();
			_a.filebrowser.contextmenuFix();
		})
		.addItem('Cut', function() {
			_a.filebrowser.clipboard = file;
			_a.filebrowser.clipboard_cut = true;
			_a.filebrowser.contextmenuFix();
		})
		.addItem('Copy', function(){
			_a.filebrowser.clipboard = file;
			_a.filebrowser.clipboard_cut = false;
			_a.filebrowser.contextmenuFix();
		})
		.addSeparator()
		.addItem('Delete', function() {file.remove()});

	this.element.on('dragstart', function(event) {
		_a.filebrowser.drag(event, file);
	});
}

_a.filebrowser.File.prototype.remove = function() {
	this.filebrowser.remove(this.path);
}

_a.filebrowser.File.prototype.destroy = function() {
	this.contextmenu.destroy();
}

// file browser class
_a.filebrowser.FileBrowser = function() {
	this.id = _a.filebrowser.currentID++;
	this.location = '';
	this.content = [];
	this.history_back = [];
	this.history_forw = [];
	this.files = [];
	this.api = null;

	this.element = $('<section class="filebrowser" id="filebrowser-'+this.id+'"><section class="filebrowser-navigation"><button class="back">&lt;</button><button class="forward">&gt;</button><button class="refresh"></button><button class="up"></button><button class="grid"></button><button class="list"></button><div class="filebrowser-location"></div></section><section class="filebrowser-content grid"></section></section>');

	var filebrowser = this;

	this.element.find('> section.filebrowser-navigation > button.back').click(function() {
		filebrowser.history_forw.push(filebrowser.location);
		filebrowser.location = filebrowser.history_back.pop();
		filebrowser.refresh();
	});

	this.element.find('> section.filebrowser-navigation > button.forward').click(function() {
		filebrowser.history_back.push(filebrowser.location);
		filebrowser.location = filebrowser.history_forw.pop();
		filebrowser.refresh();
	});

	this.element.find('> section.filebrowser-navigation > button.up').click(function() {
		filebrowser.browse(filebrowser.api.path_up);
	});

	this.element.find('> section.filebrowser-navigation > button.refresh').click(function() {
		filebrowser.refresh(filebrowser.location);
	});

	this.element.find('> section.filebrowser-navigation > button.grid').click(function() {
		filebrowser.element.find('> section.filebrowser-navigation > button.grid').css('display', 'none');
		filebrowser.element.find('> section.filebrowser-navigation > button.list').css('display', 'inline-block');
		filebrowser.element.find('> section.filebrowser-content').removeClass('list').addClass('grid');
	});

	this.element.find('> section.filebrowser-navigation > button.list').click(function() {
		filebrowser.element.find('> section.filebrowser-navigation > button.grid').css('display', 'inline-block');
		filebrowser.element.find('> section.filebrowser-navigation > button.list').css('display', 'none');
		filebrowser.element.find('> section.filebrowser-content').removeClass('grid').addClass('list');
	});

	this.element.find('> section.filebrowser-content')
		.on('dragover', _a.filebrowser.dragOver)
		.on('drop', function(event) {
			_a.filebrowser.drop(event, filebrowser);
		});

	this.contextmenu = new _m.ContextMenu()
		.addItem('Back', function() {if(filebrowser.history_back.length != 0) filebrowser.element.find('> section.filebrowser-navigation > button.back').click(); else new _v.Notice().setType(_v.TYPE_WARNING).setContent('Couldn\'t go back!').setLifetime(3000).show()})
		.addItem('Forward', function() {if(filebrowser.history_forw.length != 0) filebrowser.element.find('> section.filebrowser-navigation > button.forward').click(); else new _v.Notice().setContent('Couldn\'t go forward!').setType(_v.TYPE_WARNING).setLifetime(3000).show()})
		.addItem('Refresh', function() {this.element.find('> section.filebrowser-navigation > button.refresh').click()})
		.addSeparator()
		.addItem('Paste', function() {
			filebrowser.paste();
		})
		.assign(this.element.find('> section.filebrowser-content'));

	// Adds a reference to the filebrowser namespace for this file browser
	_a.filebrowser.filebrowsers.push(this);

	this.refresh();
}

// renders the object's relevant content to the DOM
_a.filebrowser.FileBrowser.prototype.render = function() {
	// destroy old files
	while(this.files.length != 0) {
		this.files.pop().destroy();
	}

	// manage buttons (back, forward, refresh)
	(this.history_back.length == 0) ? this.element.find('> section.filebrowser-navigation > button.back').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.back').attr('disabled', false);
	(this.history_forw.length == 0) ? this.element.find('> section.filebrowser-navigation > button.forward').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.forward').attr('disabled', false);
	(this.api.path_up == this.api.path_abs) ? this.element.find('> section.filebrowser-navigation > button.up').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.up').attr('disabled', false);

	// manage the context menu's buttons
	(this.history_back.length == 0) ? this.contextmenu.menuitems[0].element.attr('disabled', true) : this.contextmenu.menuitems[0].element.attr('disabled', false);
	(this.history_forw.length == 0) ? this.contextmenu.menuitems[1].element.attr('disabled', true) : this.contextmenu.menuitems[1].element.attr('disabled', false);
	(_a.filebrowser.clipboard === null) ? this.contextmenu.menuitems[3].element.attr('disabled', true) : this.contextmenu.menuitems[3].element.attr('disabled', false);

	// set the new path (with navigation elements)
	var path = '';
	this.element.find('> section.filebrowser-navigation > div.filebrowser-location').html('');
	for(var i = 0; i < this.api.path.length; i++) {
		path += this.api.path[i] + '/';
		var navigationelement = new _a.filebrowser.NavigationElement(this.api.path[i], path, this);
		this.element.find('> section.filebrowser-navigation > div.filebrowser-location').append(navigationelement.element);
	}

	// create new files and append them to the file browsers node
	this.element.find('> section.filebrowser-content').html('');
	for(var i = 0; i < this.api.content.length; i++) {
		var file = new _a.filebrowser.File(this.api.content[i], this);
		this.element.find('> section.filebrowser-content').append(file.element);
		this.files.push(file);
	}

	return this;
}

// the (new) APIcall method for the file browser
_a.filebrowser.FileBrowser.prototype.doAPIcall = function(action, success, arg1, arg2) {
		var post = {
			arg1:		arg1,
			arg2:		arg2
		}

		$.ajax({
			type:		'POST',
			data:		post,
			url:		'./apps/filebrowser/filebrowser.php?arg0=' + action,
			async:		true,
			success:	function(data) {console.log(action, post, data);success(data)},
			error:		function() {new _v.Notice().setContent('Server does not respond!').setType(_v.TYPE_ERROR).show()}
		});

	return this;
}

_a.filebrowser.FileBrowser.prototype.dropFile = function(path) {
	var filebrowser = this;

	var success = function(data) {
		var api = (data != '') ? JSON.parse(data) : null;

		if(api == null || !api.success) {
			new _v.Notice().setType(_v.TYPE_ERROR).setContent('Couldn\'t drop file!').show();
			return;
		}

		filebrowser.refresh();
	}

	this.doAPIcall('copy', success, path, this.location);
}

// pastes a file from the clipboard
_a.filebrowser.FileBrowser.prototype.paste = function() {
	var filebrowser = this;

	if(_a.filebrowser.clipboard === null) {
		return;
	}
	else {
		if(_a.filebrowser.clipboard_cut === true) {
			// 1. copy
			// 2. remove
			// 3. clean clipboard
			var success = function(data) {
				var api = (data != '') ? JSON.parse(data) : null;

				if(api == null || !api.success) {
					new _v.Notice().setContent('Couldn\'t move '+_a.filebrowser.clipboard.name+' here!').setType(_v.TYPE_ERROR).setLifetime(5000).show();
					return;
				}

				var removed = function(data) {
					var api = (data != '') ? JSON.parse(data) : null;

					if(api == null || !api.success) {
						new _v.Notice().setContent('Couldn\'t delete the original file ('+_a.filebrowser.clipboard.name+')!').setType(_v.TYPE_ERROR).setLifetime(10000).show();
						return;
					}

					_a.filebrowser.clipboard.filebrowser.refresh();

					_a.filebrowser.clipboard = null;
				}

				filebrowser.doAPIcall('remove', removed, _a.filebrowser.clipboard.path);

				filebrowser.refresh();
			}

			this.doAPIcall('copy', success, _a.filebrowser.clipboard.path, this.location);
		}
		else {
			var success = function(data) {
				var api = (data != '') ? JSON.parse(data) : null;

				if(api == null || !api.success) {
					new _v.Notice().setContent('Couldn\'t copy '+_a.filebrowser.clipboard.name+' here!').setType(_v.TYPE_ERROR).setLifetime(5000).show();
					return;
				}

				filebrowser.refresh();
			}

			this.doAPIcall('copy', success, _a.filebrowser.clipboard.path, this.location);
		}
	}
}

// downloads the file 'file' by creating an iframe and appending it to the DOM
_a.filebrowser.FileBrowser.prototype.download = function(file) {
	var e = $('<iframe style="display:none" src="./apps/filebrowser/filebrowser.php?arg0=download&arg1='+file.path+'"></iframe>');

	// appends the iframe (download start)
	$('body').append(e);

	// removes it after one minute (should be enough time for the server to answer)
	window.setTimeout(function() {
		e.remove();
	}, 60000);

	return this;
}

// removes the file at 'path'
_a.filebrowser.FileBrowser.prototype.remove = function(path) {
	var filebrowser = this;

	var success = function(data) {
		var api = (data != '') ? JSON.parse(data) : null;

		if(api == null || !api.success) {
			new _v.Notice().setContent('Couldn\'t remove file ('+path+')').setType(_v.TYPE_ERROR).setLifetime(5000).show();
			return;
		}

		filebrowser.refresh();
	}

	this.doAPIcall('remove', success, path);

	return this;
}

// refreshes the folder content by re-calling the API regarding the given path (this.location)
_a.filebrowser.FileBrowser.prototype.refresh = function() {
	var filebrowser = this;

	// success callback
	var success = function(data) {
		var api = (data != '') ? JSON.parse(data) : null;
		filebrowser.api = api;

		if(api == null || !api.success || !api.readable) {
			new _v.Notice().setContent('Couldn\'t refresh!').setType(_v.TYPE_ERROR).setLifetime(10000).show();
			return;
		}

		filebrowser.location = api.path_abs;
		filebrowser.render();
	}

	// do the APIcall
	this.doAPIcall('dir', success, this.location);

	return this;
}

// browses to the given path
_a.filebrowser.FileBrowser.prototype.browse = function(path) {
	this.history_back.push(this.location);
	this.history_forw = new Array();
	this.location = path;
	this.refresh();

	return this;
}

// destroys the file browser
_a.filebrowser.FileBrowser.prototype.destroy = function() {
	while(this.files.length != 0) {
		this.files.pop().destroy();
	}

	// removes the file browser from the filebrowsers reference array
	for(var i = 0; i < _a.filebrowser.filebrowsers.length; i++) {
		if(_a.filebrowser.filebrowsers[i].id === this.id) {
			_a.filebrowser.filebrowsers.splice(i, 1);
			break;
		}
	}

	this.contextmenu.destroy();
}


/*
================
Execute
================
*/
_a.filebrowser.app = new _a.App('filebrowser', 'File Browser');
_a.filebrowser.app
	.onLaunch(function() {
		var filebrowser = new _a.filebrowser.FileBrowser();
		new _w.Window('File Browser', this.icon, 100, 100, 700, 500)
			.setContent(filebrowser.element)
			.highcentralize()
			.onClose(function() {
				filebrowser.destroy();
			});
	})
	.setAuthor('Haris', 'haris2201@gmail.com', 'twitter.com/hariscolt')
	.setVersion('0.1');

DeskUI.core.import(_a.filebrowser.app.path+'filebrowser.css');