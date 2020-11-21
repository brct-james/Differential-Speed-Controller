document.addEventListener("DOMContentLoaded", function () {
    var tcDefaults = {
      enabled: true, // default enabled
      defaultSpeed: 1.0, // default:
      currentSpeed: 1.0,
      domainRules: "",
      urlRules: "",
      playlistRules: ""
    };
    
    document.querySelector("#settings").addEventListener("click", function () {
      window.open(chrome.runtime.getURL("options.html"));
    });
  
    document.querySelector("#about").addEventListener("click", function () {
      window.open("");
    });
  
    document.querySelector("#enable").addEventListener("click", function () {
      toggleEnabled(true, settingsSavedReloadMessage);
    });
  
    document.querySelector("#disable").addEventListener("click", function () {
      toggleEnabled(false, settingsSavedReloadMessage);
    });

    document.querySelector("#setDomain").addEventListener("click", function () {
      updateUI();
    });

    document.querySelector("#setUrl").addEventListener("click", function () {
      updateUI();
    });

    document.querySelector("#setPlaylist").addEventListener("click", function () {
      updateUI();
    });

    document.querySelector("#currentSpeed").addEventListener("change", function () {
      changeCurrentSpeed(document.getElementById("currentSpeed").value);
    });

    document.querySelector("#saveDefaultSpeed").addEventListener("click", function () {
      chrome.storage.sync.set(
        {
          defaultSpeed: document.getElementById("defaultSpeed").value
        },
        updateUI
      );
    });

    function changeCurrentSpeed(newSpeed) {
      chrome.storage.sync.set(
        {
          currentSpeed: document.getElementById("currentSpeed").value
        },
        updateUI
      );
    }

    initUI();

    function initUI() {
      chrome.storage.sync.get(tcDefaults, function (storage) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
            let url = tabs[0].url.replace(/(^\w+:|^)\/\//, '');
            if (url.startsWith('www.')) { url = url.split('www.')[1]; }
            let domain = url.split('/')[0];
            let playlist = url.split("&list=");
            if (playlist.length > 1) { playlist = "&list=" + playlist[1].split("&")[0]; } else { playlist = undefined }

            let newCurrentSpeed = storage.defaultSpeed;
            let newTextContent = "Current Speed";

            console.log("url: " + url);
            console.log("domain: " + domain);
            console.log("playlist: " + playlist);

            let urlRules = storage.urlRules.split("\n");
            let playlistRules = storage.playlistRules.split("\n");
            let domainRules = storage.domainRules.split("\n");

            console.log("urlRules: ", urlRules);
            console.log("playlistRules: ", playlistRules);
            console.log("domainRules: ", domainRules);

            let urlRule, playlistRule, domainRule;
            if (urlRules[0].length > 0) {
              urlRule = urlRules.filter(ruleset => ruleset.split("|")[0] == url)
              if (urlRule.length > 0) {urlRule = urlRule[0].split("|")[1];} else {urlRule = undefined;}
            }
            
            if (playlistRules[0].length > 0) {
              playlistRule = playlistRules.filter(ruleset => ruleset.split("|")[0] == playlist);
              if (playlistRule.length > 0) {playlistRule = playlistRule[0].split("|")[1];} else {playlistRule = undefined;}
            }

            if (domainRules[0].length > 0) {
              domainRule = domainRules.filter(ruleset => ruleset.split("|")[0] == domain);
              if (domainRule.length > 0) {domainRule = domainRule[0].split("|")[1];} else {domainRule = undefined;}
            }

            console.log("urlRule: " + urlRule);
            console.log("playlistRule: " + playlistRule);
            console.log("domainRule: " + domainRule);

            if (urlRule) {
              newCurrentSpeed = urlRule;
              newTextContent = "Current Speed (Url)";
            }
            else if (playlistRule) {
              newCurrentSpeed = playlistRule;
              newTextContent = "Current Speed (Playlist)";
            }
            else if (domainRule) {
              newCurrentSpeed = domainRule;
              newTextContent = "Current Speed (Domain)";
            }
            else {
              newCurrentSpeed = storage.defaultSpeed;
              newTextContent = "Current Speed (Default)";
            }
            
            document.getElementById("setUrl").textContent = "Save Speed for Url (" + (urlRule ? urlRule : "No Rule Defined") + ")";
            document.getElementById("setPlaylist").textContent = "Save Speed for Playlist (" + (playlistRule ? playlistRule : "No Rule Defined") + ")";
            document.getElementById("setDomain").textContent = "Save Speed for Domain (" + (domainRule ? domainRule : "No Rule Defined") + ")";
    
            document.getElementById("cSpeedLabel").textContent = newTextContent;
            document.getElementById("currentSpeed").value = newCurrentSpeed;
            changeCurrentSpeed(newCurrentSpeed);
        });      
      });
    }

    function updateUI() {
      chrome.storage.sync.get(tcDefaults, function (storage) {
        toggleEnabledUI(storage.enabled);
        document.getElementById("defaultSpeed").value = storage.defaultSpeed;
      });
    }
  
    function toggleEnabled(enabled, callback) {
      chrome.storage.sync.set(
        {
          enabled: enabled
        },
        function () {
          toggleEnabledUI(enabled);
          if (callback) callback(enabled);
        }
      );
    }
  
    function toggleEnabledUI(enabled) {
      document.querySelector("#enable").classList.toggle("hide", enabled);
      document.querySelector("#disable").classList.toggle("hide", !enabled);
    }
  
    function settingsSavedReloadMessage(enabled) {
      setStatusMessage(
        `${enabled ? "Enabled" : "Disabled"}. Reload page to see changes`
      );
    }
  
    function setStatusMessage(str) {
      const status_element = document.querySelector("#status");
      status_element.classList.toggle("hide", false);
      status_element.innerText = str;
    }
  });
  