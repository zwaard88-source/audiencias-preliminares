/* Audiencias preliminares · utilidades de las piezas propias: lienzo de 767 × 510 que crece con zoom y pantalla completa
   (botón abajo a la izquierda; si el iframe no la permite, abre la escena en otra pestaña). */
(function () {
  function ajustar() {
    var l = document.querySelector('.lienzo');
    if (!l) return;
    var k = Math.min(window.innerWidth / 769, window.innerHeight / 512);
    l.style.zoom = k > 1.02 || k < 0.98 ? k : 1;
  }
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
