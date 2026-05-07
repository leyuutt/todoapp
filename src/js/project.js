export function createProject(name) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const project = {
        id: id,
        name: name,
        todos: [],
        createdAt: new Date().toISOString(),
        
        addTodo: function(todo) {
            this.todos.push(todo);
        },
        
        removeTodo: function(todoId) {
            this.todos = this.todos.filter(function(todo) {
                return todo.id !== todoId;
            });
        },
        
        findTodo: function(todoId) {
            return this.todos.find(function(todo) {
                return todo.id === todoId;
            });
        },
        
        updateTodo: function(todoId, updates) {
            const todo = this.findTodo(todoId);
            if (todo) {
                todo.title = updates.title;
                todo.description = updates.description;
                todo.dueDate = updates.dueDate;
                todo.priority = updates.priority;
                todo.notes = updates.notes;
            }
        },
        
        getTodosCount: function() {
            return this.todos.length;
        }
    };
    
    return project;
}
