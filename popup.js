let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")

let section = document.querySelector("section")

section.addEventListener("mouseenter", () => {
    section.classList.add("active")
});

section.addEventListener("mouseleave", () => {
    section.classList.remove("active")
});

const ICONS = {
    SAVE_STATE: "/icons/save.svg",
    DONE_STATE: "/icons/tick.svg",
    COPY_STATE: "/icons/copy.svg",
    DELETE_STATE: "/icons/delete.svg",
    DOWNLOAD_STATE: "/icons/download.svg",
}

const KEYS = {
    NOTE: "note",
}

const PATHS = {
    DOWNLOAD_FILE_NAME: "notix_note_data.txt",
}

const saveData = () => {
    let note = noteInput.value;
    chrome.storage.sync.set({ note: note }, () => {
        images[3].src = ICONS.DONE_STATE
    });
}

// save
saveButton.addEventListener("click", () => {
    // let note = noteInput.value;
    // chrome.storage.sync.set({ note: note }, () => {
    //     images[3].src = ICONS.DONE_STATE
    // });
    saveData()
});

// load data
chrome.storage.sync.get(KEYS.NOTE, (data) => data.note && (noteInput.value = data.note));

// check data
noteInput.addEventListener('input', () => {
    for (let image of images) {
        image.style.opacity = "1"
    }
    images[0].src = ICONS.DELETE_STATE
    images[1].src = ICONS.DOWNLOAD_STATE
    images[2].src = ICONS.COPY_STATE
    images[3].src = ICONS.SAVE_STATE
    setTimeout(() => {
        saveData()
        for (let image of images) {
            image.style.opacity = "0.5"
        }
    }, 1000)
});

// delete
deleteButton.addEventListener("click", () => {
    chrome.storage.sync.remove(KEYS.NOTE, function() {
        noteInput.value = "";
        images[0].src = ICONS.DONE_STATE
    });
});

// download
downloadButton.addEventListener("click", () => {
    var filename = PATHS.DOWNLOAD_FILE_NAME;
    let note = noteInput.value;

    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(note));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    images[1].src = ICONS.DONE_STATE
}, false);

// copy
copyButton.addEventListener("click", () => {
    let note = noteInput.value;
    navigator.clipboard.writeText(note).then(() => {
        images[2].src = ICONS.DONE_STATE
    }, () => {
        console.log("Error copying note");
    });
});