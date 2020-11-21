var tcDefaults = {
  enabled: true, // default enabled
  defaultSpeed: 1.0, // default:
  domainRules: "",
  currentSpeed: 1.0,
  urlRules: "",
  playlistRules: ""
};

function trimProtocolsAndBlanks(array) {
  return array.map(ruleset => {
    ruleset = ruleset.replace(/(^\w+:|^)\/\//, '')
    if (ruleset.startsWith('www.')) { ruleset = ruleset.split('www.')[1]; }
    return ruleset
  }).filter(ruleset => (ruleset != "|1" && ruleset != ""));
}

// Saves options to chrome.storage
function save_options() {
  var enabled = document.getElementById("enabled").checked;
  var defaultSpeed = document.getElementById("defaultSpeed").value;
  var domainRules = document.getElementById("domainRules").value.split("\n");
  var urlRules = document.getElementById("urlRules").value.split("\n");
  var playlistRules = document.getElementById("playlistRules").value.split("\n");

  if (domainRules.length > 0) {
    domainRules = trimProtocolsAndBlanks(domainRules).map(ruleset => [ruleset.split('/')[0].split("|")[0],ruleset.split('|')[1] ? ruleset.split('|')[1] : defaultSpeed].join("|"));
  }
  if (urlRules.length > 0) {
    urlRules = trimProtocolsAndBlanks(urlRules).map(ruleset => [ruleset.split("|")[0],ruleset.split("|")[1] ? ruleset.split("|")[1] : defaultSpeed].join("|"));
  }
  if (playlistRules.length > 0) {
    playlistRules = trimProtocolsAndBlanks(playlistRules).map(ruleset => {
      let temp = ruleset.split("&list=");
      if (temp.length > 1) { temp = "&list=" + [temp[1].split("&")[0].split("|")[0], temp[1].split("|")[1] ? temp[1].split("|")[1] : defaultSpeed].join("|"); }
      else { temp = undefined; }
      return temp;
    }).filter(ruleset => ruleset != undefined);
  }

  domainRules = domainRules.join("\n");
  urlRules = urlRules.join("\n");
  playlistRules = playlistRules.join("\n");

  document.getElementById("domainRules").value = domainRules;
  document.getElementById("urlRules").value = urlRules;
  document.getElementById("playlistRules").value = playlistRules;

  updateTextBoxText(domainRules, urlRules, playlistRules);

  chrome.storage.sync.set(
    {
      enabled: enabled,
      defaultSpeed: defaultSpeed,
      domainRules: domainRules,
      urlRules: urlRules,
      playlistRules: playlistRules
    },
    updateStatus("Options saved")
  );
}

function updateTextBoxText(domainRules, urlRules, playlistRules) {
  document.getElementById("domainRules").value = domainRules + "\n";
  document.getElementById("urlRules").value = urlRules + "\n";
  document.getElementById("playlistRules").value = playlistRules + "\n";
}

function updateStatus(message) {
  var status = document.getElementById("status");
  status.style.visibility = "visible";
  status.textContent = message;
  setTimeout(function () {
    status.style.visibility = "hidden";
  }, 2000);
}

// Restores options from chrome.storage
function restore_options() {
  chrome.storage.sync.get(tcDefaults, function (storage) {
    document.getElementById("enabled").checked = storage.enabled;
    document.getElementById("defaultSpeed").value = storage.defaultSpeed;
    updateTextBoxText(storage.domainRules, storage.urlRules, storage.playlistRules);
  });
}

function restore_defaults() {
  chrome.storage.sync.set(tcDefaults, function () {
    restore_options();
    // Update status to let user know options were saved.
    updateStatus("Default options restored")
  });
}

document.addEventListener("DOMContentLoaded", function () {
  restore_options();

  document.getElementById("save").addEventListener("click", save_options);
});
