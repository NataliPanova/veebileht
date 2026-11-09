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