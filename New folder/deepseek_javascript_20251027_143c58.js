// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'Rage9568',
    templateId: 'template_7a1mw2e',
    publicKey: 'UdO6Lm6hT4CL1aEHM'
};

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
})();

// Owner email
const OWNER_EMAIL = "Ragevorcielo@gmail.com";

// OTP Management
let otpTimer = null;
let otpCode = null;
let currentEmail = "";

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via EmailJS
async function sendOTP(email) {
    return new Promise(async (resolve, reject) => {
        try {
            otpCode = generateOTP();
            console.log('Generated OTP:', otpCode);
            
            const templateParams = {
                to_email: email,
                from_name: 'Advocate Tasrin Zaman Rity',
                otp_code: otpCode,
                website_name: 'Advocate Tasrin Zaman Rity Website',
                expiry_time: '10 minutes',
                timestamp: new Date().toLocaleString()
            };

            console.log('Sending email with params:', templateParams);

            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                templateParams
            );

            console.log('Email sent successfully:', response);
            resolve(true);
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            reject(new Error('Failed to send OTP. Please try again.'));
        }
    });
}

// Verify OTP
function verifyOTP(inputOtp) {
    return inputOtp === otpCode;
}

// Start OTP timer
function startOTPTimer() {
    let timeLeft = 60;
    const timerElement = document.getElementById('countdown');
    const resendButton = document.getElementById('resendOtp');
    
    if (otpTimer) clearInterval(otpTimer);
    
    otpTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            resendButton.disabled = false;
            document.getElementById('otpTimer').style.display = 'none';
        }
    }, 1000);
}

// Reset OTP timer
function resetOTPTimer() {
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    document.getElementById('otpTimer').style.display = 'block';
    document.getElementById('resendOtp').disabled = true;
    startOTPTimer();
}

// Switch between login steps
function showStep(stepNumber) {
    document.querySelectorAll('.login-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

// Setup OTP input handling
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            input.value = value;
            
            if (value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            updateHiddenOTP();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && index > 0 && !input.value) {
                otpInputs[index - 1].focus();
            }
            
            if (!/[\dBackspaceArrowLeftArrowRightDelete]/.test(e.key)) {
                e.preventDefault();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
            if (pasteData.length === 6) {
                const digits = pasteData.split('');
                otpInputs.forEach((input, idx) => {
                    if (idx < 6) {
                        input.value = digits[idx] || '';
                    }
                });
                updateHiddenOTP();
            }
        });
    });
}

// Update hidden OTP field
function updateHiddenOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otpValue = '';
    
    otpInputs.forEach(input => {
        otpValue += input.value;
    });
    
    document.getElementById('otpCode').value = otpValue;
}

// Clear OTP inputs
function clearOTPInputs() {
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
    });
    document.getElementById('otpCode').value = '';
    if (document.querySelector('.otp-input')) {
        document.querySelector('.otp-input').focus();
    }
}

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Login function
async function loginWithOTP(email, otp) {
    try {
        if (email !== OWNER_EMAIL) {
            throw new Error('Only owner email is authorized');
        }
        
        if (otp.length !== 6) {
            throw new Error('Please enter 6-digit OTP');
        }
        
        if (!verifyOTP(otp)) {
            throw new Error('Invalid OTP. Please check and try again.');
        }
        
        sessionStorage.setItem('adminLoggedIn', 'true');
        updateUI();
        hideLoginModal();
        showNotification('Login successful! Welcome to Admin Panel.');
        return true;
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed: ' + error.message, 'error');
        return false;
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    otpCode = null;
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    updateUI();
    showNotification('Logged out successfully!');
}

// Update UI based on login status
function updateUI() {
    const isAdmin = isLoggedIn();
    
    if (isAdmin) {
        document.body.classList.add('logged-in');
        document.getElementById('auth-status').innerHTML = `
            <span style="color: var(--accent-light);">Admin</span>
            <button class="logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else {
        document.body.classList.remove('logged-in');
        document.getElementById('auth-status').innerHTML = `
            <button class="logout-btn" onclick="showLoginModal()" style="background-color: var(--accent); color: white; border: none;">
                <i class="fas fa-sign-in-alt"></i> Admin Login
            </button>
        `;
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    showStep(1);
    clearOTPInputs();
    document.getElementById('email').value = OWNER_EMAIL;
}

// Hide login modal
function hideLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('emailForm').reset();
    clearOTPInputs();
    showStep(1);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--accent)' : '#d9534f'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupOTPInputs();
    
    document.getElementById('emailForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email').value.trim();
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        
        if (emailInput !== OWNER_EMAIL) {
            showNotification('Error: Only owner email is authorized for admin access.', 'error');
            return;
        }
        
        sendOtpBtn.innerHTML = '<div class="loading"></div> Sending OTP...';
        sendOtpBtn.disabled = true;
        
        try {
            await sendOTP(emailInput);
            currentEmail = emailInput;
            document.getElementById('targetEmail').textContent = emailInput;
            showStep(2);
            resetOTPTimer();
            clearOTPInputs();
            showNotification('OTP sent successfully! Check your email.');
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        } finally {
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
            sendOtpBtn.disabled = false;
        }
    });
    
    document.getElementById('otpForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const otp = document.getElementById('otpCode').value;
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        verifyOtpBtn.innerHTML = '<div class="loading"></div> Verifying...';
        verifyOtpBtn.disabled = true;
        
        await loginWithOTP(currentEmail, otp);
        
        verifyOtpBtn.innerHTML = '<i class="fas fa-check"></i> Verify OTP';
        verifyOtpBtn.disabled = false;
    });
    
    document.getElementById('resendOtp').addEventListener('click', async function() {
        const resendBtn = document.getElementById('resendOtp');
        resendBtn.disabled = true;
        resendBtn.innerHTML = '<div class="loading"></div> Sending...';
        
        try {
            await sendOTP(currentEmail);
            resetOTPTimer();
            clearOTPInputs();
            showNotification('OTP resent successfully!');
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        } finally {
            resendBtn.innerHTML = 'Resend OTP';
            resendBtn.disabled = true;
            document.getElementById('otpTimer').style.display = 'block';
            startOTPTimer();
        }
    });
    
    document.getElementById('backToEmail').addEventListener('click', function() {
        showStep(1);
        if (otpTimer) {
            clearInterval(otpTimer);
            otpTimer = null;
        }
    });
    
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideLoginModal();
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('postSection').value = this.dataset.tab;
        });
    });
    
    document.getElementById('postForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const image = document.getElementById('postImage').value;
        const section = document.getElementById('postSection').value;
        const submitButton = this.querySelector('button[type="submit"]');
        
        if (submitButton.dataset.mode === 'edit') {
            showNotification('Post updated successfully!');
        } else {
            showNotification('Post published successfully!');
        }
        
        this.reset();
    });
    
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    updateUI();
});