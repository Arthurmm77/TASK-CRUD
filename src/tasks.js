//Almacena la URL base del servidor backend donde están almacenadas las tareas
const baseUrl = "http://localhost:3000/tasks";

// READ - Obtener todas las tareas
async function getTasks() {
    const response = await fetch(baseUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    //Devuelve la tarea correspondiente en formato JSON.
    const tasks = await response.json();
    return tasks;
}

// Obtener tarea por id
async function getTaskById(id) {
    //Realiza una petición GET a la URL base seguida del ID de una tarea específica.
    const response = await fetch(`${baseUrl}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    //Devuelve la tarea correspondiente en formato JSON.
    const task = await response.json();
    return task;
}


// DELETE - Eliminar una tarea
async function deleteTask(id) {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    //Si la respuesta no es satisfactoria (! (lo contrario de ok)), arroja un error.
    if (!response.ok) {
        throw new Error('No se pudo eliminar la tarea.');
    }
    //De lo contrario, devuelve la respuesta en formato JSON.
    return response.json();
}

// Manejar la eliminación de una tarea
function deleteTaskHandler(id) {
    console.log("Intentando eliminar tarea con ID:", id); // Verificar el ID
    //Confirma si el usuario realmente desea eliminar la tarea y, si es así, llama a deleteTask.
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        deleteTask(id)
            .then(() => {
                loadTasks();  // Recarga la lista de tareas si tiene exito
            })
            .catch(error => {
                console.error('Error eliminando tarea:', error);
            });
    }
}
// CREATE - Añadir una nueva tarea
async function addTask(task) {
    //Llama a una función asíncrona que realiza una solicitud GET al servidor para obtener todas las tareas actuales.
    const tasks = await getTasks();
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(task => parseInt(task.id))) : 0;
    //Primero verifica si no esta vacia con >0, crea un array en el id con parseInt y verifica con task.map el valor maximo usado, en caso de no tareas empieza por 0.
    // Asignar ID como cadena de texto
    task.id = (maxId + 1).toString();

    console.log("Nuevo ID asignado (como cadena):", task.id); //  Imprime en la consola el nuevo ID asignado a la tarea
    //Añadir tarea
    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        //Convierte el objeto task en una cadena JSON para enviarlo al servidor.
        body: JSON.stringify(task),
    });

    if (!response.ok) {
        throw new Error('No se pudo agregar la tarea.');
    }
    //De lo contrario, devuelve la respuesta en formato JSON
    return response.json();
}



// UPDATE - Actualizar una tarea existente
async function updateTask(id, updatedTask) {
    const response = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        //Convierte el objeto updatedtask en una cadena JSON para enviarlo al servidor.
        body: JSON.stringify(updatedTask),
    });
    //Devuelve la respuesta en formato JSON
    return response.json();
}



// Función para cargar todas las tareas en la tabla
async function loadTasks() {
    //Esta es una llamada a una función asíncrona que realiza una solicitud GET al servidor para obtener todas las tareas actuales.
    const tasks = await getTasks();
    //Selecciona el cuerpo (<tbody>) de la tabla con el id taskTable.
    const taskTableBody = document.querySelector('#taskTable tbody');
    taskTableBody.innerHTML = ''; // Limpia la tabla antes de cargar nuevas tareas
    // Este es un bucle que itera sobre cada tarea en la lista tasks. Por cada tarea, se ejecuta una serie de pasos para crear una nueva fila en la tabla.
    tasks.forEach(task => {
        //Crea un nuevo elemento <tr>, que representa una fila en la tabla.
        const row = document.createElement('tr');
        //Asigna un atributo data-id al elemento <tr>, cuyo valor es el id de la tarea.
        row.setAttribute('data-id', task.id);
        //Establece el contenido HTML de la fila.
        row.innerHTML = `
        
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.status}</td>
            <td>
                <button class="edit-btn" onclick="openEditModal(${task.id})">Editar</button> 
                <button class="delete-btn" onclick="deleteTaskHandler(${task.id})">Eliminar</button>
            </td>
        `;
        //La nueva fila creada se añade al cuerpo de la tabla (<tbody>), visualizando la tarea en la interfaz de usuario.
        taskTableBody.appendChild(row);
    });
}

// Abrir el modal de edición y carga los datos de la tarea seleccionada en el formulario de edición.
function openEditModal(id) {
    getTaskById(id).then(task => {
        document.getElementById('editId').value = task.id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description;
        document.getElementById('editStatus').value = task.status;
        document.getElementById('editModal').style.display = 'block';
    });
}

// Función para cerrar el modal de edición
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Manejar la actualización de la tarea desde el modal
// Selecciona el formulario de edición por su id y añade un manejador de eventos que escucha cuando el formulario es enviado (es decir, cuando el usuario hace clic en el botón "Guardar Cambios" dentro del modal de edición).
document.getElementById('editForm').addEventListener('submit', (event) => {
    //Cancelar el comportamiento por defecto del formulario, que normalmente recargaría la página al enviarse
    event.preventDefault();
    //Obtener el id de edicion
    const id = document.getElementById('editId').value;
    //Se crea un objeto "updatedTask" que contiene los valores actuales del formulario de edición.
    const updatedTask = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        status: document.getElementById('editStatus').value,
    };
    // Llama a una función updateTask y se actualiza y con then se ejecuta.
    updateTask(id, updatedTask).then(() => {
        loadTasks();//Las recarga
        closeEditModal();//Cierra el modal
    });
});

// Manejar la adición de una nueva tarea
//Selecciona el formulario de edición por su id y añade un manejador de eventos que escucha cuando el formulario es enviado (es decir, cuando el usuario hace clic en el botón "Añadir tarea" dentro del modal de edición)
document.getElementById('addTaskForm').addEventListener('submit', (event) => {
    event.preventDefault();
    //Se crea un objeto newTask que contiene los valores que el usuario ha ingresado en el formulario de agregar tarea.
    const newTask = {
        title: document.getElementById('addTitle').value,
        description: document.getElementById('addDescription').value,
        status: document.getElementById('addStatus').value,
    };
    // Llama a una función newTask y se actualiza y con then se ejecuta.
    addTask(newTask).then(() => {
        loadTasks();
        document.getElementById('addTaskForm').reset();
    });
});
// Función para cargar todas las tareas en la tabla con filtrado
async function loadTasks() {
    //función asincrónica que recupera todas las tareas desde el servidor (usualmente mediante una petición HTTP).
    const tasks = await getTasks();
    
    // Obtener valores de los filtros
    const filterStatus = document.getElementById('filterStatus').value;
    const filterTitle = document.getElementById('filterTitle').value.toLowerCase();

    const taskTableBody = document.querySelector('#taskTable tbody');
    taskTableBody.innerHTML = ''; // Limpia la tabla antes de cargar nuevas tareas

    tasks
    //La función filter se utiliza para crear un nuevo arreglo de tareas que cumplan con los criterios de filtrado
        .filter(task => {
            // Filtrar por estado
            const matchesStatus = filterStatus === 'todos' || task.status === filterStatus;
            // Filtrar por título
            const matchesTitle = task.title.toLowerCase().includes(filterTitle);
            return matchesStatus && matchesTitle;
        })
        .forEach(task => {//Para cada tarea que pasa el filtro, se crea dinámicamente una fila (<tr>) en la tabla HTML
            const row = document.createElement('tr');
            row.setAttribute('data-id', task.id);
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>
                    <button class="edit-btn" onclick="openEditModal(${task.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteTaskHandler(${task.id})">Eliminar</button>
                </td>
            `;
            taskTableBody.appendChild(row);
        });
}

// Escuchar cambios en los filtros para recargar la tabla automáticamente
document.getElementById('filterStatus').addEventListener('change', loadTasks);
document.getElementById('filterTitle').addEventListener('input', loadTasks);


// Cargar las tareas al iniciar la página
loadTasks();
