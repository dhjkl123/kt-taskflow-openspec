const KanbanPage = {
    render() {
        const tasks = state.tasks || [];
        const todoTasks = tasks.filter(t => t.status === 'TODO');
        const doingTasks = tasks.filter(t => t.status === 'DOING');
        const doneTasks = tasks.filter(t => t.status === 'DONE');

        return `
            <div class="min-h-screen bg-gray-50">
                <header class="bg-white shadow">
                    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 class="text-2xl font-bold">${escapeHTML(state.currentTeam?.name || 'TaskFlow')}</h1>
                        <div class="space-x-2">
                            <button id="chat-btn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">채팅</button>
                            <button id="menu-btn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">메뉴</button>
                        </div>
                    </div>
                </header>

                <main class="max-w-7xl mx-auto px-4 py-8">
                    <div class="mb-6">
                        <div class="flex gap-2">
                            <input type="text" id="new-task" placeholder="새 태스크 추가..." class="flex-1 px-4 py-2 border rounded" />
                            <button id="add-task-btn" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">추가</button>
                        </div>
                    </div>

                    <div class="kanban-board">
                        ${this.renderColumn('TODO', '할 일', todoTasks)}
                        ${this.renderColumn('DOING', '진행 중', doingTasks)}
                        ${this.renderColumn('DONE', '완료', doneTasks)}
                    </div>

                    <div id="message" class="mt-4 text-red-600"></div>
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

    renderColumn(status, title, tasks) {
        return `
            <div class="kanban-column" data-status="${status}">
                <h3>${title} (${tasks.length})</h3>
                <div class="tasks-container" data-status="${status}">
                    ${tasks.map(task => this.renderTask(task)).join('')}
                </div>
            </div>
        `;
    },

    renderTask(task) {
        return `
            <div class="task-card" draggable="true" data-task-id="${task.id}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <p class="font-semibold text-sm">${escapeHTML(task.title)}</p>
                        <p class="text-xs text-gray-500 mt-1">${formatDate(task.created_at)}</p>
                    </div>
                    <button class="delete-task text-red-500 hover:text-red-700 text-sm" data-task-id="${task.id}">✕</button>
                </div>
            </div>
        `;
    },

    attach() {
        const messageDiv = document.getElementById('message');
        const chatBtn = document.getElementById('chat-btn');
        const menuBtn = document.getElementById('menu-btn');
        const menuOverlay = document.getElementById('menu-overlay');
        const menu = document.getElementById('menu');
        const backToTeamBtn = document.getElementById('back-to-team-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const addTaskBtn = document.getElementById('add-task-btn');
        const newTaskInput = document.getElementById('new-task');

        window.updateKanbanBoard = (tasks) => {
            state.tasks = tasks;
            const app = document.getElementById('app');
            app.innerHTML = this.render();
            this.attach();
        };

        // Setup drag and drop
        this.setupDragAndDrop();

        // Chat button
        if (chatBtn) {
            chatBtn.addEventListener('click', () => setRoute('chat'));
        }

        // Menu button
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                menu.classList.add('open');
                menuOverlay.classList.add('open');
            });
        }

        // Menu overlay click
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                menu.classList.remove('open');
                menuOverlay.classList.remove('open');
            });
        }

        // Back to team
        if (backToTeamBtn) {
            backToTeamBtn.addEventListener('click', () => {
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
                logout();
            });
        }

        // Add task
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', async () => {
                const title = newTaskInput.value.trim();
                if (!title) {
                    messageDiv.textContent = '태스크 제목을 입력하세요';
                    return;
                }

                try {
                    addTaskBtn.disabled = true;
                    const task = await api.createTask(state.currentTeam.id, title);
                    state.tasks.push(task);
                    newTaskInput.value = '';
                    messageDiv.textContent = '';
                    window.updateKanbanBoard(state.tasks);
                } catch (error) {
                    messageDiv.textContent = error.message;
                } finally {
                    addTaskBtn.disabled = false;
                }
            });
        }

        // Delete task buttons
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.getAttribute('data-task-id');
                if (confirm('이 태스크를 삭제하시겠습니까?')) {
                    try {
                        await api.deleteTask(taskId);
                        state.tasks = state.tasks.filter(t => t.id !== parseInt(taskId));
                        window.updateKanbanBoard(state.tasks);
                    } catch (error) {
                        messageDiv.textContent = error.message;
                    }
                }
            });
        });
    },

    setupDragAndDrop() {
        let draggedElement = null;
        let sourceStatus = null;

        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                sourceStatus = card.parentElement.getAttribute('data-status');
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        document.querySelectorAll('.tasks-container').forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.style.backgroundColor = '#f0f0f0';
            });

            container.addEventListener('dragleave', () => {
                container.style.backgroundColor = '';
            });

            container.addEventListener('drop', async (e) => {
                e.preventDefault();
                container.style.backgroundColor = '';

                if (!draggedElement) return;

                const newStatus = container.getAttribute('data-status');
                const taskId = draggedElement.getAttribute('data-task-id');

                if (newStatus !== sourceStatus) {
                    try {
                        await api.updateTaskStatus(parseInt(taskId), newStatus);
                        const task = state.tasks.find(t => t.id === parseInt(taskId));
                        if (task) {
                            task.status = newStatus;
                            window.updateKanbanBoard(state.tasks);
                        }
                    } catch (error) {
                        console.error('Error updating task status:', error);
                    }
                }
            });
        });
    }
};
