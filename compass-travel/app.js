import * as THREE from './assets/three.js';
import destinationPhotos from './assets/destination-photos.js';
const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cities=[
{name:'Chicago',country:'United States',code:'ORD',lat:41.8781,lon:-87.6298,price:218,temp:18,tz:'America/Chicago',trend:19,desc:'A skyline with soul.\nAn endless blue horizon.',notes:'Follow the river between soaring towers, then trade the city streets for the lakefront. Make time for neighborhood coffee, public art, and a long evening of music.',stops:['A morning walk along the Chicago Riverwalk','Art and open sky at Millennium Park','An evening of music in the city'],condition:"Cool lakeside air",photoAlt:"Chicago cityscape"},
{"name": "Los Angeles", "country": "United States", "code": "LAX", "lat": 34.0522, "lon": -118.2437, "price": 286, "temp": 25, "tz": "America/Los_Angeles", "trend": 22, "desc": "Pacific light.\nRoom to dream.", "notes": "Start between the palms and the Pacific, then follow the city into its hills. Los Angeles unfolds one neighborhood at a time.", "stops": ["Morning by the water in Santa Monica", "Browse art and cafes in the Arts District", "Watch the skyline from Griffith Observatory"], "condition": "Sunny & clear", "photoAlt": "Los Angeles skyline at sunset"},
{"name": "Munich", "country": "Germany", "code": "MUC", "lat": 48.1372, "lon": 11.5756, "price": 618, "temp": 17, "tz": "Europe/Berlin", "trend": 26, "desc": "Old-world streets.\nA fresh perspective.", "notes": "Follow the old town from lively squares to quiet courtyards. Make room for green spaces, market stalls, and an unhurried Bavarian afternoon.", "stops": ["Start beneath the towers of Marienplatz", "Taste your way through Viktualienmarkt", "An afternoon stroll in the English Garden"], "condition": "Mild & bright", "photoAlt": "Munich town hall on Marienplatz"},
{"name": "Moscow", "country": "Russia", "code": "SVO", "lat": 55.7558, "lon": 37.6173, "price": 784, "temp": 10, "tz": "Europe/Moscow", "trend": 14, "desc": "Grand avenues.\nLayers of history.", "notes": "Explore a city of striking architecture and broad river views. Historic squares and quiet gardens reveal different sides of the capital.", "stops": ["Take in the architecture around Red Square", "Browse the collections at the Tretyakov Gallery", "An evening walk beside the Moskva River"], "condition": "Cool & crisp", "photoAlt": "Saint Basil’s Cathedral in Moscow"},
{"name": "Dublin", "country": "Ireland", "code": "DUB", "lat": 53.3498, "lon": -6.2603, "price": 482, "temp": 14, "tz": "Europe/Dublin", "trend": 23, "desc": "A story on every street.\nA welcome around every corner.", "notes": "Cross the river, wander the bookshops, and leave the evening open for music. Dublin rewards a slow pace and a little curiosity.", "stops": ["Walk along the Liffey and cross Ha’penny Bridge", "Explore the grounds of Trinity College", "Find a cozy spot for an evening of live music"], "condition": "Fresh & breezy", "photoAlt": "A bridge over the River Liffey in Dublin"},
{name:'London',country:'United Kingdom',code:'LHR',lat:51.5,lon:-.12,price:524,temp:16,tz:'Europe/London',trend:12,desc:'Old stories. New chapters.\nSomething around every corner.',notes:'Follow the river through a city that keeps reinventing itself. Leave room for a bookshop, a hidden courtyard, and one more cup of tea.',stops:['Coffee and wandering in Notting Hill','An afternoon at Tate Modern','Dinner under the lights of Soho'],condition:"Soft city light",photoAlt:"London cityscape"},
{name:'Tokyo',country:'Japan',code:'HND',lat:35.68,lon:139.69,price:842,temp:22,tz:'Asia/Tokyo',trend:24,desc:'A thousand little worlds.\nOne extraordinary city.',notes:'Slip between the electric and the intimate. Tokyo rewards curiosity: a narrow alley, a tiny listening bar, a garden hidden behind a station.',stops:['Find the quiet at Meiji Shrine','Small shops and slow coffee in Yanaka','Follow the lanterns into Shinjuku'],condition:"Warm evening air",photoAlt:"Tokyo cityscape"},
{"name": "Kauai", "country": "Hawaii, United States", "code": "LIH", "lat": 22.0964, "lon": -159.5261, "price": 596, "temp": 27, "tz": "Pacific/Honolulu", "trend": 29, "desc": "Deep green valleys.\nAn ocean without an end.", "notes": "Let the island set the pace. Follow the coastline between mountain views, quiet towns, and long stretches of ocean light.", "stops": ["A slow morning beside Hanalei Bay", "Take in the views over Waimea Canyon", "Watch the evening light on the south shore"], "condition": "Warm & tropical", "photoAlt": "The Nā Pali Coast on Kauai"},
{"name": "Sydney", "country": "Australia", "code": "SYD", "lat": -33.8688, "lon": 151.2093, "price": 1086, "temp": 23, "tz": "Australia/Sydney", "trend": 27, "desc": "Harbor mornings.\nOcean afternoons.", "notes": "A city built around the water, with room to wander between its shores. Mix harbor views with neighborhood cafes and coastal walks.", "stops": ["Start at Circular Quay and the Opera House", "Explore the lanes and cafes of The Rocks", "Catch the ocean breeze along the Bondi coast"], "condition": "Bright & breezy", "photoAlt": "Sydney Opera House beside the harbor"}
];
let selected=6,origin=0,paused=reduced,tour=false,tourTimer,zoom=6.25,targetZoom=6.25,pointer={x:0,y:0},drag=null,velocity={x:0,y:0},focusUntil=0;
// Both route selectors are populated from the same destination catalog.
for(const [id,value] of [['origin',origin],['destination-select',selected]]){
 const select=document.getElementById(id);
 select.replaceChildren(...cities.map((city,index)=>new Option(`${city.name} · ${city.code}`,String(index),index===value,index===value)));
}
const vec=(lat,lon,r=2)=>new THREE.Vector3(r*Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180),r*Math.sin(lat*Math.PI/180),-r*Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180));
const stage=$('.globe-stage');['.orbital-caption','.globe-controls','.drag-hint'].forEach(s=>stage.appendChild($(s)));
let stageRect;
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){$('#loading').innerHTML='<span>3D rendering is unavailable in this browser.</span><button onclick="this.parentElement.remove()">Explore destinations</button>';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x060a0f,1);$('#space').appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,150);camera.position.z=zoom;
const globe=new THREE.Group();scene.add(globe);
const manager=new THREE.LoadingManager(()=>{ $('#loading').style.opacity='0';setTimeout(()=>$('#loading').remove(),1100); });
manager.onError=()=>{toast('Some planet textures could not load. Destination controls are still available.');$('#loading').style.display='none';};
const loader=new THREE.TextureLoader(manager),day=loader.load('./assets/earth.jpg'),night=loader.load('./assets/night.jpg');
const cloudMap=loader.load('./assets/clouds.png'),normalMap=loader.load('./assets/normal.jpg'),waterMap=loader.load('./assets/specular.jpg');
[day,night,cloudMap,normalMap,waterMap].forEach(texture=>{texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.wrapS=THREE.RepeatWrapping;});
const sunDirection=new THREE.Vector3(-1.1,.45,.65).normalize();
const earthVertex=`varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;varying vec3 vTangent;
void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vTangent=normalize(mat3(modelMatrix)*vec3(sin(uv.x*6.2831853),0.,cos(uv.x*6.2831853)));vPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const earthMaterial=new THREE.ShaderMaterial({uniforms:{dayMap:{value:day},nightMap:{value:night},cloudMap:{value:cloudMap},normalMap:{value:normalMap},waterMap:{value:waterMap},sunDir:{value:sunDirection},cloudShift:{value:0}},vertexShader:earthVertex,fragmentShader:`
uniform sampler2D dayMap;uniform sampler2D nightMap;uniform sampler2D cloudMap;uniform sampler2D normalMap;uniform sampler2D waterMap;uniform vec3 sunDir;uniform float cloudShift;
varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;varying vec3 vTangent;
void main(){
 vec3 n=normalize(vNormal);vec3 eye=normalize(cameraPosition-vPosition);vec3 t=normalize(vTangent);vec3 bitangent=normalize(cross(n,t));
 float water=texture2D(waterMap,vUv).r;
 vec3 detail=texture2D(normalMap,vUv).xyz*2.-1.;detail.xy*=.32*(1.-water);
 vec3 terrain=normalize(t*detail.x+bitangent*detail.y+n*detail.z);
 float solar=dot(n,sunDir);float daylight=smoothstep(-.085,.15,solar);
 vec3 albedo=pow(texture2D(dayMap,vUv).rgb,vec3(2.2));
 float cover=texture2D(cloudMap,vec2(vUv.x-cloudShift,vUv.y)).a;
 float shadow=texture2D(cloudMap,vec2(vUv.x-cloudShift+.002,vUv.y-.001)).a;
 float diffuse=max(dot(terrain,sunDir),0.);
 vec3 color=albedo*(.018+1.1*diffuse)*(1.-shadow*.28*daylight);
 vec3 nightColor=pow(texture2D(nightMap,vUv).rgb,vec3(2.5));
 color+=nightColor*vec3(1.15,.87,.52)*1.5*(1.-smoothstep(-.12,.08,solar))*(1.-cover*.72);
 vec3 halfVector=normalize(sunDir+eye);float reflection=pow(max(dot(n,halfVector),0.),95.);
 float fresnel=.025+.2*pow(1.-max(dot(n,eye),0.),5.);
 color+=vec3(1.,.94,.81)*reflection*water*fresnel*2.5*daylight*(1.-cover);
 float edge=pow(1.-max(dot(n,eye),0.),4.5);
 color+=vec3(.045,.19,.38)*edge*daylight*.35;
 gl_FragColor=vec4(pow(max(color,vec3(0.)),vec3(1./2.2)),1.);
}`});
const earth=new THREE.Mesh(new THREE.SphereGeometry(2,128,96),earthMaterial);globe.add(earth);
const clouds=new THREE.Mesh(new THREE.SphereGeometry(2.012,96,64),new THREE.ShaderMaterial({uniforms:{cloudMap:{value:cloudMap},sunDir:{value:sunDirection}},vertexShader:earthVertex,transparent:true,depthWrite:false,fragmentShader:`
uniform sampler2D cloudMap;uniform vec3 sunDir;varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;
void main(){float coverage=texture2D(cloudMap,vUv).a;if(coverage<.025)discard;float solar=dot(normalize(vNormal),sunDir);float light=max(solar,0.);float twilight=smoothstep(-.12,.12,solar);vec3 color=mix(vec3(.035,.045,.065),vec3(.96,.975,1.)*pow(.14+.86*light,.45),twilight);gl_FragColor=vec4(color,coverage*.88);}` }));globe.add(clouds);
const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(2.035,96,64),new THREE.ShaderMaterial({uniforms:{sunDir:{value:sunDirection}},transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,vertexShader:earthVertex,fragmentShader:`
uniform vec3 sunDir;varying vec3 vNormal;varying vec3 vPosition;
void main(){vec3 n=normalize(vNormal);vec3 view=normalize(cameraPosition-vPosition);float rim=pow(max(0.,.60+dot(n,view)),3.);float sun=smoothstep(-.3,.65,dot(n,sunDir));gl_FragColor=vec4(vec3(.17,.47,.85)*rim*1.7*(.06+.94*sun),1.);}` }));globe.add(atmosphere);
const starPos=new Float32Array(2200*3);for(let i=0;i<2200;i++){const v=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(25+Math.random()*45);starPos.set(v.toArray(),i*3);}const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(starPos,3)),new THREE.PointsMaterial({color:0x88b2c6,size:.035,transparent:true,opacity:.48,sizeAttenuation:true}));scene.add(stars);
// Fine cartographic meridians and parallels, just above the surface.
const gridMat=new THREE.LineBasicMaterial({color:0x487d99,transparent:true,opacity:.028});
for(let lat=-60;lat<=60;lat+=30){let p=[];for(let lon=0;lon<=360;lon+=3)p.push(vec(lat,lon,2.008));globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),gridMat));}
for(let lon=0;lon<360;lon+=30){let p=[];for(let lat=-90;lat<=90;lat+=3)p.push(vec(lat,lon,2.008));globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),gridMat));}
const targetQ=new THREE.Quaternion().setFromUnitVectors(vec(25,70).normalize(),new THREE.Vector3(0,0,1));globe.quaternion.copy(targetQ);
const labels=cities.map((c,i)=>{const el=document.createElement('button');el.className='map-label'+(i===selected?' selected':'');el.textContent=c.name.toUpperCase();el.setAttribute('aria-label','Focus on '+c.name);el.onclick=()=>focusCity(i);$('#labels').appendChild(el);return el;});
let arcs=[],arcGroup=new THREE.Group();globe.add(arcGroup);
function sampleFlight(route,t,target){
 const u=THREE.MathUtils.clamp(t,0,1);
 const startWeight=Math.sin((1-u)*route.angle)/route.sinAngle;
 const endWeight=Math.sin(u*route.angle)/route.sinAngle;
 return target.set(route.start.x*startWeight+route.end.x*endWeight,route.start.y*startWeight+route.end.y*endWeight,route.start.z*startWeight+route.end.z*endWeight).normalize().multiplyScalar(2.025+Math.sin(u*Math.PI)*route.height);
}
const trailPoint=new THREE.Vector3();
function makeRoutes(){
 const previousPhases=new Map(arcs.map(route=>[route.key,route.phase]));
 arcGroup.children.slice().forEach(x=>{x.geometry?.dispose();x.material?.dispose();arcGroup.remove(x);});arcs=[];
 cities.forEach((c,i)=>{
  if(i===origin)return;
  const start=vec(cities[origin].lat,cities[origin].lon).normalize(),end=vec(c.lat,c.lon).normalize(),angle=start.angleTo(end),key=origin+':'+i;
  const route={start,end,angle,sinAngle:Math.sin(angle),height:.25+angle*.25,key,phase:previousPhases.get(key)??((i*.173+origin*.071)%1)};
  const points=[];for(let j=0;j<=256;j++)points.push(sampleFlight(route,j/256,new THREE.Vector3()));
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:i===selected?0xe1f7a5:0x79b9c8,transparent:true,opacity:i===selected?.42:.12}));arcGroup.add(line);
  const positions=new THREE.BufferAttribute(new Float32Array(24*3),3);positions.setUsage(THREE.DynamicDrawUsage);
  const colors=new Float32Array(24*3),color=new THREE.Color(i===selected?0xe4ffab:0xa0e2ed);
  for(let j=0;j<24;j++){const intensity=Math.pow(j/23,1.5);colors[j*3]=color.r*intensity;colors[j*3+1]=color.g*intensity;colors[j*3+2]=color.b*intensity;}
  const geometry=new THREE.BufferGeometry().setAttribute('position',positions).setAttribute('color',new THREE.BufferAttribute(colors,3));
  const trail=new THREE.Line(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));trail.frustumCulled=false;arcGroup.add(trail);
  const particle=new THREE.Mesh(new THREE.SphereGeometry(.013,8,8),new THREE.MeshBasicMaterial({color:0xe8ffc2,transparent:true,depthWrite:false}));arcGroup.add(particle);
  arcs.push({...route,trail,particle});
 });
}
makeRoutes();
function distance(a,b){return vec(a.lat,a.lon).normalize().angleTo(vec(b.lat,b.lon).normalize())*6371;}
function fahrenheit(celsius){return Math.round(celsius*9/5+32)+'°F';}
function sampleFare(){return selected===origin?null:Math.round(cities[selected].price*.87);}
function updateInfo(){const c=cities[selected],o=cities[origin];$('#destination-select').value=String(selected);$('#city').textContent=c.name;$('#country').textContent=c.country.toUpperCase();$('#index').textContent=`${String(selected+1).padStart(2,'0')} / ${String(cities.length).padStart(2,'0')}`;$('#description').innerText=c.desc;$('#dest-code').textContent=c.code;$('#dest-name').textContent=c.name;$('#origin-code').textContent=o.code;$('#origin-name').textContent=o.name;const hours=distance(o,c)/850+1;$('#duration').textContent=selected===origin?'Your departure city':`${Math.floor(hours)}h ${String(Math.round((hours%1)*60)).padStart(2,'0')}m · ${hours>16?'1 stop':'nonstop'}`;$('#price').innerHTML=`$${sampleFare()??'—'}<small> USD</small>`;$('#weather').textContent=`☀  ${fahrenheit(c.temp)}`;$('#local').textContent=new Intl.DateTimeFormat('en-US',{timeZone:c.tz,hour:'2-digit',minute:'2-digit'}).format(new Date())+' LOCAL';$('#explore').innerHTML=`Explore ${c.name} <span>↗</span>`;$('#coords').textContent=`${Math.abs(c.lat).toFixed(2)}° ${c.lat>=0?'N':'S'}   ${Math.abs(c.lon).toFixed(2)}° ${c.lon>=0?'E':'W'}`;labels.forEach((e,i)=>e.classList.toggle('selected',selected===i));document.querySelectorAll('.trend-item').forEach(e=>e.classList.toggle('active',Number(e.dataset.city)===selected));$('#destination').classList.remove('materialize');void $('#destination').offsetWidth;$('#destination').classList.add('materialize');}
function focusCity(i,fromTour=false){if(!fromTour)stopTour();selected=i;velocity={x:0,y:0};targetQ.setFromUnitVectors(vec(cities[i].lat,cities[i].lon).normalize(),new THREE.Vector3(-.08,.05,1).normalize());focusUntil=performance.now()+2400;targetZoom=5.8;updateInfo();makeRoutes();tone(210+i*40);}
['HND','MUC','DUB','LIH','SYD'].map(code=>cities.findIndex(city=>city.code===code)).forEach(i=>{const c=cities[i],b=document.createElement('button');b.className='trend-item'+(i===selected?' active':'');b.dataset.city=i;b.innerHTML=`<span class="trend-top">${c.code} <b>+${c.trend}%</b></span><span class="trend-city">${c.name}</span><span class="trend-bottom">${fahrenheit(c.temp)} <strong>from $${c.price}</strong></span>`;b.onclick=()=>focusCity(i);$('#trend-list').appendChild(b);});
$('#destination-select').onchange=e=>focusCity(Number(e.target.value));
$('#origin').onchange=e=>{origin=Number(e.target.value);updateInfo();makeRoutes();};
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();stageRect=stage.getBoundingClientRect();}
addEventListener('resize',resize);new ResizeObserver(resize).observe(stage);resize();
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{if(tour)stopTour();drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);focusUntil=0;});
canvas.addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;if(drag){velocity.y=(e.clientX-drag.x)*.003;velocity.x=(e.clientY-drag.y)*.003;const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(velocity.x,velocity.y,0));globe.quaternion.premultiply(q);targetQ.copy(globe.quaternion);drag={x:e.clientX,y:e.clientY};}});
function endDrag(){drag=null;}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault();targetZoom=THREE.MathUtils.clamp(targetZoom+e.deltaY*.003,4.5,8);},{passive:false});
$('#zoom-in').onclick=()=>targetZoom=Math.max(4.5,targetZoom-.55);$('#zoom-out').onclick=()=>targetZoom=Math.min(8,targetZoom+.55);
$('#reset').onclick=()=>{stopTour();targetZoom=6.25;targetQ.setFromUnitVectors(vec(25,70).normalize(),new THREE.Vector3(0,0,1));focusUntil=performance.now()+2000;};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Resume orbit':'Pause orbit');};
let tourIndex=0;const tourOrder=['SYD','HND','MUC','LAX','LIH'].map(code=>cities.findIndex(city=>city.code===code));function stopTour(){sunDirection.set(-1.1,.45,.65).normalize();tour=false;clearInterval(tourTimer);$('#sun').innerHTML='<span>☀</span> Chase the sun <span class="play">▷</span>';$('#sun-note').textContent='A journey along the golden hour.';}
$('#sun').onclick=()=>{if(tour){stopTour();return;}tour=true;tourIndex=0;$('#sun').innerHTML='<span>☀</span> Chasing the sun <span class="play">Ⅱ</span>';const step=()=>{let i=tourOrder[tourIndex++%tourOrder.length];focusCity(i,true);$('#sun-note').textContent=`GOLDEN HOUR ${String((tourIndex-1)%5+1).padStart(2,'0')} / 05 · ${cities[i].name}`;earthMaterial.uniforms.sunDir.value.set(-1,.2,.3).normalize();};step();tourTimer=setInterval(step,6500);};
let audioCtx,gain;function tone(freq){if(!audioCtx||audioCtx.state!=='running')return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.035,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.8);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.9);}
$('#sound').onclick=async()=>{if(!audioCtx){audioCtx=new AudioContext();gain=audioCtx.createGain();gain.gain.value=.022;gain.connect(audioCtx.destination);[55,82.41,110.2].forEach(f=>{let o=audioCtx.createOscillator();o.frequency.value=f;o.connect(gain);o.start();});}else if(audioCtx.state==='running'){await audioCtx.suspend();}else{await audioCtx.resume();}const on=audioCtx.state==='running';$('#sound').style.color=on?'var(--acid)':'';$('#sound').setAttribute('aria-label',on?'Mute ambient sound':'Enable ambient sound');toast(on?'Ambient sound on':'Ambient sound off');};
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2800);}
$('#explore').onclick=()=>{if(tour)stopTour();const c=cities[selected];$('#detail').classList.add('destination-modal');$('#detail-photo').src=destinationPhotos[c.name.toLowerCase().replaceAll(' ','-')];$('#detail-photo').alt=c.photoAlt;$('#detail-kicker').textContent=c.country+' · '+c.code;$('#detail-title').textContent=c.name;$('#detail-copy').textContent=c.notes;$('#detail-temp').textContent=fahrenheit(c.temp);$('#detail-condition').textContent=c.condition;$('#itinerary').innerHTML=c.stops.map((s,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><div>${s}</div></div>`).join('');$('#detail-route-codes').textContent=cities[origin].code+' ⟶ '+c.code;$('#detail-route-time').textContent=$('#duration').textContent;$('#save').hidden=false;$('#save').textContent='Save journey';$('#detail-price').textContent=sampleFare()===null?'—':'$'+sampleFare();$('#golden-hour-label').textContent='Meet '+c.name+' at golden hour';$('#detail').showModal();};
$('#detail-golden-hour').onclick=()=>{$('#detail').close();focusCity(selected);sunDirection.set(-1,.2,.3).normalize();targetZoom=5.25;$('#sun-note').textContent='Golden hour · '+cities[selected].name;toast('Golden hour in '+cities[selected].name);};
$('#edit-trip').onclick=()=>{$('#detail').close();$('#destination-select').focus();};
$('#detail .close').onclick=()=>$('#detail').close();$('#detail').onclick=e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#detail').close();}};
$('#save').onclick=()=>{const c=cities[selected];const blob=new Blob([`COMPASS / ${c.name}\n\n${c.notes}\n\n${c.stops.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\nFictional sample itinerary. Prices and weather in this atlas are simulated.`],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`compass-${c.name.toLowerCase().replaceAll(' ','-')}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('#save').textContent='Journey downloaded';};
$('#about').onclick=()=>{$('#detail').classList.remove('destination-modal');$('#detail-kicker').textContent='COMPASS / THE ATLAS';$('#detail-title').textContent='A different perspective.';$('#detail-copy').textContent='An interactive travel atlas for the joy of discovery. Drag the Earth to explore, select a city to get closer, or chase the sun on a five-stop golden-hour journey. Every fare, weather reading, trend, and flight count is illustrative—not a live booking offer.';$('#itinerary').innerHTML='<div><span>EARTH</span><div>NASA Blue Marble and night imagery via three-globe; cloud, terrain, and ocean maps from the Three.js examples. Clouds are illustrative, not live weather.</div></div><div><span>CONTROLS</span><div>Drag to orbit · Scroll to zoom · Use destination buttons for keyboard navigation.</div></div>';$('#save').hidden=true;$('#detail').showModal();};
updateInfo();setInterval(()=>{$('#utc').textContent=new Date().toISOString().slice(11,19)+' UTC';},1000);
let last=0;function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;const mobile=innerWidth<=800;zoom=THREE.MathUtils.lerp(zoom,targetZoom,.04);const area=stageRect;const usableH=Math.max(70,area.height-100);const radius=Math.max(40,Math.min(area.width*.46,usableH*.46));const unit=innerHeight/(2*Math.tan(43*Math.PI/360));camera.position.z=Math.max(6.25,unit*2.8/radius)*(zoom/6.25);camera.position.x=THREE.MathUtils.lerp(camera.position.x,pointer.x*.10,.025);camera.position.y=THREE.MathUtils.lerp(camera.position.y,-pointer.y*.08,.025);
const pxPerUnit=unit/camera.position.z;globe.position.x=(area.left+area.width/2-innerWidth/2)/pxPerUnit;globe.position.y=(innerHeight/2-(area.top+32+usableH/2))/pxPerUnit;
if(!drag){if(now<focusUntil){globe.quaternion.slerp(targetQ,reduced?1:.035);}else if(!paused){velocity.x*=.96;velocity.y*=.96;globe.quaternion.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(velocity.x,velocity.y+dt*.015,0)));}}stars.rotation.y=reduced?0:now*.000002;if(!paused&&!reduced){clouds.rotation.y+=dt*.006;}earthMaterial.uniforms.cloudShift.value=clouds.rotation.y/(Math.PI*2);
arcs.forEach(route=>{
 if(!paused&&!reduced)route.phase=(route.phase+dt*.035)%1;
 const head=route.phase*1.10;
 const fade=THREE.MathUtils.smoothstep(head,0,.025)*(1-THREE.MathUtils.smoothstep(head,1,1.10));
 sampleFlight(route,head,route.particle.position);
 route.particle.material.opacity=1-THREE.MathUtils.smoothstep(head,.975,1);
 route.trail.material.opacity=.7*fade;
 const positions=route.trail.geometry.attributes.position;
 for(let j=0;j<24;j++){sampleFlight(route,head-.10+(j/23)*.10,trailPoint);positions.setXYZ(j,trailPoint.x,trailPoint.y,trailPoint.z);}
 positions.needsUpdate=true;
});
globe.updateMatrixWorld();cities.forEach((c,i)=>{const point=vec(c.lat,c.lon,2.04).applyMatrix4(globe.matrixWorld);const normal=point.clone().sub(globe.position).normalize();const visible=normal.dot(camera.position.clone().sub(point).normalize())>.10;const p=point.project(camera);const x=(p.x*.5+.5)*innerWidth,y=(-p.y*.5+.5)*innerHeight;const available=x>area.left+5&&x<area.right-90&&y>area.top+30&&y<area.bottom-75;labels[i].style.display=visible&&available?'flex':'none';labels[i].style.left=x+'px';labels[i].style.top=y+'px';});renderer.render(scene,camera);}
requestAnimationFrame(animate);
