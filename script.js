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
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("recipeModal");

    //Kui pole lehel pop upi siis lõpp
    if (!modal) return;

    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");

    // Leiab kõik otsingutulemused
    const tulemused = document.querySelectorAll(".search-result");

    tulemused.forEach(function(tulemus) {
        tulemus.addEventListener("click", function() {

            // Võtab vajutatud retsepti nime ja kirjelduse
            const nimi = tulemus.querySelector("h2").textContent;
            const kirjeldus = tulemus.querySelector("p").textContent;

            //Lisab need pop-up aknasse
            modalTitle.textContent = nimi;
            modalDesc.textContent = kirjeldus;

            //Avab pop-up akna
            modal.showModal();

        })
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