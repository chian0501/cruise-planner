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
  const ui = { page: 'plan', view: 'week', dayIdx: 0, prevDayIdx: null, selected: null, showTotal: false, mapMode: 'fit', packFilter: 'all', packQuery: '', bounceIdx: null, planB: {} };
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
  const NOW_AT = (() => { const v = new URLSearchParams(location.search).get('now'); const t = v ? Date.parse(v) : NaN; return isNaN(t) ? null : t; })(); // ?now=2026-12-10T09:30:00+09:00 可模擬當下時間（測試用）
  function nowIn(tz) { const p = zonedParts(NOW_AT != null ? NOW_AT : Date.now(), tz); return { date: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) }; }
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
    $('#tripmeta').innerHTML = `<span>🛳 ${esc(trip.ship)}</span><span>📍 ${esc(trip.destination)}</span><span>${n} 天 ${Math.max(0, n - 1)} 夜</span><span>${ports} 個靠港</span><span>${places} 個地點</span><span>費用以 ${travelers()} 人估算</span>`;
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
      return `<button type="button" class="datestation${ui.bounceIdx === i ? ' bounce' : ''}" data-idx="${i}" aria-pressed="${i === ui.dayIdx}" aria-label="${L.md} 星期${L.wd} ${esc(d.port)}"><span class="dot">${L.day}</span><span class="dlabel">${L.md}（${L.wd}）</span>${wxChip(d, true)}<span class="dport">${esc(d.port)}${d.portType === 'sea' ? '・海上' : ''}</span></button>`;
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
  /* ---------- 今天橫幅與 Plan B ---------- */
  function todayBannerHTML(d) {
    if (!d.allAboard || d.portType !== 'port') return '';
    const now = nowIn(d.tz); if (now.date !== d.date) return '';
    const left = toMin(d.allAboard) - now.min;
    const late = left <= 60;
    const msg = left <= 0 ? '已過 All aboard，立刻回船' : (left <= 60 ? `只剩 ${durText(left)}，現在就該往碼頭走` : `還有 ${durText(left)}；目標 ${fmt(toMin(d.allAboard) - 60)} 前回到船上`);
    // 現在在哪、下一站、最晚幾點要離開（往下一個鎖定的回港／接駁點）
    const info = computeDay(d.date);
    const curIt = info.items.find(i => toMin(i.start) <= now.min && now.min < endMin(i));
    const nextIt = info.items.find(i => toMin(i.start) > now.min);
    const lock = info.items.find(i => i.locked && toMin(i.start) > now.min);
    let lines = '';
    if (curIt || nextIt) lines += `<span class="tb-line">${curIt ? `現在：${esc(curIt.title)}（到 ${fmt(endMin(curIt))}）` : '現在：空檔'}${nextIt ? `｜下一站 ${nextIt.start} ${esc(nextIt.title)}` : ''}</span>`;
    if (lock) {
      const leg = info.legs.find(l => l.to === lock);
      const latest = toMin(lock.start) - (leg ? Number(leg.minutes) : 0);
      const gap = latest - now.min;
      lines += `<span class="tb-line tb-latest">最晚 <b>${fmt(latest)}</b> 出發往「${esc(lock.title)}」（${lock.start} 固定${leg ? `，路上約 ${durText(Number(leg.minutes))}` : ''}）${gap <= 0 ? '・已經該出發了' : `・還有 ${durText(gap)}`}</span>`;
    }
    const canDelay = left > 0 && info.items.some(i => shiftable(i, d, now, lock));
    const btns = canDelay ? `<span class="tb-delay">行程延誤？<button type="button" class="btn" data-delay="15" data-date="${d.date}">順延 15 分</button><button type="button" class="btn" data-delay="30" data-date="${d.date}">順延 30 分</button></span>` : '';
    return `<div class="todaybanner${late ? ' late' : ''}" id="todaybanner" role="status"><span class="tb-label">今天・${esc(d.port)}　All aboard</span><span class="tb-aboard">${d.allAboard}</span><span class="tb-left">${msg}</span>${lines}${btns}</div>`;
  }
  const shiftable = (i, d, now, lock) => !i.locked && !i.onboard && toMin(i.start) >= now.min && (!d.allAboard || toMin(i.start) < toMin(d.allAboard)) && (!lock || toMin(i.start) < toMin(lock.start));
  // 一鍵順延：只動「現在之後、下一個鎖定點之前」沒鎖定的行程；鎖定項目（下船、回港、接駁）與 All aboard 不動
  function delayRest(date, mins, fromMin) {
    const d = dayOf(date); const now = fromMin != null ? { min: fromMin } : nowIn(d.tz);
    const before = computeDay(date);
    const lock = before.items.find(i => i.locked && toMin(i.start) > now.min);
    const ids = before.items.filter(i => shiftable(i, d, now, lock)).map(i => i.id);
    if (!ids.length) { toast(fromMin != null ? (lock ? `${fmt(fromMin)} 之後先遇到鎖定的「${lock.title}」，它之後的行程不會被推；請改從 ${fmt(endMin(lock))} 之後開始` : `${fmt(fromMin)} 之後沒有可順延的行程（鎖定、船上活動不動）`) : '現在之後沒有可順延的行程'); return; }
    commit(t => { t.items.forEach(i => { if (ids.includes(i.id)) i.start = fmt(toMin(i.start) + mins); }); });
    const after = computeDay(date);
    const wn = (w, id) => (w[id] || []).length;
    const hit = ids.concat(lock ? [lock.id] : []).filter(id => wn(after.warns, id) > wn(before.warns, id));
    if (ui.page !== 'plan') { ui.page = 'plan'; render(); }
    toast(hit.length ? `已順延 ${ids.length} 項 ${mins} 分；會趕不上固定行程，建議縮短或刪一站（可按復原）` : `已順延 ${ids.length} 項 ${mins} 分，回港與接駁時間沒動（可按復原）`);
  }
  function openDelayDialog(date) {
    date = date || trip.days[ui.dayIdx].date;
    const d0 = dayOf(date); const now0 = nowIn(d0.tz);
    const first = itemsOn(date).find(i => !i.locked && !i.onboard);
    const from0 = now0.date === date ? fmt(now0.min) : (first ? first.start : '09:00');
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="delayform"><div class="dlghead"><h2>⏩ 順延行程</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody">
        <p class="full dlghint">玩太久、排隊太久？把某個時間之後的行程一起往後推。下船、回港、接駁這些鎖定項目，還有 All aboard 都不會動。</p>
        <label>哪一天<select name="date">${trip.days.map(d => `<option value="${d.date}"${d.date === date ? ' selected' : ''}>${dateLabel(d.date).md} ${esc(d.port)}</option>`).join('')}</select></label>
        <label>從幾點開始（當地）<input type="time" name="from" required value="${from0}"></label>
        <div class="full delaypick" role="group" aria-label="往後推幾分">${[15, 30, 45, 60].map(m => `<label class="pickbtn"><input type="radio" name="mins" value="${m}"${m === 30 ? ' checked' : ''}><span>${m} 分</span></label>`).join('')}</div>
      </div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">順延</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#delayform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); dlg.close();
      const dt = fd.get('date'); const di = trip.days.findIndex(x => x.date === dt);
      if (di !== ui.dayIdx) { ui.dayIdx = di; ui.view = 'day'; }
      delayRest(dt, Number(fd.get('mins')), toMin(fd.get('from')));
    };
  }
  /* ---------- 離線日文會話小本 ---------- */
  const PHRASES = [
    ['基本', '你好', 'こんにちは', 'konnichiwa'],
    ['基本', '謝謝', 'ありがとうございます', 'arigatō gozaimasu'],
    ['基本', '不好意思／請問一下', 'すみません', 'sumimasen'],
    ['基本', '我不會說日文', '日本語が話せません', 'nihongo ga hanasemasen'],
    ['基本', '可以說慢一點嗎？', 'ゆっくり話していただけますか', 'yukkuri hanashite itadakemasu ka'],
    ['基本', '這個多少錢？', 'これはいくらですか', 'kore wa ikura desu ka'],
    ['點餐', '請問有空位嗎？', '席は空いていますか', 'seki wa aite imasu ka'],
    ['點餐', '請給我菜單', 'メニューをください', 'menyū o kudasai'],
    ['點餐', '有中文菜單嗎？', '中国語のメニューはありますか', 'chūgokugo no menyū wa arimasu ka'],
    ['點餐', '我要這個', 'これをください', 'kore o kudasai'],
    ['點餐', '要等多久？', 'どのくらい待ちますか', 'dono kurai machimasu ka'],
    ['點餐', '請結帳', 'お会計をお願いします', 'okaikei o onegai shimasu'],
    ['點餐', '可以刷卡嗎？', 'カードは使えますか', 'kādo wa tsukaemasu ka'],
    ['交通', '請載我到這裡（給司機看地址）', 'ここまでお願いします', 'koko made onegai shimasu'],
    ['交通', '請載我到郵輪碼頭', 'クルーズターミナルまでお願いします', 'kurūzu tāminaru made onegai shimasu'],
    ['交通', '大概要多久？', 'どのくらいかかりますか', 'dono kurai kakarimasu ka'],
    ['交通', '我們趕時間，要準時回船', '急いでいます。船に戻らなければなりません', 'isoide imasu. fune ni modoranakereba narimasen'],
    ['交通', '請在這裡停', 'ここで止めてください', 'koko de tomete kudasai'],
    ['交通', '公車站在哪裡？', 'バス停はどこですか', 'basutei wa doko desu ka'],
    ['購物', '可以免稅嗎？', '免税できますか', 'menzei dekimasu ka'],
    ['購物', '這是護照', 'パスポートです', 'pasupōto desu'],
    ['購物', '可以試穿嗎？', '試着してもいいですか', 'shichaku shitemo ii desu ka'],
    ['購物', '請給我袋子', '袋をください', 'fukuro o kudasai'],
    ['問路', '廁所在哪裡？', 'トイレはどこですか', 'toire wa doko desu ka'],
    ['問路', '走路到得了嗎？', '歩いて行けますか', 'aruite ikemasu ka'],
    ['問路', '可以幫我們拍照嗎？', '写真を撮っていただけますか', 'shashin o totte itadakemasu ka'],
    ['緊急', '請幫幫我', '助けてください', 'tasukete kudasai'],
    ['緊急', '請叫救護車', '救急車を呼んでください', 'kyūkyūsha o yonde kudasai'],
    ['緊急', '請報警', '警察を呼んでください', 'keisatsu o yonde kudasai'],
    ['緊急', '我身體不舒服', '気分が悪いです', 'kibun ga warui desu'],
    ['緊急', '這裡痛', 'ここが痛いです', 'koko ga itai desu'],
    ['緊急', '附近有醫院嗎？', '近くに病院はありますか', 'chikaku ni byōin wa arimasu ka'],
    ['緊急', '藥局在哪裡？', '薬局はどこですか', 'yakkyoku wa doko desu ka'],
    ['緊急', '我的護照不見了', 'パスポートをなくしました', 'pasupōto o nakushimashita']
  ];
  const canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  function speakJa(text) {
    if (!canSpeak()) { toast('這台手機不支援朗讀，請直接給對方看'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = 0.9;
      const v = speechSynthesis.getVoices().find(x => /^ja/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { toast('朗讀失敗，請直接給對方看'); }
  }
  function showBig(ja, zh) {
    const ov = document.createElement('div'); ov.className = 'bigphrase'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', '給對方看');
    ov.innerHTML = `<div class="bp-ja" lang="ja">${esc(ja)}</div><div class="bp-zh">${esc(zh)}</div><div class="bp-hint">點一下關閉</div>`;
    ov.onclick = () => ov.remove(); const dlg = document.getElementById('editor'); (dlg && dlg.open ? dlg : document.body).appendChild(ov); // 對話框在最上層，放大頁要放進對話框裡才蓋得住
  }
  function openPhrases(cat) {
    const cats = [...new Set(PHRASES.map(x => x[0]))];
    cat = cat || ui.phraseCat || cats[0]; ui.phraseCat = cat;
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="phraseform"><div class="dlghead"><h2>🈁 日文會話小本</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody sosbody">
        <div class="filterbtns phrasecats" role="group" aria-label="分類">${cats.map(c => `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join('')}</div>
        <ul class="phraselist">${PHRASES.filter(x => x[0] === cat).map((x, i) => `<li><div class="ph-zh">${esc(x[1])}</div><div class="ph-ja" lang="ja">${esc(x[2])}</div><div class="ph-ro">${esc(x[3])}</div>
          <div class="ph-btns">${canSpeak() ? `<button type="button" class="btn" data-say="${i}">🔊 唸給他聽</button>` : ''}<button type="button" class="btn" data-big="${i}">🔍 放大給他看</button></div></li>`).join('')}</ul>
        <p class="sos-src">沒網路也能用。要翻譯任意句子，用 Google 翻譯 App 的日文離線包（看「❓ 怎麼用」）。</p>
      </div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>關閉</button></div></form>`;
    if (!dlg.open) dlg.showModal();
    const list = PHRASES.filter(x => x[0] === cat);
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $$('[data-cat]', dlg).forEach(b => b.onclick = () => openPhrases(b.dataset.cat));
    $$('[data-say]', dlg).forEach(b => b.onclick = () => speakJa(list[+b.dataset.say][2]));
    $$('[data-big]', dlg).forEach(b => b.onclick = () => { const x = list[+b.dataset.big]; showBig(x[2], x[1]); });
    $('#phraseform').onsubmit = e => e.preventDefault();
  }
  /* ---------- 問 AI：把問題連同今天的狀況帶進自己訂閱的 Claude／ChatGPT ---------- */
  function aiContext() {
    const d = trip.days.find(x => nowIn(x.tz).date === x.date) || trip.days[ui.dayIdx];
    const now = nowIn(d.tz); const today = now.date === d.date;
    const typ = { embark: '登船日', disembark: '下船日', port: '靠港日', sea: '海上航行日' }[d.portType] || '';
    const next = itemsOn(d.date).filter(i => !today || endMin(i) > now.min).slice(0, 4).map(i => `${i.start} ${i.title}`);
    let c = `我正在搭郵輪旅行（${trip.name}）。${today ? '今天' : '我問的是'} ${d.date}（${typ}），在${d.port}，用${tzShort(d.tz)}`;
    if (today) c += `，現在當地時間 ${fmt(now.min)}`;
    c += '。';
    if (d.allAboard) c += `All aboard（最晚回船）是 ${d.allAboard}。`;
    if (next.length) c += `${today ? '接下來' : '這天'}的行程：${next.join('；')}。`;
    return c;
  }
  function openAI() {
    const dlg = $('#editor');
    const chips = ['突然下雨，接下來怎麼改？', '附近有什麼在地小吃？', '幫我把這句翻成日文：', '來得及在 All aboard 前回船嗎？'];
    dlg.innerHTML = `<form method="dialog" id="aiform"><div class="dlghead"><h2>🤖 問 AI</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody">
        <p class="full dlghint">寫下問題，按下面的按鈕，會開啟你自己訂閱的 Claude 或 ChatGPT 並帶入問題（需要網路，用你自己的帳號）。</p>
        <div class="full aichips">${chips.map(c => `<button type="button" class="pickchip" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <label class="full">你的問題<textarea name="q" rows="3" required placeholder="例如：首里城附近午餐吃什麼？"></textarea></label>
        <label class="check full"><input type="checkbox" name="ctx" checked> 一起附上今天的港口、時間和行程（不含姓名、房號）</label>
        <details class="full aiprev"><summary>看會附上什麼</summary><p>${esc(aiContext())}</p></details>
      </div>
      <div class="dlgfoot aifoot"><button type="button" class="btn" data-ai="copy">📋 只複製</button><button type="button" class="btn primary" data-ai="chatgpt">ChatGPT 問</button><button type="button" class="btn primary" data-ai="claude">Claude 問</button></div></form>`;
    dlg.showModal();
    const f = $('#aiform');
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $$('[data-chip]', dlg).forEach(b => b.onclick = () => { f.q.value = b.dataset.chip; f.q.focus(); });
    f.onsubmit = e => e.preventDefault();
    $$('[data-ai]', dlg).forEach(b => b.onclick = () => {
      const q = f.q.value.trim(); if (!q) { toast('先寫下問題'); f.q.focus(); return; }
      const text = (f.ctx.checked ? aiContext() + '\n\n' : '') + '問題：' + q + '\n\n請用繁體中文，先給結論，簡短回答。';
      const copy = () => { try { navigator.clipboard.writeText(text).catch(() => {}); } catch (err) { /* 不支援就略過 */ } };
      copy();
      if (b.dataset.ai === 'copy') { toast('已複製問題，貼到任何 AI 都可以'); return; }
      if (navigator.onLine === false) { toast('現在沒有網路；問題已複製，有網路再貼給 AI'); return; }
      const url = b.dataset.ai === 'claude' ? 'https://claude.ai/new?q=' + encodeURIComponent(text) : 'https://chatgpt.com/?q=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener'); dlg.close();
      toast('已開啟並帶入問題（也複製了一份，沒帶進去就直接貼上）');
    });
  }
  /* ---------- 怎麼用（第一次打開自動出現） ---------- */
  const GUIDE_KEY = 'cruise-planner-guide-v1';
  function openGuide() {
    const dlg = $('#editor');
    const items = [
      ['🗓️ 每天看什麼', '「行程」頁上面點日期，就換到那一天。「週」可以看整趟，「單日」是一張張行程卡。靠港那天打開，會直接顯示今天的港口，最上面的黃色框會倒數 All aboard，提醒你最晚幾點要出發回船。'],
      ['⏩ 行程延誤', '靠港當天，黃色框裡有「順延 15／30 分」。其他時候用港口卡上的「⏩ 順延」，或「☰ 更多」→「順延行程」，可以選從幾點開始、往後推幾分。下船、回港、接駁這些鎖定項目和 All aboard 都不會動，推錯了按「復原」。'],
      ['✏️ 改行程、記訂位', '雙擊（手機點一下）行程卡就能編輯：時間、地址、金額，還有訂位資訊和玩完的心得。改的內容只存在這支手機。'],
      ['🆘 緊急', '底下的「緊急」：119、110、駐那霸辦事處、外交部專線，點了就能撥號。船上醫務室和旅平險號碼拿到後可以自己填進去。'],
      ['🈁 會話', '常用日文：點餐、搭計程車、退稅、問路、緊急狀況。可以唸出來，或放大給對方看，沒網路也能用。'],
      ['🤖 問 AI', '寫下問題，會帶著今天的港口、時間和行程，打開你自己的 Claude 或 ChatGPT 回答。這個要有網路。'],
      ['📶 出發前準備（在家有網路時做）', '1. 把這個網站加到手機主畫面：iPhone 用 Safari 的「分享」→「加入主畫面」；Android 用 Chrome 右上「⋮」→「加到主畫面」。\n2. 有網路時打開一次，網站會自動存起來，上船沒網路也打得開（天氣、匯率會停在最後一次抓到的）。\n3. 下載 Google 翻譯 App，點右上角頭像 →「已下載的語言」（各版本名稱可能不同），下載「日文」和「中文（繁體）」，沒網路也能翻任意句子、拍菜單翻譯。']
    ];
    dlg.innerHTML = `<form method="dialog" id="guideform"><div class="dlghead"><h2>❓ 怎麼用</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody sosbody"><dl class="sostips guide">${items.map(([t, x]) => `<dt>${t}</dt><dd>${esc(x).replace(/\n/g, '<br>')}</dd>`).join('')}</dl></div>
      <div class="dlgfoot"><button type="submit" class="btn primary">知道了</button></div></form>`;
    dlg.showModal();
    const done = () => { try { localStorage.setItem(GUIDE_KEY, '1'); } catch (e) { /* 略過 */ } dlg.close(); };
    $$('[data-close]', dlg).forEach(b => b.onclick = done);
    $('#guideform').onsubmit = e => { e.preventDefault(); done(); };
    dlg.addEventListener('close', () => { try { localStorage.setItem(GUIDE_KEY, '1'); } catch (e) { /* 略過 */ } }, { once: true });
  }
  function runAct(act) {
    if (act === 'sos') openEmergency();
    else if (act === 'phrase') openPhrases();
    else if (act === 'ai') openAI();
    else if (act === 'guide') openGuide();
    else if (act === 'delay') openDelayDialog();
    else if (act === 'packing') { ui.page = 'packing'; render(); window.scrollTo(0, 0); }
    else return false;
    return true;
  }
  /* ---------- 天氣（Open-Meteo，免金鑰；預報只到 16 天內） ---------- */
  const WX_KEY = 'cruise-planner-wx-v1';
  let wxData = {};
  const wxLook = c => c === 0 ? ['☀️', '晴'] : c <= 2 ? ['🌤️', '晴時多雲'] : c === 3 ? ['☁️', '陰'] : c <= 48 ? ['🌫️', '霧'] : c <= 57 ? ['🌦️', '毛毛雨'] : c <= 67 ? ['🌧️', '雨'] : c <= 77 ? ['🌨️', '雪'] : c <= 82 ? ['🌦️', '陣雨'] : c <= 86 ? ['🌨️', '陣雪'] : ['⛈️', '雷雨'];
  const wxDays = () => trip.days.filter(d => d.lat != null && d.lng != null && d.lat !== '' && d.portType !== 'sea');
  function wxChip(d, short) {
    const w = wxData[d.date];
    if (!w) {
      if (short) return '';
      const ahead = (Date.parse(d.date) - Date.now()) / 864e5;
      return ahead > 15 ? `<span class="portchip wx">天氣：出發前 16 天內自動顯示</span>` : '';
    }
    const [ic, label] = wxLook(w.code);
    if (short) return `<span class="dwx" title="${label} ${w.min}–${w.max}°C">${ic}${w.max}°</span>`;
    return `<span class="portchip wx" title="Open-Meteo 預報，${esc(w.at)} 更新">${ic} ${label} ${w.min}–${w.max}°C${w.rain != null ? `・降雨 ${w.rain}%` : ''}${w.wind != null ? `・風 ${w.wind} km/h` : ''}</span>`;
  }
  async function refreshWeather() {
    const days = wxDays(); if (!days.length) return;
    let cache = null; try { cache = JSON.parse(localStorage.getItem(WX_KEY + ':' + trip.id) || 'null'); } catch (e) { cache = null; }
    if (cache && cache.data) wxData = cache.data;
    if (cache && cache.data && ui.page === 'plan') renderPlan();
    if (cache && Date.now() - cache.fetched < 3 * 3600e3) return; // 3 小時內不重抓
    const q = k => days.map(d => d[k]).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${q('lat')}&longitude=${q('lng')}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=16`;
    try {
      const r = await fetch(url); if (!r.ok) return;
      let j = await r.json(); if (!Array.isArray(j)) j = [j];
      const at = new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const out = {};
      days.forEach((d, i) => {
        const dl = j[i] && j[i].daily; if (!dl || !dl.time) return;
        const k = dl.time.indexOf(d.date); if (k < 0 || dl.weather_code[k] == null) return;
        const rd = v => v == null ? null : Math.round(v);
        out[d.date] = { code: dl.weather_code[k], max: rd(dl.temperature_2m_max[k]), min: rd(dl.temperature_2m_min[k]), rain: rd(dl.precipitation_probability_max && dl.precipitation_probability_max[k]), wind: rd(dl.wind_speed_10m_max && dl.wind_speed_10m_max[k]), at };
      });
      wxData = out;
      try { localStorage.setItem(WX_KEY + ':' + trip.id, JSON.stringify({ fetched: Date.now(), data: out })); } catch (e) { /* 略過 */ }
      if (ui.page === 'plan') renderPlan();
    } catch (e) { /* 離線或被擋：沿用快取 */ }
  }
  /* ---------- 匯率（open.er-api.com，免金鑰，每天更新一次；手動改過就不自動蓋） ---------- */
  const FX_KEY = 'cruise-planner-fx-v1';
  const isManualRate = c => c.rateNote === '使用者設定';
  function applyFx(fx) {
    const sc = trip.settleCurrency; let changed = false;
    Object.entries(trip.currencies).forEach(([k, c]) => {
      if (k === sc || isManualRate(c) || !fx.rates[k] || !fx.rates[sc]) return;
      const rate = fx.rates[sc] / fx.rates[k];
      const r = Number(rate.toPrecision(4));
      const note = `自動 ${fx.day}`;
      if (c.rate !== r || c.rateNote !== note) { c.rate = r; c.rateNote = note; changed = true; }
    });
    return changed;
  }
  async function refreshFx() {
    const sc = trip.settleCurrency; if (!Object.keys(trip.currencies).some(k => k !== sc && !isManualRate(trip.currencies[k]))) return;
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });
    let fx = null; try { fx = JSON.parse(localStorage.getItem(FX_KEY) || 'null'); } catch (e) { fx = null; }
    if (!fx || fx.day !== today) {
      try {
        const r = await fetch('https://open.er-api.com/v6/latest/USD'); if (r.ok) {
          const j = await r.json();
          if (j && j.result === 'success' && j.rates) { fx = { day: today, rates: j.rates }; try { localStorage.setItem(FX_KEY, JSON.stringify(fx)); } catch (e) { /* 略過 */ } }
        }
      } catch (e) { /* 離線：沿用上次 */ }
    }
    if (fx && fx.rates && applyFx(fx)) { save(); if (ui.page === 'expenses') renderExpenses(); renderHeader(); }
  }
  function bookingHTML(it) {
    const b = it.booking; if (!b) return '';
    const parts = [b.time && `${esc(b.time)} 訂位`, b.people && `${esc(b.people)} 位`, b.name && esc(b.name), b.ref && `代號 ${esc(b.ref)}`].filter(Boolean);
    return parts.length ? `<div class="cardnote booking">📌 ${parts.join('・')}</div>` : '';
  }
  /* ---------- 緊急聯絡＋小知識 ---------- */
  const editable = c => !c.phone || c.status === 'user';
  const telHref = n => 'tel:' + String(n).replace(/[^0-9+]/g, '');
  function openEmergency() {
    const em = trip.emergency;
    const dlg = $('#editor');
    if (!em) { toast('這趟旅程還沒有緊急聯絡資料'); return; }
    dlg.innerHTML = `<form method="dialog" id="sosform"><div class="dlghead"><h2>🆘 緊急聯絡・小知識</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody sosbody">
        <ul class="soslist">${em.contacts.map(c => `<li class="${c.phone ? '' : 'pend'}"><div class="sos-label">${esc(c.label)}${c.status === 'pending' && !c.phone ? ' <span class="tag pend">待確認</span>' : ''}</div>
          ${c.phone ? `<a class="sos-call" href="${telHref(c.phone)}">📞 ${esc(c.phone)}</a>${c.intl ? `<span class="sos-intl">台灣手機漫遊撥 <a href="${telHref(c.intl)}">${esc(c.intl)}</a></span>` : ''}` : ''}${editable(c) ? `<input name="sos-${esc(c.id)}" inputmode="tel" value="${esc(c.phone || '')}" placeholder="拿到號碼後填這裡" aria-label="${esc(c.label)} 電話">` : ''}
          ${c.note ? `<div class="sos-note">${esc(c.note)}</div>` : ''}</li>`).join('')}</ul>
        <h3 class="sos-h">小知識</h3>
        <dl class="sostips">${em.tips.map(t => `<dt>${esc(t.title)}</dt><dd>${esc(t.text)}</dd>`).join('')}</dl>
        <p class="sos-src">號碼來源：外交部領事事務局（${esc(em.updated || '')} 查）。110／119 為日本通用。</p>
      </div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>關閉</button>${em.contacts.some(editable) ? '<button type="submit" class="btn primary">儲存填的號碼</button>' : ''}</div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#sosform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); dlg.close();
      const fill = {}; em.contacts.forEach(c => { if (!editable(c)) return; const v = (fd.get('sos-' + c.id) || '').trim(); if (v !== (c.phone || '')) fill[c.id] = v; });
      if (!Object.keys(fill).length) return;
      commit(t => { t.emergency.contacts.forEach(c => { if (c.id in fill) { c.phone = fill[c.id]; c.status = fill[c.id] ? 'user' : 'pending'; } }); }, '已存緊急號碼（存在這台裝置，可按復原）');
    };
  }
  function planBHTML(d) {
    const p = d.planB; if (!p || !p.steps || !p.steps.length) return '';
    const open = !!ui.planB[d.date];
    return `<div class="planb"><button type="button" aria-pressed="${open}" aria-controls="planbbody" data-planb="${d.date}">☔ Plan B：${esc(p.title)}</button><div class="planb-body" id="planbbody"${open ? '' : ' hidden'}>${p.trigger ? `<div class="pb-trigger">什麼時候改走：${esc(p.trigger)}</div>` : ''}<ol>${p.steps.map(x => `<li><b>${esc(x.time || '')}</b>${esc(x.text)}</li>`).join('')}</ol></div></div>`;
  }
  function dayHTML() {
    const d = trip.days[ui.dayIdx];
    const info = computeDay(d.date);
    const { lo, hi } = dayRange(info);
    const pct = m => ((m - lo) / (hi - lo) * 100).toFixed(3) + '%';
    // 前言：港口資訊
    let intro = `<div class="timeline-intro">${todayBannerHTML(d)}<div class="portcard"><b>${esc(d.port)}</b>`;
    const typ = { embark: '登船日', disembark: '下船日', port: '靠港日', sea: '海上航行日' }[d.portType] || '';
    intro += `<span class="portchip">${typ}・${tzShort(d.tz)}</span>`;
    if (d.arrive) intro += `<span class="portchip">抵達 ${d.arrive}</span>`;
    if (d.depart) intro += `<span class="portchip">離港 ${d.depart}</span>`;
    if (d.allAboard) intro += `<span class="portchip aboard">All aboard ${d.allAboard}</span>`;
    if (d.safeReturn) intro += `<span class="portchip">安全回船線 ${d.safeReturn}</span>`;
    intro += wxChip(d);
    if (trip.emergency) intro += `<button type="button" class="portchip sos" data-sos>🆘 緊急聯絡</button>`;
    if (info.items.some(i => !i.locked && !i.onboard)) intro += `<button type="button" class="portchip delaychip" data-delaydlg="${d.date}">⏩ 順延</button>`;
    intro += `</div>`;
    if (d.portType === 'port' && d.arrive && (d.safeReturn || d.allAboard)) {
      const shore = toMin(d.safeReturn || d.allAboard) - toMin(d.arrive);
      intro += `<div class="shoretime">可上岸時間約 ${durText(shore)}（表定抵達到${d.safeReturn ? '安全回船線' : 'All aboard'}，未扣下船入境排隊）</div>`;
    }
    if (d.note) intro += `<div class="shoretime">📝 ${esc(d.note)}</div>`;
    intro += planBHTML(d);
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
      cards += `<div class="timeline-time-row" data-id="${it.id}" data-min="${toMin(it.start)}"><div class="rowtime">${it.start}</div><div class="timeline-card cat-${it.category}" tabindex="0" role="button" aria-label="${esc(it.title)} ${it.start}"><h3>${esc(it.title)}${it.locked ? '<span class="tag lock">已鎖定</span>' : ''}${it.onboard ? '<span class="tag">船上</span>' : ''}</h3><div class="cardmeta"><span>${it.start}–${fmt(endMin(it))}・${durText(Number(it.duration))}</span><span>${CAT[it.category].label}</span>${it.address ? `<span>${esc(it.address)}</span>` : ''}${cost ? `<span>${cost}</span>` : ''}</div>${it.note ? `<div class="cardnote">${esc(it.note)}</div>` : ''}${bookingHTML(it)}${it.review ? `<div class="cardnote review">💬 ${esc(it.review)}</div>` : ''}${warn ? `<div class="cardnote"><span class="tag warn">注意</span> ${esc(warn.join('；'))}</div>` : ''}</div></div>`;
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
    const tb = $('#todaybanner');
    if (tb) { const d = trip.days[ui.dayIdx]; const tmp = document.createElement('div'); tmp.innerHTML = todayBannerHTML(d); const nb = tmp.firstElementChild; if (nb) { tb.className = nb.className; tb.innerHTML = nb.innerHTML; } }
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
        <div class="full dlgsub">📌 訂位資訊（有訂才填）</div>
        <label>訂位時間<input type="time" name="bk-time" value="${esc((it.booking || {}).time || '')}"></label>
        <label>人數<input type="number" name="bk-people" min="1" value="${esc((it.booking || {}).people || '')}"></label>
        <label>訂位人<input name="bk-name" value="${esc((it.booking || {}).name || '')}"></label>
        <label>訂位代號<input name="bk-ref" value="${esc((it.booking || {}).ref || '')}"></label>
        <label class="full">💬 心得（玩完再寫）<textarea name="review" rows="2" placeholder="好吃嗎？下次還來嗎？">${esc(it.review || '')}</textarea></label>
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
      const bk = { time: fd.get('bk-time'), people: fd.get('bk-people') === '' ? '' : Number(fd.get('bk-people')), name: fd.get('bk-name').trim(), ref: fd.get('bk-ref').trim() };
      if (bk.time || bk.people || bk.name || bk.ref) upd.booking = bk;
      const review = fd.get('review').trim(); if (review) upd.review = review;
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
      ${rates.map(([k, v]) => `<label class="full">1 ${k} = ? ${trip.settleCurrency}<input type="number" name="rate-${k}" step="any" min="0" value="${v.rate}"></label>`).join('')}
      <label class="full checkline"><input type="checkbox" name="autofx"${rates.some(([, v]) => isManualRate(v)) ? '' : ' checked'}> 匯率每天自動更新（取消勾選＝用上面填的數字）</label></div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#setform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); dlg.close();
      const auto = !!fd.get('autofx');
      commit(t => { t.travelers.adults = Number(fd.get('adults')); t.travelers.children = Number(fd.get('children')); rates.forEach(([k]) => { t.currencies[k].rate = Number(fd.get('rate-' + k)); t.currencies[k].rateNote = auto ? '待自動更新' : '使用者設定'; }); }, auto ? '已存；匯率會自動更新成今天的' : '旅客與匯率已更新，預算已重算');
      if (auto) refreshFx();
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
  /* ---------- 隨手記帳（實際花費，和預估分開） ---------- */
  function spendDefaultDate() {
    const t = trip.days.find(d => nowIn(d.tz).date === d.date);
    return (t || trip.days[ui.dayIdx]).date;
  }
  function spendHTML() {
    const sc = trip.settleCurrency;
    const list = (trip.spend || []).slice().sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
    const byCur = {}; let conv = 0;
    list.forEach(s => { byCur[s.currency] = (byCur[s.currency] || 0) + Number(s.amount); conv += Number(s.amount) * cur(s.currency).rate; });
    const dd = spendDefaultDate();
    const defCur = dayOf(dd) && dayOf(dd).tz === 'Asia/Tokyo' ? 'JPY' : sc;
    const byDate = {};
    list.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });
    return `<section class="sumcard spendcard"><h2>隨手記帳 <small class="ratenote">實際花了多少；跟下方預估分開算</small></h2>
      <form id="spendform" class="spendform" autocomplete="off">
        <label>金額<input id="sp-amount" name="amount" type="number" inputmode="decimal" min="0" step="any" required placeholder="0"></label>
        <label>幣別<select id="sp-cur" name="currency">${Object.keys(trip.currencies).map(k => `<option${k === defCur ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
        <label>類別<select id="sp-cat" name="category">${Object.entries(EXP_CAT).map(([k, v]) => `<option value="${k}"${k === 'shop' ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label>日期<select id="sp-date" name="date">${trip.days.map(d => `<option value="${d.date}"${d.date === dd ? ' selected' : ''}>${dateLabel(d.date).md} ${esc(d.port)}</option>`).join('')}</select></label>
        <label class="wide">買了什麼<input id="sp-note" name="note" placeholder="例：大國藥妝、一蘭拉麵"></label>
        <button class="btn primary" type="submit">記下來</button>
      </form>
      <div class="sumrow big"><span>實際已花（${list.length} 筆）</span><span>${money(Math.round(conv), sc)}</span></div>
      <div class="ratenote">${Object.entries(byCur).map(([k, v]) => money(v, k)).join('＋') || '還沒有紀錄'}${Object.keys(byCur).some(k => k !== sc) ? `；外幣依目前匯率換算` : ''}。紀錄存在這台裝置的瀏覽器；要留底請用工具選單「匯出 JSON 備份」。</div>
      ${Object.keys(byDate).map(dt => `<div class="spendday"><div class="spenddate">${dateLabel(dt).md}（${dateLabel(dt).wd}）${esc(dayOf(dt) ? dayOf(dt).port : '')}</div>${byDate[dt].map(s => `<div class="spendrow r-${s.category}"><button type="button" class="spendmain" data-sp="${s.id}"><span>${esc(s.note || EXP_CAT[s.category].label)}</span><small>${EXP_CAT[s.category].label}${s.time ? '・' + s.time : ''}</small></button><span class="num">${money(s.amount, s.currency)}</span><button type="button" class="iconbtn" data-spdel="${s.id}" aria-label="刪除這筆">✕</button></div>`).join('')}</div>`).join('')}
    </section>`;
  }
  function bindSpend() {
    const f = $('#spendform'); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault(); const fd = new FormData(f);
      const amt = Number(fd.get('amount')); if (!(amt > 0)) { toast('請輸入金額'); return; }
      const date = fd.get('date'); const tz = dayOf(date).tz; const n = nowIn(tz);
      const rec = { id: uid('s'), date, time: n.date === date ? fmt(n.min) : '', amount: amt, currency: fd.get('currency'), category: fd.get('category'), note: fd.get('note').trim() };
      commit(t => { (t.spend = t.spend || []).push(rec); }, `已記下 ${money(amt, rec.currency)}`);
      const a = $('#sp-amount'); if (a) a.focus();
    };
    $$('[data-spdel]').forEach(b => b.onclick = () => commit(t => { t.spend = t.spend.filter(s => s.id !== b.dataset.spdel); }, '已刪除這筆，可按復原'));
    $$('[data-sp]').forEach(b => b.onclick = () => openSpendEditor(b.dataset.sp));
  }
  function openSpendEditor(id) {
    const s = trip.spend.find(x => x.id === id); if (!s) return;
    const dlg = $('#editor');
    dlg.innerHTML = `<form method="dialog" id="spedit"><div class="dlghead"><h2>修改這筆花費</h2><button type="button" class="iconbtn" data-close aria-label="關閉">✕</button></div>
      <div class="dlgbody"><label>金額<input type="number" name="amount" min="0" step="any" required value="${s.amount}"></label>
      <label>幣別<select name="currency">${Object.keys(trip.currencies).map(k => `<option${k === s.currency ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label>類別<select name="category">${Object.entries(EXP_CAT).map(([k, v]) => `<option value="${k}"${k === s.category ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
      <label>日期<select name="date">${trip.days.map(d => `<option value="${d.date}"${d.date === s.date ? ' selected' : ''}>${dateLabel(d.date).md} ${esc(d.port)}</option>`).join('')}</select></label>
      <label class="full">買了什麼<input name="note" value="${esc(s.note)}"></label></div>
      <div class="dlgfoot"><button type="button" class="btn" data-close>取消</button><button type="submit" class="btn primary">儲存</button></div></form>`;
    dlg.showModal();
    $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
    $('#spedit').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target); dlg.close();
      commit(t => { const x = t.spend.find(y => y.id === id); Object.assign(x, { amount: Number(fd.get('amount')), currency: fd.get('currency'), category: fd.get('category'), date: fd.get('date'), note: fd.get('note').trim() }); }, '已更新');
    };
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
    $('#expensespage').innerHTML = spendHTML() + `<h2 class="sectiontitle">預估預算</h2><div class="expgrid">
      <div style="display:grid;gap:18px">
        <section class="sumcard"><h2>合計</h2>
          ${Object.keys(trip.currencies).map(k => `<div class="sumrow"><span>${k === sc ? '結算幣別' : '外幣'}合計（${k}）</span><span>${money(byCur[k] || 0, k)}</span></div>`).join('')}
          <div class="sumrow big"><span>換算總額</span><span>${money(settleTotal, sc)}${pending.length ? ' +' : ''}</span></div>
          <div class="ratenote">${rateTxt}。每筆先換算成 ${sc} 再合計，最後四捨五入。費用以 ${travelers()} 人估算（公開版預設 1 人，可按「調整旅客與匯率」改）、每車以 4 人計（${vehicles()} 車）。</div>
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
    bindSpend();
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
  function exportJSON() { if (EMBED) { showText('JSON 備份', JSON.stringify(trip, null, 2), '線上版不能直接下載檔案。按「複製」後貼到記事本存成 .json，或傳給能幹貓更新正本。'); return; } download(`cruise-trip-${trip.days[0].date}.json`, JSON.stringify(trip, null, 2), 'application/json'); toast('已匯出 JSON 備份'); }
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
    o.spend = o.spend || []; o.fixedCosts = o.fixedCosts || []; o.legOverrides = o.legOverrides || {}; o.packing = o.packing || []; o.packingGroups = o.packingGroups || [];
    o.travelers = o.travelers || { adults: 1, children: 0 }; o.settleCurrency = o.settleCurrency || 'TWD';
    return o;
  }

  /* ---------- 總渲染 ---------- */
  function render() {
    hidePopover();
    renderHeader();
    $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.page === ui.page)));
    $$('.bottomnav [data-page]').forEach(b => { if (b.dataset.page === ui.page) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
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
    $('#calendar').addEventListener('click', e => {
      const b = e.target.closest('[data-planb]'); if (!b) return;
      const date = b.dataset.planb; ui.planB[date] = !ui.planB[date];
      b.setAttribute('aria-pressed', String(!!ui.planB[date]));
      const body = $('#planbbody'); if (body) body.hidden = !ui.planB[date];
    });
    $('#calendar').addEventListener('click', e => {
      if (e.target.closest('[data-sos]')) { openEmergency(); return; }
      const dd = e.target.closest('[data-delaydlg]'); if (dd) { openDelayDialog(dd.dataset.delaydlg); return; }
      const b = e.target.closest('[data-delay]'); if (!b) return;
      delayRest(b.dataset.date, Number(b.dataset.delay));
    });
    $$('.bottomnav button').forEach(b => b.onclick = () => {
      if (b.dataset.page) { ui.page = b.dataset.page; render(); window.scrollTo(0, 0); if (ui.page === 'plan' && map) setTimeout(() => map.invalidateSize(), 60); return; }
      if (b.dataset.act === 'more') { const open = tm.hidden; tm.hidden = !open; b.setAttribute('aria-expanded', String(open)); tb.setAttribute('aria-expanded', String(open)); return; }
      closeMenu(); runAct(b.dataset.act);
    });
    $('#undo').onclick = undo;
    $('#addplace').onclick = () => openItemEditor(null);
    $('#previewroute').onclick = () => { ui.mapMode = 'route'; if (!ui.selected) { const it = itemsOn(trip.days[ui.dayIdx].date).filter(hasLoc)[1]; if (it) ui.selected = it.id; } renderMap(); };
    $('#fit').onclick = () => { ui.mapMode = 'fit'; renderMap(); };
    $('#voyage').onclick = () => { ui.mapMode = 'voyage'; renderMap(); };
    const tb = $('#toolbtn'), tm = $('#toolmenu');
    const closeMenu = () => { tm.hidden = true; tb.setAttribute('aria-expanded', 'false'); const mb = $('.bottomnav [data-act="more"]'); if (mb) mb.setAttribute('aria-expanded', 'false'); };
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
      if (runAct(act)) return;
      if (act === 'spend') { ui.page = 'expenses'; render(); window.scrollTo(0, 0); const a = $('#sp-amount'); if (a) a.focus(); }
      if (act === 'import') $('#importfile').click();
      if (act === 'reset') askConfirm('還原成原始旅程資料？目前的草稿會被取代（可再按復原）。', '還原', () => getJSON(TRIP_FILE).then(o => commit(t => { Object.keys(t).forEach(k => delete t[k]); Object.assign(t, normalize(o)); }, '已還原原始資料')));
    };
    document.addEventListener('click', e => { if (!e.target.closest('.toolfab, [data-act="more"]')) closeMenu(); if (!e.target.closest('#popover') && !e.target.closest('.ev') && !e.target.closest('.timeline-card')) hidePopover(); });
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
    const fresh = normalize(await getJSON(TRIP_FILE));
    if (validTrip(draft) && (draft.revision || null) === (fresh.revision || null)) { trip = normalize(draft); if (!trip.emergency && fresh.emergency) trip.emergency = fresh.emergency; }
    else {
      // 資料有新版：舊草稿另存備份，改用新版（避免舊行程蓋掉重排後的行程）
      if (validTrip(draft)) { try { localStorage.setItem(STORE_KEY + ':backup', JSON.stringify(draft)); } catch (e) { /* 略過 */ } ui.newRevision = true; }
      trip = fresh;
    }
    history = []; ui.selected = null; ui.prevDayIdx = null;
    const ti = trip.days.findIndex(d => nowIn(d.tz).date === d.date); ui.dayIdx = ti >= 0 ? ti : 0;
    if (ti >= 0 && trip.days[ti].portType !== 'embark') ui.view = 'day'; // 旅程當天直接開今天的港口卡
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
    sw.onchange = async () => { const en = trips.find(t => t.id === sw.value); try { await loadTrip(en); wxData = {}; render(); refreshFx(); refreshWeather(); toast('已切換到 ' + en.name); } catch (e) { toast('讀不到這趟旅程的資料'); } };
    bindStatic(); render(); refreshFx(); refreshWeather();
    let seen = true; try { seen = !!localStorage.getItem(GUIDE_KEY); } catch (e) { seen = true; }
    if (!seen && !NOW_AT) openGuide();
    if (!EMBED && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { /* 離線快取失敗不影響使用 */ });
    if (ui.newRevision) { ui.newRevision = false; toast('行程已更新成新版；你之前的修改備份在這台裝置（瀏覽器草稿）'); }
    window.__cruise = { get trip() { return trip; }, ui, computeDay, expenseLines, zonedToUtc };
  }
  boot();
})();
