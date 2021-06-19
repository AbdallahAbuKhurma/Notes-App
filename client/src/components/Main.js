import ReactMarkdown from 'react-markdown';

function Main({ activeNote, onUpdateNote }) {

  const onEditField = (key, value) => {
    onUpdateNote({
      ...activeNote,
      [key]: value,
      lastModified: Date.now(),
    });
  };

  if (!activeNote) {
    return <div className='no-active-note'>No Note Selected</div>;
  }

  return (
    <div className='app-main'>
      <div className='app-main-note-edit'>
        <input
          onChange={(e) => onEditField('title', e.target.value)}
          type='text'
          value={activeNote.title}
          id='title'
          autoFocus />


        <textarea
          onChange={(e) => onEditField('body', e.target.value)}
          value={activeNote.body}
          id='body'
          placeholder='write your note here...' />
      </div>

      <div className='app-main-note-preview'>
        <h1 className='preview-title'>{activeNote.title}</h1>
        <ReactMarkdown className='markdown-preview'>
          {activeNote.body}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Main;
