fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    const rows = data.rows;

    // Calculate time to Luma for each Temtem
    function formatTime(minutesTotal) {
      const totalSeconds = Math.floor(minutesTotal * 60);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
    }

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

    // Cartes Temtem
    const container = document.getElementById("temtemCards");
    rows.forEach((t) => {
      const col = document.createElement("div");
      col.className = "col-sm-6 col-md-4 col-lg-3";
      const formattedName =
        t.name.charAt(0).toUpperCase() + t.name.slice(1).toLowerCase();
      const imgSrc = `https://temtem.wiki.gg/wiki/Special:FilePath/Luma${formattedName}_full_render.png`;

      const p = t.lumaChance || 1 / 2000;
      const avgInterval = t.timeToLuma / t.encountered || 1;

      const t50 = formatTime(estimateTime(p, 0.5, avgInterval));
      const t80 = formatTime(estimateTime(p, 0.8, avgInterval));
      const t9999 = formatTime(estimateTime(p, 0.9999, avgInterval));

      col.innerHTML = `
        <div class="glass card h-100 text-center p-3">
          <img src="${imgSrc}" loading="lazy" alt="${
              t.name
            }" class="img-fluid rounded mb-3" onerror="this.style.display='none'" />
          <h5 class="fw-semibold">${t.name}</h5>
          <div class="d-flex flex-wrap justify-content-center mt-2">
            <span class="temtem-badge badge-luma">🌟 ${(p * 100).toFixed(2)}%</span>
            <span class="temtem-badge badge-encounter">👁 ${(
              t.encounteredPercent * 100
            ).toFixed(2)}%</span>
            <span class="temtem-badge badge-time">⏱ 50%: ${t50}</span>
            <span class="temtem-badge badge-time">⏱ 80%: ${t80}</span>
            <span class="temtem-badge badge-time">⏱ 99.99%: ${t9999}</span>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  });
