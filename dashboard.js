fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const rows = data.rows;

    // --- Statistiques globales ---
    document.getElementById('totalTemtems').textContent = rows.length;
    const totalEncounters = rows.reduce((sum, t) => sum + t.encountered, 0);
    document.getElementById('totalEncounters').textContent = totalEncounters;

    const avgLuma = (
      rows.reduce((sum, t) => sum + (t.lumaChance || 0), 0) / rows.length
    ).toFixed(1);
    document.getElementById('avgLuma').textContent = avgLuma + " %";

    // --- Graphique des rencontres ---
    const names = rows.map(t => t.name);
    const encounters = rows.map(t => t.encountered);

    new Chart(document.getElementById('encounterChart'), {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Rencontres',
          data: encounters,
          backgroundColor: '#64b5f6'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // --- Graphique Lumachance top 5 ---
    const top5 = [...rows]
      .filter(t => t.lumaChance !== undefined)
    .sort((a, b) => b.lumaChance - a.lumaChance)
    .map(t => t.lumaChance)

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
  });
