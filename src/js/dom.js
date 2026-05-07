function parseISO(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }

    return date;
}

function format(date, pattern) {
    if (pattern === 'yyyy-MM-dd') {
        return date.toISOString().slice(0, 10);
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
}

function isToday(date) {
    return isSameDate(date, new Date());
}

function isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDate(date, tomorrow);
}

function isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < today;
}

function formatDistanceToNow(date, options) {
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    const units = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    for (let i = 0; i < units.length; i++) {
        const value = Math.floor(elapsedSeconds / units[i].seconds);
        if (value >= 1) {
            const text = value + ' ' + units[i].label + (value === 1 ? '' : 's');
            return options && options.addSuffix ? text + ' ago' : text;
        }
    }

    return options && options.addSuffix ? 'just now' : 'now';
}

function isSameDate(firstDate, secondDate) {
    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}

function formatDate(dateString) {
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
}

function formatForInput(dateString) {
    try {
        const date = parseISO(dateString);
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        return '';
    }
}

function getRelativeTime(dateString) {
    try {
        const date = parseISO(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        return '';
    }
}

function getFormattedDueDate(dateString) {
    try {
        const date = parseISO(dateString);
        
        if (isToday(date)) {
            return '📅 Today';
        }
        
        if (isTomorrow(date)) {
            return '📅 Tomorrow';
        }
        
        if (isPast(date)) {
            return '📅 ' + formatDate(dateString) + ' (Overdue)';
        }
        
        return '📅 ' + formatDate(dateString);
    } catch (error) {
        return '📅 Invalid date';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function getPriorityEmoji(priority) {
    if (priority === 'high') return '🔴';
    if (priority === 'medium') return '🟡';
    if (priority === 'low') return '🟢';
    return '⚪';
}

export const elements = {
    projectsList: document.getElementById('projects-list'),
    addProjectBtn: document.getElementById('add-project-btn'),
    projectModal: document.getElementById('project-modal'),
    projectForm: document.getElementById('project-form'),
    projectNameInput: document.getElementById('project-name'),
    
    todosList: document.getElementById('todos-list'),
    addTodoBtn: document.getElementById('add-todo-btn'),
    currentProjectTitle: document.getElementById('current-project-title'),
    todoModal: document.getElementById('todo-modal'),
    todoForm: document.getElementById('todo-form'),
    todoTitleInput: document.getElementById('todo-title'),
    todoDescriptionInput: document.getElementById('todo-description'),
    todoDueDateInput: document.getElementById('todo-due-date'),
    todoPriorityInput: document.getElementById('todo-priority'),
    todoNotesInput: document.getElementById('todo-notes'),
    
    todoDetailsModal: document.getElementById('todo-details-modal'),
    todoDetailsContent: document.getElementById('todo-details-content'),
    editTodoBtn: document.getElementById('edit-todo-btn')
};

export function renderProjects(projects, currentProjectId) {
    elements.projectsList.innerHTML = '';
    
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        
        const projectItem = document.createElement('div');
        
        if (project.id === currentProjectId) {
            projectItem.className = 'project-item active';
        } else {
            projectItem.className = 'project-item';
        }
        
        projectItem.dataset.projectId = project.id;
        
        const taskCount = project.getTodosCount();
        const taskWord = taskCount === 1 ? 'task' : 'tasks';
        
        projectItem.innerHTML = `
            <div class="project-item-content">
                <div class="project-item-name">${escapeHtml(project.name)}</div>
                <div class="project-item-count">${taskCount} ${taskWord}</div>
            </div>
            <div class="project-item-actions">
                <button class="delete-project-btn" data-project-id="${project.id}" aria-label="Delete project">🗑️</button>
            </div>
        `;
        
        elements.projectsList.appendChild(projectItem);
    }
}

export function renderTodos(todos, projectName) {
    elements.currentProjectTitle.textContent = projectName;
    
    elements.todosList.innerHTML = '';
    
    if (todos.length === 0) {
        elements.todosList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No tasks yet. Create your first task!</div>
            </div>
        `;
        return;
    }
    
    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item priority-' + todo.priority;
        todoItem.dataset.todoId = todo.id;
        
        const formattedDate = getFormattedDueDate(todo.dueDate);
        const priorityEmoji = getPriorityEmoji(todo.priority);
        const priorityText = capitalize(todo.priority);
        
        let html = `
            <div class="todo-header">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                <div class="todo-actions">
                    <button class="edit-todo-icon" data-todo-id="${todo.id}" aria-label="Edit todo">✏️</button>
                    <button class="delete-todo-icon" data-todo-id="${todo.id}" aria-label="Delete todo">🗑️</button>
                </div>
            </div>
            <div class="todo-meta">
                <div class="todo-due-date">${formattedDate}</div>
                <div class="todo-priority ${todo.priority}">${priorityEmoji} ${priorityText} Priority</div>
            </div>
        `;
        
        if (todo.description) {
            html += `<div class="todo-description">${escapeHtml(todo.description)}</div>`;
        }
        
        todoItem.innerHTML = html;
        
        elements.todosList.appendChild(todoItem);
    }
}

export function showProjectModal() {
    elements.projectModal.classList.add('active');
    elements.projectNameInput.value = '';
    elements.projectNameInput.focus();
}

export function hideProjectModal() {
    elements.projectModal.classList.remove('active');
    elements.projectForm.reset();
}

export function showTodoModal(todo) {
    elements.todoModal.classList.add('active');
    
    if (todo) {
        document.getElementById('todo-modal-title').textContent = 'Edit Todo';
        elements.todoTitleInput.value = todo.title;
        elements.todoDescriptionInput.value = todo.description;
        elements.todoDueDateInput.value = formatForInput(todo.dueDate);
        elements.todoPriorityInput.value = todo.priority;
        elements.todoNotesInput.value = todo.notes || '';
    } 
    else {
        document.getElementById('todo-modal-title').textContent = 'New Todo';
        elements.todoForm.reset();
        elements.todoDueDateInput.value = formatForInput(new Date().toISOString());
    }
    
    elements.todoTitleInput.focus();
}

export function hideTodoModal() {
    elements.todoModal.classList.remove('active');
    elements.todoForm.reset();
}

export function showTodoDetailsModal(todo) {
    elements.todoDetailsModal.classList.add('active');
    
    const formattedDate = formatDate(todo.dueDate);
    const priorityEmoji = getPriorityEmoji(todo.priority);
    const priorityText = capitalize(todo.priority);
    
    let html = `
        <div class="detail-row">
            <div class="detail-label">Title</div>
            <div class="detail-value">${escapeHtml(todo.title)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Description</div>
            <div class="detail-value">${escapeHtml(todo.description) || 'No description'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Due Date</div>
            <div class="detail-value">${formattedDate}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Priority</div>
            <div class="detail-value priority ${todo.priority}">${priorityEmoji} ${priorityText}</div>
        </div>
    `;
    
    if (todo.notes) {
        html += `
            <div class="detail-row">
                <div class="detail-label">Notes</div>
                <div class="detail-value">${escapeHtml(todo.notes)}</div>
            </div>
        `;
    }
    
    html += `
        <div class="detail-row">
            <div class="detail-label">Created</div>
            <div class="detail-value">${getRelativeTime(todo.createdAt)}</div>
        </div>
    `;
    
    elements.todoDetailsContent.innerHTML = html;
    elements.editTodoBtn.dataset.todoId = todo.id;
}

export function hideTodoDetailsModal() {
    elements.todoDetailsModal.classList.remove('active');
}

export function getTodoFormData() {
    return {
        title: elements.todoTitleInput.value.trim(),
        description: elements.todoDescriptionInput.value.trim(),
        dueDate: elements.todoDueDateInput.value,
        priority: elements.todoPriorityInput.value,
        notes: elements.todoNotesInput.value.trim()
    };
}

export function getProjectFormData() {
    return {
        name: elements.projectNameInput.value.trim()
    };
}
