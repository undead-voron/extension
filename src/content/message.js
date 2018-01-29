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
		$('body').append(template(info));
		$('#injection')
			.on('hidden.bs.modal', function (e) {
				$('#injection').remove();
			})
			.modal('show');
		const newArray = Array.from(obj['siteState'], (el, index)=>{
			if (index === elementIndex)
				return elementInfo;
			else
				return el;
		});

		chrome.storage.local.set({'siteState': newArray});

		$('.modal-footer > button').on('click', ()=>{
			elementInfo.messageVisible = false;
			const newArray = Array.from(obj['siteState'], (el, index)=>{
				if (index === elementIndex)
					return elementInfo;
				else
					return el;
			});
			chrome.storage.local.set({'siteState': newArray});
		});
	}
});