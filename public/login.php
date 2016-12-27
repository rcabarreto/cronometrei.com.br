<?php
 
require_once( 'assets/Facebook/FacebookSession.php' );
require_once( 'assets/Facebook/FacebookRedirectLoginHelper.php' );
require_once( 'assets/Facebook/FacebookRequest.php' );
require_once( 'assets/Facebook/FacebookResponse.php' );
require_once( 'assets/Facebook/FacebookSDKException.php' );
require_once( 'assets/Facebook/FacebookRequestException.php' );
require_once( 'assets/Facebook/FacebookAuthorizationException.php' );
require_once( 'assets/Facebook/FacebookJavaScriptLoginHelper.php' );
require_once( 'assets/Facebook/GraphObject.php' );
 
use Facebook\FacebookSession;
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookResponse;
use Facebook\FacebookSDKException;
use Facebook\FacebookRequestException;
use Facebook\FacebookAuthorizationException;
use Facebook\FacebookJavaScriptLoginHelper;
use Facebook\GraphObject;

 
FacebookSession::setDefaultApplication('387506448107274', 'ab6b94ee2dc774bd576f28d5e37326e7');
 
session_start();
//check for existing session and validate it
if (isset($_SESSION['token'])) {
  $session = new FacebookSession($_SESSION['token']);
  if (!$session->Validate('387506448107274', 'ab6b94ee2dc774bd576f28d5e37326e7')) {
    unset($session);
  }
}
 
//get new session
if (!isset($session)) {
  try {
    $helper = new FacebookJavaScriptLoginHelper();
    $session = $helper->getSession();
    $_SESSION['token'] = $session->getToken();
  } catch(FacebookRequestException $e) {
    unset($session);
    echo $e->getMessage();
  }
}
 
//do some api stuff
if (isset($session)) {
  $me = (new FacebookRequest(
    $session, 'GET', '/me'
  ))->execute()->getGraphObject(GraphUser::className());
  echo $me->getName();
}
 

?>	