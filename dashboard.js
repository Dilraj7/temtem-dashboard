fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const rows = data.rows;

    // Global stats
    document.getElementById('totalTemtems').textContent = rows.length;
    const totalEncounters = rows.reduce((sum, t) => sum + t.encountered, 0);
    document.getElementById('totalEncounters').textContent = totalEncounters;
    const avgLuma = (
      rows.reduce((sum, t) => sum + (t.lumaChance || 0), 0) / rows.length
    ).toFixed(2);
    document.getElementById('avgLuma').textContent = avgLuma + " %";

    // Chart: rencontres
    new Chart(document.getElementById('encounterChart'), {
      type: 'bar',
      data: {
        labels: rows.map(t => t.name),
        datasets: [{
          label: 'Rencontres',
          data: rows.map(t => t.encountered),
          backgroundColor: '#64b5f6'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // Chart: top 5 lumachance
    const top5 = [...rows]
      .filter(t => t.lumaChance !== undefined)
      .sort((a, b) => b.lumaChance - a.lumaChance)
      .slice(0, 5);

    new Chart(document.getElementById('lumachanceChart'), {
      type: 'doughnut',
      data: {
        labels: top5.map(t => t.name),
        datasets: [{
          data: top5.map(t => t.lumaChance),
          backgroundColor: ['#4dd0e1', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Cartes Temtem
    const container = document.getElementById('temtemCards');
    rows.forEach(t => {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';
      const formattedName = t.name.charAt(0).toUpperCase() + t.name.slice(1).toLowerCase();
      const imgSrc = `https://temtem.wiki.gg/wiki/Special:FilePath/Luma${formattedName}_full_render.png`;



      col.innerHTML = `
        <div class="glass card h-100 text-center p-3">
          <img src="${imgSrc}" loading="lazy" alt="${t.name}" class="img-fluid rounded mb-3" onerror="this.style.display='none'" />
          <h5 class="fw-semibold">${t.name}</h5>
          <p class="mb-1 text-muted">Lumachance: <strong>${(t.lumaChance || 0).toFixed(2)}%</strong></p>
          <p class="mb-1 text-muted">Rencontres: <strong>${(t.encounteredPercent * 100).toFixed(2)}%</strong></p>
          <p class="mb-0 text-muted">Temps moyen: <strong>${Math.round(t.timeToLuma / 60)} min</strong></p>
        </div>
      `;
      container.appendChild(col);
    });
  });
