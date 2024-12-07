<?php
//Include the database configuration file
require 'dbConfig.php';


if(!empty($_FILES['file'])){
    $targetDir = 'uploads/';
    $filename = basename($_FILES['file']['name']);
    $targetFilePath = $targetDir.$filename;


    //Upload file to server
    if(move_uploaded_file($_FILES['file']['tmp_name'],$targetFilePath)){
        //Insert file information in the database
        $insert = $db->query("INSERT INTO files (file_name, uploaded_on) VALUES ('".$filename."', NOW())");
    }
}
?>