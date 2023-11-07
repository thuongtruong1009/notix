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
let screenshotBtn = document.getElementById("screenshot");
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
    CANCEL_STATE: "/icons/cancel.svg",
    SCREENSHOT_STATE: "/icons/screenshot.png"
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
        images[4].src = ICONS.DONE_STATE;
        images[5].title = "saved";
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
    images[1].src = ICONS.SCREENSHOT_STATE;
    images[2].src = ICONS.DOWNLOAD_STATE;
    images[3].src = ICONS.COPY_STATE;
    images[4].src = ICONS.SAVE_STATE;
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
    images[2].src = ICONS.DONE_STATE;
}, false);

const copyToClipboard = (text, cb) => {
    navigator.clipboard.writeText(text).then(() => {
        cb();
    }, () => {
        alert("Error when copying to clipboard");
    });
}

copyBtn.addEventListener("click", () => {
    let note = noteInput.value;
    copyToClipboard(note, () => {
        images[3].src = ICONS.DONE_STATE;
        images[3].title = "copied";
    });
});

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

screenshotBtn.addEventListener("click", () => {
    let header = document.querySelector("main > header");
    let main = document.querySelector("main");
    header.style.display = "none";
    domtoimage.toPng(main).then(async(dataUrl) => {
        // var img = new Image();
        // img.src = dataUrl;
        // copyToClipboard(img, () => {
        //     images[1].src = ICONS.DONE_STATE;
        //     images[1].title = "copied";
        // });

        await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': await fetch(dataUrl).then((r) => r.blob()),
            })
        ]);
        
        // window.open(dataUrl);

        // var element = document.createElement("a");
        // element.setAttribute("href", dataUrl);
        // element.setAttribute("download", "image.png");
        // element.style.display = "none";
        // document.body.appendChild(element);
        // element.click();
        // document.body.removeChild(element);
        notePanel.style.backgroundColor = "transparent";
        header.style.display = "flex";
    }).catch((error) => {
        alert('oops, something went wrong!', error);
    });
});

// function b64toBlob(b64Data, contentType = null, sliceSize = null) {
//     contentType = contentType || 'image/png'
//     sliceSize = sliceSize || 512
//     let byteCharacters = atob(b64Data)
//     let byteArrays = []
//     for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//       let slice = byteCharacters.slice(offset, offset + sliceSize)
//       let byteNumbers = new Array(slice.length);
//       for (let i = 0; i < slice.length; i++) {
//         byteNumbers[i] = slice.charCodeAt(i)
//       }
//       var byteArray = new Uint8Array(byteNumbers)
//       byteArrays.push(byteArray)
//     }
//     return new Blob(byteArrays, {type: contentType})
//   }

  
// function clip(b64Data) {
//     const item = new clipboard.ClipboardItem({
//       "image/png": this.b64toBlob(b64Data.replace('data:image/jpg;base64,', ''), 'image/png', 512)
//     });
//   }

!function(a){"use strict";function b(a,b){return b=b||{},Promise.resolve(a).then(function(a){return e(a,b.filter)}).then(f).then(g).then(function(a){return b.bgcolor&&(a.style.backgroundColor=b.bgcolor),a}).then(function(b){return h(b,a.scrollWidth,a.scrollHeight)})}function c(a,b){return i(a,b||{}).then(function(a){return a.toDataURL()})}function d(a,b){return i(a,b||{}).then(n.canvasToBlob)}function e(b,c){function d(a){return a instanceof HTMLCanvasElement?n.makeImage(a.toDataURL()):a.cloneNode(!1)}function f(a,b,c){function d(a,b,c){var d=Promise.resolve();return b.forEach(function(b){d=d.then(function(){return e(b,c)}).then(function(b){b&&a.appendChild(b)})}),d}var f=a.childNodes;return 0===f.length?Promise.resolve(b):d(b,n.asArray(f),c).then(function(){return b})}function g(b,c){function d(){function d(a,b){function c(a,b){n.asArray(a).forEach(function(c){b.setProperty(c,a.getPropertyValue(c),a.getPropertyPriority(c))})}a.cssText?b.cssText=a.cssText:c(a,b)}d(a.window.getComputedStyle(b),c.style)}function e(){function d(d){function e(b,c,d){function e(a){var b=a.getPropertyValue("content");return a.cssText+" content: "+b+";"}function f(a){function b(b){return b+": "+a.getPropertyValue(b)+(a.getPropertyPriority(b)?" !important":"")}return n.asArray(a).map(b).join("; ")+";"}var g="."+b+":"+c,h=d.cssText?e(d):f(d);return a.document.createTextNode(g+"{"+h+"}")}var f=a.window.getComputedStyle(b,d),g=f.getPropertyValue("content");if(""!==g&&"none"!==g){var h=n.uid();c.className=c.className+" "+h;var i=a.document.createElement("style");i.appendChild(e(h,d,f)),c.appendChild(i)}}[":before",":after"].forEach(function(a){d(a)})}function f(){b instanceof HTMLTextAreaElement&&(c.innerHTML=b.value)}function g(){c instanceof SVGElement&&c.setAttribute("xmlns","http://www.w3.org/2000/svg")}return c instanceof Element?Promise.resolve().then(d).then(e).then(f).then(g).then(function(){return c}):c}return c&&!c(b)?Promise.resolve():Promise.resolve(b).then(d).then(function(a){return f(b,a,c)}).then(function(a){return g(b,a)})}function f(a){return p.resolveAll().then(function(b){var c=document.createElement("style");return a.appendChild(c),c.appendChild(document.createTextNode(b)),a})}function g(a){return q.inlineAll(a).then(function(){return a})}function h(a,b,c){return Promise.resolve(a).then(function(a){return a.setAttribute("xmlns","http://www.w3.org/1999/xhtml"),(new XMLSerializer).serializeToString(a)}).then(n.escapeXhtml).then(function(a){return'<foreignObject x="0" y="0" width="100%" height="100%">'+a+"</foreignObject>"}).then(function(a){return'<svg xmlns="http://www.w3.org/2000/svg" width="'+b+'" height="'+c+'">'+a+"</svg>"}).then(function(a){return"data:image/svg+xml;charset=utf-8,"+a})}function i(a,c){function d(a){var b=document.createElement("canvas");return b.width=a.scrollWidth,b.height=a.scrollHeight,b}return b(a,c).then(n.makeImage).then(n.delay(100)).then(function(b){var c=d(a);return c.getContext("2d").drawImage(b,0,0),c})}function j(){function b(){var a="application/font-woff",b="image/jpeg";return{woff:a,woff2:a,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:b,jpeg:b,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml"}}function c(a){var b=/\.([^\.\/]*?)$/g.exec(a);return b?b[1]:""}function d(a){var d=c(a).toLowerCase();return b()[d]||""}function e(a){return-1!==a.search(/^(data:)/)}function f(a){return new Promise(function(b){for(var c=window.atob(a.toDataURL().split(",")[1]),d=c.length,e=new Uint8Array(d),f=0;d>f;f++)e[f]=c.charCodeAt(f);b(new Blob([e],{type:"image/png"}))})}function g(a){return a.toBlob?new Promise(function(b){a.toBlob(b)}):f(a)}function h(b,c){var d=a.document.implementation.createHTMLDocument(),e=d.createElement("base");d.head.appendChild(e);var f=d.createElement("a");return d.body.appendChild(f),e.href=c,f.href=b,f.href}function i(){var a=0;return function(){function b(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)}return"u"+b()+a++}}function j(a){return new Promise(function(b,c){var d=new Image;d.onload=function(){b(d)},d.onerror=c,d.src=a})}function k(a){var b=3e4;return new Promise(function(c,d){function e(){if(4===g.readyState){if(200!==g.status)return void d(new Error("Cannot fetch resource "+a+", status: "+g.status));var b=new FileReader;b.onloadend=function(){var a=b.result.split(/,/)[1];c(a)},b.readAsDataURL(g.response)}}function f(){d(new Error("Timeout of "+b+"ms occured while fetching resource: "+a))}var g=new XMLHttpRequest;g.onreadystatechange=e,g.ontimeout=f,g.responseType="blob",g.timeout=b,g.open("GET",a,!0),g.send()})}function l(a,b){return"data:"+b+";base64,"+a}function m(a){return a.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1")}function n(a){return function(b){return new Promise(function(c){setTimeout(function(){c(b)},a)})}}function o(a){for(var b=[],c=a.length,d=0;c>d;d++)b.push(a[d]);return b}function p(a){return a.replace(/#/g,"%23").replace(/\n/g,"%0A")}return{escape:m,parseExtension:c,mimeType:d,dataAsUrl:l,isDataUrl:e,canvasToBlob:g,resolveUrl:h,getAndEncode:k,uid:i(),delay:n,asArray:o,escapeXhtml:p,makeImage:j}}function k(){function a(a){return-1!==a.search(e)}function b(a){for(var b,c=[];null!==(b=e.exec(a));)c.push(b[1]);return c.filter(function(a){return!n.isDataUrl(a)})}function c(a,b,c,d){function e(a){return new RegExp("(url\\(['\"]?)("+n.escape(a)+")(['\"]?\\))","g")}return Promise.resolve(b).then(function(a){return c?n.resolveUrl(a,c):a}).then(d||n.getAndEncode).then(function(a){return n.dataAsUrl(a,n.mimeType(b))}).then(function(c){return a.replace(e(b),"$1"+c+"$3")})}function d(d,e,f){function g(){return!a(d)}return g()?Promise.resolve(d):Promise.resolve(d).then(b).then(function(a){var b=Promise.resolve(d);return a.forEach(function(a){b=b.then(function(b){return c(b,a,e,f)})}),b})}var e=/url\(['"]?([^'"]+?)['"]?\)/g;return{inlineAll:d,shouldProcess:a,impl:{readUrls:b,inline:c}}}function l(){function a(){return b(document).then(function(a){return Promise.all(a.map(function(a){return a.resolve()}))}).then(function(a){return a.join("\n")})}function b(){function a(a){return a.filter(function(a){return a.type===CSSRule.FONT_FACE_RULE}).filter(function(a){return o.shouldProcess(a.style.getPropertyValue("src"))})}function b(a){var b=[];return a.forEach(function(a){try{n.asArray(a.cssRules||[]).forEach(b.push.bind(b))}catch(c){console.log("Error while reading CSS rules from "+a.href,c.toString())}}),b}function c(a){return{resolve:function(){var b=(a.parentStyleSheet||{}).href;return o.inlineAll(a.cssText,b)},src:function(){return a.style.getPropertyValue("src")}}}return Promise.resolve(n.asArray(document.styleSheets)).then(b).then(a).then(function(a){return a.map(c)})}return{resolveAll:a,impl:{readAll:b}}}function m(){function a(a){function b(b){return n.isDataUrl(a.src)?Promise.resolve():Promise.resolve(a.src).then(b||n.getAndEncode).then(function(b){return n.dataAsUrl(b,n.mimeType(a.src))}).then(function(b){return new Promise(function(c,d){a.onload=c,a.onerror=d,a.src=b})})}return{inline:b}}function b(c){function d(a){var b=a.style.getPropertyValue("background");return b?o.inlineAll(b).then(function(b){a.style.setProperty("background",b,a.style.getPropertyPriority("background"))}).then(function(){return a}):Promise.resolve(a)}return c instanceof Element?d(c).then(function(){return c instanceof HTMLImageElement?a(c).inline():Promise.all(n.asArray(c.childNodes).map(function(a){return b(a)}))}):Promise.resolve(c)}return{inlineAll:b,impl:{newImage:a}}}var n=j(),o=k(),p=l(),q=m();a.domtoimage={toSvg:b,toPng:c,toBlob:d,impl:{fontFaces:p,images:q,util:n,inliner:o}}}(this);