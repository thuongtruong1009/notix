export const ICONS = {
    SAVE_STATE: "./icons/save.svg",
    DONE_STATE: "./icons/tick.svg",
    COPY_STATE: "./icons/copy.svg",
    CLEAR_STATE: "./icons/clear.png",
    COPY_LINK_STATE: "./icons/link.png",
    DOWNLOAD_IMG_STATE: "./icons/download_image.png",
    DOWNLOAD_TEXT_STATE: "./icons/download_text.png",
    EDIT_STATE: "./icons/edit.svg",
    CANCEL_STATE: "./icons/cancel.svg",
    CAPTURE_STATE: "./icons/capture.png",
    VOICE_STATE: "./icons/voice.png",
    RECORDING_STATE: "./icons/recording.png",
    AUDIO_STATE: "./icons/audio.png",
    MUTE_STATE: "./icons/mute.png"
};

export const OBJ_KEYS = {
    NOTE: "note",
    LIST: "list",
    TAB: "tab",
    ITEMS: "items",
    CURRENT_DATA: "current_data",
    ACTIVE_CLASS: "active"
};

export const loadTab = (cb) => chrome.storage.sync.get(OBJ_KEYS.TAB, cb);
export const dispatchTab = (tab, cb) => chrome.storage.sync.set({ [OBJ_KEYS.TAB]: tab }, cb);

export const loadNotes = (cb) => chrome.storage.sync.get(OBJ_KEYS.ITEMS, cb);
export const dispatchNotes = (data, cb) => chrome.storage.sync.set({ [OBJ_KEYS.ITEMS]: data }, cb);

export const loadCurrentNote = (cb) => chrome.storage.sync.get(OBJ_KEYS.CURRENT_DATA, cb);
export const dispatchCurrentNote = (data, cb) => chrome.storage.sync.set({ [OBJ_KEYS.CURRENT_DATA]: data }, cb);

export const calLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    if(day === NaN || month === NaN || year === NaN) return "unknown";
    return formattedDate;
}

export const exportToImage = (cb) => {
    domtoimage.toPng(main).then(async(dataUrl) => {
        cb(dataUrl);
    }).catch((error) => { 
        alert('oops, something went wrong!', error);
    });
}
