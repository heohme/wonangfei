(function () {
  'use strict';
  // Browser-only view. All accounting and preferences remain owned by app.js.
  var bridge, child = null, refreshTimer = null, opening = false, generation = 0, ui;
  var entry = document.getElementById('floating-open');
  var row = document.getElementById('floating-entry');
  var note = document.getElementById('floating-note');
  var desktop = window.matchMedia('(min-width:650px) and (hover:hover) and (pointer:fine)');
  var supported = window.isSecureContext && window.documentPictureInPicture &&
    typeof window.documentPictureInPicture.requestWindow === 'function';
  var scriptURL = new URL(document.currentScript.src);
  var sheet = new URL('./floating.css' + scriptURL.search, scriptURL).href;

  function isOpen() { return !!(child && !child.closed); }
  function message(text) { if (bridge && bridge.message) bridge.message(text); }
  function availability() {
    if (entry) entry.hidden = !(supported && desktop.matches);
    if (row) row.hidden = !desktop.matches;
    if (note) {
      note.hidden = !desktop.matches || (supported && !isOpen());
      note.textContent = supported ? '保留此网页，小窗才能继续显示' : '悬浮小窗需使用支持此功能的桌面浏览器，如新版 Chrome / Edge';
    }
    if (entry) {
      entry.setAttribute('aria-pressed', String(isOpen()));
      entry.textContent = isOpen() ? '小窗已打开 ↗' : '悬浮小窗 ↗';
    }
  }
  function cleanup(win) {
    if (win !== child) return;
    if (refreshTimer !== null) win.clearInterval(refreshTimer);
    refreshTimer = null; child = null; ui = null;
    availability();
  }
  function close() {
    generation++;
    if (child) {
      var win = child;
      // Clear sensitive contents even when the browser delays its close event.
      if (ui) ui.root.textContent = '';
      cleanup(win);
      if (!win.closed) win.close();
    }
  }
  function element(doc, tag, className, text, id) {
    var el = doc.createElement(tag);
    if (className) el.className = className;
    if (id) el.id = id;
    if (text) el.textContent = text;
    return el;
  }
  function createView(win) {
    var doc = win.document;
    doc.title = '窝囊费';
    doc.documentElement.setAttribute('lang', 'zh-CN');
    var css = doc.createElement('link'); css.rel = 'stylesheet'; css.href = sheet;
    doc.head.appendChild(css);
    var root = element(doc, 'main', 'floating-card', '', 'wnf-floating-root');
    var header = element(doc, 'header', 'floating-header');
    header.appendChild(element(doc, 'span', 'floating-brand', '窝囊费'));
    header.appendChild(element(doc, 'span', 'floating-live', '慢慢攒，也在靠近'));
    var moneyView = element(doc, 'section', 'floating-money');
    moneyView.appendChild(element(doc, 'p', 'floating-label', '今天已赚'));
    var amount = element(doc, 'div', 'floating-amount', '', 'floating-amount');
    moneyView.appendChild(amount);
    moneyView.appendChild(element(doc, 'p', 'floating-motto', '每一秒，都算数。'));
    var goalView = element(doc, 'section', 'floating-goal');
    var art = element(doc, 'div', 'floating-art'); art.setAttribute('aria-hidden', 'true');
    var details = element(doc, 'div', 'floating-goal-details');
    details.appendChild(element(doc, 'p', 'floating-label', '正在攒的喜欢'));
    var name = element(doc, 'h1', 'floating-goal-name', '', 'floating-goal-name');
    var percent = element(doc, 'div', 'floating-percent', '', 'floating-percent');
    var track = element(doc, 'div', 'floating-track');
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', '愿望解锁进度');
    track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100');
    var fill = element(doc, 'span', 'floating-fill'); track.appendChild(fill);
    details.appendChild(name); details.appendChild(percent); details.appendChild(track);
    goalView.appendChild(art); goalView.appendChild(details);
    var error = element(doc, 'p', 'floating-error', '暂时无法读取进度，请返回主页'); error.hidden = true;
    var footer = element(doc, 'footer', 'floating-footer');
    var privacy = element(doc, 'button', 'floating-toggle', '切换脱敏', 'floating-privacy');
    privacy.type = 'button';
    privacy.addEventListener('click', function () { if (bridge) bridge.togglePrivacy(); sync(); });
    var back = element(doc, 'button', 'floating-back', '返回主页 ↗', 'floating-return');
    back.type = 'button'; back.addEventListener('click', function () { window.focus(); });
    footer.appendChild(privacy); footer.appendChild(back);
    [header, moneyView, goalView, error, footer].forEach(function (el) { root.appendChild(el); });
    doc.body.appendChild(root);
    ui = {root: root, money: moneyView, amount: amount, goal: goalView, art: art,
      name: name, percent: percent, track: track, fill: fill, privacy: privacy, error: error, lastArt: null};
  }
  function sync() {
    if (!isOpen() || !bridge || !ui) return;
    try {
      var value = bridge.getSnapshot();
      if (!value.configured || value.demo) { close(); return; }
      ui.error.hidden = true;
      var masked = !!value.masked;
      // Never keep the previous financial number in a hidden DOM node.
      ui.amount.textContent = masked ? '' : '¥' + Number(value.amount).toFixed(2);
      ui.amount.style.fontSize = ui.amount.textContent.length > 10 ? '36px' : '';
      ui.money.hidden = masked; ui.goal.hidden = !masked;
      ui.root.classList.toggle('is-private', masked);
      ui.privacy.textContent = masked ? '显示金额' : '切换脱敏';
      ui.privacy.setAttribute('aria-label', masked ? '显示今日金额' : '隐藏金额，展示愿望进度');
      ui.privacy.setAttribute('aria-pressed', String(masked));
      if (masked) {
        var goal = value.goal, progress = Math.max(0, Math.min(1, Number(goal.progress) || 0));
        ui.name.textContent = goal.name;
        ui.name.title = goal.name;
        ui.percent.textContent = (progress * 100).toFixed(3) + '%';
        ui.track.setAttribute('aria-valuenow', (progress * 100).toFixed(3));
        ui.fill.style.width = progress * 100 + '%';
        if (ui.lastArt !== goal.art) {
          // Only the application's own static SVG illustrations cross this bridge.
          ui.art.innerHTML = '<div class="floating-art-gray">' + goal.art + '</div><div class="floating-art-color"><div>' + goal.art + '</div></div>';
          ui.lastArt = goal.art;
        }
        ui.art.style.setProperty('--unlock', progress * 100 + '%');
      }
    } catch (error) {
      ui.amount.textContent = ''; ui.art.textContent = ''; ui.lastArt = null;
      ui.name.textContent = ''; ui.name.title = ''; ui.percent.textContent = '';
      ui.money.hidden = true; ui.goal.hidden = true; ui.error.hidden = false;
    }
  }
  async function open() {
    if (!supported || !desktop.matches || !bridge || opening) return;
    if (isOpen()) { child.focus(); return; }
    var value;
    try { value = bridge.getSnapshot(); }
    catch (error) { message('暂时无法读取进度，请返回主页重试。'); return; }
    if (!value.configured) { message('先设置月薪和作息，再打开小窗。'); return; }
    if (value.demo) { message('请退出体验演示后再打开小窗。'); return; }
    opening = true;
    var attempt = ++generation, win;
    try {
      // Called directly from the click: requestWindow requires user activation.
      win = await window.documentPictureInPicture.requestWindow({width: 348, height: 258});
      if (attempt !== generation) { win.close(); return; }
      child = win;
      win.addEventListener('pagehide', function () { cleanup(win); });
      createView(win); sync(); availability();
      if (isOpen()) refreshTimer = win.setInterval(sync, 1000);
    } catch (error) {
      if (win) { cleanup(win); if (!win.closed) win.close(); }
      message('小窗未能打开，请在支持的桌面浏览器中重试。');
    } finally { opening = false; }
  }
  window.WNFFloating = {
    connect: function (value) { bridge = value; availability(); },
    sync: sync, isOpen: isOpen, close: close
  };
  if (entry) entry.addEventListener('click', open);
  if (desktop.addEventListener) desktop.addEventListener('change', availability);
  else if (desktop.addListener) desktop.addListener(availability);
  window.addEventListener('pagehide', close);
  availability();
})();
