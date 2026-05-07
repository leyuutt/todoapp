const STORAGE_KEY = 'advancedTodoApp';

export function saveProjects(projects) {
    try {
        const jsonString = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, jsonString);
        return true;
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

export function loadProjects() {
    try {
        const jsonString = localStorage.getItem(STORAGE_KEY);
        
        if (jsonString) {
            return JSON.parse(jsonString);
        }
        
        return null;
    } catch (error) {
        console.error('Error loading:', error);
        return null;
    }
}
