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
        button.setAttribute("aria-pressed", "false");
        addFilterListener(button);

        container.appendChild(button);
    });
}

function addFilterListener(button) {
    button.addEventListener("click", () => {
        button.classList.toggle("active");
        button.setAttribute("aria-pressed", String(button.classList.contains("active")));
        filterResults();
    });
}

// Muudab raskustaseme (nt 4 või "Keskmine") viie tähe süsteemiks
function teeTarnid(raskustase) {
    if (!raskustase) {
        return "-";
    }

    // Proovib tekstist kätte saada numbri (nt "4" või "4/5" -> 4)
    let number = parseInt(raskustase);

    // Kui tabelis on numbri asemel sõna (nt "Lihtne", "Keskmine", "Raske"), teisendab selle numbriks
    if (isNaN(number)) {
        const tekst = raskustase.toLowerCase();
        if (tekst.includes("lihtne") || tekst.includes("kerge")) {
            number = 2;
        } else if (tekst.includes("keskmine")) {
            number = 3;
        } else if (tekst.includes("raske")) {
            number = 5;
        } else {
            return raskustase;
        }
    }

    // Käib tsükliga läbi 1 kuni 5 ja lisab täidetud või tühja tähe ikooni
    let tarnid = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= number) {
            tarnid += '<i class="fa-solid fa-star star-filled"></i>';
        } else {
            tarnid += '<i class="fa-regular fa-star star-empty"></i>';
        }
    }
    return tarnid;
}

// Lisab retseptidele klikkimise asja, mis täidab ja avab pop-up akna
function addListeners(tulemus) {
    tulemus.addEventListener("click", function () {
        const modal = document.getElementById("recipeModal");

        // Loeb vajutatud retsepti küljest kõik andmed
        const nimi = tulemus.querySelector("h2").textContent;
        const kirjeldus = tulemus.querySelector("p").textContent;
        const image = tulemus.dataset.image;
        const filters = tulemus.dataset.filters;
        const difficulty = tulemus.dataset.difficulty;
        const steps = tulemus.dataset.steps;
        const ingredients = tulemus.dataset.ingredients;
        const price = tulemus.dataset.price;
        const time = tulemus.dataset.time;

        // kirjutab põhiandmed pop-up akna elementidesse
        document.getElementById("modalTitle").textContent = nimi;
        document.getElementById("modalDesc").textContent = kirjeldus;
        document.getElementById("modalImage").src = image;
        document.getElementById("modalPrice").textContent = price || "-";
        document.getElementById("modalTime").textContent = time || "-";
        document.getElementById("modalDifficulty").innerHTML = teeTarnid(difficulty);

        // 1. Siltide loomine pildi peale (tükeldab koma kohalt, nt "Soolane,Soe")
        const modalFilters = document.getElementById("modalFilters");
        modalFilters.innerHTML = "";
        if (filters) {
            const siltideNimekiri = filters.split(",");
            siltideNimekiri.forEach(silt => {
                if (silt.trim() !== "") {
                    const span = document.createElement("span");
                    span.className = "modal-tag";
                    const ilusSilt = silt.trim();
                    span.textContent = ilusSilt[0].toUpperCase() + ilusSilt.slice(1);
                    modalFilters.appendChild(span);
                }
            });
        }

        // 2. Koostisosade loomine filtritena 
        
        const modalIngredients = document.getElementById("modalIngredients");
        modalIngredients.innerHTML = "";
        if (ingredients) {
            const koostisosadeList = ingredients.split("\n");
            koostisosadeList.forEach(asi => {
                if (asi.trim() !== "") {
                    const li = document.createElement("li");
                    li.textContent = asi.trim();
                    modalIngredients.appendChild(li);
                }
            });
        }

        // 3. Samm-sammult juhendi loomine
        const modalSteps = document.getElementById("modalSteps");
        modalSteps.innerHTML = "";
        if (steps) {
            const sammudeList = steps.split("\n");
            sammudeList.forEach((samm, index) => {
                let puhasTekst = samm.trim();

                if (puhasTekst !== "") {
                    // Kui sammu alguses on juba number (nt "1." või "1 "), lõikame selle eest ära
                    while (
                        puhasTekst.length > 0 &&
                        ((puhasTekst[0] >= "0" && puhasTekst[0] <= "9") ||
                            puhasTekst[0] === "." ||
                            puhasTekst[0] === ")")
                    ) {
                        puhasTekst = puhasTekst.slice(1).trim();
                    }

                    const li = document.createElement("li");

                    // Loob ümmarguse järjekorranumbri (1, 2, 3...)
                    const numberSpan = document.createElement("span");
                    numberSpan.className = "step-number";
                    numberSpan.textContent = index + 1;

                    // Loob sammu teksti ilma alguse numbrita
                    const tekstSpan = document.createElement("span");
                    tekstSpan.textContent = puhasTekst;

                    li.append(numberSpan, tekstSpan);
                    modalSteps.appendChild(li);
                }
            });
        }

        // Avab pop-up akna ekraanile
        modal.showModal();
    });
}

// Käivitub kohe, kui leht on laetud
document.addEventListener("DOMContentLoaded", function () {
    const clearButton = document.getElementById("clear-search");
    const searchInput = document.getElementById("search-input");
    if (clearButton && searchInput) {
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            document.querySelectorAll(".filter-option.active").forEach(option => {
                option.classList.remove("active");
                option.setAttribute("aria-pressed", "false");
            });
            filterResults();
            searchInput.focus();
        });
    }

    const modal = document.getElementById("recipeModal");
    if (!modal) return;

    // sulgeb pop-up akna, kui kasutaja vajutab aknast väljapoole tumedale taustale
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.close();
        }
    });

    // Seob klikkimise kuulajad olemasolevate retseptidega
    const tulemused = document.querySelectorAll(".search-result");
    tulemused.forEach(function (tulemus) {
        addListeners(tulemus);
    });
});

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
    const filter = input.value.trim().toLowerCase();
    const selectedFilters = Array.from(document.querySelectorAll(".filter-option.active"))
        .map(option => option.dataset.filter);
    const results = document.querySelectorAll(".search-result");
    let visibleCount = 0;

    results.forEach(result => {
        const name = result.querySelector("h2").textContent.toLowerCase();
        const description = result.querySelector("p").textContent.toLowerCase();
        const matchesSearch = !filter ||
            name.includes(filter) ||
            description.includes(filter) ||
            name.split(/\s+/).some(word =>
                word.includes(filter) || levenshteinDistance(filter, word) <= 2
            );
        const resultFilters = (result.dataset.filters || "")
            .split(/[,;|]/)
            .map(value => value.trim());
        const matchesFilters = selectedFilters.every(value => resultFilters.includes(value));
        const isVisible = matchesSearch && matchesFilters;

        result.classList.toggle("hidden", !isVisible);
        if (isVisible) visibleCount++;
    });

    const status = document.getElementById("search-results-status");
    if (status) {
        status.textContent = visibleCount === 0
            ? "Ühtegi retsepti ei leitud. Muuda otsingut või filtreid."
            : `Leitud ${visibleCount} ${visibleCount === 1 ? "retsept" : "retsepti"}`;
    }

    const clearButton = document.getElementById("clear-search");
    if (clearButton) {
        clearButton.disabled = !filter && selectedFilters.length === 0;
    }
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Recipe request failed with status ${response.status}`);
            }
            return response.text();
        })
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
            filterResults();
        })
        .catch(error => {
            console.error("Could not load recipes:", error);
            const status = document.getElementById("search-results-status");
            if (status) {
                status.textContent = "Retseptide laadimine ebaõnnestus. Proovi lehte värskendada.";
            }
        });
}

// Load recipes when the page loads
parseCSV();

