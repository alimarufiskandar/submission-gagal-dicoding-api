import './style/styles.css';

class NoteItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const title = this.getAttribute('title');
    const body = this.getAttribute('body');

    const wrapper = document.createElement('div');
    wrapper.textContent = `${title}: ${body}`;

    shadow.appendChild(wrapper);
  }
}

class NoteInput extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const form = document.createElement('form');
    const inputTitle = document.createElement('input');
    inputTitle.setAttribute('type', 'text');
    inputTitle.setAttribute('placeholder', 'Title');
    inputTitle.setAttribute('required', '');

    const textareaBody = document.createElement('textarea');
    textareaBody.setAttribute('placeholder', 'Note Body');
    textareaBody.setAttribute('required', '');

    const button = document.createElement('button');
    button.setAttribute('type', 'submit');
    button.textContent = 'Add Note';

    form.appendChild(inputTitle);
    form.appendChild(textareaBody);
    form.appendChild(button);

    shadow.appendChild(form);
  }
}

class NotesList extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Membuat elemen daftar catatan
    const list = document.createElement('ul');
    list.setAttribute('id', 'notesList');

    // Menambahkan elemen daftar catatan ke dalam shadow DOM
    shadow.appendChild(list);
  }
}

customElements.define('notes-list', NotesList);
customElements.define('note-item', NoteItem);
customElements.define('note-input', NoteInput);


const notesList = document.getElementById('notesList');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitle');
const noteBodyInput = document.getElementById('noteBody');
const loadingIndicator = document.getElementById('loadingIndicator');

function showLoading() {
  loadingIndicator.style.display = 'block';
}

function hideLoading() {
  loadingIndicator.style.display = 'none';
}

async function displayNotesFromAPI() {
  showLoading();

  const url = 'https://notes-api.dicoding.dev/v2/notes';
  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (responseData.status === 'success') {
      const notesData = responseData.data;
      notesList.innerHTML = '';
      notesData.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.body}</p>
          <button class="delete-btn" data-note-id="${note.id}">Delete</button>
        `;
        notesList.appendChild(noteElement);
      
        const deleteBtn = noteElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteNoteHandler(note.id));
      });
      
    } else {
      console.error('Error: ' + responseData.message);
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
  } finally {
    hideLoading();
  }
}

async function addNote() {
  showLoading();

  const url = 'https://notes-api.dicoding.dev/v2/notes';
  const title = noteTitleInput.value.trim();
  const body = noteBodyInput.value.trim();
  if (title && body) {
    const data = {
      title: title,
      body: body
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      console.log(responseData);
      displayNotesFromAPI();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  } else {
    alert('Please enter both title and body for the note.');
  }

  hideLoading();
}

async function deleteNoteHandler(noteId) {
  showLoading();

  const url = `https://notes-api.dicoding.dev/v2/notes/${noteId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE'
    });
    const responseData = await response.json();
    console.log(responseData);
    displayNotesFromAPI();
  } catch (error) {
    console.error('Error deleting note:', error);
  } finally {
    hideLoading();
  }
}

noteForm.addEventListener('submit', function(event) {
  event.preventDefault();
  addNote();
});

displayNotesFromAPI();
