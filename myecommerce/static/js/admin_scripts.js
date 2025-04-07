document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("editProfileBtn").addEventListener("click", function() {
        alert("Edit profile feature coming soon!");
    });

    document.getElementById("logoutBtn").addEventListener("click", function() {
        if (confirm("Are you sure you want to logout?")) {
            window.location.href = "/logout/";
        }
    });
});
function openEditModal() {
    document.getElementById("editProfileModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editProfileModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", function () {
        const button = form.querySelector("button");
        button.textContent = "Logging in...";
        button.disabled = true;
    });
});
