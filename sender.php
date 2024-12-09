<?php
//Include the database configuration file
require 'dbConfig.php';

if (!empty($_FILES['file'])) {
    $targetDir = 'uploads/';
    $filename = basename($_FILES['file']['name']);
    $targetFilePath = $targetDir . $filename;

    //Upload file to server
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFilePath)) {
        $insert = $db->query("INSERT INTO files (file_name, uploaded_on) VALUES ('" . $filename . "', NOW())");

        if ($insert) {
            //Return the file URL
            $fileUrl = 'http://localhost:84/startupTaskDragUploadWidget/' . $targetFilePath; // Replace with your actual domain
            echo json_encode(['success' => true, 'fileUrl' => $fileUrl]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Database error']);
        }
    }
}
$db->close();
?>