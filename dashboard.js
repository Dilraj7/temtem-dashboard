fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const rows = data.rows;

    // -----------------------
    // Chart 1 – Rencontres
    // -----------------------
    const names = rows.map(t => t.name);
    const encounters = rows.map(t => t.encountered);

    new Chart(document.getElementById('encounterChart'), {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Nombre de rencontres',
          data: encounters,
          backgroundColor: '#64b5f6'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });

    // -----------------------
    // Chart 2 – Top 5 Lumachance
    // -----------------------
    const top5 = [...rows]
      .filter(t => t.lumachance !== undefined)
      .sort((a, b) => b.lumachance - a.lumachance)
      .slice(0, 5);

    const topNames = top5.map(t => t.name);
    const topLuck = top5.map(t => t.lumachance);

    new Chart(document.getElementById('lumachanceChart'), {
      type: 'doughnut',
      data: {
        labels: topNames,
        datasets: [{
          label: 'Lumachance (%)',
          data: topLuck,
          backgroundColor: ['#4dd0e1', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  });
