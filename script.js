function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.main-page, .search-page, .contact-page').forEach(page => {
        page.classList.add('hidden');
    });

    // Show the selected page
    document.getElementById(pageId).classList.remove('hidden');

    // Update the active link
    document.querySelectorAll('.topnav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.topnav a#${pageId}-nav`).classList.add('active');
}

function populateFilters(recipes) {
    const container = document.querySelector("#search-filters");
    if (!container) return;

    const filterValues = new Set();

    if (Array.isArray(recipes)) {
        recipes.forEach(recipe => {
            (recipe["Filtrid"] || "").split(/[,;|]/).forEach(filter => {
                const value = filter.trim();
                if (value) filterValues.add(value);
            });
        });
    } else {
        document.querySelectorAll(".search-result").forEach(result => {
            (result.dataset.filters || "").split(/[,;|]/).forEach(filter => {
                const value = filter.trim();
                if (value) filterValues.add(value);
            });
        });
    }

    container.replaceChildren();

    filterValues.forEach(value => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-option";
        button.textContent = value;
        button.dataset.filter = value;
        addFilterListener(button, container);

        container.appendChild(button);
    });
}

function addFilterListener(button, container) {
    button.addEventListener("click", () => {
        button.classList.toggle("active");
        applyFilter(container);
    });
}

function applyFilter(container) {
    const selectedFilters = Array.from(container.querySelectorAll(".filter-option.active"))
        .map(option => option.dataset.filter);

    document.querySelectorAll(".search-result").forEach(result => {
        const resultFilters = (result.dataset.filters || "")
            .split(/[,;|]/)
            .map(filter => filter.trim());
        const matches = selectedFilters.length === 0 ||
            selectedFilters.every(filter => resultFilters.includes(filter));

        result.classList.toggle("hidden", !matches);
    });
}

function addListeners(tulemus) {
     tulemus.addEventListener("click", function () {
            const modal = document.getElementById("recipeModal");

            // Võtab vajutatud retsepti nime ja kirjelduse
            const nimi = tulemus.querySelector("h2").textContent;
            const kirjeldus = tulemus.querySelector("p").textContent;
            const image = tulemus.dataset.image;
            const filters = tulemus.dataset.filters;
            const difficulty = tulemus.dataset.difficulty;
            const steps = tulemus.dataset.steps;
            const ingredients = tulemus.dataset.ingredients;
            const price = tulemus.dataset.price;
            const time = tulemus.dataset.time;

            const modalTitle = document.getElementById("modalTitle");
            const modalDesc = document.getElementById("modalDesc");
            const modalImage = document.getElementById("modalImage");
            const modalFilters = document.getElementById("modalFilters");
            const modalDifficulty = document.getElementById("modalDifficulty");
            const modalSteps = document.getElementById("modalSteps");
            const modalIngredients = document.getElementById("modalIngredients");
            const modalPrice = document.getElementById("modalPrice");
            const modalTime = document.getElementById("modalTime");

            //Lisab need pop-up aknasse
            if (modalTitle) {
                modalTitle.textContent = nimi;
            }
            if (modalDesc) {
                modalDesc.textContent = kirjeldus;
            }
            if (modalImage) {
                modalImage.src = image;
            }
            if (modalFilters) {
                modalFilters.textContent = filters;
            }
            if (modalDifficulty) {
                modalDifficulty.textContent = difficulty;
            }
            if (modalSteps) {
                modalSteps.textContent = steps;
            }
            if (modalIngredients) {
                modalIngredients.textContent = ingredients;
            }
            if (modalPrice) {
                modalPrice.textContent = price;
            }
            if (modalTime) {
                modalTime.textContent = time;
            }

            //Avab pop-up akna
            modal.showModal();

        })
}

document.addEventListener("DOMContentLoaded", function () {

    //Kui pole lehel pop upi siis lõpp
    const modal = document.getElementById("recipeModal");
    if (!modal) return;
    
    

    // Leiab kõik otsingutulemused
    const tulemused = document.querySelectorAll(".search-result");

    tulemused.forEach(function (tulemus) {
       addListeners(tulemus)
    })
})
    


function filterResults() {
    const input = document.getElementById("search-input");
    const filter = input.value.toLowerCase();
    const results = document.querySelectorAll(".search-result");
    // leave only the results where the name contains a similar word, or where name/description contains the search word
    results.forEach(result => {
        //check the name and description separately
        const name = result.querySelector("h2").textContent.toLowerCase();
        const description = result.querySelector("p").textContent.toLowerCase();
        const nameDistance = levenshteinDistance(filter, name);
        // Set a threshold for the Levenshtein distance
        const threshold = 2;
        let matchFound = false;
        name.split(" ").forEach(word => {
            const wordDistance = levenshteinDistance(filter, word);
            if (wordDistance <= threshold || word.includes(filter)) {
                matchFound = true;
            }
        });

        if (matchFound || name.includes(filter) || description.includes(filter)) {
            result.classList.remove("hidden");
        } else {
            result.classList.add("hidden");
        }
    });
}

// Levenshtein distance function
function levenshteinDistance(s1, s2) {
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2[i - 1] === s1[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + 1
                );
            }
        }
    }
    return matrix[s2.length][s1.length];
}


// Parse recipes from Google Sheets CSV
function parseCSV() {
    const resultsContainer = document.getElementById("search-results");

    if (!resultsContainer) {
        console.error("Could not find #search-results");
        return;
    }

    fetch("https://docs.google.com/spreadsheets/d/1mGjZjhe90vcSgpoC84J7pNtXFJRvRjdU9arfNAF4q4A/export?format=csv")
        .then(response => response.text())
        .then(csv => {
            // Properly parse CSV, including commas and line breaks
            const parsed = Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.trim().replace(/^\uFEFF/, "")
            });

            if (parsed.errors.length) {
                console.warn("CSV parsing warnings:", parsed.errors);
            }

            // Clear previous results
            resultsContainer.replaceChildren();

            // Generate HTML for every recipe
            parsed.data.forEach(recipe => {
                // create a new article element for each recipe and append it to the results container
                // Skip rows without a recipe name
                const nimi = recipe["Nimi"]?.trim();

                if (!nimi) return;

                const kirjeldus = recipe["Kirjeldus"]?.trim() || "";
                const image = recipe["Pilt (link)"]?.trim() || "";
                const filters = recipe["Filtrid"]?.trim() || "";
                const difficulty = recipe["Raskustase"]?.trim() || "";
                const steps = recipe["Valmistus step by step"]?.trim() || "";
                const ingredients = recipe["Koostisosad"]?.trim() || "";
                const price = recipe["Hind"]?.trim() || "";
                const time = recipe["Ajakulu"]?.trim() || "";

                const resultElement = document.createElement("article");
                resultElement.classList.add("search-result");

                const titleElement = document.createElement("h2");
                titleElement.textContent = nimi;

                const descElement = document.createElement("p");
                descElement.textContent = kirjeldus;

                // Add the additional data as data attributes for later use in the modal
                resultElement.dataset.image = image;
                resultElement.dataset.filters = filters;
                resultElement.dataset.difficulty = difficulty;
                resultElement.dataset.steps = steps;
                resultElement.dataset.ingredients = ingredients;
                resultElement.dataset.price = price;
                resultElement.dataset.time = time;

                resultElement.append(
                    titleElement,
                    descElement
                );

                resultsContainer.appendChild(resultElement);
                addListeners(resultElement);
            });
            populateFilters(parsed.data);
        })
}

// Load recipes when the page loads
parseCSV();

