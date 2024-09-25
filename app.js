// Selección de elementos del DOM
const taskForm = document.getElementById('task-form');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const columns = {
    alta: document.getElementById('alta'),
    media: document.getElementById('media'),
    baja: document.getElementById('baja'),
};
const taskLists = {
    alta: document.getElementById('task-list-alta'),
    media: document.getElementById('task-list-media'),
    baja: document.getElementById('task-list-baja'),
};

// Obtener tareas del Local Storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Función para renderizar las tareas en sus respectivas columnas
const renderTasks = () => {
    // Limpiar las columnas
    Object.values(taskLists).forEach(list => list.innerHTML = '');

    // Ordenar las tareas por fecha de forma descendente
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Agrupar las tareas por prioridad
    const tasksGroupedByPriority = {
        alta: tasks.filter(task => task.priority === 'alta'),
        media: tasks.filter(task => task.priority === 'media'),
        baja: tasks.filter(task => task.priority === 'baja'),
    };

    // Mostrar u ocultar las columnas según si hay tareas
    Object.keys(tasksGroupedByPriority).forEach(priority => {
        const taskArray = tasksGroupedByPriority[priority];

        // Mostrar la columna si tiene tareas, ocultarla si está vacía
        if (taskArray.length > 0) {
            columns[priority].style.display = 'block';
        } else {
            columns[priority].style.display = 'none';
        }

        // Renderizar las tareas en la columna correspondiente
        taskArray.forEach(task => {
            const li = document.createElement('li');
            li.classList.add(task.priority); // Añadir clase de prioridad
            li.setAttribute('draggable', 'true');
            li.setAttribute('data-task-id', task.id); // Atributo personalizado con el ID único de la tarea
            li.innerHTML = `
                ${task.name} - <small>Hasta: ${new Date(task.deadline).toLocaleString()}</small>
                <button onclick="deleteTask(${task.id})">❌</button>
            `;

            // Añadir evento dragstart para permitir arrastrar la tarea
            li.addEventListener('dragstart', drag);

            if (task.completed) {
                li.classList.add('completed');
            }

            // Añadir la tarea a la lista correspondiente (alta, media, baja)
            taskLists[task.priority].appendChild(li);
        });
    });
};

// Función para añadir una nueva tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskPriority = document.getElementById('task-priority').value;

    if (taskName && taskDeadline && taskPriority) {
        const newTask = {
            id: Date.now(), // Asignar un ID único basado en el tiempo actual
            name: taskName,
            deadline: taskDeadline,
            priority: taskPriority,
            completed: false
        };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Guardar en Local Storage
        renderTasks();
        taskForm.reset(); // Limpiar el formulario
    }
});

// Función para eliminar tarea utilizando el ID único
const deleteTask = (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId); // Filtrar tareas y eliminar la tarea con el ID correspondiente
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Actualizar Local Storage
    renderTasks();
};

// Función para alternar modo oscuro
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Cambiar el icono del botón
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '☀️ Modo Claro';
    } else {
        darkModeToggle.textContent = '🌙 Modo Oscuro';
    }
});

// Funciones para arrastrar y soltar las tareas
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('taskId', event.target.getAttribute('data-task-id'));
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const newPriority = event.target.closest('.column').id;

    // Actualizar la prioridad de la tarea
    const task = tasks.find(task => task.id == taskId);
    task.priority = newPriority;
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Guardar cambios en Local Storage
    renderTasks();
}

// Renderizar las tareas al cargar la página
renderTasks();
