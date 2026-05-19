// API client for TaskFlow backend

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'  // Local development
    : window.location.origin;   // Production (Vercel)

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    async request(method, path, body = null) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE}${path}`, options);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }

            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${method} ${path}]:`, error);
            throw error;
        }
    }

    // Auth endpoints
    signup(email, password) {
        return this.request('POST', '/auth/signup', { email, password });
    }

    login(email, password) {
        return this.request('POST', '/auth/login', { email, password });
    }

    getMe() {
        return this.request('GET', '/auth/me');
    }

    logout() {
        return this.request('POST', '/auth/logout');
    }

    // Team endpoints
    createTeam(name) {
        return this.request('POST', '/teams', { name });
    }

    listTeams() {
        return this.request('GET', '/teams');
    }

    getTeam(teamId) {
        return this.request('GET', `/teams/${teamId}`);
    }

    joinTeam(inviteCode) {
        return this.request('POST', '/teams/join', { invite_code: inviteCode });
    }

    getTeamMembers(teamId) {
        return this.request('GET', `/teams/${teamId}/members`);
    }

    // Task endpoints
    createTask(teamId, title) {
        return this.request('POST', `/teams/${teamId}/tasks`, { title });
    }

    listTasks(teamId) {
        return this.request('GET', `/teams/${teamId}/tasks`);
    }

    getTask(taskId) {
        return this.request('GET', `/tasks/${taskId}`);
    }

    updateTaskStatus(taskId, status) {
        return this.request('PATCH', `/tasks/${taskId}/status`, { status });
    }

    updateTask(taskId, { title, assigneeId }) {
        return this.request('PUT', `/tasks/${taskId}`, {
            title,
            assignee_id: assigneeId
        });
    }

    deleteTask(taskId) {
        return this.request('DELETE', `/tasks/${taskId}`);
    }

    // Message endpoints
    sendMessage(teamId, content) {
        return this.request('POST', `/teams/${teamId}/messages`, { content });
    }

    getMessages(teamId, since = null) {
        let path = `/teams/${teamId}/messages`;
        if (since) {
            path += `?since=${encodeURIComponent(since)}`;
        }
        return this.request('GET', path);
    }

    deleteMessage(messageId) {
        return this.request('DELETE', `/messages/${messageId}`);
    }
}

const api = new APIClient();
