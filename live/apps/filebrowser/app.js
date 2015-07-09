/**
 * File Browser
 */

/**
 * @namespace
 */
_a.filebrowser = {};

// latest given ID to a file browser
_a.filebrowser.latestID = 0;

// for clipboard functionalities
_a.filebrowser.clipboard = null;
_a.filebrowser.clipboard_cut = false;

// drag
_a.filebrowser.drag = function(event, file) {
	event.originalEvent.dataTransfer.setData('filebrowser', file.filebrowser.id);
	event.originalEvent.dataTransfer.setData('path', file.path);
}

// drop
_a.filebrowser.drop = function(event, file) {
	var filebrowserID = event.originalEvent.dataTransfer.getData('filebrowser');
	var path = event.originalEvent.dataTransfer.getData('path');
	if(filebrowserID == filebrowser.id) return false;
	filebrowser.dropFile(path);
}

// drop over
_a.filebrowser.dragOver = function(event) {
	event.preventDefault();
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
		})
		.addItem('Cut', function(){
			_a.filebrowser.clipboard = file;
			_a.filebrowser.clipboard_cut = true;
		})
		.addItem('Copy', function(){
			_a.filebrowser.clipboard = file;
			_a.filebrowser.clipboard_cut = false;
		})
		.addSeparator()
		.addItem('Delete', function() {file.remove()});

	this.element.on('dragstart', function(event) {
		_a.filebrowser.drag(event, file);
	});

	this.remove = function() {
		this.filebrowser.remove(this);
	}

	this.destroy = function() {
		this.contextmenu.destroy();
	}
}

// file browser class
_a.filebrowser.FileBrowser = function() {
	this.id = _a.filebrowser.currentID++;
	this.location = '';
	this.content = new Array();
	this.history_back = new Array();
	this.history_forw = new Array();
	this.files = new Array();
	this.api = '';

	this.element = $('<section class="filebrowser" id="filebrowser-'+this.id+'"><section class="filebrowser-navigation"><button class="back">&lt;</button><button class="forward">&gt;</button><button class="refresh"></button><button class="up"></button><button class="grid"></button><button class="list"></button><div class="filebrowser-location"></div></section><section class="filebrowser-content grid"></section></section>');

	var fB = this;

	this.element.find('> section.filebrowser-navigation > button.back').click(function() {
		fB.history_forw.push(fB.location);
		fB.location = fB.history_back.pop();
		fB.refresh();
	});

	this.element.find('> section.filebrowser-navigation > button.forward').click(function() {
		fB.history_back.push(fB.location);
		fB.location = fB.history_forw.pop();
		fB.refresh();
	});

	this.element.find('> section.filebrowser-navigation > button.up').click(function() {
		fB.browse(fB.api.path_up);
	});

	this.element.find('> section.filebrowser-navigation > button.refresh').click(function() {
		fB.refresh(fB.location);
	});

	this.element.find('> section.filebrowser-navigation > button.grid').click(function() {
		fB.element.find('> section.filebrowser-navigation > button.grid').css('display', 'none');
		fB.element.find('> section.filebrowser-navigation > button.list').css('display', 'inline-block');
		fB.element.find('> section.filebrowser-content').removeClass('list').addClass('grid');
	});

	this.element.find('> section.filebrowser-navigation > button.list').click(function() {
		fB.element.find('> section.filebrowser-navigation > button.grid').css('display', 'inline-block');
		fB.element.find('> section.filebrowser-navigation > button.list').css('display', 'none');
		fB.element.find('> section.filebrowser-content').removeClass('grid').addClass('list');
	});

	this.element.find('> section.filebrowser-content')
		.on('dragover', _a.filebrowser.dragOver)
		.on('drop', function(event) {
			_a.filebrowser.drop(event, fB);
		});

	this.contextmenu = new _m.ContextMenu()
		.addItem('Back', function() {if(fB.history_back.length != 0) fB.element.find('> section.filebrowser-navigation > button.back').click(); else new _v.Notice().setType(_v.TYPE_WARNING).setContent('Couldn\'t go back!').setLifetime(3000).show()})
		.addItem('Forward', function() {if(fB.history_forw.length != 0) fB.element.find('> section.filebrowser-navigation > button.forward').click(); else new _v.Notice().setContent('Couldn\'t go forward!').setType(_v.TYPE_WARNING).setLifetime(3000).show()})
		.addItem('Refresh', function() {this.element.find('> section.filebrowser-navigation > button.refresh').click()})
		.addSeparator()
		.addItem('Paste', function() {
			fB.paste();
		})
		.assign(this.element.find('> section.filebrowser-content'));


	this.render = function() {
		while(this.files.length != 0) {
			this.files.pop().destroy();
		}

		(this.history_back.length == 0) ? this.element.find('> section.filebrowser-navigation > button.back').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.back').attr('disabled', false);
		(this.history_forw.length == 0) ? this.element.find('> section.filebrowser-navigation > button.forward').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.forward').attr('disabled', false);
		(this.api.path_up == this.api.path_abs) ? this.element.find('> section.filebrowser-navigation > button.up').attr('disabled', true) : this.element.find('> section.filebrowser-navigation > button.up').attr('disabled', false);

		var path = '';
		this.element.find('> section.filebrowser-navigation > div.filebrowser-location').html('');
		for(var i = 0; i < this.api.path.length; i++) {
			path += this.api.path[i] + '/';
			var nE = new _a.filebrowser.NavigationElement(this.api.path[i], path, this);
			this.element.find('> section.filebrowser-navigation > div.filebrowser-location').append(nE.element);
		}

		this.element.find('> section.filebrowser-content').html('');
		for(var i = 0; i < this.api.content.length; i++) {
			var file = new _a.filebrowser.File(this.api.content[i], this);
			this.element.find('> section.filebrowser-content').append(file.element);
			this.files.push(file);
		}

		return this;
	}

	this.getAPI = function(path) {
		var dataObject = new Object();
		dataObject.path = path;

		var apicall = '{"path_abs":"C:\/xampp\/htdocs\/DeskUI_rev\/apps\/filebrowser","path_up":"C:\/xampp\/htdocs\/DeskUI_rev\/apps","readable":true,"path":["C:","xampp","htdocs","DeskUI_rev","apps","filebrowser"],"content":[{"name":"app.js","readable":true,"dir":false},{"name":"app.png","readable":true,"dir":false},{"name":"filebrowser.css","readable":true,"dir":false},{"name":"filebrowser.php","readable":true,"dir":false},{"name":"images","readable":true,"dir":true}]}';

		console.log(apicall);	//////////////// DELETE PLS

		if(apicall != '')
			this.api = JSON.parse(apicall);

		return this;
	}

	this.download = function(file) {
		var e = $('<iframe style="display:none" src="./apps/filebrowser/filebrowser.php?download=true&path='+file.path+'"></iframe>');
		$('body').append(e);
		window.setTimeout(function() {
			e.remove();
		}, 5000);

		return this;
	}

	this.paste = function() {
		if(_a.filebrowser.clipboard === null) {
			new _v.Notice().setContent('There was nothing to paste!').setType(_v.TYPE_WARNING).setLifetime(3000).show();
		}
		else {
			if(_a.filebrowser.clipboard_cut === true)
				new _v.Notice().setContent('Couldn\'t move '+_a.filebrowser.clipboard.name+' here!').setType(_v.TYPE_ERROR).setLifetime(3000).show();
			else
				new _v.Notice().setContent('Couldn\'t copy '+_a.filebrowser.clipboard.name+' here!').setType(_v.TYPE_ERROR).setLifetime(3000).show();
		}
	}

	this.remove = function(file) {
		var dataObject = new Object();
		dataObject.file = file.path;
		dataObject.remove = 'true';

		var apicall = $.ajax({
			type:	'POST',
			data:	dataObject,
			url:	'./apps/filebrowser/filebrowser.php',
			async:	false
		});

		console.log(apicall);

		this.refresh();

		return this;
	}

	this.dropFile = function(path) {
		var dataObject = new Object();
		dataObject.path = this.location;
		dataObject.file = path;
		dataObject.copy = 'true';

		var apicall = $.ajax({
			type:	'POST',
			data:	dataObject,
			url:	'./apps/filebrowser/filebrowser.php',
			async:	false
		}).responseText;

		console.log(apicall);

		this.refresh();
	}

	this.refresh = function() {
		this.getAPI(this.location);

		if(!this.api.readable) {
			new _v.Notice().setContent('Couldn\'t browse to the give path ('+this.api.path_abs+')').setType(_v.TYPE_ERROR).setLifetime(10000).show();

			return this;
		}

		this.location = this.api.path_abs;

		this.render();

		return this;
	}

	this.browse = function(path) {
		this.history_back.push(this.location);
		this.history_forw = new Array();
		this.location = path;
		this.refresh();

		return this;
	}

	this.destroy = function() {
		while(this.files.length != 0) {
			this.files.pop().destroy();
		}

		this.contextmenu.destroy();
	}

	this.refresh();
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
