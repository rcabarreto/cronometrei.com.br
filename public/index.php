<!DOCTYPE html>
<html lang="pt-br">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<meta name="description" content="Cronômetro online">
	<meta name="keywords" content="Cronômetro, Contador, Relógio, Tempo, Timer, Cronometer">
	<meta name="author" content="R3 Web Solutions">

	<meta property="og:url"                content="http://www.cronometrei.com.br/" />
	<meta property="og:type"               content="website" />
	<meta property="og:title"              content="Cronometrei" />
	<meta property="og:description"        content="O tempo sob controle" />
	<meta property="og:image"              content="http://www.cronometrei.com.br/assets/images/crono-trans250.png" />

	<link rel="apple-touch-icon" sizes="57x57" href="/assets/favicon/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/assets/favicon/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/assets/favicon/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/assets/favicon/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/assets/favicon/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/assets/favicon/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/assets/favicon/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/assets/favicon/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192"  href="/assets/favicon/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">
	<link rel="manifest" href="/assets/favicon/manifest.json">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="/assets/favicon/ms-icon-144x144.png">
	<meta name="theme-color" content="#ffffff">

	<title></title>

	<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/style.css" />

	<link rel="stylesheet" type="text/css" href="assets/css/offline-theme-slide.css" />
	<link rel="stylesheet" type="text/css" href="assets/css/offline-language-portuguese-brazil.css" />
	<link rel="stylesheet" type="text/css" href="assets/css/offline-language-portuguese-brazil-indicator.css" />

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	<!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
	<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

</head>

<body>

	<div id="fb-root"></div>
    <script type="text/javascript" src="assets/js/apis.js"></script>

	<header>
		<nav class="navbar navbar-default opaque">
			<div class="container-fluid">

				<div class="navbar-header">
					<div class="socialdiv">
						<div class="social"><div class="fb-like" data-href="http://www.cronometrei.com.br/" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false"></div></div>
						<div class="social"><a href="https://twitter.com/share" class="twitter-share-button" data-url="http://www.cronometrei.com.br/">Tweet</a></div>
						<div class="social"><g:plusone href="http://www.cronometrei.com.br/" size="medium"></g:plusone></div>
					</div>
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
				</div>

				<!-- Collect the nav links, forms, and other content for toggling -->
				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
					<ul class="nav navbar-nav navbar-right">
						<li id="btnFeedback"><a href="#">Feedback</a></li>
					</ul>
				</div>

			</div>
		</nav>
	</header>

	<!-- progressbar container -->
	<div id="progressbar" class="container-fluid" style="display: block;">
		<div class="row">
			<div class="col-md-6 col-md-offset-3">
				<div class="loading">Carregando...</div>
				<div class="progress">
					<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div>
				</div>				
			</div>
		</div>
	</div>

	<!-- app container -->
	<div id="application" class="container opaque"></div>
	
	<footer id="appFooter" class="container-fluid opaque">
		<div class="row">
			<div class="col-md-6 col-md-offset-3">
				<!-- Cronometrei app -->
				<ins class="adsbygoogle"
				     style="display:block"
				     data-ad-client="ca-pub-5385380754980188"
				     data-ad-slot="3418128941"
				     data-ad-format="auto"></ins>
				<script>
				(adsbygoogle = window.adsbygoogle || []).push({});
				</script>
			</div>
		</div>
	</footer>

	<script type="text/javascript" src="assets/js/jquery-1.11.3.min.js"></script>
	<script type="text/javascript" src="assets/js/functions.min.js"></script>
    <script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="assets/js/bootbox.min.js"></script>
<!--     <script type="text/javascript" src="assets/js/offline.min.js"></script>
	<script type="text/javascript">
		Offline.options = {checks: {xhr: {url: app.settings.apihost + "/theme/loadTheme"}}}
	</script>
 -->	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	  ga('create', 'UA-64745967-1', 'auto');
	  ga('send', 'pageview');
	</script>

  </body>
</html>