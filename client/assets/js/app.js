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
                window.open('/../#your-trades', '_self');
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

// tab functionality
(() => {
    // btn elms
    const activeTradesBtn = document.querySelector('.app > .tabselect > .tabbtn.active-trades');
    const completedTradesBtn = document.querySelector('.app > .tabselect > .tabbtn.completed-trades');
    const yourTradesBtn = document.querySelector('.app > .tabselect > .tabbtn.your-trades');
    const notificationsBtn = document.querySelector('.app > .tabselect > .tabbtn.notifications');
    const logBtn = document.querySelector('.app > .tabselect > .tabbtn.log');

    const appElm = document.querySelector('.app');

    const clearActiveTab = () => {
        appElm.classList.remove('active-trades');
        appElm.classList.remove('completed-trades');
        appElm.classList.remove('your-trades');
        appElm.classList.remove('notifications');
        appElm.classList.remove('log');
    };

    const btnClicked = (classname, noHash) => {
        clearActiveTab();
        appElm.classList.add(classname);

        if (noHash) return;

        // default is active trades tab
        if (classname == 'active-trades') {
            // remove hash
            // code taken from user Andy E from https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r
            history.pushState('', document.title, window.location.pathname + window.location.search);
        } else {
            window.location.hash = '#' + classname;
        }
    };

    activeTradesBtn.addEventListener('click', () => btnClicked('active-trades'));
    completedTradesBtn.addEventListener('click', () => btnClicked('completed-trades'));
    yourTradesBtn.addEventListener('click', () => btnClicked('your-trades'));
    notificationsBtn.addEventListener('click', () => btnClicked('notifications'));
    logBtn.addEventListener('click', () => btnClicked('log'));

    // hash functionality
    if (['active-trades', 'completed-trades', 'your-trades', 'notifications', 'log'].indexOf(window.location.hash.slice(1)) > -1) {
        btnClicked(window.location.hash.slice(1), true);
    } else {
        // default is active trades
        btnClicked('active-trades');
    }
})();

// log and notifications tab
(async () => {
    const username = getCredentials().username;

    const logTabElm = document.querySelector('.app > .tabs > .tab.log');
    const notificationsTabElm = document.querySelector('.app > .tabs > .tab.notifications');

    const response = await fetch(SERVER_BASE + '/api/log/', {
        method: 'GET',
        headers: new Headers({
            Authorization: getAuthorizationHeader(),
            'Content-Type': 'application/x-www-form-urlencoded',
        }),
    });

    const log = await response.text();
    const logEntries = log.split('\n').filter((line) => line.length > 0);

    const notifications = [];

    // add momentjs date to each entry and add to notifications list if applicable
    logEntries.forEach((logEntry, index) => {
        const formattedDate = moment(logEntry.slice(logEntry.length - 24)).calendar();
        logEntries[index] = logEntry = { text: logEntry.slice(0, logEntry.length - 27), date: formattedDate };
        if (logEntry.text.indexOf(username) > -1) {
            notifications.push({
                text: logEntry.text /*.split(`"${username}"`).join('You')*/,
                date: logEntry.date,
            });
        }
    });

    const createEntryDOMElm = (entry) => {
        const curEntry = document.createElement('div');
        curEntry.classList.add('entry');

        const curEntryText = document.createElement('p');
        curEntryText.classList.add('text');
        curEntryText.innerText = entry.text;

        const curEntryDate = document.createElement('p');
        curEntryDate.classList.add('date');
        curEntryDate.innerText = entry.date;

        curEntry.appendChild(curEntryText);
        curEntry.appendChild(curEntryDate);

        return curEntry;
    };

    // loop through notifications and log entries and add
    logEntries.forEach((entry) => {
        logTabElm.appendChild(createEntryDOMElm(entry));
    });
    notifications.forEach((entry) => {
        notificationsTabElm.appendChild(createEntryDOMElm(entry));
    });
})();
