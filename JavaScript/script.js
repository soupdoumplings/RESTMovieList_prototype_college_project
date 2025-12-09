const API_URL = 'http://localhost:3000/movies';
const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');
let allMovies = [];

function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';
    if (moviesToDisplay.length === 0) {
        movieListDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-family: var(--font-serif); font-size: 1.5rem;">NO ITEMS FOUND IN COLLECTION</p>';
        return;
    }
    moviesToDisplay.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');

        const safeTitle = movie.title.replace(/'/g, "\\'");
        const safeGenre = movie.genre.replace(/'/g, "\\'");

        movieElement.innerHTML = `
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span>${movie.year}</span> / <span>${movie.genre}</span>
                </div>
            </div>
            <div class="movie-actions">
                <button class="btn-edit" onclick="editMoviePrompt('${movie.id}', '${safeTitle}', ${movie.year}, '${safeGenre}')">EDIT</button>
                <button class="btn-delete" onclick="deleteMovie('${movie.id}')">REMOVE</button>
            </div>
        `;
        movieListDiv.appendChild(movieElement);
    });
}

function fetchMovies() {
    fetch(API_URL)
        .then(response => response.json())
        .then(movies => {
            allMovies = movies;
            renderMovies(allMovies);
        })
        .catch(error => console.error('Error fetching movies:', error));
}

// SEARCH
searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredMovies = allMovies.filter(movie => {
        const titleMatch = movie.title.toLowerCase().includes(searchTerm);
        const genreMatch = movie.genre.toLowerCase().includes(searchTerm);
        return titleMatch || genreMatch;
    });
    renderMovies(filteredMovies);
});

// CREATE
form.addEventListener('submit', function (event) {
    event.preventDefault();
    const newMovie = {
        id: Date.now().toString(),
        title: document.getElementById('title').value,
        genre: document.getElementById('genre').value,
        year: parseInt(document.getElementById('year').value)
    };
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add movie');
            return response.json();
        })
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(error => console.error('Error adding movie:', error));
});

// UPDATE
window.editMoviePrompt = function (id, currentTitle, currentYear, currentGenre) {
    const newTitle = prompt('UPDATE TITLE:', currentTitle);
    const newYearStr = prompt('UPDATE YEAR:', currentYear);
    const newGenre = prompt('UPDATE GENRE:', currentGenre);

    if (newTitle && newYearStr && newGenre) {
        const updatedMovie = {
            id: id,
            title: newTitle,
            year: parseInt(newYearStr),
            genre: newGenre
        };
        updateMovie(id, updatedMovie);
    }
}

function updateMovie(movieId, updatedMovieData) {
    fetch(`${API_URL}/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovieData),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update movie');
            return response.json();
        })
        .then(() => {
            fetchMovies();
        })
        .catch(error => console.error('Error updating movie:', error));
}

// DELETE
window.deleteMovie = function (movieId) {
    if (confirm('REMOVE THIS ITEM FROM COLLECTION?')) {
        fetch(`${API_URL}/${movieId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete movie');
                fetchMovies();
            })
            .catch(error => console.error('Error deleting movie:', error));
    }
}

fetchMovies();
