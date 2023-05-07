let noteInput = document.getElementById("note");
let saveButton = document.getElementById("save");

saveButton.addEventListener("click", function() {
  let note = noteInput.value;
  chrome.storage.sync.set({note: note}, function() {
    console.log("Note saved");
  });
});

chrome.storage.sync.get("note", function(data) {
  if (data.note) {
    noteInput.value = data.note;
  }
});
