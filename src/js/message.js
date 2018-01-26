chrome.storage.sync.get(function(obj){
	if (!sessionStorage.getItem('injectionClosed')){
		if ( sessionStorage.getItem('invokedCounter') < 3){
			sessionStorage.setItem('invokedCounter', (sessionStorage.getItem('invokedCounter') !== null ? parseInt(sessionStorage.getItem('invokedCounter')) + 1 : 1));
			const template = Handlebars.templates['injection'];
			const info = {
				message: obj['message']
			};
			document.body.innerHTML += template(info);

			const button = document.querySelector('footer.injection > button');
			button.addEventListener('click', ()=>{
				const injection = document.getElementById('injection');
				document.body.removeChild(injection);
				sessionStorage.setItem('injectionClosed', true);
			});
			const background = document.getElementById('injection');
			background.addEventListener('click', function(event, target){
				if (event.target === event.currentTarget){
					const injection = document.getElementById('injection');
					document.body.removeChild(injection);
				}
			});
		}
	}
});