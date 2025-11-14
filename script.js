let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let username = localStorage.getItem("username") || "User";
let isDark = localStorage.getItem("theme") === "dark";

// Elements
const greeting = document.getElementById("greeting");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filters = document.querySelectorAll(".filter");

// Show user name
greeting.innerHTML = `🌼 Hello, ${username}!`;


// Theme
if (isDark) document.body.classList.add("dark");

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

// Change Name
document.getElementById("changeName").onclick = () => {
    let newName = prompt("Enter your name:");
    if (newName.trim() !== "") {
        username = newName;
        localStorage.setItem("username", username);
        greeting.innerText = `Hello, ${username}!`;
    }
};

// Add Task
document.getElementById("addBtn").onclick = addTask;

function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let priority = document.getElementById("priority").value;

    if (!text) return alert("Enter a task!");

    tasks.push({
        id: Date.now(),
        text,
        priority,
        completed: false,
        date: new Date().toLocaleString()
    });

    saveTasks();
    renderTasks();

    document.getElementById("taskInput").value = "";
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = "";

    let search = searchInput.value.toLowerCase();
    let activeFilter = document.querySelector(".filter.active").dataset.filter;

    tasks
        .filter(t => t.text.toLowerCase().includes(search))
        .filter(t => activeFilter === "all" ? true : activeFilter === "completed" ? t.completed : !t.completed)
        .forEach(task => {

        let li = document.createElement("li");
        li.className = `task priority-${task.priority} ${task.completed ? "completed" : ""}`;
        li.draggable = true;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div>
                <strong>
    ${task.priority === "high" ? "🔺" : task.priority === "medium" ? "🟠" : "🟢"} 
    ${task.text}
</strong>
<br>
                <small>${task.date}</small>
            </div>
            <div class="task-buttons">
                <button class="complete-btn" onclick="toggleComplete(${task.id})">✔️</button>
                <button class="edit-btn" onclick="editTask(${task.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>

            </div>
        `;

        addDragEvents(li);
        taskList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    document.getElementById("totalCount").innerText = tasks.length;
    document.getElementById("completedCount").innerText = tasks.filter(t => t.completed).length;
    document.getElementById("pendingCount").innerText = tasks.filter(t => !t.completed).length;
}

// Complete
function toggleComplete(id) {
    let task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

// Edit
function editTask(id) {
    let task = tasks.find(t => t.id === id);
    let newText = prompt("Edit task:", task.text);
    if (newText.trim() !== "") {
        task.text = newText;
        saveTasks();
        renderTasks();
    }
}

// Delete
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Clear all
document.getElementById("clearAll").onclick = () => {
    if (confirm("Delete all tasks?")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
};

// Search
searchInput.oninput = renderTasks;

// Filters
filters.forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".filter.active").classList.remove("active");
        btn.classList.add("active");
        renderTasks();
    };
});

// Drag & Drop
let dragged;

function addDragEvents(item) {
    item.addEventListener("dragstart", () => {
        dragged = item;
        item.style.opacity = ".5";
    });

    item.addEventListener("dragend", () => {
        dragged.style.opacity = "1";
    });

    item.addEventListener("dragover", (e) => {
        e.preventDefault();
        let current = e.target.closest(".task");
        if (current && current !== dragged) {
            let list = Array.from(taskList.children);
            let draggedIndex = list.indexOf(dragged);
            let currentIndex = list.indexOf(current);
            if (draggedIndex > currentIndex) {
                taskList.insertBefore(dragged, current);
            } else {
                taskList.insertBefore(dragged, current.nextSibling);
            }
        }
    });
}

// Save to LocalStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

renderTasks();
