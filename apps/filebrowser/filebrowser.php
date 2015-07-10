<?php

require_once('../../deskui.php');

\DeskUI\security();

$response = array();
$response['success'] = false;

// arg0 = action
// arg1..argN = arguments for the action

/*

	action		arg1		  arg2
------------+------------+------------
  download	|  filepath  |     ---
    copy	|  filepath  |  new path
   remove   |   path	 |	   ---
*/

if(isset($_GET['arg0']) && $_GET['arg0'] != '') {
	if($_GET['arg0'] == 'dir') {
		// directory content
		if(isset($_POST['arg1']) && $_POST['arg1'] != '') {
			$realpath = realpath($_POST['arg1']);
			$response['path_abs'] = ($realpath === false) ? $_POST['arg1'] : $realpath;
		}
		else {
			$response['path_abs'] = dirname(__FILE__);
		}

		$response['path_abs'] = str_replace('\\', '/', $response['path_abs']);

		//bugfix for lowest level folders
		$response['path_abs'] = Rtrim($response['path_abs'], '/');

		$response['path_up'] = dirname($response['path_abs']);
		$response['path_up'] = str_replace('\\', '/', $response['path_up']);
		$response['path_up'] = Rtrim($response['path_up'], '/');

		$response['readable'] = is_readable($response['path_abs']);

		$response['path'] = array();

		$response['path'] = explode('/', $response['path_abs']);

		$response['content'] = array();

		$dirs = scandir($response['path_abs']);

		foreach($dirs as $dir) {
			if($dir == '.' || $dir == '..') continue;
			$temp = array();
			$temp['name'] = $dir;
			$temp['readable'] = is_readable($response['path_abs'] . '/' .$dir);
			$temp['dir'] = is_dir($response['path_abs'] . '/' .$dir);

			$response['content'][] = $temp;
		}

		$response['success'] = true;
	}
	else if($_GET['arg0'] == 'download') {
		// download
		if(isset($_GET['arg1']) && $_GET['arg1'] != '') {
			$file = $_GET['arg1'];
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
	}
	else if($_GET['arg0'] == 'copy') {
		// copy
		if(isset($_POST['arg1']) && $_POST['arg1'] != '' && isset($_POST['arg2']) && $_POST['arg2'] != '') {
			$response['success'] = copy($_POST['arg1'], $_POST['arg2'] . '/' . end(explode('/', $_POST['arg1'])));
		}
	}
	else if($_GET['arg0'] == 'remove') {
		// remove aka delete
		if(isset($_POST['arg1']) && $_POST['arg1'] != '') {
			if(is_dir($_POST['arg1'])) {
				$response['success'] = rmdir($_POST['arg1']);
			}
			else {
				$response['success'] = unlink($_POST['arg1']);
			}
		}
	}
}

echo json_encode($response);

?>