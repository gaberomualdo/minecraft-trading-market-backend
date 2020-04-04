const SERVER_BASE = 'http://localhost:7280';

const verifyCredentials = async () => {
    // get credentials from local storage
    const credentials = JSON.parse(localStorage.getItem('minecraft-trading-market-credentials'));

    if (!credentials) {
        return 'denied';
    }

    // create authorization header
    const authorizationHeader = 'Basic ' + btoa(credentials.username + ':' + credentials.pin);

    const response = await fetch(SERVER_BASE + '/api/auth/', {
        method: 'GET',
        headers: new Headers({
            Authorization: authorizationHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
        }),
    });

    switch (response.status) {
        case 200:
            return 'accepted';
            break;
        case 401:
            return 'denied';
            break;
        case 500:
            return 'servererror';
    }
    return;
};

const setCredentials = (username, pin) => {
    localStorage.setItem('minecraft-trading-market-credentials', JSON.stringify({ username, pin }));
};

// if credentials are valid, go to logged in homepage
window.addEventListener('load', () => {
    (async () => {
        if ((await verifyCredentials()) == 'accepted') {
            if (!window.location.href.toString().endsWith('app.html')) {
                window.open('app.html', '_self');
            }
        } else {
            if (!window.location.href.toString().endsWith('/')) {
                window.open('/../', '_self');
            }
        }
    })();
});
