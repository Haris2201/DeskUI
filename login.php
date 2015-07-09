<?php

require_once('deskui.php');

if(\DeskUI\getUser() !== false) {
	header('Location: ./');
	die();
}

if(isset($_POST['username']) && isset($_POST['password'])) {
	\DeskUI\login($_POST['username'], $_POST['password']);
	header('Location: login.php');
	die();
}

\DeskUI\login('admin', '123456');

echo '<h1>Permission denied.</h1>';


?>