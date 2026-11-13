/* 郵輪旅程規劃：資料與元件分離。所有畫面都由 trip 資料產生。 */
(function () {
  'use strict';
  let STORE_KEY = 'cruise-planner-draft-v1';
  let TRIP_FILE = 'data/msc-2026-12.json';
  const CAT = {
    sight: { label: '景點・活動', color: '#F6D27A' },
    food: { label: '餐飲', color: '#F2A497' },
    stay: { label: '艙房・住宿', color: '#A8D3E6' },
    transport: { label: '交通・港口', color: '#B9DAA5' },
    shop: { label: '購物', color: '#DED2ED' }
  };
  const EXP_CAT = {
    transport: { label: '交通與港務', color: '#B9DAA5' },
    sight: { label: '景點門票與船上消費', color: '#F6D27A' },
    stay: { label: '船票與住宿', color: '#A8D3E6' },
    food: { label: '餐飲', color: '#F2A497' },
    shop: { label: '購物', color: '#DED2ED' }
  };
  const MODES = {
    walk: { label: '步行', color: '#84909E' },
    taxi: { label: '計程車', color: '#D77968' },
    bus: { label: '公車', color: '#3A9B80' },
    train: { label: '火車', color: '#4678C5' },
    subway: { label: '地鐵／單軌', color: '#9266C2' },
    shinkansen: { label: '新幹線', color: '#D8902C' },
    ship: { label: '郵輪', color: '#2E7DAF' }
  };
  const MODE_ICON = {
    walk: '<path d="M13 4a2 2 0 1 0 0 .1M11 8l-3 4 2 1 2-2 1 4-3 6h2.4l2.6-5 1 5H19l-1.5-7-1-4 2 2h2v-2h-1.5L16 7.5 13 7z" fill="currentColor"/>',
    taxi: '<path d="M6 10l1.5-4h9L18 10h1.5a1.5 1.5 0 0 1 1.5 1.5V17h-2v2h-2.5v-2h-9v2H5v-2H3v-5.5A1.5 1.5 0 0 1 4.5 10zm2-2.2L7.3 10h9.4L16 7.8zM7 14.5a1.2 1.2 0 1 0 0-.1M17 14.5a1.2 1.2 0 1 0 0-.1M9.5 3h5v2h-5z" fill="currentColor"/>',
    bus: '<path d="M5 4h14a2 2 0 0 1 2 2v11h-1v2h-2.5v-2h-11v2H4v-2H3V6a2 2 0 0 1 2-2zm0 3v5h14V7zm2 7.3a1.2 1.2 0 1 0 0-.1M17 14.3a1.2 1.2 0 1 0 0-.1" fill="currentColor"/>',
    train: '<path d="M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-2.2 2.9L19.5 21h-2.3l-1.4-3H8.2l-1.4 3H4.5l1.7-3.1A3 3 0 0 1 4 15V6a3 3 0 0 1 3-3zm-1 4v4h12V7zm2 7.3a1.2 1.2 0 1 0 0-.1M16 14.3a1.2 1.2 0 1 0 0-.1" fill="currentColor"/>',
    subway: '<path d="M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-2.2 2.9L19.5 21h-2.3l-1.4-3H8.2l-1.4 3H4.5l1.7-3.1A3 3 0 0 1 4 15V6a3 3 0 0 1 3-3zm-1 4v4h12V7zm2 7.3a1.2 1.2 0 1 0 0-.1M16 14.3a1.2 1.2 0 1 0 0-.1" fill="currentColor"/>',
    shinkansen: '<path d="M3 15c0-5 6-9 13-9h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9-6v3h7V9zm-7 9h14v2H5z" fill="currentColor"/>',
    ship: '<path d="M10 3h4v3h4v5l3 1-3 7H6L3 12l3-1V6h4zm-2 5v2.4L12 9l4 1.4V8zM3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0v1.6c-1.5 1-3 1-4.5 0s-3-1-4.5 0-3 1-4.5 0-3-1-4.5 0z" fill="currentColor"/>'
  };
  const EYE_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="#3E3A39" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="#3E3A39"/></svg>';
  const EYE_SHUT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10s3.6 5 9 5 9-5 9-5M7 13.6l-1.6 2.2M12 15v2.6M17 13.6l1.6 2.2" fill="none" stroke="#3E3A39" stroke-width="2" stroke-linecap="round"/></svg>';

  let trip = null;
  let history = [];
  const ui = { page: 'plan', view: 'week', dayIdx: 0, prevDayIdx: null, selected: null, showTotal: false, mapMode: 'fit', packFilter: 'all', packQuery: '', bounceIdx: null };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 時間工具 ---------- */
  const toMin = t => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fmt = m => { m = Math.max(0, Math.min(1439, Math.round(m))); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const durText = m => m < 60 ? `${m} 分` : `${Math.floor(m / 60)} 小時${m % 60 ? ` ${m % 60} 分` : ''}`;
  const endMin = it => toMin(it.start) + Number(it.duration || 0);
  function zonedParts(ms, tz) {
    const p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
    return p;
  }
  function nowIn(tz) { const p = zonedParts(Date.now(), tz); return { date: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) }; }
  function zonedToUtc(date, hhmm, tz) {
    const [y, mo, d] = date.split('-').map(Number); const [h, mi] = hhmm.split(':').map(Number);
    let guess = Date.UTC(y, mo - 1, d, h, mi);
    for (let i = 0; i < 2; i++) {
      const p = zonedParts(guess, tz);
      const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
      guess -= (asUtc - Date.UTC(y, mo - 1, d, h, mi));
    }
    return new Date(guess);
  }
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  function dateLabel(date) { const d = new Date(date + 'T00:00:00'); return { md: `${d.getMonth() + 1}/${d.getDate()}`, wd: WEEK[d.getDay()], day: d.getDate(), ym: `${d.getFullYear()} 年 ${d.getMonth() + 1} 月` }; }
  const tzShort = tz => ({ 'Asia/Taipei': '台灣時間', 'Asia/Tokyo': '日本時間' }[tz] || tz);

  /* ---------- 金額 ---------- */
  const cur = c => trip.currencies[c] || { symbol: c + ' ', rate: 1 };
  const money = (v, c) => v == null ? '未填' : cur(c).symbol + Math.round(v).toLocaleString('zh-TW');
  const travelers = () => (trip.travelers.adults || 0) + (trip.travelers.children || 0);
  const vehicles = () => Math.max(1, Math.ceil(travelers() / 4));
  const perLabel = { person: '每人', vehicle: '每車', group: '全團' };
  function lineTotal(cost) {
    if (!cost || cost.amount == null || cost.amount === '') return null;
    const n = Number(cost.amount);
    return cost.per === 'person' ? n * travelers() : cost.per === 'vehicle' ? n * vehicles() : n;
  }
  const statusTag = s => s === 'estimate' ? '<span class="tag est">估算</span>' : s === 'pending' ? '<span class="tag pend">待確認</span>' : '';

  /* ---------- 資料推導 ---------- */
  const dayOf = date => trip.days.find(d => d.date === date);
  const itemsOn = date => trip.items.filter(i => i.date === date).sort((a, b) => toMin(a.start) - toMin(b.start) || a.id.localeCompare(b.id));
  const hasLoc = i => !i.onboard && i.lat != null && i.lng != null && i.lat !== '' && i.lng !== '';
  function distKm(a, b) {
    const R = 6371, r = x => x * Math.PI / 180;
    const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function estimateLeg(a, b, day) {
    const km = distKm(a, b) * 1.3; // 道路係數
    if (km < 0.1) return null;
    const jp = day.tz === 'Asia/Tokyo';
    if (km <= 1.0) return { mode: 'walk', minutes: Math.max(3, Math.ceil(km / 4.5 * 60)), cost: null, km };
    const minutes = Math.ceil(km / 28 * 60) + 5;
    const amount = jp ? Math.round((500 + km * 330) / 10) * 10 : Math.round(85 + km * 25);
    return { mode: 'taxi', minutes, km, cost: { amount, currency: jp ? 'JPY' : 'TWD', per: 'vehicle', status: 'estimate' } };
  }
  function computeDay(date) {
    const day = dayOf(date); const items = itemsOn(date);
    const legs = []; const warns = {}; const addWarn = (id, w) => { (warns[id] = warns[id] || []).push(w); };
    let lastLoc = null;
    items.forEach((it, idx) => {
      if (hasLoc(it)) {
        if (lastLoc) {
          const key = `${lastLoc.id}>${it.id}`;
          const est = estimateLeg(lastLoc, it, day);
          const ov = trip.legOverrides[key];
          if (est || ov) {
            const leg = Object.assign({ key, from: lastLoc, to: it, estimated: !ov, km: est ? est.km : 0 }, est || { mode: 'walk', minutes: 0, cost: null }, ov || {});
            legs.push(leg);
          }
        }
        lastLoc = it;
      }
      const prev = items[idx - 1];
      if (prev) {
        const leg = legs.find(l => l.to === it && l.from === prev);
        const need = endMin(prev) + (leg ? Number(leg.minutes) : 0);
        if (endMin(prev) > toMin(it.start)) addWarn(it.id, `與「${prev.title}」時間重疊`);
        else if (need > toMin(it.start)) addWarn(it.id, `交通約 ${leg.minutes} 分，可能遲到 ${need - toMin(it.start)} 分`);
      }
    });
    // 郵輪專屬：上岸行程超過 all aboard
    if (day && day.allAboard) {
      const ab = toMin(day.allAboard);
      items.filter(hasLoc).forEach(it => {
        const isPort = Math.abs(it.lat - day.lat) < 0.003 && Math.abs(it.lng - day.lng) < 0.003;
        if (!isPort && endMin(it) > ab - 30) addWarn(it.id, `結束時間離 All aboard ${day.allAboard} 不到 30 分`);
        if (isPort && toMin(it.start) > ab && !it.onboard && day.portType === 'port') addWarn(it.id, `晚於 All aboard ${day.allAboard}`);
      });
    }
    return { day, items, legs, warns };
  }

  /* ---------- 儲存與歷史 ---------- */
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(trip)); } catch (e) { /* 無法存草稿時照常運作 */ } }
  function commit(fn, msg) {
    history.push(JSON.stringify(trip)); if (history.length > 60) history.shift();
    fn(trip); save(); render(); if (msg) toast(msg);
  }
  function undo() {
    if (!history.length) { toast('沒有可以復原的步驟'); return; }
    trip = JSON.parse(history.pop()); save(); render(); toast('已復原上一步');
  }
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 4000); }
  const uid = p => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- 頁首 ---------- */
  function grandTotal() {
    const lines = expenseLines();
    const total = lines.reduce((s, l) => s + (l.settle || 0), 0);
    return { total: Math.round(total), pending: lines.filter(l => l.settle == null).length };
  }
  function renderHeader() {
    $('#brand').innerHTML = window.Illus.brand;
    $('#tripname').textContent = trip.name;
    const n = trip.days.length;
    const places = new Set(trip.items.filter(i => !i.onboard).map(i => i.title)).size;
    const ports = trip.days.filter(d => d.portType === 'port').length;
    $('#tripmeta').innerHTML = `<span>🛳 ${esc(trip.ship)}</span><span>📍 ${esc(trip.destination)}</span><span>${n} 天 ${Math.max(0, n - 1)} 夜</span><span>${ports} 個靠港</span><span>${places} 個地點</span><span>${travelers()} 位旅客</span>`;
    const g = grandTotal();
    const sym = cur(trip.settleCurrency).symbol;
    $('#totalvalue').textContent = ui.showTotal ? sym + g.total.toLocaleString('zh-TW') + (g.pending ? '+' : '') : '＊＊＊＊';
    const eye = $('#eye'); eye.innerHTML = ui.showTotal ? EYE_OPEN : EYE_SHUT;
    eye.setAttribute('aria-pressed', String(ui.showTotal)); eye.setAttribute('aria-label', ui.showTotal ? '隱藏總花費' : '顯示總花費');
  }

  /* ---------- 規劃頁：日期站點 ---------- */
  function datesHTML() {
    const n = trip.days.length;
    const half = 0.5 / n;
    const stations = trip.days.map((d, i) => {
      const L = dateLabel(d.date);
      return `<button type="button" class="datestation${ui.bounceIdx === i ? ' bounce' : ''}" data-idx="${i}" aria-pressed="${i === ui.dayIdx}" aria-label="${L.md} 星期${L.wd} ${esc(d.port)}"><span class="dot">${L.day}</span><span class="dlabel">${L.md}（${L.wd}）</span><span class="dport">${esc(d.port)}${d.portType === 'sea' ? '・海上' : ''}</span></button>`;
    }).join('');
    const d = trip.days[ui.dayIdx];
    const keys = window.Illus.pickForDay(d, itemsOn(d.date));
    return `<div class="timeline-dates" style="--n:${n}"><style>.timeline-dates::before{left:calc(10px + (100% - 20px) * ${half});right:calc(10px + (100% - 20px) * ${half});}</style>${stations}<div class="date-illus" data-keys="${keys.join(',')}">${window.Illus.daySVG(keys)}</div></div>`;
  }
  function placeIllus() {
    const el = $('.date-illus'); if (!el) return;
    const n = trip.days.length;
    const pos = i => `calc(10px + (100% - 20px) * ${(i + 0.5) / n})`;
    if (ui.prevDayIdx != null && ui.prevDayIdx !== ui.dayIdx && !reduceMotion()) {
      el.style.transition = 'none'; el.style.left = pos(ui.prevDayIdx);
      void el.offsetWidth; el.style.transition = '';
      requestAnimationFrame(() => { el.style.left = pos(ui.dayIdx); el.classList.add('hop'); });
    } else el.style.left = pos(ui.dayIdx);
    ui.prevDayIdx = ui.dayIdx; ui.bounceIdx = null;
  }

  /* ---------- 規劃頁：週檢視 ---------- */
  function globalRange() {
    let lo = 24 * 60, hi = 0;
    trip.items.forEach(i => { lo = Math.min(lo, toMin(i.start)); hi = Math.max(hi, endMin(i)); });
    trip.days.forEach(d => ['arrive', 'depart', 'allAboard'].forEach(k => { if (d[k]) { lo = Math.min(lo, toMin(d[k])); hi = Math.max(hi, toMin(d[k])); } }));
    if (lo > hi) { lo = 8 * 60; hi = 22 * 60; }
    return { lo: Math.max(0, Math.floor(lo / 60) * 60 - 60), hi: Math.min(24 * 60, Math.ceil(hi / 60) * 60) };
  }
  function layoutCols(items) {
    const placed = []; let cluster = []; let clusterEnd = -1;
    const flush = () => { const cols = Math.max(...cluster.map(c => c.col)) + 1; cluster.forEach(c => { c.cols = cols; }); cluster = []; };
    items.forEach(it => {
      const s = toMin(it.start), e = endMin(it);
      if (s >= clusterEnd && cluster.length) flush();
      const used = cluster.filter(c => c.e > s).map(c => c.col);
      let col = 0; while (used.includes(col)) col++;
      const o = { it, s, e, col, cols: 1 }; cluster.push(o); placed.push(o); clusterEnd = Math.max(clusterEnd, e);
    });
    if (cluster.length) flush();
    return placed;
  }
  function weekHTML() {
    const { lo, hi } = globalRange();
    const H = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour')) || 52;
    const px = m => (m - lo) / 60 * H;
    const height = px(hi);
    const n = trip.days.length;
    let html = `<div class="weekwrap"><div class="weekgrid" style="grid-template-columns:44px repeat(${n}, minmax(72px, 1fr))">`;
    html += `<div class="weekhead"></div>`;
    trip.days.forEach((d, i) => { const L = dateLabel(d.date); html += `<div class="weekhead${i === ui.dayIdx ? ' sel' : ''}">${L.md}（${L.wd}）<small>${esc(d.port)}・${tzShort(d.tz)}</small></div>`; });
    html += `<div class="timegutter" style="height:${height}px">`;
    for (let m = lo + 60; m < hi; m += 60) html += `<span style="top:${px(m)}px">${fmt(m)}</span>`;
    html += `</div>`;
    trip.days.forEach((d, i) => {
      const info = computeDay(d.date);
      html += `<div class="daycol${i === ui.dayIdx ? ' sel' : ''}" data-date="${d.date}" style="height:${height}px">`;
      for (let m = lo + 60; m < hi; m += 60) html += `<div class="hourline" style="top:${px(m)}px"></div>`;
      if (d.portType === 'port' && d.arrive && d.depart) html += `<div class="portband" style="top:${px(toMin(d.arrive))}px;height:${px(toMin(d.depart)) - px(toMin(d.arrive))}px" title="靠港 ${d.arrive}–${d.depart}"></div>`;
      if (d.allAboard) html += `<div class="aboardline" style="top:${px(toMin(d.allAboard))}px"><span>All aboard ${d.allAboard}</span></div>`;
      layoutCols(info.items).forEach(o => {
        const it = o.it; const w = 100 / o.cols;
        const warn = info.warns[it.id];
        html += `<div class="ev cat-${it.category}${it.locked ? ' locked' : ''}${warn ? ' warn' : ''}" tabindex="0" data-id="${it.id}" style="top:${px(o.s)}px;height:${Math.max(18, px(o.e) - px(o.s) - 2)}px;left:calc(${o.col * w}% + 2px);width:calc(${w}% - 4px)" title="${esc(it.title)}${warn ? '\n⚠ ' + esc(warn.join('；')) : ''}"><span class="evtime">${it.start}</span> <span class="evtitle">${esc(it.title)}</span><div class="resize" aria-hidden="true"></div></div>`;
      });
      const now = nowIn(d.tz);
      if (now.date === d.date && now.min >= lo && now.min <= hi) html += `<div class="nowline" style="top:${px(now.min)}px"><span>${fmt(now.min)}</span></div>`;
      html += `</div>`;
    });
    html += `</div></div>`;
    return { html, lo, H };
  }

  /* ---------- 規劃頁：單日時間軸 ---------- */
  function legIcon(mode, size) {
    const m = MODES[mode] || MODES.walk;
    return `<span class="legicon" style="background:${m.color}" title="${m.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${MODE_ICON[mode] || MODE_ICON.walk}</svg></span>`;
  }
  function dayRange(info) {
    const d = info.day; let lo = 24 * 60, hi = 0;
    info.items.forEach(i => { lo = Math.min(lo, toMin(i.start)); hi = Math.max(hi, endMin(i)); });
    if (lo > hi) { lo = 8 * 60; hi = 20 * 60; }
    return { lo, hi: Math.max(hi, lo + 30) };
  }
  function dayHTML() {
    const d = trip.days[ui.dayIdx];
    const info = computeDay(d.date);
    const { lo, hi } = dayRange(info);
    const pct = m => ((m - lo) / (hi - lo) * 100).toFixed(3) + '%';
    // 前言：港口資訊
    let intro = `<div class="timeline-intro"><div class="portcard"><b>${esc(d.port)}</b>`;
    const typ = { embark: '登船日', disembark: '下船日', port: '靠港日', sea: '海上航行日' }[d.portType] || '';
    intro += `<span class="portchip">${typ}・${tzShort(d.tz)}</span>`;
    if (d.arrive) intro += `<span class="portchip">抵達 ${d.arrive}</span>`;
    if (d.depart) intro += `<span class="portchip">離港 ${d.depart}</span>`;
    if (d.allAboard) intro += `<span class="portchip aboard">All aboard ${d.allAboard}</span>`;
    if (d.safeReturn) intro += `<span class="portchip">安全回船線 ${d.safeReturn}</span>`;
    intro += `</div>`;
    if (d.portType === 'port' && d.arrive && (d.safeReturn || d.allAboard)) {
      const shore = toMin(d.safeReturn || d.allAboard) - toMin(d.arrive);
      intro += `<div class="shoretime">可上岸時間約 ${durText(shore)}（表定抵達到${d.safeReturn ? '安全回船線' : 'All aboard'}，未扣下船入境排隊）</div>`;
    }
    if (d.note) intro += `<div class="shoretime">📝 ${esc(d.note)}</div>`;
    const allWarns = Object.entries(info.warns);
    if (allWarns.length) intro += `<ul class="warnlist">${allWarns.map(([id, ws]) => { const it = trip.items.find(x => x.id === id); return `<li>${esc(it.title)}：${esc(ws.join('；'))}</li>`; }).join('')}</ul>`;
    intro += `</div>`;

    // 左側比例時間軸
    let scale = `<div class="day-time-scale" aria-hidden="true"><div class="rail"></div>`;
    const firstHour = Math.ceil(lo / 60) * 60;
    for (let m = firstHour; m <= hi; m += 60) if (m - lo > 20 && hi - m > 20) scale += `<span class="tick" style="top:${pct(m)}">${m / 60}</span>`;
    info.items.forEach(it => { scale += `<span class="seg cat-${it.category}" style="top:${pct(toMin(it.start))};height:calc(${pct(endMin(it))} - ${pct(toMin(it.start))})"></span>`; });
    scale += `<span class="endlabel" style="top:-14px">${fmt(lo)}</span><span class="endlabel" style="top:calc(100% + 2px)">${fmt(hi)}</span>`;
    scale += `<span class="scale-dot" style="top:0"></span><span class="scale-now" hidden><span></span></span></div>`;

    // 卡片
    let cards = `<div class="timeline-cards">`;
    info.items.forEach(it => {
      const leg = info.legs.find(l => l.to === it);
      if (leg) {
        const walk = leg.mode === 'walk';
        cards += `<div class="timeline-time-row leg${walk ? ' walk' : ''}" data-min="${endMin(leg.from)}" data-leg="${esc(leg.key)}"><div class="rowtime">${fmt(endMin(leg.from))}</div><div class="timeline-card" tabindex="0" role="button" aria-label="交通：${esc(leg.from.title)} 到 ${esc(leg.to.title)}"><div class="legline">${legIcon(leg.mode)}<span>${walk ? `步行共 ${durText(Number(leg.minutes))}` : `${MODES[leg.mode].label} ${durText(Number(leg.minutes))}`}</span><span class="legmeta">${esc(leg.from.title)} → ${esc(leg.to.title)}</span>${leg.cost && leg.cost.amount != null ? `<span>${money(leg.cost.amount, leg.cost.currency)}／${perLabel[leg.cost.per]}</span>` : ''}${leg.estimated ? '<span class="tag est">估算</span>' : ''}</div></div></div>`;
      }
      const warn = info.warns[it.id];
      const cost = it.cost && it.cost.amount != null ? `${money(it.cost.amount, it.cost.currency)}／${perLabel[it.cost.per]}${statusTag(it.cost.status)}` : (it.cost && it.cost.status === 'pending' ? '<span class="tag pend">金額待填</span>' : '');
      cards += `<div class="timeline-time-row" data-id="${it.id}" data-min="${toMin(it.start)}"><div class="rowtime">${it.start}</div><div class="timeline-card cat-${it.category}" tabindex="0" role="button" aria-label="${esc(it.title)} ${it.start}"><h3>${esc(it.title)}${it.locked ? '<span class="tag lock">已鎖定</span>' : ''}${it.onboard ? '<span class="tag">船上</span>' : ''}</h3><div class="cardmeta"><span>${it.start}–${fmt(endMin(it))}・${durText(Number(it.duration))}</span><span>${CAT[it.category].label}</span>${it.address ? `<span>${esc(it.address)}</span>` : ''}${cost ? `<span>${cost}</span>` : ''}</div>${it.note ? `<div class="cardnote">${esc(it.note)}</div>` : ''}${warn ? `<div class="cardnote"><span class="tag warn">注意</span> ${esc(warn.join('；'))}</div>` : ''}</div></div>`;
    });
    if (!info.items.length) cards += `<p class="emptynote">這天還沒有行程，按「＋」新增。</p>`;
    cards += `</div>`;
    return { html: intro + `<div class="timeline-list" tabindex="0" aria-label="單日時間軸" data-lo="${lo}" data-hi="${hi}">${scale}${cards}</div>`, lo, hi };
  }

  function updateFocus() {
    const list = $('.timeline-list'); if (!list) return;
    const rows = $$('.timeline-time-row', list); if (!rows.length) return;
    const lr = list.getBoundingClientRect();
    const center = lr.top + lr.height / 2;
    let current;
    if (list.scrollTop <= 2) current = rows[0];
    else if (list.scrollTop + list.clientHeight >= list.scrollHeight - 2) current = rows[rows.length - 1];
    else {
      let best = Infinity;
      rows.forEach(r => { const rr = r.getBoundingClientRect(); const dd = Math.abs(rr.top + rr.height / 2 - center); if (dd < best) { best = dd; current = r; } });
    }
    const cr = current.getBoundingClientRect(); const cc = cr.top + cr.height / 2;
    rows.forEach(r => {
      const rr = r.getBoundingClientRect();
      const dd = Math.min(1, Math.abs(rr.top + rr.height / 2 - cc) / (lr.height * 0.55));
      r.style.setProperty('--d', r === current ? 0 : dd.toFixed(3));
      r.classList.toggle('timeline-current', r === current);
      r.classList.toggle('above', rr.top < cr.top);
    });
    const lo = +list.dataset.lo, hi = +list.dataset.hi;
    const dot = $('.scale-dot', list);
    let p;
    if (current === rows[0] && list.scrollTop <= 2) p = 0;
    else if (current === rows[rows.length - 1] && list.scrollTop + list.clientHeight >= list.scrollHeight - 2) p = 1;
    else p = (Number(current.dataset.min) - lo) / (hi - lo);
    dot.style.top = (Math.max(0, Math.min(1, p)) * 100) + '%';
  }
  function updateNow() {
    // 週檢視：重繪紅線
    if (ui.page === 'plan' && ui.view === 'week') {
      const { lo, hi } = globalRange(); const H = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour')) || 52;
      $$('.daycol').forEach(col => {
        const d = dayOf(col.dataset.date); const now = nowIn(d.tz);
        let line = $('.nowline', col);
        if (now.date === d.date && now.min >= lo && now.min <= hi) {
          if (!line) { line = document.createElement('div'); line.className = 'nowline'; line.innerHTML = '<span></span>'; col.appendChild(line); }
          line.style.top = ((now.min - lo) / 60 * H) + 'px'; line.firstChild.textContent = fmt(now.min);
        } else if (line) line.remove();
      });
    }
    const list = $('.timeline-list');
    if (list) {
      const d = trip.days[ui.dayIdx]; const now = nowIn(d.tz);
      const lo = +list.dataset.lo, hi = +list.dataset.hi; const el = $('.scale-now', list);
      if (now.date === d.date && now.min >= lo && now.min <= hi) { el.hidden = false; el.style.top = ((now.min - lo) / (hi - lo) * 100) + '%'; el.firstChild.textContent = fmt(now.min); }
      else el.hidden = true;
    }
  }

  /* ---------- 地圖 ---------- */
  let map = null, layer = null;
  function initMap() {
    if (map || !window.L) return;
    const LAND = window.__LAND || null;
    map = L.map('map', { zoomControl: true, attributionControl: true, maxZoom: LAND ? 15 : 19 });
    if (!EMBED) L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    else if (LAND) {
      // 線上版：內嵌的陸地輪廓（Natural Earth，公有領域），海面用水色
      $('#map').classList.add('landmap');
      L.polygon(LAND, { color: '#8E9A9C', weight: 1, fillColor: '#F1EEE6', fillOpacity: 1, interactive: false }).addTo(map);
      map.attributionControl.addAttribution('海岸線 Natural Earth');
    } else $('#map').classList.add('notiles');
    layer = L.layerGroup().addTo(map);
  }
  function gmaps(it) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.lat + ',' + it.lng)}`; }
  function renderMap() {
    const d = trip.days[ui.dayIdx]; const info = computeDay(d.date);
    $$('.mapbuttons button').forEach(b => b.classList.toggle('active', (b.id === 'previewroute' && ui.mapMode === 'route') || (b.id === 'fit' && ui.mapMode === 'fit') || (b.id === 'voyage' && ui.mapMode === 'voyage')));
    if (!window.L) {
      const pts = info.items.filter(hasLoc);
      $('#map').innerHTML = `<div class="mapfallback"><p>地圖服務暫時無法載入，改用外部地圖連結：</p>${pts.map(p => `<a href="${gmaps(p)}" target="_blank" rel="noopener">📍 ${esc(p.title)}</a>`).join('') || '<p>這天沒有上岸地點。</p>'}</div>`;
      return;
    }
    initMap(); layer.clearLayers();
    const bounds = [];
    if (ui.mapMode === 'voyage') {
      const pts = trip.days.map(x => [x.lat, x.lng]);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1]; if (a[0] === b[0] && a[1] === b[1]) continue;
        const mid = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.12, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.12];
        const curve = []; for (let t = 0; t <= 1.0001; t += 0.05) curve.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1]]);
        L.polyline(curve, { color: MODES.ship.color, weight: 4, dashArray: '2 8', lineCap: 'round' }).addTo(layer);
      }
      const seen = {};
      trip.days.forEach((x, i) => {
        const k = x.lat + ',' + x.lng; seen[k] = (seen[k] || []).concat(dateLabel(x.date).md);
        bounds.push([x.lat, x.lng]);
      });
      Object.entries(seen).forEach(([k, labels]) => {
        const [la, ln] = k.split(',').map(Number); const port = trip.days.find(x => x.lat === la && x.lng === ln).port;
        L.marker([la, ln], { icon: L.divIcon({ className: '', html: '<div class="portpin">⚓</div>', iconSize: [30, 30], iconAnchor: [15, 15] }) }).bindTooltip(`${port}（${labels.join('、')}）`, { permanent: true, direction: 'right', offset: [14, 0] }).addTo(layer);
      });
      map.fitBounds(bounds, { padding: [40, 40] });
      return;
    }
    const pts = info.items.filter(hasLoc);
    const groups = {};
    pts.forEach((p, i) => { const k = p.lat.toFixed(4) + ',' + p.lng.toFixed(4); (groups[k] = groups[k] || []).push({ p, n: i + 1 }); });
    Object.values(groups).forEach(g => {
      const p = g[0].p; const sel = g.some(x => x.p.id === ui.selected);
      const color = CAT[p.category].color;
      const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="pin${sel ? ' sel' : ''}" style="background:${color}">${g.map(x => x.n).join(',')}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) });
      m.bindTooltip(g.map(x => `${x.p.start} ${esc(x.p.title)}`).join('<br>'));
      if (EMBED) m.bindPopup(g.map(x => `${x.p.start} ${esc(x.p.title)}<br><a href="${gmaps(x.p)}" target="_blank" rel="noopener">在 Google 地圖開啟</a>`).join('<hr>'));
      m.on('click', () => selectItem(p.id, true));
      m.addTo(layer); bounds.push([p.lat, p.lng]);
    });
    let focusLegs = info.legs;
    if (ui.mapMode === 'route' && ui.selected) { const f = info.legs.filter(l => l.to.id === ui.selected || l.from.id === ui.selected); if (f.length) focusLegs = f; }
    info.legs.forEach(l => {
      const active = focusLegs.includes(l);
      L.polyline([[l.from.lat, l.from.lng], [l.to.lat, l.to.lng]], { color: MODES[l.mode].color, weight: active ? 5 : 3, opacity: active ? 0.95 : 0.35, dashArray: l.mode === 'walk' ? '3 7' : null, lineCap: 'round' })
        .bindTooltip(`${MODES[l.mode].label} ${durText(Number(l.minutes))}`).addTo(layer);
    });
    if (ui.mapMode === 'route' && focusLegs.length && focusLegs !== info.legs) {
      const b = []; focusLegs.forEach(l => { b.push([l.from.lat, l.from.lng], [l.to.lat, l.to.lng]); }); map.fitBounds(b, { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    else if (bounds.length === 1) map.setView(bounds[0], 14);
    else map.setView([d.lat, d.lng], 12);
    setTimeout(() => map.invalidateSize(), 50);
  }
  function renderRoutes() {
    const d = trip.days[ui.dayIdx]; const info = computeDay(d.date);
    $('#routecount').textContent = `${dateLabel(d.date).md}・${info.legs.length} 段`;
    $('#routelist').innerHTML = info.legs.length ? info.legs.map(l => `<div class="legrow" tabindex="0" role="button" data-leg="${esc(l.key)}" aria-label="編輯交通：${esc(l.from.title)} 到 ${esc(l.to.title)}">${legIcon(l.mode)}<div><div>${esc(l.from.title)} → ${esc(l.to.title)}</div><div class="legmeta">${MODES[l.mode].label}・${durText(Number(l.minutes))}${l.km ? `・約 ${l.km.toFixed(1)} km` : ''}${l.estimated ? '<span class="tag est">估算</span>' : '<span class="tag">已編輯</span>'}</div></div><div class="legcost">${l.cost && l.cost.amount != null ? `${money(l.cost.amount, l.cost.currency)}<div class="legmeta">${perLabel[l.cost.per]}</div>` : '—'}</div></div>`).join('') : '<p class="emptynote">這天沒有上岸移動（船上行程不計交通）。</p>';
  }

  /* ---------- 規劃頁組裝 ---------- */
  function renderPlan() {
    const d = trip.days[ui.dayIdx];
    $('#yearmonth').textContent = dateLabel(d.date).ym;
    $$('.calendar-viewtoggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === ui.view)));
    $('#workspace').classList.toggle('timelinepreview', ui.view === 'day');
    $('#undo').disabled = !history.length;
    const cal = $('#calendar');
    const keepScroll = ui.view === 'week' && $('.weekwrap') ? $('.weekwrap').scrollTop : null;
    const listScroll = ui.view === 'day' && $('.timeline-list') ? $('.timeline-list').scrollTop : null;
    if (ui.view === 'week') {
      const w = weekHTML(); cal.innerHTML = datesHTML() + w.html;
      const wrap = $('.weekwrap');
      if (keepScroll != null) wrap.scrollTop = keepScroll;
      bindWeek(w.lo, w.H);
    } else {
      const v = dayHTML(); cal.innerHTML = datesHTML() + v.html;
      bindDay(listScroll);
    }
    placeIllus();
    renderMap(); renderRoutes(); updateNow();
  }

  function selectItem(id, scroll) {
    ui.selected = id;
    const it = trip.items.find(x => x.id === id); if (!it) return;
    const idx = trip.days.findIndex(d => d.date === it.date);
    if (idx !== ui.dayIdx) { ui.bounceIdx = idx; ui.dayIdx = idx; renderPlan(); }
    else renderMap();
    if (scroll && ui.view === 'day') {
      const row = $(`.timeline-time-row[data-id="${id}"]`); const list = $('.timeline-list');
      if (row && list) list.scrollTo({ top: row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
    $$('.ev').forEach(e => e.style.outline = e.dataset.id === id ? '3px solid #8C5D00' : '');
  }

  /* 週檢視互動：單擊預覽、雙擊編輯、長按 3 秒拖移、底部把手調整時長 */
  let suppressClick = false;
  function bindWeek(lo, H) {
    const snap = m => Math.round(m / 15) * 15;
    $$('.ev').forEach(ev => {
      const id = ev.dataset.id; const it = () => trip.items.find(x => x.id === id);
      let holdTimer = null, dragging = false, sx = 0, sy = 0, startTop = 0, ptype = 'mouse', targetDate = null;
      ev.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        ptype = e.pointerType;
        if (e.target.classList.contains('resize')) return startResize(e);
        if (ptype === 'touch') return;
        sx = e.clientX; sy = e.clientY; startTop = parseFloat(ev.style.top);
        ev.classList.add('holding');
        holdTimer = setTimeout(() => {
          ev.classList.remove('holding'); holdTimer = null;
          if (it().locked) { ev.classList.add('shake'); setTimeout(() => ev.classList.remove('shake'), 320); toast('這是已預約的鎖定行程，先在編輯中解除鎖定才能移動'); return; }
          dragging = true; ev.classList.add('dragging'); try { ev.setPointerCapture(e.pointerId); } catch (_) { } hidePopover();
        }, 3000);
      });
      ev.addEventListener('pointermove', e => {
        if (holdTimer && (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6)) { clearTimeout(holdTimer); holdTimer = null; ev.classList.remove('holding'); }
        if (!dragging) return;
        const top = Math.max(0, startTop + (e.clientY - sy));
        const m = snap(lo + top / H * 60);
        ev.style.top = ((m - lo) / 60 * H) + 'px';
        ev.querySelector('.evtime').textContent = fmt(m);
        ev.style.pointerEvents = 'none';
        const under = document.elementFromPoint(e.clientX, e.clientY); ev.style.pointerEvents = '';
        const col = under && under.closest('.daycol');
        if (col && col !== ev.parentElement) { col.appendChild(ev); }
        targetDate = ev.parentElement.dataset.date;
      });
      const end = () => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        ev.classList.remove('holding');
        if (!dragging) return;
        dragging = false; suppressClick = true; setTimeout(() => { suppressClick = false; }, 300);
        const m = snap(lo + parseFloat(ev.style.top) / H * 60);
        const nd = targetDate || it().date;
        if (fmt(m) !== it().start || nd !== it().date) commit(t => { const x = t.items.find(y => y.id === id); x.start = fmt(m); x.date = nd; }, `已移到 ${dateLabel(nd).md} ${fmt(m)}，相鄰交通已重算`);
        else render();
      };
      ev.addEventListener('pointerup', end); ev.addEventListener('pointercancel', end);
      ev.addEventListener('click', e => {
        if (suppressClick || e.target.classList.contains('resize')) return;
        if (ptype === 'touch' || window.matchMedia('(hover: none)').matches) { openItemEditor(id); return; }
        selectItem(id); showPopover(ev, it());
      });
      ev.addEventListener('dblclick', () => { hidePopover(); openItemEditor(id); });
      ev.addEventListener('keydown', e => { if (e.key === 'Enter') openItemEditor(id); if (e.key === ' ') { e.preventDefault(); selectItem(id); showPopover(ev, it()); } });
      function startResize(e) {
        e.stopPropagation(); e.preventDefault();
        if (it().locked) { toast('鎖定行程不能調整時長'); return; }
        const y0 = e.clientY, h0 = parseFloat(ev.style.height), d0 = Number(it().duration);
        try { ev.setPointerCapture(e.pointerId); } catch (_) { }
        const mv = me => { const dur = Math.max(15, snap(d0 + (me.clientY - y0) / H * 60)); ev.style.height = (dur / 60 * H - 2) + 'px'; ev.dataset.dur = dur; };
        const up = () => {
          ev.removeEventListener('pointermove', mv); ev.removeEventListener('pointerup', up);
          suppressClick = true; setTimeout(() => { suppressClick = false; }, 300);
          const dur = Number(ev.dataset.dur || d0);
          if (dur !== d0) commit(t => { t.items.find(y => y.id === id).duration = dur; }, `時長改為 ${durText(dur)}`);
        };
        ev.addEventListener('pointermove', mv); ev.addEventListener('pointerup', up);
        void h0;
      }
    });
    $$('.daycol').forEach(col => col.addEventListener('dblclick', e => {
      if (e.target !== col && !e.target.classList.contains('hourline') && !e.target.classList.contains('portband')) return;
      const r = col.getBoundingClientRect(); const m = snap(lo + (e.clientY - r.top) / H * 60);
      openItemEditor(null, { date: col.dataset.date, start: fmt(m) });
    }));
  }

  function bindDay(prevScroll) {
    const list = $('.timeline-list'); if (!list) return;
    let raf = null;
    list.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; updateFocus(); }); });
    list.addEventListener('wheel', e => {
      if (!e.deltaY) return;
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? list.clientHeight : 1);
      list.scrollBy({ top: Math.max(-32, Math.min(32, dy)), behavior: 'auto' });
    }, { passive: false });
    $$('.timeline-time-row', list).forEach(row => {
      const card = $('.timeline-card', row);
      const open = () => row.dataset.leg ? openLegEditor(row.dataset.leg) : openItemEditor(row.dataset.id);
      card.addEventListener('click', () => {
        if (window.matchMedia('(hover: none)').matches) { open(); return; }
        if (row.dataset.id) { selectItem(row.dataset.id); showPopover(card, trip.items.find(x => x.id === row.dataset.id)); }
        list.scrollTo({ top: row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
      });
      card.addEventListener('dblclick', () => { hidePopover(); open(); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    });
    if (prevScroll != null) list.scrollTop = prevScroll;
    else if (ui.selected) { const row = $(`.timeline-time-row[data-id="${ui.selected}"]`, list); if (row) list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2; }
    updateFocus();
  }

  /* ---------- 預覽浮窗 ---------- */
  function showPopover(anchor, it) {
    const p = $('#popover');
    const info = computeDay(it.date);
    const warn = info.warns[it.id];
    p.innerHTML = `<h3>${esc(it.title)}</h3><div>${it.start}–${fmt(endMin(it))}・${durText(Number(it.duration))}</div><div>${CAT[it.category].label}${it.locked ? '・已鎖定' : ''}</div>${it.address ? `<div>${esc(it.address)}</div>` : ''}${it.cost ? `<div>${it.cost.amount != null ? money(it.cost.amount, it.cost.currency) + '／' + perLabel[it.cost.per] : '金額未填'} ${statusTag(it.cost.status)}</div>` : ''}${warn ? `<div style="color:#A33C32">⚠ ${esc(warn.join('；'))}</div>` : ''}${hasLoc(it) ? `<div><a href="${gmaps(it)}" target="_blank" rel="noopener">在 Google 地圖開啟</a></div>` : ''}<div class="hint">雙擊編輯・按住 3 秒可拖移</div>`;
    p.hidden = false;
    const r = anchor.getBoundingClientRect();
    const w = p.offsetWidth, h = p.offsetHeight;
    let x = r.right + 8, y = r.top;
    if (x + w > innerWidth - 8) x = Math.max(8, r.left - w - 8);
    if (y + h > innerHeight - 8) y = innerHeight - h - 8;
    p.style.left = x + 'px'; p.style.top = Math.max(8, y) + 'px';
  }
  function hidePopover() { $('#popover').hidden = true; }

  /* ---------- 編輯表單 ---------- */
  function openItemEditor(id, preset) {
    const isNew = !id;
    const it = isNew ? Object.assign({ id: uid('i'), date: trip.days[ui.dayIdx].date, start: '10:00', duration: 60, category: 'sight', title: '', address: '', lat: '', lng: '', onboard: false, cost: null, note: '', locked: false }, preset || {}) : JSON.parse(JSON.stringify(trip.items.find(x => x.id === id)));
    const c = it.cost || { amount: '', currency: trip.days.find(d => d.date === it.date).tz === 'Asia/Tokyo' ? 'JPY' : 'TWD', per: 'person', status: 'estimate' };
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="itemform"><div class="dlghead"><h2>${isNew ? '新增行程' : '編輯行程'}</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody">
        <label class="full">名稱<input name="title" required value="${esc(it.title)}"></label>
        <label>日期<select name="date">${trip.days.map(d => `<option value="${d.date}"${d.date === it.date ? ' selected' : ''}>${dateLabel(d.date).md} ${esc(d.port)}</option>`).join('')}</select></label>
        <label>類別<select name="category">${Object.entries(CAT).map(([k, v]) => `<option value="${k}"${k === it.category ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label>開始時間（當地）<input type="time" name="start" required value="${it.start}"></label>
        <label>時長（分鐘）<input type="number" name="duration" min="5" step="5" required value="${it.duration}"></label>
        <label class="full">地址<input name="address" value="${esc(it.address)}"></label>
        <label class="check full"><input type="checkbox" name="onboard"${it.onboard ? ' checked' : ''}> 船上活動（不在地圖標點、不算上岸交通）</label>
        <label>緯度<input name="lat" inputmode="decimal" value="${it.lat ?? ''}"></label>
        <label>經度<input name="lng" inputmode="decimal" value="${it.lng ?? ''}"></label>
        <label>金額<input type="number" name="amount" min="0" step="any" value="${c.amount ?? ''}" placeholder="未填"></label>
        <label>幣別<select name="currency">${Object.keys(trip.currencies).map(k => `<option${k === c.currency ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
        <label>計價<select name="per">${Object.entries(perLabel).map(([k, v]) => `<option value="${k}"${k === c.per ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>金額狀態<select name="status"><option value="confirmed"${c.status === 'confirmed' ? ' selected' : ''}>已確認</option><option value="estimate"${c.status === 'estimate' ? ' selected' : ''}>估算</option><option value="pending"${c.status === 'pending' ? ' selected' : ''}>待確認</option></select></label>
        <label class="full">備註<textarea name="note" rows="2">${esc(it.note)}</textarea></label>
        <label class="check full"><input type="checkbox" name="locked"${it.locked ? ' checked' : ''}> 已預約・鎖定時段（不可拖移）</label>
      </div>
      <div class="dlgfoot">${isNew ? '' : '<button type="button" class="btn danger" data-del>刪除</button>'}<button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    const f = $('#itemform');
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    const del = $('[data-del]', dlg);
    if (del) del.onclick = () => { dlg.close(); commit(t => { t.items = t.items.filter(x => x.id !== id); }, `已刪除「${it.title}」，可按復原`); };
    f.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(f);
      const lat = fd.get('lat').trim(), lng = fd.get('lng').trim();
      const amount = fd.get('amount');
      const upd = {
        id: it.id, title: fd.get('title').trim(), date: fd.get('date'), category: fd.get('category'), start: fd.get('start'), duration: Math.max(5, Number(fd.get('duration'))),
        address: fd.get('address').trim(), onboard: fd.get('onboard') === 'on', lat: lat === '' ? null : Number(lat), lng: lng === '' ? null : Number(lng),
        cost: (amount === '' && fd.get('status') !== 'pending') ? null : { amount: amount === '' ? null : Number(amount), currency: fd.get('currency'), per: fd.get('per'), status: fd.get('status') },
        note: fd.get('note').trim(), locked: fd.get('locked') === 'on'
      };
      dlg.close();
      commit(t => { const i = t.items.findIndex(x => x.id === upd.id); if (i >= 0) t.items[i] = upd; else t.items.push(upd); }, isNew ? `已新增「${upd.title}」` : `已更新「${upd.title}」，相鄰交通已重算`);
      ui.selected = upd.id; const di = trip.days.findIndex(d => d.date === upd.date); if (di !== ui.dayIdx) { ui.dayIdx = di; ui.bounceIdx = di; render(); }
    };
  }
  function findLeg(key) { for (const d of trip.days) { const l = computeDay(d.date).legs.find(x => x.key === key); if (l) return l; } return null; }
  function openLegEditor(key) {
    const l = findLeg(key); if (!l) return;
    const c = l.cost || { amount: '', currency: 'JPY', per: 'vehicle', status: 'estimate' };
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="legform"><div class="dlghead"><h2>編輯交通</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody"><p class="full" style="grid-column:1/-1;margin:0">${esc(l.from.title)} → ${esc(l.to.title)}${l.km ? `（直線換算約 ${l.km.toFixed(1)} km）` : ''}</p>
        <label>交通方式<select name="mode">${Object.entries(MODES).filter(([k]) => k !== 'ship').map(([k, v]) => `<option value="${k}"${k === l.mode ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label>時長（分鐘）<input type="number" name="minutes" min="0" value="${l.minutes}"></label>
        <label>金額<input type="number" name="amount" min="0" step="any" value="${c.amount ?? ''}" placeholder="未填"></label>
        <label>幣別<select name="currency">${Object.keys(trip.currencies).map(k => `<option${k === c.currency ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
        <label>計價<select name="per">${Object.entries(perLabel).map(([k, v]) => `<option value="${k}"${k === c.per ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>金額狀態<select name="status"><option value="confirmed"${c.status === 'confirmed' ? ' selected' : ''}>已確認</option><option value="estimate"${c.status === 'estimate' ? ' selected' : ''}>估算</option><option value="pending"${c.status === 'pending' ? ' selected' : ''}>待確認</option></select></label>
      </div>
      <div class="dlgfoot">${l.estimated ? '' : '<button type="button" class="btn danger" data-reset>改回估算</button>'}<button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    const rs = $('[data-reset]', dlg); if (rs) rs.onclick = () => { dlg.close(); commit(t => { delete t.legOverrides[key]; }, '已改回系統估算'); };
    $('#legform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); const amount = fd.get('amount');
      dlg.close();
      commit(t => { t.legOverrides[key] = { mode: fd.get('mode'), minutes: Number(fd.get('minutes')), cost: amount === '' ? null : { amount: Number(amount), currency: fd.get('currency'), per: fd.get('per'), status: fd.get('status') } }; }, '交通已更新，前後行程已重新檢查');
    };
  }
  function openFixedEditor(id) {
    const isNew = !id;
    const f0 = isNew ? { id: uid('f'), name: '', category: 'stay', amount: null, currency: trip.settleCurrency, per: 'person', status: 'pending', note: '' } : JSON.parse(JSON.stringify(trip.fixedCosts.find(x => x.id === id)));
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="fixform"><div class="dlghead"><h2>${isNew ? '新增固定費用' : '編輯固定費用'}</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody"><label class="full">項目<input name="name" required value="${esc(f0.name)}"></label>
        <label>類別<select name="category">${Object.entries(EXP_CAT).map(([k, v]) => `<option value="${k}"${k === f0.category ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label>金額<input type="number" name="amount" min="0" step="any" value="${f0.amount ?? ''}" placeholder="未填"></label>
        <label>幣別<select name="currency">${Object.keys(trip.currencies).map(k => `<option${k === f0.currency ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
        <label>計價<select name="per">${Object.entries(perLabel).map(([k, v]) => `<option value="${k}"${k === f0.per ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>狀態<select name="status"><option value="confirmed"${f0.status === 'confirmed' ? ' selected' : ''}>已確認</option><option value="estimate"${f0.status === 'estimate' ? ' selected' : ''}>估算</option><option value="pending"${f0.status === 'pending' ? ' selected' : ''}>待確認</option></select></label>
        <label class="full">備註<input name="note" value="${esc(f0.note)}"></label></div>
      <div class="dlgfoot">${isNew ? '' : '<button type="button" class="btn danger" data-del>刪除</button>'}<button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    const del = $('[data-del]', dlg); if (del) del.onclick = () => { dlg.close(); commit(t => { t.fixedCosts = t.fixedCosts.filter(x => x.id !== id); }, '已刪除費用'); };
    $('#fixform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); const a = fd.get('amount');
      const upd = { id: f0.id, name: fd.get('name').trim(), category: fd.get('category'), amount: a === '' ? null : Number(a), currency: fd.get('currency'), per: fd.get('per'), status: fd.get('status'), note: fd.get('note').trim() };
      dlg.close();
      commit(t => { const i = t.fixedCosts.findIndex(x => x.id === upd.id); if (i >= 0) t.fixedCosts[i] = upd; else t.fixedCosts.push(upd); }, '費用已更新');
    };
  }
  function openSettings() {
    const dlg = $('#editor');
    const rates = Object.entries(trip.currencies).filter(([k]) => k !== trip.settleCurrency);
    dlg.innerHTML = `<form method="dialog" id="setform"><div class="dlghead"><h2>旅客與匯率</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody"><label>成人<input type="number" name="adults" min="0" value="${trip.travelers.adults}"></label><label>兒童<input type="number" name="children" min="0" value="${trip.travelers.children || 0}"></label>
      ${rates.map(([k, v]) => `<label class="full">1 ${k} = ? ${trip.settleCurrency}<input type="number" name="rate-${k}" step="any" min="0" value="${v.rate}"></label>`).join('')}</div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#setform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); dlg.close();
      commit(t => { t.travelers.adults = Number(fd.get('adults')); t.travelers.children = Number(fd.get('children')); rates.forEach(([k]) => { t.currencies[k].rate = Number(fd.get('rate-' + k)); t.currencies[k].rateNote = '使用者設定'; }); }, '旅客與匯率已更新，預算已重算');
    };
  }

  /* ---------- 費用頁 ---------- */
  function expenseLines() {
    const lines = [];
    const push = (o, cost, src) => {
      const total = lineTotal(cost);
      lines.push(Object.assign({ cost, total, settle: total == null ? null : total * cur(cost.currency).rate, src }, o));
    };
    trip.fixedCosts.forEach(f => push({ id: f.id, kind: 'fixed', name: f.name, cat: f.category, date: '', note: f.note }, { amount: f.amount, currency: f.currency, per: f.per, status: f.status }));
    trip.days.forEach(d => {
      const info = computeDay(d.date);
      info.items.forEach(it => { if (it.cost && !(it.cost.amount === 0 && it.cost.status === 'confirmed')) push({ id: it.id, kind: 'item', name: it.title, cat: it.category, date: d.date, note: it.note }, it.cost); });
      info.legs.forEach(l => { if (l.cost) push({ id: l.key, kind: 'leg', name: `${MODES[l.mode].label}：${l.from.title} → ${l.to.title}`, cat: 'transport', date: d.date, note: '' }, l.cost); });
    });
    return lines;
  }
  function pieSVG(parts) {
    const total = parts.reduce((s, p) => s + p.v, 0);
    if (!total) return `<svg class="pie" viewBox="0 0 200 200" role="img" aria-label="尚無金額"><circle cx="100" cy="100" r="80" fill="#fff" stroke="#3E3A39" stroke-width="3"/><text x="100" y="105" text-anchor="middle" font-size="14" fill="#7a7270">尚無金額</text></svg>`;
    let a0 = -Math.PI / 2; let out = '';
    parts.forEach(p => {
      if (!p.v) return;
      const a1 = a0 + p.v / total * Math.PI * 2;
      if (p.v === total) out += `<circle cx="100" cy="100" r="82" fill="${p.color}" stroke="#3E3A39" stroke-width="3"/>`;
      else {
        const x0 = 100 + 82 * Math.cos(a0), y0 = 100 + 82 * Math.sin(a0), x1 = 100 + 82 * Math.cos(a1), y1 = 100 + 82 * Math.sin(a1);
        out += `<path d="M100 100 L${x0.toFixed(2)} ${y0.toFixed(2)} A82 82 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${p.color}" stroke="#3E3A39" stroke-width="3" stroke-linejoin="round"/>`;
      }
      a0 = a1;
    });
    return `<svg class="pie" viewBox="0 0 200 200" role="img" aria-label="支出組成圓餅圖">${out}<circle cx="100" cy="100" r="34" fill="#FFFCF6" stroke="#3E3A39" stroke-width="3"/></svg>`;
  }
  function renderExpenses() {
    const lines = expenseLines();
    const sc = trip.settleCurrency;
    const byCur = {};
    lines.forEach(l => { if (l.total != null) byCur[l.cost.currency] = (byCur[l.cost.currency] || 0) + l.total; });
    const settleTotal = Math.round(lines.reduce((s, l) => s + (l.settle || 0), 0));
    const pending = lines.filter(l => l.total == null);
    const estimated = lines.filter(l => l.total != null && l.cost.status === 'estimate');
    const byCat = Object.keys(EXP_CAT).map(k => ({ k, v: lines.filter(l => l.cat === k).reduce((s, l) => s + (l.settle || 0), 0), color: EXP_CAT[k].color, label: EXP_CAT[k].label }));
    const tot = byCat.reduce((s, c) => s + c.v, 0) || 1;
    const rateTxt = Object.entries(trip.currencies).filter(([k]) => k !== sc).map(([k, v]) => `1 ${k} ＝ ${v.rate} ${sc}${v.rateNote ? `（${esc(v.rateNote)}）` : ''}`).join('；');
    $('#expensespage').innerHTML = `<div class="expgrid">
      <div style="display:grid;gap:18px">
        <section class="sumcard"><h2>合計</h2>
          ${Object.keys(trip.currencies).map(k => `<div class="sumrow"><span>${k === sc ? '結算幣別' : '外幣'}合計（${k}）</span><span>${money(byCur[k] || 0, k)}</span></div>`).join('')}
          <div class="sumrow big"><span>換算總額</span><span>${money(settleTotal, sc)}${pending.length ? ' +' : ''}</span></div>
          <div class="ratenote">${rateTxt}。每筆先換算成 ${sc} 再合計，最後四捨五入。旅客 ${travelers()} 位、每車以 4 人計（${vehicles()} 車）。</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="setbtn" type="button">調整旅客與匯率</button><button class="btn primary" id="addfix" type="button">＋ 固定費用</button></div>
        </section>
        <div class="budgetwarn">⚠ ${pending.length} 筆金額待填、${estimated.length} 筆為估算。總額會隨確認而變動。${pending.length ? '<br>待填：' + pending.map(p => esc(p.name)).join('、') : ''}</div>
      </div>
      <section class="sumcard"><h2>支出組成</h2>
        <div class="pierow">${pieSVG(byCat)}<div class="legend">${byCat.map(c => `<div><i style="background:${c.color}"></i><span>${c.label}</span><span>${money(c.v, sc)}・${Math.round(c.v / tot * 100)}%</span></div>`).join('')}</div></div>
      </section>
    </div>
    <section class="sumcard" style="margin-top:18px"><h2>費用明細</h2><div class="tablewrap"><table class="exptable"><thead><tr><th>日期</th><th>項目</th><th>類別</th><th class="num">單價</th><th class="num">小計</th><th class="num">換算 ${sc}</th></tr></thead><tbody>
      ${lines.map(l => `<tr class="r-${l.cat}" data-kind="${l.kind}" data-id="${esc(l.id)}" tabindex="0"><td>${l.date ? dateLabel(l.date).md : '全程'}</td><td>${esc(l.name)} ${statusTag(l.cost.status)}</td><td>${EXP_CAT[l.cat].label}</td><td class="num">${l.cost.amount == null ? '未填' : money(l.cost.amount, l.cost.currency) + '／' + perLabel[l.cost.per]}</td><td class="num">${l.total == null ? '—' : money(l.total, l.cost.currency)}</td><td class="num">${l.settle == null ? '待估' : money(l.settle, sc)}</td></tr>`).join('')}
    </tbody></table></div></section>`;
    $('#setbtn').onclick = openSettings; $('#addfix').onclick = () => openFixedEditor(null);
    $$('.exptable tbody tr').forEach(tr => {
      const open = () => tr.dataset.kind === 'fixed' ? openFixedEditor(tr.dataset.id) : tr.dataset.kind === 'leg' ? openLegEditor(tr.dataset.id) : openItemEditor(tr.dataset.id);
      tr.onclick = open; tr.onkeydown = e => { if (e.key === 'Enter') open(); };
    });
  }

  /* ---------- 用品頁 ---------- */
  const PACK_COLORS = ['#F6D27A', '#A8D3E6', '#F2A497', '#B9DAA5', '#DED2ED', '#F4C7AA'];
  function renderPacking() {
    const all = trip.packing; const done = all.filter(p => p.done).length;
    const q = ui.packQuery.trim().toLowerCase();
    const show = p => (ui.packFilter === 'all' || (ui.packFilter === 'todo' ? !p.done : p.done)) && (!q || (p.name + p.note).toLowerCase().includes(q));
    const pg = $('#packingpage');
    const hadFocus = document.activeElement && document.activeElement.id === 'packsearch';
    pg.innerHTML = `<div class="packtop"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${done}"><i style="width:${all.length ? done / all.length * 100 : 0}%"></i><span>已準備 ${done} / ${all.length}</span></div>
      <input type="search" id="packsearch" placeholder="搜尋用品" value="${esc(ui.packQuery)}" aria-label="搜尋用品">
      <div class="filterbtns" role="group" aria-label="篩選">${[['all', '全部'], ['todo', '未完成'], ['done', '已完成']].map(([k, v]) => `<button type="button" data-f="${k}" aria-pressed="${ui.packFilter === k}">${v}</button>`).join('')}</div></div>
      <div class="packgrid">${trip.packingGroups.map((g, gi) => {
        const items = all.filter(p => p.group === g.id); const vis = items.filter(show); const gd = items.filter(p => p.done).length;
        return `<section class="packcard"><header style="background:${PACK_COLORS[gi % 6]}"><h2 style="font-size:1.05rem">${esc(g.name)}</h2><span>${gd}/${items.length}</span></header>
          ${vis.map(p => `<div class="packitem${p.done ? ' done' : ''}"><input type="checkbox" data-id="${p.id}" ${p.done ? 'checked' : ''} aria-label="${esc(p.name)}"><span class="pname">${esc(p.name)}${p.note ? `<span class="pnote">${esc(p.note)}</span>` : ''}</span><span class="qty">×${p.qty}</span><button type="button" class="iconbtn" data-del="${p.id}" aria-label="刪除 ${esc(p.name)}">✕</button></div>`).join('') || '<p class="emptynote">沒有符合的項目</p>'}
          <form class="addpack" data-g="${g.id}"><input name="n" placeholder="新增用品" aria-label="新增到${esc(g.name)}" required><input class="q" name="q" type="number" min="1" value="1" aria-label="數量"><input name="note" placeholder="備註" aria-label="備註"><button class="btn primary" type="submit" aria-label="加入">＋</button></form></section>`;
      }).join('')}</div>`;
    const s = $('#packsearch'); s.oninput = () => { ui.packQuery = s.value; renderPacking(); };
    if (hadFocus) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
    $$('.filterbtns button', pg).forEach(b => b.onclick = () => { ui.packFilter = b.dataset.f; renderPacking(); });
    $$('.packitem input[type=checkbox]', pg).forEach(c => c.onchange = () => commit(t => { const p = t.packing.find(x => x.id === c.dataset.id); p.done = c.checked; }));
    $$('[data-del]', pg).forEach(b => b.onclick = () => commit(t => { t.packing = t.packing.filter(x => x.id !== b.dataset.del); }, '已刪除用品，可按復原'));
    $$('.addpack', pg).forEach(f => f.onsubmit = e => { e.preventDefault(); const fd = new FormData(f); commit(t => { t.packing.push({ id: uid('p'), group: f.dataset.g, name: fd.get('n').trim(), qty: Number(fd.get('q')) || 1, note: fd.get('note').trim(), done: false }); }, '已加入用品'); });
  }

  /* ---------- 資料來源：本機用 fetch，線上版用內嵌資料 ---------- */
  const EMBED = window.__EMBED || null;
  async function getJSON(path) {
    if (EMBED && EMBED[path]) return JSON.parse(JSON.stringify(EMBED[path]));
    return (await fetch(path, { cache: 'no-store' })).json();
  }
  function askConfirm(msg, okText, onOk) {
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="askform"><div class="dlghead"><h2>確認</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div><div class="dlgbody"><p style="grid-column:1/-1;margin:0">${esc(msg)}</p></div><div class="dlgfoot"><button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">${esc(okText)}</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#askform').onsubmit = e => { e.preventDefault(); dlg.close(); onOk(); };
  }
  function showText(title, text, hint) {
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="textform"><div class="dlghead"><h2>${esc(title)}</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div><div class="dlgbody"><p style="grid-column:1/-1;margin:0;font-size:.85rem">${esc(hint)}</p><label class="full">內容<textarea id="exporttext" rows="10" readonly></textarea></label></div><div class="dlgfoot"><button type="button" class="btn" data-close>關閉</button><button type="submit" class="btn primary">複製</button></div></form>`;
    dlg.showModal(); $('#exporttext').value = text;
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#textform').onsubmit = e => {
      e.preventDefault(); const ta = $('#exporttext');
      const fallback = () => { ta.focus(); ta.select(); toast('已全選，請用系統的複製'); };
      try { navigator.clipboard.writeText(text).then(() => toast('已複製'), fallback); } catch (err) { fallback(); }
    };
  }

  /* ---------- 匯入匯出 ---------- */
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportJSON() { if (EMBED) { showText('JSON 備份', JSON.stringify(trip, null, 2), '線上版不能直接下載檔案。按「複製」後貼到記事本存成 .json，或傳給超能幹貓更新正本。'); return; } download(`cruise-trip-${trip.days[0].date}.json`, JSON.stringify(trip, null, 2), 'application/json'); toast('已匯出 JSON 備份'); }
  function exportICS() {
    const icsDate = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escI = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cruise Planner//ZH-TW', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${escI(trip.name)}`];
    const stamp = icsDate(new Date());
    trip.items.forEach(it => {
      const d = dayOf(it.date); const s = zonedToUtc(it.date, it.start, d.tz); const e = new Date(s.getTime() + Number(it.duration) * 60000);
      lines.push('BEGIN:VEVENT', `UID:${it.id}@cruise-planner`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(s)}`, `DTEND:${icsDate(e)}`, `SUMMARY:${escI(it.title)}`);
      if (it.address) lines.push(`LOCATION:${escI(it.address)}`);
      lines.push(`DESCRIPTION:${escI(`${CAT[it.category].label}｜${tzShort(d.tz)} ${it.start}${it.note ? '｜' + it.note : ''}`)}`, 'END:VEVENT');
    });
    trip.days.filter(d => d.allAboard).forEach(d => {
      const s = zonedToUtc(d.date, d.allAboard, d.tz);
      lines.push('BEGIN:VEVENT', `UID:aboard-${d.date}@cruise-planner`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(s)}`, `DTEND:${icsDate(new Date(s.getTime() + 15 * 60000))}`, `SUMMARY:${escI('⚓ All aboard｜' + d.port)}`, 'BEGIN:VALARM', 'TRIGGER:-PT90M', 'ACTION:DISPLAY', 'DESCRIPTION:準備回船', 'END:VALARM', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    if (EMBED) { showText('行事曆 ICS', lines.join('\r\n'), '線上版不能直接下載。複製後存成 .ics 檔再匯入行事曆；在電腦版可直接下載。'); return; }
    download(`cruise-trip-${trip.days[0].date}.ics`, lines.join('\r\n'), 'text/calendar');
    toast('已匯出 ICS，可匯入自己的行事曆');
  }
  function validTrip(o) { return o && Array.isArray(o.days) && o.days.length && Array.isArray(o.items) && o.currencies; }
  function normalize(o) {
    o.fixedCosts = o.fixedCosts || []; o.legOverrides = o.legOverrides || {}; o.packing = o.packing || []; o.packingGroups = o.packingGroups || [];
    o.travelers = o.travelers || { adults: 2, children: 0 }; o.settleCurrency = o.settleCurrency || 'TWD';
    return o;
  }

  /* ---------- 總渲染 ---------- */
  function render() {
    hidePopover();
    renderHeader();
    $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.page === ui.page)));
    $('#planpage').hidden = ui.page !== 'plan'; $('#expensespage').hidden = ui.page !== 'expenses'; $('#packingpage').hidden = ui.page !== 'packing';
    if (ui.page === 'plan') renderPlan(); else if (ui.page === 'expenses') renderExpenses(); else renderPacking();
  }

  function bindStatic() {
    $('#eye').onclick = () => { ui.showTotal = !ui.showTotal; renderHeader(); };
    $$('.tabs button').forEach(b => b.onclick = () => { ui.page = b.dataset.page; render(); if (ui.page === 'plan' && map) setTimeout(() => map.invalidateSize(), 60); });
    $$('.calendar-viewtoggle button').forEach(b => b.onclick = () => { if (ui.view === b.dataset.view) return; ui.view = b.dataset.view; ui.prevDayIdx = ui.dayIdx; renderPlan(); });
    $('#calendar').addEventListener('click', e => {
      const st = e.target.closest('.datestation'); if (!st) return;
      const i = Number(st.dataset.idx); if (i === ui.dayIdx) return;
      ui.dayIdx = i; ui.bounceIdx = i; ui.selected = null; renderPlan();
    });
    $('#undo').onclick = undo;
    $('#addplace').onclick = () => openItemEditor(null);
    $('#previewroute').onclick = () => { ui.mapMode = 'route'; if (!ui.selected) { const it = itemsOn(trip.days[ui.dayIdx].date).filter(hasLoc)[1]; if (it) ui.selected = it.id; } renderMap(); };
    $('#fit').onclick = () => { ui.mapMode = 'fit'; renderMap(); };
    $('#voyage').onclick = () => { ui.mapMode = 'voyage'; renderMap(); };
    const tb = $('#toolbtn'), tm = $('#toolmenu');
    const closeMenu = () => { tm.hidden = true; tb.setAttribute('aria-expanded', 'false'); };
    tb.onclick = () => { const open = tm.hidden; tm.hidden = !open; tb.setAttribute('aria-expanded', String(open)); if (open) $('button', tm).focus(); };
    tm.addEventListener('keydown', e => {
      const items = $$('button', tm); const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      if (e.key === 'Escape') { closeMenu(); tb.focus(); }
    });
    tm.onclick = e => {
      const act = e.target.closest('button') && e.target.closest('button').dataset.act; if (!act) return; closeMenu();
      if (act === 'add') openItemEditor(null);
      if (act === 'undo') undo();
      if (act === 'export') exportJSON();
      if (act === 'ics') exportICS();
      if (act === 'import') $('#importfile').click();
      if (act === 'reset') askConfirm('還原成原始旅程資料？目前的草稿會被取代（可再按復原）。', '還原', () => getJSON(TRIP_FILE).then(o => commit(t => { Object.keys(t).forEach(k => delete t[k]); Object.assign(t, normalize(o)); }, '已還原原始資料')));
    };
    document.addEventListener('click', e => { if (!e.target.closest('.toolfab')) closeMenu(); if (!e.target.closest('#popover') && !e.target.closest('.ev') && !e.target.closest('.timeline-card')) hidePopover(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopover(); if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.target.closest('input,textarea')) { e.preventDefault(); undo(); } });
    $('#importfile').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(txt => {
        let o; try { o = JSON.parse(txt); } catch (err) { toast('檔案不是有效的 JSON'); return; }
        if (!validTrip(o)) { toast('JSON 缺少 days、items 或 currencies，未匯入'); return; }
        commit(t => { Object.keys(t).forEach(k => delete t[k]); Object.assign(t, normalize(o)); }, '已匯入旅程資料');
        ui.dayIdx = 0;
      }).finally(() => { e.target.value = ''; });
    };
    window.addEventListener('resize', () => { if (ui.view === 'day') updateFocus(); });
    setInterval(updateNow, 15000);
  }

  async function loadTrip(entry) {
    STORE_KEY = 'cruise-planner-draft-v1:' + entry.id; TRIP_FILE = entry.file;
    try { localStorage.setItem('cruise-planner-current', entry.id); } catch (e) { /* 略過 */ }
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { draft = null; }
    if (validTrip(draft)) trip = normalize(draft);
    else trip = normalize(await getJSON(TRIP_FILE));
    history = []; ui.selected = null; ui.prevDayIdx = null;
    const ti = trip.days.findIndex(d => nowIn(d.tz).date === d.date); ui.dayIdx = ti >= 0 ? ti : 0;
  }
  async function boot() {
    let trips = [];
    try { trips = await getJSON('data/trips.json'); } catch (e) { trips = []; }
    if (!trips.length) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:16px">讀不到 data/trips.json，請用 node server.js 啟動後開啟。</p>'); return; }
    let want = new URLSearchParams(location.search).get('trip');
    try { want = want || localStorage.getItem('cruise-planner-current'); } catch (e) { /* 略過 */ }
    const entry = trips.find(t => t.id === want) || trips[0];
    try { await loadTrip(entry); }
    catch (e) { document.body.insertAdjacentHTML('afterbegin', `<p style="padding:16px">讀不到 ${esc(entry.file)}。</p>`); return; }
    const sw = $('#tripswitch');
    sw.innerHTML = trips.map(t => `<option value="${esc(t.id)}"${t.id === entry.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
    sw.onchange = async () => { const en = trips.find(t => t.id === sw.value); try { await loadTrip(en); render(); toast('已切換到 ' + en.name); } catch (e) { toast('讀不到這趟旅程的資料'); } };
    bindStatic(); render();
    window.__cruise = { get trip() { return trip; }, ui, computeDay, expenseLines, zonedToUtc };
  }
  boot();
})();
