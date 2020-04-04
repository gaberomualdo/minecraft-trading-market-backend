/* show scrolling nav when scrolling */
(() => {
    const navElm = document.querySelector('nav');
    const checkNavType = () => {
        if (window.pageYOffset > 0) {
            if (!navElm.classList.contains('scrolling')) {
                navElm.classList.add('scrolling');
            }
        } else {
            if (navElm.classList.contains('scrolling')) {
                navElm.classList.remove('scrolling');
            }
        }
    };

    window.addEventListener('load', checkNavType);
    window.addEventListener('scroll', checkNavType);
})();

/* sign out button functionality */
(() => {
    const signOutButton = document.querySelector('.nav .right .sign-out');
    signOutButton.addEventListener('click', () => {
        localStorage.setItem('minecraft-trading-market-credentials', null);
        window.open('/../', '_self');
    });
})();

/* create a trade button functionality */
(() => {
    const createtradeButton = document.querySelector('.nav .right .create-trade');
    const createtradeModalContainer = document.querySelector('.create-trade-modal-container');
    const createtradeModal = document.querySelector('.create-trade-modal');
    createtradeButton.addEventListener('click', () => {
        createtradeModalContainer.classList.remove('fadeOut');
        createtradeModal.classList.remove('zoomOut');

        createtradeModalContainer.classList.add('active');
        createtradeModalContainer.classList.add('fadeIn');
        createtradeModal.classList.add('zoomIn');

        setTimeout(() => createtradeModalContainer.classList.add('animated-in'), 350);
    });

    /* close create a trade modal */
    const closeModal = () => {
        createtradeModalContainer.classList.remove('animated-in');
        createtradeModalContainer.classList.remove('fadeIn');
        createtradeModal.classList.remove('zoomIn');

        createtradeModalContainer.classList.add('fadeOut');
        createtradeModal.classList.add('zoomOut');

        setTimeout(() => createtradeModalContainer.classList.remove('active'), 350);
    };

    const closeModalBtn = document.querySelector('.create-trade-modal .close-button');
    closeModalBtn.addEventListener('click', closeModal);
    document.addEventListener('click', (e) => {
        if (e.target == createtradeModalContainer && createtradeModalContainer.classList.contains('animated-in')) {
            closeModal();
        }
    });
})();
