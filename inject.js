var settings = {
    enabled: true, // default enabled
    defaultSpeed: 1.0, // default:
    currentSpeed: 1.0,
    domainRules: "",
    urlRules: "",
    playlistRules: ""
};

var pageVideo;

chrome.runtime.onMessage.addListener(messageHandler);
window.addEventListener('yt-navigate-start', refreshSpeedOnNavigate);

function messageHandler(message) {
    console.log("RECEIVED MESSAGE FROM POPUP.JS (DSC)", message)
    if (message.refreshSpeed) {
        setSpeed(pageVideo, message.refreshSpeed);
    }
}

function setSpeed(video, speed) {
    if (!video) {
        console.error("in setSpeed, no video given")
        return;
    }
    console.log("setSpeed started: ", video, speed);
    var speedvalue = Number(speed).toFixed(2);
    video.playbackRate = Number(speedvalue);
    settings.currentSpeed = speed;
    console.log("setSpeed finished:", speed);
}

function refreshSpeedOnNavigate() {
    console.log("DETECTED YOUTUBE NAVIGATION, REFRESHING SPEED FOR NEW URL");
    chrome.storage.sync.get(settings, function (storage) {
        settings.enabled = Boolean(storage.enabled);
        settings.defaultSpeed = Number(storage.defaultSpeed);
        settings.domainRules = String(storage.domainRules).split("\n");
        settings.urlRules = String(storage.urlRules).split("\n");
        settings.playlistRules = String(storage.playlistRules).split("\n");
        getApplicableRule();
    });
}

chrome.storage.sync.get(settings, function (storage) {
    settings.enabled = Boolean(storage.enabled);
    settings.defaultSpeed = Number(storage.defaultSpeed);
    settings.domainRules = String(storage.domainRules).split("\n");
    settings.urlRules = String(storage.urlRules).split("\n");
    settings.playlistRules = String(storage.playlistRules).split("\n");
    initializeWhenReady(document);
});

function initializeWhenReady(document) {
    console.log("Begin initializeWhenReady");
    window.onload = () => {
        initializeNow(window.document);
    };
    if (document) {
        if (document.readyState === "complete") {
            initializeNow(document);
        } else {
            document.onreadystatechange = () => {
                if (document.readyState === "complete") {
                    initializeNow(document);
                }
            };
        }
    }
    console.log("End initializeWhenReady");
}

function initializeNow(document) {
    console.log("Begin initializeNow");
    if (!settings.enabled) return;
    // enforce init-once due to redundant callers
    console.log(document.body.classList)
    if (!document.body || document.body.classList.contains("dsc-initialized")) {
        return;
    }
    document.body.classList.add("dsc-initialized");
    console.log("initializeNow: dsc-initialized added to document body");

    console.log("initializeNow: setting pageVideo gvar");
    pageVideo = document.getElementsByTagName('video')[0];
    console.log("initializeNow referring to getApplicableRule")
    getApplicableRule();

    console.log("End initializeNow");
}

function trimProtocolsAndBlanks(array) {
    return array.map(ruleset => {
        ruleset = ruleset.replace(/(^\w+:|^)\/\//, '')
        if (ruleset.startsWith('www.')) {
            ruleset = ruleset.split('www.')[1];
        }
        return ruleset
    }).filter(ruleset => (ruleset != "|1" && ruleset != ""));
}

function getApplicableRule() {
    console.log("starting getApplicableRule");
    //todo: implement current speed control
    let thisUrl = window.location.href;
    let cleanUrl = trimProtocolsAndBlanks([thisUrl])[0];
    let domain = cleanUrl.split('/')[0];
    let url = cleanUrl.split('&')[0];
    console.log("URL",url,"CLEANURL", cleanUrl)
    let playlist = "&list=" + cleanUrl.split('&list=')[1].split("&")[0];
    let urlRule = settings.urlRules.filter(rule => rule.split("|")[0] == url)[0];
    let playlistRule = settings.playlistRules.filter(rule => rule.split("|")[0] == playlist)[0];
    let domainRule = settings.domainRules.filter(rule => rule.split("|")[0] == domain)[0];
    if (urlRule) {
        console.log("FOUND APPLICABLE URL RULE, APPLYING", urlRule.split("|")[1]);
        setSpeed(pageVideo, urlRule.split("|")[1])
    } else if (playlistRule) {
        console.log("FOUND APPLICABLE PLAYLIST RULE, APPLYING", playlistRule.split("|")[1]);
        setSpeed(pageVideo, playlistRule.split("|")[1])
    } else if (domainRule) {
        console.log("FOUND APPLICABLE DOMAIN RULE, APPLYING", domainRule.split("|")[1]);
        setSpeed(pageVideo, domainRule.split("|")[1])
    } else {
        console.log("NO APPLICABLE RULES FOUND APPLYING DEFAULT", settings.defaultSpeed);
        setSpeed(pageVideo, settings.defaultSpeed)
    }
    console.log("ending getApplicableRule");
}