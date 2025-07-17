// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    initializeElements() {
        // Main elements
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');

        // Modal elements
        this.modal = document.getElementById('modal');
        this.modalContent = document.querySelector('.modal-content');
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeBtn = document.querySelector('.close');
        this.charCount = document.getElementById('charCount');

        // Edit modal elements
        this.editModal = document.getElementById('editModal');
        this.editInput = document.getElementById('editInput');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeEditBtn = document.querySelector('.close-edit');
        this.editCharCount = document.getElementById('editCharCount');

        // Stats elements
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');

        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Add todo button
        this.addTodoBtn.addEventListener('click', () => this.openModal());

        // Modal events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());

        // Edit modal events
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.closeEditBtn.addEventListener('click', () => this.closeEditModal());

        // Input events
        this.todoInput.addEventListener('input', () => this.updateCharCount());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.todoInput.value.trim()) {
                this.addTodo();
            }
        });

        this.editInput.addEventListener('input', () => this.updateEditCharCount());
        this.editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.editInput.value.trim()) {
                this.saveEdit();
            }
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    this.setFilter(filter);
                }
            });
        });

        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Modal close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeEditModal();
            }
        });
    }

    // Todo Management
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.showToast('Please enter a todo item', 'error');
            this.todoInput.classList.add('shake');
            setTimeout(() => this.todoInput.classList.remove('shake'), 500);
            return;
        }

        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.closeModal();
        this.showToast('Todo added successfully!');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
            
            const message = todo.completed ? 'Todo completed!' : 'Todo marked as active';
            this.showToast(message);
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this todo?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showToast('Todo deleted successfully!');
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            this.editingId = id;
            this.editInput.value = todo.text;
            this.updateEditCharCount();
            this.openEditModal();
        }
    }

    saveEdit() {
        const text = this.editInput.value.trim();
        if (!text) {
            this.showToast('Please enter a todo item', 'error');
            this.editInput.classList.add('shake');
            setTimeout(() => this.editInput.classList.remove('shake'), 500);
            return;
        }

        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = text;
            this.saveTodos();
            this.render();
            this.closeEditModal();
            this.showToast('Todo updated successfully!');
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('No completed todos to clear', 'error');
            return;
        }

        if (confirm(`Delete ${completedCount} completed todo${completedCount > 1 ? 's' : ''}?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showToast(`${completedCount} completed todo${completedCount > 1 ? 's' : ''} deleted!`);
        }
    }

    // Filter Management
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // Modal Management
    openModal() {
        this.modal.classList.add('show');
        this.todoInput.value = '';
        this.updateCharCount();
        setTimeout(() => this.todoInput.focus(), 100);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    openEditModal() {
        this.editModal.classList.add('show');
        setTimeout(() => this.editInput.focus(), 100);
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.editingId = null;
        document.body.style.overflow = '';
    }

    // Character Count
    updateCharCount() {
        const count = this.todoInput.value.length;
        this.charCount.textContent = count;
        this.charCount.style.color = count > 180 ? '#e74c3c' : '#999';
        this.addBtn.disabled = count === 0 || count > 200;
    }

    updateEditCharCount() {
        const count = this.editInput.value.length;
        this.editCharCount.textContent = count;
        this.editCharCount.style.color = count > 180 ? '#e74c3c' : '#999';
        this.saveEditBtn.disabled = count === 0 || count > 200;
    }

    // Rendering
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderTodos(filteredTodos);
        }
    }

    renderEmptyState() {
        const isEmpty = this.todos.length === 0;
        const emptyMessage = isEmpty 
            ? 'No todos yet. Add one above!' 
            : `No ${this.currentFilter} todos found`;
        
        const emptyIcon = isEmpty ? '📝' : '🔍';
        
        this.todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${emptyIcon}</div>
                <p>${emptyMessage}</p>
            </div>
        `;
    }

    renderTodos(todos) {
        this.todoList.innerHTML = todos.map((todo, index) => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" 
                 style="animation-delay: ${index * 0.1}s">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="app.toggleTodo('${todo.id}')"></div>
                <div class="todo-content">
                    <div class="todo-text ${todo.completed ? 'completed' : ''}" 
                         ondblclick="app.editTodo('${todo.id}')">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-date">${this.formatDate(todo.createdAt)}</div>
                </div>
                <div class="todo-actions">
                    ${!todo.completed ? `
                        <button class="action-btn edit-btn" onclick="app.editTodo('${todo.id}')" title="Edit">
                            ✏️
                        </button>
                    ` : ''}
                    <button class="action-btn delete-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Stats
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;

        // Show/hide clear completed button
        this.clearCompletedBtn.style.display = completed > 0 ? 'block' : 'none';
    }

    // Toast Notifications
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // Local Storage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            return JSON.parse(saved).map(todo => ({
                ...todo,
                createdAt: new Date(todo.createdAt)
            }));
        }
        return [];
    }

    // Utilities
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (days === 1) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}