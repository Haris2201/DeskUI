new _a.App('desk', 'Desk')
	.onLaunch(function(){
		var allMinimized = true;
		for(var i = 0; i < _w.windows.length; i++) {
			allMinimized = _w.windows[i].minimized && allMinimized;
		}
		if(allMinimized) {
			for(var i = 0; i < _w.windows.length; i++) {
				_w.windows[i].unminimize();
			}
		}
		else {
			for(var i = 0; i < _w.windows.length; i++) {
				_w.windows[i].minimize();
			}

		}
	})
	.setAuthor('Haris', 'haris2201@gmail.com', 'twitter.com/hariscolt')
	.setVersion('0.2')
	.element.css('position', 'absolute').css('bottom', '90px').css('right', '0');