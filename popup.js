let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")
let section = document.querySelector("#note_panel")

let noteHeader = document.querySelector("#note_header")
let listHeader = document.querySelector("#list_header")

const ICONS = {
    SAVE_STATE: "/icons/save.svg",
    DONE_STATE: "/icons/tick.svg",
    COPY_STATE: "/icons/copy.svg",
    DELETE_STATE: "/icons/delete.svg",
    DOWNLOAD_STATE: "/icons/download.svg",
}

const OBJS = {
    NOTE: "note",
    LIST: "list",
    TAB: "tab",
    DOWNLOAD_FILE_NAME: "notix_note_data.txt",
    ITEMS: "items",
}

let currentTab = OBJS.NOTE;

const changeTab = () => {
    if (currentTab == OBJS.NOTE) {
        listHeader.style.display = "flex"
        noteHeader.style.display = "none"
        currentTab = OBJS.LIST
    } else {
        listHeader.style.display = "none"
        noteHeader.style.display = "flex"
        currentTab = OBJS.NOTE
    }
    chrome.storage.sync.set({ tab: currentTab });
}

chrome.storage.sync.get(OBJS.TAB, changeTab);

document.addEventListener('DOMContentLoaded', () => {
    noteInput.scrollTop = noteInput.scrollHeight;
});

section.addEventListener("mouseenter", () => {
    section.classList.add("active");
});

section.addEventListener("mouseleave", () => {
    section.classList.remove("active");
});

const saveData = () => {
    let note = noteInput.value;
    chrome.storage.sync.set({ note: note }, () => {
        images[3].src = ICONS.DONE_STATE
    });
}

saveButton.addEventListener("click", () => {
    saveData()
});

chrome.storage.sync.get(OBJS.NOTE, (data) => data.note && (noteInput.value = data.note));

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
    }, 1000)
});

deleteButton.addEventListener("click", () => {
    chrome.storage.sync.remove(OBJS.NOTE, function() {
        noteInput.value = "";
        images[0].src = ICONS.DONE_STATE
    });
});

downloadButton.addEventListener("click", () => {
    var filename = OBJS.DOWNLOAD_FILE_NAME;
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

copyButton.addEventListener("click", () => {
    let note = noteInput.value;
    navigator.clipboard.writeText(note).then(() => {
        images[2].src = ICONS.DONE_STATE
    }, () => {
        alert("Error copying note");
    });
});


let list = document.querySelector('#list_panel > ul');
let newBtn = document.querySelector('#list_header > #new_btn');

let items = [];

const persistItems = () => {
    for (let item of list.children) {
        items.push(item.innerHTML);
    }
    chrome.storage.sync.set({ items: items });
}

chrome.storage.sync.get(OBJS.ITEMS, (data)=> {
    if (data.items) {
        for (let item of data.items) {
            let newItem = document.createElement('li');
            newItem.innerHTML = item;
            list.appendChild(newItem);
        }
    }

});

newBtn.addEventListener('click', () => {
    let newItem = document.createElement('li');
    newItem.setAttribute('id', 'new_item')
    newItem.innerHTML = '<p>hello</p>';
    list.appendChild(newItem);
    persistItems();
})