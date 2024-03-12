document.addEventListener("DOMContentLoaded", function() {
    const loginFormContainer = document.querySelector('.login-form-container');
    const signupFormContainer = document.querySelector('.signup-form-container');
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const signupForm = document.getElementById('signupForm'); // Add this line
    const userInfoContainer = document.getElementById('userInfo'); // Add this line

    // Function to show login form and hide signup form
    function showLoginForm() {
        loginFormContainer.style.display = 'block';
        signupFormContainer.style.display = 'none';
    }

    // Function to show signup form and hide login form
    function showSignupForm() {
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    }

    // Function to display user info (name and avatar)
    function displayUserInfo(user) {
        const userNameElement = document.createElement('h1');
        userNameElement.textContent = `Hi there, ${user.name}`;
        userInfoContainer.appendChild(userNameElement);

        if (user.avatar) {
            const avatarImg = document.createElement('img');
            avatarImg.src = user.avatar;
            avatarImg.alt = 'Avatar';
            userInfoContainer.appendChild(avatarImg);
        }
    }

    // Initial page load logic
    // Check if a hash fragment is present in the URL
    const hashFragment = window.location.hash;
    if (hashFragment === '#signup') {
        showSignupForm(); // Display signup form if URL contains #signup
    } else {
        showLoginForm(); // Otherwise, display login form by default
    }

    // Event listener for login toggle button
    loginToggle.addEventListener('click', function() {
        showLoginForm();
    });

    // Event listener for signup toggle button
    signupToggle.addEventListener('click', function() {
        showSignupForm();
    });

    // Login form submission handler
    function handleLoginFormSubmit(event) {
        event.preventDefault();
        const loginUsername = document.getElementById('loginUsername').value;
        const loginPassword = document.getElementById('loginPassword').value;

        const formData = new FormData();
        formData.append('username', loginUsername);
        formData.append('password', loginPassword);

        fetch('http://127.0.0.1:5000/user/login', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
    if (data.payload && data.payload.length > 0) {
        const user = data.payload[0];
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(user));
        // Redirect to welcome page
        window.location.href = 'welcome.html';
    }
        })
        .catch(error => {
            console.error(error.message);
            alert('Login failed');
        });
    }

    // Signup form submission handler
    function handleSignupFormSubmit(event) {
        event.preventDefault();
        const signupName = document.getElementById('signupName').value;
        const signupUsername = document.getElementById('signupUsername').value;
        const signupPassword = document.getElementById('signupPassword').value;
        const avatarFile = document.getElementById('avatar').files[0];

        const formData = new FormData();
        formData.append('name', signupName);
        formData.append('username', signupUsername);
        formData.append('password', signupPassword);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        fetch('http://127.0.0.1:5000/user/signup', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Signup failed');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error(error.message);
            alert('Signup failed');
        });
    }

    loginFormContainer.addEventListener('submit', handleLoginFormSubmit);
    signupForm.addEventListener('submit', handleSignupFormSubmit); 
});
