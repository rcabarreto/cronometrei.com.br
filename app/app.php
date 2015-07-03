<!DOCTYPE html>
<html lang="pt-br">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

	<meta name="description" content="Cronômetro online">
	<meta name="keywords" content="Cronômetro, Contador, Relógio, Tempo, Timer, Cronometer">
	<meta name="author" content="R3 Web Solutions">

	<title>Cronometrei</title>

	<link rel="stylesheet" type="text/css" href="assets/css/style.css" />
	<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	<!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
</head>

<body>

<script>

	function statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);
		// The response object is returned with a status field that lets the
		// app know the current login status of the person.
		// Full docs on the response object can be found in the documentation
		// for FB.getLoginStatus().
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			testAPI();
			console.log(response.authResponse.accessToken);
		} else if (response.status === 'not_authorized') {
			// The person is logged into Facebook, but not your app.
			document.getElementById('status').innerHTML = 'Please log into this app.';
		} else {
			// The person is not logged into Facebook, so we're not sure if
			// they are logged into this app or not.
			document.getElementById('status').innerHTML = 'Please log into Facebook.';
		}
	}

	function checkLoginState() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '387506448107274',
			cookie     : true,  // enable cookies to allow the server to access the session
			xfbml      : true,  // parse social plugins on this page
			version    : 'v2.2' // use version 2.2
		});
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});

	};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/pt_BR/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

</script>

	<div class="fb-like" data-share="true" data-width="450" data-show-faces="true"></div>
	<fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>
	<div id="status"></div>

	<div class="container">

		<div class="row">
			<div id="startStop" class="col-md-8 col-md-offset-2">
				<h1>Cronometrei!</h1>
			</div>
		</div>

		<div class="row">
			<div id="timer" class="col-md-8 col-md-offset-2"></div>
		</div>

		<div class="row">
			<div id="startStop" class="col-md-4 col-md-offset-2 alert alert-success">Iniciar/Pausar</div>
			<div id="clear" class="col-md-4 alert alert-danger">Limpar</div>
		</div>

	</div>


	<script type="text/javascript" src="assets/js/jquery-1.11.3.min.js"></script>
	<script type="text/javascript" src="assets/js/jquery.hotkeys.min.js"></script>
	<script type="text/javascript" src="assets/js/functions.dev.js"></script>
    <script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
	<script>
	  // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  // })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	  // ga('create', 'UA-64745967-1', 'auto');
	  // ga('send', 'pageview');
	</script>

  </body>
</html>