// Main app router and initialization

async function renderPage(route) {
    const app = document.getElementById('app');

    try {
        if (route === 'login') {
            app.innerHTML = LoginPage.render();
            LoginPage.attach();
        } else if (route === 'team-select') {
            const user = await initializeUser();
            if (!user) {
                setRoute('login');
                return;
            }
            app.innerHTML = TeamSelectPage.render();
            TeamSelectPage.attach();
        } else if (route === 'kanban') {
            const user = await initializeUser();
            if (!user || !state.currentTeam) {
                setRoute('team-select');
                return;
            }
            app.innerHTML = KanbanPage.render();
            KanbanPage.attach();
            // Start polling for tasks
            pollTasks();
        } else if (route === 'chat') {
            const user = await initializeUser();
            if (!user || !state.currentTeam) {
                setRoute('team-select');
                return;
            }
            app.innerHTML = ChatPage.render();
            ChatPage.attach();
            // Start polling for messages
            pollMessages();
        } else {
            setRoute('login');
        }
    } catch (error) {
        console.error('Error rendering page:', error);
        if (route !== 'login') {
            setRoute('login');
        } else {
            app.innerHTML = `<div class="p-4 text-red-600">오류가 발생했습니다: ${error.message}</div>`;
        }
    }
}

// Polling functions
function pollTasks() {
    if (state.tasksPolling) clearInterval(state.tasksPolling);

    state.tasksPolling = setInterval(async () => {
        if (state.route === 'kanban' && state.currentTeam) {
            try {
                const tasks = await api.listTasks(state.currentTeam.id);
                state.tasks = tasks;
                // Trigger UI update if needed
                if (window.updateKanbanBoard) {
                    window.updateKanbanBoard(tasks);
                }
            } catch (error) {
                console.error('Error polling tasks:', error);
            }
        }
    }, 5000);
}

function pollMessages() {
    if (state.messagesPolling) clearInterval(state.messagesPolling);

    state.messagesPolling = setInterval(async () => {
        if (state.route === 'chat' && state.currentTeam) {
            try {
                const messages = await api.getMessages(state.currentTeam.id, state.lastMessageFetch);
                if (messages.length > 0) {
                    state.messages = [...state.messages, ...messages];
                    state.lastMessageFetch = messages[messages.length - 1].created_at;
                    // Trigger UI update if needed
                    if (window.updateChatMessages) {
                        window.updateChatMessages(state.messages);
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }
    }, 5000);
}

// Router setup
function initializeRouter() {
    const hash = window.location.hash;
    let route = 'login';

    if (hash === '#/team-select') route = 'team-select';
    else if (hash === '#/kanban') route = 'kanban';
    else if (hash === '#/chat') route = 'chat';

    state.route = route;
    renderPage(route);
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    let route = 'login';

    if (hash === '#/team-select') route = 'team-select';
    else if (hash === '#/kanban') route = 'kanban';
    else if (hash === '#/chat') route = 'chat';

    state.route = route;
    renderPage(route);
});

// Health check on load
window.addEventListener('load', async () => {
    try {
        await fetch(`${window.location.origin}/health`);
    } catch (error) {
        console.error('Backend health check failed:', error);
    }

    initializeRouter();
});
