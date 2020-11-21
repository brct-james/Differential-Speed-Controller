var regStrip = /^[\r\t\f\v ]+|[\r\t\f\v ]+$/gm;

var tcDefaults = {
  enabled: true, // default enabled
  defaultSpeed: 1.0, // default:
  domainRules: "",
  currentSpeed: 1.0,
  urlRules: "",
  playlistRules: ""
};

// Validates settings before saving
function validate() {
  var valid = true;
  var status = document.getElementById("status");
  document
    .getElementById("domainRules")
    .value.split("\n")
    .forEach((match) => {
      match = match.replace(regStrip, "");
    });
  return valid;
}

// Saves options to chrome.storage
function save_options() {
  if (validate() === false) {
    return;
  }

  var enabled = document.getElementById("enabled").checked;
  var defaultSpeed = document.getElementById("defaultSpeed").value;
  var domainRules = document.getElementById("domainRules").value;
  var urlRules = document.getElementById("urlRules").value;
  var playlistRules = document.getElementById("playlistRules").value;

  chrome.storage.sync.set(
    {
      enabled: enabled,
      defaultSpeed: defaultSpeed,
      domainRules: domainRules.replace(regStrip, ""),
      urlRules: urlRules.replace(regStrip, ""),
      playlistRules: playlistRules.replace(regStrip, "")
    },
    updateStatus("Options saved")
  );
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
    document.getElementById("domainRules").value = storage.domainRules;
    document.getElementById("urlRules").value = storage.urlRules;
    document.getElementById("playlistRules").value = storage.playlistRules;
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
