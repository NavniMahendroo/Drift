// Sidebar Navigation Controller
class SidebarController {
    constructor() {
        this.navItems = [];
        this.pageContents = [];
        this.currentPage = 'dashboard';
        this.menuToggle = null;
        this.sidebar = null;
        
        this.init();
    }

    // Initialize the sidebar
    init() {
        this.initializeDOMElements();
        this.setupEventListeners();
        this.setupNavigation();
        this.checkActivePage();
        this.updateNotificationBadges();
        this.setupCalendar();
        this.updateUserDisplay();
        this.loadAndApplyTheme();
        
        // Set initial active page (only show, don't navigate)
        if (this.currentPage) {
            this.showPage(this.currentPage);
        }
    }

    // Load and apply saved theme
    loadAndApplyTheme() {
        const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        const theme = savedSettings.theme || 'light';
        this.applyTheme(theme);
    }

    // Initialize DOM elements
    initializeDOMElements() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.pageContents = document.querySelectorAll('.page-content');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        
        // Calendar elements
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.calendarGrid = document.querySelector('.calendar-grid');
        
        // Other UI elements
        this.markAllReadBtn = document.getElementById('markAllRead');
        this.cancelLogoutBtn = document.getElementById('cancelLogout');
        this.confirmLogoutBtn = document.getElementById('confirmLogout');
        this.sidebarLogoutBtn = document.getElementById('sidebarLogout');
        
        this.currentDate = new Date();
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation items
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Calendar navigation
        if (this.prevMonthBtn && this.nextMonthBtn) {
            this.prevMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });

            this.nextMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Mark all notifications as read
        if (this.markAllReadBtn) {
            this.markAllReadBtn.addEventListener('click', () => {
                this.markAllNotificationsRead();
            });
        }

        // Logout actions
        if (this.cancelLogoutBtn) {
            this.cancelLogoutBtn.addEventListener('click', () => {
                this.navigateTo('dashboard');
            });
        }

        if (this.confirmLogoutBtn) {
            this.confirmLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        if (this.sidebarLogoutBtn) {
            this.sidebarLogoutBtn.addEventListener('click', () => {
                this.navigateTo('logout');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.sidebar && 
                !this.sidebar.contains(e.target) && 
                this.menuToggle && 
                !this.menuToggle.contains(e.target) &&
                this.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes sidebar
            if (e.key === 'Escape' && window.innerWidth <= 768 && this.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
            
            // Ctrl/Cmd + B toggles sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
    }

    // Setup navigation
    setupNavigation() {
        // Check for hash in URL
        const hash = window.location.hash.substring(1);
        if (hash && this.isValidPage(hash)) {
            this.currentPage = hash;
        }
    }

    // Check which page should be active based on URL
    checkActivePage() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1);
        
        if (hash && this.isValidPage(hash)) {
            this.currentPage = hash;
        } else if (path.includes('calendar')) {
            this.currentPage = 'calendar';
        } else if (path.includes('extend')) {
            this.currentPage = 'extend';
        } else if (path.includes('notifications')) {
            this.currentPage = 'notifications';
        } else if (path.includes('settings')) {
            this.currentPage = 'settings';
        } else if (path.includes('logout')) {
            this.currentPage = 'logout';
        }
    }

    // Navigate to a specific page
    navigateTo(page) {
        if (!this.isValidPage(page)) {
            console.error(`Invalid page: ${page}`);
            return;
        }
        
        // Prevent navigating to the same page
        if (this.currentPage === page) return;
        
        this.currentPage = page;
        this.showPage(page);
        
        // Update URL hash without triggering hashchange
        history.replaceState(null, null, '#' + page);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update page title
        this.updatePageTitle(page);
        
        // Log navigation for analytics (in a real app)
        this.logNavigation(page);
    }

    // Show a specific page
    showPage(page) {
        // Update active nav item
        this.navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.page === page) {
                nav.classList.add('active');
            }
        });
        
        // Show selected page content
        this.pageContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === page) {
                content.classList.add('active');
                
                // Trigger page-specific initialization
                this.initializePage(page);
            }
        });
    }

    // Initialize page-specific functionality
    initializePage(page) {
        // Prevent multiple initializations
        if (this.currentlyInitializing === page) return;
        this.currentlyInitializing = page;
        
        switch(page) {
            case 'calendar':
                this.renderCalendar();
                break;
            case 'notifications':
                this.loadNotifications();
                break;
            case 'extend':
                this.loadExtensionRequests();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
        
        this.currentlyInitializing = null;
    }

    // Toggle sidebar on mobile
    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('active');
            this.updateMenuToggleIcon();
        }
    }

    // Close sidebar
    closeSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('active');
            this.updateMenuToggleIcon();
        }
    }

    // Update menu toggle icon
    updateMenuToggleIcon() {
        if (!this.menuToggle || !this.sidebar) return;
        
        const icon = this.menuToggle.querySelector('i');
        if (this.sidebar.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    // Setup calendar
    setupCalendar() {
        if (this.calendarGrid) {
            this.renderCalendar();
        }
    }

    // Render calendar
    renderCalendar() {
        if (!this.calendarGrid || !this.currentMonthEl) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        
        // Update month display
        this.currentMonthEl.textContent = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        // Clear calendar grid (except headers)
        while (this.calendarGrid.children.length > 7) {
            this.calendarGrid.removeChild(this.calendarGrid.lastChild);
        }
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            this.calendarGrid.appendChild(emptyCell);
        }
        
        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.innerHTML = `<div class="day-number">${day}</div><div class="event-dots" aria-hidden="true"></div>`;

            const cellDate = new Date(year, month, day);

            // Check if it's today
            if (cellDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }

            // Check for deadlines (in a real app, this would come from user data)
            const hasDeadline = this.checkForDeadlines(cellDate);
            const isCritical = this.isCriticalDeadline(cellDate);

            if (isCritical) {
                dayCell.classList.add('deadline');
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                dot.style.background = 'var(--danger)';
                dayCell.querySelector('.event-dots').appendChild(dot);
            } else if (hasDeadline) {
                dayCell.classList.add('has-task');
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                dot.style.background = 'var(--warning)';
                dayCell.querySelector('.event-dots').appendChild(dot);
            }

            // Add click event
            dayCell.addEventListener('click', () => {
                this.handleDayClick(cellDate);
            });

            // Add hover effect
            dayCell.addEventListener('mouseenter', () => {
                if (!dayCell.classList.contains('empty')) {
                    dayCell.style.transform = 'translateY(-6px)';
                }
            });

            dayCell.addEventListener('mouseleave', () => {
                if (!dayCell.classList.contains('empty')) {
                    dayCell.style.transform = 'translateY(0)';
                }
            });

            this.calendarGrid.appendChild(dayCell);
        }
    }

    // Check if a date has deadlines (check against actual user tasks)
    checkForDeadlines(date) {
        if (!window.dashboardApp || !window.dashboardApp.tasks) return false;
        
        const dateStr = date.toISOString().split('T')[0];
        return window.dashboardApp.tasks.some(task => task.dueDate === dateStr);
    }

    // Check if a date has critical deadlines (check against actual overdue/due-soon tasks)
    isCriticalDeadline(date) {
        if (!window.dashboardApp || !window.dashboardApp.tasks) return false;
        
        const dateStr = date.toISOString().split('T')[0];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Critical if within next 3 days or overdue
        if (diffDays >= -1 && diffDays <= 3) {
            return window.dashboardApp.tasks.some(task => 
                task.dueDate === dateStr && !task.completed
            );
        }
        
        return false;
    }

    // Handle day click - show tasks for that date in a popup
    handleDayClick(date) {
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Get tasks for this date
        let tasksForDate = [];
        if (window.dashboardApp && window.dashboardApp.tasks) {
            tasksForDate = window.dashboardApp.tasks.filter(task => task.dueDate === dateStr);
        }
        
        // Show popup with tasks
        this.showDateTasksPopup(formattedDate, dateStr, tasksForDate);
    }

    // Show cute popup with tasks for a specific date
    showDateTasksPopup(formattedDate, dateStr, tasks) {
        // Remove existing popup if any
        const existingPopup = document.getElementById('dateTasksPopup');
        if (existingPopup) existingPopup.remove();
        
        // Create popup
        const popup = document.createElement('div');
        popup.id = 'dateTasksPopup';
        popup.className = 'date-tasks-popup';
        
        let tasksHTML = '';
        if (tasks.length === 0) {
            tasksHTML = `
                <div class="no-tasks">
                    <i class="fas fa-calendar-check" style="font-size: 48px; color: var(--text-muted); opacity: 0.3; margin-bottom: 12px;"></i>
                    <p style="color: var(--text-muted); margin: 0;">No tasks due on this date</p>
                </div>
            `;
        } else {
            tasksHTML = tasks.map(task => {
                const statusClass = task.completed ? 'completed' : 'active';
                const priorityColor = task.priority === 'high' ? 'var(--danger)' : 
                                     task.priority === 'medium' ? 'var(--warning)' : 'var(--success)';
                
                return `
                    <div class="popup-task-item ${statusClass}" data-task-id="${task.id}">
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <div style="width: 4px; height: 100%; background: ${priorityColor}; border-radius: 2px; margin-right: 4px;"></div>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <i class="${window.dashboardApp.getCategoryIcon(task.category)}" style="color: ${window.dashboardApp.getCategoryColor(task.category)}; font-size: 14px;"></i>
                                    <span style="font-weight: 600; color: var(--text-primary); ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.name}</span>
                                    ${task.completed ? '<i class="fas fa-check-circle" style="color: var(--success); font-size: 14px; margin-left: auto;"></i>' : ''}
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                                    <span class="priority-badge priority-${task.priority}" style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${task.priority}</span>
                                    <span>${task.category}</span>
                                </div>
                            </div>
                            <button class="popup-task-btn" onclick="window.showTaskDetail(${task.id})" title="View details">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <i class="fas fa-calendar-day" style="color: var(--primary); font-size: 20px;"></i>
                            <h3 style="margin: 0; color: var(--text-primary); font-size: 18px;">Tasks Due</h3>
                        </div>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 13px;">${formattedDate}</p>
                    </div>
                    <button class="popup-close" onclick="document.getElementById('dateTasksPopup').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="popup-tasks">
                    ${tasksHTML}
                </div>
                ${tasks.length > 0 ? `
                    <div class="popup-footer">
                        <button class="btn-popup-action" onclick="window.location.hash='dashboard'; document.getElementById('dateTasksPopup').remove();">
                            <i class="fas fa-th-large"></i> Go to Dashboard
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animate in
        setTimeout(() => popup.classList.add('show'), 10);
        
        // Close on outside click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 300);
            }
        });
    }

    // Load notifications
    loadNotifications() {
        // In a real app, you would fetch notifications from a server
        // For now, we'll use demo data
        const notificationsContainer = document.querySelector('.notifications-container');
        if (!notificationsContainer) return;
        
        // Clear existing notifications except the template structure
        const notificationItems = notificationsContainer.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            if (!item.classList.contains('template')) {
                item.remove();
            }
        });
        
        // Add demo notifications
        const demoNotifications = this.getDemoNotifications();
        demoNotifications.forEach(notification => {
            this.addNotification(notification);
        });
        
        // Update notification badge
        this.updateNotificationBadges();
    }

    // Add a notification
    addNotification(notification) {
        const notificationsContainer = document.querySelector('.notifications-container');
        if (!notificationsContainer) return;
        
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.unread ? 'unread' : ''}`;
        notificationItem.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon" style="background: ${notification.color};">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-text">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `;
        
        // Add click event to mark as read
        notificationItem.addEventListener('click', () => {
            if (notificationItem.classList.contains('unread')) {
                notificationItem.classList.remove('unread');
                this.updateNotificationBadges();
            }
        });
        
        // Insert at the beginning
        notificationsContainer.insertBefore(notificationItem, notificationsContainer.firstChild);
    }

    // Get demo notifications
    getDemoNotifications() {
        return [
            {
                title: 'Deadline Approaching',
                message: 'Project Proposal is due tomorrow at 10:00 AM',
                time: '2 hours ago',
                icon: 'fas fa-clock',
                color: '#3b82f6',
                unread: true
            },
            {
                title: 'Extension Approved',
                message: 'Your deadline extension for Design Review has been approved',
                time: '1 day ago',
                icon: 'fas fa-check-circle',
                color: '#10b981',
                unread: true
            },
            {
                title: 'New Feature Available',
                message: 'Calendar view with deadline highlighting is now available',
                time: '3 days ago',
                icon: 'fas fa-info-circle',
                color: '#6366f1',
                unread: false
            },
            {
                title: 'Overdue Task',
                message: 'Documentation Update is 2 days overdue',
                time: '4 days ago',
                icon: 'fas fa-exclamation-triangle',
                color: '#f59e0b',
                unread: false
            },
            {
                title: 'New Task Added',
                message: 'Team Meeting has been added to your task list',
                time: '1 week ago',
                icon: 'fas fa-calendar-plus',
                color: '#8b5cf6',
                unread: false
            }
        ];
    }

    // Mark all notifications as read
    markAllNotificationsRead() {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        
        // Update notification badges
        this.updateNotificationBadges();
        
        // Show confirmation
        this.showNotification('All notifications marked as read', 'success');
    }

    // Load extension requests
    loadExtensionRequests() {
        // In a real app, you would fetch extension requests from a server
        // This is a demo implementation
    }

    // Load settings
    loadSettings() {
        // Load saved settings from localStorage
        const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        
        // Apply saved settings to form elements
        Object.keys(savedSettings).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = savedSettings[key];
                } else {
                    element.value = savedSettings[key];
                }
            }
        });
        
        // Apply theme immediately
        if (savedSettings.theme) {
            this.applyTheme(savedSettings.theme);
        }
        
        // Add save functionality to all save buttons in settings
        const saveBtns = document.querySelectorAll('.settings-container .btn-primary, .settings-container .btn.btn-primary');
        saveBtns.forEach(saveBtn => {
            // Remove any existing listeners
            const newBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newBtn, saveBtn);
            
            // Add new listener
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        });
    }

    // Save settings
    saveSettings() {
        const settings = {};
        
        // Collect all settings from the form
        document.querySelectorAll('.settings-container input, .settings-container select').forEach(element => {
            if (element.name) {
                settings[element.name] = element.type === 'checkbox' ? element.checked : element.value;
            }
        });
        
        // Save to localStorage
        localStorage.setItem('userSettings', JSON.stringify(settings));
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
        
        // Apply settings immediately
        this.applySettings(settings);
    }

    // Apply settings
    applySettings(settings) {
        // Apply theme
        if (settings.theme) {
            this.applyTheme(settings.theme);
        }
        
        // Apply other settings as needed
        // In a real app, you would have more settings to apply
    }

    // Apply theme to the document
    applyTheme(theme) {
        if (theme === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme select if on settings page
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const savedTheme = JSON.parse(localStorage.getItem('userSettings') || '{}').theme;
            themeSelect.value = savedTheme || 'light';
        }
    }

    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session storage
            sessionStorage.clear();

            // Clear remembered user (optional)
            localStorage.removeItem('rememberedUser');

            // Show auth UI and hide app without a full reload
            const authWrapper = document.getElementById('authWrapper');
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            if (authWrapper) authWrapper.style.display = 'flex';
            if (sidebar) sidebar.style.display = 'none';
            if (mainContent) mainContent.style.display = 'none';

            // Reset hash and scroll to top
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Update notification badges
    updateNotificationBadges() {
        // Update calendar badge
        const calendarBadge = document.querySelector('[data-page="calendar"] .notification-badge');
        if (calendarBadge) {
            // Count upcoming deadlines (demo)
            const upcomingDeadlines = Math.floor(Math.random() * 5);
            calendarBadge.textContent = upcomingDeadlines || '';
            calendarBadge.style.display = upcomingDeadlines > 0 ? 'block' : 'none';
        }
        
        // Update notifications badge
        const notificationsBadge = document.querySelector('[data-page="notifications"] .notification-badge');
        if (notificationsBadge) {
            const unreadCount = document.querySelectorAll('.notification-item.unread').length;
            notificationsBadge.textContent = unreadCount || '';
            notificationsBadge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    // Update page title
    updatePageTitle(page) {
        const pageTitles = {
            'dashboard': 'Dashboard',
            'calendar': 'Calendar',
            'extend': 'Extend Deadline',
            'notifications': 'Notifications',
            'settings': 'Settings',
            'logout': 'Logout'
        };
        
        const title = pageTitles[page] || 'Deadline Manager';
        document.title = `${title} | Deadline Manager`;
    }

    // Log navigation for analytics
    logNavigation(page) {
        // In a real app, you would send this to your analytics service
        console.log(`Navigated to: ${page}`);
    }

    // Check if page is valid
    isValidPage(page) {
        const validPages = ['dashboard', 'calendar', 'extend', 'notifications', 'settings', 'logout'];
        return validPages.includes(page);
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

    // Get current user info
    getCurrentUser() {
        return {
            name: sessionStorage.getItem('userName') || 'User',
            email: sessionStorage.getItem('userEmail') || 'user@example.com'
        };
    }

    // Update user display in sidebar
    updateUserDisplay() {
        const user = this.getCurrentUser();
        const userNameEl = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (userNameEl) {
            userNameEl.textContent = user.name;
        }
        
        if (userAvatar) {
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.textContent = initials;
        }
    }
}

// Initialize sidebar controller when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple initializations
    if (window.sidebarController) return;
    
    const sidebarController = new SidebarController();
    
    // Make controller available globally for debugging
    window.sidebarController = sidebarController;
    
    // Global function to change theme from settings
    window.changeTheme = function(theme) {
        // Update settings
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        settings.theme = theme;
        localStorage.setItem('userSettings', JSON.stringify(settings));
        
        // Apply theme
        sidebarController.applyTheme(theme);
        
        // Show notification
        sidebarController.showNotification(`Theme changed to ${theme === 'auto' ? 'Auto (System)' : theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'success');
    };
    
    // Handle hash changes (with debounce to prevent loops)
    let hashChangeTimeout;
    window.addEventListener('hashchange', function() {
        clearTimeout(hashChangeTimeout);
        hashChangeTimeout = setTimeout(() => {
            const hash = window.location.hash.substring(1);
            if (hash && sidebarController.isValidPage(hash)) {
                sidebarController.navigateTo(hash);
            }
        }, 50);
    });
});