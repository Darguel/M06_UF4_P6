const keys = {
    api_key: '8778cf514f391132d1edfb0a2270f743',
    session_id: '794b2b25640f0258bed55533eaeb9a6d243773cf',
    account_id: '21215201'
}

let moviesResult = document.getElementById("moviesResult");
let loadingIndicator = document.getElementById("loadingIndicator");

let current_page = 1;
let total_pages = 0;
let query = '';
let isLoading = false;
let showingFavorites = false;

window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && current_page < total_pages && !isLoading && !showingFavorites) {
        current_page++;
        isLoading = true;
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
        setTimeout(() => {
            searchMovies(query, false).then(() => {
                isLoading = false;
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            });
        }, 500);
    }
});

async function setFav(id, favBool) {
    const url = `https://api.themoviedb.org/3/account/${keys.account_id}/favorite?api_key=${keys.api_key}&session_id=${keys.session_id}`;
    const data = {
        media_type: "movie",
        media_id: id,
        favorite: favBool
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, options)
        .then(response => response.json())
        .then(responseData => {
            console.log(`id -> ${id}, marked as ${favBool}`);
            showFavs();
        })
        .catch(err => console.log(err));
}

async function showFavs() {
    moviesResult.innerHTML = "";
    showingFavorites = true;

    const url = `https://api.themoviedb.org/3/account/${keys.account_id}/favorite/movies?language=en-US&page=1&api_key=${keys.api_key}&session_id=${keys.session_id}&sort_by=created_at.asc`;
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    try {
        const response = await fetch(url);
        const data = await response.json();
        const favoritesMovies = data.results;
        favoritesMovies.forEach(favMovie => printMovie(favMovie, true, false));
    } catch (err) {
        console.log(err);
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

async function searchMovies(queryText, cleanResults = true) {
    showingFavorites = false;
    if (cleanResults) {
        moviesResult.innerHTML = "";
        current_page = 1;
        query = queryText;
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${queryText}&include_adult=false&language=en-US&page=${current_page}&api_key=${keys.api_key}&session_id=${keys.session_id}`;
        const response = await fetch(url);
        const data = await response.json();
        const searchResults = data.results;
        total_pages = data.total_pages;

        for (const movie of searchResults) {
            const urlCheck = `https://api.themoviedb.org/3/movie/${movie.id}/account_states?api_key=${keys.api_key}&session_id=${keys.session_id}`;
            const responseCheck = await fetch(urlCheck);
            const dataCheck = await responseCheck.json();
            const isFavorite = dataCheck.favorite;

            printMovie(movie, isFavorite, false);
        }
    } catch (err) {
        console.log(err);
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    clearInput();
    removeActive();
}

document.getElementById("showFavs").addEventListener("click", function () {
    removeActive();
    this.classList.add("active");
    showFavs();
});

document.getElementById("showWatch").addEventListener("click", function () {
    removeActive();
    this.classList.add("active");
    // showWatch();
});

document.getElementById("search").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies(this.value);
    }
});

document.querySelector(".searchBar i").addEventListener("click", () => {
    searchMovies(document.getElementById("search").value);
});

document.getElementById("search").addEventListener('click', () => clearInput());

function clearInput() {
    document.getElementById("search").value = "";
}

function removeActive() {
    document.querySelectorAll(".menu li a").forEach(el => el.classList.remove("active"));
}

function printMovie(movie, fav, watch) {
    let favIcon = fav ? 'iconActive' : 'iconNoActive';
    let watchIcon = watch ? 'iconActive' : 'iconNoActive';

    moviesResult.innerHTML += `<div class="movie">
                                    <img src="https://image.tmdb.org/t/p/original${movie.poster_path}">
                                    <h3>${movie.original_title}</h3>
                                    <div class="buttons">
                                        <a id="fav" onClick="setFav(${movie.id}, ${!fav})"><i class="fa-solid fa-heart ${favIcon}"></i></a>
                                        <a id="watch" onClick="setWatch(${movie.id}, ${!watch})"><i class="fa-solid fa-eye ${watchIcon}"></i></a>
                                    </div>
                                </div>`;
}
