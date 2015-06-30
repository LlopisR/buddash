window.fbAsyncInit = function() {
			FB.init({
				appId      : '389462007849578',
				xfbml      : true,
				version    : 'v2.3'
			});
		};

		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "js/vendor/fbfullsdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));