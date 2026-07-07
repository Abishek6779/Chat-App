// ==========================
// Socket Connection
// ==========================

const socket = io("http://localhost:5000");

// ==========================
// Authentication
// ==========================

const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user"));
if (currentUser.profilePic) {

    profilePreview.src = currentUser.profilePic;

}

if (!token || !currentUser) {
    window.location.href = "login.html";
}


// Join Socket
socket.on("connect", () => {

    console.log("Socket Connected:", socket.id);

    socket.emit("join", currentUser._id);

});

// ==========================
// DOM Elements
// ==========================

const userList = document.getElementById("userList");
const chatName = document.getElementById("chatName");
const chatStatus = document.getElementById("chatStatus");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const searchUser = document.getElementById("searchUser");
const typingStatus = document.getElementById("typingStatus");
const profilePreview = document.getElementById("profilePreview");
const profileInput = document.getElementById("profileInput");

const fileBtn = document.getElementById("fileBtn");
const fileInput = document.getElementById("fileInput");

const emojiBtn = document.getElementById("emojiBtn");

let selectedUser = null;
let typing = false;
let typingTimeout;
const picker = document.createElement("emoji-picker");
picker.style.position = "absolute";
picker.style.bottom = "90px";
picker.style.right = "20px";
picker.style.display = "none";

document.body.appendChild(picker);

// ==========================
// Load Users
// ==========================

async function loadUsers() {

    try {

        const response = await fetch("http://localhost:5000/api/users", {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const users = await response.json();

        userList.innerHTML = "";

        users.forEach(user => {

            if (user._id === currentUser._id) return;

            const div = document.createElement("div");

            div.className = "user";

            div.innerHTML = `
                <div class="avatar">
                    <i class="bi bi-person-fill"></i>
                </div>

                <div class="user-details">
                    <h4>${user.name}</h4>
                        <p>
                            ${user.online
                    ? "🟢 Online"
                    : user.lastSeen
                        ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                        : "⚪ Offline"
                }
        </p>
                </div>
            `;

            div.onclick = () => {

                selectedUser = user;

                chatName.textContent = user.name;
                chatStatus.textContent = user.online
                    ? "🟢 Online"
                    : user.lastSeen
                        ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                        : "⚪ Offline";

                document.querySelectorAll(".user").forEach(item => {

                    item.classList.remove("active");

                });

                div.classList.add("active");

                loadMessages(user._id);

            };

            userList.appendChild(div);

        });

    }

    catch (err) {

        console.log(err);

    }

}

// ==========================
// Load Messages
// ==========================

async function loadMessages(userId) {

    try {

        const response = await fetch(`http://localhost:5000/api/messages/${userId}`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        messages.innerHTML = "";

        data.forEach(msg => {

            const div = document.createElement("div");

            if (msg.sender === currentUser._id) {

                div.className = "message sent";

            } else {

                div.className = "message received";

            }
div.innerHTML = "";

if (msg.text) {

    div.innerHTML += `<p>${msg.text}</p>`;

}

if (msg.file) {

    if (msg.fileType.startsWith("image")) {

        div.innerHTML += `
            <img
                src="${msg.file}"
                style="width:220px;border-radius:12px;margin-top:8px;"
            >
        `;

    } else {

        div.innerHTML += `
            <a
                href="${msg.file}"
                target="_blank"
            >
                📎 Download File
            </a>
        `;

    }

}

if (msg.sender === currentUser._id) {

    div.innerHTML += `
        <small class="status">
            ${getStatus(msg.status)}
        </small>
    `;

}

messages.appendChild(div);

if (
    msg.receiver === currentUser._id &&
    msg.status !== "read"
) {
    socket.emit("messageRead", msg._id);
}
        });

        messages.scrollTop = messages.scrollHeight;

    }

    catch (err) {

        console.log(err);

    }

}

// ==========================
// Send Message
// ==========================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        sendMessage();

    }

});
messageInput.addEventListener("input", () => {

    if (!selectedUser) return;

    if (!typing) {

        typing = true;

        socket.emit("typing", {

            sender: currentUser._id,
            receiver: selectedUser._id

        });

    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {

        typing = false;

        socket.emit("stopTyping", {

            sender: currentUser._id,
            receiver: selectedUser._id

        });

    }, 1000);

});

function sendMessage() {

    if (!selectedUser) {

        alert("Select a user first");

        return;

    }

    const text = messageInput.value.trim();

    if (text === "") return;

    socket.emit("sendMessage", {

    sender: currentUser._id,
    receiver: selectedUser._id,
    text: text,
    file: "",
    fileType: ""

});


    messageInput.value = "";

}

// ==========================
// Receive Message
// ==========================

socket.on("receiveMessage", (data) => {

    if (!selectedUser) return;

    if (
        data.sender === selectedUser._id ||
        data.sender === currentUser._id
    ) {

        loadMessages(selectedUser._id);

    }

});

// ==========================
// Message Saved
// ==========================

socket.on("messageSaved", () => {

    if (selectedUser) {

        loadMessages(selectedUser._id);

    }

});

// ==========================
// Message Delivered
// ==========================

socket.on("messageDelivered", () => {

    if (selectedUser) {

        loadMessages(selectedUser._id);

    }

});

// ==========================
// Message Read
// ==========================
socket.on("messageRead", () => {

    if (selectedUser) {

        loadMessages(selectedUser._id);

    }

});
// ==========================
// Message Status
// ==========================

function getStatus(status) {

    switch (status) {

        case "sent":
            return "✓";

        case "delivered":
            return "✓✓";

        case "read":
            return `<span style="color:red">✓✓</span>`;

        default:
            return "";

    }

}

// ==========================
// Typing Indicator
// ==========================

socket.on("typing", (data) => {

    if (selectedUser && data.sender === selectedUser._id) {

        typingStatus.textContent = "Typing...";

    }

});

socket.on("stopTyping", (data) => {

    if (selectedUser && data.sender === selectedUser._id) {

        typingStatus.textContent = "";

    }

});

// ==========================
// User Status
// ==========================

socket.on("userStatus", () => {

    loadUsers();

    if (selectedUser) {

        loadMessages(selectedUser._id);

    }

});

// ==========================
// Logout
// ==========================

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

});

// ==========================
// Search Users
// ==========================

searchUser.addEventListener("input", () => {

    const value = searchUser.value.toLowerCase();

    const users = document.querySelectorAll(".user");

    users.forEach(user => {

        const name = user.querySelector("h4").textContent.toLowerCase();

        if (name.includes(value)) {

            user.style.display = "flex";

        } else {

            user.style.display = "none";

        }

    });

});

// ==========================
// Initial Load
// ==========================

loadUsers();
// ==========================
// Emoji Picker
// ==========================

emojiBtn.onclick = () => {

    picker.style.display =
        picker.style.display === "none"
            ? "block"
            : "none";

};

picker.addEventListener("emoji-click", (event) => {

    messageInput.value += event.detail.unicode;

    picker.style.display = "none";

});
// ==========================
// Profile Picture Upload
// ==========================

profilePreview.onclick = () => {

    profileInput.click();

};

profileInput.onchange = async () => {

    const file = profileInput.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);
    formData.append("userId", currentUser._id);

    try {

        const response = await fetch(
            "http://localhost:5000/api/upload/profile",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        profilePreview.src = data.profilePic;

        currentUser.profilePic = data.profilePic;

        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );

        alert("✅ Profile Picture Updated");

    } catch (err) {

        console.log(err);

    }

};
// ==========================
// File Upload
// ==========================

fileBtn.onclick = () => {

    if (!selectedUser) {
        alert("Select a user first");
        return;
    }

    fileInput.click();

};

fileInput.onchange = async () => {

    const file = fileInput.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);
    formData.append("userId", currentUser._id);

    try {

        const response = await fetch(
            "http://localhost:5000/api/upload/profile",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        console.log("Upload Response:", data);

        if (!response.ok || !data.success) {
            alert(data.message || "Upload failed");
            return;
        }

        socket.emit("sendMessage", {

            sender: currentUser._id,
            receiver: selectedUser._id,
            text: "",
            file: data.profilePic,
            fileType: file.type

        });

        fileInput.value = "";

    } catch (err) {

        console.error(err);
        alert("Upload Error");

    }

};