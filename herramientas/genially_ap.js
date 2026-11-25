/* Audiencias preliminares · montaje en Genially desde manifiesto.json (Sebastián) · v13, cuarta pasada (25/11/2026).
   Se inyecta en el editor y deja window.AP. Cambios de esta pasada, con el estándar del taller (docs/mediaciones-aprobadas.md §3):
   · la lección empieza en su portadita (se ocultan la portada del curso, la tapita de unidad, la introducción y el índice de temas);
   · portadita sin los botoncitos «En esta lección»; un solo «Comenzar»;
   · dos formas de página: dividida (título a la izquierda, escena de 767 × 510) y franja ancha (título arriba, 1150 × 462) para
     mapas, figuras y videos;
   · ilustración solo donde el manifiesto la asigna (la que corresponde al tema); si no, se retira del lienzo;
   · cabecera: título de la lección legible; flecha «siguiente» resaltada; contador «Página k de n»;
   · pie en una sola línea: Curso · nombre | Unidad N · nombre.
   Cuarta pasada (revisión como usuario y pedido de Sebastián: «no quiero tres o cuatro diapositivas de inicio»):
   · las páginas de plantilla ocultas (portada del curso, tapita de unidad, introducción, índice de temas) salen del arranque y van
     al final, después del «Fin» (siguen ocultas; no se borran);
   · arranque según lo que la lección necesita: su portadita y, solo si la lección es larga (14 páginas o más), el índice; en las
     cortas el índice queda oculto y «Comenzar» lleva a la primera página;
   · índice: cada apartado en su casilla (la barra de «Inicio de la lección» ya no pasa por debajo de la columna derecha) y el
     texto centrado en la casilla con su alto medido;
   · el dibujo de la columna izquierda no se aprieta: si el título y la frase clave no le dejan sitio, la página va sin dibujo;
   · AP.revisar(): textos que no caben en su caja (título, frase clave, cabecera, pie).
   No publica: solo guarda. Nada se borra: lo que sobra se oculta o sale del lienzo. */
window.AP=(()=>{const A=window.geniallyAPI,RS=window.rootStore,d=ms=>new Promise(r=>setTimeout(r,ms));
const BASE='https://zwaard88-source.github.io/audiencias-preliminares/';
const pl=h=>{const e=document.createElement('div');e.innerHTML=String(h||'').replace(/<br\s*\/?>/gi,' ');return(e.textContent||'').replace(/\s+/g,' ').trim()};
const hx=c=>{const m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c||'');return m?'#'+[1,2,3].map(i=>(+m[i]).toString(16).padStart(2,'0')).join('').toUpperCase():String(c||'').toUpperCase()};
const PREV='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22.6" fill="none" stroke="#FFFFFF" stroke-width="2.6"/><path d="M28.5 15.5L19 25l9.5 9.5" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* la flecha «siguiente» de la plantilla es la misma «anterior» girada 180°: el dibujo apunta a la izquierda y el giro lo voltea */
const NEXT=g=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="#B05A36"/><path d="'+(g?'M28.5 15.5L19 25l9.5 9.5':'M21.5 15.5L31 25l-9.5 9.5')+'" fill="none" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const its=id=>A.getSlideItems(id),st=id=>RS.slidesStore.findSlideById(id);
const esc_=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const conTexto=(html,nuevo)=>{const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html'),r=doc.body.firstChild;[...r.querySelectorAll('p')].slice(1).forEach(x=>x.remove());[...r.querySelectorAll('br')].forEach(x=>x.remove());const ts=[],w=doc.createTreeWalker(r,NodeFilter.SHOW_TEXT);while(w.nextNode())ts.push(w.currentNode);const p=ts.find(t=>t.nodeValue.trim())||ts[0];if(!p)return html;p.nodeValue=nuevo;ts.filter(t=>t!==p).forEach(t=>t.remove());return r.innerHTML};
const pon=(id,t)=>{const h=A.getTextHtml(id);if(pl(h)!==t||/<br/i.test(h)){A.updateTextContent(id,conTexto(h,t));return 1}return 0};
const fsz=(id,fs)=>{try{if(Math.abs((A.getTextItemDetails(id).fontSize||0)-fs)>0.4){A.updateTextFontSize(id,fs);return 1}}catch(e){}return 0};
const pos=(it,x,y)=>{if(Math.abs(it.position.x-x)>1.5||Math.abs(it.position.y-y)>1.5){A.updateItemPosition(it.id,{x,y});return 1}return 0};
const anc=(it,w)=>{if(Math.abs(it.size.width-w)>2){A.updateItemSize(it.id,{width:w,height:it.size.height});return 1}return 0};
const alto=it=>{try{const m=A.measureText(it.id);if(m&&m.height>8&&m.height<400)return m.height}catch(e){}return it.size.height};
const esc=()=>A.getSlides().filter(s=>/Escena \d+( Copy)*$/.test(s.name||''));
const href=(u,l,src)=>new URL(src,BASE+'unidad-0'+u+'/leccion-0'+l+'/').href;
const textos=I=>I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.x<300&&i.position.y>90&&i.position.y<330).sort((a,b)=>a.position.y-b.position.y);
const dibujo=I=>I.filter(i=>i.type==='image'&&!i.parentGroupId&&i.position.x<300&&i.position.y>140&&i.size.width>100)[0];

/* 1. La lección empieza en su portadita: el preludio del curso y de la unidad se oculta (no se borra). */
function estructura(){let n=0;const s0=A.getSlides(),por=s0.find(s=>/· Portada$/.test(s.name||''));
 /* Genially no deja ocultar la primera página: la portadita de la lección pasa a ser la primera y la del curso queda oculta detrás */
 if(por&&s0[0].id!==por.id){try{A.reorderSlide(por.id,s0[0].id,null);n++}catch(e){}}
 const pre=s=>{const nm=(s.name||'').trim();return nm==='Portada'||/^Unidad \d+$/.test(nm)||/^Introducci[oó]n$/.test(nm)||nm==='Índice'};
 for(const s of A.getSlides())if(pre(s)){const S=st(s.id);if(!S.data.Hidden){S.data.setHidden(true);n++}}
 /* fuera del arranque: detrás del «Fin», en su orden */
 let m=0;const fin=A.getSlides().find(s=>/· Fin$/.test(s.name||''));
 if(fin){let ancla=fin.id;for(const s of A.getSlides().filter(pre)){const L=A.getSlides(),iF=L.findIndex(x=>x.id===fin.id),iS=L.findIndex(x=>x.id===s.id);if(iS<iF){try{A.reorderSlide(s.id,null,ancla);m++}catch(e){}}ancla=s.id}}
 return 'preludio oculto '+n+' · al final '+m}

/* 2. Una página por entrada del manifiesto: iframe con su forma, título y frase clave. */
async function paginas(u,l,M){const P=M.paginas,n=P.length;A.selectSlide(A.getSlides()[0].id);await d(200);
 let E=esc(),g=0;while(E.length<n&&g++<200){A.duplicateSlide(E[E.length-1].id);await d(380);E=esc()}
 let c=0;for(let k=0;k<E.length;k++){const S=st(E[k].id);if(k>=n){if(!S.data.Hidden)S.data.setHidden(true);continue}if(S.data.Hidden)S.data.setHidden(false);
  const p=P[k],sid=E[k].id,nom='L'+l+' · Escena '+(k+1);if(E[k].name!==nom)A.setSlideName(sid,nom);
  const an=!!p.ancho,R=an?{x:25,y:139,w:1150,h:462}:{x:409,y:97,w:766,h:509},W=an?1150:767,H=an?462:510;
  const rc=[...S.unorderedItems].find(i=>i.data&&i.data.setSource),ifr='<iframe src="'+href(u,l,p.src)+'" width="'+W+'" height="'+H+'" style="border:0" title="'+p.id+'" allowfullscreen allow="fullscreen; autoplay"></iframe>';
  if(rc){if(String(rc.data.Source).indexOf(ifr)<0){rc.data.setSource('<div class="card-iframe">'+ifr+'</div>');if(rc.data.setOriginalUrl)rc.data.setOriginalUrl(ifr);c++}
   const ri=its(sid).find(i=>i.id===rc.data.Id);if(ri){c+=pos(ri,R.x,R.y);if(Math.abs(ri.size.width-R.w)>1.5||Math.abs(ri.size.height-R.h)>1.5){A.updateItemSize(ri.id,{width:R.w,height:R.h});c++}}}
  const tx=textos(its(sid)),T=tx[0],Sb=tx[1],L=p.titulo.length;
  if(T){c+=pon(T.id,p.titulo);c+=fsz(T.id,an?(L<=52?26:L<=72?23:L<=92?20:18):(L<=30?30:L<=48?26:L<=75?22:19))}
  if(Sb){if(!an&&p.subtitulo){c+=pon(Sb.id,p.subtitulo);A.updateItemOpacity(Sb.id,1)}else A.updateItemOpacity(Sb.id,0)}await d(50)}
 return 'páginas '+n+' de '+E.length+' · cambios '+c}

/* 3. Cabecera y pie, iguales en todas las páginas. */
async function marco(I,M,k,n){let c=0;
 const ar=I.filter(i=>i.type==='svg'&&!i.parentGroupId&&i.position.y<24&&i.size.width>40&&i.size.width<60&&i.position.x>880&&i.position.x<1070).sort((a,b)=>a.position.x-b.position.x);
 if(ar.length===2&&!(ar[1].colors||[]).map(hx).includes('#B05A36')){try{await A.updateSvgSource(ar[0].id,PREV);await A.updateSvgSource(ar[1].id,NEXT(Math.abs((ar[1].rotation||0)%360)===180));c+=2}catch(e){}}
 const hd=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.y<70&&i.position.x>440&&i.position.x<760)[0];
 if(hd){const t=M.titulo,L=t.length,fs=L<=40?20:L<=62?18:L<=92?16:14.5;c+=pon(hd.id,t);c+=fsz(hd.id,fs);c+=anc(hd,449);const lin=Math.ceil(L*fs*0.57/449),h=lin*fs*1.22;c+=pos(hd,467,Math.round(44.5-h/2))}
 const tf=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.y>600),tt=i=>pl(A.getTextHtml(i.id));
 const cur=tf.find(i=>/^Curso$/.test(tt(i))),uni=tf.find(i=>/^Unidad \d+$/.test(tt(i))),nom=tf.filter(i=>i!==cur&&i!==uni&&tt(i).length>12).sort((a,b)=>a.position.x-b.position.x);
 const pu=I.filter(i=>i.type==='svg'&&!i.parentGroupId&&i.position.y>600&&i.size.height<44&&i.size.width<120&&i.position.x>300)[0];
 const limpio=async(it,x,w)=>{const t=tt(it),h=A.getTextHtml(it.id);let m=0;if(/<br/i.test(h)||/text-align:\s*right/.test(h)){A.updateTextContent(it.id,'<p data-node-text-align="left" dir="ltr" style="text-align: left;"><strong>'+esc_(t)+'</strong></p>');m++}m+=fsz(it.id,13);m+=anc(it,w);if(m)await d(90);m+=pos(it,x,alto(it)>27?625:633);return m};
 if(nom.length>=2&&uni&&pu){c+=await limpio(nom[0],104,388);c+=pos(pu,500,626);c+=pos(uni,504,632);c+=await limpio(nom[nom.length-1],594,581)}
 /* contador de páginas, bajo las flechas */
 if(k!=null){const txt='Página '+(k+1)+' de '+n;let ct=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.y>58&&i.position.y<90&&i.position.x>880&&i.position.x<1080)[0];
  if(!ct){try{A.createText({x:918,y:63,width:130,height:20,fontSize:13,color:'#FFFFFF',fontFamily:'Montserrat',text:'<p><strong>'+txt+'</strong></p>',selectAndEdit:false});c++}catch(e){}}
  else c+=pon(ct.id,txt)}
 return c}

/* 4. Acomodo de cada página: franja ancha o dividida; ilustración solo si el manifiesto la trae. */
async function acomodar(M,desde=0,hasta=1e9){const P=M.paginas,E=esc();let c=0;
 for(let k=desde;k<Math.min(P.length,E.length,hasta);k++){A.selectSlide(E[k].id);await d(420);let I=its(E[k].id);const p=P[k],tx=textos(I),T=tx[0],Sb=tx[1],img=dibujo(I);if(!T)continue;
  if(p.ancho){c+=pos(T,28,99);c+=anc(T,1144);if(Sb)c+=pos(Sb,-900,170);if(img&&img.position.x>-800)c+=pos(img,-900,img.position.y)}
  else{c+=pos(T,28,108);if(anc(T,350)){c++;await d(120)}const hT=alto(T),sy=Math.round(108+hT+8);if(Sb)c+=pos(Sb,28,sy);
   const bajo=Sb&&p.subtitulo?sy+alto(Sb):108+hT;
   if(img){if(!p.ilus){if(img.position.x>-800)c+=pos(img,-900,img.position.y)}
    else if(592-(bajo+12)<130){if(img.position.x>-800)c+=pos(img,-900,img.position.y)}
    else{const top=bajo+12,mh=592-top,r=img.size.width/img.size.height;let h=Math.min(329,mh),w=h*r;if(w>359){w=359;h=w/r}
     if(Math.abs(img.size.height-h)>3){A.updateItemSize(img.id,{width:w,height:h});await d(50);c++}
     c+=pos(img,28+(359-w)/2,top+(mh-h)/2)}}}
  c+=await marco(I,M,k,P.length);await d(30)}
 A.selectSlide(A.getSlides()[0].id);await d(250);return 'acomodadas '+c}

async function pegar(slideId,gid){const antes=its(slideId).map(i=>i.id);A.selectSlide(slideId);await d(350);A.copyItems([gid]);await d(250);A.pasteItems();await d(1100);return its(slideId).filter(i=>!antes.includes(i.id)&&i.type==='group'&&!i.parentGroupId)[0]}
const ir=(id,dest)=>{try{A.deleteItemInteractivity(id,'goToSlide')}catch(e){}A.setGoToSlideInteractivity({itemId:id,target:{slideId:dest}})};

/* 5. Portadita (sin botoncitos) e índice por apartado, con la guía del estándar. */
async function indice(l,M){const P=M.paginas,E=esc(),secs=[],largo=P.length>=14;P.forEach((p,k)=>{const t=p.indice||p.titulo;if(!secs.length||secs[secs.length-1].t!==t)secs.push({t,k})});
 const sl=A.getSlides(),por=sl.find(s=>/· Portada$/.test(s.name)),ind=sl.find(s=>/· Índice$/.test(s.name)),fin=sl.find(s=>/· Fin$/.test(s.name)),U=secs.length,r=[];
 if(por){A.selectSlide(por.id);await d(650);const I=its(por.id),hijos=g=>its(por.id).filter(i=>i.parentGroupId===g.id);
  const C=I.filter(i=>i.type==='group'&&!i.parentGroupId&&i.size.width<60&&hijos(i).some(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id)))));
  for(const g of C)if(g.position.x>-300)A.updateItemPosition(g.id,{x:-400,y:386});
  const T=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.x<120&&i.position.y>150&&i.position.y<215).sort((a,b)=>a.position.y-b.position.y)[0];
  let bajo=386;if(T){pon(T.id,M.titulo);const L=M.titulo.length;fsz(T.id,L<=38?42:L<=70?36:L<=100?30:26);await d(200);bajo=T.position.y+alto(T)}
  const fil=I.find(i=>i.type==='svg'&&!i.parentGroupId&&i.size.height<9&&i.size.width<130&&i.position.x<130&&i.position.y>150),eti=I.find(i=>i.type==='text'&&!i.parentGroupId&&/^En esta lecci/.test(pl(A.getTextHtml(i.id))));
  const by=Math.round(bajo+16);if(fil)A.updateItemPosition(fil.id,{x:80,y:by});if(eti&&eti.position.x>-800)A.updateItemPosition(eti.id,{x:-900,y:eti.position.y});
  for(const ln of I.filter(i=>i.type==='svg'&&!i.parentGroupId&&i!==fil&&i.size.height<9&&i.size.width>60&&i.position.x<200&&i.position.x>=0&&i.position.y>200))A.updateItemPosition(ln.id,{x:-900,y:ln.position.y});
  const bot=I.find(i=>i.type==='group'&&!i.parentGroupId&&hijos(i).some(h=>h.type==='text'&&/^Comenzar/.test(pl(A.getTextHtml(h.id)))));
  if(bot){A.updateItemPosition(bot.id,{x:80,y:Math.min(596-bot.size.height,by+32)});if(ind&&largo)ir(bot.id,ind.id);else if(E[0])ir(bot.id,E[0].id)}
  await marco(I,M,null,0);r.push('portadita')}
 if(ind){const Si=st(ind.id);if(!!Si.data.Hidden===largo)Si.data.setHidden(!largo);r.push(largo?'índice a la vista':'índice oculto (lección corta)')}
 if(ind&&U<=14){A.selectSlide(ind.id);await d(500);const hijos=g=>its(ind.id).filter(i=>i.parentGroupId===g.id),txt=g=>hijos(g).filter(h=>h.type==='text').map(h=>pl(A.getTextHtml(h.id)));
  const guia=its(ind.id).find(i=>i.type==='text'&&!i.parentGroupId&&/^Elija una p/.test(pl(A.getTextHtml(i.id))));
  if(guia){pon(guia.id,'Elija una página para ir directamente a ella o utilice las flechas de arriba para avanzar de forma continua.');anc(guia,1100)}
  let G=its(ind.id).filter(i=>i.type==='group'&&!i.parentGroupId&&i.size.width>400),ini=G.find(g=>txt(g).some(t=>/^Inicio/.test(t))),fg=G.find(g=>txt(g).some(t=>/^Fin de/.test(t)));
  if(!fg){fg=G.find(g=>g!==ini&&g.position.x>-100&&!hijos(g).some(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id)))));if(fg){const tt=hijos(fg).find(h=>h.type==='text');if(tt)pon(tt.id,'Fin de la lección')}}
  if(fg&&fin)ir(fg.id,fin.id);if(ini&&por)ir(ini.id,por.id);
  let N=G.filter(g=>g!==ini&&g!==fg).sort((a,b)=>(a.position.x-b.position.x)||(a.position.y-b.position.y)),g=0;
  while(N.length<U&&N.length&&g++<16){const nv=await pegar(ind.id,N[N.length-1].id);if(!nv)break;N.push(nv)}
  const orden=[ini,...N.slice(0,U),fg].filter(Boolean),filas=Math.ceil(orden.length/2),H=Math.min(102,Math.floor(427/filas)-7);
  for(let i=0;i<N.length;i++){const gr=N[i];if(i>=U){A.updateItemPosition(gr.id,{x:-900,y:173});continue}const hs=hijos(gr),num=hs.find(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id)))),tit=hs.find(h=>h.type==='text'&&h!==num);if(num)pon(num.id,String(i+1));if(tit)pon(tit.id,secs[i].t);ir(gr.id,E[secs[i].k].id);await d(40)}
  await d(350);
  for(let i=0;i<orden.length;i++){const gr=orden[i];
   /* cada apartado en su casilla de 570: fondo y texto (la barra de «Inicio» venía de 1152 y pasaba bajo la columna derecha) */
   for(const h of hijos(gr)){const w=Math.round(h.size.width);if(h.type==='svg'&&w>400){if(Math.abs(h.size.height-H)>1||Math.abs(w-570)>1){A.updateItemSize(h.id,{width:570,height:H});await d(40)}}else if(h.type==='text'&&w>100&&Math.abs(w-488)>1){A.updateItemSize(h.id,{width:488,height:h.size.height});await d(60)}}
   await d(120);
   for(const h of hijos(gr)){if(h.type==='svg'&&h.size.width>400)continue;const a=h.type==='text'?alto(h):h.size.height;A.updateItemPosition(h.id,{x:h.position.x,y:Math.round((H-a)/2)});await d(25)}
   await d(80);A.updateItemPosition(gr.id,{x:i<filas?24:607,y:173+(i%filas)*(H+7)});await d(40)}
  await marco(its(ind.id),M,null,0);r.push('índice '+U+' apartados, alto '+H)}else if(ind)r.push('índice sin tocar: '+U+' apartados');
 if(fin){A.selectSlide(fin.id);await d(450);await marco(its(fin.id),M,null,0);r.push('fin')}
 A.selectSlide(A.getSlides()[0].id);await d(250);return r.join(' · ')}

/* 6. Ilustración de la columna izquierda: solo la que el manifiesto asigna (corresponde al tema). */
async function ilustrar(desde=0,hasta=1e9){const P=window.APM.paginas,E=esc(),K='ap_ilus_'+location.pathname.split('/').pop();let cache={};try{cache=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}let c=0,f=0,err='';
 for(let k=desde;k<Math.min(P.length,E.length,hasta);k++){const n=P[k].ilus;if(!n||P[k].ancho)continue;const img=dibujo(its(E[k].id));if(!img)continue;
  const it=[...st(E[k].id).unorderedItems].find(x=>x.data&&x.data.Id===img.id),url=BASE+'unidad-01/medios/ilus/'+n+'.png';if(it&&(it.data.Source===url||(cache[n]&&it.data.Source===cache[n])))continue;
  try{await A.replaceImage(img.id,cache[n]||url,{box:'fit'});await d(220);const s=it&&it.data.Source;if(s&&s!==url&&!cache[n]){cache[n]=s;try{localStorage.setItem(K,JSON.stringify(cache))}catch(e){}}c++}catch(e){f++;err=String(e).slice(0,80)}}
 return 'ilustraciones '+c+(f?' · fallas '+f+' '+err:'')}

/* 7. Revisión de cajas: lo que no cabe donde va. Devuelve una lista corta (vacía si todo cabe). */
function revisar(){const P=(window.APM||{paginas:[]}).paginas,E=esc(),out=[];
 for(let k=0;k<Math.min(P.length,E.length);k++){const I=its(E[k].id),p=P[k],tx=textos(I),T=tx[0],Sb=tx[1],img=dibujo(I);if(!T)continue;const hT=alto(T);
  if(p.ancho){if(hT>38)out.push((k+1)+': título de franja en '+Math.round(hT)+' px (pisa la página)')}
  else{const hS=Sb&&p.subtitulo?alto(Sb):0,bajo=108+hT+(hS?8+hS:0);if(bajo>596)out.push((k+1)+': título y frase llegan a '+Math.round(bajo));
   if(img&&img.position.x>-800&&img.position.y<bajo+4)out.push((k+1)+': el dibujo pisa el texto');if(img&&img.position.x>-800&&img.size.height<110)out.push((k+1)+': dibujo muy chico '+Math.round(img.size.height))}
  const hd=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.y<70&&i.position.x>440&&i.position.x<760)[0];if(hd&&(alto(hd)>70||hd.position.y<6))out.push((k+1)+': cabecera '+Math.round(alto(hd))+' px');
  for(const f of I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.y>600)){const a=alto(f);if(f.position.y+a>668)out.push((k+1)+': pie baja a '+Math.round(f.position.y+a))}}
 return out.length?out.slice(0,14).join(' | ')+(out.length>14?' … +'+(out.length-14):''):'cajas bien ('+Math.min(P.length,E.length)+' páginas)'}
async function cargar(u,l){const M=await(await fetch(BASE+'unidad-0'+u+'/leccion-0'+l+'/manifiesto.json?'+Date.now())).json();window.APM=M;return M.paginas.length}
async function montar(u,l){const n=await cargar(u,l),a=estructura(),b=await paginas(u,l,window.APM);return n+' páginas · '+a+' · '+b}
function estado(){const E=esc(),P=(window.APM||{paginas:[]}).paginas,sl=A.getSlides(),vis=sl.filter(s=>!st(s.id).data.Hidden);
 return JSON.stringify({visibles:vis.map(s=>s.name).slice(0,3),nVis:vis.length,escenasVisibles:E.filter(s=>!st(s.id).data.Hidden).length,manifiesto:P.length})}
return{montar,cargar,estructura,revisar,ilustrar,acomodar:async(a,b)=>acomodar(window.APM,a,b),indice:async l=>indice(l,window.APM),guardar:async()=>(await A.saveNow()).status,esc,estado,M:()=>window.APM}})();'AP listo v13'
