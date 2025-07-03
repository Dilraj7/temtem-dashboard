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
