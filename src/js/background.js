const updateInterval = 3600000;

// download and synchronize data
const updateInfo = ()=>{
	$.get( "http://www.softomate.net/ext/employees/list.json", ( data ) => {
		chrome.storage.local.set({'data': data});
		const d = new Date();
		chrome.storage.local.set({'lastUpdate': d.getTime()});
		chrome.storage.local.get( (obj)=>{
			chrome.storage.local.set({'siteState': data.map( item =>{
				const initialState = {messageCounter: 0, messageVisible: true};
				if (obj['siteState']){
					const oldState = obj['siteState'].find( el => el.domain === item.domain);
					const state = oldState ? { messageCounter: oldState.messageCounter, messageVisible: oldState.messageVisible } : initialState;
					return Object.assign(item, state)
				}else{
					return Object.assign(item, initialState)
				}
			})});
		});
	});
};

// check last update time
chrome.storage.local.get((obj) => {
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
			//if data was synchronized less then hour ago, create custom timer for next synchronization
			setTimeout(()=>{
				setInterval(updateInfo, updateInterval);
				updateInfo();
			}, updateInterval - (newDate.getTime() - obj['lastUpdate']));
		}
	}

	// update sites' state at the start of browser session
	const siteState = obj['siteState'].map((item) => Object.assign(item, {messageCounter: 0, messageVisible: true}));
	chrome.storage.local.set({'siteState': siteState });
});

class UrlManager {
	constructor(url, list) {
		this.url = new URL(url);
		this.siteList = list;
		this.searchEngines = ['google.com','google.ru','bing.com'];
	}
	get checkUrl() {
		return this.siteList.findIndex((item) => this.url.hostname.indexOf(item.domain) > -1);
	}
	get isSearching(){
		const check = this.searchEngines.filter((item)=> this.url.hostname.indexOf(item) > -1 );
		return check.length === 1 && this.url.pathname.indexOf('/search') === 0;
	}
	get isBing(){
		const domain = this.url.hostname;
		const check = this.searchEngines.filter((item)=> domain.indexOf(item) > -1 );
		return check[0] === 'bing.com';
	}
}

chrome.tabs.onUpdated.addListener((id, changeInfo, tab)=>{
	if (changeInfo.status === 'complete'){
		chrome.storage.local.get((obj) => {
			const manageUrl = new UrlManager(tab.url, obj['data']);
			if (manageUrl.checkUrl > -1){
				chrome.tabs.executeScript(tab.id, {file: 'js/handlebars-v4.0.11.js', runAt: 'document_idle'});
				chrome.tabs.insertCSS(tab.id, {file: 'css/main.min.css', runAt: 'document_idle'});
				chrome.tabs.executeScript(tab.id, {file: 'js/templates.js', runAt: 'document_idle'});
				chrome.tabs.executeScript(tab.id, {file: 'js/message.js', runAt: 'document_end'});
			}
			if (manageUrl.isSearching){
				chrome.tabs.executeScript(tab.id, {file: 'js/jquery-3.3.1.min.js', runAt: 'document_start'});
				chrome.tabs.executeScript(tab.id, {file: 'js/handlebars-v4.0.11.js', runAt: 'document_idle'});
				chrome.tabs.insertCSS(tab.id, {file: 'css/main.min.css', runAt: 'document_idle'});
				chrome.tabs.executeScript(tab.id, {file: 'js/templates.js', runAt: 'document_end'});
				manageUrl.isBing ? chrome.tabs.executeScript(tab.id, {file: 'js/inject_bing.js', runAt: 'document_end'}) : chrome.tabs.executeScript(tab.id, {file: 'js/inject_google.js', runAt: 'document_end'});
			}
		});
	}
});