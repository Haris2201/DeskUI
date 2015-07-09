<?php

namespace DeskUI;

require_once('config.php');

define('DESKUI_PATH_ABS',		dirname(__FILE__) . '/');
define('DESKUI_PATH_APPS',		DESKUI_PATH_ABS . 'apps/');

session_start();

$apps = array();

function loadApps() {
	if(is_dir(DESKUI_PATH_APPS) && is_readable(DESKUI_PATH_APPS)) {
		$dirs = scandir(DESKUI_PATH_APPS);
		foreach($dirs as $dir) {
			if($dir != '.' && $dir != '..') {
				loadApp($dir . '/');
			}
		}
	}
}

function loadApp($path) {
	global $apps;
	if(is_dir(DESKUI_PATH_APPS . $path) && is_readable(DESKUI_PATH_APPS . $path) && file_exists(DESKUI_PATH_APPS . $path . 'app.js')) {
		array_push($apps, 'apps/' . $path . 'app.js');
	}
}

function getHeader() {
	global $apps;
	foreach($apps as $app) {
		echo "\n\t\t".'<script type="text/javascript" src="'.$app.'"></script>'."\n";
	}
}

function security() {
	if(isset($_SESSION['DESKUI_SESSION_USER']) && $_SESSION['DESKUI_SESSION_USER'] == 'admin')
		return true;
	else
		die();
}

function login($username, $password) {
	if($username !== 'admin') return false;
	if(hash('sha256', $password) != DESKUI_SECURITY_PASSWORD) return false;
	$_SESSION['DESKUI_SESSION_USER'] = $username;
	return true;
}

function getUser() {
	if(!isset($_SESSION['DESKUI_SESSION_USER']))
		return false;
	else 
		return	$_SESSION['DESKUI_SESSION_USER'];
}

?>