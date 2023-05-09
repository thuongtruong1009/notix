let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")

const SAVE_STATE_IMG = "/icons/save.svg"
const DONE_STATE_IMG = "/icons/tick.svg"
const COPY_STATE_IMG = "/icons/copy.svg"
const DELETE_STATE_IMG = "/icons/delete.svg"
const DOWNLOAD_STATE_IMG = "/icons/download.svg"

// load data
chrome.storage.sync.get("note", (data) => data.note && (noteInput.value = data.note));

// check data change
noteInput.addEventListener("input", () => {
    for (let image of images) {
        image.style.opacity = "1"
    }
    images[0].src = DELETE_STATE_IMG
    images[1].src = DOWNLOAD_STATE_IMG
    images[2].src = COPY_STATE_IMG
    images[3].src = SAVE_STATE_IMG
});

// delete
deleteButton.addEventListener("click", () => {
    chrome.storage.sync.remove("note", function() {
        noteInput.value = "";
        images[0].src = DONE_STATE_IMG
    });
});

// download
downloadButton.addEventListener("click", () => {
    var filename = "notix_extension_data.txt";
    let note = noteInput.value;

    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(note));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    images[1].src = DONE_STATE_IMG
}, false);

// copy
copyButton.addEventListener("click", () => {
    let note = noteInput.value;
    navigator.clipboard.writeText(note).then(() => {
        images[2].src = DONE_STATE_IMG
    }, () => {
        console.log("Error copying note");
    });
});

// save
saveButton.addEventListener("click", () => {
    let note = noteInput.value;
    chrome.storage.sync.set({ note: note }, () => {
        images[3].src = DONE_STATE_IMG
    });
});