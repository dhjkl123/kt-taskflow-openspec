const ChatPage = {
    render() {
        const messages = state.messages || [];

        return `
            <div class="min-h-screen bg-gray-50 flex flex-col">
                <header class="bg-white shadow">
                    <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 class="text-2xl font-bold">${escapeHTML(state.currentTeam?.name || 'TaskFlow')} - 채팅</h1>
                        <div class="space-x-2">
                            <button id="kanban-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">칸반</button>
                            <button id="menu-btn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">메뉴</button>
                        </div>
                    </div>
                </header>

                <main class="flex-1 max-w-4xl mx-auto w-full flex flex-col chat-container">
                    <div class="chat-messages" id="messages-container">
                        ${messages.map(msg => this.renderMessage(msg)).join('')}
                    </div>

                    <div class="chat-input">
                        <textarea id="message-input" placeholder="메시지를 입력하세요..." class="w-full"></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <span class="chat-count"><span id="char-count">0</span>/1000</span>
                            <button id="send-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">전송</button>
                        </div>
                    </div>
                </main>

                <div id="menu-overlay" class="menu-overlay"></div>
                <div id="menu" class="hamburger-menu">
                    <h2 class="text-lg font-bold mb-4">메뉴</h2>
                    <button id="back-to-team-btn" class="block w-full text-left px-4 py-2 hover:bg-gray-100">팀 목록</button>
                    <button id="logout-btn" class="block w-full text-left px-4 py-2 hover:bg-gray-100">로그아웃</button>
                </div>
            </div>
        `;
    },

    renderMessage(msg) {
        const isOwn = msg.user_id === state.currentUser?.id;
        return `
            <div class="chat-message">
                <div class="flex justify-between items-center">
                    <span class="author">${escapeHTML(msg.user?.email || '알 수 없음')}</span>
                    <span class="timestamp">${getTimeString(msg.created_at)}</span>
                    ${isOwn ? `<button class="delete-message text-red-500 hover:text-red-700 text-sm ml-2" data-message-id="${msg.id}">삭제</button>` : ''}
                </div>
                <div class="content">${escapeHTML(msg.content)}</div>
            </div>
        `;
    },

    attach() {
        const kanbanBtn = document.getElementById('kanban-btn');
        const menuBtn = document.getElementById('menu-btn');
        const menuOverlay = document.getElementById('menu-overlay');
        const menu = document.getElementById('menu');
        const backToTeamBtn = document.getElementById('back-to-team-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const messageInput = document.getElementById('message-input');
        const charCount = document.getElementById('char-count');
        const sendBtn = document.getElementById('send-btn');
        const messagesContainer = document.getElementById('messages-container');

        window.updateChatMessages = (messages) => {
            state.messages = messages;
            const app = document.getElementById('app');
            app.innerHTML = this.render();
            this.attach();
            this.scrollToBottom();
        };

        // Kanban button
        if (kanbanBtn) {
            kanbanBtn.addEventListener('click', () => {
                if (state.tasksPolling) clearInterval(state.tasksPolling);
                setRoute('kanban');
            });
        }

        // Menu button
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                menu.classList.add('open');
                menuOverlay.classList.add('open');
            });
        }

        // Menu overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                menu.classList.remove('open');
                menuOverlay.classList.remove('open');
            });
        }

        // Back to team
        if (backToTeamBtn) {
            backToTeamBtn.addEventListener('click', () => {
                if (state.messagesPolling) clearInterval(state.messagesPolling);
                setRoute('team-select');
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await api.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }
                if (state.messagesPolling) clearInterval(state.messagesPolling);
                logout();
            });
        }

        // Character count
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                charCount.textContent = messageInput.value.length;
                sendBtn.disabled = messageInput.value.length === 0 || messageInput.value.length > 1000;
            });
        }

        // Send message
        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const content = messageInput.value.trim();
                if (!content || content.length > 1000) {
                    return;
                }

                try {
                    sendBtn.disabled = true;
                    const message = await api.sendMessage(state.currentTeam.id, content);
                    state.messages.push(message);
                    state.lastMessageFetch = message.created_at;
                    messageInput.value = '';
                    charCount.textContent = '0';
                    window.updateChatMessages(state.messages);
                    this.scrollToBottom();
                } catch (error) {
                    alert(`오류: ${error.message}`);
                } finally {
                    sendBtn.disabled = false;
                }
            });
        }

        // Delete message buttons
        document.querySelectorAll('.delete-message').forEach(btn => {
            btn.addEventListener('click', async () => {
                const messageId = btn.getAttribute('data-message-id');
                if (confirm('이 메시지를 삭제하시겠습니까?')) {
                    try {
                        await api.deleteMessage(messageId);
                        state.messages = state.messages.filter(m => m.id !== parseInt(messageId));
                        window.updateChatMessages(state.messages);
                    } catch (error) {
                        alert(`오류: ${error.message}`);
                    }
                }
            });
        });

        // Initialize message fetch
        if (!state.lastMessageFetch) {
            state.lastMessageFetch = new Date().toISOString();
        }

        // Handle keyboard on mobile (visualViewport API)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                setTimeout(() => this.scrollToBottom(), 100);
            });
        }

        this.scrollToBottom();
    },

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 0);
        }
    }
};
