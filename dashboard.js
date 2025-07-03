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

    // Chart: top 5 lumachance
    const top5 = [...rows]
      .filter((t) => t.lumaChance !== undefined)
      .sort((a, b) => b.lumaChance - a.lumaChance)
      .slice(0, 5);

    // Build donut legend cards before creating the chart
    const legendContainer = document.getElementById("donutLegend");
    legendContainer.innerHTML = ""; // Vide au cas d'un refresh dynamique

    top5.forEach((t, i) => {
      const name = t.name;
      const img = `img/${name.toLowerCase()}.png`; // tu utilises le dossier local

      const card = document.createElement("div");
      card.className = "d-flex align-items-center gap-2 glass p-2 rounded";
      card.style.minWidth = '160px';

      card.innerHTML = `
        <img src="${img}" alt="${name}" width="36" height="36"
            class="rounded" onerror="this.src='img/placeholder.png'" />
        <div>
          <strong>${name}</strong><br>
          <small>${(t.lumaChance * 100).toFixed(2)}%</small>
        </div>
      `;

      legendContainer.appendChild(card);
    });

    new Chart(document.getElementById("lumachanceChart"), {
      type: "doughnut",
      data: {
        labels: top5.map((t) => {
          const name = t.name;
          const formattedName =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          const imgURL = `https://temtem.wiki.gg/wiki/Special:FilePath/Luma${formattedName}_full_render.png`;
          return `${name}  |  ${imgURL}`; // on encode les 2 infos ici
        }),
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
          legend: { display: false },
        },
      },
    });

    function getLumaChancePercent(n, p = 1 / 2000) {
      const probability = 1 - Math.pow(1 - p, n);
      return (probability * 100).toFixed(2);
    }

    function getEstimatedTimeRemaining(
      n,
      targetProb,
      encounterRate = 1,
      p = 1 / 2000
    ) {
      const totalRequired = Math.log(1 - targetProb) / Math.log(1 - p);
      const remaining = Math.max(0, totalRequired - n);
      return Math.round(remaining * encounterRate); // minutes
    }

    function formatTime(minutes) {
      const sec = Math.floor(minutes * 60);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(
        2,
        "0"
      )}s`;
    }

    // Cartes Temtem
    const container = document.getElementById("temtemCards");
    rows.forEach((t) => {
      const col = document.createElement("div");
      col.className = "col-sm-6 col-md-4 col-lg-3";
      const formattedName =
        t.name.charAt(0).toUpperCase() + t.name.slice(1).toLowerCase();
      const imgSrc = `img/${t.name.toLowerCase()}.png`;

      const p = 1 / 2000; // 0.0005
      const avgInterval = 1; // 1 rencontre = 1 minute
      const encounters = t.encountered;
      const currentChance = getLumaChancePercent(t.encountered);
      const r50 = formatTime(
        getEstimatedTimeRemaining(encounters, 0.5, avgInterval, p)
      );
      const r80 = formatTime(
        getEstimatedTimeRemaining(encounters, 0.8, avgInterval, p)
      );
      const r9999 = formatTime(
        getEstimatedTimeRemaining(encounters, 0.9999, avgInterval, p)
      );

      col.innerHTML = `
        <div class="glass card h-100 text-center p-3">
          <img src="${imgSrc}" loading="lazy" alt="${t.name}" 
     class="img-fluid rounded mb-3"
     onerror="this.src='img/placeholder.png'" />
          <h5 class="fw-semibold">${t.name}</h5>
          <div class="d-flex flex-wrap justify-content-center mt-2">
            <span class="temtem-badge badge-luma">✨ ${currentChance}%</span>
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
