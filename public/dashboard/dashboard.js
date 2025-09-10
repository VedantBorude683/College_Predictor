// Dark/Light Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Line Chart (Percentile Trend)
const lineCtx = document.getElementById("lineChart").getContext("2d");
new Chart(lineCtx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Percentile",
      data: [70, 75, 80, 85, 90, 92],
      borderColor: "#40739e",
      backgroundColor: "rgba(64,115,158,0.2)",
      fill: true,
      tension: 0.4
    }]
  }
});

// Donut Chart (Prediction Categories)
const donutCtx = document.getElementById("donutChart").getContext("2d");
new Chart(donutCtx, {
  type: "doughnut",
  data: {
    labels: ["Safe", "Target", "Dream"],
    datasets: [{
      data: [10, 8, 6],
      backgroundColor: ["#44bd32", "#fbc531", "#e84118"]
    }]
  }
});
