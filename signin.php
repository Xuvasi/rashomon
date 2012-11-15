<?

$url = 'https://verifier.login.persona.org/verify';
/*
$data = http_build_query(array('assertion' => $_POST['assertion'], 'audience' => urlencode('rashomonproject.org')));

$params = array(
    'http' => array(
        'method' => 'POST',
        'content' => $data,
        'header'=> "Content-type: application/x-www-form-urlencoded\r\n"
            . "Content-Length: " . strlen($data) . "\r\n"
    )
);
    
$ctx = stream_context_create($params);
$fp = fopen($url, 'rb', false, $ctx);

*/
$assertion = $_POST['assertion'];
$body = "assertion=$assertion&audience=rashomonproject.org";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);



$json = json_decode($result);

if ($json->status == 'okay') {
   $_SESSION['email'] = $json->email;
   echo json_encode($json->email, TRUE);
   exit;

} else {
  // log in failed.
}

echo $result;
?>