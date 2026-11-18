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
