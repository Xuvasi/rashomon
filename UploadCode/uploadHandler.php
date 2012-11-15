<?php
$allowedExts = array("mov", "MOV", "mp4", "mpeg", "qt", "wmv");
$extension = end(explode(".", $_FILES["file"]["name"]));
if (($_FILES["file"]["size"] < 3000000) && in_array($extension, $allowedExts)) {
  if ($_FILES["file"]["error"] > 0) {
      echo "There was an error uploading your file";
      } else {
      	echo "Upload: " . $_FILES["file"]["name"] . "<br />";
	echo "Type : " . $_FILES["file"]["type"] . " <br />";
	echo "Size : " . ($_FILES["file"]["size"] / 1048576) . " Mb<br />";
	echo "Stored in: " . $_FILES["file"]["tmp_name"] . " <br />";

	if (file_exists("uploads/" . $_FILES["file"]["name"])) {
	   echo $_FILES["file"]["name"] . " already exists. ";
	}
	else
	{
	echo shell_exec("exiftool -a -j -w .json " . $_FILES["file"]["name"]);
	$eventName = "Rashomon_Event";
	$id = uniqid($eventName);
	$newFileName = $id . "." . $extension;
	rename(array_shift(explode(".", $_FILES["file"]["name"])) . "." . "json", $id . "." . "json");
	if (move_uploaded_file($_FILES["file"]["tmp_name"], $newFileName)) {
	   echo "Successful move";
	   } else {
	   echo "Unsuccessful move";
	   }
	echo "Stored in: " . $newFileName . "<br />";
	/* Strip metadata into a new copy of the video before sending to youtube and then delete the video, but hold onto the link */
	$metaCleanFileName = "cleanMeta" . $newFileName;
	copy($newFileName, $metaCleanFileName);
	shell_exec("ffmpeg -i $newFileName -vcodec copy -acodec copy $metaCleanFileName");
	echo exec("python autoYoutubeUploader/youtube_upload/youtube_upload.py --email=grerobertsg@gmail.com --password=rashomontest --title='$newFileName' --description='My Test Upload' --category=Music --keywords='test, video' " . $metaCleanFileName);

	unlink($metaCleanFileName);
	
	/*$to = "gdroberts@berkeley.edu";
	$subject = "Video";
	$body = "Your video was uploaded";
	mail($to, $subject, $body);*/
	
}

}
}
else {
     echo "The file is invalid";
}	
?>