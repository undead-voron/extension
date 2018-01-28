chrome.storage.local.get(function(obj) {
	const template = Handlebars.templates['marker'];
	const data = {
		url: chrome.runtime.getURL('img/donation.png')
	};
	const results = $('#rso').find('.g');
	for (let i=0; i< results.length;i++){
		if (checkUrl(obj['data'], $(results[i]).find('h3 > a').attr('href'))){
			$(results[i]).prepend(template(data));
		}
	}
});

function checkUrl(data, url){
	const buildUrl= new URL(url);
	const domain = buildUrl.hostname;
	const check = data.filter((item) => domain.indexOf('www.'+item.domain) > 0 || domain.indexOf(item.domain) > 0 );
	return check.length === 1;
}
