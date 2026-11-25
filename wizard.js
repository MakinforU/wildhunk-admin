/* Wild hunk: new product wizard.
   WHWizard.open({ api, cats, onDone })
   api = { upload(files, folder) -> Promise<[url]>, ai(mode, payload) -> Promise<result>, save(row) -> Promise<{id}>, discard(urls) -> Promise, toast(msg, err) }
   AI calls go through a server function so no API key ever reaches the browser. */
(function(){
var VIEWS=[['front','Front'],['back','Back'],['left','Left side'],['right','Right side'],['detail','Close-up detail']];
var GENDERS=['Men','Women','Boys','Girls','Unisex','Gender-neutral'];
var STYLES=['Casual','Ethnic','Formal','Party','Streetwear','Sports & active','Loungewear','Winterwear'];
var SIZESETS=[['Clothing',['XS','S','M','L','XL','XXL','3XL']],['Kids',['2-3Y','4-5Y','6-7Y','8-9Y','10-11Y','12-13Y']],['Waist',['28','30','32','34','36','38','40']],['Footwear',['6','7','8','9','10','11','12']],['One size',['Free size']]];
var FABRICS=['Cotton','Organic cotton','Linen','Cotton-linen blend','Denim','Corduroy','Polyester','Poly-cotton blend','Rayon / viscose','Silk','Wool','Fleece','Nylon','Suede','Leather','Knit','Terry'];
var FITS=['Oversized','Relaxed','Regular','Slim','Skinny','Straight','Tapered','Boxy'];
var PATTERNS=['Solid','Printed','Graphic','Checked','Striped','Embroidered','Washed','Textured','Colour-block'];
var SLEEVES=['','Half sleeve','Full sleeve','Sleeveless','Three-quarter','Short sleeve'];
var NECKS=['','Crew neck','V-neck','Polo collar','Spread collar','Button-down collar','Mandarin collar','Hooded','Cuban collar'];
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function inr(v){return '₹'+Number(v||0).toLocaleString('en-IN')}
function opts(list,v){return list.map(function(x){return '<option value="'+esc(x)+'"'+(x===v?' selected':'')+'>'+(x||'Not applicable')+'</option>'}).join('')}

var CSS='.wz{position:fixed;inset:0;z-index:60;background:var(--bg,#f6f2ec);display:flex;flex-direction:column}'+
'.wz-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 22px;border-bottom:1px solid var(--line,#e4dcd1);background:var(--card,#fffdf9)}'+
'.wz-top h2{margin:0;font-weight:400;font-size:20px}.wz-x{background:none;border:0;font-size:26px;cursor:pointer;line-height:1}'+
'.wz-steps{display:flex;gap:4px;padding:12px 22px;overflow-x:auto;border-bottom:1px solid var(--line,#e4dcd1);background:var(--card,#fffdf9)}'+
'.wz-steps button{flex:1;min-width:120px;background:none;border:0;border-top:3px solid var(--line,#e4dcd1);padding:8px 4px 2px;text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#6f655c);cursor:pointer}'+
'.wz-steps button.done{border-color:var(--accent2,#c9a67a);color:var(--ink,#16110e)}.wz-steps button.on{border-color:var(--ink,#16110e);color:var(--ink,#16110e);font-weight:600}'+
'.wz-steps b{display:block;font-size:11px;font-weight:400;color:var(--muted,#6f655c)}'+
'.wz-body{flex:1;overflow:auto;padding:24px 22px 40px}.wz-in{max-width:920px;margin:0 auto}'+
'.wz-body h3{font-weight:400;font-size:22px;margin:0 0 4px}.wz-lead{color:var(--muted,#6f655c);margin:0 0 20px}'+
'.wz-foot{display:flex;justify-content:space-between;gap:10px;padding:14px 22px;border-top:1px solid var(--line,#e4dcd1);background:var(--card,#fffdf9);flex-wrap:wrap}'+
'.wz-drop{border:1.5px dashed var(--accent,#a07a4f);background:#fffaf3;min-height:320px;display:grid;place-items:center;text-align:center;cursor:pointer;padding:20px;position:relative}'+
'.wz-drop.over{background:#f6ead8}.wz-drop img{max-height:420px;max-width:100%;object-fit:contain}'+
'.wz-drop .ph{color:var(--accent,#a07a4f);font-size:15px}.wz-drop .ph b{display:block;font-size:40px;font-weight:300;line-height:1}'+
'.wz-views{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}'+
'.wz-v{background:var(--card,#fffdf9);border:1px solid var(--line,#e4dcd1);display:flex;flex-direction:column}'+
'.wz-v .im{aspect-ratio:4/5;background:#eee6db;display:grid;place-items:center;position:relative;overflow:hidden}'+
'.wz-v .im img{width:100%;height:100%;object-fit:cover}.wz-v .im .ld{position:absolute;inset:0;display:grid;place-items:center;background:rgba(246,242,236,.8);font-size:12px;color:var(--muted,#6f655c)}'+
'.wz-v .im .ld:before{content:"";width:22px;height:22px;border:2px solid var(--accent2,#c9a67a);border-top-color:transparent;border-radius:50%;animation:wzspin 1s linear infinite;margin-bottom:34px;position:absolute}'+
'@keyframes wzspin{to{transform:rotate(360deg)}}'+
'.wz-v .lb{padding:8px 10px 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}'+
'.wz-v .lb .ok{color:#2f6b3d;font-size:11px;text-transform:none;letter-spacing:0}'+
'.wz-v .ac{display:flex;gap:4px;padding:4px 8px 10px;flex-wrap:wrap}.wz-v .ac button{flex:1;font-size:11.5px;padding:5px 6px;border:1px solid var(--line,#e4dcd1);background:#fff;cursor:pointer;white-space:nowrap}'+
'.wz-v .ac button:hover{border-color:var(--ink,#16110e)}.wz-v.chosen{outline:2px solid var(--accent,#a07a4f)}'+
'.wz-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#fff;font-size:12px;text-align:center;padding:10px}.wz-ph b{font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:500}'+
'.wz-src{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px}@media (pointer:coarse){.wz-drop:not(.has){display:none}.wz-src .btn{padding:18px 16px;font-size:16px}}.wz-src .btn{flex:1;min-width:150px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 16px}'+
'.wz-src svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}'+
'.wz-camm{position:fixed;inset:0;z-index:70;background:rgba(15,11,9,.92);display:grid;place-items:center;padding:16px}.wz-cambox{width:min(720px,100%)}.wz-cambox video{width:100%;max-height:70vh;background:#000;display:block}'+
'.wz-note.wz-err{background:#fbeceb;border-color:#e3b4ae;color:#7a2a20}'+
'.wz-camerr{background:#fffdf9;padding:20px;color:#16110e}.wz-camerr p{margin:8px 0 0;font-size:14px;line-height:1.5}.wz-camacts .btn[disabled]{opacity:.6}'+
'.wz-camacts{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}.wz-camacts .btn.ghost{color:#fff;border-color:#fff}.wz-camacts .btn:not(.ghost){background:#fff;color:#16110e;border-color:#fff}'+
'.wz-note{background:#fbf3e6;border-left:3px solid var(--accent,#a07a4f);padding:12px 14px;font-size:13.5px;margin:0 0 16px}'+
'.wz-note.ok{background:#eaf3e7;border-color:#2f6b3d}'+
'.wz-g2{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.wz-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:0 16px}'+
'.wz-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 16px}.wz-chips button{border:1px solid var(--line,#e4dcd1);background:#fff;padding:7px 13px;cursor:pointer;font-size:13.5px}'+
'.wz-chips button.on{background:var(--ink,#16110e);color:#fff;border-color:var(--ink,#16110e)}'+
'.wz-sec{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#6f655c);margin:6px 0 0}'+
'.wz-price{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;background:var(--card,#fffdf9);border:1px solid var(--line,#e4dcd1);padding:18px 20px;margin:4px 0 18px}'+
'.wz-price .now{font-size:30px;font-weight:500}.wz-price s{color:var(--muted,#6f655c);font-size:18px}.wz-price .off{color:#1d8a4e;font-weight:600}.wz-price small{flex-basis:100%;color:var(--muted,#6f655c)}'+
'.wz-rev{display:grid;grid-template-columns:1.1fr 1fr;gap:24px}'+
'.wz-gal .wz-m{aspect-ratio:4/5;background:#eee6db}.wz-gal .wz-m img{width:100%;height:100%;object-fit:cover}'+
'.wz-gal .wz-th{display:flex;gap:8px;margin-top:8px}.wz-gal .wz-th img{width:60px;height:74px;object-fit:cover;cursor:pointer;opacity:.6;border:1px solid transparent}.wz-gal .wz-th img.on{opacity:1;border-color:var(--ink,#16110e)}'+
'.wz-info h4{font-weight:400;font-size:24px;margin:6px 0 8px}.wz-info .tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.wz-info .tags span{background:#efe7dc;padding:3px 10px;font-size:12px}'+
'.wz-info ul{padding-left:18px;margin:8px 0}.wz-info .sz{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.wz-info .sz span{border:1px solid var(--line,#e4dcd1);padding:6px 10px;font-size:13px}'+
'.wz-info .edit{font-size:12px;margin-left:8px}'+
'.wz-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.wz-acts .btn{flex:1;min-width:140px}'+
'.wz-done{text-align:center;padding:60px 20px}.wz-done b{display:block;font-size:44px;font-weight:300}'+
'@media (max-width:860px){.wz-views{grid-template-columns:repeat(2,1fr)}.wz-g2,.wz-g3,.wz-rev{grid-template-columns:1fr}.wz-steps button{min-width:96px}}';

function open(o){
  var api=o.api,cats=o.cats||['T-shirts','Shirts','Polos','Bottoms','Winterwear','Shorts','Footwear','Accessories'];
  if(!document.getElementById('wz-css')){var st=document.createElement('style');st.id='wz-css';st.textContent=CSS;document.head.appendChild(st)}
  var S={step:0,photo:o.photo||null,views:{},chosen:{},title:'',fabric:'Cotton',composition:'',gsm:'',fit:'Regular',pattern:'Solid',sleeve:'',neck:'',care:'Machine wash cold, dry in shade',origin:'Made in India',description:'',highlights:'',
    mrp:999,price:800,badge:'Just In',gender:['Men'],style:['Casual'],category:cats[0],sizes:['S','M','L','XL','XXL'],soldout:[],uploaded:[],aiReady:null,busy:false};
  var STEPS=[['Photo','Upload'],['AI views','5 angles'],['Details','Fabric & more'],['Price','MRP & offer'],['Category','Who & sizes'],['Review','Publish']];
  var el=document.createElement('div');el.className='wz';el.setAttribute('role','dialog');el.setAttribute('aria-label','Add a product');
  el.innerHTML='<div class="wz-top"><h2>Add a product</h2><button class="wz-x" aria-label="Close">×</button></div><nav class="wz-steps"></nav><div class="wz-body"><div class="wz-in"></div></div><div class="wz-foot"><button class="btn ghost" id="wz-back">Back</button><span style="flex:1"></span><button class="btn ghost" id="wz-draft">Save as draft</button><button class="btn" id="wz-next">Next</button></div>';
  document.body.appendChild(el);document.body.style.overflow='hidden';
  var body=$('.wz-in',el);
  function close(){el.remove();document.body.style.overflow=''}
  $('.wz-x',el).onclick=function(){if(S.step<6&&(S.photo||S.title)&&!confirm('Close without saving? Your changes will be lost.'))return;close()};
  function aiMsg(m){m=String(m||'');
    if(/outstanding balance|billing|payment/i.test(m))return 'Your Google AI Studio billing has an unpaid balance, so Google is refusing AI requests. Pay it at aistudio.google.com/billing, then tap Generate again. Meanwhile you can upload the angles yourself.';
    if(/free_tier|quota|exhausted|rate/i.test(m))return 'The Gemini usage limit was reached. Wait a few minutes and try again, or check billing in Google AI Studio.';
    if(/limit reached|Too many AI/i.test(m))return m;
    if(/API key|PERMISSION_DENIED|invalid/i.test(m))return 'The Gemini key was rejected. It may have been deleted or rotated. Save a new key as GEMINI_API_KEY in Supabase.';
    if(/high demand|overloaded|unavailable|503/i.test(m))return 'Google\'s AI is busy right now. Try again in a minute.';
    if(/could not be reached|Failed to fetch|network/i.test(m))return 'The AI service could not be reached. Check your connection and try again.';
    return m||'Something went wrong. Try again, or upload the angles yourself.'}
  function isDemo(k){return !!(S.aiDemo&&S.demoT&&S.demoT[k]!=null)}
  function picked(){return VIEWS.map(function(v){return isDemo(v[0])?null:S.views[v[0]]}).filter(Boolean)}
  function images(){var a=picked();return a.length?a:(S.photo?[S.photo]:[])}
  function off(){return S.mrp>S.price&&S.price>0?Math.round((1-S.price/S.mrp)*100):0}
  function navDraw(){$('.wz-steps',el).innerHTML=STEPS.map(function(s,k){return '<button data-k="'+k+'" class="'+(k===S.step?'on':k<S.step?'done':'')+'">'+(k+1)+'. '+s[0]+'<b>'+s[1]+'</b></button>'}).join('');
    $('#wz-back',el).style.visibility=S.step?'visible':'hidden';$('#wz-next',el).textContent=S.step===4?'Review':'Next';$('#wz-next',el).style.display=S.step>=5?'none':'';$('#wz-draft',el).style.display=S.step>=5||!S.photo?'none':'';var on=$('.wz-steps .on',el);if(on&&on.scrollIntoView)on.scrollIntoView({inline:'center',block:'nearest'})}
  $('.wz-steps',el).onclick=function(e){var b=e.target.closest('[data-k]');if(!b)return;var k=+b.dataset.k;if(k<=S.step||valid(S.step,true))go(k)};
  $('#wz-back',el).onclick=function(){read();go(S.step-1)};
  $('#wz-next',el).onclick=function(){read();if(valid(S.step))go(S.step+1)};
  $('#wz-draft',el).onclick=function(){read();save(false)};
  function valid(k,quiet){var m='';
    if(k===0&&!S.photo)m='Upload a product photo first.';
    if(k===2&&!S.title.trim())m='Give the product a name.';
    if(k===3&&(!(S.price>0)||!(S.mrp>0)))m='Enter both the MRP and the selling price.';
    if(k===3&&S.price>S.mrp)m='Selling price is higher than MRP. Lower it or raise the MRP.';
    if(k===4&&!S.sizes.length)m='Pick at least one size.';
    if(k===4&&!S.gender.length)m='Pick who the product is for.';
    if(m&&!quiet)api.toast(m,true);return !m}
  function go(k){S.step=Math.max(0,Math.min(6,k));navDraw();body.parentNode.scrollTop=0;body.onclick=null;[step0,step1,step2,step3,step4,step5,done][S.step]()}
  function read(){$$('[data-f]',body).forEach(function(i){var f=i.dataset.f;S[f]=i.type==='number'?+i.value:i.value})}

  // 1. Photo
  function step0(){body.innerHTML='<h3>Start with one photo</h3><p class="wz-lead">Take a photo with your camera or upload one you already have. A clear, well-lit shot of the whole garment works best. The AI cleans up the background and makes the other angles.</p>'+
    '<div class="wz-src"><button class="btn" id="wz-cam" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'+(S.photo?'Retake photo':'Take photo')+'</button>'+
    '<button class="btn ghost" id="wz-up" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 15v5h16v-5"/></svg>'+(S.photo?'Upload a different photo':'Upload photo')+'</button></div>'+
    '<div class="wz-drop'+(S.photo?' has':'')+'" id="wz-drop">'+(S.photo?'<img src="'+esc(S.photo)+'" alt="Product photo">':'<div class="ph"><b>+</b>Drop a photo here<br><small style="color:#6f655c">JPG, PNG or WebP, up to 8 MB</small></div>')+'</div>';
    var d=$('#wz-drop',body);
    function take(files){if(!files||!files.length)return;d.innerHTML='<div class="ph">Uploading…</div>';
      api.upload([files[0]],'products').then(function(u){S.photo=u[0];S.uploaded.push(u[0]);S.views={};step0();navDraw()}).catch(function(e){api.toast(e.message||'Upload failed',true);step0()})}
    function pick(cam){var i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','environment');i.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(i);i.onchange=function(){take(i.files);i.remove()};i.click()}
    $('#wz-up',body).onclick=function(){pick(false)};
    $('#wz-cam',body).onclick=function(){var touch=matchMedia('(pointer:coarse)').matches;
      if(touch||!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia))return pick(true);
      camera(function(f){take([f])},function(){pick(false)})};
    d.onclick=function(){if(!S.photo)pick(false)};
    d.ondragover=function(e){e.preventDefault();d.classList.add('over')};d.ondragleave=function(){d.classList.remove('over')};
    d.ondrop=function(e){e.preventDefault();d.classList.remove('over');take(e.dataTransfer.files)}}
  // Live camera for laptops and desktops (phones use their own camera app)
  function camera(done,fallback){var m=document.createElement('div');m.className='wz-camm';
    m.innerHTML='<div class="wz-cambox"><video playsinline autoplay muted></video><div class="wz-camacts"><button class="btn ghost" data-c="x" type="button">Cancel</button><button class="btn" data-c="snap" type="button">Capture</button></div></div>';
    document.body.appendChild(m);var v=$('video',m),stream=null,snap=$('[data-c="snap"]',m);snap.disabled=true;snap.textContent='Starting camera…';
    function stop(){if(stream)stream.getTracks().forEach(function(t){t.stop()});m.remove()}
    function fail(err){if(stream)stream.getTracks().forEach(function(t){t.stop()});var n=(err&&err.name)||'';
      var why=/NotAllowed|Security/.test(n)?'Camera permission is blocked for this site. Click the camera icon in the address bar (or your browser settings), allow the camera, then try again.':
        /NotFound|Overconstrained/.test(n)?'No camera was found on this device.':/NotReadable|Abort/.test(n)?'Another app is using the camera. Close it and try again.':'The camera could not start.';
      $('.wz-cambox',m).innerHTML='<div class="wz-camerr"><b>Camera not available</b><p>'+why+'</p></div><div class="wz-camacts"><button class="btn ghost" data-c="x" type="button">Close</button><button class="btn" data-c="file" type="button">Choose a photo instead</button></div>'}
    function start(c){return navigator.mediaDevices.getUserMedia({video:c,audio:false})}
    start({facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}}).catch(function(e){if(/NotAllowed|Security/.test(e&&e.name))throw e;return start(true)})
      .then(function(st){stream=st;v.srcObject=st;var go=function(){snap.disabled=false;snap.textContent='Capture'};v.onloadedmetadata=function(){var p=v.play();if(p&&p.catch)p.catch(function(){});go()};if(v.readyState>=1)go()})
      .catch(fail);
    m.onclick=function(e){var b=e.target.closest('[data-c]');if(!b)return;if(b.dataset.c==='x')return stop();if(b.dataset.c==='file'){stop();return fallback()}
      if(!v.videoWidth)return;var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
      c.toBlob(function(bl){stop();if(bl)done(new File([bl],'camera-'+Date.now()+'.jpg',{type:'image/jpeg'}))},'image/jpeg',.92)}}

  // 2. AI views
  function step1(){
    body.innerHTML='<h3>Five angles for the product page</h3><p class="wz-lead">Generate front, back, both sides and a close-up from your photo. Keep the ones you like, regenerate the rest, or upload your own.</p>'+
      '<div id="wz-ainote"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px"><button class="btn" id="wz-gen">Generate all 5 views</button><button class="btn ghost" id="wz-usephoto">Use my photo as the front</button></div>'+
      '<div class="wz-views" id="wz-views"></div><p class="hint" style="margin-top:14px">Only the views you keep go on the store, in this order. You can skip this step and use just your photo.</p>';
    function note(){var n=$('#wz-ainote',body);if(S.aiErr){n.innerHTML='<div class="wz-note wz-err" role="alert"><b>AI photos failed.</b> '+esc(S.aiErr)+'</div>';return}if(S.aiReady===false)n.innerHTML='<div class="wz-note">AI image generation isn\'t switched on yet. It needs a Gemini or OpenAI key, which we add on the server so it stays private. Until then, upload each angle yourself with the Upload buttons.</div>';
      else if(S.aiDemo)n.innerHTML='<div class="wz-note">Preview only: nothing is generated here. In the live admin, each tile becomes a new studio photo of your garment on a clean background, with the shop and clutter removed. Tip: upload a real back photo for the most accurate back view.</div>';else n.innerHTML=''}
    function draw(){$('#wz-views',body).innerHTML=VIEWS.map(function(v){var u=S.views[v[0]],l=S.loading&&S.loading[v[0]];
      return '<div class="wz-v'+(u?' chosen':'')+'"><div class="im">'+(u&&isDemo(v[0])?'<img src="'+esc(u)+'" alt="" style="filter:blur(3px) grayscale(.6) brightness(.55);transform:scale(1.08)"><div class="wz-ph"><b>'+v[1]+'</b>AI studio photo appears here</div>':u?'<img src="'+esc(u)+'" alt="'+v[1]+' view">':'<span style="color:#a59a8d;font-size:12px">No image yet</span>')+(l?'<div class="ld">Generating…</div>':'')+'</div>'+
        '<div class="lb">'+v[1]+(u&&!isDemo(v[0])?'<span class="ok">✓ kept</span>':'')+'</div><div class="ac"><button data-gen="'+v[0]+'">'+(u?'Regenerate':'Generate')+'</button><button data-up="'+v[0]+'">Upload</button>'+(u?'<button data-rm="'+v[0]+'">Remove</button>':'')+'</div></div>'}).join('');note()}
    function gen(keys){S.loading=S.loading||{};keys.forEach(function(k){S.loading[k]=1});draw();
      return api.ai('views',{image:S.photo,views:keys,title:S.title}).then(function(r){S.aiReady=true;S.aiErr=null;S.aiDemo=!!r.demo;S.demoT=r.styles||null;var errs=r.errors||{},miss=keys.filter(function(k){return !(r.images&&r.images[k])});if(miss.length)S.aiErr=miss.length+' of '+keys.length+' views did not come out ('+aiMsg(errs[miss[0]]||'')+'). Tap Generate on those tiles to try again, or upload them yourself.';keys.forEach(function(k){if(r.images&&r.images[k]){S.views[k]=r.images[k];if(!r.demo)S.uploaded.push(r.images[k])}delete S.loading[k]});draw();if(S.aiErr){var n=$('#wz-ainote',body);if(n&&n.scrollIntoView)n.scrollIntoView({behavior:'smooth',block:'center'})}})
        .catch(function(e){keys.forEach(function(k){delete S.loading[k]});if(e&&e.code==='no_key')S.aiReady=false;else{S.aiErr=aiMsg(e&&e.message);api.toast('AI photos failed. See the message above the tiles.',true)}draw();var n=$('#wz-ainote',body);if(n&&n.scrollIntoView)n.scrollIntoView({behavior:'smooth',block:'center'})})}
    $('#wz-gen',body).onclick=function(){gen(VIEWS.map(function(v){return v[0]}))};
    $('#wz-usephoto',body).onclick=function(){S.views.front=S.photo;draw()};
    $('#wz-views',body).onclick=function(e){var b=e.target.closest('button');if(!b)return;
      if(b.dataset.gen)gen([b.dataset.gen]);
      else if(b.dataset.rm){delete S.views[b.dataset.rm];draw()}
      else if(b.dataset.up){var k=b.dataset.up,i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){if(!i.files.length)return;S.loading={};S.loading[k]=1;draw();
        api.upload([i.files[0]],'products').then(function(u){S.views[k]=u[0];S.uploaded.push(u[0]);if(S.demoT)delete S.demoT[k];delete S.loading[k];draw()}).catch(function(err){delete S.loading[k];api.toast(err.message,true);draw()})};i.click()}};
    draw();
    if(S.aiReady===null)api.ai('status',{}).then(function(r){S.aiReady=!!r.ready;S.aiDemo=!!r.demo;note()}).catch(function(){S.aiReady=false;note()});
  }

  // 3. Details
  function step2(){
    body.innerHTML='<h3>Product details</h3><p class="wz-lead">These show on the product page. Let AI draft them from your photo, then adjust anything.</p>'+
      '<div style="margin:0 0 16px"><button class="btn ghost" id="wz-sugg">✦ Suggest details with AI</button></div><div id="wz-dnote"></div>'+
      '<label>Product name<input data-f="title" value="'+esc(S.title)+'" placeholder="e.g. Washed Linen Resort Shirt" maxlength="90"></label>'+
      '<div class="wz-g3"><label>Fabric<select data-f="fabric">'+opts(FABRICS.indexOf(S.fabric)<0?FABRICS.concat([S.fabric]):FABRICS,S.fabric)+'</select></label>'+
      '<label>Composition<input data-f="composition" value="'+esc(S.composition)+'" placeholder="e.g. 100% cotton"></label>'+
      '<label>Weight / GSM (optional)<input data-f="gsm" value="'+esc(S.gsm)+'" placeholder="e.g. 240 GSM"></label></div>'+
      '<div class="wz-g3"><label>Fit<select data-f="fit">'+opts(FITS,S.fit)+'</select></label><label>Pattern<select data-f="pattern">'+opts(PATTERNS,S.pattern)+'</select></label><label>Sleeve<select data-f="sleeve">'+opts(SLEEVES,S.sleeve)+'</select></label></div>'+
      '<div class="wz-g3"><label>Neck / collar<select data-f="neck">'+opts(NECKS,S.neck)+'</select></label><label>Wash care<input data-f="care" value="'+esc(S.care)+'"></label><label>Origin<input data-f="origin" value="'+esc(S.origin)+'"></label></div>'+
      '<label>Description<textarea data-f="description" rows="4" placeholder="Two or three sentences on how it feels, fits and what to wear it with.">'+esc(S.description)+'</textarea></label>'+
      '<label>Extra highlights (one per line, optional)<textarea data-f="highlights" rows="3" placeholder="Pre-shrunk&#10;Double-stitched hems">'+esc(S.highlights)+'</textarea></label>';
    $('#wz-sugg',body).onclick=function(){read();var b=this;b.disabled=true;b.textContent='Thinking…';
      api.ai('describe',{image:S.photo,title:S.title}).then(function(r){['title','fabric','composition','fit','pattern','sleeve','neck','description','highlights','gsm'].forEach(function(k){if(r[k])S[k]=r[k]});
        if(r.category&&cats.indexOf(r.category)>=0)S.category=r.category;if(r.style)S.style=[r.style];step2();if(r.demo)$('#wz-dnote',body).innerHTML='<div class="wz-note">Preview mode: sample text. With a real key the AI writes it from your photo.</div>'})
      .catch(function(e){b.disabled=false;b.textContent='✦ Suggest details with AI';$('#wz-dnote',body).innerHTML='<div class="wz-note">'+(e&&e.code==='no_key'?'AI suggestions switch on once the Gemini or OpenAI key is added. Fill the fields in yourself for now.':esc((e&&e.message)||'Could not get suggestions'))+'</div>'})}}

  // 4. Price
  function step3(){
    body.innerHTML='<h3>Price</h3><p class="wz-lead">Set the MRP and what customers pay. The store shows the MRP crossed out with the discount.</p>'+
      '<div class="wz-price" id="wz-pv"></div>'+
      '<div class="wz-g3"><label>MRP (₹)<input data-f="mrp" type="number" min="1" value="'+S.mrp+'"></label><label>Selling price (₹)<input data-f="price" type="number" min="1" value="'+S.price+'"></label><label>Or set discount %<input id="wz-disc" type="number" min="0" max="90" value="'+off()+'"></label></div>'+
      '<label>Badge on the product card<select data-f="badge">'+['','Just In','New','Best Seller','Sale','Limited'].map(function(b){return '<option value="'+b+'"'+(b===S.badge?' selected':'')+'>'+(b||'None')+'</option>'}).join('')+'</select></label>';
    function pv(){read();var o=off();$('#wz-pv',body).innerHTML=(o?'<s>'+inr(S.mrp)+'</s>':'')+'<span class="now">'+inr(S.price)+'</span>'+(o?'<span class="off">'+o+'% off</span><small>Customers save '+inr(S.mrp-S.price)+'. Shown as “'+inr(S.mrp)+' now '+inr(S.price)+'”.</small>':'<small>No discount: the price shows without an MRP.</small>')}
    $$('[data-f]',body).forEach(function(i){i.oninput=function(){pv();$('#wz-disc',body).value=off()}});
    $('#wz-disc',body).oninput=function(){var d=+this.value;if(S.mrp&&d>=0&&d<=90){S.price=Math.round(S.mrp*(100-d)/100);$('[data-f=price]',body).value=S.price;pv()}};pv()}

  // 5. Category and sizes
  function step4(){
    function chips(id,list,sel){return '<div class="wz-chips" id="'+id+'">'+list.map(function(x){return '<button type="button" data-v="'+esc(x)+'" class="'+(sel.indexOf(x)>=0?'on':'')+'">'+esc(x)+'</button>'}).join('')+'</div>'}
    body.innerHTML='<h3>Category and sizes</h3><p class="wz-lead">Where the product appears in the store, and which sizes you sell.</p>'+
      '<div class="wz-sec">Who it\'s for (pick one or more)</div>'+chips('wz-gen',GENDERS,S.gender)+
      '<div class="wz-sec">Style (pick one or more)</div>'+chips('wz-sty',STYLES,S.style)+
      '<label>Product type<select data-f="category">'+opts(cats.indexOf(S.category)<0?cats.concat([S.category]):cats,S.category)+'</select></label>'+
      '<div class="wz-sec">Sizes offered</div><p class="hint" style="margin:4px 0 0">Tap a size to offer it. Tap again to mark it sold out (red), and once more to remove it.</p>'+
      SIZESETS.map(function(g){return '<div style="margin-top:10px;font-size:12.5px;color:#6f655c">'+g[0]+'</div><div class="wz-chips wz-sz">'+g[1].map(function(z){var on=S.sizes.indexOf(z)>=0,so=S.soldout.indexOf(z)>=0;return '<button type="button" data-z="'+z+'" class="'+(on&&!so?'on':'')+'"'+(so?' style="background:#f3e3e0;color:#a2382b;border-color:#e3c2bc;text-decoration:line-through"':'')+'>'+z+'</button>'}).join('')+'</div>'}).join('')+
      '<div style="display:flex;gap:6px;margin-top:6px"><input id="wz-cs" placeholder="Custom size, e.g. 42" style="max-width:200px"><button type="button" class="btn ghost sm" id="wz-csb">Add size</button></div>';
    function tog(id,arr){$('#'+id,body).onclick=function(e){var b=e.target.closest('button');if(!b)return;var v=b.dataset.v,i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);b.classList.toggle('on')}}
    tog('wz-gen',S.gender);tog('wz-sty',S.style);
    body.onclick=function(e){var b=e.target.closest('[data-z]');if(!b)return;var z=b.dataset.z,on=S.sizes.indexOf(z)>=0,so=S.soldout.indexOf(z)>=0;
      if(!on)S.sizes.push(z);else if(!so)S.soldout.push(z);else{S.sizes.splice(S.sizes.indexOf(z),1);S.soldout.splice(S.soldout.indexOf(z),1)}read();step4()};
    $('#wz-csb',body).onclick=function(){var v=$('#wz-cs',body).value.trim();if(!v)return;SIZESETS[0][1].indexOf(v)<0&&SIZESETS.push(['Custom',[v]]);if(S.sizes.indexOf(v)<0)S.sizes.push(v);read();step4()}}

  // 6. Review
  function row(active){var d=[];if(S.fabric)d.push('Fabric: '+S.fabric+(S.composition?' ('+S.composition+')':''));if(S.gsm)d.push('Weight: '+S.gsm);if(S.fit)d.push('Fit: '+S.fit);if(S.pattern)d.push('Pattern: '+S.pattern);if(S.sleeve)d.push('Sleeve: '+S.sleeve);if(S.neck)d.push('Neck: '+S.neck);
    S.highlights.split('\n').map(function(x){return x.trim()}).filter(Boolean).forEach(function(x){d.push(x)});if(S.care)d.push('Wash care: '+S.care);if(S.origin)d.push(S.origin);
    var order=[];SIZESETS.forEach(function(g){g[1].forEach(function(z){if(S.sizes.indexOf(z)>=0&&order.indexOf(z)<0)order.push(z)})});S.sizes.forEach(function(z){if(order.indexOf(z)<0)order.push(z)});
    return {title:S.title.trim(),category:S.category,description:S.description.trim(),details:d,price:S.price,mrp:Math.max(S.mrp,S.price),images:images(),sizes:order,sold_out_sizes:S.soldout.filter(function(z){return order.indexOf(z)>=0}),badge:S.badge,active:!!active,
      gender:S.gender.slice(),style:S.style.slice(),attributes:{fabric:S.fabric,composition:S.composition,gsm:S.gsm,fit:S.fit,pattern:S.pattern,sleeve:S.sleeve,neck:S.neck,care:S.care,origin:S.origin,ai_views:Object.keys(S.views)}}}
  function step5(){var r=row(true),o=off(),k=0;
    body.innerHTML='<h3>Review before it goes live</h3><p class="wz-lead">This is how it will look. Publish it, keep it as a hidden draft, go back to edit, or reject it.</p>'+
      '<div class="wz-rev"><div class="wz-gal"><div class="wz-m"><img id="wz-main" src="'+esc(r.images[0]||'')+'" alt=""></div><div class="wz-th">'+r.images.map(function(u,j){return '<img src="'+esc(u)+'" data-j="'+j+'"'+(j?'':' class="on"')+' alt="">'}).join('')+'</div></div>'+
      '<div class="wz-info">'+(r.badge?'<span class="pill">'+esc(r.badge)+'</span>':'')+'<h4>'+esc(r.title)+'<button class="linkbtn edit" data-go="2">Edit</button></h4>'+
        '<div class="tags">'+r.gender.concat(r.style).concat([r.category]).map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'<button class="linkbtn edit" data-go="4">Edit</button></div>'+
        '<div style="font-size:24px">'+(o?'<s style="color:#6f655c;font-size:16px;margin-right:8px">'+inr(r.mrp)+'</s>':'')+inr(r.price)+(o?' <span style="color:#1d8a4e;font-size:15px;font-weight:600">'+o+'% off</span>':'')+'<button class="linkbtn edit" data-go="3">Edit</button></div>'+
        '<div class="sz">'+r.sizes.map(function(z){return '<span'+(r.sold_out_sizes.indexOf(z)>=0?' style="text-decoration:line-through;color:#a2382b"':'')+'>'+esc(z)+'</span>'}).join('')+'</div>'+
        (r.description?'<p>'+esc(r.description)+'</p>':'')+'<ul>'+r.details.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul><button class="linkbtn edit" data-go="2" style="margin:0">Edit details</button> · <button class="linkbtn edit" data-go="1" style="margin:0">Edit photos</button>'+
        '<div class="wz-acts"><button class="btn" id="wz-pub">Publish live</button><button class="btn ghost" id="wz-dr">Save as draft</button></div><div class="wz-acts" style="margin-top:8px"><button class="btn ghost" data-go="0">Edit from the start</button><button class="btn danger" id="wz-rej">Reject and discard</button></div>'+
      '</div></div>';
    $('.wz-th',body).onclick=function(e){var t=e.target.closest('[data-j]');if(!t)return;$$('.wz-th img',body).forEach(function(x){x.classList.remove('on')});t.classList.add('on');$('#wz-main',body).src=t.src};
    body.onclick=function(e){var g=e.target.closest('[data-go]');if(g)go(+g.dataset.go)};
    $('#wz-pub',body).onclick=function(){save(true)};$('#wz-dr',body).onclick=function(){save(false)};
    $('#wz-rej',body).onclick=function(){if(!confirm('Reject this product? It will not be saved, and the photos uploaded for it are deleted.'))return;api.discard(S.uploaded).catch(function(){});api.toast('Product rejected and discarded');close()}}
  function save(live){if(live&&!valid(2)||live&&!valid(3)||live&&!valid(4))return;if(!S.title.trim()){api.toast('Give the product a name first (step 3).',true);return}
    var r=row(live);$$('.wz-foot button, #wz-pub, #wz-dr',el).forEach(function(b){b.disabled=true});
    api.save(r).then(function(res){S.saved={live:live,id:res&&res.id,title:r.title};go(6);if(o.onDone)o.onDone()}).catch(function(e){$$('.wz-foot button, #wz-pub, #wz-dr',el).forEach(function(b){b.disabled=false});api.toast((e&&e.message)||'Could not save',true)})}
  function done(){$('.wz-foot',el).style.display='none';$('.wz-steps',el).style.display='none';
    body.innerHTML='<div class="wz-done"><b>'+(S.saved.live?'It\'s live':'Saved as a draft')+'</b><p>'+esc(S.saved.title)+(S.saved.live?' is now on the store.':' is hidden from the store. Publish it any time from Products.')+'</p><div class="wz-acts" style="justify-content:center;max-width:520px;margin:20px auto 0">'+(S.saved.live&&S.saved.id?'<a class="btn ghost" target="_blank" rel="noopener" href="./#p-'+S.saved.id+'">View on store</a>':'')+'<button class="btn" id="wz-again">Add another product</button><button class="btn ghost" id="wz-close">Done</button></div></div>';
    $('#wz-again',body).onclick=function(){close();open(o)};$('#wz-close',body).onclick=close}
  go(0);
}
window.WHWizard={open:open};
})();
