chrome.runtime.onInstalled.addListener((_reason) => {
  chrome.tabs.create({
    url: 'index.html'
  });
});


chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL('uninstall.html');
  }
});