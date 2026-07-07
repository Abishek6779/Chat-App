const form = document.getElementById("registerForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("bi-eye-slash");
        togglePassword.classList.add("bi-eye");
    } else {
        password.type = "password";
        togglePassword.classList.remove("bi-eye");
        togglePassword.classList.add("bi-eye-slash");
    }

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    const pass = password.value.trim();
    const confirm = confirmPassword.value.trim();

    if (pass !== confirm) {
        alert("Passwords do not match");
        return;
    }

    try {

        const response = await fetch("http://localhost:5000/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password: pass
            })

        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            window.location.href = "login.html";

        }

    } catch (error) {

        alert("Server Error");

    }

});