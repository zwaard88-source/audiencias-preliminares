/* Cambia el paquete de VARIAS actividades SCORM del aula en una sola llamada, sin abrir cada página de edición: por cada una lee
   modedit.php?update=<cm> con fetch, reemplaza el archivo de su área de borradores (como aulaPaquete de aula_subir_paquete.js) y
   envía el formulario completo, tal como lo trae la página, con «Guardar cambios y regresar al curso» (como aula_guardar_con.js).
   No toca nombre, descripción, restricciones ni finalización.
   15/11/2026: las 24 lecciones de delitos ambientales con la franja y la etiqueta «Curso» de Genially corregidas (Esteban: «que
   sea el mismo SCORM en Genially y en el aula»).
     await aulaPaqueteLote([{ cm: 6475, zip: 'http://127.0.0.1:8797/_aula_tmp_ambiental/ijda-u1-l1-scorm12.zip', nombre: 'Lección 1.' }, …])
   Devuelve una fila por actividad: { cm, ok, bytes, error }. */
window.aulaPaqueteLote = async function (lista) {
  const www = M.cfg.wwwroot, out = [];
  const post = async (url, datos) => (await fetch(www + url, { method: 'POST', body: datos instanceof FormData ? datos : new URLSearchParams(datos), credentials: 'same-origin' })).json();
  for (const { cm, zip, nombre: empieza } of lista) {
    try {
      const doc = new DOMParser().parseFromString(await (await fetch(www + '/course/modedit.php?update=' + cm, { credentials: 'same-origin' })).text(), 'text/html');
      const form = doc.querySelector('form[action*="modedit.php"]');
      if (!form) { out.push({ cm, ok: false, error: 'sin formulario' }); continue; }
      const v = (n) => (form.elements[n] ? form.elements[n].value : null);
      const nombre = v('name') || '';
      if (empieza && nombre.indexOf(empieza) !== 0) { out.push({ cm, ok: false, error: 'es «' + nombre + '»' }); continue; }
      if (v('modulename') !== 'scorm') { out.push({ cm, ok: false, error: 'no es SCORM' }); continue; }
      const cfg = [...doc.scripts].map((s) => s.textContent).filter((t) => /form_filemanager|filepicker/.test(t)).join('\n');
      const itemid = v('packagefile'), sesskey = v('sesskey');
      const cli = new RegExp('"client_id":"([^"]+)"[^{}]*"itemid":' + itemid + '|"itemid":' + itemid + '[^{}]*"client_id":"([^"]+)"').exec(cfg) || /"client_id":"([^"]+)"/.exec(cfg);
      const repo = /"(\d+)":\{"id":"?(\d+)"?,"name":"[^"]*","type":"upload"/.exec(cfg), ctx = /"context":\{"id":(\d+)/.exec(cfg);
      if (!itemid || !sesskey || !cli || !repo || !ctx) { out.push({ cm, ok: false, error: 'sin área de borradores' }); continue; }
      const client = cli[1] || cli[2];
      const listar = async () => (await post('/repository/draftfiles_ajax.php?action=list', { sesskey, client_id: client, filepath: '/', itemid })).list || [];
      const resp = await fetch(zip);
      if (!resp.ok) { out.push({ cm, ok: false, error: 'ZIP ' + resp.status }); continue; }
      const blob = await resp.blob(), archivo = decodeURIComponent(zip.split('/').pop());
      for (const f of await listar()) await post('/repository/draftfiles_ajax.php?action=delete', { sesskey, client_id: client, filepath: f.filepath || '/', itemid, filename: f.filename });
      const fd = new FormData();
      fd.append('repo_upload_file', new File([blob], archivo, { type: 'application/zip' }));
      for (const [k, val] of Object.entries({ sesskey, repo_id: repo[2], itemid, author: '', savepath: '/', title: archivo, ctx_id: ctx[1], client_id: client,
        maxbytes: -1, areamaxbytes: -1, env: 'filemanager', page: '', p: '', overwrite: 1 })) fd.append(k, val);
      fd.append('accepted_types[]', '.zip'); fd.append('accepted_types[]', '.xml');
      const sub = await post('/repository/repository_ajax.php?action=upload', fd);
      const ahora = await listar();
      if (!sub || sub.error || !(ahora.length === 1 && +ahora[0].size === blob.size)) { out.push({ cm, ok: false, error: 'subida: ' + JSON.stringify(sub).slice(0, 120) }); continue; }
      const datos = new FormData();
      for (const el of form.elements) {
        if (!el.name || el.disabled) continue;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
        if (el.type === 'submit' || el.type === 'button' || el.type === 'file') continue;
        if (el.tagName === 'SELECT' && el.multiple) { for (const o of el.selectedOptions) datos.append(el.name, o.value); continue; }
        datos.append(el.name, el.value);
      }
      datos.set('submitbutton2', 'Guardar cambios y regresar al curso');
      const r = await fetch(www + '/course/modedit.php', { method: 'POST', body: datos, credentials: 'same-origin' });
      const t = await r.text();
      const error = /class="error"[^>]*>([^<]{3,200})|id="id_error_[^"]*"[^>]*>([^<]{3,200})/.exec(t);
      out.push({ cm, ok: r.ok && /course\/view\.php|section\.php/.test(r.url) && !error, bytes: blob.size, error: error ? (error[1] || error[2]).trim() : null });
    } catch (e) { out.push({ cm, ok: false, error: String(e).slice(0, 160) }); }
  }
  return out;
};
