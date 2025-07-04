fetch("data.json")
  .then((res) => res.json())
  .then((data) => renderDashboard(data));

document.getElementById("jsonUpload").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);
      renderDashboard(jsonData);
    } catch (err) {
      alert("❌ Erreur : le fichier n'est pas un JSON valide.");
    }
  };
  reader.readAsText(file);
});

function renderDashboard(data) {
  const rows = data.rows;

  // Reset
  document.getElementById("temtemCards").innerHTML = "";
  document.getElementById("donutLegend").innerHTML = "";
  document.getElementById("lumachanceChart").remove();

  const canvas = document.createElement("canvas");
  canvas.id = "lumachanceChart";
  canvas.height = 160;
  const oldCanvas = document.getElementById("lumachanceChart");
  if (oldCanvas) {
    oldCanvas.replaceWith(canvas);
  } else {
    document.getElementById("donutCard")?.appendChild(canvas);
  }

  // Stats globales
  /*document.getElementById("totalTemtems").textContent = rows.length;
  //const totalEncounters = rows.reduce((sum, t) => sum + t.encountered, 0);
  document.getElementById("totalEncounters").textContent = totalEncounters;

  const avgLuma =
    (rows.reduce((sum, t) => sum + (t.lumaChance || 0), 0) / rows.length) * 100;
  document.getElementById("avgLuma").textContent = avgLuma.toFixed(2) + " %";*/
  const totalTemtems = rows.length;
  const totalEncounters = rows.reduce((sum, t) => sum + t.encountered, 0);
  const avgLuma =
    (rows.reduce((sum, t) => sum + (t.lumaChance || 0), 0) / rows.length) * 100;

  document.getElementById("totalTemtems").textContent = totalTemtems;
  document.getElementById("totalEncounters").textContent = totalEncounters;
  document.getElementById("avgLuma").textContent = avgLuma.toFixed(2) + " %";

  // Top 5
  const top5 = [...rows]
    .filter((t) => t.lumaChance !== undefined)
    .sort((a, b) => b.lumaChance - a.lumaChance)
    .slice(0, 5);

  const legendContainer = document.getElementById("donutLegend");
  top5.forEach((t) => {
    const img = `img/${t.name.toLowerCase()}.png`;
    const card = document.createElement("div");
    card.className = "d-flex align-items-center gap-2 glass p-2 rounded";
    card.style.minWidth = "160px";
    card.innerHTML = `
      <img src="${img}" alt="${t.name}" width="36" height="36"
        class="rounded" onerror="this.src='img/placeholder.png'" />
      <div>
        <strong>${t.name}</strong><br>
        <small>${(t.lumaChance * 100).toFixed(2)}%</small>
      </div>
    `;
    legendContainer.appendChild(card);
  });

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
      plugins: { legend: { display: false } },
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
    return Math.round(remaining * encounterRate);
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

  document.getElementById("searchInput").addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    const cards = document.querySelectorAll("#temtemCards .card");
    cards.forEach((card) => {
      const name = card.querySelector("h5")?.textContent.toLowerCase();
      const visible = name.includes(searchValue);
      card.parentElement.style.display = visible ? "" : "none";
    });
  });

  const container = document.getElementById("temtemCards");

  rows.forEach((t) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";
    const imgSrc = `img/${t.name.toLowerCase()}.png`;

    const encounters = t.encountered;
    const currentChance = getLumaChancePercent(encounters);
    const r50 = formatTime(getEstimatedTimeRemaining(encounters, 0.5));
    const r80 = formatTime(getEstimatedTimeRemaining(encounters, 0.8));
    const r9999 = formatTime(getEstimatedTimeRemaining(encounters, 0.9999));

    col.innerHTML = `
      <div class="temtem-flip-card h-100">
        <div class="temtem-flip-inner h-100">
          <div class="temtem-flip-front glass card h-100 text-center p-3">
            <img src="${imgSrc}" loading="lazy" alt="${t.name}" 
              class="img-fluid rounded mb-3" onerror="this.src='img/placeholder.png'" />
            <h5 class="fw-semibold">${t.name}</h5>
            <div class="d-flex flex-wrap justify-content-center mt-2">
              <span class="temtem-badge badge-luma">✨ ${currentChance}%</span>
              <span class="temtem-badge badge-encounter">👁 ${(
                t.encounteredPercent * 100
              ).toFixed(2)}%</span>
              <span class="temtem-badge badge-time badge-purple-50">⏱ 50%: ${r50}</span>
              <span class="temtem-badge badge-time badge-purple-80">⏱ 80%: ${r80}</span>
              <span class="temtem-badge badge-time badge-purple-9999">⏱ 99.99%: ${r9999}</span>
            </div>
          </div>
          <div class="temtem-flip-back glass card h-100 text-start p-3" data-name="${
            t.name
          }">
            <div class="loading-info text-muted">⏳ Chargement...</div>
          </div>
        </div>
      </div>
    `;

    const flipCard = col.querySelector(".temtem-flip-card");
    flipCard.addEventListener("click", async function () {
      this.classList.toggle("flipped");
      const back = this.querySelector(".temtem-flip-back");
      const name = back.dataset.name;

      if (!back.dataset.loaded) {
        try {
          const res = await fetch(
            `https://temtem-api.mael.tech/api/temtems?names=${encodeURIComponent(
              name
            )}&weaknesses=true`
          );
          const [tem] = await res.json();
          const types = tem.types
            .map(
              (type) => `<span class="badge bg-secondary me-1">${type}</span>`
            )
            .join("");
          const trivia =
            tem.trivia
              ?.slice(0, 2)
              .map((t) => `• ${t}`)
              .join("<br>") || "Aucune anecdote trouvée.";

          back.innerHTML = `
            <h6 class="fw-bold mb-2">📘 Détails</h6>
            <p><strong>Numéro :</strong> ${tem.number}</p>
            <p><strong>Types :</strong> ${types}</p>
            <p><strong>Catch Rate :</strong> ${tem.catchRate}</p>
            <p><strong>Genre :</strong> ♂ ${tem.genderRatio.male}% / ♀ ${tem.genderRatio.female}%</p>
            <p><strong>Temps d’éclosion :</strong> ${tem.hatchMins} min</p>
            <p><strong>💡 Trivia :</strong><br>${trivia}</p>
            <p class="text-muted mt-2">↩️ Clique pour revenir</p>
          `;
          back.dataset.loaded = "true";
        } catch {
          back.innerHTML = `<p class='text-danger'>❌ Erreur de chargement</p>`;
        }
      }
    });

    container.appendChild(col);
  });
}

// 🔁 Fonction de tri globale
function sortTemtems(field, order) {
  const cardsContainer = document.getElementById("temtemCards");
  const cards = Array.from(cardsContainer.children);

  cards.sort((a, b) => {
    const getValue = (card, type) => {
      if (type === "encountered") {
        const match = card.innerHTML.match(/👁 (\d+(?:\.\d+)?)/);
        return parseFloat(match?.[1]) || 0;
      }
      if (type === "chance") {
        const match = card.innerHTML.match(/✨ (\d+(?:\.\d+)?)%/);
        return parseFloat(match?.[1]) || 0;
      }
      return 0;
    };

    const valA = getValue(a, field);
    const valB = getValue(b, field);
    return order === "asc" ? valA - valB : valB - valA;
  });

  // Réorganise visuellement
  cards.forEach((card) => cardsContainer.appendChild(card));
}
