// Utility functions

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;

    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
}

function getTimeString(isoString) {
    return new Date(isoString).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert(`오류: ${message}`);
}

function showSuccess(message) {
    console.log(`성공: ${message}`);
    // Could add toast notification here
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('클립보드에 복사됨');
    });
}

// Wait for page visibility change
function onPageVisible(callback) {
    if (document.visibilityState === 'visible') {
        callback();
    }
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            callback();
        }
    });
}
