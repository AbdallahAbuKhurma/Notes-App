import { useState, useEffect } from "react";
import uuid from "react-uuid";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import "./App.css";
import LZString from "lz-string";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(false);

  // Load notes from localStorage or from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(
          LZString.decompressFromEncodedURIComponent(data)
        );
        setNotes(decoded);
        localStorage.setItem("notes", JSON.stringify(decoded));
      } catch (e) {
        console.error("Invalid or corrupt note data in URL");
      }
    } else {
      const local = localStorage.getItem("notes");
      if (local) {
        setNotes(JSON.parse(local));
      }
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
  const onExportNotes = () => {
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(notes)
    );
    const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
    navigator.clipboard.writeText(url);
    alert("Sharable link copied to clipboard!");
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
