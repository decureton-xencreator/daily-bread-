const POINTS=[
  {name:'Northeast US',country:'United States',relationship:'Declared region',lat:41,lng:-73,timeZone:'America/New_York',region:'Americas'},
  {name:'New York',country:'United States',relationship:'World city',lat:40.7128,lng:-74.006,timeZone:'America/New_York',region:'Americas'},
  {name:'Chicago',country:'United States',relationship:'World city',lat:41.8781,lng:-87.6298,timeZone:'America/Chicago',region:'Americas'},
  {name:'Atlanta',country:'United States',relationship:'World city',lat:33.749,lng:-84.388,timeZone:'America/New_York',region:'Americas'},
  {name:'Los Angeles',country:'United States',relationship:'World city',lat:34.0522,lng:-118.2437,timeZone:'America/Los_Angeles',region:'Americas'},
  {name:'Dallas',country:'United States',relationship:'World city',lat:32.7767,lng:-96.797,timeZone:'America/Chicago',region:'Americas'},
  {name:'Toronto',country:'Canada',relationship:'World city',lat:43.6532,lng:-79.3832,timeZone:'America/Toronto',region:'Americas'},
  {name:'Mexico City',country:'Mexico',relationship:'World city',lat:19.4326,lng:-99.1332,timeZone:'America/Mexico_City',region:'Americas'},
  {name:'São Paulo',country:'Brazil',relationship:'World city',lat:-23.5505,lng:-46.6333,timeZone:'America/Sao_Paulo',region:'Americas'},
  {name:'San Juan',country:'Puerto Rico',relationship:'World city',lat:18.4655,lng:-66.1057,timeZone:'America/Puerto_Rico',region:'Americas'},
  {name:'Panama City',country:'Panama',relationship:'World city',lat:8.9824,lng:-79.5199,timeZone:'America/Panama',region:'Americas'},
  {name:'Southern England',country:'United Kingdom',relationship:'Declared region',lat:51.5,lng:-1.5,timeZone:'Europe/London',region:'Europe'},
  {name:'London',country:'United Kingdom',relationship:'World city',lat:51.5072,lng:-0.1276,timeZone:'Europe/London',region:'Europe'},
  {name:'Paris',country:'France',relationship:'World city',lat:48.8566,lng:2.3522,timeZone:'Europe/Paris',region:'Europe'},
  {name:'Dubai',country:'United Arab Emirates',relationship:'World city',lat:25.2048,lng:55.2708,timeZone:'Asia/Dubai',region:'Asia'},
  {name:'Bangkok',country:'Thailand',relationship:'World city',lat:13.7563,lng:100.5018,timeZone:'Asia/Bangkok',region:'Asia'},
  {name:'Tokyo',country:'Japan',relationship:'World city',lat:35.6762,lng:139.6503,timeZone:'Asia/Tokyo',region:'Asia'},
  {name:'Singapore',country:'Singapore',relationship:'World city',lat:1.3521,lng:103.8198,timeZone:'Asia/Singapore',region:'Asia'},
  {name:'Sydney',country:'Australia',relationship:'World city',lat:-33.8688,lng:151.2093,timeZone:'Australia/Sydney',region:'Oceania'},
  {name:'Lagos',country:'Nigeria',relationship:'World city',lat:6.5244,lng:3.3792,timeZone:'Africa/Lagos',region:'Africa'},
  {name:'Johannesburg',country:'South Africa',relationship:'World city',lat:-26.2041,lng:28.0473,timeZone:'Africa/Johannesburg',region:'Africa'}
];
const VIEWS={Americas:{lat:22,lng:-76,altitude:1.8},Europe:{lat:42,lng:18,altitude:1.75},Asia:{lat:28,lng:82,altitude:1.8},Africa:{lat:4,lng:22,altitude:1.85},Oceania:{lat:-20,lng:142,altitude:1.9}};
const WEATHER={0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorm',96:'Storm with hail',99:'Storm with hail'};
let globe;
const shell=document.querySelector('#living-globe-shell'),mount=document.querySelector('#living-globe'),status=document.querySelector('#globe-state'),readout=document.querySelector('#globe-weather');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const localTime=p=>new Intl.DateTimeFormat([],{timeZone:p.timeZone,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date());
function earthStatus(text){if(status)status.textContent=text}
function seasonFor(latitude,declination){
  const north=declination>=0,summer=latitude>=0?north:!north;
  return summer?'SUMMER ARC':'WINTER ARC';
}
export function earthTelemetry(date=new Date(),latitude=41.3948){
  const dayStart=Date.UTC(date.getUTCFullYear(),0,0),day=(date-dayStart)/86400000;
  const utc=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
  const axialTilt=23.4393;
  const declination=axialTilt*Math.sin((2*Math.PI/365.2422)*(day-80));
  const equation=9.87*Math.sin(2*(2*Math.PI/365.2422*(day-81)))-7.53*Math.cos(2*Math.PI/365.2422*(day-81))-1.5*Math.sin(2*Math.PI/365.2422*(day-81));
  const subsolarLongitude=-(utc*15+equation/4-180);
  const earthRotation=(utc/24)*360;
  return{utc,day,axialTilt,declination,subsolarLongitude,earthRotation,season:seasonFor(latitude,declination)};
}
function applyEarthTelemetry(date=new Date()){
  const earth=earthTelemetry(date);
  document.documentElement.style.setProperty('--earth-phase',`${earth.earthRotation}deg`);
  document.documentElement.style.setProperty('--earth-axis',`${-earth.axialTilt}deg`);
  shell?.style.setProperty('--sun-angle',`${earth.earthRotation-90}deg`);
  shell?.style.setProperty('--solar-latitude',`${earth.declination}deg`);
  shell?.style.setProperty('--solar-longitude',`${earth.subsolarLongitude}deg`);
  const orbital=document.querySelector('#globe-orbit-readout');
  if(orbital)orbital.innerHTML=`<b>UTC EARTH ${new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date)}</b><span>AXIS ${earth.axialTilt.toFixed(2)}° · SUN ${earth.declination>=0?'+':''}${earth.declination.toFixed(1)}° · ${earth.season}</span>`;
  return earth;
}
function fallback(){shell?.classList.add('fallback-active');earthStatus(reduced?'EARTH SYNC · TIME-LOCKED · MOTION REDUCED':'EARTH SYNC · TIME-LOCKED FALLBACK · ROTATING')}
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
  const earth=applyEarthTelemetry();globe.pointOfView({lat:earth.declination,lng:-earth.earthRotation,altitude:1.82},0);
  const controls=globe.controls();controls.autoRotate=!reduced;controls.autoRotateSpeed=.32;controls.enableDamping=true;controls.dampingFactor=.08;
  shell.classList.add('globe-ready');earthStatus(reduced?`EARTH SYNC · UTC LOCKED · ${earth.season} · MOTION REDUCED`:`EARTH SYNC · UTC LOCKED · ${earth.season} · ROTATING`);
  selectPoint(POINTS[0]);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(b&&globe&&VIEWS[b.dataset.region])globe.pointOfView(VIEWS[b.dataset.region],900)});
applyEarthTelemetry();setInterval(()=>applyEarthTelemetry(),1000);
let attempt=0;const wait=setInterval(()=>{attempt+=1;if(typeof window.Globe==='function'||attempt>30){clearInterval(wait);boot()}},100);
