let logo = document.getElementById("logo");
let homeBtn = document.querySelector('#home');

let noteHeader = document.querySelector("#note_header")
let listHeader = document.querySelector("#list_header")

let noteName = document.querySelector("#note_name")
let total = document.querySelector("#total")

let notePanel = document.querySelector("#note_panel")
let listPanel = document.querySelector("#list_panel")

let noteInput = document.getElementById("note");
let resetBtn = document.getElementById("reset");
let downloadBtn = document.getElementById("download");
let copyBtn = document.getElementById("copy");
let saveBtn = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")

let list = document.querySelector('#list_panel > ul');
let deleteBtn = document.querySelector('#list_header > #delete_btn');
let newBtn = document.querySelector('#list_header > #new_btn');
let listItem = document.querySelector('#list_panel > ul > li');

const ICONS = {
    SAVE_STATE: "/icons/save.svg",
    DONE_STATE: "/icons/tick.svg",
    COPY_STATE: "/icons/copy.svg",
    RESET_STATE: "/icons/reset.png",
    DOWNLOAD_STATE: "/icons/download.png",
}

const OBJS = {
    NOTE: "note",
    LIST: "list",
    TAB: "tab",
    DOWNLOAD_FILE_NAME: "notix_note_data.txt",
    ITEMS: "items",
    CURRENT_DATA: "current_data"
}

const tabListStyle = () => {
    listHeader.style.display = "flex";
    noteHeader.style.display = "none";
    notePanel.style.display = "none";
    listPanel.style.display = "flex";
    logo.style.display = "flex";
    homeBtn.style.display = "none";
    noteName.style.display = "none";
}

const tabNoteStyle = () => {
    listHeader.style.display = "none";
    noteHeader.style.display = "flex";
    notePanel.style.display = "flex";
    listPanel.style.display = "none";
    logo.style.display = "none";
    homeBtn.style.display = "block";
    noteName.style.display = "inline-flex";
}

const persistCurrentTabStyle = (tab) => {
    tab === OBJS.NOTE ? tabNoteStyle() : tabListStyle();
}

const changeTab = (tab) => {
    persistCurrentTabStyle(tab);
    chrome.storage.sync.set({ tab: tab });
}

chrome.storage.sync.get(OBJS.TAB, (data) => persistCurrentTabStyle(data.tab));

// **************** list tab ****************

let currentItems = [];

const generateEle = (id, title) => {
    let newItem = document.createElement('li');
    newItem.innerHTML = `<p>${title}</p>`;
    newItem.setAttribute('id', id);

    let checkboxItem = document.createElement('input');
    checkboxItem.setAttribute('type', 'checkbox');
    checkboxItem.setAttribute('id', 'checkbox_item');
    newItem.appendChild(checkboxItem);

    newItem.addEventListener('click', async (e) => {
        if (e.target == checkboxItem) {
            return;
        }
        let choice = await currentItems.find(item => item.id === id);
        chrome.storage.sync.set({ current_data: choice});
        changeTab(OBJS.NOTE);
        loadNoteData();
    });

    return newItem;
}

chrome.storage.sync.get(OBJS.ITEMS, (data)=> {
    if (data.items) {
        for (let item of data.items) {
            list.appendChild(generateEle(item.id, item.title));
        }
        currentItems = data.items;
        total.innerText = currentItems.length;
    }
});

const dispatchItems = () => chrome.storage.sync.set({ items: currentItems });

deleteBtn.addEventListener('click', () => {
    let selectedItems = document.querySelectorAll('li.selected');
    for (let item of selectedItems) {
        list.removeChild(item);
        currentItems = currentItems.filter((currentItem) => currentItem.id !== item.id);
    }
    dispatchItems();
});

newBtn.addEventListener('click', () => {
    let newData = {
        id: Date.now(),
        title: Date.now(),
        content: ""
    }
    
    currentItems.push(newData);
    dispatchItems();

    list.appendChild(generateEle(newData.id, newData.title));
});

// const removeNoteOutOfItems = (itemId) => {
//     currentItems.splice(currentItems.indexOf(itemId), 1);
//     chrome.storage.sync.set({ items: currentItems });
// }

// **************** note tab ****************

notePanel.addEventListener('DOMContentLoaded', () => {
    noteInput.scrollTop = noteInput.scrollHeight;
});

notePanel.addEventListener("mouseenter", () => {
    notePanel.classList.add("active");
});

notePanel.addEventListener("mouseleave", () => {
    notePanel.classList.remove("active");
});

homeBtn.addEventListener("click", () => {
    changeTab(OBJS.LIST);
});

let currentData = {
    id: "",
    title: "",
    content: ""
};

const loadNoteData = () => {
    chrome.storage.sync.get(OBJS.CURRENT_DATA, (data) => {
        if(data.current_data) {
            noteInput.value = data.current_data.content;
            currentData = data.current_data;
            noteName.innerText = data.current_data.title;
        }
    });
}

const updateNoteDataById = () => {
    currentItems.map((item, index) => {
        if (item.id === currentData.id) {
            currentItems[index] = currentData;
        }
    });

    dispatchItems();
}

const saveData = () => {
    currentData.content = noteInput.value;

    chrome.storage.sync.set({ current_data: currentData}, () => {
        images[3].src = ICONS.DONE_STATE;
    });

    updateNoteDataById();
}

saveBtn.addEventListener("click", () => {
    saveData();
});

noteInput.addEventListener('input', () => {
    for (let image of images) {
        image.style.opacity = "1";
    }
    images[0].src = ICONS.RESET_STATE;
    images[1].src = ICONS.DOWNLOAD_STATE;
    images[2].src = ICONS.COPY_STATE;
    images[3].src = ICONS.SAVE_STATE;
    setTimeout(() => {
        saveData();
    }, 1000)
});

resetBtn.addEventListener("click", () => {
    chrome.storage.sync.remove(OBJS.CURRENT_DATA, () => {
        noteInput.value = "";
        currentData.content = "";
        updateNoteDataById();
        images[0].src = ICONS.DONE_STATE;
    });
});

downloadBtn.addEventListener("click", () => {
    var filename = OBJS.DOWNLOAD_FILE_NAME;
    let note = noteInput.value;

    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(note));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    images[1].src = ICONS.DONE_STATE;
}, false);

copyBtn.addEventListener("click", () => {
    let note = noteInput.value;
    navigator.clipboard.writeText(note).then(() => {
        images[2].src = ICONS.DONE_STATE;
    }, () => {
        alert("Error copying note");
    });
});