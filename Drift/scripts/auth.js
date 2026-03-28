// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signInCard = document.getElementById('signInCard');
    const signUpCard = document.getElementById('signUpCard');
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    // Toggle password visibility elements
    const toggleSignInPassword = document.getElementById('toggleSignInPassword');
    const toggleSignUpPassword = document.getElementById('toggleSignUpPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    // Message elements
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const signUpSuccessMessage = document.getElementById('signUpSuccessMessage');
    const signUpErrorMessage = document.getElementById('signUpErrorMessage');
    const signUpErrorText = document.getElementById('signUpErrorText');
    
    // Initialize the app
    function init() {
        setupEventListeners();
        checkRememberedUser();
        
        // Set focus on email input
        setTimeout(() => {
            if (signInCard.style.display !== 'none') {
                document.getElementById('signInEmail').focus();
            }
        }, 100);
    }

    // Set up event listeners
    function setupEventListeners() {
        // Switch between Sign In and Sign Up
        switchToSignUp.addEventListener('click', function(e) {
            e.preventDefault();
            showSignUp();
        });

        switchToSignIn.addEventListener('click', function(e) {
            e.preventDefault();
            showSignIn();
        });

        // Sign In form submission
        signInForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignIn();
        });

        // Sign Up form submission
        signUpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignUp();
        });

        // Toggle password visibility
        toggleSignInPassword.addEventListener('click', function() {
            togglePasswordVisibility('signInPassword', this);
        });

        toggleSignUpPassword.addEventListener('click', function() {
            togglePasswordVisibility('signUpPassword', this);
        });

        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility('confirmPassword', this);
        });

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const platform = this.classList.contains('google') ? 'Google' :
                              this.classList.contains('github') ? 'GitHub' : 'Twitter';
                handleSocialLogin(platform);
            });
        });

        // Forgot password
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                handleForgotPassword();
            });
        }

        // Auto-focus on form inputs when switching
        ['signInEmail', 'signInPassword', 'signUpName', 'signUpEmail', 'signUpPassword', 'confirmPassword'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('focus', function() {
                    this.parentElement.classList.add('focused');
                });
                element.addEventListener('blur', function() {
                    if (!this.value) {
                        this.parentElement.classList.remove('focused');
                    }
                });
            }
        });
    }

    // Show Sign Up form
    function showSignUp() {
        signInCard.style.display = 'none';
        signUpCard.style.display = 'block';
        signUpCard.style.animation = 'slideUp 0.5s ease';
        
        // Clear any error messages
        hideMessages();
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('signUpName').focus();
        }, 100);
    }

    // Show Sign In form
    function showSignIn() {
        signUpCard.style.display = 'none';
        signInCard.style.display = 'block';
        signInCard.style.animation = 'slideUp 0.5s ease';
        
        // Clear any error messages
        hideMessages();
        
        // Focus on email input
        setTimeout(() => {
            document.getElementById('signInEmail').focus();
        }, 100);
    }

    // Toggle password visibility
    function togglePasswordVisibility(passwordId, button) {
        const passwordInput = document.getElementById(passwordId);
        const icon = button.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Check for remembered user
    function checkRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            const user = JSON.parse(rememberedUser);
            if (user.email && user.rememberMe) {
                document.getElementById('signInEmail').value = user.email;
                document.getElementById('rememberMe').checked = true;
            }
        }
    }

    // Handle Sign In
    function handleSignIn() {
        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Basic validation
        if (!email || !password) {
            showErrorMessage('Please enter both email and password');
            return;
        }
        
        if (!isValidEmail(email)) {
            showErrorMessage('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const signInBtn = document.getElementById('signInBtn');
        const originalText = signInBtn.innerHTML;
        showLoading(signInBtn, 'Signing in...');
        
        // Simulate API call
        setTimeout(() => {
            // Get stored users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check credentials
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Save user data if "Remember me" is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify({ 
                        email, 
                        rememberMe 
                    }));
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                // Save user session
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userEmail', user.email);
                sessionStorage.setItem('userName', user.name);
                sessionStorage.setItem('userId', user.id);
                
                // Show success message
                showSuccessMessage('signInCard', `Welcome back, ${user.name}!`);
                
                // Reset button
                resetButton(signInBtn, originalText);
                
                // Enter the app after delay
                setTimeout(() => {
                    enterApp();
                }, 800);
                
            } else {
                // Invalid credentials
                showErrorMessage('Invalid email or password. Please try again.');
                resetButton(signInBtn, originalText);
                
                // Shake form for visual feedback
                signInForm.classList.add('shake');
                setTimeout(() => {
                    signInForm.classList.remove('shake');
                }, 500);
            }
        }, 1500);
    }

    // Handle Sign Up
    function handleSignUp() {
        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim().toLowerCase();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showSignUpErrorMessage('Please fill in all fields');
            return;
        }
        
        if (!isValidEmail(email)) {
            showSignUpErrorMessage('Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showSignUpErrorMessage('Password must be at least 6 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            showSignUpErrorMessage('Passwords do not match');
            return;
        }
        
        if (!agreeTerms) {
            showSignUpErrorMessage('You must agree to the terms and conditions');
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.some(user => user.email === email);
        
        if (userExists) {
            showSignUpErrorMessage('An account with this email already exists');
            return;
        }
        
        // Show loading state
        const signUpBtn = document.getElementById('signUpBtn');
        const originalText = signUpBtn.innerHTML;
        showLoading(signUpBtn, 'Creating account...');
        
        // Simulate API call
        setTimeout(() => {
            // Create new user object
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password, // Note: In production, NEVER store plain passwords
                createdAt: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    notifications: true,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            
            // Save user to localStorage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Initialize user tasks
            const userTasks = getSampleTasks();
            localStorage.setItem(`tasks_${newUser.id}`, JSON.stringify(userTasks));
            
            // Save user session
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userEmail', newUser.email);
            sessionStorage.setItem('userName', newUser.name);
            sessionStorage.setItem('userId', newUser.id);
            
            // Show success message
            showSuccessMessage('signUpCard', 'Account created successfully!');
            
            // Reset button
            resetButton(signUpBtn, originalText);
            
            // Enter the app after delay
            setTimeout(() => {
                enterApp();
            }, 800);
            
        }, 1500);
    }

    // Handle social login
    function handleSocialLogin(platform) {
        const signInBtn = document.getElementById('signInBtn');
        const originalText = signInBtn.innerHTML;
        showLoading(signInBtn, `Connecting with ${platform}...`);
        
        setTimeout(() => {
            // For demo, simulate successful social login
            const fakeName = `${platform} User`;
            const fakeEmail = `user@${platform.toLowerCase()}.com`;
            
            // Save user session
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userEmail', fakeEmail);
            sessionStorage.setItem('userName', fakeName);
            sessionStorage.setItem('userId', `social_${platform.toLowerCase()}_${Date.now()}`);
            
            showSuccessMessage('signInCard', `Successfully signed in with ${platform}!`);
            
            resetButton(signInBtn, originalText);
            
            setTimeout(() => {
                enterApp();
            }, 800);
            
        }, 1500);
    }

    // Handle forgot password
    function handleForgotPassword() {
        const email = document.getElementById('signInEmail').value.trim();
        
        if (!email || !isValidEmail(email)) {
            const inputEmail = prompt('Please enter your email address to reset your password:');
            if (inputEmail && isValidEmail(inputEmail)) {
                sendPasswordResetEmail(inputEmail);
            } else if (inputEmail) {
                alert('Please enter a valid email address.');
            }
        } else {
            sendPasswordResetEmail(email);
        }
    }

    // Send password reset email
    function sendPasswordResetEmail(email) {
        // Show loading state
        showNotification(`Sending password reset link to ${email}...`, 'info');
        
        // Simulate API call
        setTimeout(() => {
            alert(`Password reset link has been sent to ${email}. Please check your inbox and spam folder.`);
        }, 1000);
    }

    // Show success message
    function showSuccessMessage(cardId, message) {
        const successElement = cardId === 'signInCard' ? successMessage : signUpSuccessMessage;
        successElement.querySelector('span').textContent = message;
        successElement.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 4000);
    }

    // Show error message
    function showErrorMessage(message) {
        errorMessage.querySelector('span').textContent = message;
        errorMessage.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 4000);
    }

    // Show sign up error message
    function showSignUpErrorMessage(message) {
        signUpErrorText.textContent = message;
        signUpErrorMessage.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            signUpErrorMessage.classList.remove('show');
        }, 4000);
    }

    // Hide all messages
    function hideMessages() {
        [successMessage, errorMessage, signUpSuccessMessage, signUpErrorMessage].forEach(msg => {
            msg.classList.remove('show');
        });
    }

    // Show loading state on button
    function showLoading(button, text) {
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        button.disabled = true;
        button.classList.add('loading');
    }

    // Reset button to original state
    function resetButton(button, originalHTML) {
        button.innerHTML = originalHTML;
        button.disabled = false;
        button.classList.remove('loading');
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get sample tasks for new users
    function getSampleTasks() {
        const today = new Date();
        return [
            {
                id: 1,
                name: 'Welcome to Deadline Manager!',
                dueDate: formatDateString(today),
                priority: 'low',
                category: 'personal',
                link: '',
                description: 'Start by creating your first task using the form on the left.',
                completed: true,
                created: formatDateString(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
                extensions: []
            },
            {
                id: 2,
                name: 'Explore the dashboard',
                dueDate: formatDateString(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
                priority: 'medium',
                category: 'study',
                link: '',
                description: 'Try out all the features like task filtering and deadline extensions.',
                completed: false,
                created: formatDateString(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
                extensions: []
            },
            {
                id: 3,
                name: 'Create your first project',
                dueDate: formatDateString(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
                priority: 'high',
                category: 'work',
                link: '',
                description: 'Add a real task with deadline and priority.',
                completed: false,
                created: formatDateString(today),
                extensions: []
            }
        ];
    }

    // Format date to YYYY-MM-DD
    function formatDateString(date) {
        return date.toISOString().split('T')[0];
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

    // Check auth state and show/hide UI accordingly
    function checkAuthState() {
        // Prevent multiple checks
        if (window.authStateChecked) return;
        window.authStateChecked = true;
        
        const isAuthenticated = sessionStorage.getItem('isAuthenticated');
        const authWrapper = document.getElementById('authWrapper');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (isAuthenticated === 'true') {
            // Enter the app
            if (authWrapper) authWrapper.style.display = 'none';
            if (sidebar) sidebar.style.display = 'flex';
            if (mainContent) mainContent.style.display = 'block';
            const userNameEl = document.querySelector('.user-name');
            if (userNameEl) userNameEl.textContent = sessionStorage.getItem('userName') || 'User';
            
            // Update user info in sidebar if controller exists
            if (window.sidebarController) {
                window.sidebarController.updateUserDisplay();
            }
            
            // Only set hash if there isn't one already
            if (!window.location.hash || window.location.hash === '#') {
                history.replaceState(null, null, '#dashboard');
            }
        } else {
            // Ensure auth UI is visible
            if (authWrapper) authWrapper.style.display = 'flex';
            if (sidebar) sidebar.style.display = 'none';
            if (mainContent) mainContent.style.display = 'none';
        }
    }

    // Enter the app after successful auth
    function enterApp() {
        const authWrapper = document.getElementById('authWrapper');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        if (authWrapper) authWrapper.style.display = 'none';
        if (sidebar) sidebar.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'block';
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) userNameEl.textContent = sessionStorage.getItem('userName') || 'User';
        
        // Update user display in sidebar
        if (window.sidebarController) {
            window.sidebarController.updateUserDisplay();
            window.sidebarController.showPage('dashboard');
        } else {
            // If sidebar not ready, just set the hash
            history.replaceState(null, null, '#dashboard');
        }
    }

    // Initialize the application
    init();
    
    // Check and apply auth state once after a small delay to ensure DOM is ready
    setTimeout(() => {
        checkAuthState();
    }, 100);
});