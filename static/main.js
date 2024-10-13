document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';  // Add the "Results" header

    for (let i = 0; i < data.documents.length; i++) {
        // Create a container for each result (card)
        let resultCard = document.createElement('div');
        resultCard.className = 'result-card';

        // Add the document info
        resultCard.innerHTML = `
            <strong>Document ${data.indices[i]}</strong>
            <p>${data.documents[i]}</p>
            <div class="similarity-score">Similarity: ${data.similarities[i]}</div>
        `;

        // Append the result card to the resultsDiv
        resultsDiv.appendChild(resultCard);
    }
}

function displayChart(data) {
    // Get the canvas element by its ID
    const ctx = document.getElementById('similarity-chart').getContext('2d');

    // Clear any existing chart (to avoid overwriting when performing new searches)
    if (window.similarityChart) {
        window.similarityChart.destroy();
    }

    // Create a new bar chart
    window.similarityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map((index, i) => `Doc ${i + 1}`),  // Labels for documents
            datasets: [{
                label: 'Cosine Similarity',
                data: data.similarities,  // Cosine similarities
                backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Background color for bars
                borderColor: 'rgba(75, 192, 192, 1)',  // Border color for bars
                borderWidth: 1  // Border width for bars
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,  // Ensure the y-axis starts from 0
                    title: {
                        display: true,
                        text: 'Cosine Similarity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Top Documents'
                    }
                }
            }
        }
    });
}
