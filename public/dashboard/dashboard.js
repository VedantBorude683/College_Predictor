// ==============================
// DOM Elements
// ==============================
const pageSections = document.querySelectorAll(".page-section");
const startPredictionBtn = document.getElementById("startPrediction");
const userForm = document.getElementById("userForm");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeCard = document.getElementById('welcomeCard');
const predictionResultsContainer = document.getElementById('predictionResultsContainer');
const savedCollegesListContainer = document.getElementById('saved-colleges-list');
const mainContent = document.querySelector('.main');

const navItems = document.querySelectorAll(".nav-list li");
const avatarTxt = document.getElementById('avatarTxt');
const userName = document.getElementById('userName');

// Elements for Compare feature
const compareForm = document.getElementById('compareForm');
const compareCollegesSelect = document.getElementById('compareCollegesSelect');
const compareResultsContainer = document.getElementById('compareResultsContainer');
let compareChoices = null; // To hold the Choices.js instance

let predictionChart = null;

// ==============================
// LOCAL STORAGE (SAVED COLLEGES) LOGIC
// ==============================
function getSavedColleges() {
  return JSON.parse(localStorage.getItem('savedColleges') || '[]');
}

function saveCollegeToStorage(college) {
  const savedColleges = getSavedColleges();
  const isAlreadySaved = savedColleges.some(c => c.name === college.name);
  if (!isAlreadySaved) {
    savedColleges.push(college);
    localStorage.setItem('savedColleges', JSON.stringify(savedColleges));
  }
}

function removeCollegeFromStorage(collegeName) {
  let savedColleges = getSavedColleges();
  savedColleges = savedColleges.filter(c => c.name !== collegeName);
  localStorage.setItem('savedColleges', JSON.stringify(savedColleges));
}

// ==============================
// RENDERING LOGIC
// ==============================
function renderSavedCollegesPage() {
  const savedColleges = getSavedColleges();
  savedCollegesListContainer.innerHTML = '';

  if (savedColleges.length === 0) {
    savedCollegesListContainer.innerHTML = `
      <div class="empty-saved-message">
        <span class="material-icons">bookmark_border</span>
        <h3>No Saved Colleges Yet</h3>
        <p>Click the star icon on any college from your prediction results to save it here.</p>
      </div>
    `;
    return;
  }

  const collegesHTML = savedColleges.map(college => `
    <div class="college-card is-animated" style="opacity: 1; transform: translateY(0);">
      <span class="material-icons save-btn saved" 
            data-college-name="${college.name}" 
            data-college-cutoff="${college.averageCutoff}">
        star
      </span>
      <div class="college-name">${college.name}</div>
      <div class="college-cutoff">Avg. Cutoff: <span>${college.averageCutoff}%</span></div>
    </div>
  `).join('');
  
  savedCollegesListContainer.innerHTML = `<div class="college-list">${collegesHTML}</div>`;
}

function displayPredictions(predictions) {
  predictionResultsContainer.innerHTML = '';
  if (predictionChart) predictionChart.destroy();

  const dreamCount = predictions.dream.length;
  const goodFitCount = predictions.goodFit.length;
  const safeCount = predictions.safe.length;
  const totalCount = dreamCount + goodFitCount + safeCount;

  const resultsHTML = `
    <div class="results-header">
      <div class="summary-stats">
        <h3>Prediction Summary</h3>
        <div class="stat-box">
          <span class="material-icons">summarize</span>
          <div class="stat-box-info"><div id="total-colleges-value" class="value">0</div><div class="label">Total Colleges Found</div></div>
        </div>
        <div class="stat-box">
          <span class="material-icons" style="color: #8b5cf6;">cloud</span>
          <div class="stat-box-info"><div id="dream-colleges-value" class="value">0</div><div class="label">Dream Colleges</div></div>
        </div>
        <div class="stat-box">
          <span class="material-icons" style="color: #22c55e;">thumb_up</span>
          <div class="stat-box-info"><div id="good-fit-colleges-value" class="value">0</div><div class="label">Good Fit Colleges</div></div>
        </div>
        <div class="stat-box">
          <span class="material-icons" style="color: #3b82f6;">verified</span>
          <div class="stat-box-info"><div id="safe-colleges-value" class="value">0</div><div class="label">Safe Colleges</div></div>
        </div>
      </div>
      <div class="chart-container"><canvas id="predictionChartCanvas"></canvas></div>
    </div>
    <div class="results-container"></div>
  `;
  predictionResultsContainer.innerHTML = resultsHTML;

  animateValue(document.getElementById('total-colleges-value'), 0, totalCount, 1500);
  animateValue(document.getElementById('dream-colleges-value'), 0, dreamCount, 1500);
  animateValue(document.getElementById('good-fit-colleges-value'), 0, goodFitCount, 1500);
  animateValue(document.getElementById('safe-colleges-value'), 0, safeCount, 1500);

  const collegeListsContainer = predictionResultsContainer.querySelector('.results-container');
  const tiers = [
    { name: 'Dream Colleges', data: predictions.dream, icon: 'cloud', className: 'dream' },
    { name: 'Good Fit Colleges', data: predictions.goodFit, icon: 'thumb_up', className: 'good-fit' },
    { name: 'Safe Colleges', data: predictions.safe, icon: 'verified', className: 'safe' }
  ];
  const savedColleges = getSavedColleges();

  const tiersHTML = tiers.map(tier => {
    const collegesHTML = tier.data.map(college => {
      const isSaved = savedColleges.some(c => c.name === college.name);
      return `
        <div class="college-card">
          <span class="material-icons save-btn ${isSaved ? 'saved' : ''}" 
                data-college-name="${college.name}" 
                data-college-cutoff="${college.averageCutoff}">
            ${isSaved ? 'star' : 'star_border'}
          </span>
          <div class="college-name">${college.name}</div>
          <div class="college-cutoff">Avg. Cutoff: <span>${college.averageCutoff}%</span></div>
        </div>`;
    }).join('');

    return `
      <div class="tier-container">
        <h3 class="tier-heading ${tier.className}"><span class="material-icons">${tier.icon}</span> ${tier.name} (${tier.data.length})</h3>
        ${tier.data.length > 0 ? `<div class="college-list">${collegesHTML}</div>` : `<div class="no-results">No colleges found in this tier.</div>`}
      </div>`;
  }).join('');
  
  collegeListsContainer.innerHTML = tiersHTML;

  const collegeCards = document.querySelectorAll('.results-wrapper .college-card');
  collegeCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 75}ms`;
    card.classList.add('is-animated');
  });

  createPredictionChart([dreamCount, goodFitCount, safeCount]);
}

// ==============================
// COMPARE COLLEGES LOGIC
// ==============================
function renderComparePage() {
  const savedColleges = getSavedColleges();
  const options = savedColleges.map(college => ({
    value: college.name,
    label: college.name,
    selected: false
  }));

  if (!compareChoices) {
    compareChoices = new Choices(compareCollegesSelect, {
      removeItemButton: true,
      allowHTML: false,
      placeholder: true,
      placeholderValue: 'Select saved colleges or type to add new ones',
      addItemText: (value) => {
        return `Press Enter to add <b>"${value}"</b>`;
      },
    });
  }

  compareChoices.clearStore();
  compareChoices.setChoices(options, 'value', 'label', true);
  compareResultsContainer.innerHTML = `<div class="empty-saved-message" style="background: none; border: 2px dashed var(--card-border);">
    <span class="material-icons">compare_arrows</span>
    <h3>Ready to Compare</h3>
    <p>Your comparison results will appear here.</p>
  </div>`;
}

async function fetchComparisonData(colleges, parameters) {
  // Show loader
  compareResultsContainer.innerHTML = `
    <div class="loader">
      <div class="loader-spinner"></div>
      <p>Contacting our AI Counselor to fetch live data...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ colleges, parameters }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'The server returned an error.');
    }

    const data = await response.json();
    displayComparisonResults(data);

  } catch (error) {
    console.error("Comparison fetch error:", error);
    compareResultsContainer.innerHTML = `<div class="empty-saved-message" style="color: #ef4444; border-color: #ef4444;">
      <span class="material-icons">error_outline</span>
      <h3>Oops! Something went wrong.</h3>
      <p>${error.message}</p>
    </div>`;
  }
}

function displayComparisonResults(data) {
  const { colleges, parameters } = data;
  const collegeNames = Object.keys(colleges);

  if (collegeNames.length === 0) {
    compareResultsContainer.innerHTML = '<p>No data available for the selected colleges.</p>';
    return;
  }
  
  const tableHead = `
    <thead>
      <tr>
        <th>Parameter</th>
        ${collegeNames.map(name => `<th>${name}</th>`).join('')}
      </tr>
    </thead>`;

  const tableBodyRows = parameters.map(param => `
    <tr>
      <td>${param}</td>
      ${collegeNames.map(name => `<td>${colleges[name][param] || 'N/A'}</td>`).join('')}
    </tr>
  `).join('');

  const tableHTML = `
    <table class="compare-results-table">
      ${tableHead}
      <tbody>
        ${tableBodyRows}
      </tbody>
    </table>
  `;

  compareResultsContainer.innerHTML = tableHTML;
}


// ==============================
// CORE LOGIC & HELPERS
// ==============================
function animateValue(element, start, end, duration) { let startTimestamp = null; const step = (timestamp) => { if (!startTimestamp) startTimestamp = timestamp; const progress = Math.min((timestamp - startTimestamp) / duration, 1); element.textContent = Math.floor(progress * (end - start) + start); if (progress < 1) { window.requestAnimationFrame(step); } }; window.requestAnimationFrame(step); }
const centerTextPlugin = { id: 'centerText', beforeDraw: (chart) => { if (chart.config.type !== 'doughnut') return; const { ctx, data } = chart; const total = data.datasets[0].data.reduce((a, b) => a + b, 0); ctx.save(); const x = chart.getDatasetMeta(0).data[0].x; const y = chart.getDatasetMeta(0).data[0].y; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '16px Poppins'; ctx.fillStyle = '#888888'; ctx.fillText('Total', x, y - 12); ctx.font = 'bold 32px Poppins'; ctx.fillStyle = '#333333'; ctx.fillText(total, x, y + 15); ctx.restore(); } };

function createPredictionChart(data) { const ctx = document.getElementById('predictionChartCanvas').getContext('2d'); if(predictionChart) { predictionChart.destroy(); } predictionChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Dream', 'Good Fit', 'Safe'], datasets: [{ label: 'Number of Colleges', data: data, backgroundColor: ['#8b5cf6', '#22c55e', '#3b82f6'], borderColor: '#ffffff', borderWidth: 4, hoverOffset: 12 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 14, family: 'Poppins' } } } }, animation: { duration: 1500, easing: 'easeOutQuart' } }, plugins: [centerTextPlugin] }); }
if (userForm) { userForm.addEventListener("submit", async (e) => { e.preventDefault(); const marks = document.getElementById('marks').value; const category = document.getElementById('category').value; const branchesSelect = document.getElementById('branches'); const selectedBranches = [...branchesSelect.options].filter(option => option.selected).map(option => option.value); try { const response = await fetch('/api/colleges'); const allCollegeData = await response.json(); if (!allCollegeData || allCollegeData.length === 0) { alert('Could not fetch college data. Please check if the backend server is running.'); return; } const userPercentile = marksToPercentile(marks); const predictions = predictColleges(allCollegeData, userPercentile, category, selectedBranches); displayPredictions(predictions); const dashboardNav = document.querySelector('[data-section="dashboard-section"]'); moveNavPill(dashboardNav); showSection("dashboard-section"); welcomeCard.style.display = 'none'; predictionResultsContainer.style.display = 'block'; } catch (error) { console.error('An error occurred during prediction:', error); alert('An error occurred. Could not get predictions.'); } }); }

function marksToPercentile(marks) { const estimatedPercentile = 80 + (marks - 140) * 0.5; if (estimatedPercentile > 99.9) return 99.9; if (estimatedPercentile < 30) return 30; return parseFloat(estimatedPercentile.toFixed(2)); }
function predictColleges(allCollegeData, userPercentile, userCategory, userBranches) { const relevantData = allCollegeData.filter(entry => entry.Category === userCategory); const collegeMap = new Map(); relevantData.forEach(entry => { if (!collegeMap.has(entry.COLLEGES)) { collegeMap.set(entry.COLLEGES, []); } collegeMap.get(entry.COLLEGES).push(entry); }); const averagedColleges = []; for (let [collegeName, entries] of collegeMap) { userBranches.forEach(branchName => { const cutoffs = []; entries.forEach(yearEntry => { if (yearEntry[branchName] && yearEntry[branchName] !== null) { cutoffs.push(yearEntry[branchName]); } }); if (cutoffs.length > 0) { const sum = cutoffs.reduce((acc, curr) => acc + curr, 0); const averageCutoff = parseFloat((sum / cutoffs.length).toFixed(2)); averagedColleges.push({ name: `${collegeName} - ${branchName}`, averageCutoff: averageCutoff }); } }); } const predictions = { dream: [], goodFit: [], safe: [] }; averagedColleges.forEach(college => { const cutoff = college.averageCutoff; if (userPercentile >= cutoff - 2 && userPercentile < cutoff) { predictions.dream.push(college); } else if (userPercentile >= cutoff - 0.5 && userPercentile <= cutoff + 2) { predictions.goodFit.push(college); } else if (userPercentile > cutoff + 2) { predictions.safe.push(college); } }); return predictions; }

// ==============================
// EVENT LISTENERS & INITIALIZATION
// ==============================
function showSection(sectionId) { pageSections.forEach(section => { section.classList.toggle("is-visible", section.id === sectionId); }); }
function moveNavPill(activeItem) { if (!activeItem) return; navItems.forEach(item => item.classList.remove("active")); activeItem.classList.add("active"); }

mainContent.addEventListener('click', (e) => {
  if (e.target.classList.contains('save-btn')) {
    const button = e.target;
    const collegeName = button.dataset.collegeName;
    const collegeCutoff = button.dataset.collegeCutoff;
    const college = { name: collegeName, averageCutoff: collegeCutoff };
    if (button.classList.contains('saved')) {
      removeCollegeFromStorage(collegeName);
      button.classList.remove('saved');
      button.textContent = 'star_border';
      if (button.closest('#saved-colleges-section')) {
        button.closest('.college-card').remove();
        if (getSavedColleges().length === 0) { renderSavedCollegesPage(); }
      }
    } else {
      saveCollegeToStorage(college);
      button.classList.add('saved');
      button.textContent = 'star';
    }
  }
});

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetSectionId = item.getAttribute('data-section');
    if (targetSectionId === 'saved-colleges-section') {
      renderSavedCollegesPage();
    }
    if (targetSectionId === 'compare-section') {
      renderComparePage();
    }
    moveNavPill(item);
    showSection(targetSectionId);
  });
});

if (compareForm) {
  compareForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedColleges = compareChoices.getValue(true);
    const selectedParams = [...document.querySelectorAll('input[name="compareParam"]:checked')].map(cb => cb.value);

    if (selectedColleges.length < 2) {
      alert('Please select at least two colleges to compare.');
      return;
    }
    if (selectedParams.length === 0) {
        alert('Please select at least one parameter to compare.');
        return;
    }
    
    fetchComparisonData(selectedColleges, selectedParams);
  });
}

if (startPredictionBtn) { startPredictionBtn.addEventListener("click", () => { const dashboardNav = document.querySelector('[data-section="dashboard-section"]'); moveNavPill(dashboardNav); showSection("form-section"); }); }
if (logoutBtn) { logoutBtn.addEventListener("click", () => { localStorage.clear(); window.location.href = '/home.html'; }); }
if (welcomeCard) { const tiltFactor = 0.4; welcomeCard.addEventListener('mousemove', (e) => { const rect = welcomeCard.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const centerX = rect.width / 2; const centerY = rect.height / 2; const rotateX = (y - centerY) * tiltFactor / 10; const rotateY = (centerX - x) * tiltFactor / 10; welcomeCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`; }); welcomeCard.addEventListener('mouseleave', () => { welcomeCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }); }

window.addEventListener("DOMContentLoaded", () => {
    const initialActiveItem = document.querySelector(".nav-list li.active");
    moveNavPill(initialActiveItem);
    showSection("dashboard-section");
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const { name } = JSON.parse(savedData);
        if (name) { userName.textContent = name; avatarTxt.textContent = name[0].toUpperCase(); }
    } else { userName.textContent = 'bauna'; avatarTxt.textContent = 'B'; }
    const branchesElement = document.getElementById('branches');
    if (branchesElement) { new Choices(branchesElement, { removeItemButton: true, maxItemCount: 3, placeholder: true, placeholderValue: 'Select up to 3 branches', searchPlaceholderValue: 'Search for a branch', }); }
});

// ==============================
// AI ASSISTANT LOGIC
// ==============================
const chatButton = document.getElementById('ai-chat-button');
const chatWindow = document.getElementById('ai-chat-window');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('ai-typing-indicator');

chatButton.addEventListener('click', () => { chatWindow.classList.toggle('is-visible'); });
closeChatBtn.addEventListener('click', () => { chatWindow.classList.remove('is-visible'); });

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  addMessageToHistory('user', userMessage);
  chatInput.value = '';
  typingIndicator.style.display = 'block';
  handleAIChat(userMessage);
});

function addMessageToHistory(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${sender}`;
  messageElement.textContent = message;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleAIChat(userMessage) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error('The AI is currently unavailable. Please try again later.');
    }

    const data = await response.json();
    const aiResponse = data.reply;
    
    addMessageToHistory('ai', aiResponse);

  } catch (error) {
    console.error("AI Chat Error:", error);
    addMessageToHistory('ai', "Sorry, I'm having trouble connecting. Please check your connection and try again.");
  } finally {
    typingIndicator.style.display = 'none';
  }
}