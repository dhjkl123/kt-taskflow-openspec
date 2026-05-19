const TeamSelectPage = {
    render() {
        const currentTeam = state.currentTeam;

        return `
            <div class="min-h-screen bg-gray-50">
                <header class="bg-white shadow">
                    <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 class="text-2xl font-bold">TaskFlow</h1>
                        <button id="logout-btn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">로그아웃</button>
                    </div>
                </header>

                <main class="max-w-4xl mx-auto px-4 py-8">
                    ${currentTeam ? `
                        <div class="bg-white p-6 rounded-lg shadow mb-8">
                            <h2 class="text-xl font-bold mb-4">현재 팀: ${escapeHTML(currentTeam.name)}</h2>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold mb-2">초대 코드:</label>
                                    <div class="flex items-center space-x-2">
                                        <code class="flex-1 bg-gray-100 p-3 rounded font-mono">${currentTeam.invite_code}</code>
                                        <button id="copy-code-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">복사</button>
                                    </div>
                                </div>
                                <div>
                                    <button id="go-kanban-btn" class="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
                                        칸반 보드로 이동
                                    </button>
                                </div>
                                <div>
                                    <button id="go-chat-btn" class="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">
                                        채팅으로 이동
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="bg-white p-6 rounded-lg shadow">
                                <h2 class="text-xl font-bold mb-4">새 팀 만들기</h2>
                                <input type="text" id="team-name" placeholder="팀 이름" class="w-full px-4 py-2 border rounded mb-4" />
                                <button id="create-team-btn" class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">팀 만들기</button>
                            </div>

                            <div class="bg-white p-6 rounded-lg shadow">
                                <h2 class="text-xl font-bold mb-4">팀에 합류하기</h2>
                                <input type="text" id="invite-code" placeholder="초대 코드 (예: ABCD-1234)" class="w-full px-4 py-2 border rounded mb-4" />
                                <button id="join-team-btn" class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">합류하기</button>
                            </div>
                        </div>
                    `}

                    <div id="message" class="mt-4 text-center text-red-600"></div>
                </main>
            </div>
        `;
    },

    attach() {
        const messageDiv = document.getElementById('message');

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await api.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }
                logout();
            });
        }

        const goKanbanBtn = document.getElementById('go-kanban-btn');
        if (goKanbanBtn) {
            goKanbanBtn.addEventListener('click', () => setRoute('kanban'));
        }

        const goChatBtn = document.getElementById('go-chat-btn');
        if (goChatBtn) {
            goChatBtn.addEventListener('click', () => setRoute('chat'));
        }

        const copyCodeBtn = document.getElementById('copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                copyToClipboard(state.currentTeam.invite_code);
            });
        }

        const createTeamBtn = document.getElementById('create-team-btn');
        if (createTeamBtn) {
            createTeamBtn.addEventListener('click', async () => {
                const name = document.getElementById('team-name').value;
                if (!name) {
                    messageDiv.textContent = '팀 이름을 입력하세요';
                    return;
                }

                try {
                    createTeamBtn.disabled = true;
                    const team = await api.createTeam(name);
                    state.currentTeam = team;
                    setRoute('team-select');
                } catch (error) {
                    messageDiv.textContent = error.message;
                } finally {
                    createTeamBtn.disabled = false;
                }
            });
        }

        const joinTeamBtn = document.getElementById('join-team-btn');
        if (joinTeamBtn) {
            joinTeamBtn.addEventListener('click', async () => {
                const code = document.getElementById('invite-code').value;
                if (!code) {
                    messageDiv.textContent = '초대 코드를 입력하세요';
                    return;
                }

                try {
                    joinTeamBtn.disabled = true;
                    await api.joinTeam(code);
                    // Refresh team data
                    const teams = await api.listTeams();
                    if (teams.length > 0) {
                        state.currentTeam = teams[0];
                    }
                    setRoute('team-select');
                } catch (error) {
                    messageDiv.textContent = error.message;
                } finally {
                    joinTeamBtn.disabled = false;
                }
            });
        }
    }
};
