/*
================
Terminal
================
*/

_a.terminal = new Object();

_a.terminal.Terminal = function() {
	this.history = new Array();
	this.api = {"dir":"C:\/xampp\/htdocs\/DeskUI","output":"\n"};
	this.dir = this.api.dir;
	this.history_pos = 0;
	this.output = "\
  _____            _      _    _   _____ \n\
 |  __ \\          | |    | |  | | |_   _|\n\
 | |  | | ___  ___| | __ | |  | |   | |  \n\
 | |  | |/ _ \\/ __| |/ / | |  | |   | |  \n\
 | |__| |  __/\\__ \\   <  | |__| |  _| |_ \n\
 |_____/ \\___||___/_|\\_\\  \\____/  |_____|\n\n";
	this.input = '';
	this.prompt = 'DeskUI>';
	this.element = $('<code class="terminal"><span class="terminal-output"></span><span class="terminal-prompt"></span><span class="terminal-input"></span><span class="terminal-cursor">&nbsp;</span><textarea class="terminal-event"></textarea></code>');

	var t = this;

	this.element.mouseup(function() {
		$(this).find('textarea.terminal-event').focus();
	});
	this.element.find('textarea.terminal-event')
		.keydown(function(event) {
			t.element.scrollTop(t.element[0].scrollHeight);
			if(event.which == 13) return false;
			if(event.which == 38) {
				event.preventDefault();
				if(t.history_pos <= -1) return false;
				t.history_pos--;
				if(typeof t.history[t.history_pos] == 'undefined') {
					$(this).val('');
				}
				else {
					$(this).val(t.history[t.history_pos]);
				}
			}
			if(event.which == 40) {
				event.preventDefault();
				if(t.history_pos >= t.history.length) return false;
				t.history_pos++;
				if(typeof t.history[t.history_pos] == 'undefined') {
					$(this).val('');
				}
				else {
					$(this).val(t.history[t.history_pos]);
				}
			}
			t.setInput($(this).val());
		})
		.keyup(function(event) {
			if(event.which == 13) {
				$(this).val('');
				t.send();
				return;
			}
			t.setInput($(this).val());
		});

	this.setInput = function(str) {
		this.input = str;
		this.render();

		return this;
	}

	this.send = function() {
		this.output += this.prompt + this.input + "\n";
		this.history.push(this.input);
		this.history_pos = this.history.length;

		if(this.input == 'cls' || this.input == 'clear') {
			this.output = '';
		}
		else if(this.input.indexOf('cd ') === 0) {
			var cd = this.input.substr(3);

			if(this.dir.slice(-1) != '/')
				this.dir += '/';

			if(cd.indexOf('./') == 0 || cd.indexOf('../') == 0 || cd.indexOf('.') == 0 || cd.indexOf('..') == 0) {
				this.dir += cd
			}
			else {
				this.dir = cd;
			}

			var dataObject = new Object();
			dataObject.dir = this.dir;
			this.api = {"dir":"C:\/xampp\/htdocs\/DeskUI","output":"\n"};
		}
		else {
			var dataObject = new Object();
			dataObject.cmd = this.input;
			dataObject.dir = this.dir;
			this.api = {"dir":"C:\/xampp\/htdocs\/DeskUI","output":"\n"};

			this.output += this.api.output;
		}

		this.input = '';
		this.render();
		this.element.scrollTop(this.element[0].scrollHeight);
		this.element.find('textarea.terminal-event').css('top', this.element[0].scrollHeight - this.element.find('textarea.terminal-event').height());

		console.log(this.api);
		return this;
	}

	this.render = function() {
		this.dir = this.api.dir;
		this.prompt = this.dir + '>';
		this.element.parent().find('span.terminal-output').html(this.output);
		this.element.parent().find('span.terminal-input').html(this.input);
		this.element.parent().find('span.terminal-prompt').html(this.prompt);

		return this;
	}

	this.destroy = function() {
		//
	}

	this.render();
}


/*
================
Execute
================
*/
new _a.App('terminal', 'Terminal')
	.onLaunch(function() {
		var terminal = new _a.terminal.Terminal();
		var w = new _w.Window('Terminal', this.icon, 100, 100, 700, 400).setContent(terminal.element);
		w.element.mouseup(function() {
			terminal.element.find('textarea.terminal-event').focus();
		});
		w.element.find('> section.content').css('background', 'transparent');

		terminal.render();
		terminal.element.find('textarea.terminal-event').focus();
	})
	.setAuthor('Haris', 'haris2201@gmail.com', 'twitter.com/hariscolt')
	.setVersion('0.2');
DeskUI.core.import('apps/terminal/terminal.css');