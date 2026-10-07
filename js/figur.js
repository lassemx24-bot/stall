// Detailseite einer Figur: figur.html?slug=cow-caddel

(function () {
  var main = document.querySelector('main');
  var figur = findeFigur(new URLSearchParams(window.location.search).get('slug'));

  if (!figur) {
    main.innerHTML =
      '<h1 class="h1">Figur nicht da</h1>' +
      '<p class="lead">Die Seite gibt es nicht im Stall.</p>' +
      '<a class="btn btn--rot" style="margin-top:32px" href="produkte.html">Alle Produkte</a>';
    return;
  }

  document.title = figur.name + ' — ' + SEITENNAME;

  var zeile = figur.tagline;
  // Unter "Weitere Figuren" stehen die drei, die in der Liste auf diese Figur folgen.
  var stelle = FIGUREN.indexOf(figur);
  var andere = FIGUREN.slice(stelle + 1).concat(FIGUREN.slice(0, stelle)).slice(0, 3);

  main.innerHTML =
    '<a class="link link--zurueck" href="produkte.html">' + icon('zurueck') + 'Alle Produkte</a>' +

    '<section class="figur">' +
      '<div class="galerie">' +
        '<div class="galerie__bild">' +
          '<img id="figur-bild" src="" alt=""/>' +
          '<button type="button" id="soundknopf" class="soundknopf" aria-label="Sound abspielen" hidden></button>' +
        '</div>' +
        '<div class="galerie__auswahl"' + (figur.images.length > 1 ? '' : ' hidden') + '>' +
          figur.images.map(function (b) {
            return '<button type="button" class="galerie__wahl" data-bild="' + esc(b.id) + '">' +
              '<img src="' + esc(b.src) + '" alt=""/>' + esc(b.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div>' +
        '<p class="eyebrow">' + esc(figur.series) + '</p>' +
        '<h1 class="h1">' + esc(figur.name) + '</h1>' +
        (zeile ? '<p class="figur__zeile">' + esc(zeile) + '</p>' : '') +
        '<div class="figur__preis">' +
          '<div><strong>' + PREIS.format(figur.price) + '</strong>' +
          '<small>inkl. MwSt. · Artikel ' + esc(figur.sku) + '</small></div>' +
          (figur.edition ? '<span class="marke-edition">' + esc(figur.edition) + '</span>' : '') +
        '</div>' +
        '<div class="figur__kauf">' +
          '<div class="menge">' +
            '<button type="button" id="weniger" aria-label="Weniger">' + icon('minus') + '</button>' +
            '<span id="menge" aria-live="polite">1</span>' +
            '<button type="button" id="mehr" aria-label="Mehr">' + icon('plus') + '</button>' +
          '</div>' +
          '<button type="button" id="kaufen" class="btn btn--rot btn--breit">In den Warenkorb</button>' +
        '</div>' +
        '<ul class="eckdaten"' + (figur.highlights.length ? '' : ' hidden') + '>' +
          figur.highlights.map(function (h) {
            return '<li><strong>' + esc(h.value) + '</strong><span>' + esc(h.label) + '</span></li>';
          }).join('') +
        '</ul>' +
        (figur.sound || figur.spruch || figur.video ? '<p id="sound-hinweis" class="figur__hinweis">' + esc(figur.soundHinweis || 'Auf dem Bild sitzt ein Knopf.') + '</p>' : '') +
      '</div>' +
    '</section>' +

    '<section class="abschnitt"' + (figur.description.length ? '' : ' hidden') + '>' +
      '<p class="eyebrow">Produktbeschreibung</p>' +
      '<h2 class="h2">' + esc(figur.descriptionTitle) + '</h2>' +
      '<div class="text" style="margin-top:18px">' +
        figur.description.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</div>' +
    '</section>' +

    '<section class="abschnitt figur-details"' + (figur.stats.length || figur.includes.length ? '' : ' hidden') + '>' +
      '<article class="karte">' +
        '<div class="karte__kopf">' +
          '<div><p class="eyebrow eyebrow--leise">Datenkarte</p><h2 class="h3" id="karte-titel">Werte</h2></div>' +
          '<div class="reiter" role="tablist" aria-label="Datenkarte">' +
            '<button type="button" role="tab" data-karte="werte" aria-selected="true">Werte</button>' +
            '<button type="button" role="tab" data-karte="steckbrief" aria-selected="false">Steckbrief</button>' +
          '</div>' +
        '</div>' +
        '<ul class="werte" id="karte-werte">' +
          figur.stats.map(function (s) {
            return '<li><div class="werte__kopf"><span>' + esc(s.label) + '</span><span>' + s.value + '</span></div>' +
              '<div class="balken"><span style="width:' + s.value + '%"></span></div></li>';
          }).join('') +
        '</ul>' +
        '<dl class="steckbrief" id="karte-steckbrief" hidden>' +
          figur.facts.map(function (f) {
            return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
          }).join('') +
        '</dl>' +
      '</article>' +
      '<article class="karte karte--dunkel">' +
        '<p class="eyebrow">In der Box</p>' +
        '<h2 class="h2">Was mitkommt</h2>' +
        '<ul class="box-liste">' +
          figur.includes.map(function (teil, i) {
            return '<li><b>0' + (i + 1) + '</b><span>' + esc(teil) + '</span></li>';
          }).join('') +
        '</ul>' +
        '<p class="box-hinweis">' + esc(figur.note) + '</p>' +
      '</article>' +
    '</section>' +

    '<section class="abschnitt">' +
      '<div class="abschnitt__kopf"><div><p class="eyebrow">Aus dem Stall</p><h2 class="h2">Weitere Figuren</h2></div>' +
        '<a class="link" href="produkte.html">Alle Figuren' + icon('pfeil') + '</a></div>' +
      '<ul class="figuren-raster' + rasterKlasse(andere.length) + '">' + andere.map(figurKarte).join('') + '</ul>' +
    '</section>';

  // ---------- Galerie ----------

  var bildEl = document.getElementById('figur-bild');
  var soundknopf = document.getElementById('soundknopf');

  function zeigeBild(id) {
    var bild = figur.images.find(function (b) { return b.id === id; }) || figur.images[0];
    bildEl.src = bild.src;
    bildEl.style.cssText = bildStil(bild);
    bildEl.alt = figur.name + ', Ansicht ' + bild.label;
    main.querySelectorAll('[data-bild]').forEach(function (knopf) {
      knopf.setAttribute('aria-pressed', String(knopf.dataset.bild === bild.id));
    });
    soundknopf.hidden = !(bild.knob && (figur.sound || figur.spruch || figur.video));
    if (bild.knob) {
      soundknopf.style.left = bild.knob.x * 100 + '%';
      soundknopf.style.top = bild.knob.y * 100 + '%';
    }
  }

  main.querySelectorAll('[data-bild]').forEach(function (knopf) {
    knopf.addEventListener('click', function () { zeigeBild(knopf.dataset.bild); });
  });
  zeigeBild(figur.images[0].id);

  // ---------- Sound ----------

  var audio = null;
  var soundTimer = null;

  function motor(an) {
    var hinweis = document.getElementById('sound-hinweis');
    if (hinweis) hinweis.textContent = an ? (figur.soundLaeuft || 'Läuft.') : (figur.soundHinweis || 'Auf dem Bild sitzt ein Knopf.');
  }

  // Figuren ohne Tondatei können sprechen: Der Browser liest figur.spruch vor.
  // Sobald es eine Datei gibt (figur.sound), wird stattdessen die gespielt.
  function sprich() {
    if (!window.speechSynthesis) return;
    var satz = new SpeechSynthesisUtterance(figur.spruch.text);
    satz.lang = figur.spruch.sprache || 'de-DE';
    satz.pitch = figur.spruch.hoehe === undefined ? 1 : figur.spruch.hoehe;
    satz.rate = figur.spruch.tempo || 1;
    satz.onend = function () { motor(false); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(satz);
    motor(true);
  }

  // Figuren mit figur.video spielen einen Ausschnitt eines YouTube-Videos: von
  // video.start bis video.ende (Sekunden), video.mal oft hintereinander. Dafür
  // erscheint kurz ein kleiner Player unter dem Hinweis und verschwindet danach wieder.
  // Der Ton bleibt bei YouTube, es wird nichts kopiert. Ganz unsichtbar darf der
  // Player laut YouTube nicht sein. Als Datei geöffnet (Doppelklick) verweigert
  // YouTube die Wiedergabe, dann spricht der Browser.
  var youtubeBereit = null;
  var videoLaeuft = false;

  function ladeYouTube() {
    if (!youtubeBereit) {
      youtubeBereit = new Promise(function (fertig) {
        if (window.YT && window.YT.Player) { fertig(); return; }
        window.onYouTubeIframeAPIReady = fertig;
        var skript = document.createElement('script');
        skript.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(skript);
      });
    }
    return youtubeBereit;
  }

  function spieleVideo() {
    if (videoLaeuft) return;
    videoLaeuft = true;
    var v = figur.video;
    var start = v.start || 0;
    var platz = document.getElementById('sound-video');
    if (!platz) {
      platz = document.createElement('div');
      platz.id = 'sound-video';
      platz.className = 'figur__video';
      // Der Player steht ganz unten auf der Seite, unter „Weitere Figuren“.
      main.appendChild(platz);
    }
    platz.hidden = false;
    platz.innerHTML = '<div id="sound-video-player"></div>';
    motor(true);

    ladeYouTube().then(function () {
      var runde = 1;
      var takt = null;
      var notaus = null;

      function schluss() {
        window.clearInterval(takt);
        window.clearTimeout(notaus);
        try { player.destroy(); } catch (e) { /* schon weg */ }
        platz.hidden = true;
        platz.innerHTML = '';
        videoLaeuft = false;
        motor(false);
      }

      var player = new window.YT.Player('sound-video-player', {
        host: 'https://www.youtube-nocookie.com',
        videoId: v.id,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, start: start },
        events: {
          onReady: function (e) { e.target.playVideo(); },
          onError: schluss,
          onStateChange: function (e) {
            if (e.data !== window.YT.PlayerState.PLAYING || takt) return;
            takt = window.setInterval(function () {
              if (player.getCurrentTime() < v.ende) return;
              if (runde < (v.mal || 1)) {
                runde += 1;
                player.seekTo(start, true);
              } else {
                schluss();
              }
            }, 40);
          }
        }
      });
      // Falls das Video gar nicht startet (Werbung, blockiert), räumt das hier auf.
      notaus = window.setTimeout(schluss, 30000);
    });
  }

  soundknopf.addEventListener('click', function () {
    if (figur.video && window.location.protocol !== 'file:') { spieleVideo(); return; }
    if (!figur.sound) { if (figur.spruch) sprich(); return; }
    if (!audio) {
      audio = new Audio(figur.sound);
      audio.addEventListener('ended', function () { motor(false); });
    }
    // Gespielt wird nur ein Ausschnitt: ab soundStart (Sekunden), soundDauer lang.
    window.clearTimeout(soundTimer);
    audio.currentTime = figur.soundStart || 0;
    audio.play();
    motor(true);
    soundTimer = window.setTimeout(function () {
      audio.pause();
      motor(false);
    }, (figur.soundDauer || 5) * 1000);
  });

  // ---------- Menge & Warenkorb ----------

  var menge = 1;
  var mengeEl = document.getElementById('menge');
  var kaufen = document.getElementById('kaufen');

  function setMenge(n) {
    menge = Math.max(1, Math.min(9, n));
    mengeEl.textContent = menge;
  }
  document.getElementById('weniger').addEventListener('click', function () { setMenge(menge - 1); });
  document.getElementById('mehr').addEventListener('click', function () { setMenge(menge + 1); });

  kaufen.addEventListener('click', function () {
    Warenkorb.add(figur.slug, menge);
    kaufen.textContent = 'Liegt im Warenkorb';
    window.setTimeout(function () { kaufen.textContent = 'In den Warenkorb'; }, 1600);
  });

  // ---------- Datenkarte ----------

  main.querySelectorAll('[data-karte]').forEach(function (reiter) {
    reiter.addEventListener('click', function () {
      var werte = reiter.dataset.karte === 'werte';
      main.querySelectorAll('[data-karte]').forEach(function (r) {
        r.setAttribute('aria-selected', String(r === reiter));
      });
      document.getElementById('karte-werte').hidden = !werte;
      document.getElementById('karte-steckbrief').hidden = werte;
      document.getElementById('karte-titel').textContent = werte ? 'Werte' : 'Steckbrief';
    });
  });
})();
