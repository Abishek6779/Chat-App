const form = document.getElementById("loginForm");
const password = document.getElementById("password");
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

    const email = document.getElementById("email").value.trim();
    const passwordValue = password.value.trim();

    try {

        const response = await fetch("http://localhost:5000/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password: passwordValue
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            return;

        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful");

        window.location.href = "chat.html";

    } catch (error) {

        alert("Server Error");

    }

});