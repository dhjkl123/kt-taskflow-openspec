// Global application state

const state = {
    // User
    currentUser: null,

    // Team
    currentTeam: null,
    teamMembers: [],

    // Tasks
    tasks: [],
    lastTaskFetch: null,

    // Messages
    messages: [],
    lastMessageFetch: null,

    // UI
    route: 'login',
    isLoading: false,
    error: null,

    // Polling intervals
    tasksPolling: null,
    messagesPolling: null,
};

// State management functions
function updateState(updates) {
    Object.assign(state, updates);
}

function setRoute(route) {
    window.location.hash = `#/${route}`;
    updateState({ route });
}

async function initializeUser() {
    try {
        const user = await api.getMe();
        updateState({ currentUser: user });

        if (user.team_id) {
            // Load team
            const teams = await api.listTeams();
            if (teams.length > 0) {
                updateState({ currentTeam: teams[0] });
            }
        }

        return user;
    } catch (error) {
        // User not authenticated
        api.setToken(null);
        updateState({ currentUser: null });
        throw error;
    }
}

function logout() {
    api.setToken(null);
    updateState({
        currentUser: null,
        currentTeam: null,
        tasks: [],
        messages: [],
        teamMembers: [],
    });
    setRoute('login');
}
