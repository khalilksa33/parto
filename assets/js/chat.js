/**
 * PARTO - AI Automotive Assistant Chat Widget
 */

const PartoAI = (function() {
  'use strict';

  let isOpen = false;
  let isLoading = false;

  function toggle() {
    isOpen = !isOpen;
    const win = document.getElementById('aiChatWindow');
    if (win) {
      if (isOpen) {
        win.classList.add('open');
        const input = document.getElementById('aiChatInput');
        if (input) input.focus();
      } else {
        win.classList.remove('open');
      }
    }
  }

  function appendMessage(text, role = 'ai') {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input || isLoading) return;

    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';
    isLoading = true;

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble ai';
    typingIndicator.id = 'aiTypingIndicator';
    typingIndicator.innerHTML = '<span>🤖 جاري الفحص والتشخيص...</span>';
    const container = document.getElementById('aiChatMessages');
    if (container) {
      container.appendChild(typingIndicator);
      container.scrollTop = container.scrollHeight;
    }

    try {
      const res = await fetch('api/ai-chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      });
      const data = await res.json();

      // Remove typing indicator
      const typingEl = document.getElementById('aiTypingIndicator');
      if (typingEl) typingEl.remove();

      appendMessage(data.response || 'عذراً، حدث خطأ أثناء الاتصال بالنظام.', 'ai');

      // Handle Smart Actions
      if (data.action === 'redirect_tashleeh') {
        const q = new URLSearchParams();
        if (data.part) q.append('partName', data.part);
        if (data.make) q.append('make', data.make);
        if (data.model) q.append('model', data.model);
        
        appendMessage('⏳ جاري توجيهك لصفحة طلب القطعة من التشليح...', 'ai');
        setTimeout(() => {
          window.location.href = `tashleeh.php?${q.toString()}`;
        }, 2200);
      } else if (data.action === 'redirect_towing') {
        appendMessage('🚨 جاري تحويلك لطلب سطحة فورية لطوارئ الطريق...', 'ai');
        setTimeout(() => {
          window.location.href = 'towing.php';
        }, 2200);
      } else if (data.action === 'redirect_workshop') {
        appendMessage('🔧 جاري تحويلك لحجز ورشة متنقلة أو صيانة...', 'ai');
        setTimeout(() => {
          window.location.href = 'workshop.php';
        }, 2200);
      }
    } catch (err) {
      const typingEl = document.getElementById('aiTypingIndicator');
      if (typingEl) typingEl.remove();
      appendMessage('حدث خطأ في الاتصال بالمساعد الذكي.', 'ai');
    } finally {
      isLoading = false;
    }
  }

  // Handle enter key press
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('aiChatInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }
  });

  return {
    toggle,
    sendMessage
  };
})();
