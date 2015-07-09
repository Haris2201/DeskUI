<?php require_once('deskui.php'); if(\DeskUI\getUser() === false) header('Location: login.php'); else \DeskUI\loadApps() ?>
<!DOCTYPE html>
<html>
	<head>
		<title>DeskUI</title>

		<meta charset="UTF-8"/>

		<link rel="stylesheet" type="text/css" href="css/deskui.css"/>
		<link rel="stylesheet" type="text/css" href="css/deskui.app.css"/>
		<link rel="stylesheet" type="text/css" href="css/deskui.menu.css"/>
		<link rel="stylesheet" type="text/css" href="css/deskui.widget.css"/>
		<link rel="stylesheet" type="text/css" href="css/deskui.window.css"/>

		<script type="text/javascript" src="scripts/jquery.min.js"></script>
		<script type="text/javascript" src="scripts/deskui.js"></script>
		<script type="text/javascript" src="scripts/deskui.app.js"></script>
		<script type="text/javascript" src="scripts/deskui.core.js"></script>
		<script type="text/javascript" src="scripts/deskui.menu.js"></script>
		<script type="text/javascript" src="scripts/deskui.widget.js"></script>
		<script type="text/javascript" src="scripts/deskui.window.js"></script>
		<script type="text/javascript">
			var _d = DeskUI;

			var _a = DeskUI.app;
			var _c = DeskUI.core;
			var _m = DeskUI.menu;
			var _v = DeskUI.widget;
			var _w = DeskUI.window;
		</script>
		<?php \DeskUI\getHeader() ?>
	</head>
	<body>
		<section id="apps">
			<!-- dynamicly generated -->
		</section>
		<section id="windows">
			<!-- dynamicly generated --> 
		</section>
		<section id="mindows">
			<!-- dynamicly generated --> 
		</section>
		<section id="menus">
			<!-- dynamicly generated -->
		</section>
		<section id="widgets">
			<!-- dynamicly generated -->
		</section>
	</body>
</html>