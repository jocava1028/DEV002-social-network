// eslint-disable-next-line import/no-cycle
import {
  saveTask, onGetTasks, deleteTask, getTask, updateTask, addlike,
} from '../lib/firebase/muroFir.js';
import {
  auth, onAuthStateChanged,
} from '../lib/firebase/metFirebase.js';

export const vistaGeneral = () => {
  const homeDiv = document.createElement('div');
  const navFijo = document.createElement('nav');
  const tituloFijo = document.createElement('h2');
  const formMuro = document.createElement('form');
  const labelTitle = document.createElement('label');
  const inpuText = document.createElement('input');
  const labelDescrip = document.createElement('label');
  const textArea = document.createElement('textarea');
  const buttonGuardar = document.createElement('button');
  const divContainer = document.createElement('div');

  navFijo.className = 'navFijo';
  tituloFijo.className = 'nameFijo';
  formMuro.className = 'task-form';
  labelTitle.className = 'labelTitle';
  inpuText.className = 'inpuText';
  labelDescrip.className = 'labelDescrip';
  textArea.className = 'textArea';
  buttonGuardar.className = 'buttonGuardar';
  divContainer.className = 'divContainer';
  homeDiv.className = 'divGeneral';

  formMuro.id = 'task-form';
  inpuText.id = 'inpuText';
  textArea.id = 'task-description';
  buttonGuardar.id = 'btn-task-save';
  divContainer.id = 'tasks-container';

  inpuText.type = 'text';

  inpuText.placeholder = 'Ingresar título';
  textArea.placeholder = 'Ingresar descripción';

  labelTitle.for = 'title';
  labelDescrip.for = 'description';

  textArea.rows = '3';

  tituloFijo.textContent = '¿Qué comemos hoy?';
  labelTitle.textContent = 'Título';
  labelDescrip.textContent = 'Descripción';
  buttonGuardar.textContent = 'Guardar';

  let editStatus = false;
  let id = '';

  let userid;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userid = user.uid;
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    onGetTasks((querySnapshot) => {
      let html = '';

      querySnapshot.forEach((doc) => {
        const task = doc.data();
        html += `
        <div class= "post">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
        <div class="like-container">
          <img src="images/flame.png" class= "imagenLike" data-id="${doc.id}" data-likes="${task.likes}" alt="flama"/>
          <span class="like-count">${task.likes.length}</span>
        </div>
        ${task.uid === userid ? `
          <button class='btn-delete' data-id="${doc.id}">Eliminar</button>
          <button class='btn-edit' data-id="${doc.id}">Editar</button>  ` : ''}

        </div>
      `;
      });

      divContainer.innerHTML = html;

      const likeButtons = document.querySelectorAll('.imagenLike');

      likeButtons.forEach((likeButton) => {
        likeButton.addEventListener('click', (evento) => {
          const target = evento.target;
          const dataset = target.dataset;
          addlike(dataset.id, dataset.likes);
        });
      });

      const btnDelete = divContainer.querySelectorAll('.btn-delete');
      // eslint-disable-next-line arrow-parens
      btnDelete.forEach(btn => {
        btn.addEventListener('click', ({ target: { dataset } }) => {
          const modal = document.createElement('div');
          modal.classList.add('modal');
          modal.innerHTML = `
            <div class="modal-content">
              <p>¿Estás seguro de que deseas eliminar esta tarea?</p>
              <button class="btn-yes">Sí</button>
              <button class="btn-no">No</button>
            </div>
          `;
          document.body.appendChild(modal);

          const btnYes = modal.querySelector('.btn-yes');
          const btnNo = modal.querySelector('.btn-no');

          btnYes.addEventListener('click', () => {
            deleteTask(dataset.id);
            document.body.removeChild(modal);
          });

          btnNo.addEventListener('click', () => {
            document.body.removeChild(modal);
          });
        });
      });

      const btnsEdit = divContainer.querySelectorAll('.btn-edit');
      btnsEdit.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const doc = await getTask(e.target.dataset.id);
          const task = doc.data();

          // eslint-disable-next-line dot-notation
          formMuro['inpuText'].value = task.title;
          formMuro['task-description'].value = task.description;

          editStatus = true;
          id = doc.id;
          formMuro['btn-task-save'].innerText = 'Actualizar';
        });
      });
    });
  });

  formMuro.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = formMuro.inpuText;
    const description = formMuro['task-description'];

    if (!editStatus) {
      saveTask(title.value, description.value, userid);
    } else {
      updateTask(id, {
        title: title.value,
        description: description.value,
        uid: userid,
      });
      editStatus = false;
    }
    formMuro.reset();
  });

  homeDiv.appendChild(navFijo);
  navFijo.appendChild(tituloFijo);
  homeDiv.appendChild(formMuro);
  formMuro.appendChild(labelTitle);
  formMuro.appendChild(inpuText);
  formMuro.appendChild(labelDescrip);
  formMuro.appendChild(textArea);
  formMuro.appendChild(buttonGuardar);
  homeDiv.appendChild(divContainer);

  return homeDiv;
};
