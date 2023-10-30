let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")

let notePanel = document.querySelector("#note_panel")
let listPanel = document.querySelector("#list_panel")

let noteHeader = document.querySelector("#note_header")
let listHeader = document.querySelector("#list_header")

let homeBtn = document.querySelector('#note_header #home');

let list = document.querySelector('#list_panel > ul');
let newBtn = document.querySelector('#list_header > #new_btn');
let listItem = document.querySelector('#list_panel > ul > li');

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
    CURRENT_DATA: "current_data"
}

const tabListStyle = () => {
    listHeader.style.display = "flex"
    noteHeader.style.display = "none"
    notePanel.style.display = "none"
    listPanel.style.display = "flex"
}

const tabNoteStyle = () => {
    listHeader.style.display = "none"
    noteHeader.style.display = "flex"
    notePanel.style.display = "flex"
    listPanel.style.display = "none"
}

const persistCurrentTabStyle = (tab) => {
    tab === OBJS.NOTE ? tabNoteStyle() : tabListStyle()
}

const changeTab = (tab) => {
    persistCurrentTabStyle(tab)
    chrome.storage.sync.set({ tab: tab });
}

chrome.storage.sync.get(OBJS.TAB, (data) => persistCurrentTabStyle(data.tab));

let currentData = {
    id: "",
    title: "",
    content: ""
};

// **************** list tab ****************

let currentItems = [];

chrome.storage.sync.get(OBJS.ITEMS, (data)=> {
    if (data.items) {
        for (let item of data.items) {
            let newItem = document.createElement('li');
            newItem.innerHTML = item.title;
            newItem.setAttribute('id', item.id);
            list.appendChild(newItem);
        }
        currentItems = data.items;
    }
});

const dispatchItems = () => chrome.storage.sync.set({ items: currentItems });

newBtn.addEventListener('click', () => {
    let newData = {
        id: Date.now(),
        title: Date.now(),
        content: ""
    }
    let newItem = document.createElement('li');
    newItem.setAttribute('id', newData.id);
    newItem.innerHTML = `<p>${newData.title}</p>`;
    list.appendChild(newItem);

    currentItems.push(newData);
    dispatchItems();
});

list.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI' || event.target.tagName === 'P') {
        let choice = currentItems.find(item => item.id === event.target.id);

        chrome.storage.sync.set({ current_data: choice});
        changeTab(OBJS.NOTE);
    }
})

// const removeOutOfItems = (itemId) => {
//     items.splice(items.indexOf(itemId), 1);
//     chrome.storage.sync.set({ items: items });
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

chrome.storage.sync.get(OBJS.CURRENT_DATA, (data) => {
    if(data.current_data) {
        noteInput.value = data.current_data.content
        currentData = data.current_data
    }
});

const saveData = () => {
    // let newData = {
    //     id: currentData.id,
    //     title: currentData.title,
    //     content: noteInput.value
    // };
    currentData.content = noteInput.value

    chrome.storage.sync.set({ current_data: currentData}, () => {
        images[4].src = ICONS.DONE_STATE;

        currentItems.map((item, index) => {
            if (item.id === currentData.id) {
                currentItems[index] = currentData;
            }
        });

        dispatchItems();
    });
}

saveButton.addEventListener("click", () => {
    saveData()
});

noteInput.addEventListener('input', () => {
    for (let image of images) {
        image.style.opacity = "1"
    }
    images[1].src = ICONS.DELETE_STATE
    images[2].src = ICONS.DOWNLOAD_STATE
    images[3].src = ICONS.COPY_STATE
    images[4].src = ICONS.SAVE_STATE
    setTimeout(() => {
        saveData()
    }, 1000)
});

deleteButton.addEventListener("click", () => {
    chrome.storage.sync.remove(OBJS.CURRENT_DATA, function() {
        noteInput.value = "";
        images[1].src = ICONS.DONE_STATE
    });
    // removeOutOfItems(currentData.id);
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
    images[2].src = ICONS.DONE_STATE
}, false);

copyButton.addEventListener("click", () => {
    let note = noteInput.value;
    navigator.clipboard.writeText(note).then(() => {
        images[3].src = ICONS.DONE_STATE
    }, () => {
        alert("Error copying note");
    });
});