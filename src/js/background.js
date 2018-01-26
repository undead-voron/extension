// variable for storing data in extension
let urlList = [];

const updateInterval = 3600000;

// download and synchronize data
const updateInfo = ()=>{
	$.get( "http://www.softomate.net/ext/employees/list.json", ( data ) => {
		chrome.storage.local.set({'data': data});
		const d = new Date();
		chrome.storage.local.set({'lastUpdate': d.getTime()});
		urlList = data;
	});
};

// check last update time
chrome.storage.sync.get(function(obj){
	// if data was never synchronized download it.
	if (obj['lastUpdate'] === undefined){
		setInterval(updateInfo, updateInterval);
		updateInfo();
	}else{
		// if data was synchronized more then hour ago, just start synchronizing
		const newDate = new Date();
		if (newDate.getDate() - updateInterval > obj['lastUpdate']){
			setInterval(updateInfo, updateInterval);
			updateInfo();
		}else{
			// set timer for synchronizing if data was updated less then hour ago
			setTimeout(()=>{
				setInterval(updateInfo, updateInterval);
				updateInfo();
			}, newDate - updateInterval - obj['lastUpdate'])
		}
	}
});
/*
class UrlManager {
	constructor(url, list) {
		this.url = new URL(url);
		this.siteList = list;
		this.searchEngines = ['google.com','google.ru','bing.com']
	}
	get checkUrl () {
		const checker = this.siteList.filter( (item) => this.url.indexOf('://' + item.domain) > -1 || this.url.indexOf('://www.' + item.domain) > -1);
		return checker.length === 1 ? checker[0].message : false
	}
}
*/
chrome.tabs.onUpdated.addListener((id, changeInfo, tab)=>{
	if (changeInfo.status === 'complete'){
		const message = checkUrl(tab.url);
		if (message){
			chrome.storage.local.set({'message': message});
			chrome.tabs.executeScript(tab.id, {file: 'js/handlebars-v4.0.11.js', runAt: 'document_idle'});
			chrome.tabs.insertCSS(tab.id, {file: 'css/main.min.css', runAt: 'document_idle'});
			chrome.tabs.executeScript(tab.id, {file: 'js/templates.js', runAt: 'document_idle'});
			chrome.tabs.executeScript(tab.id, {file: 'js/message.js', runAt: 'document_end'});
		}
		if (inSearch(tab.url)){
			chrome.tabs.executeScript(tab.id, {file: 'js/jquery-3.3.1.min.js', runAt: 'document_start'});
			chrome.tabs.executeScript(tab.id, {file: 'js/handlebars-v4.0.11.js', runAt: 'document_idle'});
			chrome.tabs.insertCSS(tab.id, {file: 'css/main.min.css', runAt: 'document_idle'});
			chrome.tabs.executeScript(tab.id, {file: 'js/templates.js', runAt: 'document_end'});
			getScript(tab.url) ? chrome.tabs.executeScript(tab.id, {file: 'js/inject_bing.js', runAt: 'document_end'}) : chrome.tabs.executeScript(tab.id, {file: 'js/inject_google.js', runAt: 'document_end'});
		}
	}
});

function checkUrl(url){
	const checker = urlList.filter( (item) => url.indexOf('://' + item.domain) > -1 || url.indexOf('://www.' + item.domain) > -1);
	return checker.length > 0 ? checker[0].message : false
}

function inSearch(url){
	const buildUrl= new URL(url);
	const domain = buildUrl.hostname;
	const checkList = ['google.com','google.ru','bing.com'];
	const check = checkList.filter((item)=> domain.indexOf('www.'+item) > -1 || domain.indexOf(item) > -1 );
	return check.length === 1 && buildUrl.pathname.indexOf('/search') === 0;
}

function getScript(url){
	const buildUrl= new URL(url);
	const domain = buildUrl.hostname;
	const checkList = ['google.com','google.ru','bing.com'];
	const check = checkList.filter((item)=> domain.indexOf('www.'+item) > -1 || domain.indexOf(item) > -1 );
	return check[0] === 'bing.com';
}