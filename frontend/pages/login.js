const LoginPage = {
    render() {
        return `
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="w-full max-w-md bg-white p-8 rounded-lg shadow">
                    <h1 class="text-2xl font-bold text-center mb-6">TaskFlow</h1>

                    <div id="login-form" class="space-y-4 mb-6">
                        <h2 class="text-lg font-semibold">로그인</h2>
                        <input type="email" id="login-email" placeholder="이메일" class="w-full px-4 py-2 border rounded" />
                        <input type="password" id="login-password" placeholder="비밀번호" class="w-full px-4 py-2 border rounded" />
                        <button id="login-btn" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">로그인</button>
                    </div>

                    <hr class="my-4" />

                    <div id="signup-form" class="space-y-4">
                        <h2 class="text-lg font-semibold">새 계정 만들기</h2>
                        <input type="email" id="signup-email" placeholder="이메일" class="w-full px-4 py-2 border rounded" />
                        <input type="password" id="signup-password" placeholder="비밀번호" class="w-full px-4 py-2 border rounded" />
                        <input type="password" id="signup-confirm" placeholder="비밀번호 확인" class="w-full px-4 py-2 border rounded" />
                        <button id="signup-btn" class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">회원가입</button>
                    </div>

                    <div id="message" class="mt-4 text-center text-red-600"></div>
                </div>
            </div>
        `;
    },

    attach() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const messageDiv = document.getElementById('message');

        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                messageDiv.textContent = '이메일과 비밀번호를 입력하세요';
                return;
            }

            try {
                loginBtn.disabled = true;
                const response = await api.login(email, password);
                api.setToken(response.access_token);
                state.currentUser = { email };
                setRoute('team-select');
            } catch (error) {
                messageDiv.textContent = error.message;
            } finally {
                loginBtn.disabled = false;
            }
        });

        signupBtn.addEventListener('click', async () => {
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (!email || !password || !confirm) {
                messageDiv.textContent = '모든 필드를 입력하세요';
                return;
            }

            if (password !== confirm) {
                messageDiv.textContent = '비밀번호가 일치하지 않습니다';
                return;
            }

            try {
                signupBtn.disabled = true;
                await api.signup(email, password);
                messageDiv.textContent = '';
                messageDiv.textContent = '회원가입 성공! 로그인하세요';
                document.getElementById('login-email').value = email;
            } catch (error) {
                messageDiv.textContent = error.message;
            } finally {
                signupBtn.disabled = false;
            }
        });
    }
};
