document.addEventListener('DOMContentLoaded', () => {
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const evadeCounterEl = document.getElementById('evadeCounter');
  const successOverlay = document.getElementById('successOverlay');
  const successStats = document.getElementById('successStats');
  const btnRestart = document.getElementById('btnRestart');
  const agreementOverlay = document.getElementById('agreementOverlay');
  const modalFooter = document.getElementById('modalFooter');

  let evadeCount = 0;
  let isPositionFixed = false;

  // Funny lines the "No" button says when running away
  const speechLines = [
    '押させないよ〜！ 😜',
    '「はい」を押してください！ 🙏',
    '無駄な抵抗です 🤖',
    'そっちはハズレ！ ❌',
    'おっとっと！ 🏃‍♂️💨',
    'あきらめが肝心です 😉',
    '利用規約をもう一度読みましょう 📖',
    '「いいえ」はメンテナンス中です 🛠️',
    'クリック禁止区域です ⛔',
    '強制的同意をお願いします！ ✨',
    '手が滑りましたか？ 🤔',
    'そっちじゃないですよ！ 👉',
    '残念！逃げました！ 💨',
    '「はい」の一択です！ 🎯'
  ];

  /**
   * Helper: Show a speech bubble near the "No" button
   */
  function showSpeechBubble() {
    // Remove existing bubbles first to prevent clutter
    const oldBubbles = document.querySelectorAll('.speech-bubble');
    oldBubbles.forEach(b => b.remove());

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    
    // Choose random line
    const randomLine = speechLines[Math.floor(Math.random() * speechLines.length)];
    bubble.textContent = randomLine;

    // Append to footer or overlay depending on positioning
    document.body.appendChild(bubble);

    // Position the bubble relative to the button's viewport position
    const btnRect = btnNo.getBoundingClientRect();
    
    // Position bubble above the button, centered
    bubble.style.left = `${btnRect.left + (btnRect.width / 2) - (bubble.offsetWidth / 2)}px`;
    bubble.style.top = `${window.scrollY + btnRect.top - 40}px`;

    // Wait for insertion to get correct dimensions for perfect centering
    setTimeout(() => {
      const bubbleWidth = bubble.offsetWidth;
      bubble.style.left = `${btnRect.left + (btnRect.width / 2) - (bubbleWidth / 2)}px`;
    }, 0);

    // Fade out and remove after 1.2s
    setTimeout(() => {
      bubble.style.transition = 'opacity 0.3s ease';
      bubble.style.opacity = '0';
      setTimeout(() => bubble.remove(), 300);
    }, 1200);
  }

  /**
   * Evasion logic: move the button to a new position
   */
  function evadeButton() {
    evadeCount++;
    evadeCounterEl.textContent = `${evadeCount} 回`;

    // Prepare fixed positioning to move around the viewport if not already done
    if (!isPositionFixed) {
      // Get current absolute position to prevent sudden jump during transition to fixed
      const rect = btnNo.getBoundingClientRect();
      btnNo.style.position = 'fixed';
      btnNo.style.left = `${rect.left}px`;
      btnNo.style.top = `${rect.top}px`;
      btnNo.style.margin = '0';
      isPositionFixed = true;
    }

    const btnWidth = btnNo.offsetWidth || 100;
    const btnHeight = btnNo.offsetHeight || 38;

    // Viewport boundaries with safety padding
    const padding = 40;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;

    // Generate random coordinate within viewport
    let nextX = Math.random() * (maxX - padding) + padding;
    let nextY = Math.random() * (maxY - padding) + padding;

    // Ensure it doesn't spawn exactly under the cursor
    // If the random coordinate happens to be near the current cursor, regenerate once
    const mouseX = window.lastMouseX || window.innerWidth / 2;
    const mouseY = window.lastMouseY || window.innerHeight / 2;
    const distToMouse = Math.hypot(nextX + btnWidth / 2 - mouseX, nextY + btnHeight / 2 - mouseY);

    if (distToMouse < 150) {
      nextX = (nextX + window.innerWidth / 2) % maxX;
      nextY = (nextY + window.innerHeight / 2) % maxY;
    }

    // Set position
    btnNo.style.left = `${Math.max(padding, Math.min(nextX, maxX))}px`;
    btnNo.style.top = `${Math.max(padding, Math.min(nextY, maxY))}px`;

    // Visual effect: momentary scale down/up during transition
    btnNo.style.transform = 'scale(0.9)';
    btnNo.style.transition = 'all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)';
    setTimeout(() => {
      btnNo.style.transform = 'scale(1)';
    }, 150);

    // Speak
    showSpeechBubble();
  }

  // Record mouse coordinates globally to verify spawn safety
  window.addEventListener('mousemove', (e) => {
    window.lastMouseX = e.clientX;
    window.lastMouseY = e.clientY;

    // Check distance and trigger evasion when getting too close
    if (isPositionFixed || true) {
      const rect = btnNo.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      // Trigger threshold: 85 pixels
      if (dist < 85) {
        evadeButton();
      }
    }
  });

  // Backup trigger: mouse enters the button boundaries directly
  btnNo.addEventListener('mouseenter', () => {
    evadeButton();
  });

  // Touch screen support: touch start triggers evasion instantly before click
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents click emulations
    evadeButton();
  });

  btnNo.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    evadeButton();
  });

  // Keyboard countermeasures: Tab focus
  btnNo.addEventListener('focus', (e) => {
    // Shunt focus directly to "Yes" button
    btnYes.focus();
    evadeButton();
  });

  // In case the button is somehow clicked (extremely rare edge case or hack)
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    evadeButton();
  });

  // Yes button handler
  btnYes.addEventListener('click', () => {
    // Hide terms agreement modal
    agreementOverlay.classList.add('hidden');
    
    // Display success panel
    successOverlay.style.display = 'flex';
    successStats.innerHTML = `「同意しない」ボタンの回避を <strong>${evadeCount} 回</strong> 試みましたが、無事にご同意いただきました！`;
    
    // Start confetti
    startConfetti();
  });

  // Restart/Try again handler
  btnRestart.addEventListener('click', () => {
    // Reset state
    evadeCount = 0;
    evadeCounterEl.textContent = '0 回';
    
    // Stop confetti
    stopConfetti();
    
    // Revert "No" button style and location to original flow
    isPositionFixed = false;
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = '';
    btnNo.style.transition = '';
    btnNo.style.margin = '';
    
    // Remove speech bubbles
    const bubbles = document.querySelectorAll('.speech-bubble');
    bubbles.forEach(b => b.remove());

    // Switch overlay views
    successOverlay.style.display = 'none';
    agreementOverlay.classList.remove('hidden');
  });


  /* ==========================================
     Confetti Canvas Animation
     ========================================== */
  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let particles = [];
  const colors = ['#ff0033', '#0033cc', '#ffcc00', '#28a745', '#ff6600', '#9933ff', '#00cccc'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    if (successOverlay.style.display === 'flex') {
      resizeCanvas();
    }
  });

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 4 + 4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      // Reset when particle goes off bottom screen
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        this.speedY = Math.random() * 4 + 4;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationId = requestAnimationFrame(animateConfetti);
  }

  function startConfetti() {
    resizeCanvas();
    particles = [];
    // Spawn 150 particles
    for (let i = 0; i < 150; i++) {
      particles.push(new ConfettiParticle());
    }
    animateConfetti();
  }

  function stopConfetti() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  }
});
