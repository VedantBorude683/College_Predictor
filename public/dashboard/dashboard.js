// ==============================
// DOM Elements
// ==============================
const pageSections = document.querySelectorAll(".page-section");
const startPredictionBtn = document.getElementById("startPrediction");
const userForm = document.getElementById("userForm");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeCard = document.getElementById('welcomeCard');

// Sidebar Navigation
const navItems = document.querySelectorAll(".nav-list li");
const navActivePill = document.getElementById("nav-active-pill");

// User Info
const avatarTxt = document.getElementById('avatarTxt');
const userName = document.getElementById('userName');

// ==============================
// Section Switching Logic
// ==============================
function showSection(sectionId) {
  pageSections.forEach(section => {
    section.classList.toggle("is-visible", section.id === sectionId);
  });
}

// ==============================
// Sidebar Navigation Logic
// ==============================
function moveNavPill(activeItem) {
  if (!activeItem) return;
  navActivePill.style.top = `${activeItem.offsetTop}px`;
  navActivePill.style.height = `${activeItem.offsetHeight}px`;
  
  navItems.forEach(item => item.classList.remove("active"));
  activeItem.classList.add("active");
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetSectionId = item.getAttribute('data-section');
    moveNavPill(item);
    showSection(targetSectionId);
  });
});

if (startPredictionBtn) {
  startPredictionBtn.addEventListener("click", () => {
    const dashboardNav = document.querySelector('[data-section="dashboard-section"]');
    moveNavPill(dashboardNav);
    showSection("form-section");
  });
}

// ==============================
// Initial Load Actions
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  // Set initial navigation pill
  const initialActiveItem = document.querySelector(".nav-list li.active");
  moveNavPill(initialActiveItem);

  // Show default section
  showSection("dashboard-section");

  // Load user data
  const savedData = localStorage.getItem('userData');
  if (savedData) {
    const { name } = JSON.parse(savedData);
    if (name) {
      userName.textContent = name;
      avatarTxt.textContent = name[0].toUpperCase();
    }
  } else {
    userName.textContent = 'bauna';
    avatarTxt.textContent = 'B';
  }

  // INITIALIZE CHOICES.JS FOR THE BRANCHES DROPDOWN
  const branchesElement = document.getElementById('branches');
  if (branchesElement) {
    const choices = new Choices(branchesElement, {
      removeItemButton: true, // Shows a 'x' to remove selected items
      maxItemCount: 3,        // Limits selection to 3
      placeholder: true,
      placeholderValue: 'Select up to 3 branches',
      searchPlaceholderValue: 'Search for a branch',
    });
  }
});

// ==============================
// Form Submission
// ==============================
if (userForm) {
  userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const marks = document.getElementById('marks').value;
    const category = document.getElementById('category').value;
    const branchesSelect = document.getElementById('branches');
    const selectedBranches = [...branchesSelect.options]
                                .filter(option => option.selected)
                                .map(option => option.value);
    const formData = {
      marks: marks,
      category: category,
      branches: selectedBranches
    };
    console.log("Form Data Submitted:", formData);
    const analyticsNav = document.querySelector('[data-section="analytics-section"]');
    moveNavPill(analyticsNav);
    showSection("analytics-section");
  });
}

// ==============================
// Logout & 3D Tilt (No changes here)
// ==============================
if (logoutBtn) { logoutBtn.addEventListener("click", () => { localStorage.clear(); window.location.href = window.location.href; }); }
if (welcomeCard) { const tiltFactor = 0.4; welcomeCard.addEventListener('mousemove', (e) => { const rect = welcomeCard.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const centerX = rect.width / 2; const centerY = rect.height / 2; const rotateX = (y - centerY) * tiltFactor / 10; const rotateY = (centerX - x) * tiltFactor / 10; welcomeCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`; }); welcomeCard.addEventListener('mouseleave', () => { welcomeCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }); }