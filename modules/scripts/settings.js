let closeBtn = document.querySelector('#settings #close_settings');

closeBtn.addEventListener('click', () => {
    let settings = document.getElementById('settings');
    settings.classList.remove('active');
})

// audio
let hvoice = document.getElementById("voice"),
    hvol = document.getElementById("audio_setting_volumn"),
    hpitch = document.getElementById("audio_setting_pitch"),
    hrate = document.getElementById("audio_setting_rate");

let audioSettings = {
    voice: "0",
    vol: "1",
    pitch: "1",
    rate: "1",
};

if ("speechSynthesis" in window) {
    const dispatchAudioSettings = () => {
        chrome.storage.sync.set({ "audio_settings": audioSettings });
    };

    chrome.storage.sync.get("audio_settings", (res) => {
        if (res.audio_settings) {
            audioSettings = res.audio_settings;
            hvoice.value = audioSettings.voice;
            hvol.value = audioSettings.vol;
            hpitch.value = audioSettings.pitch;
            hrate.value = audioSettings.rate;
        }
    });

    let voices = () => {
        speechSynthesis.getVoices().forEach((v, i) => {
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = v.name;
            hvoice.appendChild(opt);
        });
    };
    voices();
    speechSynthesis.onvoiceschanged = voices;

    hvoice.addEventListener("change", () => {
        hvoice.value = hvoice.selectedIndex;    //hvoice.options[hvoice.selectedIndex].text
        audioSettings.voice = hvoice.value;
        dispatchAudioSettings();
    });

    hvol.addEventListener("mouseup", () => {
        audioSettings.vol = hvol.value;
        dispatchAudioSettings();
    });

    hpitch.addEventListener("mouseup", () => {
        audioSettings.pitch = hpitch.value;
        dispatchAudioSettings();
    });

    hrate.addEventListener("mouseup", () => {
        audioSettings.rate = hrate.value;
        dispatchAudioSettings();
    });
}

// others
let autoSaveBtn = document.getElementById("autosave_setting_toggle");
let autoSyncBtn = document.getElementById("autosync_setting_toggle");

let autoSettings = {
    autoSave: true,
    autoSync: false,
}

const dispatchAutoSettings = () => {
    chrome.storage.sync.set({ "auto_settings": autoSettings });
};

chrome.storage.sync.get("auto_settings", (res) => {
    if (res.auto_settings) {
        autoSettings = res.auto_settings;
        autoSaveBtn.checked = autoSettings.autoSave;
        autoSyncBtn.checked = autoSettings.autoSync;
    }
});

autoSaveBtn.addEventListener("change", () => {
    autoSettings.autoSave = autoSaveBtn.checked;
    dispatchAutoSettings();
});

autoSyncBtn.addEventListener("change", () => {
    autoSettings.autoSync = autoSyncBtn.checked;
    dispatchAutoSettings();
});