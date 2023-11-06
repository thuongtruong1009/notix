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
let listItem = document.querySelector('#list_panel > ul > li');
let deleteBtn = document.querySelector('#list_header > #delete_btn');
let newBtn = document.querySelector('#list_header > #new_btn');

const ICONS = {
    SAVE_STATE: "/icons/save.svg",
    DONE_STATE: "/icons/tick.svg",
    COPY_STATE: "/icons/copy.svg",
    RESET_STATE: "/icons/reset.png",
    DOWNLOAD_STATE: "/icons/download.png",
    EDIT_STATE: "/icons/edit.svg",
    CANCEL_STATE: "/icons/cancel.svg"
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

let notesList = [];
let removesList = [];

const dispatchNotesList = () => chrome.storage.sync.set({ items: notesList });

const deleteSelectedNotes = () => {
    removesList.length > 0 ? deleteBtn.classList.remove('disabled') : deleteBtn.classList.add('disabled');

    deleteBtn.addEventListener('click', () => {
        for (let currentSelect of removesList) {
            list.removeChild(document.getElementById(currentSelect));
            notesList = notesList.filter((currentItem) => currentItem.id !== currentSelect);
        }
        dispatchNotesList();
        loadNotesList();
    });
}

const updateNoteById = () => {
    notesList.map((item, index) => {
        if (item.id === currentNoteData.id) {
            notesList[index] = currentNoteData;
        }
    });

    dispatchNotesList();
}

const createNewNote = (id, title) => {
    let newItem = document.createElement('li');
    newItem.setAttribute('id', id);
    
    let titleBtn = document.createElement('button');
    titleBtn.setAttribute('type', 'button');

    let titleBtnSpan = document.createElement('span');
    titleBtnSpan.classList.add('note_title');
    titleBtnSpan.innerText = title;

    titleBtnSpan.addEventListener('click', async () => {
        let choice = await notesList.find(item => item.id === id);
        chrome.storage.sync.set({ current_data: choice});
        changeTab(OBJ_KEYS.NOTE);
        loadCurrentNoteData();
    });

    titleBtn.appendChild(titleBtnSpan);

    let editBtn = document.createElement('img');
    editBtn.setAttribute('src', ICONS.EDIT_STATE);
    editBtn.classList.add('edit_btn');
    editBtn.setAttribute('title', 'edit');
    titleBtn.appendChild(editBtn);

    editBtn.addEventListener('click', () => {
        titleBtn.innerHTML = "";
        newItem.classList.add('choiced');

        let titleEditInput = document.createElement('input');
        titleEditInput.setAttribute('type', 'text');
        titleEditInput.classList.add('note_title');
        titleEditInput.value = title;
        titleEditInput.setAttribute('title', 'edit');
        titleEditInput.style.cursor = "auto";
        titleBtn.appendChild(titleEditInput);
        titleEditInput.focus();

        let titleCancelEditBtn = document.createElement('img');
        titleCancelEditBtn.setAttribute('src', ICONS.CANCEL_STATE);
        titleCancelEditBtn.classList.add('cancel_btn');
        titleCancelEditBtn.setAttribute('title', 'cancel');
        titleBtn.appendChild(titleCancelEditBtn);

        const cancelEdit = () => {
            titleEditInput.replaceWith(titleBtnSpan);
            titleEditDoneBtn.replaceWith(editBtn);
            titleEditInput.remove();
            titleEditDoneBtn.remove();
            titleCancelEditBtn.remove();
            newItem.classList.remove('choiced');
        }

        titleCancelEditBtn.addEventListener('click', () => {
            cancelEdit();
        });

        let titleEditDoneBtn = document.createElement('img');
        titleEditDoneBtn.setAttribute('src', ICONS.SAVE_STATE);
        titleEditDoneBtn.classList.add('edit_btn');
        titleEditDoneBtn.setAttribute('title', 'done');
        titleBtn.appendChild(titleEditDoneBtn);

        titleEditDoneBtn.addEventListener('click', async () => {
            title = titleEditInput.value;
            titleBtnSpan.innerText = title;
            notesList.map((item, index) => {
                if (item.id === id) {
                    notesList[index].title = title;
                }
            });
            await dispatchNotesList();
            cancelEdit();
        });
    });

    newItem.appendChild(titleBtn);

    let checkboxItem = document.createElement('input');
    checkboxItem.setAttribute('type', 'checkbox');
    checkboxItem.classList.add('checkbox_item');
    checkboxItem.setAttribute('id', `checkbox_item_${id}`);
    checkboxItem.setAttribute('title', 'select');
    newItem.appendChild(checkboxItem);

    let checkboxEffect = document.createElement('label');
    checkboxEffect.setAttribute('for', `checkbox_item_${id}`);
    newItem.appendChild(checkboxEffect);

    checkboxItem.addEventListener('click', () => {
        if (checkboxItem.checked === true) {
            removesList.push(id);
        } else {
            removesList = removesList.filter((currentItem) => currentItem !== id);
        }

        deleteSelectedNotes();
    });

    return newItem;
}

const loadNotesList = () => {
    list.innerHTML = "";
    chrome.storage.sync.get(OBJ_KEYS.ITEMS, (data)=> {
        if (data.items) {
            for (let item of data.items) {
                list.appendChild(createNewNote(item.id, item.title));
            }
            notesList = data.items;
            total.innerText = notesList.length;
        }
    });
}

loadNotesList();

newBtn.addEventListener('click', () => {
    let newData = {
        id: Date.now(),
        title: Date.now(),
        content: ""
    }
    
    notesList.push(newData);
    dispatchNotesList();

    list.appendChild(createNewNote(newData.id, newData.title));
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

let currentNoteData = {
    id: "",
    title: "",
    content: ""
};

const loadCurrentNoteData = () => {
    chrome.storage.sync.get(OBJ_KEYS.CURRENT_DATA, (data) => {
        if(data.current_data) {
            noteInput.value = data.current_data.content;
            currentNoteData = data.current_data;
            noteName.innerText = data.current_data.title;
        }
    });
}

loadCurrentNoteData();

const saveData = () => {
    currentNoteData.content = noteInput.value;

    chrome.storage.sync.set({ current_data: currentNoteData}, () => {
        images[3].src = ICONS.DONE_STATE;
        images[3].title = "saved";
    });

    updateNoteById();
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
        currentNoteData.content = "";
        updateNoteById();
        images[0].src = ICONS.DONE_STATE;
    });
});

downloadBtn.addEventListener("click", () => {
    var filename = `notix_${currentNoteData.title}.txt`;

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
        images[2].title = "copied";
    }, () => {
        alert("Error copying note");
    });
});