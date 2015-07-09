<?php

require_once('../../deskui.php');

\DeskUI\security();


$output = array();

// cd
if(isset($_POST['dir']) && $_POST['dir'] != '') {
	chdir($_POST['dir']);
}
else {
	chdir('../../');
}

// get home dir
$output['dir'] = getcwd();
$output['dir'] = str_replace('\\', '/', $output['dir']);
$output['dir'] = Rtrim($output['dir'], '/');

$output['output'] = array();

$return_var = '';

if(isset($_POST['cmd']) && $_POST['cmd'] != '') {
	exec($_POST['cmd'], $output['output'], $return_var);
}

if($return_var === 1)
	$output['output'] = htmlentities('Command couldn\'t be executed (' . $_POST['cmd'] .').' . "\n");
else
	$output['output'] = htmlentities(implode("\n",  $output['output'])) . "\n";

echo json_encode($output);

?>