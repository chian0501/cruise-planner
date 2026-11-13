/* 原創向量插圖：墨灰圓端描邊、平塗、短高光 */
(function () {
  const INK = '#3E3A39';
  const Y = '#F6D27A', C = '#F2A497', W = '#A8D3E6', G = '#B9DAA5', P = '#DED2ED', A = '#F4C7AA';

  /* 品牌插圖 251 × 66：燈塔、郵輪、海浪、椰子島 */
  const brand = `
<svg viewBox="0 0 251 66" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="燈塔、郵輪與小島">
  <title>燈塔、郵輪與小島</title>
  <g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="214" cy="13" r="7" fill="${Y}"/>
    <path d="M150 12 q4 -4 8 0 q4 -4 8 0" stroke-width="2.4"/>
    <path d="M174 22 q3 -3 6 0 q3 -3 6 0" stroke-width="2.2"/>
    <!-- 燈塔 -->
    <path d="M16 56 L21 20 H33 L38 56 Z" fill="#fff"/>
    <path d="M18.5 40 H35.5" stroke="${C}" stroke-width="5"/>
    <path d="M17 50 H37" stroke="${C}" stroke-width="5"/>
    <path d="M16 56 L21 20 H33 L38 56 Z"/>
    <rect x="20" y="11" width="14" height="9" rx="2" fill="${Y}"/>
    <path d="M18 11 L27 4 L36 11 Z" fill="${C}"/>
    <path d="M23 15 h2" stroke="#fff" stroke-width="2"/>
    <!-- 小島 -->
    <path d="M196 56 q22 -16 46 0 Z" fill="${A}"/>
    <path d="M220 48 q-2 -16 3 -26" />
    <path d="M223 22 q-12 -4 -18 4 M223 22 q10 -6 18 1 M223 22 q-4 -10 -14 -10 M223 22 q6 -9 15 -8" fill="none" stroke-width="2.6"/>
    <path d="M205 26 q8 -6 18 -4 q-8 2 -18 4 Z M241 23 q-9 -5 -18 -1 Z" fill="${G}" stroke-width="2"/>
    <!-- 郵輪（可獨立動作） -->
    <g class="brand-vehicle">
      <path d="M70 44 H170 L160 58 H80 Z" fill="#fff"/>
      <path d="M74 49 H166" stroke="${W}" stroke-width="4"/>
      <path d="M70 44 H170 L160 58 H80 Z"/>
      <rect x="84" y="32" width="70" height="12" rx="2" fill="#fff"/>
      <rect x="94" y="22" width="48" height="10" rx="2" fill="#fff"/>
      <rect x="126" y="10" width="11" height="12" rx="2" fill="${C}"/>
      <path d="M126 14 H137" stroke="#fff" stroke-width="2.2"/>
      <circle cx="94" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <circle cx="104" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <circle cx="114" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <circle cx="124" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <circle cx="134" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <circle cx="144" cy="38" r="1.6" fill="${INK}" stroke="none"/>
      <rect x="102" y="25" width="7" height="4" rx="1" fill="${W}" stroke-width="1.8"/>
      <rect x="114" y="25" width="7" height="4" rx="1" fill="${W}" stroke-width="1.8"/>
      <path d="M88 36 h4" stroke="${W}" stroke-width="1.6"/>
    </g>
    <!-- 海浪 -->
    <path d="M4 60 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="${W}" stroke-width="3.4"/>
  </g>
</svg>`;

  /* 日期列小圖：40 × 30，線寬 1.7 */
  const parts = {
    ship: { name: '郵輪', g: `
      <path d="M4 19 H36 L32 26 H8 Z" fill="#fff"/><path d="M6 22 H34" stroke="${W}" stroke-width="2.2"/><path d="M4 19 H36 L32 26 H8 Z"/>
      <rect x="9" y="13" width="22" height="6" rx="1" fill="#fff"/><rect x="13" y="8" width="13" height="5" rx="1" fill="#fff"/>
      <rect x="22" y="3" width="5" height="5" rx="1" fill="${C}"/>
      <circle cx="13" cy="16" r=".8" fill="${INK}" stroke="none"/><circle cx="18" cy="16" r=".8" fill="${INK}" stroke="none"/><circle cx="23" cy="16" r=".8" fill="${INK}" stroke="none"/><circle cx="28" cy="16" r=".8" fill="${INK}" stroke="none"/>
      <path d="M2 28.5 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="${W}"/>` },
    lighthouse: { name: '燈塔', g: `
      <path d="M14 27 L17 9 H23 L26 27 Z" fill="#fff"/><path d="M15.4 19 H24.6" stroke="${C}" stroke-width="3"/><path d="M14 27 L17 9 H23 L26 27 Z"/>
      <rect x="16" y="4" width="8" height="5" rx="1" fill="${Y}"/><path d="M15 4 L20 1 L25 4 Z" fill="${C}"/>
      <path d="M7 6 l5 1.5 M33 6 l-5 1.5" stroke="${Y}"/>` },
    shisa: { name: '風獅爺', g: `
      <path d="M8 25 q0 -14 12 -16 q12 2 12 16 Z" fill="${Y}"/>
      <path d="M9 14 q-3 -4 1 -7 q2 -4 6 -2 q4 -4 8 0 q4 -2 6 2 q4 3 1 7" fill="${A}"/>
      <circle cx="15.5" cy="15" r="2" fill="#fff"/><circle cx="24.5" cy="15" r="2" fill="#fff"/>
      <circle cx="15.8" cy="15.2" r=".8" fill="${INK}" stroke="none"/><circle cx="24.2" cy="15.2" r=".8" fill="${INK}" stroke="none"/>
      <path d="M14 21 q6 4 12 0" fill="#fff"/><path d="M17.5 21.5 v1.6 M22.5 21.5 v1.6"/>
      <path d="M6 27 H34"/>` },
    bag: { name: '購物袋', g: `
      <path d="M9 11 H31 L33 27 H7 Z" fill="${C}"/>
      <path d="M15 11 q0 -7 5 -7 q5 0 5 7" fill="none"/>
      <path d="M14 18 l3 3 l6 -6" stroke="#fff" stroke-width="2"/>
      <path d="M11 14 v4" stroke="#fff"/>` },
    glassboat: { name: '玻璃船', g: `
      <path d="M2 16 H38 V28 H2 Z" fill="${W}" stroke="none"/>
      <path d="M5 13 H35 L31 20 H9 Z" fill="#fff"/><path d="M14 20 h12 v3 h-12 Z" fill="${W}"/>
      <path d="M5 13 H35 L31 20 H9 Z"/>
      <path d="M12 13 V8 H28 V13" fill="${Y}"/>
      <path d="M2 16 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="${INK}"/>
      <path d="M20 25 q3 -2.5 6 0 q-3 2.5 -6 0 Z M26 25 l2 -1.6 v3.2 Z" fill="${Y}"/>` },
    island: { name: '椰子島', g: `
      <path d="M5 27 q15 -9 30 0 Z" fill="${A}"/>
      <path d="M21 23 q-1 -10 2 -16"/>
      <path d="M23 7 q-7 -2 -11 3 q6 -1 11 -3 Z M23 7 q6 -4 11 0 q-6 0 -11 0 Z M23 7 q-1 -5 -7 -6 Z" fill="${G}"/>
      <circle cx="31" cy="6" r="2.4" fill="${Y}"/>` },
    suitcase: { name: '行李箱', g: `
      <rect x="10" y="8" width="20" height="17" rx="3" fill="${G}"/>
      <path d="M16 8 V5 H24 V8"/><path d="M15 10 V23 M25 10 V23" stroke="#fff" stroke-width="1.6"/>
      <rect x="10" y="8" width="20" height="17" rx="3"/>
      <circle cx="14" cy="27" r="1.4" fill="#fff"/><circle cx="26" cy="27" r="1.4" fill="#fff"/>` },
    cave: { name: '鐘乳洞', g: `
      <path d="M4 27 q2 -22 16 -22 q14 0 16 22 Z" fill="${P}"/>
      <path d="M11 27 q1 -12 9 -12 q8 0 9 12" fill="${INK}" fill-opacity=".85"/>
      <path d="M14 15 v4 M20 13 v6 M26 15 v3" stroke="#fff"/>` },
    noodle: { name: '拉麵', g: `
      <path d="M5 15 H35 q-2 11 -15 11 q-13 0 -15 -11 Z" fill="${C}"/>
      <path d="M11 15 q2 -6 4 0 M17 15 q2 -6 4 0 M23 15 q2 -6 4 0" fill="none"/>
      <path d="M26 4 L18 14 M30 5 L21 14"/><path d="M9 19 h5" stroke="#fff" stroke-width="1.6"/>` },
    bridge: { name: '跨海大橋', g: `
      <path d="M1 22 H39 V28 H1 Z" fill="${W}" stroke="none"/>
      <path d="M1 15 q19 -9 38 0" fill="none"/>
      <path d="M1 15 q19 -9 38 0 v3 q-19 -8 -38 0 Z" fill="#fff"/>
      <path d="M8 16 V25 M20 12 V25 M32 16 V25"/>
      <path d="M1 22 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="${INK}"/>
      <path d="M12 13.5 h4" stroke="${C}" stroke-width="2"/>` },
    castle: { name: '首里城', g: `
      <path d="M6 27 V17 H34 V27 Z" fill="${C}"/>
      <path d="M3 17 L20 9 L37 17 Z" fill="${C}"/>
      <path d="M10 9 L20 3 L30 9 Z" fill="${Y}"/>
      <rect x="16" y="20" width="8" height="7" rx="1" fill="${Y}"/>
      <path d="M10 20 v4 M30 20 v4" stroke="#fff"/>
      <path d="M2 27 H38"/>` },
    moon: { name: '海上夜晚', g: `
      <path d="M24 4 a9 9 0 1 0 8 12 a7 7 0 1 1 -8 -12 Z" fill="${Y}"/>
      <path d="M2 24 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="${W}"/>` }
  };

  function single(key) { return parts[key]; }

  function daySVG(keys) {
    const k = (keys && keys.length) ? keys.slice(0, 2) : ['ship'];
    const name = k.map(x => parts[x].name).join('與');
    let body;
    if (k.length === 1) body = `<g>${parts[k[0]].g}</g>`;
    else body = `<g transform="translate(-1 6) scale(.62)">${parts[k[0]].g}</g><g transform="translate(16 6) scale(.62)">${parts[k[1]].g}</g>`;
    return `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name}"><title>${name}</title><g fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  }

  /* 依當日行程挑選主圖 */
  const RULES = [
    { key: 'glassboat', re: /玻璃船|川平|浮潛|潛水/ },
    { key: 'bridge', re: /伊良部|大橋/ },
    { key: 'castle', re: /首里城/ },
    { key: 'shisa', re: /(?<!與)那霸|國際通|首里|風獅/ },
    { key: 'cave', re: /鐘乳洞|洞窟/ },
    { key: 'bag', re: /採買|購物|MAIN PLACE|市場|藥妝|Mall|COURT|outlet/i },
    { key: 'noodle', re: /拉麵|麵/ },
    { key: 'island', re: /海灘|前濱|石垣|宮古|島/ }
  ];
  function pickForDay(day, items) {
    const text = items.map(i => i.title + ' ' + (i.address || '')).join(' ') + ' ' + (day.port || '');
    const out = [];
    if (day.portType === 'embark') out.push('ship', 'lighthouse');
    else if (day.portType === 'disembark') out.push('ship', 'suitcase');
    else if (day.portType === 'sea') out.push('ship', 'moon');
    else {
      for (const r of RULES) { if (r.re.test(text) && !out.includes(r.key)) out.push(r.key); if (out.length === 2) break; }
    }
    if (!out.length) out.push(items.some(i => i.category === 'stay') ? 'suitcase' : 'ship');
    return out.slice(0, 2);
  }

  window.Illus = { brand, daySVG, pickForDay, single, parts };
})();
