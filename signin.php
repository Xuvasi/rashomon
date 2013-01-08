<?

$url = 'https://verifier.login.persona.org/verify';
$assertion = $_POST['assertion'];
//$assertion = "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjdkZjc2NDVmNDdjNWVlYTVjZGMyOGQ3N2E3M2Y3MzEyOWM0ZDY1ZTU3MmY2OWFiMWMyNzEzYTJmYzgwNjM3MzFmMDBmMTkxMWFmYzEyMDUwZmI5ZjEzMGJmNmNhOWY2MmZlZWE2NmJkYzI2NzQwNzFiZWQxODdmMWExNTBkOGU0NzRjYjBiZGRkY2JlNzJlOTJhZmJjZTIxYmM4MzA2NGRjNTVhYjhmMzMwMjUwNzI3ODRiNDRmYjFiOTE2MTM0ZmIzMDIzZjllYTA2NjkwODBkYjU2NWI5MzI4ZDAzYjYwZWZlZjZkZjBiM2U4MTI5NmJkMTJjOTliYjY1NWUxZiIsInAiOiJmZjYwMDQ4M2RiNmFiZmM1YjQ1ZWFiNzg1OTRiMzUzM2Q1NTBkOWYxYmYyYTk5MmE3YThkYWE2ZGMzNGY4MDQ1YWQ0ZTZlMGM0MjlkMzM0ZWVlYWFlZmQ3ZTIzZDQ4MTBiZTAwZTRjYzE0OTJjYmEzMjViYTgxZmYyZDVhNWIzMDVhOGQxN2ViM2JmNGEwNmEzNDlkMzkyZTAwZDMyOTc0NGE1MTc5MzgwMzQ0ZTgyYTE4YzQ3OTMzNDM4Zjg5MWUyMmFlZWY4MTJkNjljOGY3NWUzMjZjYjcwZWEwMDBjM2Y3NzZkZmRiZDYwNDYzOGMyZWY3MTdmYzI2ZDAyZTE3IiwicSI6ImUyMWUwNGY5MTFkMWVkNzk5MTAwOGVjYWFiM2JmNzc1OTg0MzA5YzMiLCJnIjoiYzUyYTRhMGZmM2I3ZTYxZmRmMTg2N2NlODQxMzgzNjlhNjE1NGY0YWZhOTI5NjZlM2M4MjdlMjVjZmE2Y2Y1MDhiOTBlNWRlNDE5ZTEzMzdlMDdhMmU5ZTJhM2NkNWRlYTcwNGQxNzVmOGViZjZhZjM5N2Q2OWUxMTBiOTZhZmIxN2M3YTAzMjU5MzI5ZTQ4MjliMGQwM2JiYzc4OTZiMTViNGFkZTUzZTEzMDg1OGNjMzRkOTYyNjlhYTg5MDQxZjQwOTEzNmM3MjQyYTM4ODk1YzlkNWJjY2FkNGYzODlhZjFkN2E0YmQxMzk4YmQwNzJkZmZhODk2MjMzMzk3YSJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiJhcGhpZEB1Y3NjLmVkdSJ9LCJpYXQiOjEzNTQ1NzcxNjcyMzIsImV4cCI6MTM1NDY2MzU2NzIzMiwiaXNzIjoibG9naW4ucGVyc29uYS5vcmcifQ.LBJ2Fd0dB0PjxvVVgnlDYzIjpMQqflpkcaf167wdHp0zt8iLljPyWdjpyX00Ds3y7nPBeLdCC5i0VxZ38NcKajsYa_GN8ZuHfVInX0Tg0CWbCy4LbE1OZY7cpXyM6DcV06xnWUrr0cxQ9HW8Niy5t7-xu9tDDz2V8khym9TFw0okD0wd2v3n5G_9aNp5Vb3LXUmJ56B1WoMXmcI7DmWMCw5yaNhym_ByiHRbNsNxCKfgi78osBIJ8siF_1zUXG2JZI2XMKa3jrazmtiPJ81zDzz-655thrjQWxT2VTQ9eOBHLqqO88JThfBg5ykuBEqKuK_g72HOrfSK1KHUg2LEaw~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjEzNTQ1Nzc4OTcwNTksImF1ZCI6Imh0dHA6Ly9yYXNob21vbnByb2plY3Qub3JnIn0.L33SVTbKr7nICZuhttlMtV8Tt43hJ5-qGYrWWZT_ngUEPXHBiyyJCA";

$body = "assertion=$assertion&audience=rashomonproject.org";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);


$json = json_decode($result);

if ($json->status == 'okay') {
   setcookie("rashomon_email", $json->email);
   $response['status'] = "okay";
   $response['expires'] = $json->expires;
   $response['email'] = $json->email;
   echo json_encode($response);
   exit;

} else {
     $response['status'] = $json->status;
     echo json_encode($response);
}

//echo $result;
?>
