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