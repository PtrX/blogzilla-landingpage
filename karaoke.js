// Karaoke audiobook player for Blockzilla 2
(function(){
  const CHAPTERS = [
    { num: 1,  title: "Prolog",                  subtitle: "Was bisher geschah",        file: "chapter_01", available: true },
    { num: 2,  title: "Kapitel 1",               subtitle: "Das Geheimnis der Brüder",  file: "chapter_02", available: true },
    { num: 3,  title: "Kapitel 2",               subtitle: "Das Portal öffnet sich",    file: "chapter_03", available: true },
    { num: 4,  title: "Kapitel 3",               subtitle: "Die Minecraft‑Welt",        file: "chapter_04", available: true },
    { num: 5,  title: "Kapitel 4",               subtitle: "Blockzilla erscheint",      file: "chapter_05", available: true },
    { num: 6,  title: "Kapitel 5",               subtitle: "Der gescheiterte Kampf",    file: "chapter_06", available: true },
    { num: 7,  title: "Kapitel 6",               subtitle: "Elisaweta in der realen Welt", file: "chapter_07", available: true },
    { num: 8,  title: "Kapitel 7",               subtitle: "Der Plan",                  file: "chapter_08", available: true },
    { num: 9,  title: "Kapitel 8",               subtitle: "Die Nacht vor dem Sturm",   file: "chapter_09", available: true },
    { num: 10, title: "Kapitel 9",               subtitle: "Die Jagd und das Portal",   file: "chapter_10", available: true },
    { num: 11, title: "Kapitel 10",              subtitle: "Elisaweta rettet die Welt", file: "chapter_11", available: true },
    { num: 12, title: "Kapitel 11",              subtitle: "Die große Überraschung",    file: "chapter_12", available: true },
  ];

  const $ = sel => document.querySelector(sel);
  const root = document.getElementById('karaoke');
  if(!root) return;

  let current = null; // {chapter, words, audio}
  let rafId = null;
  let audioCtx = null, analyser = null, dataArr = null;

  // ===== render chapter list =====
  const list = document.getElementById('chapterList');
  CHAPTERS.forEach(ch => {
    const item = document.createElement('button');
    item.className = 'ch-item' + (ch.available ? '' : ' ch-soon');
    item.dataset.num = ch.num;
    item.disabled = !ch.available;
    item.innerHTML = `
      <span class="ch-num">${String(ch.num).padStart(2,'0')}</span>
      <span class="ch-text">
        <span class="ch-title">${ch.title}</span>
        <span class="ch-sub">${ch.subtitle}</span>
      </span>
      <span class="ch-status">${ch.available ? '▶' : 'BALD'}</span>
    `;
    if(ch.available){
      item.addEventListener('click', () => loadChapter(ch));
    }
    list.appendChild(item);
  });

  // ===== load + play =====
  async function loadChapter(ch){
    // mark active
    document.querySelectorAll('.ch-item').forEach(el => el.classList.toggle('active', +el.dataset.num === ch.num));
    document.getElementById('nowPlaying').textContent = `${ch.title} — ${ch.subtitle}`;

    // tear down previous
    if(current){
      try { current.audio.pause(); } catch{}
      cancelAnimationFrame(rafId);
    }

    const lyrics = document.getElementById('lyrics');
    lyrics.innerHTML = '<div class="ly-loading">Lade Kapitel…</div>';

    let json;
    try {
      const res = await fetch(`assets/audio/${ch.file}.json`);
      json = await res.json();
    } catch(e){
      lyrics.innerHTML = '<div class="ly-loading">Kapitel konnte nicht geladen werden.</div>';
      return;
    }

    const audio = new Audio(`assets/audio/${ch.file}.mp3`);
    audio.preload = 'auto';

    // build word spans
    lyrics.innerHTML = '';
    const wordEls = json.words.map((w, i) => {
      const span = document.createElement('span');
      span.className = 'ly-word';
      span.textContent = w.word;
      span.dataset.start = w.start;
      span.dataset.end = w.end;
      lyrics.appendChild(span);
      lyrics.appendChild(document.createTextNode(' '));
      return span;
    });

    current = { chapter: ch, words: json.words, wordEls, audio };

    // wire UI
    setupAudioGraph(audio);

    audio.addEventListener('loadedmetadata', () => {
      document.getElementById('totalTime').textContent = fmt(audio.duration);
    });
    audio.addEventListener('ended', () => {
      setPlaying(false);
      // auto-advance
      const idx = CHAPTERS.indexOf(ch);
      const next = CHAPTERS.slice(idx+1).find(c => c.available);
      if(next) loadChapter(next);
    });
    audio.addEventListener('timeupdate', () => {
      const pct = audio.currentTime / (audio.duration || 1) * 100;
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('progressKnob').style.left = pct + '%';
      document.getElementById('curTime').textContent = fmt(audio.currentTime);
      // persist
      try {
        localStorage.setItem('bz2_karaoke', JSON.stringify({ num: ch.num, t: audio.currentTime }));
      } catch{}
    });

    try {
      await audio.play();
      setPlaying(true);
      tick();
    } catch(e){
      setPlaying(false);
    }
  }

  // ===== karaoke tick =====
  function tick(){
    if(!current) return;
    const t = current.audio.currentTime;
    let activeIdx = -1;
    for(let i=0; i<current.words.length; i++){
      const w = current.words[i];
      if(t >= w.start && t < w.end){ activeIdx = i; break; }
      if(t < w.start){ activeIdx = i - 1; break; }
      if(i === current.words.length-1) activeIdx = i;
    }

    current.wordEls.forEach((el, i) => {
      el.classList.toggle('past', i < activeIdx);
      el.classList.toggle('active', i === activeIdx);
    });

    // auto-scroll
    if(activeIdx >= 0){
      const el = current.wordEls[activeIdx];
      const cont = document.getElementById('lyrics');
      const elTop = el.offsetTop;
      const target = elTop - cont.clientHeight/2 + el.offsetHeight/2;
      cont.scrollTo({ top: target, behavior: 'smooth' });
    }

    // visualizer
    drawViz();

    rafId = requestAnimationFrame(tick);
  }

  // ===== voxel visualizer =====
  function setupAudioGraph(audio){
    if(!audioCtx){
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        dataArr = new Uint8Array(analyser.frequencyBinCount);
      } catch(e){ return; }
    }
    try {
      const src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch(e){ /* already connected */ }
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }

  function drawViz(){
    if(!analyser) return;
    analyser.getByteFrequencyData(dataArr);
    const bars = document.querySelectorAll('.viz-bar');
    bars.forEach((b, i) => {
      const v = dataArr[i*2] / 255;
      const h = Math.max(8, v * 100);
      b.style.height = h + '%';
      b.style.opacity = .4 + v * .6;
    });
  }

  // ===== controls =====
  function setPlaying(p){
    document.getElementById('playBtn').classList.toggle('playing', p);
  }

  document.getElementById('playBtn').addEventListener('click', () => {
    if(!current){
      const first = CHAPTERS.find(c => c.available);
      loadChapter(first);
      return;
    }
    if(current.audio.paused){
      current.audio.play();
      setPlaying(true);
      tick();
    } else {
      current.audio.pause();
      setPlaying(false);
      cancelAnimationFrame(rafId);
    }
  });

  document.getElementById('skipBack').addEventListener('click', () => {
    if(!current) return;
    current.audio.currentTime = Math.max(0, current.audio.currentTime - 15);
  });
  document.getElementById('skipFwd').addEventListener('click', () => {
    if(!current) return;
    current.audio.currentTime = Math.min(current.audio.duration, current.audio.currentTime + 15);
  });

  // speed
  const speedBtn = document.getElementById('speedBtn');
  const speeds = [1, 1.25, 1.5, 0.85];
  let speedIdx = 0;
  speedBtn.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    speedBtn.textContent = speeds[speedIdx] + '×';
    if(current) current.audio.playbackRate = speeds[speedIdx];
  });

  // progress bar scrub
  const bar = document.getElementById('progressBar');
  bar.addEventListener('click', (e) => {
    if(!current || !current.audio.duration) return;
    const r = bar.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    current.audio.currentTime = pct * current.audio.duration;
  });

  // build viz bars
  const viz = document.getElementById('viz');
  for(let i=0; i<16; i++){
    const b = document.createElement('div');
    b.className = 'viz-bar';
    viz.appendChild(b);
  }

  // utils
  function fmt(s){
    if(!isFinite(s)) return '0:00';
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return m + ':' + String(sec).padStart(2,'0');
  }

  // restore
  try {
    const saved = JSON.parse(localStorage.getItem('bz2_karaoke') || 'null');
    if(saved){
      const ch = CHAPTERS.find(c => c.num === saved.num);
      if(ch && ch.available){
        // mark visually but don't autoplay until user clicks
        document.querySelectorAll('.ch-item').forEach(el => el.classList.toggle('active', +el.dataset.num === ch.num));
        document.getElementById('nowPlaying').textContent = `${ch.title} — ${ch.subtitle} (gespeichert)`;
      }
    }
  } catch{}
})();
