(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  };

  const fmt = (tz) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz });
  const me = fmt('Europe/Berlin');
  const you = fmt(undefined);
  const tick = () => {
    const d = new Date();
    $('#clock-me').textContent = me.format(d);
    $('#clock-you').textContent = you.format(d);
  };
  tick();
  setInterval(tick, 1000);

  $('#burger').onclick = () => $('#links').classList.toggle('open');
  $$('#links a').forEach((a) => a.addEventListener('click', () => $('#links').classList.remove('open')));
  $('#year').textContent = new Date().getFullYear();

  const phrases = ['JavaScript', 'Luau', 'Lua', 'Python'];
  const typed = $('#typed');
  let pi = 0, ci = 0, del = false;
  (function type() {
    const p = phrases[pi];
    typed.textContent = p.slice(0, ci);
    if (!del && ci === p.length) { del = true; return setTimeout(type, 1400); }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 40 : 90);
  })();

  const secs = $$('main section[id]');
  const navLinks = $$('#links a');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const h = document.documentElement.scrollHeight - innerHeight;
      $('#progress').style.width = (y / h * 100) + '%';
      let cur = '';
      secs.forEach((s) => { if (y >= s.offsetTop - 200) cur = s.id; });
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
      ticking = false;
    });
  }, { passive: true });

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.card, .sec-head').forEach((el) => { el.classList.add('reveal'); io.observe(el); });

  let raf = 0;
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card');
    if (!c || raf) return;
    raf = requestAnimationFrame(() => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      raf = 0;
    });
  }, { passive: true });

  const glow = $('#glow');
  let gx = 0, gy = 0, gr = 0;
  addEventListener('pointermove', (e) => {
    gx = e.clientX; gy = e.clientY;
    glow.style.opacity = 1;
    if (!gr) gr = requestAnimationFrame(() => { glow.style.transform = `translate(${gx}px,${gy}px)`; gr = 0; });
  }, { passive: true });

  if (matchMedia('(hover:hover)').matches) {
    $$('.project').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(800px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  const DISCORD_ID = '579581993050832896';

  if (/^\d{15,22}$/.test(DISCORD_ID)) {
    let spotify = null;
    const CDN = 'https://cdn.discordapp.com';
    const setText = (id, v) => { $(id).textContent = v; };

    const applyPresence = (d) => {
      const u = d.discord_user;
      $('#dc').hidden = false;
      setText('#dc-name', u.global_name || u.username);
      setText('#dc-user', u.username);
      $('#dc-avatar').src = u.avatar
        ? `${CDN}/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
        : `${CDN}/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;
      const dot = $('#dc-dot');
      dot.className = ['online', 'idle', 'dnd'].includes(d.discord_status) ? d.discord_status : 'off';
      const custom = (d.activities || []).find((a) => a.type === 4);
      const game = (d.activities || []).find((a) => a.type === 0);
      setText('#dc-status', custom && custom.state ? custom.state : game ? `Playing ${game.name}` : '');
      spotify = d.listening_to_spotify ? d.spotify : null;
      const box = $('#dc-music');
      box.hidden = !spotify;
      if (spotify) {
        $('#dc-art').src = spotify.album_art_url;
        setText('#dc-title', spotify.song);
        setText('#dc-artist', spotify.artist.replace(/;/g, ','));
      }
    };

    const progress = () => {
      if (!spotify) return;
      const { start, end } = spotify.timestamps;
      const p = Math.min(100, Math.max(0, (Date.now() - start) / (end - start) * 100));
      $('#dc-prog').style.width = p + '%';
    };
    setInterval(progress, 1000);

    const loadPresence = () => fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) { applyPresence(j.data); progress(); } })
      .catch(() => {});
    loadPresence();
    setInterval(loadPresence, 15000);

    fetch(`https://dcdn.dstn.to/profile/${DISCORD_ID}`)
      .then((r) => r.json())
      .then((p) => {
        const user = p.user || {};
        const banner = $('#dc-banner');
        if (user.banner) banner.style.backgroundImage = `url(${CDN}/banners/${DISCORD_ID}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=600)`;
        else if (user.banner_color) banner.style.backgroundColor = user.banner_color;
        const wrap = $('#dc-badges');
        (p.badges || []).forEach((b) => {
          const img = document.createElement('img');
          img.src = `${CDN}/badge-icons/${b.icon}.png`;
          img.alt = b.description || 'Badge';
          img.title = b.description || '';
          img.loading = 'lazy';
          wrap.appendChild(img);
        });
      })
      .catch(() => {});
  }

  const out = $('#term-out');
  const input = $('#term-in');
  const say = (text, cls) => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const commands = {
    help: () => ['Commands you can try', 'whoami   skills   work   visits   price   bugs   contact   time   clear'],
    whoami: () => ['Mistmade90, developer and scripter. Head Developer at BTGE.'],
    skills: () => ['JavaScript, Luau, Lua and Python'],
    work: () => ['BTGE  Head Developer, Head Scripter (current)', 'IRF   Scripter, Contractor (current)', 'JTGR  Deputy Head Developer, Head Scripter (former)'],
    visits: () => ['Nearly 5M contributed place visits across all games I developed for'],
    price: () => ['Always fair and under 450€. It depends on the effort and we talk it out in DMs.'],
    bugs: () => ['Bugs in my work get fixed for free. You only pay for the product.'],
    contact: () => ['Email    mistmade90@gmail.com', 'Discord  mistmade90', 'Roblox   Mistmade90'],
    time: () => [new Date().toLocaleString('en-GB')],
    clear: () => { out.textContent = ''; return []; }
  };
  const history = [];
  let hi = 0;
  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    history.push(cmd);
    hi = history.length;
    say(raw.trim(), 'cmd');
    const fn = commands[cmd];
    if (fn) fn().forEach((l, i) => say(l, i === 0 && cmd === 'help' ? 'hl' : ''));
    else say(`command not found ${cmd}, type help`);
  };
  say('Welcome. Type help to see what this terminal can do.', 'hl');
  $('#term-form').addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = history[hi]; }
    if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; }
  });
  $$('.term-chips button').forEach((b) => b.addEventListener('click', () => run(b.dataset.cmd)));

  const modeBtn = $('#mode');
  const setMode = (on) => {
    document.documentElement.classList.toggle('imperial', on);
    document.body.classList.toggle('imperial', on);
    modeBtn.textContent = on ? 'Back to normal' : 'Imperial mode';
    try { localStorage.setItem('imperial', on ? '1' : '0'); } catch (e) {}
  };
  modeBtn.addEventListener('click', () => { const on = !document.body.classList.contains('imperial'); setMode(on); if (on) toast('The Empire approves'); });
  try { if (localStorage.getItem('imperial') === '1') setMode(true); } catch (e) {}

  $('#copy-mail').addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText('mistmade90@gmail.com').then(() => toast('Email copied'), () => { location.href = 'mailto:mistmade90@gmail.com'; });
  });
  $('#copy-discord').addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText('mistmade90').then(() => toast('Discord name copied'), () => toast('mistmade90'));
  });

  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = encodeURIComponent(`${f.get('msg')}\n\nFrom ${f.get('name')} (${f.get('email')})`);
    location.href = `mailto:mistmade90@gmail.com?subject=Portfolio%20message&body=${body}`;
    e.target.reset();
  });
})();
