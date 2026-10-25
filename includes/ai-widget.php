<?php
global $isRtl;
?>
<!-- Floating AI Assistant Button -->
<button class="ai-chat-btn" onclick="PartoAI.toggle()" title="<?= $isRtl ? 'المساعد الذكي للسيارات' : 'Parto AI Assistant' ?>">
  <span>✨</span>
</button>

<!-- AI Assistant Chat Window -->
<div class="ai-chat-window" id="aiChatWindow">
  <div class="ai-chat-header">
    <div style="display: flex; align-items: center; gap: 0.65rem;">
      <span style="font-size: 1.4rem;">🤖</span>
      <div>
        <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">
          <?= $isRtl ? 'المساعد الذكي (بارتو AI)' : 'Parto AI Garage' ?>
        </div>
        <div style="font-size: 0.72rem; color: #34d399; font-weight: 600;">
          <?= $isRtl ? 'متصل ومستعد للمساعدة' : 'Online & Ready to Assist' ?>
        </div>
      </div>
    </div>
    <button class="btn-icon" onclick="PartoAI.toggle()" style="width: 28px; height: 28px; font-size: 0.8rem;">✕</button>
  </div>

  <div class="ai-chat-messages" id="aiChatMessages">
    <div class="chat-bubble ai">
      <?= $isRtl 
        ? 'مرحباً بك! أنا مساعد بارتو الذكي. صف لي مشكلة سيارتك وسأقوم بتشخيصها أو توجيهك للقطعة المناسبة وسطحة الإنقاذ مباشرة!' 
        : 'Hello! I am your Parto AI Assistant. Describe your vehicle symptoms and I will help diagnose the issue or direct you to the exact auto part!' ?>
    </div>
  </div>

  <div class="ai-chat-input-row">
    <input type="text" id="aiChatInput" class="ai-chat-input" placeholder="<?= $isRtl ? 'اكتب مشكلتك هنا (مثال: بطارية، سلف، سطحة)...' : 'Describe symptom (e.g. starter clicking, flat tire)...' ?>">
    <button class="btn-primary" style="padding: 0.6rem 1rem; border-radius: var(--radius-full);" onclick="PartoAI.sendMessage()">
      <span><?= $isRtl ? 'إرسال' : 'Send' ?></span>
    </button>
  </div>
</div>
