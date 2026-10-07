// Startseite: Figur im Fokus, Serien und die ersten drei der Wertung.
// Alles kommt aus js/daten.js und wächst mit, wenn dort etwas dazukommt.

(function () {
  // ---------- Figur im Fokus: die erste mit einer Edition ----------

  var fokus = FIGUREN.find(function (f) { return f.edition; });
  if (fokus) {
    var auflage = (fokus.facts.find(function (x) { return x[0] === 'Auflage'; }) || [])[1];
    var bild = fokus.images[fokus.images.length - 1];
    document.getElementById('start-fokus').innerHTML =
      '<a class="fokus" href="' + figurLink(fokus.slug) + '">' +
        '<div class="fokus__bild"><img src="' + esc(bild.src) + '" alt="' + esc(fokus.name) + ', ' + esc(bild.label) + '" loading="lazy"/></div>' +
        '<div class="fokus__text">' +
          '<p class="eyebrow">' + esc(fokus.edition) + (auflage ? ' · ' + esc(auflage) : '') + '</p>' +
          '<h2 class="h1">' + esc(fokus.name) + '</h2>' +
          (fokus.tagline ? '<p class="fokus__zeile">' + esc(fokus.tagline) + '</p>' : '') +
          '<p class="fokus__beschreibung">' + esc(fokus.description[0] || '') + '</p>' +
          '<div class="fokus__fuss"><span class="fokus__preis">' + PREIS.format(fokus.price) + '</span>' +
          '<span class="btn btn--rot">Zur Figur' + icon('pfeil') + '</span></div>' +
        '</div>' +
      '</a>';
  }

  // ---------- Serien ----------

  var serien = FIGUREN.map(function (f) { return f.series; })
    .filter(function (s, i, alle) { return alle.indexOf(s) === i; });

  document.getElementById('start-serien').innerHTML = serien.map(function (serie) {
    var figuren = FIGUREN.filter(function (f) { return f.series === serie; });
    return '<li><a class="serie" href="produkte.html?serie=' + encodeURIComponent(serie) + '">' +
      '<div class="serie__bilder">' + figuren.slice(0, 4).map(function (f) {
        return '<div><img src="' + esc(f.images[0].src) + '" alt="" loading="lazy" style="' + bildStil(f.images[0]) + '"/></div>';
      }).join('') + '</div>' +
      '<div class="serie__text"><div>' +
        '<p class="eyebrow eyebrow--leise">' + figuren.length + (figuren.length === 1 ? ' Figur' : ' Figuren') + '</p>' +
        '<h3 class="h3">' + esc(serie) + '</h3></div>' +
        '<span class="figur-karte__pfeil">' + icon('pfeil') + '</span>' +
      '</div></a></li>';
  }).join('');

  // ---------- Wertung: die ersten drei ----------

  var liste = rangliste();
  document.getElementById('start-wertung').innerHTML = liste.slice(0, 3).map(function (slug, i) {
    return platzKarte(slug, i, punkte(liste[0]));
  }).join('');
})();
