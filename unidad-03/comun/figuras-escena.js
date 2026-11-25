/* Figura de la ficha junto al texto que la cita (motor común; primero en Bienes en el proceso penal).
   María Paula Hernández, revisora, 19/11/2026, U1 L1: «Se cita la imagen pero no hay imagen». La ventana de la escena decía
   «…La metodología puede sintetizarse en la siguiente secuencia: (Imagen 2, generada con ChatGPT, 2026)» y la imagen solo estaba
   en una página aparte de Genially.

   La lección trae sus figuras en <script type="application/json" id="figuras">{"<id>": {"cita": "(imagen 2, …)", "titulo",
   "pie", "src", "w", "h"}}</script> (lo escribe herramientas/figuras_escena.py, con "src" relativo a la página para que el
   empaquetado SCORM lleve la imagen). Donde el texto de una ventana o de una lectura dice la cita, debajo de ese párrafo aparece
   la imagen original con el botón «Ver la imagen N en grande», que la abre en una ventana de la misma página (Cerrar o Escape;
   «Ampliar» la muestra a su tamaño real, con desplazamiento). El texto de la ficha no cambia.
   Una figura rehecha en HTML (Bienes, 19/11/2026, imagen 4: «quita las balanzas y los martillos»; herramientas/
   infografias_bienes.py) trae "html": junto a la cita va su vista previa y la ventana abre la infografía interactiva en un
   iframe (sin «Ampliar»; Escape dentro de ella también cierra, por mensaje). */
(function () {
  'use strict';
  var nodo = document.getElementById('figuras');
  if (!nodo) return;
  var F;
  try { F = JSON.parse(nodo.textContent); } catch (e) { return; }
  var norma = function (t) { return (t || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
  var lista = Object.keys(F).map(function (k) { var f = F[k]; f.id = k; f.clave = norma(f.cita); return f; })
    .filter(function (f) { return f.clave && f.src; });
  if (!lista.length) return;
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var numero = function (f) { var m = /imagen\s+(\d+)/i.exec(f.cita); return m ? m[1] : ''; };
  /* «etiqueta» (Delitos informáticos, 23/11/2026: «Figura 3», «Figura 5» del documento, con «IMAGEN DEL DOCUMENTO CON LUPA»): el
     nombre con que se presenta la figura. Sin ella, como siempre: «Imagen N». */
  var nombre = function (f) { return f.etiqueta || ('Imagen ' + numero(f)); };

  var css = document.createElement('style');
  css.textContent =
    '.fig-escena{margin:.5em 0 .9em;padding:.55em;border:1px solid var(--coral,#8AC4B8);border-radius:10px;background:var(--fondo,#fff);' +
      'display:flex;flex-direction:column;align-items:center;gap:.45em}' +
    '.fig-escena-img{display:block;max-width:100%;max-height:210px;width:auto;height:auto;object-fit:contain;cursor:zoom-in;border-radius:6px}' +
    '.fig-escena-btn,.fig-vista button{font-family:inherit;font-weight:600;font-size:13px;line-height:1.2;color:#fff;background:var(--marino,#07415C);border:0;' +
      'border-radius:999px;padding:.5em 1em;cursor:pointer;display:inline-flex;align-items:center;gap:.45em}' +
    '.fig-escena-btn:hover,.fig-vista button:hover{background:var(--teal,#24635B)}' +
    '.fig-escena-btn:focus-visible,.fig-vista button:focus-visible,.fig-escena-img:focus-visible{outline:3px solid var(--coral,#8AC4B8);outline-offset:2px}' +
    '.fig-vista{position:fixed;inset:0;z-index:2147483000;background:rgba(7,65,92,.55);display:flex;align-items:center;justify-content:center;padding:10px}' +
    '.fig-vista[hidden],.fig-vista [hidden]{display:none!important}' +
    '.fig-vista-caja{background:var(--fondo,#fff);border-radius:12px;box-shadow:0 10px 30px rgba(7,65,92,.35);width:100%;max-width:1100px;' +
      'height:100%;max-height:100%;display:flex;flex-direction:column;overflow:hidden;color:var(--tinta,#07415C)}' +
    '.fig-vista-cab{display:flex;align-items:center;gap:.6em;padding:.55em .8em;border-bottom:2px solid var(--niebla,#E3F2F5)}' +
    '.fig-vista-cab h2{flex:1;margin:0;font-size:15px;line-height:1.3;font-weight:700}' +
    '.fig-vista-lienzo{flex:1;min-height:0;overflow:auto;display:flex;align-items:center;justify-content:center;background:var(--niebla,#E3F2F5)}' +
    '.fig-vista-lienzo img{max-width:100%;max-height:100%;cursor:zoom-in;display:block}' +
    '.fig-vista-lienzo iframe{width:100%;height:100%;border:0;display:block;background:#fff}' +
    '.fig-vista.html .fig-vista-lienzo{background:#fff}.fig-vista.html .fig-vista-pie{display:none}' +
    '.fig-vista.real .fig-vista-lienzo{align-items:flex-start;justify-content:flex-start}' +
    '.fig-vista.real .fig-vista-lienzo img{max-width:none;max-height:none;cursor:zoom-out}' +
    '.fig-vista-pie{margin:0;padding:.45em .8em;font-size:12.5px;line-height:1.4}';
  document.head.appendChild(css);

  var vista, img, marco, titulo, pie, ampliar, cerrarBtn, antes = null;
  function construir() {
    vista = document.createElement('div');
    vista.className = 'fig-vista';
    vista.hidden = true;
    vista.setAttribute('role', 'dialog');
    vista.setAttribute('aria-modal', 'true');
    vista.setAttribute('aria-labelledby', 'fig-vista-titulo');
    vista.innerHTML = '<div class="fig-vista-caja"><div class="fig-vista-cab"><h2 id="fig-vista-titulo"></h2>' +
      '<button type="button" class="fig-vista-ampliar"><i class="fas fa-magnifying-glass-plus" aria-hidden="true"></i> <span>Ampliar</span></button>' +
      '<button type="button" class="fig-vista-cerrar"><i class="fas fa-xmark" aria-hidden="true"></i> Cerrar</button></div>' +
      '<div class="fig-vista-lienzo"><img alt=""></div><p class="fig-vista-pie"></p></div>';
    img = vista.querySelector('img');
    marco = document.createElement('iframe');
    marco.hidden = true;
    marco.setAttribute('allowfullscreen', '');
    img.parentNode.appendChild(marco);
    titulo = vista.querySelector('h2');
    pie = vista.querySelector('.fig-vista-pie');
    ampliar = vista.querySelector('.fig-vista-ampliar');
    cerrarBtn = vista.querySelector('.fig-vista-cerrar');
    ampliar.addEventListener('click', alternar);
    img.addEventListener('click', alternar);
    cerrarBtn.addEventListener('click', cerrar);
    vista.addEventListener('click', function (e) { if (e.target === vista) cerrar(); });
    window.addEventListener('message', function (e) { if (e.data && e.data.ova === 'figura-cerrar' && !vista.hidden) cerrar(); });
    document.addEventListener('focusin', function (e) { if (!vista.hidden && !vista.contains(e.target)) cerrarBtn.focus(); });
  }
  function alternar() {
    var real = vista.classList.toggle('real');
    ampliar.querySelector('span').textContent = real ? 'Ajustar' : 'Ampliar';
    ampliar.querySelector('i').className = 'fas ' + (real ? 'fa-magnifying-glass-minus' : 'fa-magnifying-glass-plus');
  }
  function tecla(e) {
    if (vista.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); cerrar(); return; }
    if (e.key === 'Tab') {
      var f = vista.classList.contains('html') ? [cerrarBtn, marco] : [ampliar, cerrarBtn], i = f.indexOf(document.activeElement);
      e.preventDefault(); e.stopImmediatePropagation();
      f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
    }
  }
  function abrir(f, desde) {
    if (!vista) construir();
    (document.fullscreenElement || document.body).appendChild(vista);
    vista.classList.remove('real');
    ampliar.querySelector('span').textContent = 'Ampliar';
    ampliar.querySelector('i').className = 'fas fa-magnifying-glass-plus';
    var html = !!f.html;
    vista.classList.toggle('html', html);
    ampliar.hidden = html;
    img.hidden = html;
    marco.hidden = !html;
    marco.title = nombre(f) + ': ' + f.titulo;
    if (html) marco.src = f.html + (f.html.indexOf('?') < 0 ? '?' : '&') + 'embebido=1';
    img.src = f.src;
    img.alt = nombre(f) + ': ' + f.titulo;
    titulo.textContent = nombre(f) + '. ' + f.titulo;
    pie.textContent = f.pie || '';
    antes = desde || document.activeElement;
    vista.hidden = false;
    window.addEventListener('keydown', tecla, true);
    cerrarBtn.focus();
  }
  function cerrar() {
    vista.hidden = true;
    if (marco && !marco.hidden) marco.src = 'about:blank';
    window.removeEventListener('keydown', tecla, true);
    if (antes && antes.focus) antes.focus();
  }

  /* Bloque del párrafo que lleva la cita, solo dentro de una lectura completa (ventana, lector u hoja), nunca en un extracto. */
  function bloque(t) {
    var el = t.parentElement;
    if (!el || el.closest('.fig-escena, .fig-vista, script, style')) return null;
    if (!el.closest('.lector, .lectura-texto, .hoja-texto, .giro-paso-texto, .texto-fijo, .ventana, [role="dialog"]')) return null;
    return el.closest('.parr, p, li') || el;
  }
  function figuraHtml(f) {
    var n = nombre(f);
    return '<img class="fig-escena-img" src="' + esc(f.src) + '" alt="' + esc(n) + ': ' + esc(f.titulo) + '"' +
      (f.w && f.h ? ' width="' + f.w + '" height="' + f.h + '"' : '') + ' tabindex="-1">' +
      '<button type="button" class="fig-escena-btn"><i class="fas ' + (f.etiqueta ? 'fa-magnifying-glass-plus' : 'fa-expand') + '" aria-hidden="true"></i> ' + (f.etiqueta ? 'Clic para ver la ' + esc(f.etiqueta.toLowerCase()) + ' en grande' : 'Ver la ' + esc(n.toLowerCase()) + ' en grande') + '</button>';
  }
  function revisar() {
    var raiz = document.getElementById('ova') || document.body;
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), t, hallados = [];
    while ((t = w.nextNode())) {
      var v = norma(t.nodeValue);
      if (v.indexOf('imagen') < 0 && v.indexOf('figura') < 0) continue;
      for (var i = 0; i < lista.length; i++) {
        if (v.indexOf(lista[i].clave) >= 0) { var b = bloque(t); if (b) hallados.push([b, lista[i]]); }
      }
    }
    hallados.forEach(function (h) {
      var b = h[0], f = h[1], sig = b.nextElementSibling;
      if (sig && sig.classList.contains('fig-escena') && sig.getAttribute('data-figura') === f.id) return;
      var fig = document.createElement('figure');
      fig.className = 'fig-escena';
      fig.setAttribute('data-figura', f.id);
      fig.innerHTML = figuraHtml(f);
      fig.querySelector('button').addEventListener('click', function () { abrir(f, this); });
      fig.querySelector('img').addEventListener('click', function () { abrir(f, fig.querySelector('button')); });
      b.parentNode.insertBefore(fig, b.nextSibling);
    });
  }
  var pendiente = 0;
  new MutationObserver(function () {
    if (pendiente) return;
    pendiente = setTimeout(function () { pendiente = 0; revisar(); }, 120);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  revisar();
})();
