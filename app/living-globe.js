const POINTS=[
  {name:'Danbury',country:'United States',relationship:'Home',lat:41.3948,lng:-73.454,timeZone:'America/New_York',region:'Americas'},
  {name:'Suffern',country:'United States',relationship:'Checkmate · Work',lat:41.1148,lng:-74.1496,timeZone:'America/New_York',region:'Americas'},
  {name:'Nanuet',country:'United States',relationship:'Artcraft Kitchen & Design',lat:41.0887,lng:-74.0135,timeZone:'America/New_York',region:'Americas'},
  {name:'Pearl River',country:'United States',relationship:'A Cut Above',lat:41.0589,lng:-74.0218,timeZone:'America/New_York',region:'Americas'},
  {name:'Kankakee',country:'United States',relationship:'Personal connection',lat:41.1200,lng:-87.8612,timeZone:'America/Chicago',region:'Americas'},
  {name:'Chicago',country:'United States',relationship:'Personal connection',lat:41.8781,lng:-87.6298,timeZone:'America/Chicago',region:'Americas'},
  {name:'Stone Mountain',country:'United States',relationship:'Personal connection',lat:33.8082,lng:-84.1702,timeZone:'America/New_York',region:'Americas'},
  {name:'Atlanta',country:'United States',relationship:'Personal connection',lat:33.7490,lng:-84.3880,timeZone:'America/New_York',region:'Americas'},
  {name:'Los Angeles',country:'United States',relationship:'Personal connection',lat:34.0522,lng:-118.2437,timeZone:'America/Los_Angeles',region:'Americas'},
  {name:'Las Vegas',country:'United States',relationship:'Personal connection',lat:36.1699,lng:-115.1398,timeZone:'America/Los_Angeles',region:'Americas'},
  {name:'Dallas',country:'United States',relationship:'Personal connection',lat:32.7767,lng:-96.7970,timeZone:'America/Chicago',region:'Americas'},
  {name:'Toronto',country:'Canada',relationship:'Personal connection',lat:43.6532,lng:-79.3832,timeZone:'America/Toronto',region:'Americas'},
  {name:'Mexico City',country:'Mexico',relationship:'Personal connection',lat:19.4326,lng:-99.1332,timeZone:'America/Mexico_City',region:'Americas'},
  {name:'São Paulo',country:'Brasil',relationship:'Brasil · Personal connection',lat:-23.5505,lng:-46.6333,timeZone:'America/Sao_Paulo',region:'Americas'},
  {name:'Stroud',country:'United Kingdom',relationship:'Home · Faith',lat:51.7457,lng:-2.2178,timeZone:'Europe/London',region:'Europe'},
  {name:'London',country:'United Kingdom',relationship:'UK gateway',lat:51.5072,lng:-0.1276,timeZone:'Europe/London',region:'Europe'},
  {name:'Paris',country:'France',relationship:'Personal connection',lat:48.8566,lng:2.3522,timeZone:'Europe/Paris',region:'Europe'},
  {name:'San Juan',country:'Puerto Rico',relationship:'Moments Go Round · D Ellie AIrt · Mimosa Mi',lat:18.4655,lng:-66.1057,timeZone:'America/Puerto_Rico',region:'Americas'},
  {name:'Panama City',country:'Panama',relationship:'Checkmate Panama · Biotile · Renfro Pro',lat:8.9824,lng:-79.5199,timeZone:'America/Panama',region:'Americas'},
  {name:'Veracruz Beach',country:'Panama',relationship:'Vera Cruz',lat:8.8894,lng:-79.6268,timeZone:'America/Panama',region:'Americas'},
  {name:'Dubai',country:'United Arab Emirates',relationship:'World lens',lat:25.2048,lng:55.2708,timeZone:'Asia/Dubai',region:'Asia'},
  {name:'Abu Dhabi',country:'United Arab Emirates',relationship:'Personal connection',lat:24.4539,lng:54.3773,timeZone:'Asia/Dubai',region:'Asia'},
  {name:'Bangkok',country:'Thailand',relationship:'Thailand · Personal connection',lat:13.7563,lng:100.5018,timeZone:'Asia/Bangkok',region:'Asia'},
  {name:'Tokyo',country:'Japan',relationship:'Personal connection',lat:35.6762,lng:139.6503,timeZone:'Asia/Tokyo',region:'Asia'},
  {name:'Singapore',country:'Singapore',relationship:'World lens',lat:1.3521,lng:103.8198,timeZone:'Asia/Singapore',region:'Asia'},
  {name:'Sydney',country:'Australia',relationship:'Personal connection',lat:-33.8688,lng:151.2093,timeZone:'Australia/Sydney',region:'Oceania'},
  {name:'Lagos',country:'Nigeria',relationship:'Personal connection',lat:6.5244,lng:3.3792,timeZone:'Africa/Lagos',region:'Africa'},
  {name:'Johannesburg',country:'South Africa',relationship:'South Africa · Personal connection',lat:-26.2041,lng:28.0473,timeZone:'Africa/Johannesburg',region:'Africa'}
];
const VIEWS={Americas:{lat:22,lng:-76,altitude:1.8},Europe:{lat:42,lng:18,altitude:1.75},Asia:{lat:28,lng:82,altitude:1.8},Africa:{lat:4,lng:22,altitude:1.85},Oceania:{lat:-20,lng:142,altitude:1.9}};
const WEATHER={0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorm',96:'Storm with hail',99:'Storm with hail'};
let globe;
const shell=document.querySelector('#living-globe-shell'),mount=document.querySelector('#living-globe'),status=document.querySelector('#globe-state'),readout=document.querySelector('#globe-weather');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const localTime=p=>new Intl.DateTimeFormat([],{timeZone:p.timeZone,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date());
function earthStatus(text){if(status)status.textContent=text}
function fallback(){shell?.classList.add('fallback-active');earthStatus('EARTH SYNC · CINEMATIC FALLBACK')}
function syncSun(){const d=new Date(),h=d.getUTCHours()+d.getUTCMinutes()/60;shell?.style.setProperty('--sun-angle',`${h/24*360-90}deg`)}
async function selectPoint(point){
  readout.innerHTML=`<small>${point.relationship} · REQUESTED</small><strong>${point.name}</strong><span>Retrieving current conditions…</span>`;
  globe?.pointOfView({lat:point.lat,lng:point.lng,altitude:1.45},850);
  try{
    const key=`xen-weather-${point.name}`,saved=JSON.parse(sessionStorage.getItem(key)||'null'),fresh=saved&&Date.now()-saved.at<600000;
    const data=fresh?saved.data:await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`).then(r=>{if(!r.ok)throw Error();return r.json()});
    if(!fresh)sessionStorage.setItem(key,JSON.stringify({at:Date.now(),data}));
    const c=data.current;
    readout.innerHTML=`<small>${point.relationship} · LIVE ${fresh?'CACHE <10 MIN':'OPEN-METEO'} · ${localTime(point)}</small><strong>${point.name} · ${Math.round(c.temperature_2m)}°F</strong><span>${WEATHER[c.weather_code]||'Current conditions'} · Feels ${Math.round(c.apparent_temperature)}° · Wind ${Math.round(c.wind_speed_10m)} mph</span>`;
    earthStatus(`EARTH SYNC · ${point.name.toUpperCase()} LIVE`);
  }catch{
    readout.innerHTML=`<small>${point.relationship} · WEATHER UNAVAILABLE</small><strong>${point.name} · ${localTime(point)}</strong><span>The live feed could not be reached. Earth interaction remains available.</span>`;
    earthStatus('EARTH SYNC · WEATHER OFFLINE');
  }
}
function boot(){
  if(!mount||!shell)return;
  if(typeof window.Globe!=='function'){fallback();return}
  globe=window.Globe()(mount).backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img/earth-night.jpg')
    .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img/earth-topology.png')
    .showAtmosphere(true).atmosphereColor('#62cfff').atmosphereAltitude(.17)
    .pointsData(POINTS).pointLat('lat').pointLng('lng').pointAltitude(.012).pointRadius(.25).pointColor(()=> '#8be9ff')
    .pointLabel(p=>`<b>${p.name}</b><br>${p.relationship}<br>${p.country} · ${localTime(p)}<br>Touch for live weather`).onPointClick(selectPoint);
  const resize=()=>globe.width(shell.clientWidth).height(shell.clientHeight);new ResizeObserver(resize).observe(shell);resize();
  globe.pointOfView(VIEWS.Europe,0);const controls=globe.controls();controls.autoRotate=!reduced;controls.autoRotateSpeed=.32;controls.enableDamping=true;controls.dampingFactor=.08;
  shell.classList.add('globe-ready');earthStatus(reduced?'EARTH SYNC · MOTION REDUCED':'EARTH SYNC · ROTATING LIVE');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(b&&globe&&VIEWS[b.dataset.region])globe.pointOfView(VIEWS[b.dataset.region],900)});
syncSun();setInterval(syncSun,60000);
let attempt=0;const wait=setInterval(()=>{attempt+=1;if(typeof window.Globe==='function'||attempt>30){clearInterval(wait);boot()}},100);
