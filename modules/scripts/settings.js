let closeBtn = document.querySelector('#settings #close_settings');
import { dispatchSettings } from "./storage.js";

closeBtn.addEventListener('click', () => {
    let settings = document.getElementById('settings');
    settings.classList.remove('active');
})

let hvoice = document.getElementById("voice"),
    hvol = document.getElementById("audio_setting_volumn"),
    hpitch = document.getElementById("audio_setting_pitch"),
    hrate = document.getElementById("audio_setting_rate");

let audioSettings = {
    voice: 0,
    vol: 1,
    pitch: 1,
    rate: 1,
}

const dispatchAudioSettings = () => {
    dispatchSettings(audioSettings);
}

if ("speechSynthesis" in window) {
    // (() => {
    //     loadSettings((res) => {
    //         if (res.settings) {
    //             // audioSettings = res.settings;
    //             // hvoice.value = res.settings.voice || audioSettings.voice;
    //             hvol.value = res.settings.vol || audioSettings.vol;
    //             hpitch.value = res.settings.pitch || audioSettings.pitch;
    //             hrate.value = res.settings.rate || audioSettings.rate;
    //         }
    //     });
    // })();

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

    // hvoice.addEventListener("change", () => {
    //     audioSettings.voice = hvoice.value;
    //     // closeBtn.innerHTML = hvoice.options[hvoice.selectedIndex].text;
    //     dispatchAudioSettings();
    // });

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