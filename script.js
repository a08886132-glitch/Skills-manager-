const skillForm = document.getElementById("skillForm");
const skillInput = document.getElementById("skillInput");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const cancelEdit = document.getElementById("cancelEdit");
const searchInput = document.getElementById("searchInput");
const skillsList = document.getElementById("skillsList");
const skillCount = document.getElementById("skillCount");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");

let skills = [];

try {
    const savedSkills = JSON.parse(
        localStorage.getItem("skills-manager-data")
    );

    if (Array.isArray(savedSkills)) {
        skills = savedSkills.filter(
            skill =>
                skill &&
                typeof skill.id === "string" &&
                typeof skill.name === "string"
        );
    }
} catch {
    skills = [];
}

let editingId = null;

function saveSkills() {
    try {
        localStorage.setItem(
            "skills-manager-data",
            JSON.stringify(skills)
        );
    } catch {
        formMessage.textContent =
            "Could not save data in this browser.";
    }
}

function renderSkills() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(query)
    );

    skillsList.replaceChildren();

    filteredSkills.forEach(skill => {
        const tag = document.createElement("article");
        tag.className = "skill-tag";
        tag.dataset.id = skill.id;

        const name = document.createElement("span");
        name.className = "skill-name";
        name.textContent = skill.name;

        const actions = document.createElement("div");
        actions.className = "tag-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.dataset.action = "edit";
        editBtn.textContent = "✎";
        editBtn.setAttribute("aria-label", `Edit ${skill.name}`);
        editBtn.title = "Edit skill";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.dataset.action = "delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "×";
        deleteBtn.setAttribute("aria-label", `Delete ${skill.name}`);
        deleteBtn.title = "Delete skill";

        actions.append(editBtn, deleteBtn);
        tag.append(name, actions);
        skillsList.append(tag);
    });

    skillCount.textContent =
        `${skills.length} ${skills.length === 1 ? "skill" : "skills"}`;

    emptyState.classList.toggle("hidden", skills.length > 0);

    noResults.classList.toggle(
        "hidden",
        skills.length === 0 || filteredSkills.length > 0
    );
}

skillForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = skillInput.value.trim();

    if (!name) {
        formMessage.textContent = "Please enter a skill name.";
        return;
    }

    const duplicate = skills.some(skill =>
        skill.name.toLowerCase() === name.toLowerCase() &&
        skill.id !== editingId
    );

    if (duplicate) {
        formMessage.textContent = "This skill already exists.";
        return;
    }

    if (editingId !== null) {
        const skill = skills.find(item => item.id === editingId);

        if (skill) {
            skill.name = name;
        }
    } else {
        skills.push({
            id: crypto.randomUUID(),
            name: name
        });
    }

    saveSkills();
    resetForm();
    renderSkills();
});

skillsList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button || !skillsList.contains(button)) {
        return;
    }

    const tag = button.closest(".skill-tag");

    if (!tag) {
        return;
    }

    const id = tag.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        const skill = skills.find(item => item.id === id);

        if (!skill) return;

        editingId = id;
        skillInput.value = skill.name;
        formTitle.textContent = "Edit skill";
        submitBtn.textContent = "Save Changes";
        cancelEdit.classList.remove("hidden");
        formMessage.textContent = "";
        skillInput.focus();
    }

    if (action === "delete") {
        skills = skills.filter(item => item.id !== id);

        if (editingId === id) {
            resetForm();
        }

        saveSkills();
        renderSkills();
    }
});

searchInput.addEventListener("input", renderSkills);

cancelEdit.addEventListener("click", resetForm);

function resetForm() {
    editingId = null;
    skillForm.reset();
    formTitle.textContent = "Add a new skill";
    submitBtn.textContent = "+ Add Skill";
    cancelEdit.classList.add("hidden");
    formMessage.textContent = "";
}

renderSkills();