// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Sample initial tasks
  let tasks = [
    {
      id: 1,
      name: 'Complete project proposal',
      dueDate: getDateString(3), // 3 days from now
      priority: 'high',
      category: 'work',
      link: 'https://example.com/project',
      completed: false,
      created: getDateString(-2),
      extensions: []
    },
    {
      id: 2,
      name: 'Review design mockups',
      dueDate: getDateString(7), // 7 days from now
      priority: 'medium',
      category: 'work',
      link: '',
      completed: false,
      created: getDateString(-5),
      extensions: []
    },
    {
      id: 3,
      name: 'Update documentation',
      dueDate: getDateString(-2), // 2 days overdue
      priority: 'low',
      category: 'study',
      link: 'https://docs.example.com',
      completed: true,
      created: getDateString(-10),
      extensions: []
    },
    {
      id: 4,
      name: 'Team meeting preparation',
      dueDate: getDateString(1), // Tomorrow
      priority: 'medium',
      category: 'work',
      link: '',
      completed: false,
      created: getDateString(-3),
      extensions: []
    },
    {
      id: 5,
      name: 'Gym workout session',
      dueDate: getDateString(0), // Today
      priority: 'low',
      category: 'health',
      link: '',
      completed: false,
      created: getDateString(-1),
      extensions: []
    }
  ];

  // DOM Elements
  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const taskDetailContent = document.getElementById('taskDetailContent');
  const extendTaskSelect = document.getElementById('extendTask');
  const extendBtn = document.getElementById('extendBtn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('taskModal');
  const modalClose = document.getElementById('modalClose');
  const markCompleteBtn = document.getElementById('markCompleteBtn');
  const editTaskBtn = document.getElementById('editTaskBtn');
  const newTaskBtn = document.getElementById('newTaskBtn');
  const viewInsightsBtn = document.getElementById('viewInsightsBtn');
  const extendDaysInput = document.getElementById('extendDays');
  const extendDaysMinus = document.querySelector('.day-btn.minus');
  const extendDaysPlus = document.querySelector('.day-btn.plus');
  
  // Stats elements
  const completedCount = document.getElementById('completedCount');
  const pendingCount = document.getElementById('pendingCount');
  const overdueCount = document.getElementById('overdueCount');

  let selectedTaskId = null;
  let currentFilter = 'all';

  // Initialize the app
  function init() {
    renderTaskList();
    updateExtendTaskSelect();
    updateStats();
    setupEventListeners();
    setupPrioritySelect();
    
    // Set default due date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('dueDate').value = nextWeek.toISOString().split('T')[0];
    document.getElementById('dueDate').min = new Date().toISOString().split('T')[0];
    
    // Initialize sample tasks if none exist
    if (tasks.length === 0) {
      tasks = getSampleTasks();
      renderTaskList();
      updateExtendTaskSelect();
      updateStats();
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Task form submission
    taskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      createNewTask();
    });

    // Extend deadline button
    extendBtn.addEventListener('click', extendDeadline);
    
    // Extend days buttons
    extendDaysMinus.addEventListener('click', function() {
      const current = parseInt(extendDaysInput.value) || 7;
      if (current > 1) {
        extendDaysInput.value = current - 1;
      }
    });
    
    extendDaysPlus.addEventListener('click', function() {
      const current = parseInt(extendDaysInput.value) || 7;
      if (current < 30) {
        extendDaysInput.value = current + 1;
      }
    });

    // Filter buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderTaskList();
      });
    });

    // Modal close button
    modalClose.addEventListener('click', closeModal);
    
    // Mark complete button in modal
    markCompleteBtn.addEventListener('click', function() {
      if (selectedTaskId) {
        toggleTaskCompletion(selectedTaskId);
      }
    });
    
    // Edit task button in modal
    editTaskBtn.addEventListener('click', function() {
      if (selectedTaskId) {
        editTask(selectedTaskId);
      }
    });
    
    // New task button
    newTaskBtn.addEventListener('click', function() {
      document.getElementById('taskName').focus();
      document.getElementById('taskName').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      document.getElementById('taskName').classList.add('pulse');
      setTimeout(() => {
        document.getElementById('taskName').classList.remove('pulse');
      }, 1000);
    });
    
    // View insights button
    viewInsightsBtn.addEventListener('click', function() {
      showNotification('📊 Advanced analytics dashboard coming soon!', 'info');
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Set up priority selection
  function setupPrioritySelect() {
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityInput = document.getElementById('priority');
    
    priorityOptions.forEach(option => {
      option.addEventListener('click', function() {
        const value = this.dataset.value;
        priorityOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        priorityInput.value = value;
      });
    });
  }

  // Create a new task
  function createNewTask() {
    const taskName = document.getElementById('taskName').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const category = document.getElementById('category').value;
    const taskLink = document.getElementById('taskLink').value;

    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      name: taskName,
      dueDate: dueDate,
      priority: priority,
      category: category,
      link: taskLink,
      completed: false,
      created: new Date().toISOString().split('T')[0],
      extensions: []
    };

    tasks.push(newTask);
    
    // Reset form
    taskForm.reset();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('dueDate').value = nextWeek.toISOString().split('T')[0];
    document.getElementById('priority').value = 'medium';
    
    // Reset priority UI
    document.querySelectorAll('.priority-option').forEach(opt => {
      opt.classList.remove('active');
      if (opt.dataset.value === 'medium') {
        opt.classList.add('active');
      }
    });
    
    // Update UI
    renderTaskList();
    updateExtendTaskSelect();
    updateStats();
    
    // Show success animation
    const createBtn = taskForm.querySelector('button[type="submit"]');
    createBtn.innerHTML = '<i class="fas fa-check"></i> Task Created!';
    createBtn.style.background = 'linear-gradient(135deg, var(--success), var(--success-light))';
    
    setTimeout(() => {
      createBtn.innerHTML = '<i class="fas fa-sparkles"></i> Create Task';
      createBtn.style.background = '';
    }, 1500);
    
    // Show notification
    showNotification(`🎉 Task "${taskName}" created successfully!`, 'success');
    
    // Show task details
    selectedTaskId = newTask.id;
    renderTaskDetails(newTask.id);
  }

  // Render task list based on current filter
  function renderTaskList() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Sort tasks: overdue first, then by due date
    filteredTasks.sort((a, b) => {
      const aStatus = getTaskStatus(a);
      const bStatus = getTaskStatus(b);
      
      // Overdue tasks first
      if (aStatus === 'overdue' && bStatus !== 'overdue') return -1;
      if (bStatus === 'overdue' && aStatus !== 'overdue') return 1;
      
      // Then by due date
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
        </div>
      `;
      return;
    }
    
    filteredTasks.forEach(task => {
      const taskStatus = getTaskStatus(task);
      const taskItem = document.createElement('li');
      taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
      taskItem.dataset.id = task.id;
      taskItem.style.borderLeftColor = getCategoryColor(task.category);
      
      const categoryIcon = getCategoryIcon(task.category);
      
      taskItem.innerHTML = `
        <div class="task-header">
          <div>
            <div class="task-title">
              <i class="${categoryIcon}" style="margin-right: 8px; color: ${getCategoryColor(task.category)}"></i>
              ${task.name}
              <span class="task-priority priority-${task.priority}">
                <i class="fas fa-flag"></i> ${task.priority}
              </span>
            </div>
            <div class="task-date">
              <i class="far fa-calendar"></i>
              Due: ${formatDate(task.dueDate)}
              ${task.extensions.length > 0 ? 
                `<span style="margin-left: 8px; color: var(--warning);">
                  <i class="fas fa-clock-rotate-left"></i> Extended ${task.extensions.length} time${task.extensions.length > 1 ? 's' : ''}
                </span>` : 
                ''}
            </div>
          </div>
          <span class="task-status status-${taskStatus}">
            <i class="fas fa-${getStatusIcon(taskStatus)}"></i> ${taskStatus.replace('-', ' ')}
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
      taskItem.addEventListener('click', function(e) {
        if (!e.target.closest('.task-actions')) {
          selectedTaskId = task.id;
          renderTaskDetails(task.id);
          highlightTaskItem(task.id);
        }
      });
      
      // Add event listeners to action buttons
      const completeBtn = taskItem.querySelector('.complete-btn');
      completeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleTaskCompletion(task.id);
      });
      
      const deleteBtn = taskItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteTask(task.id);
      });
      
      taskList.appendChild(taskItem);
    });
  }

  // Highlight selected task item
  function highlightTaskItem(taskId) {
    document.querySelectorAll('.task-item').forEach(item => {
      item.classList.remove('selected');
      if (parseInt(item.dataset.id) === taskId) {
        item.classList.add('selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Render task details in the right column
  function renderTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const taskStatus = getTaskStatus(task);
    const daysLeft = calculateDaysLeft(task.dueDate);
    
    taskDetailContent.innerHTML = `
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
              <i class="fas fa-${getStatusIcon(taskStatus)}"></i> ${taskStatus.replace('-', ' ')}
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
            ${formatDate(task.dueDate)} 
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
            <span class="category-badge" style="background: ${getCategoryColor(task.category)}20; color: ${getCategoryColor(task.category)}; border: 1px solid ${getCategoryColor(task.category)}40;">
              <i class="${getCategoryIcon(task.category)}"></i> ${task.category}
            </span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">
            <i class="fas fa-calendar-plus"></i> Created
          </div>
          <div class="detail-value">${formatDate(task.created)}</div>
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
      </div>
    `;
    
    // Update modal with task details
    document.getElementById('modalTaskTitle').textContent = task.name;
    
    const modalDetails = document.getElementById('modalTaskDetails');
    modalDetails.innerHTML = `
      <div class="detail-row">
        <div class="detail-label">Status</div>
        <div class="detail-value">${task.completed ? 'Completed' : 'Active'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Due Date</div>
        <div class="detail-value">${formatDate(task.dueDate)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Priority</div>
        <div class="detail-value">${task.priority}</div>
      </div>
    `;
    
    // Update modal button text
    markCompleteBtn.innerHTML = `<i class="fas fa-${task.completed ? 'undo' : 'check'}"></i> ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}`;
    
    // Show modal
    modal.style.display = 'flex';
  }

  // Update the extend task dropdown
  function updateExtendTaskSelect() {
    extendTaskSelect.innerHTML = '<option value="">Select a task...</option>';
    
    const activeTasks = tasks.filter(task => !task.completed);
    
    activeTasks.forEach(task => {
      const option = document.createElement('option');
      option.value = task.id;
      option.textContent = `${task.name} (Due: ${formatDate(task.dueDate)})`;
      extendTaskSelect.appendChild(option);
    });
  }

  // Extend a task's deadline
  function extendDeadline() {
    const taskId = parseInt(extendTaskSelect.value);
    const daysToAdd = parseInt(document.getElementById('extendDays').value);
    const reason = document.getElementById('extendReason').value;
    
    if (!taskId || !daysToAdd) {
      showNotification('Please select a task and enter days to add', 'warning');
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Calculate new due date
    const currentDueDate = new Date(task.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + daysToAdd);
    
    // Update task
    task.dueDate = currentDueDate.toISOString().split('T')[0];
    task.extensions.push({
      days: daysToAdd,
      reason: reason,
      date: new Date().toISOString().split('T')[0]
    });
    
    // Update UI
    renderTaskList();
    updateExtendTaskSelect();
    updateStats();
    
    // Clear extend form
    document.getElementById('extendReason').value = '';
    
    // Show success animation
    extendBtn.innerHTML = '<i class="fas fa-check"></i> Extended!';
    extendBtn.style.background = 'linear-gradient(135deg, var(--success), var(--success-light))';
    
    setTimeout(() => {
      extendBtn.innerHTML = '<i class="fas fa-magic"></i> Extend Deadline';
      extendBtn.style.background = '';
    }, 1500);
    
    // Show success message
    showNotification(`✨ Deadline extended by ${daysToAdd} days!`, 'success');
    
    // Update task details if this task is selected
    if (selectedTaskId === taskId) {
      renderTaskDetails(taskId);
    }
  }

  // Toggle task completion status
  function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    
    // Update UI
    renderTaskList();
    updateExtendTaskSelect();
    updateStats();
    
    // Update task details
    if (selectedTaskId === taskId) {
      renderTaskDetails(taskId);
    }
    
    // Show notification with celebration for completion
    if (task.completed) {
      showNotification(`🎉 Task "${task.name}" completed! Great job!`, 'success');
      celebrateCompletion();
    } else {
      showNotification(`📝 Task "${task.name}" marked as active`, 'info');
    }
    
    // Close modal
    closeModal();
  }

  // Delete a task
  function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!confirm(`Are you sure you want to delete "${task.name}"?`)) {
      return;
    }
    
    tasks = tasks.filter(t => t.id !== taskId);
    
    // Update UI
    renderTaskList();
    updateExtendTaskSelect();
    updateStats();
    
    // Clear task details if deleted task was selected
    if (selectedTaskId === taskId) {
      selectedTaskId = null;
      taskDetailContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-mouse-pointer"></i>
          </div>
          <h3>Select a Task</h3>
          <p>Click on any task to view its details here</p>
        </div>
      `;
    }
    
    // Show notification
    showNotification(`🗑️ Task "${task.name}" deleted`, 'info');
  }

  // Edit a task
  function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // In a real app, you would show an edit form
    // For now, we'll just allow editing the name via prompt
    const newName = prompt('Enter new task name:', task.name);
    if (newName && newName.trim() !== '') {
      const oldName = task.name;
      task.name = newName.trim();
      
      // Update UI
      renderTaskList();
      updateExtendTaskSelect();
      
      // Update task details
      if (selectedTaskId === taskId) {
        renderTaskDetails(taskId);
      }
      
      showNotification(`✏️ Task renamed from "${oldName}" to "${task.name}"`, 'success');
    }
    
    closeModal();
  }

  // Close modal
  function closeModal() {
    modal.style.display = 'none';
  }

  // Update statistics
  function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const overdue = tasks.filter(t => !t.completed && getTaskStatus(t) === 'overdue').length;
    
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    overdueCount.textContent = overdue;
    
    // Animate number changes
    animateCount(completedCount, completed);
    animateCount(pendingCount, pending);
    animateCount(overdueCount, overdue);
  }

  // Animate number counting
  function animateCount(element, target) {
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
  function getTaskStatus(task) {
    if (task.completed) return 'completed';
    
    const daysLeft = calculateDaysLeft(task.dueDate);
    
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 3) return 'due-soon';
    return 'on-track';
  }

  // Calculate days left until due date
  function calculateDaysLeft(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Format date to readable string
  function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(dateString);
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
  function getCategoryColor(category) {
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
  function getCategoryIcon(category) {
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
  function getStatusIcon(status) {
    const icons = {
      completed: 'check-circle',
      overdue: 'exclamation-triangle',
      'due-soon': 'clock',
      'on-track': 'check-circle'
    };
    return icons[status] || 'circle';
  }

  // Show notification
  function showNotification(message, type) {
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
  function celebrateCompletion() {
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

  // Get date string with offset days
  function getDateString(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
  }

  // Get sample tasks
  function getSampleTasks() {
    return [
      {
        id: 1,
        name: 'Complete project proposal',
        dueDate: getDateString(3),
        priority: 'high',
        category: 'work',
        link: 'https://example.com/project',
        completed: false,
        created: getDateString(-2),
        extensions: []
      },
      {
        id: 2,
        name: 'Review design mockups',
        dueDate: getDateString(7),
        priority: 'medium',
        category: 'work',
        link: '',
        completed: false,
        created: getDateString(-5),
        extensions: []
      },
      {
        id: 3,
        name: 'Update documentation',
        dueDate: getDateString(-2),
        priority: 'low',
        category: 'study',
        link: 'https://docs.example.com',
        completed: true,
        created: getDateString(-10),
        extensions: []
      }
    ];
  }

  // Initialize the application
  init();
});

// Add CSS for notifications and confetti
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: var(--radius-md);
      background: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 400px;
      border-left: 4px solid;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification-success {
      border-left-color: var(--success);
    }
    
    .notification-warning {
      border-left-color: var(--warning);
    }
    
    .notification-info {
      border-left-color: var(--info);
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .notification-icon {
      font-size: 20px;
    }
    
    .notification-success .notification-icon {
      color: var(--success);
    }
    
    .notification-warning .notification-icon {
      color: var(--warning);
    }
    
    .notification-info .notification-icon {
      color: var(--info);
    }
    
    .notification-message {
      flex: 1;
      font-weight: 500;
    }
    
    .confetti {
      position: fixed;
      top: -20px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      z-index: 9999;
      pointer-events: none;
    }
    
    .task-item.selected {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
      border-color: var(--primary);
      transform: scale(1.02);
    }
    
    .date-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    
    .badge-success {
      background: var(--success-light);
      color: var(--success);
    }
    
    .badge-warning {
      background: var(--warning-light);
      color: var(--warning);
    }
    
    .badge-danger {
      background: var(--danger-light);
      color: var(--danger);
    }
    
    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;
    }
    
    .extension-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: var(--border-light);
      border-radius: var(--radius-sm);
      margin-bottom: 6px;
    }
    
    .extension-reason {
      color: var(--text-secondary);
      font-style: italic;
      font-size: 12px;
    }
    
    .pulse {
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
    }
  </style>
`);