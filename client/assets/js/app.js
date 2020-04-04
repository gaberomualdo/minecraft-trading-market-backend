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

/* create a trade nav button functionality */
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

// create trade modal functionality
(() => {
    const errorElm = document.querySelector('.create-trade-modal .error');

    // function to display error
    const displayError = (text) => {
        errorElm.innerText = text;
        if (!errorElm.classList.contains('active')) {
            errorElm.classList.add('active');
        }
    };

    const nameInputElm = document.querySelector('.create-trade-modal input[name=name]');
    const descriptionInputElm = document.querySelector('.create-trade-modal .input[name=description]');

    const createTradeBtnElm = document.querySelector('.create-trade-modal .button[name=create-trade]');

    createTradeBtnElm.addEventListener('click', async () => {
        name = nameInputElm.value;
        description = descriptionInputElm.value;

        const response = await fetch(SERVER_BASE + '/api/market/', {
            method: 'POST',
            headers: new Headers({
                Authorization: getAuthorizationHeader(),
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
                name,
                description,
            }),
        });

        switch (response.status) {
            case 200:
                window.open('/../#yourtrades', '_self');
                break;
            case 401:
                displayError('Invalid Account Sign-In');
                break;
            case 400:
                const responseJSON = await response.json();
                displayError(responseJSON.errors.map((item) => item.msg).join('\n'));
                break;
            case 500:
                displayError('Server Error');
                break;
            default:
                displayError(`Unknown Error: Status ${response.status}`);
                console.log(await response.text());
        }
    });
})();
