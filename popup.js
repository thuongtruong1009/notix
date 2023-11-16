let logo = document.getElementById("logo"),
    homeBtn = document.querySelector('#home'),

    main = document.querySelector("main"),
    header = document.querySelector("main > header"),

    noteHeader = document.querySelector("#note_header"),
    listHeader = document.querySelector("#list_header"),

    noteName = document.querySelector("#note_name"),
    total = document.querySelector("#total"),

    listPanel = document.querySelector("#list_panel"),
    notePanel = document.querySelector("#note_panel"),
    notePanelHeader = document.querySelector(".note_head_panel"),
    searchPanel = document.querySelector("#search_panel"),
    emptyImage = document.querySelector("#list_panel .empty_img"),
    notFoundImage = document.querySelector("#list_panel .not_found_img"),
    newAreaLine = document.querySelector("#list_panel .empty_img #new_area_line"),

    list = document.querySelector('#list_panel > ul'),
    listItem = document.querySelector('#list_panel > ul > li'),
    deleteBtn = document.querySelector('#list_header > #delete_btn'),
    newBtn = document.querySelector('#list_header > #new_btn'),
    searchBtn = document.querySelector('#list_header > #search_btn'),
    searchInput = document.querySelector('#list_header > #search_panel > #search_input'),
    searchCloseBtn = document.querySelector('#list_header > #search_panel > #search_close_btn'),

    noteInput = document.getElementById("note"),
    settingsBtn = document.getElementById('settings_btn'),
    clearBtn = document.getElementById("clear"),
    copyLinkBtn = document.getElementById("copy_link"),
    captureBtn = document.getElementById("capture"),
    downloadImageBtn = document.getElementById("download_img"),
    downloadTextBtn = document.getElementById("download_text"),
    copyTextBtn = document.getElementById("copy_text"),
    saveBtn = document.getElementById("save"),
    images = document.querySelectorAll("#note_header > li > img"),

    noteInformation = document.getElementById("note_information"),
    voiceTextBtn = document.getElementById("voice_text"),
    audioTextBtn = document.getElementById("audio_text"),
    settings = document.getElementById('settings');

const tabListStyle = () => {
    listHeader.style.display = "flex";
    noteHeader.style.display = "none";
    notePanel.style.display = "none";
    listPanel.style.display = "flex";
    logo.style.display = "flex";
    homeBtn.style.display = "none";
    noteName.style.display = "none";
    notePanelHeader.style.display = "none";
}

const tabNoteStyle = () => {
    listHeader.style.display = "none";
    noteHeader.style.display = "flex";
    notePanel.style.display = "flex";
    listPanel.style.display = "none";
    logo.style.display = "none";
    homeBtn.style.display = "block";
    noteName.style.display = "inline-flex";
    notePanelHeader.style.display = "flex";
}

const dynamicImport = async (path) => {
    let src = chrome.runtime.getURL(path);
    return await import(src);
}

(async () => {
    const contentVariables = await dynamicImport("./modules/scripts/variables.js");
    let ICONS = contentVariables.ICONS;
    let OBJ_KEYS = contentVariables.OBJ_KEYS;
    
    const contentHelpers = await dynamicImport("./modules/scripts/helpers.js");
    let calLastUpdate = contentHelpers.calLastUpdate;
    let exportToImage = contentHelpers.exportToImage;

    const contentStorage = await dynamicImport("./modules/scripts/storage.js");
    let loadTab = contentStorage.loadTab;
    let dispatchTab = contentStorage.dispatchTab;

    let loadNotes = contentStorage.loadNotes;
    let dispatchNotes = contentStorage.dispatchNotes;

    let loadCurrentNote = contentStorage.loadCurrentNote;
    let dispatchCurrentNote = contentStorage.dispatchCurrentNote;

    let loadAutoSettings = contentStorage.loadAutoSettings;
    let loadAudioSettings = contentStorage.loadAudioSettings;

    const persistCurrentTabStyle = (tab) => {
        tab === OBJ_KEYS.NOTE ? tabNoteStyle() : tabListStyle();
    }

    const changeTab = (tab) => {
        persistCurrentTabStyle(tab);
        dispatchTab(tab);
    }

    loadTab((data) => persistCurrentTabStyle(data.tab));

// **************** list tab ****************

    let notesList = [];
    let removesList = [];

    const dispatchNotesList = () => dispatchNotes(notesList);

    const listApperanceStyle = () => {
        if (notesList.length > 0) {
            emptyImage.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
            list.classList.remove("inactive");
            deleteBtn.style.display = "flex";
            searchBtn.style.display = "flex";
        } 
        else {
            emptyImage.classList.add(OBJ_KEYS.ACTIVE_CLASS);
            list.classList.add("inactive");
            deleteBtn.style.display = "none";
            searchBtn.style.display = "none";
        }
    }

    const deleteSelectedNotes = () => {
        removesList.length > 0 ? deleteBtn.classList.remove('disabled') : deleteBtn.classList.add('disabled');

        deleteBtn.onclick = () => {
            for (let currentSelect of removesList) {
                list.removeChild(document.getElementById(currentSelect));
                notesList = notesList.filter((currentItem) => currentItem.id !== currentSelect);
            }
            dispatchNotesList();
            loadNotesList();
        };
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

        titleBtnSpan.onclick = async () => {
            let choice = await notesList.find(item => item.id === id);
            chrome.storage.sync.set({ current_data: choice});
            loadCurrentNoteData();
            changeTab(OBJ_KEYS.NOTE);
        };

        titleBtn.appendChild(titleBtnSpan);

        let editBtn = document.createElement('img');
        editBtn.setAttribute('src', ICONS.EDIT_STATE);
        editBtn.classList.add('edit_btn');
        editBtn.setAttribute('title', 'edit');
        titleBtn.appendChild(editBtn);

        editBtn.onclick = () => {
            titleBtn.innerHTML = "";
            newItem.classList.add('choiced');

            let titleEditInput = document.createElement('input');
            titleEditInput.setAttribute('type', 'text');
            titleEditInput.setAttribute('maxlength', '50');
            titleEditInput.setAttribute('required', 'true');
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

            titleCancelEditBtn.onclick = () => {
                cancelEdit();
            };

            let titleEditDoneBtn = document.createElement('img');
            titleEditDoneBtn.setAttribute('src', ICONS.SAVE_STATE);
            titleEditDoneBtn.classList.add('edit_btn');
            titleEditDoneBtn.setAttribute('title', 'done');
            titleBtn.appendChild(titleEditDoneBtn);

            titleEditDoneBtn.onclick = async () => {
                title = titleEditInput.value;
                titleBtnSpan.innerText = title;
                notesList.map((item, index) => {
                    if (item.id === id) {
                        notesList[index].title = title;
                    }
                });
                await dispatchNotesList();
                cancelEdit();
            };
        };

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

        checkboxItem.onclick = () => {
            if (checkboxItem.checked === true) {
                removesList.push(id);
            } else {
                removesList = removesList.filter((currentItem) => currentItem !== id);
            }

            deleteSelectedNotes();
        };

        listApperanceStyle();

        return newItem;
    }

    const loadNotesList = async () => {
        list.innerHTML = "";
        await loadNotes((data)=> {
            if (data.items) {
                for (let item of data.items) {
                    list.appendChild(createNewNote(item.id, item.title));
                }
                notesList = data.items;
                total.innerText = notesList.length;

            }
            listApperanceStyle();
        });
    }
    
    loadNotesList();

    const createNew = () => {
        let newData = {
            id: Date.now(),
            title: `New note ${Date.now()}`,
            content: "",
            lastUpdate: Date.now()
        }
        
        notesList.push(newData);
        dispatchNotesList();
    
        list.appendChild(createNewNote(newData.id, newData.title));
    }

    newBtn.onclick = () => {
        createNew();
    };

    newAreaLine.onclick = () => {
        createNew();
    };

    searchBtn.onclick = () => {
        searchPanel.classList.add(OBJ_KEYS.ACTIVE_CLASS);
        searchInput.focus();

        searchCloseBtn.onclick = () => {
            searchInput.value = "";
            searchPanel.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
            loadNotesList();
            notFoundImage.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
        };

        searchInput.oninput = () => {
            let searchValue = searchInput.value.toLowerCase();
            let searchList = notesList.filter((item) => item.title.toLowerCase().includes(searchValue));
            list.innerHTML = "";

            for (let item of searchList) {
                list.appendChild(createNewNote(item.id, item.title));
            }

            if(searchList.length === 0) {
                notFoundImage.classList.add(OBJ_KEYS.ACTIVE_CLASS);
                list.classList.add("inactive");
            } else {
                notFoundImage.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
                list.classList.remove("inactive");
            }
        }
    }

// **************** note tab ****************

    let currentNoteData = {
        id: "",
        title: "",
        content: "",
        lastUpdate: ""
    };

    let currentExportName = "";

    // const persistNoteBtnStyle = {
    //     unDone: (order) => {
    //         images[order].src = ICONS.SAVE_STATE;
    //         images[order].title = "save";
    //     }

        // for (let image of images) {
        //     image.style.opacity = "1";
        // }
        // images[0].src = ICONS.CLEAR_STATE;
        // images[1].src = ICONS.CAPTURE_STATE;
        // images[2].src = ICONS.DOWNLOAD_IMG_STATE;
        // images[3].src = ICONS.DOWNLOAD_TEXT_STATE;
        // images[4].src = ICONS.COPY_STATE;
        // images[5].src = ICONS.SAVE_STATE;
    // 

    const loadCurrentNoteData = () => { 
        loadCurrentNote((data) => {
            if(data.current_data) {
                noteInput.value = data.current_data.content;
                currentNoteData = data.current_data;
                noteName.innerText = data.current_data.title;
                currentExportName = `notix_${data.current_data.title}`;
            }
        });
    }

    loadCurrentNoteData();

    notePanel.addEventListener('load', () => {
        noteInput.scrollTop = noteInput.scrollHeight;
    });
    
    homeBtn.onclick = () => {
        changeTab(OBJ_KEYS.LIST);
    };

    settingsBtn.onclick = () => {
        settings.classList.add(OBJ_KEYS.ACTIVE_CLASS);
    };

    const saveData = () => {
        currentNoteData.content = noteInput.value;
        currentNoteData.lastUpdate = Date.now();
    
        dispatchCurrentNote(currentNoteData, () => {
            updateNoteById();
    
            images[5].src = ICONS.DONE_STATE;
            images[5].title = "saved";
    
            setTimeout(() => {
                images[5].src = ICONS.SAVE_STATE;
                images[5].title = "save";
            }, 2000);
        });
    }
    
    saveBtn.onclick = () => {
        saveData();
    };

    let isAutoSave = true;

    const autoSave = async () => {
        await loadAutoSettings((data) => {
            if (data.auto_settings) {
                isAutoSave = data.auto_settings.autoSave;
            }
        });
    }

    autoSave();

    noteInput.oninput = async () => {
        await autoSave();
        if(isAutoSave) {
            setTimeout(() => {
                saveData();
            }, 1000) 
        } else {
            return false;
        }
    };
    
    clearBtn.onclick = () => {
        chrome.storage.sync.remove(OBJ_KEYS.CURRENT_DATA, () => {
            noteInput.value = "";
            currentNoteData.content = "";
            currentNoteData.lastUpdate = Date.now();
            updateNoteById();
            images[0].src = ICONS.DONE_STATE;
        });
    };
    
    downloadTextBtn.onclick = () => {
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(noteInput.value));
        element.setAttribute("download", `${currentExportName}.txt`);
    
        element.style.display = "none";
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
        images[3].src = ICONS.DONE_STATE;
        images[3].title = "downloaded text";
    };
    
    copyTextBtn.onclick = () => {
        let note = noteInput.value;
        navigator.clipboard.writeText(note).then(() => {
            images[4].src = ICONS.DONE_STATE;
            images[5].title = "copied text";
        }, () => {
            alert("Error when copying to clipboard");
        });
    };
    
    // paste image to note
    
    // document.onpaste = function (event) {
    //     var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    //     console.log(JSON.stringify(items));
    //     for (var index in items) {
    //         var item = items[index];
    //         if (item.kind === 'file') {
    //             var blob = item.getAsFile();
    //             var reader = new FileReader();
    //             reader.onload = function (event) {
    //                 console.log(event.target.result);
    //             }; 
    //             reader.readAsDataURL(blob);
    //         }
    //     }
    // };

    copyLinkBtn.onclick = () => {
        header.style.display = "none";
        notePanelHeader.style.display = "none";
        exportToImage(async(dataUrl) => {
            navigator.clipboard.writeText(dataUrl).then(() => {
                header.style.display = "flex";
                notePanelHeader.style.display = "flex";
                images[2].src = ICONS.DONE_STATE;
                images[2].title = "copied link";
            }, () => {
                alert("Error when copying to clipboard");
            });
        });
    };
    
    captureBtn.onclick = async () => {
        header.style.display = "none";
        notePanelHeader.style.display = "none";
    
        exportToImage(async(dataUrl) => {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': await fetch(dataUrl).then((r) => r.blob()),
                })
            ]);
    
            header.style.display = "flex";
            notePanelHeader.style.display = "flex";
            images[1].src = ICONS.DONE_STATE;
            images[1].title = "copied screenshot capture";
        });
    };
    
    downloadImageBtn.onclick = async () => {
        header.style.display = "none";
        notePanelHeader.style.display = "none";
    
        exportToImage(async(dataUrl) => {
            var element = document.createElement("a");
            element.setAttribute("href", dataUrl);
            element.setAttribute("download", `${currentExportName}.png`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
    
            header.style.display = "flex";
            notePanelHeader.style.display = "flex";
            images[2].src = ICONS.DONE_STATE;
            images[2].title = "downloaded image";
        });
    };

    // note information
    noteInformation.onclick = async () => {
        let totalLines = noteInput.value === "" ?  0 : noteInput.value.split("\n").length;
        let totalWords = noteInput.value.trim().split(/[\s]+/).length;
        let totalSizes = new Blob([noteInput.value]).size/1000 + " kb";
        let lastUpdate = calLastUpdate(currentNoteData.lastUpdate);

        let modalContent = document.getElementById("modal_content");

        modalContent.innerHTML = `<ul>
            <li><span>Total lines: </span>${totalLines}</li>
            <li><span>Total words: </span>${totalWords}</li>
            <li><span>Total size: </span>${totalSizes}</li>
            <li><span>Last update: </span>${lastUpdate}</li>
        </ul>`

        let title = document.getElementById("modal_title");
        title.innerText = "Statistics";

        let modal = document.getElementById("modal");
        modal.classList.add(OBJ_KEYS.ACTIVE_CLASS);

        var closeBtn = document.getElementsByClassName("modal_btn--close")[0];
        closeBtn.onclick = () => {
            modal.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
        }

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.classList.remove(OBJ_KEYS.ACTIVE_CLASS);
            }
        }
    };

    // audio text
    let isAudioReading = false;
    let msg = new SpeechSynthesisUtterance();

    let audioSettings = {
        voice: "0",
        vol: "1",
        pitch: "1",
        rate: "1",
    };

    const loadAudioSettingsData = async () => {
        await loadAudioSettings((data) => {
            if (data.audio_settings) {
                audioSettings = data.audio_settings;
            }
        });
    }

    loadAudioSettingsData();

    const turnOffAudio = () => {
        speechSynthesis.cancel();
        isAudioReading = false;
        audioTextBtn.src = ICONS.MUTE_STATE;
        audioTextBtn.title = "muted audio";
    }
    
    const turnOnAudio = () => {
        if ("speechSynthesis" in window) {
            isAudioReading = true;
            audioTextBtn.src = ICONS.AUDIO_STATE;
            audioTextBtn.title = "audio text";
            msg.voice = speechSynthesis.getVoices()[audioSettings.voice];
            msg.text = noteInput.value;
            msg.volume = audioSettings.vol;
            msg.pitch = audioSettings.pitch;
            msg.rate = audioSettings.rate;
            speechSynthesis.speak(msg);
            return false;
        }
    }
    
    audioTextBtn.onclick = async () => {
        await loadAudioSettingsData();
        isAudioReading ? turnOffAudio() : turnOnAudio();
    };
    
    // voice recognition
    voiceTextBtn.onclick = () => {
        var permission = navigator.permissions.query({name: 'microphone'});
        permission.then((permissionStatus) => {
            if (permissionStatus.state == "granted") {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                    
                    // var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
                    // var recognition = new SpeechRecognition();

                    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

                    recognition.continuous = true;
                    recognition.interimResults = true;
                    
                    recognition.onresult = (event) => {
                        const result = event.results[event.resultIndex][0].transcript;
                        noteInput.value += result;
                    };

                    // recognition.onresult = function(event) {
                    //     var transcript = event.results[0][0].transcript;
                    //     output.innerHTML = "<b>Text:</b> " + transcript;
                    // };

                    // recognition.onspeechend = function() {
                    //     action.innerHTML = "<small>stopped listening, hope you are done...</small>";
                    //     recognition.stop();
                    // }
                    
                    recognition.onerror = (event) => {
                        alert('Speech recognition error. Please try again.', event.error);
                    };

                    recognition.start();
                    voiceTextBtn.src = ICONS.RECORDING_STATE;
                    voiceTextBtn.title = "recording";
                    noteInput.value += " ";
    
                    voiceTextBtn.onclick = () => {
                        recognition.stop();
                        saveData();
                        voiceTextBtn.src = ICONS.VOICE_STATE;
                        voiceTextBtn.title = "voice to text";
                    };
                }).catch((error) => {
                    console.error('Error accessing the microphone:', error);
                });
            } else {
                const enableMicString = "Microphone access denied. Please allow microphone access in your browser settings.\n\n* Step 1: Right click on the Notix extension icon\n* Step 2: Choose View web permission option\n* Step 3: Change microphone selection to Allow";
                alert(enableMicString);
            }
        });
    };
})();