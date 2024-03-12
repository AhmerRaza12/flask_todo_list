document.addEventListener("DOMContentLoaded", function() {
    const avatarImg = document.getElementById('avatarImg');
    const userNameSpan = document.getElementById('userNameSpan');
    const todoListContainer = document.getElementById('todoListContainer');
    const taskForm = document.getElementById('taskForm');

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    if (userData.avatar) {
        const avatarUrl = `http://127.0.0.1:5000/uploads/${userData.avatar}`;
        avatarImg.src = avatarUrl;
    }
    userNameSpan.textContent = userData.name;
    fetchTodoList(userData.id);
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    });
    function fetchTodoList(userId) {
        fetch(`http://127.0.0.1:5000/todo/getall/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.payload && data.payload.length > 0) {
                data.payload.forEach(task => {
                    renderTodoListCard(task);
                });
            }
        })
        .catch(error => console.error('Error fetching todo list:', error));
    }

    function renderTodoListCard(task) {
        const statusColorClass = task.status.trim() === 'active' ? 'bg-primary' : 'bg-danger';
        const cardHtml = `
    <div id="task_${task.id}" class="col-12 col-sm-6 col-md-4">
        <div class="card ${task.status.trim() === 'active' ? 'active-card' : 'disabled-card'}">
            <div class="card-header">
                <span class="badge ${statusColorClass}">${task.status.trim()}</span>
                <div class="card-buttons">
                    <button class="btn btn-outline-primary edit-btn" onclick="editTask(${task.id}, '${task.description}', '${task.status}')"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-outline-danger delete-btn" onclick="deleteTask(${task.id})"><i class="bi bi-trash"></i></button>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">Task ${task.id}</h5>
                <p class="card-description" id="description_${task.id}">${task.description}</p>
            </div>
        </div>
    </div>
`;
        todoListContainer.insertAdjacentHTML('beforeend', cardHtml);
    }
    const addBtn = document.querySelector('.add-btn');
    const addForm = document.querySelector('.add-form');

    addBtn.addEventListener('click', function() {
        addBtn.style.display = 'none';
        addForm.style.display = 'block';
        taskDescription.focus(); // Focus on the description field when form is active
    });

    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const description = document.getElementById('taskDescription').value.trim();
        let status = document.getElementById('taskStatus').value.trim().toLowerCase();
    
        if (status !== 'active' && status !== 'disabled') {
            console.error('Invalid status:', status);
            return;
        }
    
        console.log('Description:', description);
        console.log('Status:', status);
    
        const formData = new FormData();
        formData.append('description', description);
        formData.append('status', status);
    
        fetch(`http://127.0.0.1:5000/todo/add/${userData.id}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error submitting task');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); 
        })
        .catch(error => {
            console.error(error); 
        })
        .finally(() => {
            addBtn.style.display = 'block';
            addForm.style.display = 'none';
            taskForm.reset(); 
        });
    });

    document.addEventListener('click', function(event) {
        if (!addBtn.contains(event.target) && !addForm.contains(event.target)) {
            addBtn.style.display = 'block';
            addForm.style.display = 'none';
            taskForm.reset(); 
        }
    });
});
function editTask(taskId, description, status) {
    const descriptionElement = document.getElementById(`description_${taskId}`);
    const descriptionText = descriptionElement.textContent.trim(); 
    console.log('Editing task:', taskId, descriptionText, status);
    const newDescription = prompt('Enter new description:', descriptionText);

    // If the user cancels or doesn't provide a new description, return early
    if (newDescription === null || newDescription.trim() === '') {
        return;
    }

    // Update the text content of the description element
    descriptionElement.textContent = newDescription.trim();
    console.log('New description:', newDescription);

    // Send request to update task

    const formData = new FormData();
    formData.append('description', newDescription.trim());
    formData.append('status', status);
    fetch(`http://127.0.0.1:5000/todo/update/${taskId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error updating task');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); 
    })
    .catch(error => {
        console.error(error); 
    });
}
function deleteTask(taskId) {
    // Confirm with the user before deleting the task
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`http://127.0.0.1:5000/todo/delete/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting task');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            // Remove the task card from the UI upon successful deletion
            const taskCard = document.getElementById(`task_${taskId}`);
            if (taskCard) {
                taskCard.remove();
            }
        })
        .catch(error => {
            console.error(error);
        });
    }
}

