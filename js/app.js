// Gemeinsamer Rahmen für alle Seiten: Kopfzeile, Menü, Fußzeile, Warenkorb.
// Braucht js/daten.js (FIGUREN) davor.

// Name der Seite: steht im Logo, in der Fußzeile und im Titel der Figurenseiten.
var SEITENNAME = 'Der Stall';

var PREIS = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
var CART_KEY = 'mxon-figuren-cart';

var MENU = [
  { href: 'index.html', label: 'Start', seite: 'start' },
  { href: 'produkte.html', label: 'Produkte', seite: 'produkte' },
  { href: 'ranking.html', label: 'Ranking', seite: 'ranking' },
  { href: 'wochenende.html', label: 'MXON 2026', seite: 'wochenende' }
];

var ICONS = {
  menu: '<path d="M4 12h16"></path><path d="M4 18h16"></path><path d="M4 6h16"></path>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
  x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
  minus: '<path d="M5 12h14"></path>',
  plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  pfeil: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
  zurueck: '<path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path>'
};

function icon(name) {
  return '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function findeFigur(slug) {
  return FIGUREN.find(function (f) { return f.slug === slug; });
}

function figurLink(slug) {
  return 'figur.html?slug=' + encodeURIComponent(slug);
}

// Querformat-Bilder (ganz:true) werden vollständig gezeigt statt beschnitten.
function bildStil(bild) {
  if (!bild.ganz) return '';
  return 'object-fit:contain;' + (bild.zoom ? 'transform:scale(' + bild.zoom + ');' : '');
}

// Die Karte einer Figur, wie sie auf Start, Produkte und der Figurenseite steht.
function figurKarte(f) {
  return '<li><a class="figur-karte" href="' + figurLink(f.slug) + '">' +
    '<div class="figur-karte__bild"><img src="' + esc(f.images[0].src) + '" alt="' + esc(f.name) + '" loading="lazy" style="' + bildStil(f.images[0]) + '"/></div>' +
    '<div class="figur-karte__text">' +
    '<p class="figur-karte__serie">' + esc(f.series) + '</p>' +
    '<h3 class="figur-karte__name">' + esc(f.name) + '</h3>' +
    '<p class="figur-karte__zeile">' + esc(f.tagline) + '</p>' +
    '<div class="figur-karte__fuss"><span class="figur-karte__preis">' + PREIS.format(f.price) + '</span>' +
    '<span class="figur-karte__pfeil">' + icon('pfeil') + '</span></div>' +
    '</div></a></li>';
}

// Spaltenzahl am großen Bildschirm (5, 4 oder 3) so wählen, dass in der
// letzten Reihe möglichst wenig Plätze leer bleiben.
function rasterKlasse(anzahl) {
  var beste = 5;
  var luecke = 99;
  [5, 4, 3].forEach(function (spalten) {
    var leer = (spalten - anzahl % spalten) % spalten;
    if (leer < luecke) { luecke = leer; beste = spalten; }
  });
  return beste === 5 ? '' : ' figuren-raster--' + beste;
}

// ---------- Warenkorb ----------

var Warenkorb = {
  zeilen: [],
  kasse: false,

  laden: function () {
    try {
      var roh = JSON.parse(window.localStorage.getItem(CART_KEY));
      if (Array.isArray(roh)) {
        this.zeilen = roh
          .filter(function (z) { return findeFigur(z.slug) && z.qty > 0; })
          .map(function (z) { return { slug: z.slug, qty: Math.min(99, Math.floor(z.qty)) }; });
      }
    } catch (e) {
      this.zeilen = [];
    }
  },

  speichern: function () {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(this.zeilen));
    } catch (e) { /* ohne Speicher läuft die Seite trotzdem */ }
  },

  anzahl: function () {
    return this.zeilen.reduce(function (n, z) { return n + z.qty; }, 0);
  },

  summe: function () {
    return this.zeilen.reduce(function (n, z) {
      var f = findeFigur(z.slug);
      return n + z.qty * (f ? f.price : 0);
    }, 0);
  },

  add: function (slug, qty) {
    if (!findeFigur(slug) || qty < 1) return;
    var zeile = this.zeilen.find(function (z) { return z.slug === slug; });
    if (zeile) zeile.qty = Math.min(99, zeile.qty + qty);
    else this.zeilen.push({ slug: slug, qty: Math.min(99, qty) });
    this.speichern();
    this.zeichnen();
    this.setOffen(true);
  },

  // Menge einer Zeile setzen, 0 nimmt sie raus.
  setMenge: function (slug, qty) {
    if (qty < 1) {
      this.zeilen = this.zeilen.filter(function (z) { return z.slug !== slug; });
    } else {
      var zeile = this.zeilen.find(function (z) { return z.slug === slug; });
      if (zeile) zeile.qty = Math.min(99, qty);
    }
    this.speichern();
    this.zeichnen();
  },

  leeren: function () {
    this.zeilen = [];
    this.speichern();
    this.zeichnen();
  },

  setOffen: function (offen) {
    var korb = document.getElementById('korb');
    korb.classList.toggle('offen', offen);
    korb.setAttribute('aria-hidden', String(!offen));
    document.body.classList.toggle('korb-offen', offen);
    if (!offen && this.kasse) { this.kasse = false; this.zeichnen(); }
    if (offen) korb.querySelector('[data-cart="zu"].btn').focus();
  },

  zeichnen: function () {
    document.getElementById('cart-count').textContent = this.anzahl();

    var inhalt;
    if (this.kasse) {
      // Es gibt nichts zu kaufen: Die Kasse ist ein Witz, kein Shop.
      inhalt = '<div class="korb__kasse"><p class="eyebrow">Kasse</p>' +
        '<h3 class="h2">Ausverkauft</h3>' +
        '<p>Strunk war schneller und hat den ganzen Stall leer gekauft.</p>' +
        '<p>Warte auf den nächsten Drop. Dein Warenkorb bleibt bis zum Restock liegen.</p>' +
        '<button type="button" data-cart="zu" class="btn btn--hell">Weiter stöbern</button></div>';
    } else if (this.zeilen.length === 0) {
      inhalt = '<p class="korb__leer">Noch leer. Die Figuren warten im Paddock.</p>';
    } else {
      inhalt = '<ul class="korb__liste">' + this.zeilen.map(function (z) {
        var f = findeFigur(z.slug);
        return '<li class="korb__zeile" data-slug="' + esc(f.slug) + '">' +
          '<img src="' + esc(f.images[0].src) + '" alt=""/>' +
          '<div class="korb__daten">' +
          '<a class="korb__name" href="' + figurLink(f.slug) + '">' + esc(f.name) + '</a>' +
          '<p class="korb__sku">' + esc(f.sku) + ' · ' + PREIS.format(f.price) + '</p>' +
          '<div class="korb__steuer">' +
          '<div class="menge menge--klein">' +
          '<button type="button" data-cart="weniger" aria-label="Weniger">' + icon('minus') + '</button>' +
          '<span>' + z.qty + '</span>' +
          '<button type="button" data-cart="mehr" aria-label="Mehr">' + icon('plus') + '</button></div>' +
          '<button type="button" data-cart="weg" class="korb__weg">Entfernen</button>' +
          '</div></div></li>';
      }).join('') + '</ul>' +
        '<div class="korb__summe"><span>Summe</span><span>' + PREIS.format(this.summe()) + '</span></div>' +
        '<button type="button" data-cart="kasse" class="btn btn--rot korb__zur-kasse">Zur Kasse</button>' +
        '<button type="button" data-cart="leeren" class="korb__leeren">Warenkorb leeren</button>';
    }
    document.getElementById('korb-inhalt').innerHTML = inhalt;
  }
};

// ---------- Rahmen ----------

function menuLinks(seite) {
  return MENU.map(function (m) {
    return '<a href="' + m.href + '"' + (m.seite === seite ? ' aria-current="page"' : '') + '>' + m.label + '</a>';
  });
}

function baueRahmen() {
  var body = document.body;
  var seite = body.dataset.seite || '';
  var links = menuLinks(seite);

  body.insertAdjacentHTML('afterbegin',
    '<div class="streifen" aria-hidden="true"><span></span><span></span><span></span></div>' +
    '<header class="kopf">' +
      '<div class="container kopf__innen">' +
        '<a class="marke" href="index.html">' + SEITENNAME + '</a>' +
        '<nav class="menu" aria-label="Menü">' + links.join('') + '</nav>' +
        '<div class="kopf__rechts">' +
          '<button type="button" id="menu-knopf" class="btn btn--hell btn--klein menu-knopf" aria-expanded="false" aria-controls="menu-mobil">' + icon('menu') + 'Menü</button>' +
          '<button type="button" id="cart-knopf" class="btn btn--hell btn--klein">' + icon('bag') +
            '<span class="korb-knopf__wort">Warenkorb</span><span id="cart-count" class="korb-zahl">0</span></button>' +
        '</div>' +
      '</div>' +
      '<nav id="menu-mobil" class="menu-mobil" aria-label="Menü" hidden><ul class="container">' +
        links.map(function (a) { return '<li>' + a + '</li>'; }).join('') +
      '</ul></nav>' +
    '</header>');

  body.insertAdjacentHTML('beforeend',
    '<footer class="fuss"><div class="container fuss__innen">' +
      '<div><a class="marke" href="index.html">' + SEITENNAME + '</a>' +
        '<p>Fan-Actionfiguren. Angefangen zum Motocross of Nations in Ernée, 2.–4. Oktober 2026.</p>' +
        '<p>Kein offizielles Merch, nichts davon steht wirklich zum Verkauf.</p></div>' +
      '<nav aria-label="Fußzeile">' + menuLinks('').join('') + '<a href="impressum.html">Impressum</a></nav>' +
    '</div></footer>' +
    '<div id="korb" class="korb" aria-hidden="true">' +
      '<button type="button" class="korb__schleier" data-cart="zu" aria-label="Warenkorb schließen" tabindex="-1"></button>' +
      '<aside class="korb__blatt" role="dialog" aria-label="Warenkorb">' +
        '<div class="korb__kopf"><h2 class="h3">Warenkorb</h2>' +
          '<button type="button" class="btn btn--hell btn--rund" data-cart="zu" aria-label="Schließen">' + icon('x') + '</button></div>' +
        '<div id="korb-inhalt" style="display:contents"></div>' +
      '</aside>' +
    '</div>');

  var menuKnopf = document.getElementById('menu-knopf');
  var menuMobil = document.getElementById('menu-mobil');
  menuKnopf.addEventListener('click', function () {
    menuMobil.hidden = !menuMobil.hidden;
    menuKnopf.setAttribute('aria-expanded', String(!menuMobil.hidden));
  });

  document.getElementById('cart-knopf').addEventListener('click', function () {
    Warenkorb.setOffen(true);
  });

  document.getElementById('korb').addEventListener('click', function (e) {
    var knopf = e.target.closest('[data-cart]');
    if (!knopf) return;
    var zeile = knopf.closest('[data-slug]');
    var eintrag = zeile && Warenkorb.zeilen.find(function (z) { return z.slug === zeile.dataset.slug; });
    switch (knopf.dataset.cart) {
      case 'zu': Warenkorb.setOffen(false); break;
      case 'leeren': Warenkorb.leeren(); break;
      case 'kasse': Warenkorb.kasse = true; Warenkorb.zeichnen(); break;
      case 'weniger': Warenkorb.setMenge(eintrag.slug, eintrag.qty - 1); break;
      case 'mehr': Warenkorb.setMenge(eintrag.slug, eintrag.qty + 1); break;
      case 'weg': Warenkorb.setMenge(eintrag.slug, 0); break;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Warenkorb.setOffen(false);
  });

  Warenkorb.laden();
  Warenkorb.zeichnen();

  // Zahlen im Text: <span data-anzahl="figuren"> und <span data-anzahl="serien">.
  var serien = FIGUREN.map(function (f) { return f.series; })
    .filter(function (s, i, alle) { return alle.indexOf(s) === i; });
  document.querySelectorAll('[data-anzahl]').forEach(function (el) {
    el.textContent = el.dataset.anzahl === 'serien' ? serien.length : FIGUREN.length;
  });

  // <ul data-figuren> wird mit allen Figuren gefüllt,
  // <ul data-figuren="4"> nur mit den ersten vier.
  document.querySelectorAll('[data-figuren]').forEach(function (liste) {
    var auswahl = FIGUREN.slice(0, Number(liste.dataset.figuren) || FIGUREN.length);
    liste.className += rasterKlasse(auswahl.length);
    liste.innerHTML = auswahl.map(figurKarte).join('');
  });
}

baueRahmen();
