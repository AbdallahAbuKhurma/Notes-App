import { useState, useEffect } from "react";
import uuid from "react-uuid";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
// import LZString from "lz-string";
import CryptoJS from "crypto-js";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(false);

  // Load notes from localStorage or from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const key = params.get("key");

    if (id && key) {
      fetch(`https://api.paste.gg/v1/pastes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const encrypted = data.result.files[0].content.value;
          const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(
            CryptoJS.enc.Utf8
          );
          const parsed = JSON.parse(decrypted);
          setNotes(parsed);
          localStorage.setItem("notes", JSON.stringify(parsed));
        })
        .catch((err) => console.error("Decryption or fetch failed", err));
    } else {
      const local = localStorage.getItem("notes");
      if (local) setNotes(JSON.parse(local));
    }
  }, []);

  // Save notes to localStorage when updated
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const onAddNote = () => {
    const newNote = {
      id: uuid(),
      title: "Untitled Note",
      body: "",
      lastModified: Date.now(),
    };
    setNotes([newNote, ...notes]);
  };

  const onDeleteNote = (idToDelete) => {
    setNotes(notes.filter((note) => note.id !== idToDelete));
  };

  const getActiveNote = () => {
    return notes.find((note) => note.id === activeNote);
  };

  const onUpdateNote = (updatedNote) => {
    const updatedNotesArray = notes.map((note) =>
      note.id === activeNote ? updatedNote : note
    );
    setNotes(updatedNotesArray);
  };

  // 📤 Export notes into a shareable URL
  const onExportNotes = async () => {
    const key = CryptoJS.lib.WordArray.random(16).toString(); // 128-bit random key
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(notes),
      key
    ).toString();

    const res = await fetch("https://api.paste.gg/v1/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Encrypted note",
        files: [
          {
            name: "note.enc",
            content: {
              format: "text",
              value: encrypted,
            },
          },
        ],
      }),
    });

    const json = await res.json();
    const pasteId = json.result.id;
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${pasteId}&key=${key}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Encrypted link copied to clipboard!");
  };

  return (
    <div className="App">
      <Sidebar
        notes={notes}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
      />
      <Main activeNote={getActiveNote()} onUpdateNote={onUpdateNote} />
      <div style={{ position: "fixed", bottom: 10, right: 10 }}>
        <button onClick={onExportNotes} style={{ padding: "10px 20px" }}>
          Export Notes
        </button>
      </div>
    </div>
  );
}

export default App;
