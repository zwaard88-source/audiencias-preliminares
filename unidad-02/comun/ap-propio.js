/* Audiencias preliminares · utilidades de las piezas propias: lienzo de 767 × 510 que crece con zoom y pantalla completa
   (botón abajo a la izquierda; si el iframe no la permite, abre la escena en otra pestaña). */
(function () {
  /* Dos lienzos: 767 × 510 (pantalla dividida de la plantilla) y 1150 × 462 (franja ancha, como el marco 1113 × 448 del taller).
     Se elige por la forma del iframe, antes de que la pieza mida su contenido. */
  function ajustar() {
    var l = document.querySelector('.lienzo');
    if (!l) return;
    var ancho = window.innerWidth / Math.max(1, window.innerHeight) > 1.9;
    document.documentElement.classList.toggle('ancho', ancho);
    var k = Math.min(window.innerWidth / (ancho ? 1152 : 769), window.innerHeight / (ancho ? 464 : 512));
    l.style.zoom = k > 1.02 || k < 0.98 ? k : 1;
  }
  ajustar();
  window.addEventListener('resize', ajustar);
  document.addEventListener('DOMContentLoaded', function () {
    ajustar();
    var b = document.querySelector('[data-pantalla]');
    if (!b) return;
    function rotulo() {
      b.innerHTML = document.fullscreenElement
        ? '<i class="fas fa-compress" aria-hidden="true"></i> Clic para salir de pantalla completa'
        : '<i class="fas fa-expand" aria-hidden="true"></i> Clic para pantalla completa';
    }
    b.addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      var r = document.documentElement;
      if (r.requestFullscreen && document.fullscreenEnabled) r.requestFullscreen().catch(function () { window.open(location.href, '_blank'); });
      else window.open(location.href, '_blank');
    });
    document.addEventListener('fullscreenchange', function () { rotulo(); setTimeout(ajustar, 60); });
    rotulo();
  });
})();
