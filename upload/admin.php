<?
require('config.php');
//error_reporting(E_ALL); ini_set('display_errors', '1');

session_start();
session_name("Rashomon");


$uploaddir = '/home/aphid/rashomonuploads/incoming/';
$redacteddir = '/home/aphid/rashomonuploads/redacted/';

if ($_POST['task'] == "login"){


    //check assertion
    $assert = checkAssertion($_POST['assertion'], $persona_audience);
    if ($assert->status != "okay"){
        die(json_encode("Nope!"));
    } else {
        if (!in_array($assert->email, $admin_email)){
            
            die(json_encode("Not Authorized"));
        }
    }
    $_SESSION['email'] = $assert->email;
    session_write_close();


    $m = new MongoClient("$monguri");
    $db = $m->rashomon;
    $collection = $db->media;
    $query = $collection->find();
    $media = array();
    foreach ($query as $item) {
        $media[]= $item;
    }
    echo json_encode($media);

    
} else if ($_POST['task'] == 'delete'){

    if (in_array($assert->email, $admin_email)){
        $fileid = $_POST['name'];
        if ($fileid != strtolower(preg_replace('/[^a-z0-9-]+/i', '-', $fileid)))
            {
            $response['status'] = "fail";
            echo json_encode($response);
            die();
            };
        $m = new MongoClient("$monguri");
        $db = $m->rashomon;
        $collection = $db->media;
        $article = $collection->findOne(array('name' => "$fileid"));
        $ext = $article['ext'];
        $article = $collection->remove(array('name' => $fileid), array("justOne" => true));
        if (is_file($uploaddir .$fileid .$ext)){
            unlink($uploaddir .$fileid .$ext);
        } else {
            $response['warning'] = "Couldn't find uploaded file";
        }
        if (is_file($redacteddir .$fileid .$ext)){
            unlink($redacteddir .$fileid .$ext);
        } else {
            $response['warning'] = "Couldn't find redacted file";
        }

        
        $response['status'] = "successfully deleted " .$fileid;
        echo json_encode($response);
    } else {
        die("Nope!");
    }
    
} else if ($_POST['task'] == 'create'){

    if (!in_array($assert->email, $admin_email)){
        die("NOPE!");
    }
    $clips = $_POST['use'];
    $m = new MongoClient("$monguri");
    $db = $m->rashomon;
    $collection = $db->media;
    $query = $collection->find();
    $media = array();
    foreach ($clips as $clip){
        $name = $clip['name'];
        $time = $clip['time'];
        $article = $collection->findOne(array('name' => "$name"));
        if ($article['name'] == $clip['name']){
            writeMeta($clip['name'], $clip['time']);
        }
    }

        
    


} else if ($_POST['task'] == 'resync'){

    
    if (!in_array($assert->email, $admin_email)){
        die("NOPE!");
    }
    $earliest = $_POST['data']['earliest'];
    $file = $metaDir ."istanbul.json";
    $json = json_decode(file_get_contents($file));
    $json->earliest = $earliest;
    foreach($json->videos as $video){
        foreach($_POST['data']['vids'] as $vid){
            if ($video->name == $vid['name']){
                $video->offset = $vid['offset'];
                if ($vid['duration']){
                    $video->duration = $vid['duration'];
                }
            }
        }
    }
    $fp = fopen($file, 'w');
    fwrite($fp, format_json(json_encode($json)));
    fclose($fp);
}

function writeMeta($name, $clip){



}

//this is kludgey because we were originally checking this from a separate server
function checkAssertion($assertion, $persona_audience){
            $url = 'https://verifier.login.persona.org/verify';
            $body = "assertion=$assertion&audience=$persona_audience";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            curl_close($ch);


            $json = json_decode($result);

            if ($json->status == 'okay') {
               return $json;

            } else {
             return $result;
            }
    }

function format_json($json, $html = false) {
$tabcount = 0;
$result = '';
$inquote = false;
$ignorenext = false;
 
if ($html) {
$tab = "&nbsp;&nbsp;&nbsp;";
$newline = "<br/>";
} else {
$tab = "\t";
$newline = "\n";
}
 
for($i = 0; $i < strlen($json); $i++) {
$char = $json[$i];
 
if ($ignorenext) {
$result .= $char;
$ignorenext = false;
} else {
switch($char) {
case '{':
$tabcount++;
$result .= $char . $newline . str_repeat($tab, $tabcount);
break;
case '}':
$tabcount--;
$result = trim($result) . $newline . str_repeat($tab, $tabcount) . $char;
break;
case ',':
$result .= $char . $newline . str_repeat($tab, $tabcount);
break;
case '"':
$inquote = !$inquote;
$result .= $char;
break;
case '\\':
if ($inquote) $ignorenext = true;
$result .= $char;
break;
default:
$result .= $char;
}
}
}
 
return $result;
}

?>
