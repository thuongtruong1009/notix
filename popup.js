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

const OBJ_KEYS = {
    NOTE: "note",
    LIST: "list",
    TAB: "tab",
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
    tab === OBJ_KEYS.NOTE ? tabNoteStyle() : tabListStyle();
}

const changeTab = (tab) => {
    persistCurrentTabStyle(tab);
    chrome.storage.sync.set({ tab: tab });
}

chrome.storage.sync.get(OBJ_KEYS.TAB, (data) => persistCurrentTabStyle(data.tab));

// **************** list tab ****************

let itemsList = [];
let removesList = [];

const dispatchItems = () => chrome.storage.sync.set({ items: itemsList });

const deleteSelectedItems = () => {
    removesList.length > 0 ? deleteBtn.classList.remove('disabled') : deleteBtn.classList.add('disabled');

    deleteBtn.addEventListener('click', () => {
        for (let currentSelect of removesList) {
            list.removeChild(document.getElementById(currentSelect));
            itemsList = itemsList.filter((currentItem) => currentItem.id !== currentSelect);
        }
        dispatchItems();
        loadItemsList();
    });
}

const createNewItem = (id, title) => {
    let newItem = document.createElement('li');
    newItem.innerHTML = `<button>${title}</button>`;
    newItem.setAttribute('id', id);

    let checkboxItem = document.createElement('input');
    checkboxItem.setAttribute('type', 'checkbox');
    checkboxItem.classList.add('checkbox_item');
    checkboxItem.setAttribute('id', `checkbox_item_${id}`);
    newItem.appendChild(checkboxItem);

    let checkboxEffect = document.createElement('label');
    checkboxEffect.setAttribute('for', `checkbox_item_${id}`);
    newItem.appendChild(checkboxEffect);

    newItem.addEventListener('click', async (e) => {
        if (e.target == checkboxItem || e.target == checkboxEffect) {
            return;
        }
        let choice = await itemsList.find(item => item.id === id);
        chrome.storage.sync.set({ current_data: choice});
        changeTab(OBJ_KEYS.NOTE);
        loadNoteData();
    });

    checkboxItem.addEventListener('click', () => {
        if (checkboxItem.checked === true) {
            removesList.push(id);
        } else {
            removesList = removesList.filter((currentItem) => currentItem !== id);
        }

        deleteSelectedItems();
    });

    return newItem;
}

const loadItemsList = () => {
    list.innerHTML = "";
    chrome.storage.sync.get(OBJ_KEYS.ITEMS, (data)=> {
        if (data.items) {
            for (let item of data.items) {
                list.appendChild(createNewItem(item.id, item.title));
            }
            itemsList = data.items;
            total.innerText = itemsList.length;
        }
    });
}

loadItemsList();

newBtn.addEventListener('click', () => {
    let newData = {
        id: Date.now(),
        title: Date.now(),
        content: ""
    }
    
    itemsList.push(newData);
    dispatchItems();

    list.appendChild(createNewItem(newData.id, newData.title));
});

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
    changeTab(OBJ_KEYS.LIST);
});

let currentData = {
    id: "",
    title: "",
    content: ""
};

const loadNoteData = () => {
    chrome.storage.sync.get(OBJ_KEYS.CURRENT_DATA, (data) => {
        if(data.current_data) {
            noteInput.value = data.current_data.content;
            currentData = data.current_data;
            noteName.innerText = data.current_data.title;
        }
    });
}

loadNoteData();

const updateNoteDataById = () => {
    itemsList.map((item, index) => {
        if (item.id === currentData.id) {
            itemsList[index] = currentData;
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
    chrome.storage.sync.remove(OBJ_KEYS.CURRENT_DATA, () => {
        noteInput.value = "";
        currentData.content = "";
        updateNoteDataById();
        images[0].src = ICONS.DONE_STATE;
    });
});

downloadBtn.addEventListener("click", () => {
    var filename = `notix_${currentData.title}.txt`;

    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(noteInput.value));
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