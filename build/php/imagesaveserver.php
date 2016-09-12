<?php

$img = $_POST['image']; // Your data 'data:image/png;base64,AAAFBfj42Pj4';
$name = $_POST['name'];

if( isset($_POST['image']) && ( $img != '' ) && isset($_POST['name']) && ( $name != '' )){
    $img = str_replace('data:image/png;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);
    // $date = new DateTime();
    // $now = $date ->getTimestamp(); 
    if( file_put_contents('../img/userportraits/'.$name.'.png', $data) !== false ){
        echo('0');
    }
}else{
    echo($img);
}
?>