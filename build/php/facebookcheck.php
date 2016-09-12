<?php

    // FACEBOOK
    if( $_SERVER['HTTP_USER_AGENT'] ){
      
        if (strpos($_SERVER['HTTP_USER_AGENT'],'facebookexternalhit') !== false || strpos($_SERVER['HTTP_USER_AGENT'],'google') !== false) {
            
            $PAGE = $_SERVER['REQUEST_URI'];
            $nodeName = "";
            $domainURL = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https' : 'http') . '://' . $_SERVER['SERVER_NAME'];

            // Sets the variables to use later
            if( strpos($_SERVER['REQUEST_URI'],'si-picasso-etait') !== false || strpos($_SERVER['REQUEST_URI'],'waere-picasso-ein') !== false  ){
                $nodeName = "facebook_module1";
            }
            else if( strpos($_SERVER['REQUEST_URI'],'autoportrait') !== false || strpos($_SERVER['REQUEST_URI'],'selbstportraet') !== false ){
                $nodeName = "facebook_module2";
            }
            else if( strpos($_SERVER['REQUEST_URI'],'si-picasso-m-etait-reinvente') !== false || strpos($_SERVER['REQUEST_URI'],'picasso-neu-interpretiert') !== false ){
                $nodeName = "facebook_module3";
            }
            else if( strpos($_SERVER['REQUEST_URI'],'tous-les-films') !== false || strpos($_SERVER['REQUEST_URI'],'alle-filme-sehen') !== false ){
                $nodeName = "facebook_module4";
            }else{
                $nodeName = "facebook_home";
            }

            ?>
            <html class="no-js" xmlns:og="http://ogp.me/ns#">
                <head>
                    <meta charset="utf-8">

                    <title><?php echo($json["social"][$nodeName]["title"]); ?></title>
                    <meta name="description" content="<?php echo($json["social"][$nodeName]["description"]); ?>">
                    <meta name="keywords" content="<?php echo($json["website"]["keywords"]); ?>">
                    
                    <!-- FB stuff -->
                    <meta property="og:title" content="<?php echo($json["social"][$nodeName]["title"]); ?>">
                    <meta property="og:url" content="<?php echo($_SERVER['SCRIPT_URI']); ?>">
                    <meta property="og:image" content="<?php echo($base); ?>/img/share/<?php echo($json["social"][$nodeName]["picture"]); ?>">
                    <meta property="og:site_name" content="<?php echo($json["website"]["title"]); ?>">
                    <meta property="og:description" content="<?php echo($json["social"][$nodeName]["description"]); ?>">
                    <meta property="og:type" content="website"/>

                     <!-- microdata (google plus) metadata -->
                    <meta itemprop="name" content="<?php echo($json["social"][$nodeName]["title"]); ?>" />
                    <meta itemprop="description" content="<?php echo($json["social"][$nodeName]["description"]); ?>" />
                    <meta itemprop="image" content="<?php echo($base); ?>/img/share/<?php echo($json["social"][$nodeName]["picture"]); ?>" />
                 
                </head>
                <body itemscope itemtype="http://schema.org/Product">
                    <h1 itemprop="name"><?php echo($json["social"][$nodeName]["title"]); ?></h1>
                    <img itemprop="image" src="<?php echo($base); ?>/img/share/<?php echo($json["social"][$nodeName]["picture"]); ?>" />
                    <p itemprop="description"><?php echo($json["social"][$nodeName]["description"]); ?></p>
                </body>

            </html>

            <?php

            exit();
        }

    }

?>