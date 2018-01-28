chrome.storage.local.get( (obj) => {
	// get current url
	const currentUrl  = new URL(location);
	const elementIndex = obj['siteState'].findIndex( item => currentUrl.hostname.indexOf(item.domain) === 0 || currentUrl.hostname.indexOf('www.'+item.domain) === 0);
	const elementInfo = obj['siteState'].find( item => currentUrl.hostname.indexOf(item.domain) === 0 || currentUrl.hostname.indexOf('www.'+item.domain) === 0);

	if (elementIndex > -1 && elementInfo.messageCounter < 3 && elementInfo.messageVisible ){
		// update message counter
		elementInfo.messageCounter++;
		const template = Handlebars.templates['injection'];
		const info = {
			message: elementInfo.message
		};
		document.body.innerHTML += template(info);
		const newArray = Array.from(obj['siteState'], (el, index)=>{
			if (index === elementIndex)
				return elementInfo;
			else
				return el;
		});
		chrome.storage.local.set({'siteState': newArray});

		const button = document.querySelector('footer.injection > button');
		button.addEventListener('click', ()=>{
			const injection = document.getElementById('injection');
			document.body.removeChild(injection);
			elementInfo.messageVisible = false;
			const newArray = Array.from(obj['siteState'], (el, index)=>{
				if (index === elementIndex)
					return elementInfo;
				else
					return el;
			});
			chrome.storage.local.set({'siteState': newArray});
		});
		const background = document.getElementById('injection');
		background.addEventListener('click', function(event, target){
			if (event.target === event.currentTarget){
				const injection = document.getElementById('injection');
				document.body.removeChild(injection);
			}
		});
	}else{
		console.log('message shown: ' + elementInfo.messageCounter  + ' times');
	}
	//if (!sessionStorage.getItem('injectionClosed')){
	//	if ( sessionStorage.getItem('invokedCounter') < 3){
	//		sessionStorage.setItem('invokedCounter', (sessionStorage.getItem('invokedCounter') !== null ? parseInt(sessionStorage.getItem('invokedCounter')) + 1 : 1));
	//		const template = Handlebars.templates['injection'];
	//		const info = {
	//			message: obj['message']
	//		};
	//		document.body.innerHTML += template(info);
//
	//		const button = document.querySelector('footer.injection > button');
	//		button.addEventListener('click', ()=>{
	//			const injection = document.getElementById('injection');
	//			document.body.removeChild(injection);
	//			sessionStorage.setItem('injectionClosed', true);
	//		});
	//		const background = document.getElementById('injection');
	//		background.addEventListener('click', function(event, target){
	//			if (event.target === event.currentTarget){
	//				const injection = document.getElementById('injection');
	//				document.body.removeChild(injection);
	//			}
	//		});
	//	}
	//}
});