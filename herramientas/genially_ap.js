/* Audiencias preliminares · montaje en Genially desde manifiesto.json (Sebastián, 25/11/2026) · v8.
   Se pega en la consola del editor (o lo inyecta Claude) y deja window.AP: AP.color() pasa la plantilla a «Salvia y terracota»;
   AP.montar(u, l) deja una página por entrada del manifiesto (iframe, título, subtítulo), la portadita y el índice por apartado.
   No publica: solo guarda. Las páginas que sobran se ocultan, no se borran. */
window.AP=(()=>{const A=window.geniallyAPI,RS=window.rootStore,d=ms=>new Promise(r=>setTimeout(r,ms));
const BASE='https://zwaard88-source.github.io/audiencias-preliminares/';
const pl=h=>{const e=document.createElement('div');e.innerHTML=String(h||'');return(e.textContent||'').replace(/\s+/g,' ').trim()};
const hx=c=>{const m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c||'');return m?'#'+[1,2,3].map(i=>(+m[i]).toString(16).padStart(2,'0')).join('').toUpperCase():String(c||'').toUpperCase()};
const MP={'#EF767F':'#C8754F','#C5E9E2':'#E3EDE7','#569689':'#587E6D','#003F5E':'#2F4F45','#E2F4F0':'#E3EDE7','#F0F9F7':'#F7F5EF','#FBDCDE':'#F6DDCB','#043145':'#2F4F45','#37677D':'#587E6D'};
const rgb=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255].join(', ')};
const CIRC='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><circle cx="17" cy="17" r="17" fill="#587E6D"/></svg>';
const its=id=>A.getSlideItems(id),st=id=>RS.slidesStore.findSlideById(id);
const conTexto=(html,nuevo)=>{const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html'),r=doc.body.firstChild;[...r.querySelectorAll('p')].slice(1).forEach(x=>x.remove());const ts=[],w=doc.createTreeWalker(r,NodeFilter.SHOW_TEXT);while(w.nextNode())ts.push(w.currentNode);const p=ts.find(t=>t.nodeValue.trim())||ts[0];if(!p)return html;p.nodeValue=nuevo;ts.filter(t=>t!==p).forEach(t=>t.remove());return r.innerHTML};
const pon=(id,t)=>{const h=A.getTextHtml(id);if(pl(h)!==t){A.updateTextContent(id,conTexto(h,t));return 1}return 0};
async function color(desde=0,hasta=1e9){let n=0;try{A.setDocumentPalette({primary:'#2F4F45',secondary:'#587E6D',tertiary:null})}catch(e){}
 const sl=A.getSlides();A.selectSlide(sl[0].id);await d(200);
 for(const s of sl.slice(desde,hasta)){const S=st(s.id);if(hx(S.data.BackgroundColor)==='#C5E9E2'){A.setSlideBackgroundColor(s.id,'#F6F3EB');n++}
  const I=its(s.id),barra=I.some(i=>i.type==='svg'&&i.position.y<2&&i.size.width>1000&&i.size.height<100);
  const fichas=I.filter(i=>i.type==='svg'&&i.size.width<170&&i.size.height<50);
  for(const it of I){const x=it.position.x,y=it.position.y,w=it.size.width,h=it.size.height;
   if(it.type==='svg'){const c=(it.colors||[]).map(hx),nv=c.map(k=>k==='#EF767F'&&y<2&&w>1000&&h<100?'#587E6D':k==='#C5E9E2'&&w>1100&&h>600?'#F6F3EB':MP[k]||k);
    if(nv.some((k,i)=>k!==c[i])){A.updateSvgColors(it.id,nv);n++;await d(12)}}
   else if(it.type==='text'){let t=A.getTextHtml(it.id),t0=t;for(const k in MP){const a=rgb(k),b=rgb(MP[k]);t=t.split('rgb('+a+')').join('rgb('+b+')').split('rgba('+a+', 1)').join('rgba('+b+', 1)')}
    const cx=x+w/2,cy=y+h/2,enFicha=fichas.some(f=>cx>f.position.x&&cx<f.position.x+f.size.width&&cy>f.position.y&&cy<f.position.y+f.size.height);
    if(barra&&cy<80&&!it.parentGroupId&&!enFicha){if(/color/.test(t))t=t.replace(/rgba\(\d+, \d+, \d+, 1\)/g,'rgba(255, 255, 255, 1)').replace(/rgb\(\d+, \d+, \d+\)/g,'rgb(255, 255, 255)');
     if(t!==t0){A.updateTextContent(it.id,t);n++;await d(12)}if(!/255, 255, 255/.test(A.getTextHtml(it.id))){A.updateTextColor(it.id,'#FFFFFF');n++;await d(12)}continue}
    if(t!==t0){A.updateTextContent(it.id,t);n++;await d(12)}}}}
 return n}
const esc=()=>A.getSlides().filter(s=>/Escena \d+( Copy)*$/.test(s.name||''));
async function paginas(u,l,M,desde=0,hasta=1e9){const P=M.paginas,n=P.length;A.selectSlide(A.getSlides()[0].id);await d(200);
 let E=esc(),g=0;while(E.length<n&&g++<200){A.duplicateSlide(E[E.length-1].id);await d(380);E=esc()}
 let c=0;for(let k=0;k<E.length;k++){const S=st(E[k].id);if(k>=n){if(!S.data.Hidden)S.data.setHidden(true);continue}if(S.data.Hidden)S.data.setHidden(false);
  if(k<desde||k>=hasta)continue;const p=P[k],sid=E[k].id,nom='L'+l+' · Escena '+(k+1);if(E[k].name!==nom)A.setSlideName(sid,nom);
  const rc=[...S.unorderedItems].find(i=>i.data&&i.data.setSource),ifr='<iframe src="'+BASE+'unidad-0'+u+'/leccion-0'+l+'/'+p.src+'" width="767" height="510" style="border:0" title="'+p.id+'" allowfullscreen></iframe>';
  if(rc&&String(rc.data.Source).indexOf(BASE+'unidad-0'+u+'/leccion-0'+l+'/'+p.src+'"')<0){rc.data.setSource('<div class="card-iframe">'+ifr+'</div>');if(rc.data.setOriginalUrl)rc.data.setOriginalUrl(ifr);c++}
  const tx=its(sid).filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.x<300&&i.position.y>90&&i.position.y<330).sort((a,b)=>a.position.y-b.position.y),T=tx[0],Sb=tx[1];
  if(T){c+=pon(T.id,p.titulo);const L=p.titulo.length,fs=L<=30?30:L<=48?26:L<=75?22:19;try{if(A.getTextItemDetails(T.id).fontSize!==fs)A.updateTextFontSize(T.id,fs)}catch(e){}}if(Sb){if(p.subtitulo){c+=pon(Sb.id,p.subtitulo);A.updateItemOpacity(Sb.id,1)}else A.updateItemOpacity(Sb.id,0)}await d(60)}
 return 'páginas '+n+' de '+E.length+' · cambios '+c}
async function acomodar(M,desde=0,hasta=1e9){const P=M.paginas,E=esc();let c=0;
 for(let k=desde;k<Math.min(P.length,E.length,hasta);k++){A.selectSlide(E[k].id);await d(480);const I=its(E[k].id),tx=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.x<300&&i.position.y>90&&i.position.y<330).sort((a,b)=>a.position.y-b.position.y),T=tx[0],Sb=tx[1];if(!T)continue;
  const img=I.filter(i=>i.type==='image'&&!i.parentGroupId&&i.position.x<300&&i.position.y>140&&i.size.width>150)[0];
  const sy=T.position.y+T.size.height+8;if(Sb&&Math.abs(Sb.position.y-sy)>2){A.updateItemPosition(Sb.id,{x:Sb.position.x,y:sy});c++}
  const bajo=Sb&&P[k].subtitulo?sy+Sb.size.height:T.position.y+T.size.height;
  if(img){const top=bajo+12,mh=592-top,r=img.size.width/img.size.height;let h=Math.min(329,mh),w=h*r;if(w>359){w=359;h=w/r}
   if(Math.abs(img.size.height-h)>3){A.updateItemSize(img.id,{width:w,height:h});await d(50);c++}
   const y=top+(mh-h)/2,x=28+(359-w)/2;if(Math.abs(img.position.y-y)>3||Math.abs(img.position.x-x)>3){A.updateItemPosition(img.id,{x,y});c++}}await d(30)}
 A.selectSlide(A.getSlides()[0].id);await d(250);return 'acomodadas '+c}
async function pegar(slideId,gid){const antes=its(slideId).map(i=>i.id);A.selectSlide(slideId);await d(350);A.copyItems([gid]);await d(250);A.pasteItems();await d(1100);return its(slideId).filter(i=>!antes.includes(i.id)&&i.type==='group'&&!i.parentGroupId)[0]}
const ir=(id,dest)=>{try{A.deleteItemInteractivity(id,'goToSlide')}catch(e){}A.setGoToSlideInteractivity({itemId:id,target:{slideId:dest}})};
async function indice(l,M){const P=M.paginas,E=esc(),secs=[];P.forEach((p,k)=>{const t=p.indice||p.titulo;if(!secs.length||secs[secs.length-1].t!==t)secs.push({t,k})});
 const sl=A.getSlides(),por=sl.find(s=>/· Portada$/.test(s.name)),ind=sl.find(s=>/· Índice$/.test(s.name)),U=secs.length,r=[];
 if(por){A.selectSlide(por.id);await d(650);const I=its(por.id),hijos=g=>its(por.id).filter(i=>i.parentGroupId===g.id);
  let C=I.filter(i=>i.type==='group'&&!i.parentGroupId&&i.size.width<60&&hijos(i).some(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id))))).sort((a,b)=>(b.position.x>=0)-(a.position.x>=0)||a.position.x-b.position.x);
  const tot=U<=16?U:0;let g=0;while(C.length<tot&&C.length&&g++<16){const nv=await pegar(por.id,C[C.length-1].id);if(!nv)break;C.push(nv)}
  /* el bloque va debajo del título, sin pisarse: filete, «En esta lección» y los círculos; las dos líneas grises sueltas salen del lienzo */
  const T=I.filter(i=>i.type==='text'&&!i.parentGroupId&&i.position.x<120&&i.position.y>150&&i.position.y<215).sort((a,b)=>a.position.y-b.position.y)[0];
  let bajo=386;if(T){const tx=pl(A.getTextHtml(T.id));let fs=23;try{fs=A.getTextItemDetails(T.id).fontSize||23}catch(e){}
   /* alto real del título: el del párrafo dibujado en el editor; si no se halla, renglones estimados palabra a palabra */
   const cpl=Math.floor(T.size.width/(fs*0.56));let lin=1,c=0;for(const w of tx.split(' ')){if(c&&c+1+w.length>cpl){lin++;c=w.length}else c+=(c?1:0)+w.length}let alto=lin*fs*1.2;
   try{const el=[...document.querySelectorAll('p')].filter(e=>(e.textContent||'').replace(/\s+/g,' ').trim()===tx).map(e=>e.getBoundingClientRect()).filter(r=>r.width>60).sort((a,b)=>b.width-a.width)[0];if(el){const h=el.height/(el.width/T.size.width);if(h>fs&&h<fs*8)alto=h}}catch(e){}
   bajo=T.position.y+alto}
  const fil=I.find(i=>i.type==='svg'&&!i.parentGroupId&&i.size.height<9&&i.size.width<130&&i.position.x<130&&i.position.y>150),eti=I.find(i=>i.type==='text'&&!i.parentGroupId&&/^En esta lecci/.test(pl(A.getTextHtml(i.id))));
  const by=Math.round(bajo+14),ey=by+20,cy=ey+(eti?34:6);
  if(fil)A.updateItemPosition(fil.id,{x:80,y:by});if(eti){A.updateItemPosition(eti.id,{x:tot?77:-900,y:ey})}
  for(const ln of I.filter(i=>i.type==='svg'&&!i.parentGroupId&&i!==fil&&i.size.height<9&&i.size.width>60&&i.position.x<200&&i.position.x>=0&&i.position.y>200))A.updateItemPosition(ln.id,{x:-900,y:ln.position.y});
  const bot=I.find(i=>i.type==='group'&&!i.parentGroupId&&hijos(i).some(h=>h.type==='text'&&/^Comenzar/.test(pl(A.getTextHtml(h.id)))));if(bot){const yb=Math.min(600-bot.size.height,(tot?cy+42*Math.ceil(tot/8):ey)+14);A.updateItemPosition(bot.id,{x:bot.position.x,y:yb})}
  for(let i=0;i<C.length;i++){if(i>=tot){A.updateItemPosition(C[i].id,{x:-400,y:386});continue}A.updateItemPosition(C[i].id,{x:77+46*(i%8),y:cy+42*Math.floor(i/8)});
   for(const h of hijos(C[i])){if(h.type==='svg'){try{await A.updateSvgSource(h.id,CIRC)}catch(e){}}else if(h.type==='text')pon(h.id,String(i+1))}ir(C[i].id,E[secs[i].k].id);await d(40)}r.push('círculos '+tot)}
 if(ind&&U<=14){const hijos=g=>its(ind.id).filter(i=>i.parentGroupId===g.id),txt=g=>hijos(g).filter(h=>h.type==='text').map(h=>pl(A.getTextHtml(h.id)));
  let G=its(ind.id).filter(i=>i.type==='group'&&!i.parentGroupId&&i.size.width>400),ini=G.find(g=>txt(g).some(t=>/^Inicio/.test(t))),fin=G.find(g=>txt(g).some(t=>/^Fin de/.test(t)));
  if(!fin){fin=G.find(g=>g!==ini&&g.position.x>-100&&!hijos(g).some(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id)))));if(fin){const tt=hijos(fin).find(h=>h.type==='text');if(tt)pon(tt.id,'Fin de la lección')}}
  if(fin){const sf=sl.find(s=>/· Fin$/.test(s.name));if(sf)ir(fin.id,sf.id)}if(ini&&por)ir(ini.id,por.id);
  let N=G.filter(g=>g!==ini&&g!==fin).sort((a,b)=>(a.position.x-b.position.x)||(a.position.y-b.position.y)),g=0;
  while(N.length<U&&N.length&&g++<16){const nv=await pegar(ind.id,N[N.length-1].id);if(!nv)break;N.push(nv)}
  const orden=[ini,...N.slice(0,U),fin].filter(Boolean),filas=Math.ceil(orden.length/2),H=Math.min(102,Math.floor(427/filas)-7);
  for(let i=0;i<N.length;i++){const gr=N[i];if(i>=U){A.updateItemPosition(gr.id,{x:-900,y:173});continue}const hs=hijos(gr),num=hs.find(h=>h.type==='text'&&/^\d+$/.test(pl(A.getTextHtml(h.id)))),tit=hs.find(h=>h.type==='text'&&h!==num);if(num)pon(num.id,String(i+1));if(tit)pon(tit.id,secs[i].t);ir(gr.id,E[secs[i].k].id);await d(40)}
  await d(350);
  for(let i=0;i<orden.length;i++){const gr=orden[i];for(const h of hijos(gr)){const w=Math.round(h.size.width),a=h.size.height;if(h.type==='svg'&&w>400){if(Math.abs(a-H)>1)A.updateItemSize(h.id,{width:h.size.width,height:H})}else A.updateItemPosition(h.id,{x:h.position.x,y:(H-a)/2});await d(25)}
   await d(80);A.updateItemPosition(gr.id,{x:i<filas?24:607,y:173+(i%filas)*(H+7)});await d(40)}
  r.push('índice '+U+' apartados, alto '+H)}else if(ind)r.push('índice sin tocar: '+U+' apartados');
 A.selectSlide(A.getSlides()[0].id);await d(250);return r.join(' · ')}
/* Ilustración de la columna izquierda: la que el manifiesto asigna a la página (juego aprobado del curso, por tema). La primera vez
   Genially la sube; las siguientes páginas reutilizan esa dirección. Después hay que correr acomodar(). */
async function ilustrar(desde=0,hasta=1e9){const P=window.APM.paginas,E=esc(),K='ap_ilus_'+location.pathname.split('/').pop();let cache={};try{cache=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}let c=0,f=0,err='';
 for(let k=desde;k<Math.min(P.length,E.length,hasta);k++){const n=P[k].ilus;if(!n)continue;const img=its(E[k].id).filter(i=>i.type==='image'&&!i.parentGroupId&&i.position.x<300&&i.position.y>140&&i.size.width>100)[0];if(!img)continue;
  const it=[...st(E[k].id).unorderedItems].find(x=>x.data&&x.data.Id===img.id),url=BASE+'unidad-01/medios/ilus/'+n+'.png';if(it&&(it.data.Source===url||(cache[n]&&it.data.Source===cache[n])))continue;
  try{await A.replaceImage(img.id,cache[n]||url,{box:'fit'});await d(220);const s=it&&it.data.Source;if(s&&s!==url&&!cache[n]){cache[n]=s;try{localStorage.setItem(K,JSON.stringify(cache))}catch(e){}}c++}catch(e){f++;err=String(e).slice(0,80)}}
 return 'ilustraciones '+c+(f?' · fallas '+f+' '+err:'')}
async function portadas(){const MM=[[197,233,226,207,224,214],[170,218,205,168,196,182]];let c=0,f=0;
 for(const s of A.getSlides()){if(/Escena \d+/.test(s.name||''))continue;for(const im of its(s.id).filter(i=>i.type==='image'&&i.size.width>150&&i.position.y>60)){try{
   const it=[...st(s.id).unorderedItems].find(x=>x.data&&x.data.Id===im.id);if(!it||!/^http/.test(it.data.Source||''))continue;
   const bm=await createImageBitmap(await(await fetch(it.data.Source,{mode:'cors'})).blob()),cv=document.createElement('canvas');cv.width=bm.width;cv.height=bm.height;const x=cv.getContext('2d');x.drawImage(bm,0,0);const dt=x.getImageData(0,0,cv.width,cv.height),p=dt.data;let n=0;
   for(let i=0;i<p.length;i+=4){if(p[i+3]<8)continue;for(const m of MM){const dd=Math.abs(p[i]-m[0])+Math.abs(p[i+1]-m[1])+Math.abs(p[i+2]-m[2]);if(dd<54){const w=Math.min(1,(54-dd)/30);p[i]+=w*(m[3]-m[0]);p[i+1]+=w*(m[4]-m[1]);p[i+2]+=w*(m[5]-m[2]);if(dd<24)n++;break}}}
   if(n<p.length/4*0.004)continue;x.putImageData(dt,0,0);await A.replaceImage(im.id,cv.toDataURL('image/png'),{box:'keep'});await d(900);c++}catch(e){f++}}}
 return 'portadas '+c+(f?' · sin leer '+f:'')}
async function montar(u,l,desde,hasta){const M=await(await fetch(BASE+'unidad-0'+u+'/leccion-0'+l+'/manifiesto.json?'+Date.now())).json();window.APM=M;
 const a=await paginas(u,l,M,desde,hasta);await d(1200);const b=await acomodar(M,desde,hasta);return a+' · '+b}
return{color,montar,ilustrar,portadas,acomodar:async(a,b)=>acomodar(window.APM,a,b),indice:async l=>indice(l,window.APM),guardar:async()=>(await A.saveNow()).status,esc,M:()=>window.APM}})();'AP listo v8'
