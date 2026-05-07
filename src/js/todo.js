export function createTodo(title, description, dueDate, priority, notes) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const todo = {
        id: id,
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        notes: notes || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    return todo;
}
