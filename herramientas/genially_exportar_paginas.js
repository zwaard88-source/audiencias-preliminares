/* Exporta las páginas de una creación de Genially por lección (solo lectura) para armar el SCORM del aula igual a Genially.
   Pedido de Esteban (07/11/2026, «Copiar desde Genially»), por la reunión con Juan del 07/11 (19:28): «cuando subas a Moodle,
   que [quede] tal como está aquí… porque aquí es que va a venir la editora».

   Se corre en app.genially.com (sesión de la cuenta de Juan). En el navegador integrado (que no deja hablar con el equipo
   ni descargar), se pega este archivo con la herramienta de JavaScript y se devuelve el texto escapado a ASCII:
     gexAscii(await gex.leer([{ id, u, l }, …]))   // unas 5 lecciones por llamada
   y el resultado guardado se pasa con herramientas/genially_importar_paginas.py. En un navegador que sí deja hablar con
   127.0.0.1 (con herramientas/receptor_genially.py escuchando): await gex.exportar([{ id, u, l }], 'cursos/<curso>').
   Lee GET api.genially.com/api/v1/geniallys/<id>/editor (no abre el editor ni cambia nada) y manda al receptor un JSON
   compacto: las páginas visibles desde la primera hasta «… · Fin» (lo que sigue al fin son restos de la plantilla y se
   cuentan aparte), con sus elementos (formas SVG con su código y colores, textos con su HTML y estilo, imágenes con su URL y
   recorte, iframes, grupos) y los destinos de los clics (goToSlide). Lo dibuja herramientas/genially_scorm.py. */
window.gex = (function () {
  const API = 'https://api.genially.com/api/v1/geniallys/';
  const px = (v) => (v === undefined || v === null || v === '' ? 0 : parseFloat(String(v)));
  const rot = (r) => { const m = /rotate\((-?[\d.]+)deg\)/.exec((r && r.Rotatione) || ''); return m ? +m[1] % 360 : 0; };

  function compactar(j) {
    const tarea = (v) => { const m = /^https:\/\/\$task\/(.+)$/.exec(String(v || '')); return m ? (j.tasks[m[1]] || {}).value : v; };
    const ordenadas = j.Slides.filter((s) => !s.Hidden && !s.Popup).sort((a, b) => a.Order - b.Order);   // las ventanas emergentes no son páginas (Desaparición: 13 de la plantilla, 11/11/2026)
    const iFin = ordenadas.findIndex((s) => /·\s*Fin\s*$/.test(s.Name || ''));
    const usadas = iFin >= 0 ? ordenadas.slice(0, iFin + 1) : ordenadas;
    const ids = new Set(usadas.map((s) => s.Id));
    const destino = (x) => {
      const out = {};
      for (const [ev, ref] of Object.entries(x.interactivities || {})) {
        const a = j.interactivityActions[ref];
        // goToSlide va a una página (slideId) o es relativo (smartLink: nextPage, previousPage…)
        if (a && a.type === 'goToSlide' && a.target) out[ev] = a.target.slideId ? { ir: a.target.slideId } : { enlace: a.target.smartLink };
        else if (a) out[ev] = { tipo: a.type };
      }
      return Object.keys(out).length ? out : undefined;
    };
    const base = (tipo, x) => ({
      tipo, id: x.Id, pagina: x.IdSlide, grupo: x.IdGroup || null, z: x.BigZIndex !== undefined ? +x.BigZIndex : +x.ZIndex,
      x: px(x.Position && x.Position.PositionLeft), y: px(x.Position && x.Position.PositionTop),
      w: px(x.Size && x.Size.Width), h: px(x.Size && x.Size.Height), rot: rot(x.Rotation), op: x.Opacity === undefined ? 1 : +x.Opacity,
      entrada: x.EffectIn && x.EffectIn !== 'none' ? x.EffectIn : undefined, oculto: x.IsHidden || undefined, clic: destino(x),
    });
    const items = [];
    const svgs = {};
    for (const x of j.Svgs) if (ids.has(x.IdSlide)) {
      svgs[x.SourceSvg] = j.svgRefs[x.SourceSvg];
      items.push(Object.assign(base('svg', x), { ref: x.SourceSvg, colores: x.Colors || [], proporcion: !!x.AspectRatio }));
    }
    for (const x of j.Texts) if (ids.has(x.IdSlide)) {
      items.push(Object.assign(base('texto', x), {
        // El editor dibuja Content (documento ProseMirror); TextMessage puede quedar viejo («Título 1» en la portada)
        html: x.TextMessage, contenido: x.Content, version: x.Version, color: x.Color, tam: x.FontSize, fuente: x.FontFamily, fuenteUrl: x.FontFamilyUrl || undefined,
        clases: x.Classes && x.Classes.length ? x.Classes : undefined,   // text-align-center…: la alineación del bloque va aquí
        interlineado: x.LineHeight, espaciado: x.LetterSpacing, fondo: x.Background || undefined, relleno: x.Padding,
        sombra: x.Shadow || undefined, vertical: x.VerticalAlign, entreParrafos: x.InterParagraph, estilo: x.BrandStyle || undefined,
      }));
    }
    for (const x of j.Images) if (ids.has(x.IdSlide)) {
      const off = tarea(x.Offset);
      items.push(Object.assign(base('imagen', x), {
        src: tarea(x.Source), recorte: off && typeof off === 'object' ? off : undefined, ajustes: x.Adjustments, filtro: x.Filter,
        marco: x.Frame, giro: x.Transformations,
      }));
    }
    for (const x of j.RichContents) if (ids.has(x.IdSlide)) items.push(Object.assign(base('html', x), { fuente: x.Source }));
    for (const x of j.Groups) if (ids.has(x.IdSlide)) items.push(base('grupo', x));
    // Menú de navegación de Genially (@genially/menu, transversal: va en las páginas de includedSlideIds). Enfoque diferencial,
    // 10/11/2026: el índice de la lección es este widget, así que el SCORM lo dibuja (herramientas/genially_scorm.py).
    const menus = [];
    for (const x of j.BaseWidgets || []) {
      const cfg = x.script && x.script.scriptId === '@genially/menu' && x.script.config;
      if (!cfg || x.IsHidden) continue;
      const enPags = (x.includedSlideIds && x.includedSlideIds.length ? x.includedSlideIds : [x.IdSlide]).filter((s) => ids.has(s));
      if (!enPags.length) continue;
      menus.push({
        id: x.Id, x: px(x.Position && x.Position.PositionLeft), y: px(x.Position && x.Position.PositionTop),
        w: px(x.Size && x.Size.Width), h: px(x.Size && x.Size.Height), z: x.BigZIndex !== undefined ? +x.BigZIndex : +x.ZIndex,
        paginas: enPags, icono: cfg.hamburgerIconColor, fondo: cfg.backgroundColor, tema: cfg.menuTheme,
        items: (cfg.menuItems || []).map((m) => {
          const a = m.menuItemAction && m.menuItemAction.action, t = (a && a.target) || {};
          return { nombre: m.menuItemName, ir: t.slideId, enlace: t.smartLink, texto: m.textColor, fondo: m.backgroundColor };
        }),
      });
    }
    const otros = ['Activities', 'Areas', 'Arrows', 'ContainerBoxes', 'Charts', 'Pins', 'Audios', 'Videos']
      .map((t) => [t, (j[t] || []).filter((x) => ids.has(x.IdSlide)).length]).filter(([, n]) => n);
    const widgets = (j.BaseWidgets || []).filter((x) => ids.has(x.IdSlide) && !(x.script && x.script.scriptId === '@genially/menu')).length;
    if (widgets) otros.push(['BaseWidgets', widgets]);
    return {
      id: j.Genially && (j.Genially.Id || j.Genially.id), nombre: j.Genially && (j.Genially.Name || j.Genially.name),
      exportado: new Date().toISOString(), colores: j.DocumentConfig && j.DocumentConfig.colors,
      paginas: usadas.map((s) => ({ id: s.Id, nombre: s.Name, orden: s.Order, fondo: s.BackgroundColor,
        fondoImagen: /backgroundStandard\.png$/.test(s.Background || '') ? undefined : s.Background,
        ancho: px(s.Size && s.Size.Width) || 1200, alto: px(s.Size && s.Size.Height) || 675 })),
      restos: iFin >= 0 ? ordenadas.slice(iFin + 1).map((s) => ({ orden: s.Order, nombre: s.Name })) : [],
      sinFin: iFin < 0, otros, items, svgs, menus,
    };
  }

  async function leer(lista) {
    const out = [];
    for (const { id, u, l } of lista) {
      const r = await fetch(API + id + '/editor', { credentials: 'include' });
      out.push(r.ok ? { u, l, leccion: compactar(await r.json()) } : { id, u, l, error: 'HTTP ' + r.status });
    }
    return out;
  }

  async function exportar(lista, curso, puerto = 8799) {
    const res = [];
    for (const { id, u, l } of lista) {
      const r = await fetch(API + id + '/editor', { credentials: 'include' });
      if (!r.ok) { res.push({ id, u, l, error: 'HTTP ' + r.status }); continue; }
      const c = compactar(await r.json());
      const ruta = `${curso}/entregas/unidad-0${u}/leccion-0${l}/genially/paginas.json`;
      const g = await fetch(`http://127.0.0.1:${puerto}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruta, leccion: c }) });
      res.push({ u, l, nombre: c.nombre, paginas: c.paginas.length, restos: c.restos.length, sinFin: c.sinFin, otros: c.otros,
        guardado: g.ok });
    }
    return res;
  }
  return { compactar, leer, exportar };
})();
// Texto escapado a ASCII: la herramienta del navegador daña los caracteres no ASCII al guardar resultados grandes.
window.gexAscii = (o) => JSON.stringify(o).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
