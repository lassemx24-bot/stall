// Ranking: Gesamtwertung und alle Kategorien aus js/daten.js.

var reihenfolge = rangliste();

document.getElementById('ranking-gesamt').innerHTML = reihenfolge.map(function (slug, i) {
  return platzKarte(slug, i, punkte(reihenfolge[0]));
}).join('');

document.getElementById('ranking-anzahl').textContent = RANKING.length + ' Kategorien';

document.getElementById('ranking-kategorien').innerHTML = RANKING.map(function (k) {
  return '<section class="karte kategorie">' +
    '<h3 class="h3">' + esc(k.name) + '</h3>' +
    '<p class="kategorie__notiz">' + esc(k.note) + '</p>' +
    '<p class="kategorie__text">' + esc(k.text) + '</p>' +
    '<ol class="rang-liste">' +
    k.ranks.map(function (slug, i) {
      var f = findeFigur(slug);
      return '<li><a class="rang" href="' + figurLink(slug) + '">' +
        '<div class="rang__bild"><img src="' + esc(f.images[0].src) + '" alt="" loading="lazy"/>' +
        '<span class="rang__nr">' + (i + 1) + '</span></div>' +
        esc(f.name) + '</a></li>';
    }).join('') +
    '</ol></section>';
}).join('');
