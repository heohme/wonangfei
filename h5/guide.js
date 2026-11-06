(function () {
  'use strict';
  var active = false, step = 0, onComplete = null, previousFocus = null;
  var ui = null, frame = null, frameIsAnimation = false, background = null, backgroundHidden = null;
  var hadBodyClass = false;
  var steps = [
    {target: 'view-toggle', title: '看数字，还是看盼头？', copy: '金额看今日收入；脱敏看物品解锁进度。'},
    {target: 'time-toggle', title: '按什么时间算？', copy: '全天从零点累计；仅工作按你的作息计算。'}
  ];

  function element(tag, className, id, text) {
    var node = document.createElement(tag);
    node.className = className;
    if (id) node.id = id;
    if (text) node.textContent = text;
    return node;
  }
  function ensureUI() {
    if (ui) return;
    var root = document.getElementById('coach-guide') || element('div', 'coach-guide', 'coach-guide');
    root.className = 'coach-guide';
    root.hidden = true;
    var masks = {};
    ['top', 'bottom', 'left', 'right'].forEach(function (side) {
      var mask = element('div', 'coach-mask coach-mask-' + side);
      mask.setAttribute('aria-hidden', 'true');
      root.appendChild(mask); masks[side] = mask;
    });
    var spot = element('div', 'coach-spot');
    spot.setAttribute('aria-hidden', 'true');
    root.appendChild(spot);
    var card = element('section', 'coach-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'coach-title');
    card.setAttribute('aria-describedby', 'coach-copy coach-step');
    var count = element('p', 'coach-step', 'coach-step');
    var title = element('h2', 'coach-title', 'coach-title');
    var copy = element('p', 'coach-copy', 'coach-copy');
    copy.setAttribute('aria-live', 'polite');
    var actions = element('div', 'coach-actions');
    var next = element('button', 'coach-next', 'coach-next', '下一步');
    var skip = element('button', 'coach-skip', 'coach-skip', '跳过');
    next.type = 'button'; skip.type = 'button';
    next.addEventListener('click', function () {
      if (!active) return;
      if (step === steps.length - 1) finish();
      else { step++; draw(); }
    });
    skip.addEventListener('click', finish);
    actions.appendChild(next); actions.appendChild(skip);
    [count, title, copy, actions].forEach(function (node) { card.appendChild(node); });
    root.appendChild(card);
    // The transparent spotlight remains part of this full-screen event shield.
    root.addEventListener('click', function (event) {
      if (!active || next.contains(event.target) || skip.contains(event.target)) return;
      event.preventDefault(); event.stopPropagation();
    }, true);
    function blockBackgroundScroll(event) {
      if (active && !card.contains(event.target)) event.preventDefault();
    }
    root.addEventListener('touchmove', blockBackgroundScroll, {passive: false});
    root.addEventListener('wheel', blockBackgroundScroll, {passive: false});
    if (!root.parentNode) document.body.appendChild(root);
    ui = {root: root, masks: masks, spot: spot, card: card, count: count,
      title: title, copy: copy, next: next, skip: skip};
  }
  function box(node, left, top, width, height) {
    node.style.left = left + 'px'; node.style.top = top + 'px';
    node.style.width = Math.max(0, width) + 'px'; node.style.height = Math.max(0, height) + 'px';
  }
  function position() {
    if (!active) return;
    var target = document.getElementById(steps[step].target);
    if (!target) { close(); return; }
    var rect = target.getBoundingClientRect();
    var width = window.innerWidth || document.documentElement.clientWidth;
    var height = window.innerHeight || document.documentElement.clientHeight;
    if (!rect.width || !rect.height || width < 40 || height < 40) { close(); return; }
    var left = Math.max(0, rect.left - 7), top = Math.max(0, rect.top - 7);
    var right = Math.min(width, rect.right + 7), bottom = Math.min(height, rect.bottom + 7);
    if (right <= left || bottom <= top) { close(); return; }
    box(ui.masks.top, 0, 0, width, top);
    box(ui.masks.bottom, 0, bottom, width, height - bottom);
    box(ui.masks.left, 0, top, left, bottom - top);
    box(ui.masks.right, right, top, width - right, bottom - top);
    box(ui.spot, left, top, right - left, bottom - top);
    var cardWidth = Math.min(320, width - 32);
    ui.card.style.width = cardWidth + 'px';
    ui.card.style.maxHeight = Math.max(8, height - 32) + 'px';
    var cardHeight = ui.card.offsetHeight;
    var cardLeft = Math.max(16, Math.min(width - cardWidth - 16, (left + right - cardWidth) / 2));
    var cardTop = bottom + 18;
    if (cardTop + cardHeight > height - 16 && top - cardHeight - 18 >= 16) cardTop = top - cardHeight - 18;
    cardTop = Math.max(16, Math.min(cardTop, height - cardHeight - 16));
    ui.card.style.left = cardLeft + 'px'; ui.card.style.top = cardTop + 'px';
  }
  function schedulePosition() {
    if (!active || frame !== null) return;
    function update() { frame = null; position(); }
    frameIsAnimation = typeof window.requestAnimationFrame === 'function';
    frame = frameIsAnimation ? window.requestAnimationFrame(update) : window.setTimeout(update, 16);
  }
  function draw() {
    var page = steps[step];
    ui.title.textContent = page.title; ui.copy.textContent = page.copy;
    ui.count.textContent = (step + 1) + ' / ' + steps.length;
    ui.count.setAttribute('aria-label', '第' + (step + 1) + '步，共' + steps.length + '步');
    ui.next.textContent = step === steps.length - 1 ? '知道了' : '下一步';
    var target = document.getElementById(page.target);
    if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({block: 'nearest', inline: 'nearest'});
    position();
    if (active) ui.next.focus();
  }
  function keydown(event) {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); finish();
    } else if (event.key === 'Tab') {
      var focused = document.activeElement;
      if (!ui.card.contains(focused) || (event.shiftKey && focused === ui.next) || (!event.shiftKey && focused === ui.skip)) {
        event.preventDefault();
        (event.shiftKey ? ui.skip : ui.next).focus();
      }
      event.stopPropagation();
    }
  }
  function keepFocus(event) {
    if (active && !ui.card.contains(event.target)) ui.next.focus();
  }
  function close() {
    if (!active) return;
    active = false; onComplete = null;
    window.removeEventListener('resize', schedulePosition);
    document.removeEventListener('scroll', schedulePosition, true);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('focusin', keepFocus, true);
    if (frame !== null) {
      if (frameIsAnimation && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(frame);
      else window.clearTimeout(frame);
      frame = null;
    }
    ui.root.hidden = true;
    if (!hadBodyClass) document.body.classList.remove('coach-open');
    if (background) {
      if (backgroundHidden === null) background.removeAttribute('aria-hidden');
      else background.setAttribute('aria-hidden', backgroundHidden);
    }
    var focus = previousFocus;
    previousFocus = null; background = null;
    function visible(node) {
      return node && node.isConnected !== false && typeof node.focus === 'function' &&
        (!node.getClientRects || node.getClientRects().length);
    }
    if (!visible(focus)) focus = document.getElementById(steps[step].target);
    if (!visible(focus)) focus = document.getElementById('view-toggle');
    if (visible(focus)) focus.focus();
  }
  function finish() {
    if (!active) return;
    var callback = onComplete;
    close();
    if (typeof callback === 'function') callback();
  }
  function start(callback) {
    if (active) { schedulePosition(); return false; }
    var target = document.getElementById(steps[0].target);
    if (!target) return false;
    ensureUI();
    previousFocus = document.activeElement;
    background = document.querySelector('main');
    backgroundHidden = background ? background.getAttribute('aria-hidden') : null;
    hadBodyClass = document.body.classList.contains('coach-open');
    document.body.classList.add('coach-open');
    onComplete = callback; step = 0; active = true; ui.root.hidden = false;
    window.addEventListener('resize', schedulePosition);
    document.addEventListener('scroll', schedulePosition, true);
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', keepFocus, true);
    draw();
    // Move focus out first, so aria-hidden never contains the focused button.
    if (active && background) background.setAttribute('aria-hidden', 'true');
    return active;
  }
  window.WNFGuide = {start: start, isOpen: function () { return active; }, close: close};
})();
