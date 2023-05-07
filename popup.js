let noteInput = document.getElementById("note");
let deleteButton = document.getElementById("delete");
let downloadButton = document.getElementById("download");
let copyButton = document.getElementById("copy");
let saveButton = document.getElementById("save");

// save
saveButton.addEventListener("click", () => {
  let note = noteInput.value;
  chrome.storage.sync.set({note: note}, () => {
    console.log("Note saved");
  });
});

chrome.storage.sync.get("note", (data) => {
  if (data.note) {
    noteInput.value = data.note;
  }
});

// delete
deleteButton.addEventListener("click", () => {
  chrome.storage.sync.remove("note", function() {
    console.log("Note deleted");
  });
  noteInput.value = "";
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
    console.log("Note copied");
  }, () => {
    console.log("Error copying note");
  });
});