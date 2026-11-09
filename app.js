(function(){
"use strict";

/* ================= Constantes ================= */
var CATS=["Gafas de sol","Deportivas","Blue Light","Red Light","Formuladas"];
var ETAPAS=[
  {id:"TOFU",t:"Atraer",d:"Generar conciencia, dar a conocer lo nuevo, recuperar clientes inactivos"},
  {id:"MOFU",t:"Posicionar",d:"Generar valor, explicar, comparar, dar confianza"},
  {id:"BOFU",t:"Cerrar",d:"Demostraciones, descuentos y atención personalizada"}];
var FORMATOS=["UGC","Video producto","Educación de producto","Moda aspiracional","Estático","Carrusel","Testimonio","Demo","Unboxing","Reel en tienda","Motion / animación"];
var ESTADOS=["Idea","Referentes","Guion","Producción","Edición","En pauta","Analizado"];
var DONE=["En pauta","Analizado"];
var FUENTES=["Meta Ad Library","Instagram","TikTok","Pinterest","YouTube","Competencia","Otro"];
var VENTANAS=[{k:"mes",t:"Mes completo"},{k:"sem",t:"Semana pasada"},{k:"act",t:"Semana actual"}];
var TIERS=[{id:"ganador",t:"Ganador"},{id:"fatiga",t:"Fatigándose"},{id:"prometedor",t:"Prometedor"},{id:"prueba",t:"En prueba"},{id:"perdedor",t:"Perdedor"}];
var ELEMENTOS=["Hook","Oferta / precio","Formato","Creador / talento","Producto","Música / ritmo","Copy","Prueba social","Demostración","Público"];
var PAUTA_KEYS=["campana","campanaId","conjunto","conjuntoId","anuncio","anuncioId","ventanas","ctr","clasif","elementos","aprendizaje"];
var BRIEF_FIELDS=[
  ["creador","Creador o creadora",{ph:"Nombre de quien graba"}],
  ["entrega","Fecha de entrega",{type:"date"}],
  ["cantidad","Cantidad",{ph:"Ej: 1 video + 2 variaciones de hook"}],
  ["duracion","Duración",{ph:"Ej: 15 a 30 segundos"}],
  ["formatoVideo","Formato del video",{ph:"Ej: Vertical 9:16"}],
  ["objetivo","Qué queremos lograr",{full:true,area:true,rows:2,ph:"Lo que la persona debe sentir o hacer al ver el video"}],
  ["si","Qué hacer (una idea por línea)",{full:true,area:true,rows:4}],
  ["no","Qué evitar (una idea por línea)",{full:true,area:true,rows:4}],
  ["specs","Especificaciones técnicas (una por línea)",{full:true,area:true,rows:4}],
  ["entregables","Qué nos debe entregar (una cosa por línea)",{full:true,area:true,rows:3}],
  ["notas","Notas y uso del contenido",{full:true,area:true,rows:3}]];
var BRIEF_BASE_DEFAULT={
  cantidad:"1 video + 2 variaciones del hook",
  duracion:"15 a 30 segundos",
  formatoVideo:"Vertical 9:16 (1080 × 1920)",
  si:"Muestra las gafas puestas en los primeros 3 segundos\nHabla como si le contaras a un amigo\nQue se vea el logo PIXXIESX en la patilla o el estuche\nGraba varias tomas del hook",
  no:"No menciones precios ni descuentos que no estén en este brief\nNo muestres marcas de la competencia\nNo uses música con derechos de autor\nNo hagas promesas de salud o médicas",
  specs:"Graba en 4K o 1080p a 30 fps\nLuz natural de frente, sin contraluz\nAudio limpio, sin música de fondo (la ponemos nosotros)\nSin subtítulos ni textos sobre el video\nDeja 2 segundos quietos al inicio y al final de cada toma",
  entregables:"Video crudo sin editar, en la mejor calidad\nTomas extra del producto (B-roll) de 5 a 10 segundos\n3 fotos con las gafas puestas",
  notas:"Envía el material por Google Drive o WeTransfer, no por WhatsApp (lo comprime).\nPixxiesx puede usar este contenido en sus redes y anuncios."};

/* ================= Utilidades ================= */
function $(s,r){return (r||document).querySelector(s)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function uuid(){try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==="x"?r:(r&3|8)).toString(16)})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function clone(o){return JSON.parse(JSON.stringify(o))}
function digits(v){var n=parseFloat(String(v||"").replace(/[^\d]/g,""));return isNaN(n)?0:n}
function dec(v){var n=parseFloat(String(v==null?"":v).replace(/\s/g,"").replace(",","."));return isNaN(n)?0:n}
function cop(n){try{return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n)}catch(e){return "$"+Math.round(n)}}
function fdate(f){if(!f)return "";var d=new Date(f+"T12:00:00");if(isNaN(d))return f;return d.toLocaleDateString("es-CO",{day:"numeric",month:"short"})}
function domain(u){try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return ""}}
function opts(list,val,empty){return (empty!=null?'<option value="">'+esc(empty)+'</option>':"")+list.map(function(x){return '<option'+(x===val?" selected":"")+'>'+esc(x)+'</option>'}).join("")}
function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("show")},3200)}
function mediaHTML(r,cls,controls){if(!r||!r.media)return "";return r.mediaType==="video"?'<video class="'+cls+'" src="'+esc(r.media)+'" muted playsinline preload="metadata"'+(controls?" controls":"")+'></video>':'<img class="'+cls+'" src="'+esc(r.media)+'" alt="'+esc(r.nota||"Referente")+'" loading="lazy">'}
function errMsg(e){var m=(e&&(e.message||e.error_description||e.msg))||String(e||"");
  if(/Invalid login credentials/i.test(m))return "Correo o contraseña incorrectos.";
  if(/Email not confirmed/i.test(m))return "Tu correo todavía no está confirmado. Revisa tu bandeja de entrada.";
  if(/Password should be at least/i.test(m))return "La contraseña debe tener al menos 6 caracteres.";
  if(/rate limit|too many/i.test(m))return "Demasiados intentos. Espera un minuto y vuelve a intentar.";
  if(/Failed to fetch|NetworkError/i.test(m))return "No hay conexión. Revisa tu internet.";
  return m;}

/* ================= Supabase ================= */
var CFG=window.PIXXIESX_CONFIG||{};
var configured=CFG.url&&CFG.anonKey&&!/PEGA_AQUI/.test(CFG.url+CFG.anonKey);
var sb=configured&&window.supabase?window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
var initialHash=location.hash||"";
var needPassword=/type=(invite|recovery)/.test(initialHash);

/* ================= Estado ================= */
var session=null,me=null,loading=false,loaded=false,lastLoad=0;
var state={perfiles:[],creativos:[],banco:[],config:{metaCpa:35000,metaRoas:3,minCompras:3,briefBase:BRIEF_BASE_DEFAULT}};
var ui={tab:"",q:"",fCat:"",fEtapa:"",fEstado:"",fResp:""};
var draft=null,dirty=false,saving=false;
function isAdmin(){return !!me&&me.rol==="admin"}
function perfil(id){return state.perfiles.filter(function(p){return p.id===id})[0]}
function nombreDe(id){var p=perfil(id);return p?(p.nombre||p.email):""}

/* ---- conversión base de datos <-> pantalla ---- */
function blankVentanas(){return {mes:{inv:"",comp:"",ven:""},sem:{inv:"",comp:"",ven:""},act:{inv:"",comp:"",ven:""}}}
function fromDb(r,p){
  p=p||{};
  return {id:r.id,ejemplo:!!r.ejemplo,nombre:r.nombre||"",categoria:r.categoria,etapa:r.etapa,formato:r.formato,estado:r.estado,producto:r.producto||"",angulo:r.angulo||"",insight:r.insight||"",
    fecha:r.fecha||"",responsable:r.responsable||"",refs:r.refs||[],hook:r.hook||"",mensaje:r.mensaje||"",cta:r.cta||"",escenas:r.escenas||[],recursos:r.recursos||"",
    copyPrincipal:r.copy_principal||"",copyTitulo:r.copy_titulo||"",copyDesc:r.copy_desc||"",brief:r.brief||{},productos:r.productos||[],briefToken:r.brief_token||"",briefActivo:!!r.brief_activo,actualizado:r.actualizado,
    campana:p.campana||"",campanaId:p.campana_id||"",conjunto:p.conjunto||"",conjuntoId:p.conjunto_id||"",anuncio:p.anuncio||"",anuncioId:p.anuncio_id||"",
    ventanas:Object.assign(blankVentanas(),p.ventanas||{}),ctr:p.ctr||"",clasif:p.clasif||"",elementos:p.elementos||[],aprendizaje:p.aprendizaje||""};
}
function toDb(c){return {id:c.id,ejemplo:false,nombre:c.nombre,categoria:c.categoria,etapa:c.etapa,formato:c.formato,estado:c.estado,producto:c.producto,angulo:c.angulo,insight:c.insight,
  fecha:c.fecha||null,responsable:c.responsable||null,refs:c.refs,hook:c.hook,mensaje:c.mensaje,cta:c.cta,escenas:c.escenas,recursos:c.recursos,
  copy_principal:c.copyPrincipal,copy_titulo:c.copyTitulo,copy_desc:c.copyDesc,brief:c.brief,productos:c.productos||[],brief_activo:!!c.briefActivo}}
function toDbPauta(c){return {creativo_id:c.id,campana:c.campana,campana_id:c.campanaId,conjunto:c.conjunto,conjunto_id:c.conjuntoId,anuncio:c.anuncio,anuncio_id:c.anuncioId,
  ventanas:c.ventanas,ctr:c.ctr,clasif:c.clasif,elementos:c.elementos,aprendizaje:c.aprendizaje}}
function bancoFromDb(r){return {id:r.id,ejemplo:!!r.ejemplo,plataforma:r.plataforma,url:r.url,categoria:r.categoria,etapa:r.etapa,formato:r.formato,nota:r.nota,media:r.media,mediaType:r.media_type}}
function bancoToDb(b){return {id:b.id,ejemplo:false,plataforma:b.plataforma,url:b.url,categoria:b.categoria,etapa:b.etapa,formato:b.formato,nota:b.nota,media:b.media||"",media_type:b.mediaType||""}}
function blankCreativo(){return {id:uuid(),_nuevo:true,nombre:"",categoria:CATS[0],etapa:"TOFU",formato:"UGC",estado:"Idea",producto:"",angulo:"",insight:"",fecha:"",responsable:"",refs:[],hook:"",mensaje:"",cta:"",escenas:[],recursos:"",
  copyPrincipal:"",copyTitulo:"",copyDesc:"",productos:[],brief:clone(state.config.briefBase||BRIEF_BASE_DEFAULT),briefToken:"",briefActivo:false,
  campana:"",campanaId:"",conjunto:"",conjuntoId:"",anuncio:"",anuncioId:"",ventanas:blankVentanas(),ctr:"",clasif:"",elementos:[],aprendizaje:""}}
function blankRef(){return {id:uid(),plataforma:"Meta Ad Library",url:"",nota:"",media:"",mediaType:""}}

function q(res){if(res.error)throw res.error;return res.data}
function loadAll(silent){
  if(!sb||!session)return Promise.resolve();
  loading=true;
  return Promise.all([
    sb.from("perfiles").select("*"),
    sb.from("creativos").select("*"),
    isAdmin()?sb.from("pauta").select("*"):Promise.resolve({data:[]}),
    sb.from("banco").select("*"),
    sb.from("config").select("*")
  ]).then(function(r){
    var perfiles=q(r[0]),creativos=q(r[1]),pauta=q(r[2])||[],banco=q(r[3]),cfg=(q(r[4])||[])[0]||{};
    var pmap={};pauta.forEach(function(p){pmap[p.creativo_id]=p});
    state.perfiles=perfiles.sort(function(a,b){return (a.nombre||"").localeCompare(b.nombre||"")});
    state.creativos=creativos.map(function(c){return fromDb(c,pmap[c.id])});
    state.banco=banco.sort(function(a,b){return String(a.creado).localeCompare(String(b.creado))}).map(bancoFromDb);
    var bb=cfg.brief_base&&Object.keys(cfg.brief_base).length?cfg.brief_base:BRIEF_BASE_DEFAULT;
    state.config={metaCpa:Number(cfg.meta_cpa)||35000,metaRoas:Number(cfg.meta_roas)||3,minCompras:Number(cfg.min_compras)||3,briefBase:bb};
    loaded=true;lastLoad=Date.now();loading=false;
    if(!silent||!draft)render();
  },function(e){loading=false;toast("No se pudieron cargar los datos: "+errMsg(e));render()});
}
function loadMe(){
  return sb.from("perfiles").select("*").eq("id",session.user.id).then(function(res){
    var p=(res.data||[])[0];
    me=p||{id:session.user.id,nombre:session.user.email,email:session.user.email,rol:"contenido"};
  });
}

/* ================= Shopify (catálogo, solo lectura) ================= */
var SHOP=(CFG.shopify)||{};
var shopReady=!!(SHOP.domain&&SHOP.storefrontToken&&!/PEGA_AQUI/.test(SHOP.storefrontToken));
var shopCache={},shopSeq=0,shopTimer=null;
var shopUi={q:"",items:[],cursor:null,more:false,loading:false,error:"",pick:{}};
var PRODUCT_FIELDS='id title handle productType availableForSale onlineStoreUrl featuredImage{url(transform:{maxWidth:320,maxHeight:320}) altText} priceRange{minVariantPrice{amount currencyCode}} variants(first:50){nodes{id title availableForSale price{amount currencyCode} selectedOptions{name value}}}';
function shopFetch(query,variables,intento){
  intento=intento||0;
  var ctrl=window.AbortController?new AbortController():null;
  var timer=setTimeout(function(){if(ctrl)ctrl.abort()},12000);
  return fetch("https://"+SHOP.domain+"/api/"+(SHOP.apiVersion||"2026-10")+"/graphql.json",{
    method:"POST",signal:ctrl?ctrl.signal:undefined,
    headers:{"Content-Type":"application/json","Accept":"application/json","X-Shopify-Storefront-Access-Token":SHOP.storefrontToken},
    body:JSON.stringify({query:query,variables:variables||{}})
  }).then(function(res){
    clearTimeout(timer);
    if(res.status===401||res.status===403)throw new Error("auth");
    if((res.status===429||res.status===430||res.status>=500)&&intento<2)return new Promise(function(ok){setTimeout(ok,800*(intento+1))}).then(function(){return shopFetch(query,variables,intento+1)});
    if(!res.ok)throw new Error("http "+res.status);
    return res.json();
  }).then(function(j){
    if(j&&j.errors&&j.errors.length){
      if(j.errors.some(function(e){return e.extensions&&e.extensions.code==="THROTTLED"})&&intento<2)return new Promise(function(ok){setTimeout(ok,1000)}).then(function(){return shopFetch(query,variables,intento+1)});
      throw new Error(j.errors[0].message||"error");
    }
    return j.data;
  },function(e){clearTimeout(timer);throw e});
}
function shopQueryText(q){
  var words=String(q||"").trim().replace(/["():\\]/g," ").split(/\s+/).filter(Boolean);
  if(!words.length)return "";
  words[words.length-1]=words[words.length-1]+"*";
  return words.join(" ");
}
function searchProducts(q,after){
  var key=q+"|"+(after||"");
  if(shopCache[key])return Promise.resolve(shopCache[key]);
  var qt=shopQueryText(q);
  var gql='query($q:String,$after:String,$sort:ProductSortKeys){products(first:24,after:$after,query:$q,sortKey:$sort){pageInfo{hasNextPage endCursor} nodes{'+PRODUCT_FIELDS+'}}}';
  return shopFetch(gql,{q:qt||null,after:after||null,sort:qt?"RELEVANCE":"BEST_SELLING"}).then(function(d){
    var r={items:(d.products.nodes||[]),cursor:d.products.pageInfo.endCursor,more:d.products.pageInfo.hasNextPage};
    shopCache[key]=r;return r;
  });
}
function shopErr(e){var m=String(e&&e.message||e);
  if(m==="auth")return "El token de Shopify no es válido o no tiene permiso para ver productos.";
  if(/abort/i.test(m))return "Shopify tardó demasiado en responder. Intenta de nuevo.";
  if(/Failed to fetch|NetworkError|Load failed/i.test(m))return "No se pudo conectar con Shopify. Revisa tu internet.";
  return "Shopify respondió con un error: "+m;}
function money(m){if(!m)return "";var n=Number(m.amount);return isNaN(n)?"":cop(n)}
function numId(gid){return String(gid||"").split("/").pop()}
function isDefaultVariant(v){return !v||v.title==="Default Title"}
function snapshot(p,v){
  var url=(p.onlineStoreUrl||((SHOP.tienda||"https://www.pixxiesx.co")+"/products/"+p.handle))+(v&&!isDefaultVariant(v)&&p.variants.nodes.length>1?"?variant="+numId(v.id):"");
  return {productId:p.id,variantId:v?v.id:"",titulo:p.title,variante:isDefaultVariant(v)?"":v.title,imagen:p.featuredImage?p.featuredImage.url:"",precio:v?money(v.price):money(p.priceRange&&p.priceRange.minVariantPrice),handle:p.handle,url:url,tipo:p.productType||"",nota:""};
}
function runProductSearch(more){
  var seq=++shopSeq,q=shopUi.q;
  shopUi.loading=true;shopUi.error="";if(!more){shopUi.items=[];shopUi.cursor=null;shopUi.more=false}
  paintResults();
  searchProducts(q,more?shopUi.cursor:null).then(function(r){
    if(seq!==shopSeq)return;
    shopUi.loading=false;shopUi.items=more?shopUi.items.concat(r.items):r.items;shopUi.cursor=r.cursor;shopUi.more=r.more;paintResults();
  },function(e){if(seq!==shopSeq)return;shopUi.loading=false;shopUi.error=shopErr(e);paintResults()});
}
function isPicked(pid,vid){return !!draft&&(draft.data.productos||[]).some(function(x){return x.productId===pid&&(!vid||x.variantId===vid)})}
function resultsHTML(){
  if(!shopReady)return '<p class="hint">Falta conectar Shopify: agrega el token de Storefront en config.js.</p>';
  var h="";
  if(shopUi.error)h+='<div class="shop-msg bad">'+esc(shopUi.error)+' <button class="btn small" type="button" data-shop-retry>Reintentar</button></div>';
  if(!shopUi.items.length&&!shopUi.loading&&!shopUi.error)h+='<p class="hint">'+(shopUi.q?"No encontramos gafas con \""+esc(shopUi.q)+"\". Prueba con el nombre del modelo o el color.":"Escribe para buscar en tu catálogo.")+'</p>';
  if(shopUi.items.length)h+='<div class="shop-grid">'+shopUi.items.map(function(p){
    var vs=(p.variants&&p.variants.nodes)||[],multi=vs.length>1||(vs.length===1&&!isDefaultVariant(vs[0]));
    var sel=shopUi.pick[p.id]||(vs[0]&&vs[0].id)||"";
    var picked=isPicked(p.id,multi?sel:null);
    return '<div class="shop-item'+(p.availableForSale?"":" agotado")+'">'+(p.featuredImage?'<img src="'+esc(p.featuredImage.url)+'" alt="'+esc(p.featuredImage.altText||p.title)+'" loading="lazy">':'<div class="noimg">Sin foto</div>')+
      '<div class="si-b"><b>'+esc(p.title)+'</b><span class="meta">'+esc(money(p.priceRange&&p.priceRange.minVariantPrice))+(p.availableForSale?"":" · Agotado")+'</span>'+
      (multi?'<label class="vh" for="var-'+esc(numId(p.id))+'">Variante</label><select id="var-'+esc(numId(p.id))+'" data-shop-var="'+esc(p.id)+'">'+vs.map(function(v){return '<option value="'+esc(v.id)+'"'+(v.id===sel?" selected":"")+'>'+esc(v.title)+(v.availableForSale?"":" (agotado)")+'</option>'}).join("")+'</select>':"")+
      '<button class="btn small'+(picked?"":" primary")+'" type="button" data-shop-add="'+esc(p.id)+'"'+(picked?" disabled":"")+'>'+(picked?"Agregada ✓":"Agregar")+'</button></div></div>'}).join("")+'</div>';
  if(shopUi.loading)h+='<p class="hint">Buscando en Shopify…</p>';
  else if(shopUi.more)h+='<div class="row"><button class="btn small" type="button" data-shop-more>Ver más</button></div>';
  return h;
}
function paintResults(){var el=$("#shop-results");if(el)el.innerHTML=resultsHTML()}
function gafasBlock(d){
  var ps=d.productos||[];
  var sel=ps.length?'<div class="picked">'+ps.map(function(x,i){
    return '<div class="pk">'+(x.imagen?'<img src="'+esc(x.imagen)+'" alt="'+esc(x.titulo)+'">':'<div class="noimg">Sin foto</div>')+
    '<div class="pk-b"><b>'+esc(x.titulo)+'</b><span class="meta">'+esc([x.variante,x.precio].filter(Boolean).join(" · "))+'</span>'+
    '<label class="vh" for="pk-'+i+'">Nota sobre estas gafas</label><input id="pk-'+i+'" data-pk="'+i+'" value="'+esc(x.nota||"")+'" placeholder="Ej: las usa la creadora en el hook">'+
    (x.url?'<a class="link" href="'+esc(x.url)+'" target="_blank" rel="noopener">Ver en la tienda ↗</a>':"")+'</div>'+
    '<button class="icon-btn" type="button" data-pk-rm="'+i+'" aria-label="Quitar '+esc(x.titulo)+'">×</button></div>'}).join("")+'</div>':'<p class="hint">Todavía no has elegido gafas para este video.</p>';
  return '<section class="block"><h3><span class="num">2</span>Gafas del video</h3><p class="hint">Busca en tu catálogo de Shopify y elige los modelos que deben salir en el video. El creador los ve con foto en su brief.</p>'+sel+
    (shopReady?'<div class="fld"><label for="shop-q">Buscar gafas en Shopify</label><input id="shop-q" type="search" data-shop-q autocomplete="off" placeholder="Ej: glarex, novax, red light, negra…" value="'+esc(shopUi.q)+'"></div>':"")+
    '<div id="shop-results">'+resultsHTML()+'</div></section>';
}
function addProduct(pid){
  var p=shopUi.items.filter(function(x){return x.id===pid})[0];if(!p||!draft)return;
  var vs=(p.variants&&p.variants.nodes)||[],vid=shopUi.pick[pid]||(vs[0]&&vs[0].id);
  var v=vs.filter(function(x){return x.id===vid})[0]||vs[0];
  if(isPicked(p.id,v&&vs.length>1?v.id:null))return;
  draft.data.productos=draft.data.productos||[];draft.data.productos.push(snapshot(p,v));dirty=true;renderSheet();toast("Agregada: "+p.title);
}
function productThumbs(c){var ps=c.productos||[];if(!ps.length)return "";
  return '<div class="pthumbs">'+ps.slice(0,4).map(function(x){return x.imagen?'<img src="'+esc(x.imagen)+'" alt="'+esc(x.titulo)+'" title="'+esc(x.titulo)+'">':""}).join("")+(ps.length>4?'<span>+'+(ps.length-4)+'</span>':"")+'</div>'}

/* ================= Clasificación de ganadores ================= */
function metaCpa(){return state.config.metaCpa||35000}
function metaRoas(){return state.config.metaRoas||3}
function minComp(){return state.config.minCompras||1}
function win(c,k){var w=(c.ventanas||{})[k]||{};var inv=digits(w.inv),comp=digits(w.comp),ven=digits(w.ven);return {inv:inv,comp:comp,ven:ven,cpa:comp?inv/comp:null,roas:inv&&ven?ven/inv:null,ticket:comp&&ven?ven/comp:null}}
function roasTxt(r){return r==null?"–":r.toFixed(1).replace(".",",")}
function okCpa(w){return w.cpa!=null&&w.cpa<=metaCpa()}
function okRoas(w){return w.roas!=null&&w.roas>=metaRoas()}
function tierName(id){var t=TIERS.filter(function(x){return x.id===id})[0];return t?t.t:"Sin datos"}
function autoTier(c){
  var meta=metaCpa(),mr=metaRoas(),min=minComp();
  var m=win(c,"mes"),s=win(c,"sem"),a=win(c,"act");
  var main=m.inv?m:(s.inv?s:a);
  if(!main.inv)return {id:"",why:"Sin datos de pauta todavía. Llena inversión, compras y valor de compras por ventana."};
  var nums="CPA "+(main.cpa!=null?cop(main.cpa):"–")+" · ROAS "+roasTxt(main.roas)+(main.ticket?" · ticket "+cop(main.ticket):"");
  if(main.comp<min){
    if(main.inv>=2*meta&&!okRoas(main))return {id:"perdedor",why:"Gastó "+cop(main.inv)+" con "+main.comp+" compra(s), sin llegar al mínimo de "+min+" ni al ROAS meta."};
    return {id:"prueba",why:"Lleva "+main.comp+" de las "+min+" compras necesarias para juzgarlo. "+nums+"."};
  }
  if(okCpa(main)||okRoas(main)){
    var recent=a.inv?a:(s.inv?s:null);
    if(recent&&recent!==main){
      var bad=recent.comp===0?recent.inv>=meta:(!(recent.cpa<=meta*1.2)&&!(recent.roas!=null&&recent.roas>=mr*0.8));
      if(bad)return {id:"fatiga",why:"Gana en el mes ("+nums+"), pero "+(recent===a?"esta semana":"la semana pasada")+" va en "+(recent.comp?"CPA "+cop(recent.cpa)+" · ROAS "+roasTxt(recent.roas):"0 compras con "+cop(recent.inv)+" invertidos")+"."};
    }
    var byC=okCpa(main),byR=okRoas(main);
    var por=byC&&byR?"cumple CPA y ROAS":byR?"gana por ROAS aunque el CPA supere "+cop(meta):"gana por CPA";
    return {id:"ganador",why:"Ganador: "+por+". "+nums+", "+main.comp+" compras."};
  }
  if((main.cpa!=null&&main.cpa<=meta*1.3)||(main.roas!=null&&main.roas>=mr*0.75))return {id:"prometedor",why:"Cerca de la meta: "+nums+". Vale la pena una variación."};
  return {id:"perdedor",why:"Lejos de las dos metas (CPA "+cop(meta)+", ROAS "+roasTxt(mr)+"): "+nums+"."};
}
function classify(c){var a=autoTier(c);if(c.clasif)return {id:c.clasif,manual:true,why:"Clasificado a mano. Por los números sería: "+tierName(a.id)+"."};return a}
function tierHTML(t){return t&&t.id?'<span class="tier t-'+t.id+'">'+esc(tierName(t.id))+(t.manual?" ✎":"")+'</span>':""}
function roasCell(w){if(w.roas==null)return "–";return '<span class="'+(w.roas>=metaRoas()?"good":"bad")+'">'+roasTxt(w.roas)+'</span>'}
function cpaCell(w){if(w.cpa==null)return w.inv?'<span class="bad">0 compras</span>':"–";return '<span class="'+(w.cpa<=metaCpa()?"good":"bad")+'">'+cop(w.cpa)+'</span>'}

/* ================= Diálogo ================= */
function ask(text,ok){
  return new Promise(function(res){
    var d=document.createElement("div");d.className="dlg-bg";
    d.innerHTML='<div class="dlg" role="alertdialog" aria-modal="true"><p>'+esc(text)+'</p><div class="r"><button class="btn" data-x="0">Cancelar</button><button class="btn primary" data-x="1">'+esc(ok)+'</button></div></div>';
    document.body.appendChild(d);d.querySelector('[data-x="1"]').focus();
    d.addEventListener("click",function(ev){var b=ev.target.closest("[data-x]");if(!b)return;d.remove();res(b.dataset.x==="1")});
  });
}

/* ================= Pantallas de acceso ================= */
function authCard(inner){return '<div class="lock"><div class="lock-card"><img src="/logo-blanco.png" alt="PIXXIESX">'+inner+'</div></div>'}
function viewSetup(){return authCard('<h1>Falta conectar Supabase</h1><p>Pega el Project URL y la anon key en <b>config.js</b> y vuelve a publicar.</p>')}
function viewLogin(msg){
  return authCard('<h1>Desarrollo creativo</h1><p>Ingresa con tu correo y contraseña.</p>'+
  '<form id="login-form" class="auth-form" autocomplete="on"><div class="fld"><label for="lg-email">Correo</label><input id="lg-email" type="email" autocomplete="email" required></div>'+
  '<div class="fld"><label for="lg-pass">Contraseña</label><input id="lg-pass" type="password" autocomplete="current-password" required></div>'+
  '<p class="lock-err" id="auth-err" role="alert">'+esc(msg||"")+'</p><button class="btn primary" type="submit">Entrar</button></form>'+
  '<button class="linkbtn" data-forgot>¿Olvidaste tu contraseña?</button>');
}
function viewForgot(){
  return authCard('<h1>Recuperar contraseña</h1><p>Te enviamos un correo con un enlace para crear una nueva.</p>'+
  '<form id="forgot-form" class="auth-form"><div class="fld"><label for="fg-email">Correo</label><input id="fg-email" type="email" autocomplete="email" required></div>'+
  '<p class="lock-err" id="auth-err" role="alert"></p><button class="btn primary" type="submit">Enviar enlace</button></form><button class="linkbtn" data-back-login>Volver a entrar</button>');
}
function viewSetPassword(){
  return authCard('<h1>Crea tu contraseña</h1><p>'+esc(session&&session.user.email||"")+'</p>'+
  '<form id="setpass-form" class="auth-form"><div class="fld"><label for="sp-name">Tu nombre</label><input id="sp-name" value="'+esc(me&&me.nombre||"")+'" autocomplete="name"></div>'+
  '<div class="fld"><label for="sp-pass">Contraseña nueva (mínimo 8 caracteres)</label><input id="sp-pass" type="password" autocomplete="new-password" required></div>'+
  '<div class="fld"><label for="sp-pass2">Repite la contraseña</label><input id="sp-pass2" type="password" autocomplete="new-password" required></div>'+
  '<p class="lock-err" id="auth-err" role="alert"></p><button class="btn primary" type="submit">Guardar y entrar</button></form>');
}
var authView="login";

/* ================= Marco ================= */
var ICONS={
  tareas:'<path d="M7.28 6.22a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 0 1 1.06-1.06l.47.47 1.47-1.47a.75.75 0 0 1 1.06 0M9 7.75A.75.75 0 0 1 9.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 9 7.75m0 5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75M4.5 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>',
  creativos:'<path d="M4 4.75C4 3.784 4.784 3 5.75 3h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 9.25 10h-3.5A1.75 1.75 0 0 1 4 8.25zm1.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25zM9 11.75c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 14.25 17h-3.5A1.75 1.75 0 0 1 9 15.25zm1.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25zM12 4.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75M4 12.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75"/>',
  ganadores:'<path d="M6 3.75A.75.75 0 0 1 6.75 3h6.5a.75.75 0 0 1 .75.75V5h1.75a.75.75 0 0 1 .75.75v1.5a3.25 3.25 0 0 1-3.06 3.245A4.01 4.01 0 0 1 10.75 12.9v1.6h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2v-1.6a4.01 4.01 0 0 1-2.69-2.405A3.25 3.25 0 0 1 3.5 7.25v-1.5A.75.75 0 0 1 4.25 5H6zm1.5.75V8.5a2.5 2.5 0 0 0 5 0v-4zM6 6.5H5v.75c0 .74.402 1.386 1 1.732zm8 2.482a2 2 0 0 0 1-1.732V6.5h-1z"/>',
  referentes:'<path d="M4 5.75C4 4.784 4.784 4 5.75 4h8.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25zm1.75-.25a.25.25 0 0 0-.25.25v6.19l2.22-2.22a.75.75 0 0 1 1.06 0l1.47 1.47 3.22-3.22a.75.75 0 0 1 1.06 0l.97.97V5.75a.25.25 0 0 0-.25-.25zm8.75 6.06-1.5-1.5-3.72 3.72a.75.75 0 0 1-1.06 0L6.75 12.31 5.5 13.56v.69c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25zM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>',
  funnel:'<path d="M3.5 4.75A.75.75 0 0 1 4.25 4h11.5a.75.75 0 0 1 .58 1.225L12 10.52v4.73a.75.75 0 0 1-1.085.67l-2-1A.75.75 0 0 1 8.5 14.25v-3.73L3.67 5.225A.75.75 0 0 1 3.5 4.75m2.335.75L9.83 10.03a.75.75 0 0 1 .17.475v3.282l.5.25v-3.532a.75.75 0 0 1 .17-.475l3.995-4.53z"/>',
  ajustes:'<path d="M4 6.25h7.1a2.5 2.5 0 0 1 4.8 0h.1a.75.75 0 0 1 0 1.5h-.1a2.5 2.5 0 0 1-4.8 0H4a.75.75 0 0 1 0-1.5m9.5 1.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2M4 12.25h.1a2.5 2.5 0 0 1 4.8 0H16a.75.75 0 0 1 0 1.5H8.9a2.5 2.5 0 0 1-4.8 0H4a.75.75 0 0 1 0-1.5m2.5 1.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>'};
var TITLES={tareas:["Mis tareas","Los creativos que tienes asignados, ordenados por fecha de salida"],creativos:["Creativos","Concepto, referentes, guion, brief y pauta de cada anuncio"],ganadores:["Ganadores","Anuncios clasificados por CPA y ROAS en el mes, la semana pasada y la semana actual"],referentes:["Banco de referentes","Ideas y anuncios que te gustan, listos para convertir en creativos"],funnel:["Mezcla del funnel","Cuántos creativos tienes por categoría, etapa y formato"],ajustes:["Ajustes","Equipo, plantilla del brief y tu cuenta"]};
function tabsFor(){
  if(isAdmin())return [["creativos","Creativos",state.creativos.length],["ganadores","Ganadores",state.creativos.filter(function(c){return classify(c).id==="ganador"}).length],["referentes","Banco de referentes",state.banco.length],["funnel","Mezcla del funnel",null],["ajustes","Ajustes",null]];
  return [["tareas","Mis tareas",myTasks().length],["creativos","Creativos",state.creativos.length],["referentes","Banco de referentes",state.banco.length],["funnel","Mezcla del funnel",null],["ajustes","Mi cuenta",null]];
}
function initials(n){return String(n||"?").trim().split(/\s+/).map(function(w){return w[0]}).join("").slice(0,2).toUpperCase()}

function render(){
  var root=$("#root");
  if(!sb){root.innerHTML=viewSetup();return}
  if(!session){root.innerHTML=authView==="forgot"?viewForgot():viewLogin();focusFirst();return}
  if(needPassword){root.innerHTML=viewSetPassword();focusFirst();return}
  if(!me||!loaded){root.innerHTML=authCard('<p>Cargando…</p>');return}
  var tabs=tabsFor(),allowed=tabs.map(function(t){return t[0]});
  if(allowed.indexOf(ui.tab)<0)ui.tab=allowed[0];
  var tt=TITLES[ui.tab];if(ui.tab==="ajustes"&&!isAdmin())tt=["Mi cuenta","Tu nombre y tu contraseña"];
  var canCreate=ui.tab!=="ajustes";
  root.innerHTML='<header class="topbar"><div class="logo"><img class="logo-top" src="/logo-blanco.png" alt="PIXXIESX"><span>Desarrollo creativo</span></div>'+
    '<div class="top-r">'+(isAdmin()?"":'<span class="role">Contenido</span>')+'<button class="avatar" data-tab="ajustes" title="'+esc(me.nombre||me.email)+'">'+esc(initials(me.nombre||me.email))+'</button><button class="lock-btn" data-logout>Salir</button></div></header>'+
    '<div class="layout"><nav class="side" role="tablist" aria-label="Secciones">'+tabs.map(function(t){return '<button class="tab" role="tab" data-tab="'+t[0]+'" aria-selected="'+(ui.tab===t[0])+'"><svg viewBox="0 0 20 20" aria-hidden="true">'+ICONS[t[0]]+'</svg>'+t[1]+(t[2]!=null?'<span class="count">'+t[2]+'</span>':"")+'</button>'}).join("")+'</nav>'+
    '<div class="wrap"><header class="top"><div class="brand"><h1>'+tt[0]+'</h1><small>'+tt[1]+'</small></div>'+
    (canCreate?(ui.tab==="referentes"?'<button class="btn primary" data-bank-new>Agregar referente</button>':'<button class="btn primary" data-new>Crear creativo</button>'):"")+'</header>'+
    '<main id="view">'+view()+'</main></div></div>';
}
function view(){
  switch(ui.tab){case "tareas":return viewTareas();case "ganadores":return viewGanadores();case "referentes":return viewBanco();case "funnel":return viewFunnel();case "ajustes":return viewAjustes();default:return viewCreativos()}
}
function focusFirst(){setTimeout(function(){var i=$("#root input");if(i)i.focus()},30)}

/* ================= Vistas ================= */
function myTasks(){return state.creativos.filter(function(c){return DONE.indexOf(c.estado)<0&&me&&c.responsable===me.id})}
function filtered(skipEstado){
  var qq=ui.q.trim().toLowerCase();
  return state.creativos.filter(function(c){
    if(ui.fCat&&c.categoria!==ui.fCat)return false;
    if(ui.fEtapa&&c.etapa!==ui.fEtapa)return false;
    if(ui.fResp&&(ui.fResp==="-"?c.responsable:c.responsable!==ui.fResp))return false;
    if(!skipEstado&&ui.fEstado&&c.estado!==ui.fEstado)return false;
    if(qq&&[c.nombre,c.angulo,c.producto,c.hook,c.formato,nombreDe(c.responsable),c.brief&&c.brief.creador,(c.productos||[]).map(function(x){return x.titulo+" "+x.variante}).join(" ")].join(" ").toLowerCase().indexOf(qq)<0)return false;
    return true;
  }).sort(function(a,b){return ESTADOS.indexOf(a.estado)-ESTADOS.indexOf(b.estado)||String(a.fecha||"9").localeCompare(String(b.fecha||"9"))});
}
function viewCreativos(){
  var resp=[["","Todos los responsables"],["-","Sin asignar"]].concat(state.perfiles.map(function(p){return [p.id,p.nombre||p.email]}));
  return '<div class="stack"><div class="pipe" id="pipe">'+pipeHTML()+'</div>'+
  '<div class="filters"><label class="vh" for="q">Buscar</label><input id="q" type="text" placeholder="Buscar por nombre, ángulo, hook, creador…" value="'+esc(ui.q)+'" data-filter="q">'+
  '<label class="vh" for="fc">Categoría</label><select id="fc" data-filter="fCat">'+opts(CATS,ui.fCat,"Todas las categorías")+'</select>'+
  '<label class="vh" for="fe">Etapa</label><select id="fe" data-filter="fEtapa">'+opts(ETAPAS.map(function(e){return e.id}),ui.fEtapa,"Todas las etapas")+'</select>'+
  '<label class="vh" for="fr">Responsable</label><select id="fr" data-filter="fResp">'+resp.map(function(r){return '<option value="'+esc(r[0])+'"'+(ui.fResp===r[0]?" selected":"")+'>'+esc(r[1])+'</option>'}).join("")+'</select></div>'+
  '<div id="grid">'+gridHTML()+'</div></div>';
}
function pipeHTML(){var base=filtered(true);return ESTADOS.map(function(s){var n=base.filter(function(c){return c.estado===s}).length;return '<button data-pipe="'+esc(s)+'" aria-pressed="'+(ui.fEstado===s)+'"><span class="k">'+esc(s)+'</span><span class="v">'+n+'</span></button>'}).join("")}
function gridHTML(){
  var list=filtered();
  if(!list.length){var any=ui.q||ui.fCat||ui.fEtapa||ui.fEstado||ui.fResp;
    return '<div class="empty"><p>'+(any?"Ningún creativo coincide con estos filtros.":"Todavía no hay creativos.")+'</p>'+(any?'<button class="btn" data-clear>Quitar filtros</button>':'<button class="btn primary" data-new>Crear creativo</button>')+'</div>'}
  return '<div class="grid">'+list.map(cardHTML).join("")+'</div>';
}
function cardHTML(c){
  var withMedia=(c.refs||[]).filter(function(r){return r.media})[0];
  var stage=ETAPAS.filter(function(e){return e.id===c.etapa})[0],tr=isAdmin()?classify(c):{id:""};
  var resp=nombreDe(c.responsable);
  return '<button class="card st-'+esc(c.etapa)+(tr.id==="ganador"?" is-win":"")+'" data-open="'+esc(c.id)+'">'+
    '<div class="row"><span class="chip">'+esc(c.etapa)+(stage?" · "+esc(stage.t):"")+'</span><span class="pill'+(c.estado==="En pauta"?" on":"")+'">'+esc(c.estado)+'</span>'+tierHTML(tr)+(c.ejemplo?'<span class="tag-ej">Ejemplo</span>':"")+(c.briefActivo?'<span class="pill">Brief</span>':"")+'</div>'+
    '<h3>'+esc(c.nombre||"Sin nombre")+'</h3>'+
    '<div class="meta">'+esc(c.categoria)+' · '+esc(c.formato)+(c.angulo?'<br>'+esc(c.angulo):"")+'</div>'+
    productThumbs(c)+(withMedia?mediaHTML(withMedia,"thumb",false):"")+
    '<div class="foot"><span>'+(resp?esc(resp):"Sin asignar")+'</span><span>'+(c.fecha?"Sale "+esc(fdate(c.fecha)):"Sin fecha")+'</span></div></button>';
}
function viewTareas(){
  var list=myTasks();
  if(!list.length)return '<div class="empty"><p>No tienes creativos pendientes. Cuando te asignen uno, aparece aquí.</p></div>';
  var today=new Date();today.setHours(0,0,0,0);var wk=new Date(today);wk.setDate(wk.getDate()+7);
  var g={late:[],week:[],next:[],none:[]};
  list.forEach(function(c){if(!c.fecha){g.none.push(c);return}var d=new Date(c.fecha+"T00:00:00");if(d<today)g.late.push(c);else if(d<=wk)g.week.push(c);else g.next.push(c)});
  Object.keys(g).forEach(function(k){g[k].sort(function(a,b){return String(a.fecha).localeCompare(String(b.fecha))})});
  function row(c,late){return '<button class="trow" data-open="'+esc(c.id)+'"><div><b>'+esc(c.nombre||"Sin nombre")+'</b><div class="row"><span class="pill">'+esc(c.estado)+'</span><span class="meta">'+esc(c.categoria+" · "+c.formato)+(c.brief&&c.brief.creador?" · "+esc(c.brief.creador):"")+'</span></div></div><span class="when'+(late?" late":"")+'">'+(c.fecha?(late?"Atrasado · ":"Sale ")+esc(fdate(c.fecha)):"Sin fecha")+'</span></button>'}
  function grp(t,arr,cls){return arr.length?'<section class="tgroup'+(cls?" "+cls:"")+'"><h2>'+t+'<span>'+arr.length+'</span></h2>'+arr.map(function(c){return row(c,cls==="late")}).join("")+'</section>':""}
  return '<div class="tasks">'+grp("Atrasados",g.late,"late")+grp("Esta semana",g.week)+grp("Próximos",g.next)+grp("Sin fecha",g.none)+
    '<section class="panel-card"><h2>Cómo trabajar cada creativo</h2><ol class="steps"><li><b>1</b><span>Abre el creativo y lee el concepto, el ángulo y el insight.</span></li><li><b>2</b><span>Revisa los referentes y agrega los tuyos con capturas o links.</span></li><li><b>3</b><span>Arma el guion por escenas y la lista de producción.</span></li><li><b>4</b><span>Completa el brief, activa el link y envíaselo al creador.</span></li><li><b>5</b><span>Cambia el estado a medida que avanzas, hasta Edición.</span></li></ol></section></div>';
}
function viewBanco(){
  if(!state.banco.length)return '<div class="empty"><p>Guarda aquí anuncios, videos e ideas que te gusten, aunque todavía no sepas para qué creativo son.</p><button class="btn primary" data-bank-new>Agregar referente</button></div>';
  return '<div class="bank">'+state.banco.slice().reverse().map(function(b){
    return '<article class="bcard st-'+esc(b.etapa||"")+'"><div class="bm">'+(b.media?mediaHTML(b,"",true):(b.url?esc(domain(b.url)||"Link"):"Sin imagen"))+'</div><div class="bb">'+
    '<div class="row">'+(b.etapa?'<span class="chip">'+esc(b.etapa)+'</span>':"")+'<span class="pill">'+esc(b.plataforma)+'</span>'+(b.ejemplo?'<span class="tag-ej">Ejemplo</span>':"")+'</div>'+
    '<div class="meta">'+esc([b.categoria,b.formato].filter(Boolean).join(" · "))+'</div>'+(b.nota?'<p>'+esc(b.nota)+'</p>':"")+
    (b.url?'<a class="link" href="'+esc(b.url)+'" target="_blank" rel="noopener">Abrir '+esc(domain(b.url)||"link")+' ↗</a>':"")+
    '<div class="acts"><button class="btn small primary" data-bank-use="'+esc(b.id)+'">Crear creativo</button><button class="btn small" data-bank-edit="'+esc(b.id)+'">Editar</button></div></div></article>';
  }).join("")+'</div>';
}
function viewFunnel(){
  var L=state.creativos,tot=L.length;
  var rows=CATS.map(function(cat){var cs=L.filter(function(c){return c.categoria===cat}),t=cs.length;
    return '<tr><td><b>'+esc(cat)+'</b></td>'+ETAPAS.map(function(e){var n=cs.filter(function(c){return c.etapa===e.id}).length,p=t?Math.round(n*100/t):0;
      return '<td class="st-'+e.id+'"><div class="cell"><span class="n">'+n+'</span><span class="pct">'+(t?p+"%":"–")+'</span></div><div class="bar"><i style="width:'+p+'%"></i></div></td>'}).join("")+'<td><span class="n">'+t+'</span></td></tr>'}).join("");
  var totRow='<tr class="total"><td>Total</td>'+ETAPAS.map(function(e){var n=L.filter(function(c){return c.etapa===e.id}).length;return '<td class="st-'+e.id+'">'+n+' <span class="pct">'+(tot?Math.round(n*100/tot)+"%":"")+'</span></td>'}).join("")+'<td>'+tot+'</td></tr>';
  var fmtRows=FORMATOS.map(function(f){var cs=L.filter(function(c){return c.formato===f});if(!cs.length)return "";
    return '<tr><td>'+esc(f)+'</td>'+ETAPAS.map(function(e){var tE=L.filter(function(c){return c.etapa===e.id}).length,n=cs.filter(function(c){return c.etapa===e.id}).length;return '<td class="st-'+e.id+'"><div class="cell"><span class="n">'+n+'</span><span class="pct">'+(tE?Math.round(n*100/tE)+"% de "+e.id:"–")+'</span></div></td>'}).join("")+'<td>'+cs.length+'</td></tr>'}).join("");
  return '<div class="fun"><section class="panel-card"><h2>Etapas del funnel</h2><div class="legend">'+ETAPAS.map(function(e){return '<div class="st-'+e.id+'"><b>'+e.id+' · '+e.t+'</b>'+esc(e.d)+'</div>'}).join("")+'</div></section>'+
  '<section class="panel-card"><h2>Creativos por categoría y etapa</h2><p>El porcentaje es sobre el total de cada categoría.</p><div class="tbl-wrap"><table><thead><tr><th>Categoría</th>'+ETAPAS.map(function(e){return '<th>'+e.id+'</th>'}).join("")+'<th>Total</th></tr></thead><tbody>'+rows+totRow+'</tbody></table></div></section>'+
  '<section class="panel-card"><h2>Formatos dentro de cada etapa</h2><p>Qué parte de cada etapa se está produciendo en cada formato.</p><div class="tbl-wrap"><table><thead><tr><th>Formato</th>'+ETAPAS.map(function(e){return '<th>'+e.id+'</th>'}).join("")+'<th>Total</th></tr></thead><tbody>'+(fmtRows||'<tr><td colspan="5">Sin creativos todavía.</td></tr>')+'</tbody></table></div></section></div>';
}
function viewGanadores(){
  var meta=metaCpa(),L=state.creativos.map(function(c){return {c:c,t:classify(c)}});
  var withData=L.filter(function(x){return x.t.id}),order=TIERS.map(function(t){return t.id});
  withData.sort(function(a,b){var d=order.indexOf(a.t.id)-order.indexOf(b.t.id);if(d)return d;var ra=win(a.c,"mes").roas,rb=win(b.c,"mes").roas;return (rb==null?-1:rb)-(ra==null?-1:ra)});
  var wins=L.filter(function(x){return x.t.id==="ganador"}).map(function(x){return x.c});
  var tiles='<div class="tiers">'+TIERS.map(function(t){var n=L.filter(function(x){return x.t.id===t.id}).length;return '<div class="t-'+t.id+'"><span class="k">'+t.t+'</span><span class="v">'+n+'</span></div>'}).join("")+'</div>';
  function wcell(w){return w.inv?cpaCell(w)+'<span class="idtxt">ROAS '+roasCell(w)+'</span>':"–"}
  var table=withData.length?'<div class="tbl-wrap"><table class="wtbl"><thead><tr><th>Creativo</th><th>Clasificación</th><th>Mes</th><th>Sem. pasada</th><th>Sem. actual</th><th>Compras mes</th><th>Ticket mes</th></tr></thead><tbody>'+
    withData.map(function(x){var c=x.c,m=win(c,"mes");
      return '<tr><td class="name"><button class="lnk" data-open="'+esc(c.id)+'">'+esc(c.nombre||"Sin nombre")+'</button>'+(c.anuncio||c.anuncioId?'<span class="idtxt">'+esc([c.anuncio,c.anuncioId].filter(Boolean).join(" · "))+'</span>':'<span class="idtxt">'+esc(c.categoria+" · "+c.etapa+" · "+c.formato)+'</span>')+'</td>'+
      '<td>'+tierHTML(x.t)+'</td><td>'+wcell(m)+'</td><td>'+wcell(win(c,"sem"))+'</td><td>'+wcell(win(c,"act"))+'</td><td>'+(m.inv?m.comp:"–")+'</td><td>'+(m.ticket?cop(m.ticket):"–")+'</td></tr>'}).join("")+
    '</tbody></table></div>':'<div class="empty"><p>Ningún creativo tiene datos de pauta todavía. Abre un creativo y llena "Pauta y resultados".</p></div>';
  function mini(title,vals){var counts={};vals.forEach(function(v){if(v)counts[v]=(counts[v]||0)+1});var keys=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]});
    if(!keys.length)return '<div><h3>'+title+'</h3><p class="meta">Sin datos.</p></div>';var max=counts[keys[0]];
    return '<div><h3>'+title+'</h3><ul class="mini">'+keys.map(function(k){return '<li><span>'+esc(k)+'</span><div class="bar"><i style="width:'+Math.round(counts[k]*100/max)+'%"></i></div><span class="c">'+counts[k]+'</span></li>'}).join("")+'</ul></div>'}
  var pat=wins.length?'<div class="patterns">'+mini("Formato",wins.map(function(c){return c.formato}))+mini("Etapa",wins.map(function(c){return c.etapa}))+mini("Categoría",wins.map(function(c){return c.categoria}))+mini("Qué los hizo funcionar",[].concat.apply([],wins.map(function(c){return c.elementos||[]})))+mini("Gafas",[].concat.apply([],wins.map(function(c){return (c.productos||[]).map(function(x){return x.titulo})})))+'</div>':'<p class="meta">Cuando tengas anuncios ganadores, aquí verás qué se repite entre ellos.</p>';
  var learn=wins.filter(function(c){return String(c.aprendizaje||"").trim()});
  var cfg='<section class="panel-card"><h2>Cómo se clasifica</h2><div class="cfg">'+
    '<div class="fld"><label for="cfg-meta">Meta de CPA (COP)</label><input id="cfg-meta" inputmode="numeric" value="'+esc(state.config.metaCpa)+'"></div>'+
    '<div class="fld"><label for="cfg-roas">Meta de ROAS</label><input id="cfg-roas" inputmode="decimal" value="'+esc(String(state.config.metaRoas).replace(".",","))+'"></div>'+
    '<div class="fld"><label for="cfg-min">Mínimo de compras</label><input id="cfg-min" inputmode="numeric" value="'+esc(state.config.minCompras)+'"></div>'+
    '<button class="btn" data-save-cfg>Guardar metas</button></div>'+
    '<ul class="rules"><li><b>Ganador:</b> con al menos '+minComp()+' compras, cumple <b>cualquiera</b> de las dos metas: CPA de '+cop(meta)+' o menos, o ROAS de '+roasTxt(metaRoas())+' o más.</li>'+
    '<li><b>Fatigándose:</b> gana en el mes, pero en la semana más reciente falla en las dos: CPA más de 20 % sobre la meta y ROAS más de 20 % bajo la meta.</li>'+
    '<li><b>Prometedor:</b> CPA hasta 30 % sobre la meta, o ROAS de al menos el 75 % de la meta.</li><li><b>En prueba:</b> todavía no llega al mínimo de compras.</li>'+
    '<li><b>Perdedor:</b> lejos de las dos metas, o gastó el doble de la meta de CPA sin llegar al mínimo de compras.</li></ul></section>';
  return '<div class="fun">'+tiles+'<section class="panel-card"><h2>Ranking de anuncios</h2><p>De ganadores a perdedores; dentro de cada grupo, de mayor a menor ROAS del mes. Cada ventana muestra el CPA arriba y el ROAS abajo.</p>'+table+'</section>'+
    '<section class="panel-card"><h2>Qué tienen en común los ganadores</h2>'+pat+'</section>'+
    (learn.length?'<section class="panel-card"><h2>Aprendizajes de los ganadores</h2><ul class="learn">'+learn.map(function(c){return '<li><b>'+esc(c.nombre)+'</b><p>'+esc(c.aprendizaje)+'</p></li>'}).join("")+'</ul></section>':"")+cfg+'</div>';
}
function viewAjustes(){
  var cuenta='<section class="panel-card"><h2>Mi cuenta</h2><p>'+esc(me.email||"")+(isAdmin()?" · Admin":" · Contenido")+'</p>'+
    '<form class="set-form" id="me-form"><div class="fld"><label for="me-name">Tu nombre</label><input id="me-name" value="'+esc(me.nombre||"")+'"></div><div class="r"><button class="btn" type="submit">Guardar nombre</button></div></form>'+
    '<form class="set-form" id="pass-form" autocomplete="off"><div class="fld"><label for="ps-new">Contraseña nueva (mínimo 8 caracteres)</label><input id="ps-new" type="password" autocomplete="new-password"></div>'+
    '<div class="fld"><label for="ps-new2">Repite la contraseña</label><input id="ps-new2" type="password" autocomplete="new-password"></div><p class="lock-err" id="pass-err" role="alert"></p>'+
    '<div class="r"><button class="btn" type="submit">Cambiar contraseña</button></div></form></section>';
  if(!isAdmin())return '<div class="fun">'+cuenta+'</div>';
  var team='<section class="panel-card"><h2>Equipo</h2><p>Cada persona entra con su propio correo y contraseña. <b>Admin</b> ve todo. <b>Contenido</b> ve sus tareas y la parte creativa, sin pauta, números ni ganadores, y no puede eliminar.</p>'+
    '<div class="tbl-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Tareas abiertas</th></tr></thead><tbody>'+state.perfiles.map(function(p){
      var n=state.creativos.filter(function(c){return c.responsable===p.id&&DONE.indexOf(c.estado)<0}).length;
      return '<tr><td><input aria-label="Nombre de '+esc(p.email)+'" data-perfil="'+esc(p.id)+'" data-k="nombre" value="'+esc(p.nombre)+'"></td><td>'+esc(p.email)+'</td><td><select aria-label="Rol de '+esc(p.email)+'" data-perfil="'+esc(p.id)+'" data-k="rol"><option value="admin"'+(p.rol==="admin"?" selected":"")+'>Admin</option><option value="contenido"'+(p.rol!=="admin"?" selected":"")+'>Contenido</option></select></td><td>'+n+'</td></tr>'}).join("")+'</tbody></table></div>'+
    '<div class="howto"><b>Para agregar a alguien:</b> en Supabase ve a <b>Authentication → Users → Add user → Send invitation</b> y escribe su correo. Le llega un correo para crear su contraseña y entra como Contenido.</div></section>';
  var bb=state.config.briefBase||BRIEF_BASE_DEFAULT;
  var base='<section class="panel-card"><h2>Plantilla base del brief</h2><p>Con esto arranca el brief de cada creativo nuevo. Después lo ajustas en cada uno.</p><form id="base-form" class="fields">'+
    BRIEF_FIELDS.filter(function(f){return ["creador","entrega","objetivo"].indexOf(f[0])<0}).map(function(f){return fieldB("bb-"+f[0],f[1],bb[f[0]],f[2],"data-base",f[0])}).join("")+
    '<div class="r fld full"><button class="btn" type="submit">Guardar plantilla</button></div></form></section>';
  var last="";try{last=localStorage.getItem("pixxiesx-ultimo-respaldo")||""}catch(e){}
  var dias=last?Math.floor((Date.now()-new Date(last).getTime())/86400000):null;
  var resp='<section class="panel-card"><h2>Respaldo</h2><p>Descarga una copia de todo: creativos, pauta, referentes, equipo y ajustes. Guárdala en tu Drive. Hazlo al menos una vez por semana, porque el plan gratis de Supabase no guarda copias automáticas.</p>'+
    '<span class="status" style="--st:'+(dias==null||dias>7?"#E51C00":"#29845A")+'">'+(last?"Último respaldo en este dispositivo: "+esc(new Date(last).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"}))+(dias>7?" · hace "+dias+" días":""):"Todavía no has descargado un respaldo en este dispositivo")+'</span>'+
    '<div class="r" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-backup="json">Descargar respaldo completo</button><button class="btn" data-backup="csv">Descargar creativos en Excel</button></div>'+
    '<p class="hint">El respaldo completo (.json) sirve para restaurar todo si algo se borra. El archivo de Excel (.csv) es para revisar o filtrar los creativos con sus números.</p></section>';
  return '<div class="fun">'+resp+team+base+cuenta+'</div>';
}
function fieldB(id,label,v,o,attr,key){o=o||{};var ctrl=o.area?'<textarea id="'+id+'" '+attr+'="'+key+'" rows="'+(o.rows||3)+'" placeholder="'+esc(o.ph||"")+'">'+esc(v||"")+'</textarea>':'<input id="'+id+'" '+attr+'="'+key+'" type="'+(o.type||"text")+'" value="'+esc(v||"")+'" placeholder="'+esc(o.ph||"")+'">';
  return '<div class="fld'+(o.full?" full":"")+'"><label for="'+id+'">'+label+'</label>'+ctrl+'</div>'}

/* ================= Ficha ================= */
function field(k,label,d,o){o=o||{};var id="f-"+k,v=d[k]==null?"":d[k],ctrl;
  if(o.area)ctrl='<textarea id="'+id+'" data-f="'+k+'" rows="'+(o.rows||3)+'" placeholder="'+esc(o.ph||"")+'">'+esc(v)+'</textarea>';
  else ctrl='<input id="'+id+'" data-f="'+k+'" type="'+(o.type||"text")+'"'+(o.im?' inputmode="'+o.im+'"':"")+(o.mono?' class="mono"':"")+' value="'+esc(v)+'" placeholder="'+esc(o.ph||"")+'">';
  return '<div class="fld'+(o.full?" full":"")+'"><label for="'+id+'">'+label+'</label>'+ctrl+'</div>'}
function selectF(k,label,list,d){return '<div class="fld"><label for="f-'+k+'">'+label+'</label><select id="f-'+k+'" data-f="'+k+'">'+opts(list,d[k])+'</select></div>'}
function stagePick(d){return '<div class="fld full"><span class="lbl" id="lbl-etapa">Etapa del funnel</span><div class="stage-pick" role="radiogroup" aria-labelledby="lbl-etapa">'+ETAPAS.map(function(e){
  return '<label class="st-'+e.id+'"><input type="radio" name="etapa-pick" value="'+e.id+'" data-f="etapa"'+(d.etapa===e.id?" checked":"")+'><b>'+e.id+' · '+e.t+'</b><span>'+esc(e.d)+'</span></label>'}).join("")+'</div></div>'}
function respSelect(d){return '<div class="fld"><label for="f-responsable">Responsable</label><select id="f-responsable" data-f="responsable"><option value="">Sin asignar</option>'+state.perfiles.map(function(p){return '<option value="'+esc(p.id)+'"'+(p.id===d.responsable?" selected":"")+'>'+esc(p.nombre||p.email)+'</option>'}).join("")+'</select></div>'}
function tierBox(d){var t=classify(d);return '<div class="row">'+(t.id?tierHTML(t):'<span class="pill">Sin datos</span>')+'</div><p class="why">'+esc(t.why)+'</p>'}
function briefUrl(d){return d.briefToken?location.origin+"/brief/"+d.briefToken:""}
function upHTML(target,has){return '<label class="btn small file">'+(has?"Cambiar archivo":"Subir imagen o video")+'<input class="vh" type="file" accept="image/*,video/*" data-upload="'+target+'"></label>'}
function sheetCreativo(d){
  var isNew=!!d._nuevo;
  var refs=(d.refs||[]).map(function(r,i){
    return '<div class="ref-edit"><div class="ref-media">'+(r.media?mediaHTML(r,"ref-img",true):'<div class="ref-ph">'+(r.url?esc(domain(r.url)):"Sin imagen")+'</div>')+upHTML(i,!!r.media)+'</div>'+
    '<div class="ref-f"><div class="fld"><label for="rf-'+i+'-p">Fuente</label><select id="rf-'+i+'-p" data-ref="'+i+'" data-k="plataforma">'+opts(FUENTES,r.plataforma)+'</select></div>'+
    '<div class="fld"><label for="rf-'+i+'-u">Link</label><input id="rf-'+i+'-u" type="url" data-ref="'+i+'" data-k="url" value="'+esc(r.url)+'" placeholder="https://"></div>'+
    '<div class="fld full"><label for="rf-'+i+'-n">Qué tomamos de este referente</label><textarea id="rf-'+i+'-n" rows="2" data-ref="'+i+'" data-k="nota" placeholder="Hook, ritmo, encuadre, color, texto en pantalla…">'+esc(r.nota)+'</textarea></div>'+
    (r.url?'<a class="link" href="'+esc(r.url)+'" target="_blank" rel="noopener">Abrir referente ↗</a>':"")+'</div>'+
    '<button class="icon-btn" type="button" data-rm-ref="'+i+'" aria-label="Quitar referente '+(i+1)+'">×</button></div>'}).join("");
  var esc_=(d.escenas||[]).map(function(s,i){
    return '<div class="scene"><div class="scene-n">'+(i+1)+'</div><div class="scene-f">'+
    '<div class="fld"><label for="es-'+i+'-d">Tiempo</label><input id="es-'+i+'-d" data-esc="'+i+'" data-k="dur" value="'+esc(s.dur)+'" placeholder="0–3 s"></div>'+
    '<div class="fld"><label for="es-'+i+'-v">Visual / toma</label><textarea id="es-'+i+'-v" rows="2" data-esc="'+i+'" data-k="visual">'+esc(s.visual)+'</textarea></div>'+
    '<div class="fld"><label for="es-'+i+'-t">Texto en pantalla / voz</label><textarea id="es-'+i+'-t" rows="2" data-esc="'+i+'" data-k="texto">'+esc(s.texto)+'</textarea></div></div>'+
    '<button class="icon-btn" type="button" data-rm-esc="'+i+'" aria-label="Quitar escena '+(i+1)+'">×</button></div>'}).join("");
  var bankSel=state.banco.length?'<div class="fld"><label for="from-bank">Traer del banco de referentes</label><select id="from-bank" data-from-bank><option value="">Elegir…</option>'+state.banco.map(function(b){return '<option value="'+esc(b.id)+'">'+esc((b.plataforma+" · "+(b.nota||domain(b.url)||"Referente")).slice(0,70))+'</option>'}).join("")+'</select></div>':"";
  var br=d.brief||{};
  var link=briefUrl(d);
  var briefBlock='<section class="block"><h3><span class="num">6</span>Brief para el creador</h3><p class="hint">Lo que ve el creador en su link: la idea, el hook, el guion, los referentes y todo lo de abajo. Nunca ve pauta ni números.</p>'+
    '<div class="fields">'+BRIEF_FIELDS.map(function(f){return fieldB("br-"+f[0],f[1],br[f[0]],f[2],"data-brief",f[0])}).join("")+'</div>'+
    '<div class="row"><button class="btn small" type="button" data-brief-base>Rellenar vacíos con la plantilla base</button></div>'+
    '<div class="brief-link"><label class="switch"><input type="checkbox" id="f-briefActivo" data-brief-on'+(d.briefActivo?" checked":"")+'><span>Link del brief activo</span></label>'+
    (isNew||!link?'<p class="hint">Guarda el creativo para obtener el link.</p>':
      '<div class="linkrow"><input id="brief-url" readonly value="'+esc(link)+'" aria-label="Link del brief"><button class="btn small" type="button" data-copy-brief>Copiar</button><a class="btn small" href="'+esc(link)+'" target="_blank" rel="noopener">Ver</a></div>'+
      '<p class="hint">'+(d.briefActivo?"Cualquiera con este link puede ver el brief, sin usuario.":"Actívalo y guarda para que el link funcione.")+'</p>')+'</div></section>';
  var pauta=isAdmin()?'<section class="block"><h3><span class="num">7</span>Pauta y resultados</h3><p class="hint">El valor de compras es el "Valor de conversión de compras" de Meta. Metas: CPA '+cop(metaCpa())+' o ROAS '+roasTxt(metaRoas())+'. Solo los admin ven esta sección.</p><div class="fields">'+
    field("campana","Campaña",d,{})+field("campanaId","ID de campaña",d,{mono:true,im:"numeric"})+field("conjunto","Conjunto de anuncios",d,{})+field("conjuntoId","ID del conjunto",d,{mono:true,im:"numeric"})+field("anuncio","Anuncio",d,{})+field("anuncioId","ID del anuncio",d,{mono:true,im:"numeric"})+
    '</div><div class="tbl-wrap"><table class="vt"><thead><tr><th>Ventana</th><th>Inversión (COP)</th><th>Compras</th><th>Valor compras (COP)</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>'+
    VENTANAS.map(function(v){var w=d.ventanas[v.k]||{};return '<tr><th scope="row">'+v.t+'</th><td><input aria-label="Inversión '+v.t+'" inputmode="numeric" data-win="'+v.k+'" data-k="inv" value="'+esc(w.inv)+'" placeholder="0"></td>'+
      '<td><input aria-label="Compras '+v.t+'" inputmode="numeric" data-win="'+v.k+'" data-k="comp" value="'+esc(w.comp)+'" placeholder="0"></td><td><input aria-label="Valor de compras '+v.t+'" inputmode="numeric" data-win="'+v.k+'" data-k="ven" value="'+esc(w.ven)+'" placeholder="0"></td>'+
      '<td id="cpa-'+v.k+'">'+cpaCell(win(d,v.k))+'</td><td id="roas-'+v.k+'">'+roasCell(win(d,v.k))+'</td></tr>'}).join("")+
    '</tbody></table></div><div class="fields">'+field("ctr","CTR del mes (%)",d,{im:"decimal"})+'</div></section>'+
    '<section class="block"><h3><span class="num">8</span>Clasificación</h3><div class="win-box" id="tierbox">'+tierBox(d)+'</div><div class="fields">'+
    '<div class="fld"><label for="f-clasif">Clasificación</label><select id="f-clasif" data-f="clasif"><option value="">Automática según los números</option>'+TIERS.map(function(t){return '<option value="'+t.id+'"'+(d.clasif===t.id?" selected":"")+'>'+t.t+' (a mano)</option>'}).join("")+'</select></div>'+
    '<div class="fld full"><span class="lbl" id="lbl-el">Qué lo hizo funcionar (o fallar)</span><div class="tags" role="group" aria-labelledby="lbl-el">'+ELEMENTOS.map(function(e){return '<label><input type="checkbox" data-el="'+esc(e)+'"'+(d.elementos.indexOf(e)>=0?" checked":"")+'>'+esc(e)+'</label>'}).join("")+'</div></div>'+
    field("aprendizaje","Qué aprendimos",d,{full:true,area:true,rows:3,ph:"¿Qué funcionó, qué no y qué probamos en la siguiente variación?"})+'</div></section>':"";
  return '<div class="sheet-bg" data-close></div><section class="panel st-'+esc(d.etapa)+'" role="dialog" aria-modal="true" aria-labelledby="sheet-title">'+
  '<header class="panel-head"><div><p class="eyebrow">'+(isNew?"Nuevo creativo":"Creativo")+'</p><h2 id="sheet-title">'+esc(d.nombre||"Sin nombre")+'</h2></div><div class="head-actions"><button class="btn ghost" data-close>Cerrar</button><button class="btn primary" data-save>Guardar</button></div></header>'+
  '<div class="panel-body" id="pbody"><fieldset>'+
  '<section class="block"><h3><span class="num">1</span>Concepto</h3><div class="fields">'+
    field("nombre","Nombre del creativo",d,{full:true,ph:"Ej: Red Light · Scroll nocturno"})+selectF("categoria","Categoría",CATS,d)+selectF("formato","Formato",FORMATOS,d)+stagePick(d)+
    selectF("estado","Estado",ESTADOS,d)+field("fecha","Fecha de salida",d,{type:"date"})+field("producto","Producto o colección",d,{ph:"Ej: Colección Red Light"})+respSelect(d)+
    field("angulo","Ángulo",d,{full:true,ph:"La idea en una línea"})+field("insight","Insight o dolor del cliente",d,{full:true,area:true,rows:2,ph:"¿Qué siente o piensa la persona que hace que este anuncio le hable?"})+'</div></section>'+gafasBlock(d)+
  '<section class="block"><h3><span class="num">3</span>Referentes</h3><p class="hint">Sube capturas o videos, o pega el link del anuncio.</p><div class="stack">'+refs+'</div><div class="row"><button class="btn small" type="button" data-add-ref>Agregar referente</button></div>'+bankSel+'</section>'+
  '<section class="block"><h3><span class="num">4</span>Cómo lo haríamos</h3><div class="fields">'+field("hook","Hook (primeros 3 segundos)",d,{full:true,area:true,rows:2,ph:"Lo primero que se ve y se lee"})+field("mensaje","Mensaje principal",d,{full:true,area:true,rows:2})+field("cta","Llamado a la acción",d,{full:true,ph:"Ej: Compra en pixxiesx.co · Escríbenos por WhatsApp"})+
    '</div><span class="lbl">Guion por escenas</span><div class="stack">'+esc_+'</div><div class="row"><button class="btn small" type="button" data-add-esc>Agregar escena</button></div><div class="fields">'+field("recursos","Producción: talento, locación, props y tomas",d,{full:true,area:true,rows:3})+'</div></section>'+
  '<section class="block"><h3><span class="num">5</span>Copy del anuncio</h3><div class="fields">'+field("copyPrincipal","Texto principal",d,{full:true,area:true,rows:4})+field("copyTitulo","Título",d,{})+field("copyDesc","Descripción",d,{})+'</div></section>'+
  briefBlock+pauta+'</fieldset></div>'+
  '<footer class="panel-foot">'+(isNew?"":(isAdmin()?'<button class="btn danger" data-del>Eliminar</button>':"")+'<button class="btn" data-dup>Duplicar como variación</button>')+'<div class="r"><button class="btn primary" data-save>Guardar</button></div></footer></section>';
}
function sheetRef(d){
  var isNew=!!d._nuevo;
  return '<div class="sheet-bg" data-close></div><section class="panel st-'+esc(d.etapa||"")+'" role="dialog" aria-modal="true" aria-labelledby="sheet-title">'+
  '<header class="panel-head"><div><p class="eyebrow">Banco de referentes</p><h2 id="sheet-title">'+(isNew?"Nuevo referente":"Editar referente")+'</h2></div><div class="head-actions"><button class="btn ghost" data-close>Cerrar</button><button class="btn primary" data-save>Guardar</button></div></header>'+
  '<div class="panel-body" id="pbody"><fieldset><section class="block"><div class="ref-edit" style="grid-template-columns:140px 1fr"><div class="ref-media">'+(d.media?mediaHTML(d,"ref-img",true):'<div class="ref-ph">Sin imagen</div>')+upHTML("bank",!!d.media)+'</div>'+
  '<div class="fields">'+selectF("plataforma","Fuente",FUENTES,d)+field("url","Link",d,{type:"url",ph:"https://"})+
  '<div class="fld"><label for="f-categoria">Categoría</label><select id="f-categoria" data-f="categoria">'+opts(CATS,d.categoria,"Sin categoría")+'</select></div>'+
  '<div class="fld"><label for="f-formato">Formato</label><select id="f-formato" data-f="formato">'+opts(FORMATOS,d.formato,"Sin formato")+'</select></div>'+stagePick(d)+
  field("nota","Qué nos gusta de este referente",d,{full:true,area:true,rows:3})+'</div></div></section></fieldset></div>'+
  '<footer class="panel-foot">'+(isNew||!isAdmin()?"":'<button class="btn danger" data-del>Eliminar</button>')+'<div class="r"><button class="btn primary" data-save>Guardar</button></div></footer></section>';
}
function renderSheet(){
  var el=$("#sheet");
  if(!draft){el.innerHTML="";document.body.style.overflow="";return}
  var pb=$("#pbody"),st=pb?pb.scrollTop:0;
  el.innerHTML=draft.kind==="ref"?sheetRef(draft.data):sheetCreativo(draft.data);
  document.body.style.overflow="hidden";
  var nb=$("#pbody");if(nb)nb.scrollTop=st;
}
function primeShop(){if(shopReady&&!shopUi.items.length&&!shopUi.loading)runProductSearch(false)}
function openCreativo(id){primeShop();var c=state.creativos.filter(function(x){return x.id===id})[0];if(!c)return;draft={kind:"creativo",data:clone(c)};dirty=false;renderSheet();if(location.hash!=="#c-"+id)history.replaceState(null,"","#c-"+id)}
function openNew(seed){primeShop();var c=Object.assign(blankCreativo(),seed||{});if(!isAdmin())c.responsable=me.id;draft={kind:"creativo",data:c};dirty=!!seed;renderSheet()}
function openRef(id){var b=id?state.banco.filter(function(x){return x.id===id})[0]:null;draft={kind:"ref",data:b?clone(b):{id:uuid(),_nuevo:true,plataforma:"Meta Ad Library",url:"",categoria:"",etapa:"",formato:"",nota:"",media:"",mediaType:""}};dirty=false;renderSheet()}
function clearHash(){if(/^#c-/.test(location.hash))history.replaceState(null,"","#"+ui.tab)}
function closeSheet(force){
  if(dirty&&!force){ask("Tienes cambios sin guardar. ¿Descartarlos?","Descartar").then(function(ok){if(ok)closeSheet(true)});return}
  draft=null;dirty=false;renderSheet();clearHash();
}
function setSaving(on){saving=on;document.querySelectorAll("[data-save]").forEach(function(b){b.disabled=on;b.textContent=on?"Guardando…":"Guardar"})}
function save(){
  if(!draft||saving)return;
  var d=draft.data;
  if(draft.kind==="creativo"){
    if(!String(d.nombre||"").trim()){toast("Ponle un nombre al creativo");var nn=$("#f-nombre");if(nn)nn.focus();return}
    setSaving(true);
    sb.from("creativos").upsert(toDb(d)).select().single().then(function(res){
      var row=q(res);
      var p=isAdmin()?sb.from("pauta").upsert(toDbPauta(d)).select().single().then(q):Promise.resolve(null);
      return p.then(function(prow){
        var c=fromDb(row,prow||toDbPauta(d));
        if(!isAdmin())PAUTA_KEYS.forEach(function(k){c[k]=undefined});
        var i=state.creativos.findIndex(function(x){return x.id===c.id});
        if(i>=0)state.creativos[i]=c;else state.creativos.push(c);
        var wasNew=d._nuevo;draft=null;dirty=false;setSaving(false);renderSheet();clearHash();render();
        toast(wasNew?"Creativo creado":"Guardado");
      });
    }).catch(function(e){setSaving(false);toast("No se pudo guardar: "+errMsg(e))});
  }else{
    if(!d.url&&!d.media&&!String(d.nota||"").trim()){toast("Agrega un link, un archivo o una nota");return}
    setSaving(true);
    sb.from("banco").upsert(bancoToDb(d)).select().single().then(function(res){
      var b=bancoFromDb(q(res));var i=state.banco.findIndex(function(x){return x.id===b.id});
      if(i>=0)state.banco[i]=b;else state.banco.push(b);
      draft=null;dirty=false;setSaving(false);renderSheet();render();toast("Referente guardado");
    }).catch(function(e){setSaving(false);toast("No se pudo guardar: "+errMsg(e))});
  }
}
function del(){
  if(!draft||!isAdmin())return;var d=draft.data,isC=draft.kind==="creativo";
  ask(isC?"¿Eliminar el creativo \""+(d.nombre||"Sin nombre")+"\"? No se puede deshacer.":"¿Eliminar este referente del banco?","Eliminar").then(function(ok){
    if(!ok)return;
    sb.from(isC?"creativos":"banco").delete().eq("id",d.id).then(function(res){
      if(res.error){toast("No se pudo eliminar: "+errMsg(res.error));return}
      if(isC)state.creativos=state.creativos.filter(function(c){return c.id!==d.id});else state.banco=state.banco.filter(function(b){return b.id!==d.id});
      draft=null;dirty=false;renderSheet();clearHash();render();toast("Eliminado");
    });
  });
}
function handleUpload(input){
  var file=input.files&&input.files[0];if(!file||!draft)return;
  if(file.size>50*1024*1024){toast("El archivo pesa más de 50 MB.");return}
  var target=input.dataset.upload;toast("Subiendo archivo…");
  var ext=(file.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"");
  var path=me.id+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
  sb.storage.from("archivos").upload(path,file,{contentType:file.type,upsert:false}).then(function(res){
    if(res.error)throw res.error;
    var url=sb.storage.from("archivos").getPublicUrl(path).data.publicUrl;
    var m={media:url,mediaType:String(file.type||"").indexOf("video")===0?"video":"image"};
    if(!draft)return;
    if(target==="bank")Object.assign(draft.data,m);else if(draft.data.refs[+target])Object.assign(draft.data.refs[+target],m);
    dirty=true;renderSheet();toast("Archivo listo. Recuerda guardar.");
  }).catch(function(e){toast("No se pudo subir: "+errMsg(e))});
}

/* ================= Respaldo ================= */
function descargar(nombre,contenido,tipo){
  var blob=new Blob([contenido],{type:tipo});var url=URL.createObjectURL(blob);
  var a=document.createElement("a");a.href=url;a.download=nombre;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(url);a.remove()},1000);
}
function hoy(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function csvCell(v){v=v==null?"":String(v);return /[";\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function backup(tipo,btn){
  if(!isAdmin())return;
  var txt=btn.textContent;btn.disabled=true;btn.textContent="Preparando…";
  var tablas=["perfiles","creativos","pauta","banco","config"];
  Promise.all(tablas.map(function(t){return sb.from(t).select("*").then(q)})).then(function(r){
    var data={};tablas.forEach(function(t,i){data[t]=r[i]});
    if(tipo==="json"){
      descargar("respaldo-creativos-pixxiesx-"+hoy()+".json",JSON.stringify({app:"pixxiesx-creativos",version:1,fecha:new Date().toISOString(),tablas:data},null,2),"application/json");
      try{localStorage.setItem("pixxiesx-ultimo-respaldo",new Date().toISOString())}catch(e){}
    }else{
      var pm={};data.pauta.forEach(function(p){pm[p.creativo_id]=p});
      var head=["Nombre","Categoría","Etapa","Formato","Estado","Responsable","Fecha de salida","Producto","Gafas","Ángulo","Hook","Creador","Entrega brief","Campaña","Conjunto","Anuncio","ID anuncio","Inversión mes","Compras mes","Valor compras mes","CPA mes","ROAS mes","Inversión sem. pasada","Compras sem. pasada","Valor sem. pasada","Inversión sem. actual","Compras sem. actual","Valor sem. actual","Clasificación","Aprendizaje"];
      var rows=data.creativos.map(function(row){var c=fromDb(row,pm[row.id]),m=win(c,"mes"),v=c.ventanas;
        return [c.nombre,c.categoria,c.etapa,c.formato,c.estado,nombreDe(c.responsable),c.fecha,c.producto,(c.productos||[]).map(function(x){return x.titulo+(x.variante?" ("+x.variante+")":"")}).join(" | "),c.angulo,c.hook,(c.brief||{}).creador,(c.brief||{}).entrega,c.campana,c.conjunto,c.anuncio,c.anuncioId,
          v.mes.inv,v.mes.comp,v.mes.ven,m.cpa!=null?Math.round(m.cpa):"",m.roas!=null?m.roas.toFixed(2).replace(".",","):"",v.sem.inv,v.sem.comp,v.sem.ven,v.act.inv,v.act.comp,v.act.ven,tierName(classify(c).id),c.aprendizaje]});
      descargar("creativos-pixxiesx-"+hoy()+".csv","\ufeff"+[head].concat(rows).map(function(r){return r.map(csvCell).join(";")}).join("\r\n"),"text/csv;charset=utf-8");
    }
    btn.disabled=false;btn.textContent=txt;toast("Respaldo descargado");if(tipo==="json")render();
  }).catch(function(e){btn.disabled=false;btn.textContent=txt;toast("No se pudo descargar: "+errMsg(e))});
}

/* ================= Eventos ================= */
document.addEventListener("click",function(ev){
  var t=ev.target.closest("button,[data-close],a[data-x]");if(!t)return;var ds=t.dataset;
  if(ds.backup){backup(ds.backup,t);return}
  if(ds.shopAdd){addProduct(ds.shopAdd);return}
  if(ds.shopMore!=null){runProductSearch(true);return}
  if(ds.shopRetry!=null){shopCache={};runProductSearch(false);return}
  if(ds.pkRm!=null&&draft){draft.data.productos.splice(+ds.pkRm,1);dirty=true;renderSheet();return}
  if(ds.forgot!=null){authView="forgot";render();return}
  if(ds.backLogin!=null){authView="login";render();return}
  if(ds.logout!=null){ask("¿Cerrar sesión en este dispositivo?","Salir").then(function(ok){if(ok)sb.auth.signOut()});return}
  if(ds.tab){ui.tab=ds.tab;history.replaceState(null,"","#"+ds.tab);render();return}
  if(ds.open!=null){openCreativo(ds.open);return}
  if(ds["new"]!=null){openNew();return}
  if(ds.pipe!=null){ui.fEstado=ui.fEstado===ds.pipe?"":ds.pipe;$("#pipe").innerHTML=pipeHTML();$("#grid").innerHTML=gridHTML();return}
  if(ds.clear!=null){ui.q="";ui.fCat="";ui.fEtapa="";ui.fEstado="";ui.fResp="";render();return}
  if(ds.close!=null){closeSheet();return}
  if(ds.save!=null){save();return}
  if(ds.del!=null){del();return}
  if(ds.dup!=null&&draft){var c=clone(draft.data);c.id=uuid();c._nuevo=true;c.nombre=(c.nombre||"Creativo")+" · variación";c.estado="Idea";c.briefToken="";c.briefActivo=false;c.ejemplo=false;c.productos=clone(c.productos||[]);
    ["campana","campanaId","conjunto","conjuntoId","anuncio","anuncioId","ctr","clasif","aprendizaje"].forEach(function(k){c[k]=""});c.elementos=[];c.ventanas=blankVentanas();
    draft={kind:"creativo",data:c};dirty=true;renderSheet();$("#pbody").scrollTop=0;toast("Variación creada. Guarda para conservarla.");return}
  if(ds.addEsc!=null&&draft){draft.data.escenas.push({dur:"",visual:"",texto:""});dirty=true;renderSheet();return}
  if(ds.rmEsc!=null&&draft){draft.data.escenas.splice(+ds.rmEsc,1);dirty=true;renderSheet();return}
  if(ds.addRef!=null&&draft){draft.data.refs.push(blankRef());dirty=true;renderSheet();return}
  if(ds.rmRef!=null&&draft){draft.data.refs.splice(+ds.rmRef,1);dirty=true;renderSheet();return}
  if(ds.briefBase!=null&&draft){var bb=state.config.briefBase||BRIEF_BASE_DEFAULT,br=draft.data.brief=draft.data.brief||{},nfill=0;Object.keys(bb).forEach(function(k){if(!String(br[k]||"").trim()&&bb[k]){br[k]=bb[k];nfill++}});dirty=true;renderSheet();toast(nfill?"Listo: se llenaron "+nfill+" campos.":"No había campos vacíos.");return}
  if(ds.copyBrief!=null){var u=$("#brief-url");if(!u)return;(navigator.clipboard?navigator.clipboard.writeText(u.value):Promise.reject()).then(function(){toast("Link copiado")},function(){u.select();toast("Selecciona y copia el link")});return}
  if(ds.bankNew!=null){openRef(null);return}
  if(ds.bankEdit!=null){openRef(ds.bankEdit);return}
  if(ds.bankUse!=null){var b=state.banco.filter(function(x){return x.id===ds.bankUse})[0];if(!b)return;
    openNew({categoria:b.categoria||CATS[0],etapa:b.etapa||"TOFU",formato:b.formato||"UGC",estado:"Referentes",refs:[{id:uid(),plataforma:b.plataforma,url:b.url,nota:b.nota,media:b.media||"",mediaType:b.mediaType||""}]});return}
  if(ds.saveCfg!=null){var mv=digits($("#cfg-meta").value),rv=dec($("#cfg-roas").value),nv=digits($("#cfg-min").value);if(!mv||!rv){toast("Escribe la meta de CPA y la de ROAS");return}
    sb.from("config").update({meta_cpa:mv,meta_roas:rv,min_compras:nv||1}).eq("id",1).then(function(res){if(res.error){toast("No se pudo guardar: "+errMsg(res.error));return}state.config.metaCpa=mv;state.config.metaRoas=rv;state.config.minCompras=nv||1;render();toast("Metas guardadas")});return}
});
document.addEventListener("input",function(ev){
  var t=ev.target,ds=t.dataset;
  if(ds.filter){ui[ds.filter]=t.value;$("#pipe").innerHTML=pipeHTML();$("#grid").innerHTML=gridHTML();return}
  if(!draft)return;
  if(ds.f){if(t.type==="radio"&&!t.checked)return;draft.data[ds.f]=t.value;dirty=true;
    if(ds.f==="nombre"&&draft.kind==="creativo")$("#sheet-title").textContent=t.value||"Sin nombre";
    if(ds.f==="clasif")$("#tierbox").innerHTML=tierBox(draft.data);
    if(ds.f==="etapa"){var p=$(".panel");if(p)p.className="panel st-"+t.value}
    return}
  if(ds.shopQ!=null){shopUi.q=t.value;clearTimeout(shopTimer);shopTimer=setTimeout(function(){runProductSearch(false)},350);return}
  if(ds.pk!=null){draft.data.productos[+ds.pk].nota=t.value;dirty=true;return}
  if(ds.brief){draft.data.brief=draft.data.brief||{};draft.data.brief[ds.brief]=t.value;dirty=true;return}
  if(ds.win){draft.data.ventanas[ds.win][ds.k]=t.value;dirty=true;var w1=win(draft.data,ds.win),c1=$("#cpa-"+ds.win),r1=$("#roas-"+ds.win);if(c1)c1.innerHTML=cpaCell(w1);if(r1)r1.innerHTML=roasCell(w1);$("#tierbox").innerHTML=tierBox(draft.data);return}
  if(ds.esc!=null){draft.data.escenas[+ds.esc][ds.k]=t.value;dirty=true;return}
  if(ds.ref!=null){draft.data.refs[+ds.ref][ds.k]=t.value;dirty=true;return}
});
document.addEventListener("change",function(ev){
  var t=ev.target,ds=t.dataset;
  if(ds.upload!=null){handleUpload(t);return}
  if(ds.shopVar){shopUi.pick[ds.shopVar]=t.value;paintResults();return}
  if(ds.briefOn!=null&&draft){draft.data.briefActivo=t.checked;dirty=true;return}
  if(ds.el!=null&&draft){var el=draft.data.elementos,v=ds.el,ix=el.indexOf(v);if(t.checked&&ix<0)el.push(v);if(!t.checked&&ix>=0)el.splice(ix,1);dirty=true;return}
  if(ds.fromBank!=null&&draft&&t.value){var b=state.banco.filter(function(x){return x.id===t.value})[0];if(b){draft.data.refs.push({id:uid(),plataforma:b.plataforma,url:b.url,nota:b.nota,media:b.media||"",mediaType:b.mediaType||""});dirty=true;renderSheet();toast("Referente agregado")}return}
  if(t.type==="radio"&&ds.f&&draft){draft.data[ds.f]=t.value;dirty=true;return}
  if(ds.perfil){var upd={};upd[ds.k]=t.value;sb.from("perfiles").update(upd).eq("id",ds.perfil).then(function(res){
    if(res.error){toast("No se pudo cambiar: "+errMsg(res.error));render();return}
    var p=perfil(ds.perfil);if(p)p[ds.k]=t.value;if(ds.perfil===me.id)me[ds.k]=t.value;toast("Equipo actualizado");if(ds.k==="rol")render()})}
});
document.addEventListener("submit",function(ev){
  var f=ev.target;ev.preventDefault();
  function err(m){var e=f.querySelector(".lock-err");if(e)e.textContent=m}
  function val(id){var x=$("#"+id);return x?x.value.trim():""}
  var btn=f.querySelector("button[type=submit]");function busy(on,txt){if(btn){btn.disabled=on;if(txt)btn.textContent=txt}}
  if(f.id==="login-form"){busy(true,"Entrando…");sb.auth.signInWithPassword({email:val("lg-email"),password:$("#lg-pass").value}).then(function(res){if(res.error){busy(false,"Entrar");err(errMsg(res.error))}});return}
  if(f.id==="forgot-form"){busy(true,"Enviando…");sb.auth.resetPasswordForEmail(val("fg-email"),{redirectTo:location.origin+"/"}).then(function(res){busy(false,"Enviar enlace");if(res.error){err(errMsg(res.error));return}err("");f.innerHTML='<p>Listo. Si el correo está registrado, te llega un enlace en unos minutos. Revisa también spam.</p>'});return}
  if(f.id==="setpass-form"||f.id==="pass-form"){
    var a=f.id==="setpass-form"?$("#sp-pass").value:$("#ps-new").value,b=f.id==="setpass-form"?$("#sp-pass2").value:$("#ps-new2").value;
    if(a.length<8){err("La contraseña debe tener al menos 8 caracteres.");return}if(a!==b){err("Las dos contraseñas no coinciden.");return}
    busy(true,"Guardando…");
    sb.auth.updateUser({password:a}).then(function(res){
      if(res.error){busy(false,"Guardar");err(errMsg(res.error));return}
      if(f.id==="setpass-form"){var nm=val("sp-name");var p2=nm?sb.from("perfiles").update({nombre:nm}).eq("id",session.user.id):Promise.resolve();
        return Promise.resolve(p2).then(function(){needPassword=false;history.replaceState(null,"",location.pathname);return loadMe()}).then(function(){return loadAll()}).then(function(){toast("Contraseña creada. ¡Bienvenido!")})}
      busy(false,"Cambiar contraseña");f.reset();err("");toast("Contraseña cambiada");
    });return}
  if(f.id==="me-form"){var nm2=val("me-name");sb.from("perfiles").update({nombre:nm2}).eq("id",me.id).then(function(res){if(res.error){toast("No se pudo guardar: "+errMsg(res.error));return}me.nombre=nm2;var p=perfil(me.id);if(p)p.nombre=nm2;render();toast("Nombre guardado")});return}
  if(f.id==="base-form"){var bb={};f.querySelectorAll("[data-base]").forEach(function(x){bb[x.dataset.base]=x.value});
    sb.from("config").update({brief_base:bb}).eq("id",1).then(function(res){if(res.error){toast("No se pudo guardar: "+errMsg(res.error));return}state.config.briefBase=bb;toast("Plantilla guardada")});return}
});
document.addEventListener("keydown",function(ev){if(ev.key==="Escape"&&draft&&!document.querySelector(".dlg-bg"))closeSheet()});
window.addEventListener("hashchange",route);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&session&&!draft&&!needPassword&&Date.now()-lastLoad>60000)loadAll(true)});
function route(){
  var h=location.hash.replace("#","");
  if(/^c-/.test(h)){var id=h.slice(2);if(loaded&&(!draft||draft.data.id!==id))openCreativo(id);return}
  if(TITLES[h]&&h!==ui.tab){ui.tab=h;render()}
}

/* ================= Arranque ================= */
function start(){
  if(!sb){render();return}
  sb.auth.onAuthStateChange(function(event,s){
    if(event==="PASSWORD_RECOVERY")needPassword=true;
    var had=!!session;session=s;
    if(!s){me=null;loaded=false;draft=null;renderSheet();authView="login";render();return}
    if(event==="TOKEN_REFRESHED"||(had&&event==="SIGNED_IN"&&me))return;
    setTimeout(function(){loadMe().then(function(){if(needPassword){render();return}return loadAll().then(route)})},0);
  });
  render();
}
start();
})();
