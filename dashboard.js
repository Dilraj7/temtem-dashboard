fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    const rows = data.rows;

    // Global stats
    document.getElementById("totalTemtems").textContent = rows.length;
    const totalEncounters = rows.reduce((sum, t) => sum + t.encountered, 0);
    document.getElementById("totalEncounters").textContent = totalEncounters;
    const avgLuma =
      (rows.reduce((sum, t) => sum + (t.lumaChance || 0), 0) / rows.length) *
      100;

    document.getElementById("avgLuma").textContent = avgLuma.toFixed(2) + " %";

    // Chart: rencontres
    new Chart(document.getElementById("encounterChart"), {
      type: "bar",
      data: {
        labels: rows.map((t) => t.name),
        datasets: [
          {
            label: "Rencontres",
            data: rows.map((t) => t.encountered),
            backgroundColor: "#64b5f6",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });

    // Chart: top 5 lumachance
    const top5 = [...rows]
      .filter((t) => t.lumaChance !== undefined)
      .sort((a, b) => b.lumaChance - a.lumaChance)
      .slice(0, 5);

    new Chart(document.getElementById("lumachanceChart"), {
      type: "doughnut",
      data: {
        labels: top5.map((t) => t.name),
        datasets: [
          {
            data: top5.map((t) => t.lumaChance * 100),
            backgroundColor: [
              "#e67e22",
              "#f1c40f",
              "#1abc9c",
              "#9b59b6",
              "#e74c3c",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

function getLumaChancePercent(n, p = 1 / 2000) {
  const probability = 1 - Math.pow(1 - p, n);
  return (probability * 100).toFixed(2);
}

function getEstimatedTimeRemaining(n, targetProb, encounterRate = 1, p = 1 / 2000) {
  const totalRequired = Math.log(1 - targetProb) / Math.log(1 - p);
  const remaining = Math.max(0, totalRequired - n);
  return Math.round(remaining * encounterRate); // minutes
}

function formatTime(minutes) {
  const sec = Math.floor(minutes * 60);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}


    // Cartes Temtem
    const container = document.getElementById("temtemCards");
    rows.forEach((t) => {
      const col = document.createElement("div");
      col.className = "col-sm-6 col-md-4 col-lg-3";
      const formattedName =
        t.name.charAt(0).toUpperCase() + t.name.slice(1).toLowerCase();
      const imgSrc = `https://temtem.wiki.gg/wiki/Special:FilePath/Luma${formattedName}_full_render.png`;

      const p = 1 / 2000; // 0.0005
      const avgInterval = 1; // 1 rencontre = 1 minute
      const encounters = t.encountered;
      const currentChance = getLumaChancePercent(t.encountered);
      const r50 = formatTime(getEstimatedTimeRemaining(encounters, 0.5, avgInterval, p));
const r80 = formatTime(getEstimatedTimeRemaining(encounters, 0.8, avgInterval, p));
const r9999 = formatTime(getEstimatedTimeRemaining(encounters, 0.9999, avgInterval, p));

      col.innerHTML = `
        <div class="glass card h-100 text-center p-3">
          <img src="${imgSrc}" loading="lazy" alt="${
        t.name
      }" class="img-fluid rounded mb-3" onerror="this.style.display='none'" />
          <h5 class="fw-semibold">${t.name}</h5>
          <div class="d-flex flex-wrap justify-content-center mt-2">
            <span class="temtem-badge badge-luma">✨ Chance actuelle: ${currentChance}%</span>
  <span class="temtem-badge badge-encounter">👁 ${(
    t.encounteredPercent * 100
  ).toFixed(2)}%</span>
  <span class="temtem-badge badge-time">⏱ 50%: ${r50}</span>
  <span class="temtem-badge badge-time">⏱ 80%: ${r80}</span>
  <span class="temtem-badge badge-time">⏱ 99.99%: ${r9999}</span>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  });
