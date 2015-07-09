<?php

require_once('../../deskui.php');

\DeskUI\security();

// DOWNLOAD
if(isset($_GET['download']) && $_GET['download'] == 'true' && isset($_GET['path']) && $_GET['path'] != '') {
	$file = $_GET['path'];
	if(file_exists($file)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename($file));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		readfile($file);
		exit;
	}
}

// COPY
if(isset($_POST['copy']) && $_POST['copy'] == 'true' && isset($_POST['path']) && $_POST['path'] != '' && isset($_POST['file']) && $_POST['file'] != '') {
	$name = end(explode('/', $_POST['file']));
	copy($_POST['file'], $_POST['path'] . '/' . $name);
	exit;
}

// DELETE
if(isset($_POST['remove']) && $_POST['remove'] == 'true' && isset($_POST['file']) && $_POST['file'] != '') {
	if(is_dir($_POST['file'])) {
		rmdir($_POST['file']);
	}
	else {
		unlink($_POST['file']);
	}
	exit;
}

$output = array();

if(isset($_POST['path']) && $_POST['path'] != '') {
	$realpath = realpath($_POST['path']);
	$output['path_abs'] = ($realpath === false) ? $_POST['path'] : $realpath;
}
else {
	$output['path_abs'] = dirname(__FILE__);
}

$output['path_abs'] = str_replace('\\', '/', $output['path_abs']);

//bugfix for lowest level folders
$output['path_abs'] = Rtrim($output['path_abs'], '/');

$output['path_up'] = dirname($output['path_abs']);
$output['path_up'] = str_replace('\\', '/', $output['path_up']);
$output['path_up'] = Rtrim($output['path_up'], '/');

$output['readable'] = is_readable($output['path_abs']);

$output['path'] = array();

$output['path'] = explode('/', $output['path_abs']);

$output['content'] = array();

$dirs = scandir($output['path_abs']);

foreach($dirs as $dir) {
	if($dir == '.' || $dir == '..') continue;
	$temp = array();
	$temp['name'] = $dir;
	$temp['readable'] = is_readable($output['path_abs'] . '/' .$dir);
	$temp['dir'] = is_dir($output['path_abs'] . '/' .$dir);

	$output['content'][] = $temp;
}

echo json_encode($output);

?>