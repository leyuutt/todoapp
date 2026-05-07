import '../css/style.css';
import { createProject } from './project.js';
import { createTodo } from './todo.js';
import { saveProjects, loadProjects } from './storage.js';
import * as DOM from './dom.js';

let projects = [];
let currentProjectId = null;
let editingTodoId = null;

function init() {
    loadFromStorage();

    if (projects.length === 0) {
        const defaultProject = createDefaultProject();
        projects.push(defaultProject);
        currentProjectId = defaultProject.id;
        saveToStorage();
    } else {
        currentProjectId = projects[0].id;
    }

    render();
    setupEventListeners();
}

function createDefaultProject() {
    const defaultProject = createProject('My Tasks');
    const starterTodos = [
        createTodo(
            'Finish my assignment before monday',
            'i have java, web-devI, and nexsus too.',
            getDateFromToday(0),
            'high',
            'This is starter for my to-do app'
        ),
        createTodo(
            'watch over my nieces',
            'get some ice cream for them and take them to the playground',
            getDateFromToday(2),
            'medium',
            ''
        ),
        createTodo(
            'Buy a new pair of shoes.',
            'this one i want to buy for ballet classes',
            getDateFromToday(7),
            'low',
            ''
        )
    ];

    for (let i = 0; i < starterTodos.length; i++) {
        defaultProject.addTodo(starterTodos[i]);
    }

    return defaultProject;
}

function getDateFromToday(daysFromToday) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().slice(0, 10);
}

function loadFromStorage() {
    const data = loadProjects();

    if (data && Array.isArray(data)) {
        projects = [];

        for (let i = 0; i < data.length; i++) {
            const projectData = data[i];

            const project = createProject(projectData.name);
            project.id = projectData.id;
            project.createdAt = projectData.createdAt;

            if (projectData.todos && Array.isArray(projectData.todos)) {
                project.todos = [];

                for (let j = 0; j < projectData.todos.length; j++) {
                    const todoData = projectData.todos[j];

                    const todo = createTodo(
                        todoData.title,
                        todoData.description,
                        todoData.dueDate,
                        todoData.priority,
                        todoData.notes
                    );

                    todo.id = todoData.id;
                    todo.createdAt = todoData.createdAt;
                    todo.completed = todoData.completed;

                    project.todos.push(todo);
                }
            }

            projects.push(project);
        }
    }
}

function saveToStorage() {
    saveProjects(projects);
}

function getCurrentProject() {
    for (let i = 0; i < projects.length; i++) {
        if (projects[i].id === currentProjectId) {
            return projects[i];
        }
    }
    return null;
}

function render() {
    DOM.renderProjects(projects, currentProjectId);

    const currentProject = getCurrentProject();
    if (currentProject) {
        DOM.renderTodos(currentProject.todos, currentProject.name);
    }
}

function setupEventListeners() {
    DOM.elements.addProjectBtn.addEventListener('click', function () {
        DOM.showProjectModal();
    });

    DOM.elements.projectForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleProjectSubmit();
    });

    DOM.elements.projectsList.addEventListener('click', function (e) {
        const projectItem = e.target.closest('.project-item');
        if (projectItem && !e.target.closest('.delete-project-btn')) {
            const projectId = projectItem.dataset.projectId;
            handleProjectSelect(projectId);
        }

        if (e.target.closest('.delete-project-btn')) {
            const projectId = e.target.closest('.delete-project-btn').dataset.projectId;
            handleProjectDelete(projectId);
        }
    });

    DOM.elements.addTodoBtn.addEventListener('click', function () {
        editingTodoId = null;
        DOM.showTodoModal();
    });

    DOM.elements.todoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleTodoSubmit();
    });

    DOM.elements.todosList.addEventListener('click', function (e) {
        const todoItem = e.target.closest('.todo-item');
        if (todoItem && !e.target.closest('.todo-actions')) {
            const todoId = todoItem.dataset.todoId;
            handleTodoClick(todoId);
        }

        if (e.target.closest('.edit-todo-icon')) {
            e.stopPropagation();
            const todoId = e.target.closest('.edit-todo-icon').dataset.todoId;
            handleTodoEdit(todoId);
        }

        if (e.target.closest('.delete-todo-icon')) {
            e.stopPropagation();
            const todoId = e.target.closest('.delete-todo-icon').dataset.todoId;
            handleTodoDelete(todoId);
        }
    });

    DOM.elements.editTodoBtn.addEventListener('click', function () {
        const todoId = DOM.elements.editTodoBtn.dataset.todoId;
        DOM.hideTodoDetailsModal();
        handleTodoEdit(todoId);
    });

    setupModalCloseEvents();
}

function setupModalCloseEvents() {
    const closeButtons = document.querySelectorAll('.close-btn, .cancel-btn');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function (e) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    }

    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].addEventListener('click', function (e) {
            if (e.target === modals[i]) {
                modals[i].classList.remove('active');
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            for (let i = 0; i < activeModals.length; i++) {
                activeModals[i].classList.remove('active');
            }
        }
    });
}

function handleProjectSubmit() {
    const formData = DOM.getProjectFormData();

    if (!formData.name) {
        alert('Please enter a project name');
        return;
    }

    const project = createProject(formData.name);
    projects.push(project);

    saveToStorage();
    DOM.hideProjectModal();
    render();
}

function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    render();
}

function handleProjectDelete(projectId) {
    let project = null;
    for (let i = 0; i < projects.length; i++) {
        if (projects[i].id === projectId) {
            project = projects[i];
            break;
        }
    }

    if (!project) return;

    const confirmDelete = confirm(
        'Are you sure you want to delete "' + project.name + '"? This will delete all todos in this project.'
    );

    if (confirmDelete) {
        projects = projects.filter(function (p) {
            return p.id !== projectId;
        });

        if (currentProjectId === projectId) {
            if (projects.length > 0) {
                currentProjectId = projects[0].id;
            } else {
                const defaultProject = createProject('My Tasks');
                projects.push(defaultProject);
                currentProjectId = defaultProject.id;
            }
        }

        saveToStorage();
        render();
    }
}

function handleTodoSubmit() {
    const formData = DOM.getTodoFormData();

    if (!formData.title || !formData.dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    const project = getCurrentProject();
    if (!project) return;

    if (editingTodoId) {
        project.updateTodo(editingTodoId, formData);
        editingTodoId = null;
    } else {
        const todo = createTodo(
            formData.title,
            formData.description,
            formData.dueDate,
            formData.priority,
            formData.notes
        );
        project.addTodo(todo);
    }

    saveToStorage();
    DOM.hideTodoModal();
    render();
}

function handleTodoClick(todoId) {
    const project = getCurrentProject();
    if (!project) return;

    const todo = project.findTodo(todoId);
    if (todo) {
        DOM.showTodoDetailsModal(todo);
    }
}

function handleTodoEdit(todoId) {
    const project = getCurrentProject();
    if (!project) return;

    const todo = project.findTodo(todoId);
    if (todo) {
        editingTodoId = todoId;
        DOM.showTodoModal(todo);
    }
}

function handleTodoDelete(todoId) {
    const project = getCurrentProject();
    if (!project) return;

    const todo = project.findTodo(todoId);
    if (!todo) return;

    const confirmDelete = confirm('Are you sure you want to delete "' + todo.title + '"?');

    if (confirmDelete) {
        project.removeTodo(todoId);
        saveToStorage();
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);
