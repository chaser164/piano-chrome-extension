// Listen for extension being installed
chrome.runtime.onInstalled.addListener(install => {
    if(install.reason == 'install'){
      //Open the info page
      chrome.tabs.create({
        url: 'info.html'
      });
    };
});