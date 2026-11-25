/* Crear y ajustar actividades del aula de Moodle (campusvirtual.fiscalia.gov.co) sin el editor visual, enviando el formulario de
   Moodle (modedit.php) con TODOS sus campos tal como los trae la página y cambiando solo lo pedido (memoria «El editor visual de
   Moodle rompe el HTML»). Se corre en cualquier página del aula, con la sesión de quien edita el curso, en un navegador que deje
   leer el servidor local con CORS (herramientas/servir_zip_cors.py; el navegador integrado no lo deja: se usa Chrome).
   16/11/2026, Terminaciones anticipadas (curso 119), para dejarlo como el aula aprobada de ambiental (curso 132).

   aulaCrear({ curso, seccion, tipo: 'label'|'resource', nombre, intro, mostrarDescripcion, texto, archivos, zip, principal,
               ventana: [ancho, alto], incrustar, disponibilidad, finalizacion: 'ver'|null, antesDe })
     · label: «texto» (HTML con @@PLUGINFILE@@) e «archivos» ([url, …]) en el área del texto;
     · resource: «zip» (URL) se sube, se descomprime en el área de archivos y «principal» ('/carpeta/', 'archivo.html') se marca;
       se muestra en ventana emergente («ventana», como «Presentación del curso»: 1200 × 850) con la descripción;
     · «disponibilidad»: objeto de restricciones de Moodle ({op:'&', c:[{type:'completion', cm, e:1}], showc:[true]});
     · «finalizacion: 'ver'»: realizada al verla;
     · «antesDe»: cm delante del cual queda (si no, al final de la sección).
     Devuelve { ok, cm }.
   aulaAjustar(cm, { nombre, intro, mostrarDescripcion, disponibilidad, finalizacion: 'ver'|'ninguna', empiezaCon })
     cambia solo eso en una actividad existente. Devuelve { ok }.
   aulaMover(cm, antesDe | { seccion }) cambia el lugar de una actividad. */
(function () {
  const www = () => M.cfg.wwwroot;
  // 25/11/2026 (AP): el ZIP puede llegar como blob de la página ('blob:…#nombre.zip'): el nombre va después de «#».
  const nombreDe = (u) => (u.indexOf('#') >= 0 ? u.split('#').pop() : decodeURIComponent(u.split('?')[0].split('/').pop()));
  const post = async (url, datos) => (await fetch(www() + url, { method: 'POST', body: datos instanceof FormData ? datos : new URLSearchParams(datos), credentials: 'same-origin' })).json();
  const pagina = async (url) => new DOMParser().parseFromString(await fetch(www() + url, { credentials: 'same-origin' }).then((r) => r.text()), 'text/html');
  const datosDe = (form) => {
    const fd = new FormData();
    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
      if (el.type === 'submit' || el.type === 'button' || el.type === 'file') continue;
      if (el.tagName === 'SELECT' && el.multiple) { for (const o of el.selectedOptions) fd.append(el.name, o.value); continue; }
      if (el.tagName === 'SELECT' && el.selectedIndex < 0) continue;
      fd.append(el.name, el.value);
    }
    return fd;
  };
  const config = (doc) => {
    const cfg = Array.prototype.map.call(doc.scripts, (s) => s.textContent).join('\n');
    const repo = /"(\d+)":\{"id":"?(\d+)"?,"name":"[^"]*","type":"upload"/.exec(cfg), ctx = /"context":\{"id":(\d+)/.exec(cfg);
    return { cfg, repo: repo && repo[2], ctx: ctx && ctx[1] };
  };
  const cliente = (cfg, itemid) => {
    const m = new RegExp('"client_id":"([^"]+)"[^{}]*"itemid":' + itemid + '\\b|"itemid":' + itemid + '\\b[^{}]*"client_id":"([^"]+)"').exec(cfg) || /"client_id":"([^"]+)"/.exec(cfg);
    return m && (m[1] || m[2]);
  };
  async function subir(doc, sesskey, itemid, url, nombre, ruta, env) {
    const { cfg, repo, ctx } = config(doc), client = cliente(cfg, itemid);
    if (!repo || !ctx || !client) throw new Error('no encontré el área de borradores');
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('no pude leer ' + url + ': ' + r.status);
    const blob = await r.blob(), fd = new FormData();
    fd.append('repo_upload_file', new File([blob], nombre));
    for (const [k, v] of Object.entries({ sesskey, repo_id: repo, itemid, author: '', savepath: ruta || '/', title: nombre, ctx_id: ctx, client_id: client,
      maxbytes: -1, areamaxbytes: -1, env: env || 'filemanager', page: '', p: '', overwrite: 1 })) fd.append(k, v);
    const s = await post('/repository/repository_ajax.php?action=upload', fd);
    if (!s || s.error) throw new Error('la subida de ' + nombre + ' falló: ' + JSON.stringify(s).slice(0, 200));
    return { client, bytes: blob.size };
  }
  function aplicar(fd, c) {
    if (c.nombre !== undefined) fd.set('name', c.nombre);
    if (c.intro !== undefined) { fd.set('introeditor[text]', c.intro); fd.set('introeditor[format]', '1'); }
    if (c.mostrarDescripcion !== undefined) fd.set('showdescription', c.mostrarDescripcion ? '1' : '0');
    if (c.disponibilidad !== undefined) fd.set('availabilityconditionsjson', c.disponibilidad ? JSON.stringify(c.disponibilidad) : '');
    if (c.finalizacion === 'ver') { fd.set('completion', '2'); fd.set('completionview', '1'); }
    if (c.finalizacion === 'ninguna') { fd.set('completion', '0'); fd.delete('completionview'); }
    // ventana: [ancho, alto] → el recurso se abre en ventana emergente con su descripción, como «Presentación del curso» de ambiental
    // (17/11/2026, Enfoque: la presentación del curso pasó de un PDF incrustado a la página con el video).
    if (c.ventana) { fd.set('display', '6'); fd.set('popupwidth', String(c.ventana[0])); fd.set('popupheight', String(c.ventana[1])); fd.set('printintro', '1'); }
    // campos: { nombre_del_campo: valor } que se fijan tal cual (20/11/2026, Tráfico: showsize/showtype/filterfiles en 0 como el 132)
    if (c.campos) for (const [k, v] of Object.entries(c.campos)) fd.set(k, String(v));
  }
  async function enviar(form, fd) {
    fd.delete('submitbutton'); fd.set('submitbutton2', 'Guardar cambios y regresar al curso');
    // La acción del formulario es relativa («modedit.php»): se resuelve contra /course/, no contra la página abierta (17/11/2026:
    // desde mod/scorm/view.php se enviaba a mod/scorm/modedit.php, que no existe).
    const accion = new URL(form.getAttribute('action') || 'modedit.php', www() + '/course/').href;
    const r = await fetch(accion, { method: 'POST', body: fd, credentials: 'same-origin' });
    const t = await r.text();
    const err = /class="(?:error|invalid-feedback)[^"]*"[^>]*>\s*([^<]{3,})/.exec(t);
    // Este Moodle regresa a course/view.php o, al crear desde una sección, a course/section.php (17/11/2026, aula 127).
    const volvio = /course\/(view|section)\.php/.test(r.url);
    if (!volvio && err) throw new Error('Moodle no guardó: ' + err[1].trim());
    if (!volvio) throw new Error('Moodle no regresó al curso (' + r.url + ')');
    return r.url;
  }
  async function estado(curso) {
    // El servicio AJAX recibe el JSON tal cual (con post() se volvía URLSearchParams y la respuesta no traía «data»; 17/11/2026).
    const r = await fetch(www() + '/lib/ajax/service.php?sesskey=' + M.cfg.sesskey + '&info=core_courseformat_get_state', { method: 'POST',
      credentials: 'same-origin', body: JSON.stringify([{ index: 0, methodname: 'core_courseformat_get_state', args: { courseid: curso } }]) }).then((x) => x.json());
    return JSON.parse(r[0].data);
  }
  window.aulaMover = async function (cm, destino, curso) {
    const st = await estado(curso);
    const args = { action: 'cm_move', courseid: curso, ids: [cm] };
    if (typeof destino === 'number') { const s = st.section.find((x) => x.cmlist.map(Number).includes(destino)); args.targetsectionid = s.id; args.targetcmid = destino; }
    else args.targetsectionid = st.section.find((x) => x.number === destino.seccion).id;
    const r = await fetch(www() + '/lib/ajax/service.php?sesskey=' + M.cfg.sesskey + '&info=core_courseformat_update_course', { method: 'POST', credentials: 'same-origin',
      body: JSON.stringify([{ index: 0, methodname: 'core_courseformat_update_course', args }]) }).then((x) => x.json());
    if (r[0].error) throw new Error('no se pudo mover ' + cm + ': ' + JSON.stringify(r[0].exception || r[0]).slice(0, 200));
    return true;
  };
  window.aulaCrear = async function (o) {
    try {
      const antes = new Set((await estado(o.curso)).cm.map((c) => String(c.id)));
      const doc = await pagina('/course/modedit.php?add=' + o.tipo + '&type=&course=' + o.curso + '&section=' + o.seccion + '&return=0&sr=0');
      const form = doc.querySelector('form[action*="modedit.php"]');
      if (!form) throw new Error('sin formulario para crear ' + o.tipo);
      const fd = datosDe(form), sesskey = fd.get('sesskey');
      if (o.tipo === 'label') {
        const itemid = fd.get('introeditor[itemid]');
        for (const url of o.archivos || []) await subir(doc, sesskey, itemid, url, nombreDe(url), '/', 'editor');
        aplicar(fd, { nombre: o.nombre, intro: o.texto, disponibilidad: o.disponibilidad, finalizacion: o.finalizacion });
      } else if (o.tipo === 'resource') {
        const itemid = fd.get('files'), archivo = nombreDe(o.zip);
        const { client } = await subir(doc, sesskey, itemid, o.zip, archivo, '/');
        const z = await post('/repository/draftfiles_ajax.php?action=unzip', { sesskey, client_id: client, itemid, filepath: '/', filename: archivo, areamaxbytes: -1, maxbytes: -1 });
        if (z && z.error) throw new Error('no se pudo descomprimir: ' + z.error);
        await post('/repository/draftfiles_ajax.php?action=delete', { sesskey, client_id: client, itemid, filepath: '/', filename: archivo });
        const m = await post('/repository/draftfiles_ajax.php?action=setmainfile', { sesskey, client_id: client, itemid, filepath: o.principal[0], filename: o.principal[1] });
        if (m && m.error) throw new Error('no se pudo marcar el archivo principal: ' + m.error);
        aplicar(fd, { nombre: o.nombre, intro: o.intro, mostrarDescripcion: o.mostrarDescripcion, disponibilidad: o.disponibilidad, finalizacion: o.finalizacion });
        // «incrustar» (17/11/2026, ruta de navegación como mini sitio): «Mostrar: Incrustar»; si no, ventana emergente
        if (o.incrustar) fd.set('display', '1');
        else { fd.set('display', '6'); fd.set('popupwidth', String((o.ventana || [1200, 850])[0])); fd.set('popupheight', String((o.ventana || [1200, 850])[1])); }
        fd.set('printintro', '1'); fd.set('showsize', '0'); fd.set('showtype', '0'); fd.set('filterfiles', '0');
      } else throw new Error('tipo no previsto: ' + o.tipo);
      fd.set('visible', o.visible === false ? '0' : '1');
      await enviar(form, fd);
      const nuevo = (await estado(o.curso)).cm.find((c) => !antes.has(String(c.id)));
      if (!nuevo) throw new Error('Moodle guardó, pero no encontré la actividad nueva');
      if (o.antesDe) await window.aulaMover(Number(nuevo.id), o.antesDe, o.curso);
      return { ok: true, cm: Number(nuevo.id), nombre: nuevo.name };
    } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
  };
  /* aulaReemplazar(cm, zip, principal, cambios): cambia TODOS los archivos de un recurso «Archivo» existente por los del ZIP
     (descomprimido) y marca el principal; con «cambios» ({ intro, disponibilidad, finalizacion, nombre }) ajusta lo demás en el
     mismo envío. Conserva su lugar, su visibilidad y lo que no se pida. Devuelve { ok, antes, archivos }. */
  window.aulaReemplazar = async function (cm, zip, principal, c) {
    try {
      // 20/11/2026: con un nombre suelto («presentacion-del-curso.html») se marcaba principal[0]='p', principal[1]='r' y el recurso
      // quedaba sin archivo principal (Moodle servía una fuente y la descargaba, en 5 cursos). Se acepta el nombre suelto y se exige
      // el par [carpeta, archivo].
      if (typeof principal === 'string') principal = ['/', principal];
      if (!Array.isArray(principal) || principal.length !== 2 || !/^\//.test(principal[0])) throw new Error('principal debe ser [carpeta, archivo]');
      const doc = await pagina('/course/modedit.php?update=' + cm);
      const form = doc.querySelector('form[action*="modedit.php"]');
      if (!form) throw new Error('sin formulario');
      const fd = datosDe(form), sesskey = fd.get('sesskey'), itemid = fd.get('files');
      if (fd.get('modulename') !== 'resource') throw new Error('no es un recurso Archivo: ' + fd.get('modulename'));
      if (c && c.empiezaCon && String(fd.get('name') || '').indexOf(c.empiezaCon) !== 0) throw new Error('el recurso es «' + fd.get('name') + '»');
      const { cfg } = config(doc), client = cliente(cfg, itemid);
      const listar = async (ruta) => (await post('/repository/draftfiles_ajax.php?action=list', { sesskey, client_id: client, filepath: ruta, itemid })).list || [];
      const antes = (await listar('/')).map((f) => f.filename + (f.type === 'folder' ? '/' : ''));
      for (const f of await listar('/')) {
        const b = await post('/repository/draftfiles_ajax.php?action=delete',   // carpeta: filename «.» en su ruta (no hay «deletedir»)
          { sesskey, client_id: client, itemid, filepath: f.type === 'folder' ? (f.filepath || '/' + f.filename + '/') : '/', filename: f.type === 'folder' ? '.' : f.filename });
        if (b && b.error) throw new Error('no pude quitar ' + f.filename + ': ' + b.error);
      }
      if ((await listar('/')).length) throw new Error('el área de archivos no quedó vacía');
      const archivo = nombreDe(zip);
      await subir(doc, sesskey, itemid, zip, archivo, '/');
      const z = await post('/repository/draftfiles_ajax.php?action=unzip', { sesskey, client_id: client, itemid, filepath: '/', filename: archivo, areamaxbytes: -1, maxbytes: -1 });
      if (z && z.error) throw new Error('no se pudo descomprimir: ' + z.error);
      await post('/repository/draftfiles_ajax.php?action=delete', { sesskey, client_id: client, itemid, filepath: '/', filename: archivo });
      const m = await post('/repository/draftfiles_ajax.php?action=setmainfile', { sesskey, client_id: client, itemid, filepath: principal[0], filename: principal[1] });
      if (m && m.error) throw new Error('no se pudo marcar el archivo principal: ' + m.error);
      if (c) aplicar(fd, c);
      await enviar(form, fd);
      // Comprobación: el recurso abre su archivo principal (no una fuente ni el PDF).
      const abre = (await fetch(M.cfg.wwwroot + '/mod/resource/view.php?id=' + cm + '&redirect=1', { credentials: 'same-origin' })).url;
      if (!decodeURIComponent(abre).endsWith(principal[0].replace(/^\//, '') + principal[1])) throw new Error('el recurso abre ' + abre.split('/').pop() + ', no ' + principal[1]);
      return { ok: true, cm, antes, ahora: (await listar('/')).map((f) => f.filename + (f.type === 'folder' ? '/' : '')) };
    } catch (e) { return { ok: false, cm, error: String(e && e.message || e) }; }
  };
  /* aulaEtiqueta(cm, { texto, archivos, empiezaCon }): cambia el texto de una etiqueta existente y sube «archivos» ([url, …]) al área
     de su texto (los que ya tiene se conservan; uno con el mismo nombre se reemplaza). Conserva lugar, visibilidad y restricciones.
     (22/11/2026: «Descargar las memorias» en las tarjetas «¡Felicitaciones!» de Derecho de petición, creadas sin cartillas.) */
  window.aulaEtiqueta = async function (cm, c) {
    try {
      const doc = await pagina('/course/modedit.php?update=' + cm);
      const form = doc.querySelector('form[action*="modedit.php"]');
      if (!form) throw new Error('sin formulario');
      const fd = datosDe(form), sesskey = fd.get('sesskey');
      if (c.empiezaCon && String(fd.get('name') || '').indexOf(c.empiezaCon) !== 0) throw new Error('la actividad es «' + fd.get('name') + '»');
      const itemid = fd.get('introeditor[itemid]');
      if (!itemid) throw new Error('la actividad no tiene área de texto (¿no es una etiqueta?)');
      for (const url of c.archivos || []) await subir(doc, sesskey, itemid, url, nombreDe(url), '/', 'editor');
      if (c.texto) aplicar(fd, { intro: c.texto });
      await enviar(form, fd);
      return { ok: true, cm };
    } catch (e) { return { ok: false, cm, error: String(e && e.message || e) }; }
  };
  window.aulaAjustar = async function (cm, c) {
    try {
      const doc = await pagina('/course/modedit.php?update=' + cm);
      const form = doc.querySelector('form[action*="modedit.php"]');
      if (!form) throw new Error('sin formulario');
      const fd = datosDe(form);
      if (c.empiezaCon && String(fd.get('name') || '').indexOf(c.empiezaCon) !== 0) throw new Error('la actividad es «' + fd.get('name') + '»');
      aplicar(fd, c);
      await enviar(form, fd);
      return { ok: true, cm };
    } catch (e) { return { ok: false, cm, error: String(e && e.message || e) }; }
  };
})();
