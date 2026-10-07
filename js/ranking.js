// Ranking: Gesamtwertung und alle Kategorien aus js/daten.js.

function punkte(slug) {
  return RANKING.reduce(function (summe, k) {
    var platz = k.ranks.indexOf(slug);
    return summe + (platz === -1 ? 0 : k.ranks.length - platz);
  }, 0);
}

// Figuren, die noch in keiner Kategorie stehen, tauchen in der Wertung nicht auf.
var reihenfolge = FIGUREN.map(function (f) { return f.slug; })
  .filter(function (slug) { return punkte(slug) > 0; })
  .sort(function (a, b) { return punkte(b) - punkte(a); });
var bestwert = punkte(reihenfolge[0]);

document.getElementById('ranking-gesamt').innerHTML = reihenfolge.map(function (slug, i) {
  var f = findeFigur(slug);
  return '<li><a class="platz' + (i === 0 ? ' platz--erster' : '') + '" href="' + figurLink(slug) + '">' +
    '<span class="platz__nr">' + (i + 1) + '</span>' +
    '<div class="platz__bild"><img src="' + esc(f.images[0].src) + '" alt=""/></div>' +
    '<div class="platz__text">' +
    '<p class="platz__name">' + esc(f.name) + '</p>' +
    '<p class="platz__punkte">' + punkte(slug) + ' Punkte</p>' +
    '<div class="balken"><span style="width:' + Math.round(punkte(slug) / bestwert * 100) + '%"></span></div>' +
    '</div></a></li>';
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
