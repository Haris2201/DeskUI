_a.appmanager = new Object();

_a.appmanager.MODUS_LOCAL = 0;
_a.appmanager.MODUS_STORE = 1;

_a.appmanager.App = function(id, name, modus) {
	this.id = id;
	this.name = name;
	this.modus = modus;
	this.element = $('<div class="appmanager-app"><div class="progress"></div><img src="./apps/'+this.id+'/app.png" alt="'+this.id+'"/><h3>'+this.name+'</h3><aside><button class="update"></button><button class="uninstall"></button><button class="download"></button></aside></div>');

	var app = this;

	this.render = function() {
		if(this.modus == _a.appmanager.MODUS_LOCAL) {
			this.element.find('> aside > button.download').css('display', 'none');

			this.element.find('> aside > button.update').click(function() {
				app.progress(50); // TODO delete pls
				new _v.Notice().setContent(app.name + ' – Couldn\'t update app!').setLifetime(5000).setType(_v.TYPE_ERROR).show();
			});

			this.element.find('> aside > button.uninstall').click(function() {
				app.progress(0); // TODO delete pls
				new _v.Notice().setContent(app.name + ' – Couldn\'t uninstall app!').setLifetime(5000).setType(_v.TYPE_ERROR).show();
			});
		}
		else if(this.modus == _a.appmanager.MODUS_STORE) {
			this.element.find('> aside > button.update').css('display', 'none');
			this.element.find('> aside > button.uninstall').css('display', 'none');

			this.element.find('> aside > button.download').click(function() {
				new _v.Notice().setContent(app.name + ' – Couldn\'t download app!').setLifetime(5000).setType(_v.TYPE_ERROR).show();
			});
		}

		return this;
	}

	this.progress = function(percent) {
		this.element.find('> div.progress').css('width', percent+'%');
	}

	this.render();

	return this;
}

_a.appmanager.AppManager = function() {
	this.localapps = [];
	this.modus = _a.appmanager.MODUS_LOCAL;
	
	this.element = $('<section class="appmanager"><section class="appmanager-bar"><button class="local" disabled="true"></button><button class="store"></button><button class="search-update"></button><button class="search"></button><input type="search" class="search-field" placeholder="Search here..."/></section><section class="appmanager-apps"></section></section>');

	for(var i = 0; i < _a.apps.length; i++) {
		var app = _a.apps[i];
		this.localapps.push(new _a.appmanager.App(app.id, app.name, _a.appmanager.MODUS_LOCAL));
		this.element.find('> section.appmanager-apps').append(this.localapps[this.localapps.length - 1].element);
	}

	var AM = this;

	this.element.find('> section.appmanager-bar > button.local').click(function() {
		AM.setModus(_a.appmanager.MODUS_LOCAL);
	});

	this.element.find('> section.appmanager-bar > button.store').click(function() {
		AM.setModus(_a.appmanager.MODUS_STORE);
	});

	this.element.find('> section.appmanager-bar > button.search-update').click(function() {
		new _v.Notice().setContent('Couldn\'t find updates!').setLifetime(5000).setType(_v.TYPE_ERROR).show();
	});

	this.element.find('> section.appmanager-bar > input.search-field')
	.on('search', function() {
		AM.filterApps($(this).val());
	})
	.keydown(function() {
		AM.filterApps($(this).val());
	})
	.keyup(function() {
		AM.filterApps($(this).val());
	});

	this.setModus = function(modus) {
		this.modus = modus;
		this.render();

		return this;
	}

	this.filterApps = function(str) {
		this.element.find('> section.appmanager-apps > div.appmanager-app').each(function() {
			if($(this).find('> h3').html().toLowerCase().includes(str.toLowerCase())) 
				$(this).css('display', 'block');
			else
				$(this).css('display', 'none');
		});
	}

	this.render = function() {
		this.element.find('> section.appmanager-apps').html('');

		if(this.modus == _a.appmanager.MODUS_LOCAL) {
			this.element.find('> section.appmanager-bar > button.local').attr('disabled', true);
			this.element.find('> section.appmanager-bar > button.store').attr('disabled', false);

			for(var i = 0; i < this.localapps.length; i++) {
				this.element.find('> section.appmanager-apps').append(this.localapps[i].element);
				this.localapps[i].render();
			}
		}
		else if(this.modus == _a.appmanager.MODUS_STORE) {
			this.element.find('> section.appmanager-bar > button.local').attr('disabled', false);
			this.element.find('> section.appmanager-bar > button.store').attr('disabled', true);
		}
	}

	return this;
}

/*
================
Execute
================
*/
new _a.App('appmanager', 'App Manager')
	.onLaunch(function() {
		var appmanager = new _a.appmanager.AppManager();
		new _w.Window('App Manager', this.icon, 100, 100, 600, 400).setContent(appmanager.element).highcentralize();
	})
	.onLoad(function(){_c.import('apps/appmanager/appmanager.css')})
	.setAuthor('Haris', 'haris2201@gmail.com', 'twitter.com/hariscolt')
	.setVersion('0.1');