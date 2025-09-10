const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const messageBox = document.getElementById('messageBox');
const body = document.body;

// Modal elements
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModalBtn = forgotPasswordModal.querySelector('.close-button');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const otpSection = document.getElementById('otpSection');
const resetSection = document.getElementById('resetSection');
const modalMessage = document.getElementById('modalMessage');

// Show temporary message
function showMessage(message) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => messageBox.style.opacity = '1', 10);
    setTimeout(() => {
        messageBox.style.opacity = '0';
        setTimeout(() => messageBox.style.display = 'none', 500);
    }, 3000);
}

// Panel flip
signUpButton.addEventListener('click', () => container.classList.add("right-panel-active"));
signInButton.addEventListener('click', () => container.classList.remove("right-panel-active"));

// Dark mode check
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'enabled') body.classList.add('dark-mode');
});

// Signup/Login form handling
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formType = form.querySelector('h1').textContent;
        const name = form.querySelector('input[type="text"]')?.value || "";
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            let response;
            if (formType === 'Sign In') {
                response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
            } else if (formType === 'Create Account') {
                response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
            }

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Success!');
                setTimeout(() => window.location.href = '../dashboard/dashboard.html', 1000);
            } else showMessage(data.error || 'Invalid credentials!');

        } catch (err) {
            console.error(err);
            showMessage('Something went wrong!');
        }
    });
});

// Forgot Password Modal
forgotPasswordLink.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'block';
    otpSection.style.display = 'block';
    resetSection.style.display = 'none';
    modalMessage.textContent = '';
});

closeModalBtn.addEventListener('click', () => forgotPasswordModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === forgotPasswordModal) forgotPasswordModal.style.display = 'none'; });

// Send OTP
sendOtpBtn.addEventListener('click', async () => {
    const email = document.getElementById('forgotEmail').value;
    if (!email) return modalMessage.textContent = 'Please enter your email';
    try {
        const res = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
            otpSection.style.display = 'none';
            resetSection.style.display = 'block';
            modalMessage.style.color = 'green';
            modalMessage.textContent = data.message || 'OTP sent!';
        } else modalMessage.textContent = data.error || 'Error sending OTP';
    } catch (err) {
        console.error(err);
        modalMessage.textContent = 'Something went wrong';
    }
});

// Reset Password
resetPasswordBtn.addEventListener('click', async () => {
    const email = document.getElementById('forgotEmail').value;
    const otp = document.getElementById('enteredOtp').value;
    const newPassword = document.getElementById('newPassword').value;

    if (!otp || !newPassword) return modalMessage.textContent = 'Enter OTP and new password';
    try {
        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
            modalMessage.style.color = 'green';
            modalMessage.textContent = 'Password reset successful!';
            setTimeout(() => forgotPasswordModal.style.display = 'none', 1500);
        } else modalMessage.textContent = data.error || 'Error resetting password';
    } catch (err) {
        console.error(err);
        modalMessage.textContent = 'Something went wrong';
    }
});
