chrome.storage.local.get(function(obj){
	const data = obj['data'];

	const template = Handlebars.templates['popup'];
	const dataObj = {
		itemsList: data
	};

	$('body').append(template(dataObj));
	$('body>ul>li>a').on('click', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
});