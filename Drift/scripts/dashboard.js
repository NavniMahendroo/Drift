// Dashboard Application State
class DashboardApp {
    constructor() {
        this.tasks = [];
        this.selectedTaskId = null;
        this.currentFilter = 'all';
        this.currentUserId = null;
        this.currentUserName = '';
        this.currentUserEmail = '';
        
        // DOM Elements
        this.taskForm = null;
        this.taskList = null;
        this.taskDetailContent = null;
        this.extendPageTaskSelect = null;
        this.filterButtons = null;
        this.modal = null;
        this.modalClose = null;
        this.markCompleteBtn = null;
        this.editTaskBtn = null;
        this.newTaskBtn = null;
        this.viewInsightsBtn = null;
        this.completedCount = null;
        this.pendingCount = null;
        this.overdueCount = null;
        
        this.init();
    }

    // Initialize the app
    init() {
        this.checkAuthentication();
        this.getUserData();
        this.loadUserTasks();
        this.initializeDOMElements();
        this.setupEventListeners();
        this.setupPrioritySelect();
        this.setDefaultDates();
        this.renderTaskList();
        this.updateExtendTaskSelect();
        this.renderExtensionHistory();
        this.updateStats();
        this.updateUserInfo();
        
        // Check for URL parameters (for demo purposes)
        this.checkURLParams();
    }

    // Check if user is authenticated
    checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated');
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (!isAuthenticated || !userEmail) {
            // Stay on the current page and let auth.js render the sign-in UI.
            // Redirecting to index.html here causes a reload loop because this script
            // is already loaded on index.html.
            return;
        }
    }

    // Get user data from session storage
    getUserData() {
        this.currentUserId = sessionStorage.getItem('userId');
        this.currentUserName = sessionStorage.getItem('userName') || 'User';
        this.currentUserEmail = sessionStorage.getItem('userEmail') || 'user@example.com';
    }

    // Load user tasks from localStorage
    loadUserTasks() {
        if (this.currentUserId) {
            const storedTasks = localStorage.getItem(`tasks_${this.currentUserId}`);
            this.tasks = storedTasks ? JSON.parse(storedTasks) : this.getSampleTasks();
        } else {
            this.tasks = this.getSampleTasks();
        }
    }

    // Save user tasks to localStorage
    saveUserTasks() {
        if (this.currentUserId) {
            localStorage.setItem(`tasks_${this.currentUserId}`, JSON.stringify(this.tasks));
        }
    }

    // Initialize DOM elements
    initializeDOMElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.taskDetailContent = document.getElementById('taskDetailContent');
        this.extendPageTaskSelect = document.getElementById('taskSelect');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.modal = document.getElementById('taskModal');
        this.modalClose = document.getElementById('modalClose');
        this.markCompleteBtn = document.getElementById('markCompleteBtn');
        this.editTaskBtn = document.getElementById('editTaskBtn');
        this.newTaskBtn = document.getElementById('newTaskBtn');
        this.viewInsightsBtn = document.getElementById('viewInsightsBtn');
        this.completedCount = document.getElementById('completedCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.overdueCount = document.getElementById('overdueCount');
    }

    // Setup event listeners
    setupEventListeners() {
        // Task form submission
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewTask();
            });
        }

        // Filter buttons
        if (this.filterButtons) {
            this.filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.filterButtons.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentFilter = e.target.dataset.filter;
                    this.renderTaskList();
                });
            });
        }

        // Modal close button
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Mark complete button in modal
        if (this.markCompleteBtn) {
            this.markCompleteBtn.addEventListener('click', () => {
                if (this.selectedTaskId) {
                    this.toggleTaskCompletion(this.selectedTaskId);
                }
            });
        }
        
        // Edit task button in modal
        if (this.editTaskBtn) {
            this.editTaskBtn.addEventListener('click', () => {
                if (this.selectedTaskId) {
                    this.editTask(this.selectedTaskId);
                }
            });
        }
        
        // New task button
        if (this.newTaskBtn) {
            this.newTaskBtn.addEventListener('click', () => {
                const taskNameInput = document.getElementById('taskName');
                if (taskNameInput) {
                    taskNameInput.focus();
                    taskNameInput.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                    taskNameInput.classList.add('pulse');
                    setTimeout(() => {
                        taskNameInput.classList.remove('pulse');
                    }, 1000);
                }
            });
        }
        
        // View insights button
        if (this.viewInsightsBtn) {
            this.viewInsightsBtn.addEventListener('click', () => {
                this.showNotification('📊 Advanced analytics dashboard coming soon!', 'info');
            });
        }

        // Quick action extend buttons
        document.querySelectorAll('.extend-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskName = e.target.closest('.extend-task-btn').dataset.task;
                const matchedTask = this.tasks.find(task => task.name.toLowerCase() === String(taskName).toLowerCase());

                if (matchedTask) {
                    this.openExtendPageForTask(matchedTask.id);
                    this.showNotification(`Opened Extend Deadline for "${matchedTask.name}"`, 'info');
                    return;
                }

                this.openExtendPageForTask();
                this.showNotification('Opened Extend Deadline section', 'info');
            });
        });

        // Extension request submission (on extend page)
        const submitExtensionBtn = document.getElementById('submitExtensionBtn');
        if (submitExtensionBtn) {
            submitExtensionBtn.addEventListener('click', () => this.submitExtensionRequest());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Initialize task actions
        this.initializeTaskActions();
    }

    // Setup priority selection
    setupPrioritySelect() {
        const priorityOptions = document.querySelectorAll('.priority-option');
        const priorityInput = document.getElementById('priority');
        
        if (priorityOptions.length && priorityInput) {
            priorityOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    priorityOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    priorityInput.value = value;
                });
            });
        }
    }

    // Set default dates in form
    setDefaultDates() {
        const dueDateInput = document.getElementById('dueDate');
        if (dueDateInput) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            dueDateInput.value = this.getDateKey(nextWeek);
            dueDateInput.min = this.getDateKey(new Date());
        }
    }

    // Update user information in the header
    updateUserInfo() {
        // Update user name in welcome message
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome back, ${this.currentUserName}!`;
        }
        
        // Update user avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.textContent = this.currentUserName.charAt(0).toUpperCase();
        }
        
        // Update user email
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = this.currentUserEmail;
        }
    }

    // Create a new task
    createNewTask() {
        const taskName = document.getElementById('taskName').value;
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;
        const category = document.getElementById('category').value;
        const taskLink = document.getElementById('taskLink').value;

        const newTask = {
            id: this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1,
            name: taskName,
            dueDate: dueDate,
            priority: priority,
            category: category,
            link: taskLink,
            completed: false,
            created: this.getDateKey(new Date()),
            extensions: []
        };

        this.tasks.push(newTask);
        this.saveUserTasks();
        
        // Reset form
        this.taskForm.reset();
        this.setDefaultDates();
        document.getElementById('priority').value = 'medium';
        
        // Reset priority UI
        document.querySelectorAll('.priority-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.value === 'medium') {
                opt.classList.add('active');
            }
        });
        
        // Update UI
        this.renderTaskList();
        this.updateExtendTaskSelect();
        this.updateStats();
        
        // Show success animation
        const createBtn = this.taskForm.querySelector('button[type="submit"]');
        const originalHTML = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-check"></i> Task Created!';
        createBtn.style.background = 'linear-gradient(135deg, var(--success), var(--success-light))';
        
        setTimeout(() => {
            createBtn.innerHTML = originalHTML;
            createBtn.style.background = '';
        }, 1500);
        
        // Show notification
        this.showNotification(`🎉 Task "${taskName}" created successfully!`, 'success');
        
        // Show task details
        this.selectedTaskId = newTask.id;
        this.renderTaskDetails(newTask.id);
    }

    // Render task list based on current filter
    renderTaskList() {
        if (!this.taskList) return;
        
        this.taskList.innerHTML = '';
        
        let filteredTasks = this.tasks;
        
        if (this.currentFilter === 'active') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        }
        
        // Sort tasks: overdue first, then by due date
        filteredTasks.sort((a, b) => {
            const aStatus = this.getTaskStatus(a);
            const bStatus = this.getTaskStatus(b);
            
            // Overdue tasks first
            if (aStatus === 'overdue' && bStatus !== 'overdue') return -1;
            if (bStatus === 'overdue' && aStatus !== 'overdue') return 1;
            
            // Then by due date
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'completed' ? 'No completed tasks yet' : 'Create your first task to get started!'}</p>
                </div>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskStatus = this.getTaskStatus(task);
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            taskItem.style.borderLeftColor = this.getCategoryColor(task.category);
            
            const categoryIcon = this.getCategoryIcon(task.category);
            
            taskItem.innerHTML = `
                <div class="task-header">
                    <div>
                        <div class="task-title">
                            <i class="${categoryIcon}" style="margin-right: 8px; color: ${this.getCategoryColor(task.category)}"></i>
                            ${task.name}
                            <span class="task-priority priority-${task.priority}">
                                <i class="fas fa-flag"></i> ${task.priority}
                            </span>
                        </div>
                        <div class="task-date">
                            <i class="far fa-calendar"></i>
                            Due: ${this.formatDate(task.dueDate)}
                            ${task.extensions.length > 0 ? 
                                `<span style="margin-left: 8px; color: var(--warning);">
                                    <i class="fas fa-clock-rotate-left"></i> Extended ${task.extensions.length} time${task.extensions.length > 1 ? 's' : ''}
                                </span>` : 
                                ''}
                        </div>
                    </div>
                    <span class="task-status status-${taskStatus}">
                        <i class="fas fa-${this.getStatusIcon(taskStatus)}"></i> ${taskStatus.replace('-', ' ')}
                    </span>
                </div>
                <div class="task-meta">
                    <div>
                        ${task.link ? 
                            `<a href="${task.link}" target="_blank" class="task-link">
                                <i class="fas fa-external-link-alt"></i> View Link
                            </a>` : 
                            ''}
                    </div>
                    <div class="task-actions">
                        <button class="icon-btn complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                            <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="icon-btn delete-btn" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners to the task item
            taskItem.addEventListener('click', (e) => {
                if (!e.target.closest('.task-actions')) {
                    this.selectedTaskId = task.id;
                    this.renderTaskDetails(task.id);
                    this.highlightTaskItem(task.id);
                }
            });
            
            // Store reference to task for event listeners
            taskItem._taskId = task.id;
            
            this.taskList.appendChild(taskItem);
        });
        
        // Reinitialize task actions for newly created elements
        this.initializeTaskActions();
    }

    // Initialize task action buttons
    initializeTaskActions() {
        // Complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTaskCompletion(taskId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    // Highlight selected task item
    highlightTaskItem(taskId) {
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.id) === taskId) {
                item.classList.add('selected');
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Render task details in the right column
    renderTaskDetails(taskId) {
        if (!this.taskDetailContent) return;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            this.showEmptyTaskDetails();
            return;
        }
        
        const taskStatus = this.getTaskStatus(task);
        const daysLeft = this.calculateDaysLeft(task.dueDate);
        
        this.taskDetailContent.innerHTML = `
            <div class="task-detail">
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-tag"></i> Name
                    </div>
                    <div class="detail-value">${task.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-flag"></i> Status
                    </div>
                    <div class="detail-value">
                        <span class="task-status status-${taskStatus}">
                            <i class="fas fa-${this.getStatusIcon(taskStatus)}"></i> ${taskStatus.replace('-', ' ')}
                        </span>
                        ${task.completed ? 
                            '<span style="margin-left: 8px; color: var(--success);"><i class="fas fa-check-circle"></i> Completed</span>' : 
                            ''}
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-calendar-day"></i> Due Date
                    </div>
                    <div class="detail-value">
                        ${this.formatDate(task.dueDate)} 
                        <span class="date-badge ${daysLeft < 0 ? 'badge-danger' : daysLeft <= 3 ? 'badge-warning' : 'badge-success'}">
                            ${daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-flag"></i> Priority
                    </div>
                    <div class="detail-value">
                        <span class="task-priority priority-${task.priority}">
                            <i class="fas fa-flag"></i> ${task.priority}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-folder"></i> Category
                    </div>
                    <div class="detail-value">
                        <span class="category-badge" style="background: ${this.getCategoryColor(task.category)}20; color: ${this.getCategoryColor(task.category)}; border: 1px solid ${this.getCategoryColor(task.category)}40;">
                            <i class="${this.getCategoryIcon(task.category)}"></i> ${task.category}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-calendar-plus"></i> Created
                    </div>
                    <div class="detail-value">${this.formatDate(task.created)}</div>
                </div>
                ${task.link ? `
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-link"></i> Link
                    </div>
                    <div class="detail-value">
                        <a href="${task.link}" target="_blank" class="task-link">
                            <i class="fas fa-external-link-alt"></i> Open link
                        </a>
                    </div>
                </div>
                ` : ''}
                ${task.extensions.length > 0 ? `
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-clock-rotate-left"></i> Extensions
                    </div>
                    <div class="detail-value">
                        <div class="extensions-list">
                            ${task.extensions.map(ext => `
                                <div class="extension-item">
                                    <i class="fas fa-plus-circle" style="color: var(--warning);"></i>
                                    +${ext.days} days
                                    ${ext.reason ? `<span class="extension-reason">(${ext.reason})</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
                <div class="detail-actions">
                    <button class="btn btn-gradient" id="completeDetailBtn">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i> ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-outline" id="extendDetailBtn">
                        <i class="fas fa-clock-rotate-left"></i> Extend Deadline
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to detail action buttons
        const completeDetailBtn = document.getElementById('completeDetailBtn');
        if (completeDetailBtn) {
            completeDetailBtn.addEventListener('click', () => {
                this.toggleTaskCompletion(taskId);
            });
        }
        
        const extendDetailBtn = document.getElementById('extendDetailBtn');
        if (extendDetailBtn) {
            extendDetailBtn.addEventListener('click', () => {
                this.showExtendModal(taskId);
            });
        }
    }

    // Show empty task details state
    showEmptyTaskDetails() {
        if (this.taskDetailContent) {
            this.taskDetailContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <h3>Select a Task</h3>
                    <p>Click on any task to view its details here</p>
                </div>
            `;
        }
    }

    // Update the extend task dropdown
    updateExtendTaskSelect() {
        const activeTasks = this.tasks.filter(task => !task.completed);

        if (this.extendPageTaskSelect) {
            this.extendPageTaskSelect.innerHTML = '<option value="">Select a task...</option>';
        }
        
        activeTasks.forEach(task => {
            const optionLabel = `${task.name} (Due: ${this.formatDate(task.dueDate)})`;

            if (this.extendPageTaskSelect) {
                const pageOption = document.createElement('option');
                pageOption.value = task.id;
                pageOption.textContent = optionLabel;
                this.extendPageTaskSelect.appendChild(pageOption);
            }
        });
    }

    // Submit extension from the Extend Deadline page and apply it to the task
    submitExtensionRequest() {
        const extensionLength = document.getElementById('extensionLength');
        const extensionReason = document.getElementById('extensionReason');

        const taskId = parseInt(this.extendPageTaskSelect ? this.extendPageTaskSelect.value : '', 10);
        const daysToAdd = parseInt(extensionLength ? extensionLength.value : '', 10);
        const reason = extensionReason ? extensionReason.value.trim() : '';

        if (!taskId || !daysToAdd) {
            this.showNotification('Please select a task and extension length', 'warning');
            return;
        }

        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            this.showNotification('Selected task no longer exists', 'warning');
            return;
        }

        const currentDueDate = this.parseDateKey(task.dueDate);
        currentDueDate.setDate(currentDueDate.getDate() + daysToAdd);

        task.dueDate = this.getDateKey(currentDueDate);
        task.extensions.push({
            days: daysToAdd,
            reason: reason,
            date: this.getDateKey(new Date())
        });

        this.saveUserTasks();
        this.renderTaskList();
        this.updateExtendTaskSelect();
        this.updateStats();
        this.renderExtensionHistory();
        
        // Update calendar to reflect new deadline
        if (window.sidebarController) {
            window.sidebarController.renderCalendar();
        }

        if (this.selectedTaskId === taskId) {
            this.renderTaskDetails(taskId);
        }

        if (this.extendPageTaskSelect) this.extendPageTaskSelect.value = '';
        if (extensionLength) extensionLength.value = '';
        if (extensionReason) extensionReason.value = '';

        const submitExtensionBtn = document.getElementById('submitExtensionBtn');
        if (submitExtensionBtn) {
            const originalHTML = submitExtensionBtn.innerHTML;
            submitExtensionBtn.innerHTML = '<i class="fas fa-check"></i> Request Submitted';
            submitExtensionBtn.style.background = 'linear-gradient(135deg, var(--success), var(--success-light))';

            setTimeout(() => {
                submitExtensionBtn.innerHTML = originalHTML;
                submitExtensionBtn.style.background = '';
            }, 1200);
        }

        this.showNotification(`✨ Deadline for "${task.name}" extended by ${daysToAdd} day(s)!`, 'success');
    }

    // Render extension history cards from real task extension data
    renderExtensionHistory() {
        const extensionHistory = document.getElementById('extensionHistory');
        if (!extensionHistory) return;

        const extensionEntries = this.tasks
            .flatMap(task => (task.extensions || []).map(ext => ({
                taskName: task.name,
                days: ext.days,
                reason: ext.reason || '',
                date: ext.date
            })))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (extensionEntries.length === 0) {
            extensionHistory.innerHTML = `
                <div class="extension-card" style="background: white; padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border);">
                    <p style="color: var(--text-secondary); margin: 0;">No extension requests yet.</p>
                </div>
            `;
            return;
        }

        extensionHistory.innerHTML = extensionEntries.map(entry => `
            <div class="extension-card" style="background: white; padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; gap: 12px;">
                    <div>
                        <h4 style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${this.escapeHtml(entry.taskName)}</h4>
                        <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">Extended by ${entry.days} day(s)</p>
                        ${entry.reason ? `<p style="font-size: 13px; color: var(--text-muted); margin: 6px 0 0;">Reason: ${this.escapeHtml(entry.reason)}</p>` : ''}
                    </div>
                    <span class="status-approved" style="padding: 6px 12px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; background: var(--success-light); color: var(--success); white-space: nowrap;">
                        <i class="fas fa-check"></i> Applied
                    </span>
                </div>
                <div style="font-size: 13px; color: var(--text-muted);">
                    <i class="far fa-calendar"></i> Date: ${this.formatDate(entry.date)}
                </div>
            </div>
        `).join('');
    }

    // Show extend modal for specific task
    showExtendModal(taskId) {
        this.openExtendPageForTask(taskId);
    }

    // Open Extend page and optionally preselect a task
    openExtendPageForTask(taskId = null) {
        const extendNavItem = document.querySelector('.nav-item[data-page="extend"]');
        if (extendNavItem) {
            extendNavItem.click();
        } else {
            window.location.hash = 'extend';
        }

        setTimeout(() => {
            if (taskId && this.extendPageTaskSelect) {
                this.extendPageTaskSelect.value = String(taskId);
            }

            const extensionLength = document.getElementById('extensionLength');
            if (extensionLength) {
                extensionLength.focus();
            }

            const extendSection = document.querySelector('#extend .extensions-container');
            if (extendSection) {
                extendSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 120);
    }

    // Escape text for safe HTML rendering
    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Toggle task completion status
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        this.saveUserTasks();
        
        // Update UI
        this.renderTaskList();
        this.updateExtendTaskSelect();
        this.updateStats();
        this.renderExtensionHistory();
        
        // Update task details
        if (this.selectedTaskId === taskId) {
            this.renderTaskDetails(taskId);
        }
        
        // Show notification with celebration for completion
        if (task.completed) {
            this.showNotification(`🎉 Task "${task.name}" completed! Great job!`, 'success');
            this.celebrateCompletion();
        } else {
            this.showNotification(`📝 Task "${task.name}" marked as active`, 'info');
        }
        
        // Close modal if open
        this.closeModal();
    }

    // Delete a task
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (!confirm(`Are you sure you want to delete "${task.name}"?`)) {
            return;
        }
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveUserTasks();
        
        // Update UI
        this.renderTaskList();
        this.updateExtendTaskSelect();
        this.updateStats();
        this.renderExtensionHistory();
        
        // Clear task details if deleted task was selected
        if (this.selectedTaskId === taskId) {
            this.selectedTaskId = null;
            this.showEmptyTaskDetails();
        }
        
        // Show notification
        this.showNotification(`🗑️ Task "${task.name}" deleted`, 'info');
    }

    // Edit a task
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // In a real app, you would show an edit form
        // For now, we'll just allow editing the name via prompt
        const newName = prompt('Enter new task name:', task.name);
        if (newName && newName.trim() !== '') {
            const oldName = task.name;
            task.name = newName.trim();
            this.saveUserTasks();
            
            // Update UI
            this.renderTaskList();
            this.updateExtendTaskSelect();
            this.renderExtensionHistory();
            
            // Update task details
            if (this.selectedTaskId === taskId) {
                this.renderTaskDetails(taskId);
            }
            
            this.showNotification(`✏️ Task renamed from "${oldName}" to "${task.name}"`, 'success');
        }
        
        this.closeModal();
    }

    // Close modal
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    // Update statistics
    updateStats() {
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const overdue = this.tasks.filter(t => !t.completed && this.getTaskStatus(t) === 'overdue').length;
        
        if (this.completedCount) this.completedCount.textContent = completed;
        if (this.pendingCount) this.pendingCount.textContent = pending;
        if (this.overdueCount) this.overdueCount.textContent = overdue;
        
        // Animate number changes
        if (this.completedCount) this.animateCount(this.completedCount, completed);
        if (this.pendingCount) this.animateCount(this.pendingCount, pending);
        if (this.overdueCount) this.animateCount(this.overdueCount, overdue);
    }

    // Animate number counting
    animateCount(element, target) {
        const current = parseInt(element.textContent);
        if (current === target) return;
        
        const increment = target > current ? 1 : -1;
        const duration = 500;
        const steps = Math.abs(target - current);
        const stepTime = duration / steps;
        
        let currentValue = current;
        const timer = setInterval(() => {
            currentValue += increment;
            element.textContent = currentValue;
            
            if (currentValue === target) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Get task status based on due date
    getTaskStatus(task) {
        if (task.completed) return 'completed';
        
        const daysLeft = this.calculateDaysLeft(task.dueDate);
        
        if (daysLeft < 0) return 'overdue';
        if (daysLeft <= 3) return 'due-soon';
        return 'on-track';
    }

    // Calculate days left until due date
    calculateDaysLeft(dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = this.parseDateKey(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Format date to readable string
    formatDate(dateString) {
        const date = this.parseDateKey(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const target = this.parseDateKey(dateString);
        target.setHours(0, 0, 0, 0);
        
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }

    // Get category color
    getCategoryColor(category) {
        const colors = {
            work: '#6366f1',
            personal: '#10b981',
            study: '#f59e0b',
            health: '#ef4444',
            other: '#8b5cf6'
        };
        return colors[category] || colors.other;
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            work: 'fas fa-briefcase',
            personal: 'fas fa-user',
            study: 'fas fa-graduation-cap',
            health: 'fas fa-heartbeat',
            other: 'fas fa-star'
        };
        return icons[category] || icons.other;
    }

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            completed: 'check-circle',
            overdue: 'exclamation-triangle',
            'due-soon': 'clock',
            'on-track': 'check-circle'
        };
        return icons[status] || 'circle';
    }

    // Show notification
    showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Celebration effect for task completion
    celebrateCompletion() {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            animation.onfinish = () => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            };
        }
    }

    // Get sample tasks
    getSampleTasks() {
        return [
            {
                id: 1,
                name: 'Complete project proposal',
                dueDate: this.getDateString(3),
                priority: 'high',
                category: 'work',
                link: 'https://example.com/project',
                completed: false,
                created: this.getDateString(-2),
                extensions: []
            },
            {
                id: 2,
                name: 'Review design mockups',
                dueDate: this.getDateString(7),
                priority: 'medium',
                category: 'work',
                link: '',
                completed: false,
                created: this.getDateString(-5),
                extensions: []
            },
            {
                id: 3,
                name: 'Update documentation',
                dueDate: this.getDateString(-2),
                priority: 'low',
                category: 'study',
                link: 'https://docs.example.com',
                completed: true,
                created: this.getDateString(-10),
                extensions: []
            },
            {
                id: 4,
                name: 'Team meeting preparation',
                dueDate: this.getDateString(1),
                priority: 'medium',
                category: 'work',
                link: '',
                completed: false,
                created: this.getDateString(-3),
                extensions: []
            },
            {
                id: 5,
                name: 'Gym workout session',
                dueDate: this.getDateString(0),
                priority: 'low',
                category: 'health',
                link: '',
                completed: false,
                created: this.getDateString(-1),
                extensions: []
            }
        ];
    }

    // Get date string with offset days
    getDateString(offsetDays) {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return this.getDateKey(date);
    }

    // Format a Date object as YYYY-MM-DD in local time
    getDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse YYYY-MM-DD as local date to avoid UTC timezone shifts
    parseDateKey(dateString) {
        const [year, month, day] = String(dateString || '').split('-').map(Number);
        if (year && month && day) {
            return new Date(year, month - 1, day);
        }
        return new Date(dateString);
    }

    // Logout user
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session storage
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = 'index.html';
        }
    }

    // Check URL parameters for demo purposes
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const demo = urlParams.get('demo');
        
        if (demo === 'true') {
            this.showNotification('Welcome to the demo! Try creating, completing, and extending tasks.', 'info');
        }
    }
}

// Initialize the dashboard app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple initializations
    if (window.dashboardApp) return;
    
    const dashboardApp = new DashboardApp();
    
    // Make app available globally for debugging
    window.dashboardApp = dashboardApp;
    
    // Global function to show task detail from calendar popup
    window.showTaskDetail = function(taskId) {
        // Navigate to dashboard
        if (window.sidebarController) {
            window.sidebarController.navigateTo('dashboard');
        }
        
        // Close popup
        const popup = document.getElementById('dateTasksPopup');
        if (popup) popup.remove();
        
        // Show task details
        setTimeout(() => {
            dashboardApp.selectedTaskId = taskId;
            dashboardApp.renderTaskDetails(taskId);
            dashboardApp.highlightTaskItem(taskId);
        }, 100);
    };
});