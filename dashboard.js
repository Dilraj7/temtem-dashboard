fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const labels = data.rows.map(item => item.name);
    const values = data.rows.map(item => item.encountered);

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de rencontres',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
      }
    });
  });

  fetch('data.json')
  .then(res => res.json())
  .then(data => {
    // Chart.js ici...

    // Remplissage de la table
    const tbody = document.querySelector('#temtemTable tbody');
    data.rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.name}</td><td>${row.encountered}</td><td>${row.rarity}</td>`;
      tbody.appendChild(tr);
    });

    // Initialisation DataTable
    $('#temtemTable').DataTable();
  });

  fetch('data.json')
  .then(res => res.json())
  .then(data => {
    // EXEMPLE : data.rows = [{ name, encountered, rarity, lumachance }, ...]

    // Top 5 Temtems avec la plus haute lumachance
    const top5 = [...data.rows]
      .filter(t => t.lumachance) // au cas où
      .sort((a, b) => b.lumachance - a.lumachance)
      .slice(0, 5);

    const names = top5.map(t => t.name);
    const luck = top5.map(t => t.lumachance);

    const ctx = document.getElementById('lumachanceChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: names,
        datasets: [{
          label: 'Lumachance (%)',
          data: luck,
          backgroundColor: ['#64b5f6','#4dd0e1','#81c784','#ffd54f','#ff8a65']
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
