// Produktseite: alle Figuren, nach Serie filterbar.
// produkte.html?serie=Goated öffnet die Seite direkt mit dieser Serie.

(function () {
  var filter = document.getElementById('serien-filter');
  var liste = document.getElementById('produkt-liste');

  var serien = FIGUREN.map(function (f) { return f.series; })
    .filter(function (s, i, alle) { return alle.indexOf(s) === i; });

  var gewaehlt = new URLSearchParams(window.location.search).get('serie');
  if (serien.indexOf(gewaehlt) === -1) gewaehlt = '';

  function zeichnen() {
    var sichtbar = FIGUREN.filter(function (f) { return !gewaehlt || f.series === gewaehlt; });

    filter.innerHTML = [''].concat(serien).map(function (s) {
      var anzahl = s ? FIGUREN.filter(function (f) { return f.series === s; }).length : FIGUREN.length;
      return '<button type="button" class="chip" data-serie="' + esc(s) + '" aria-pressed="' + (s === gewaehlt) + '">' +
        esc(s || 'Alle') + '<small>' + anzahl + '</small></button>';
    }).join('');

    liste.className = 'figuren-raster' + rasterKlasse(sichtbar.length);
    liste.innerHTML = sichtbar.map(figurKarte).join('');
  }

  filter.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-serie]');
    if (!chip) return;
    gewaehlt = chip.dataset.serie;
    zeichnen();
  });

  zeichnen();
})();
