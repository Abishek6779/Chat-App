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

        const response = await fetch("https://chat-app-lmnt.onrender.com/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password: passwordValue
            })

        });

        let data = {};

        try {
            data = await response.json();
        } catch (e) {
            console.log("Response is not JSON");
        }

        if (!response.ok) {
            console.error(data);
            alert(data.message || "Login Failed");
            return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful");

        window.location.href = "chat.html";

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        alert(error.message);
    }

});