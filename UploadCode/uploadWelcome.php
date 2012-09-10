<!DOCTYPE HTML>
<html>
<head>
<meta charset="UTF-8" />
    <title>Rashomon Project Video Upload</title>
    <link href='http://fonts.googleapis.com/css?family=Wire+One'
    rel='stylesheet' type='text/css' async="async" />
    <link href='http://fonts.googleapis.com/css?family=Fredoka+One|Just+Me+Again+Down+Here'
    rel='stylesheet' type='text/css' />
    <link type="text/css" href="css/ui-lightness/jquery-ui-1.8.23.custom.css" rel="Stylesheet" />  
</head>
<body>
<header id="main">
<span id="project">Video Upload Form</span>
</header>

<div id="introPiece">
<p>Welcome to the Rashomon Project Video Upload Page.  Please complete the form below:</p>
</div>
<div id="uploadForm">
  <form action="uploadHandler.php" method="post" enctype="multipart/form-data">
    <label for="file">Filename:</label>
    <input type="file" required="required" name="file" id="file" />
    <input type="submit" />
  </form>
</body>
</html>
