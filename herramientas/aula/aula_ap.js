/* Aula de «Audiencias preliminares y medidas de aseguramiento» (Moodle de la Fiscalía, curso 120) con el estándar del aula aprobada de
   ambiental (132), como Tutela (aula_tutela.js), Tráfico y Bienes. Pedido de Sebastián (25/11/2026, noche), tras el contraste con
   ambiental: «Hacerlo ya en AP» y «en video de bienvenida debe ir el slide que es con el video y la transcripción».

   Lo que había (leído el 25/11/2026 por la noche; respaldo entregas/respaldo-aula/aula120-2026-11-25-noche-antes.json): General solo
   con «Avisos»; en la Unidad 1, «Video de bienvenida» (c-40.mp4, provisional de JP), «Presentación del curso» (Estructura_Curso.pdf,
   con la descripción de plantilla de JP) y «Glosario»; por unidad, las lecciones (SCORM de Genially) y la evaluación de JP; ninguna
   «Presentación de la unidad», ni recursos académicos, ni felicitaciones; «Cierre» vacío. Restricciones de JP con errores de copia
   (U2 L2 tras U1 L1, U2 L5 tras U1 L2, U3 L3/L4 y U4 tras lecciones de la U3…).

   Lo que queda:
     General: Ruta de navegación y éxito en el aula virtual (nueva, incrustada) · Video de bienvenida (el reproductor del curso con el
              video y su transcripción) · Presentación del curso (la página de ambiental con los colores del curso) · Glosario ·
              Avisos.
     Unidad N: Presentación de la unidad N (nueva) · lecciones en cadena (descripción y aviso de requisito) · Recursos académicos y
              referencias bibliográficas (nuevo) · Evaluación (de JP: solo la restricción) · ¡Felicitaciones! Unidad N (nueva, oculta
              hasta terminar la evaluación, con «Ver video de cierre de la unidad»).
     Cierre: Video de cierre del curso (nuevo; la encuesta y el certificado los crea JP).
   Los ZIP no se piden a 127.0.0.1 (Chrome no deja que el aula le hable a la red local): llegan a la página por el cargador de archivos
   en partes de 9,4 MB y se arman como blob (window.__zips[nombre] = 'blob:…#nombre'). Requiere aula_actividades.js (con el nombre del
   archivo tomado de «#nombre»). Fases: await apAula.fase('inicio') · 'unidades' · 'felicitaciones' · 'cierre' · 'cadena'. */
window.apAula = (function () {
  const CURSO = 120;
  const st = window.__apAula = window.__apAula || { cm: {}, filas: [] };
  const Z = (n) => { const u = (window.__zips || {})[n]; if (!u) throw new Error('falta el ZIP ' + n); return u; };
  const NOTA = (t) => '<p style="margin:0;font-size:.85rem;line-height:1.4;color:#6a6a6a">' + t + '</p>';
  const REQ = (t) => '\n<p class="ova-requisito" style="margin:6px 0 0;line-height:1.5"><i class="icon fa fa-lightbulb fa-fw" aria-hidden="true" ' +
    'style="color:#373A3C;font-size:1.05rem;margin-right:8px;vertical-align:-1px"></i><span style="background-color:#F6DDCB;color:#2F4F45;' +
    'font-weight:bold;font-size:.85rem;padding:2px 6px;border-radius:3px">' + t + '</span></p>';
  const tras = (cm, oculto) => ({ op: '&', c: [{ type: 'completion', cm: Number(cm), e: 1 }], showc: [!oculto] });
  const ARCHIVO = { showsize: 0, showtype: 0, filterfiles: 0 };
  const U = {
    1: { lecciones: [6354, 6355, 6356], quiz: 6357 },
    2: { lecciones: [6358, 6359, 6846, 6847, 6360], quiz: 6361 },
    3: { lecciones: [6364, 6365, 7342, 6366], quiz: 6367 },
    4: { lecciones: [6368, 6369, 6848, 6370], quiz: 6371 },
  };
  const PRES_CURSO = 6363, VIDEO_BIENVENIDA = 6362, GLOSARIO = 7011, AVISOS = 6177, SECCION_CIERRE = 5;
  const fila = (paso, r) => { const f = Object.assign({ paso }, r); st.filas.push(f); return f; };
  const contexto = async (cm) => { const r = await fetch(M.cfg.wwwroot + '/mod/resource/view.php?id=' + cm + '&redirect=1', { credentials: 'same-origin' }); const m = /pluginfile\.php\/(\d+)\/mod_resource\//.exec(r.url || ''); return m ? Number(m[1]) : null; };
  const intento = async (paso, f) => { try { return fila(paso, Object.assign({ ok: true }, await f())); } catch (e) { return fila(paso, { ok: false, error: String(e.message || e) }); } };

  async function inicio() {
    const out = [];
    out.push(await intento('video de bienvenida: a General', async () => { await window.aulaMover(VIDEO_BIENVENIDA, AVISOS, CURSO); return {}; }));
    out.push(fila('video de bienvenida', await window.aulaReemplazar(VIDEO_BIENVENIDA, Z('ap-video-bienvenida.zip'), ['/', 'video-de-bienvenida.html'], {
      empiezaCon: 'Video de bienvenida', intro: NOTA('Clic para ver el video de bienvenida del curso con su transcripción.'),
      mostrarDescripcion: true, ventana: [1200, 850], campos: ARCHIVO, disponibilidad: null, finalizacion: 'ver' })));
    out.push(await intento('presentación del curso: a General', async () => { await window.aulaMover(PRES_CURSO, AVISOS, CURSO); return {}; }));
    out.push(fila('presentación del curso', await window.aulaReemplazar(PRES_CURSO, Z('ap-presentacion-curso.zip'), ['/', 'presentacion-del-curso.html'], {
      empiezaCon: 'Presentación del curso',
      intro: NOTA('Clic para ver el video de presentación, las unidades, la metodología y los créditos; la presentación se puede descargar.') +
        REQ('La visualización de este contenido es requisito para avanzar: habilita la Unidad 1.'),
      mostrarDescripcion: true, ventana: [1200, 850], campos: ARCHIVO, disponibilidad: tras(VIDEO_BIENVENIDA), finalizacion: 'ver' })));
    out.push(await intento('glosario: a General', async () => { await window.aulaMover(GLOSARIO, AVISOS, CURSO); return {}; }));
    out.push(fila('glosario', await window.aulaAjustar(GLOSARIO, { empiezaCon: 'Glosario', mostrarDescripcion: true,
      intro: NOTA('Términos clave del curso, en orden alfabético.'), disponibilidad: tras(PRES_CURSO) })));
    if (!st.cm.ruta) {
      const r = await window.aulaCrear({ curso: CURSO, seccion: 0, tipo: 'resource', nombre: 'Ruta de navegación y éxito en el aula virtual', zip: Z('ap-ruta-sitio.zip'),
        principal: ['/', 'index.html'], intro: NOTA('Clic para ver primero cómo navegar el curso, cómo se ganan los puntos y qué significa cada nivel.'),
        mostrarDescripcion: true, incrustar: true, finalizacion: 'ver', antesDe: VIDEO_BIENVENIDA });
      if (r.ok) st.cm.ruta = r.cm;
      out.push(fila('ruta de navegación', r));
    }
    return out;
  }

  async function unidades() {
    const out = [];
    for (const u of [1, 2, 3, 4]) {
      const x = U[u], ultima = x.lecciones[x.lecciones.length - 1];
      if (!st.cm['pres' + u]) {
        const r = await window.aulaCrear({ curso: CURSO, seccion: u, tipo: 'resource', nombre: 'Presentación de la unidad ' + u,
          zip: Z('ap-u' + u + '-presentacion.zip'), principal: ['/recursos/unidad-0' + u + '/', 'presentacion.html'],
          intro: NOTA('Clic para ver el video de presentación, las competencias y los contenidos de la unidad.') +
            REQ('La visualización de este contenido es requisito para avanzar: habilita la Lección 1 de la Unidad ' + u + '.'),
          mostrarDescripcion: true, ventana: [1200, 850], disponibilidad: u === 1 ? tras(PRES_CURSO) : tras(U[u - 1].quiz),
          finalizacion: 'ver', antesDe: x.lecciones[0] });
        if (r.ok) st.cm['pres' + u] = r.cm;
        out.push(fila('U' + u + ' presentación', r));
      }
      if (!st.cm['recursos' + u]) {
        const r = await window.aulaCrear({ curso: CURSO, seccion: u, tipo: 'resource', nombre: 'Recursos académicos y referencias bibliográficas',
          zip: Z('ap-u' + u + '-recursos.zip'), principal: ['/recursos/unidad-0' + u + '/', 'recursos-academicos.html'],
          intro: NOTA('Recursos académicos y referencias bibliográficas de la unidad.'), mostrarDescripcion: true, ventana: [1200, 850],
          disponibilidad: tras(ultima), finalizacion: 'ver', antesDe: x.quiz });
        if (r.ok) { st.cm['recursos' + u] = r.cm; r.contexto = await contexto(r.cm); st.cm['contexto' + u] = r.contexto; }
        out.push(fila('U' + u + ' recursos', r));
      }
    }
    return out;
  }

  async function felicitaciones() {
    const out = [], F = window.__apFelic || {};
    for (const u of [1, 2, 3, 4]) {
      const k = 'felicitaciones' + u;
      if (st.cm[k]) continue;
      if (!st.cm['recursos' + u] || !st.cm['contexto' + u] || !F[u]) { out.push(fila('U' + u + ' felicitaciones', { ok: false, error: 'faltan recursos, contexto o texto' })); continue; }
      const texto = F[u].split('@@CMREC@@').join(String(st.cm['recursos' + u])).split('@@CTX@@').join(String(st.cm['contexto' + u]));
      const r = await window.aulaCrear({ curso: CURSO, seccion: u, tipo: 'label', nombre: '¡Felicitaciones! Unidad ' + u,
        texto, archivos: [Z('felicitaciones-u' + u + '.png')], disponibilidad: tras(U[u].quiz, true) });
      if (r.ok) st.cm[k] = r.cm;
      out.push(fila('U' + u + ' felicitaciones', r));
    }
    return out;
  }

  async function cierre() {
    const out = [];
    if (!st.cm.cierre) {
      const r = await window.aulaCrear({ curso: CURSO, seccion: SECCION_CIERRE, tipo: 'resource', nombre: 'Video de cierre del curso', zip: Z('ap-cierre-curso.zip'),
        principal: ['/', 'video-de-cierre.html'], intro: NOTA('Clic para ver el video de cierre del curso.'),
        mostrarDescripcion: true, ventana: [1200, 850], disponibilidad: tras(U[4].quiz), finalizacion: 'ver' });
      if (r.ok) st.cm.cierre = r.cm;
      out.push(fila('video de cierre del curso', r));
    }
    return out;
  }

  /* Cadena y descripciones de las lecciones y la evaluación, como en ambiental y Tutela: Lección 1 tras la presentación de la unidad,
     cada lección tras la anterior y la evaluación tras la última lección de su unidad. Corrige los errores de copia de JP. El paquete,
     el nombre y la finalización no se tocan. */
  async function cadena() {
    const out = [];
    for (const u of [1, 2, 3, 4]) {
      const x = U[u], pres = st.cm['pres' + u];
      if (!pres) { out.push(fila('U' + u + ' cadena', { ok: false, error: 'falta la presentación de la unidad' })); continue; }
      for (let i = 0; i < x.lecciones.length; i++) {
        const cm = x.lecciones[i], k = i + 1, ultima = i === x.lecciones.length - 1;
        out.push(fila('U' + u + ' L' + k, await window.aulaAjustar(cm, { empiezaCon: 'Lección ' + k + '.', mostrarDescripcion: true,
          intro: NOTA('Clic para abrir la lección: avance con las flechas o elija una página en el índice; con «Pantalla completa» la recorre en grande.') +
            REQ('La visualización de esta lección es requisito para avanzar: habilita ' +
              (ultima ? 'los recursos académicos y la evaluación de la Unidad ' + u + '.' : 'la Lección ' + (k + 1) + '.')),
          disponibilidad: tras(i === 0 ? pres : x.lecciones[i - 1]) })));
      }
      out.push(fila('U' + u + ' evaluación', await window.aulaAjustar(x.quiz, { empiezaCon: 'Unidad ' + u + ' - Evaluación',
        disponibilidad: tras(x.lecciones[x.lecciones.length - 1]) })));
    }
    return out;
  }

  const FASES = { inicio, unidades, felicitaciones, cierre, cadena };
  return { fase: async (n) => { try { return await FASES[n](); } catch (e) { return [{ paso: n, ok: false, error: String(e && e.message || e) }]; } }, U, st };
})();
