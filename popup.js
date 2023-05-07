let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");
let images = document.querySelectorAll("ul>li>img")

let isEmpty = true

noteInput.addEventListener("input", () => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (noteInput.value === changes.note.newValue) {
      isEmpty = true
      for (let image of images) {
        image.style.opacity = "0.6"
      }
    }
    else{
      isEmpty = false
      for (let image of images) {
        image.style.opacity = "1"
      }
    }
  })
});

// save
saveButton.addEventListener("click", () => {
  let note = noteInput.value;
  chrome.storage.sync.set({note: note}, () => {
    isEmpty = false
  });
});

chrome.storage.sync.get("note", (data) => {
  if (data.note) {
    noteInput.value = data.note;
    isEmpty = false
  }
});

// delete
deleteButton.addEventListener("click", () => {
  chrome.storage.sync.remove("note", function() {
    noteInput.value = "";
    isEmpty = true
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
}, false);

// copy
copyButton.addEventListener("click", () => {
  let note = noteInput.value;
  navigator.clipboard.writeText(note).then(() => {
    // images[2].src = "/icons/tick.svg"
  }, () => {
    console.log("Error copying note");
  });
});
