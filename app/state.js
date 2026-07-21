const KEY='xdbs2-state';
export const defaults={name:'Commander',homeLocation:'Location not set',workLocation:'Not set',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,greeting:'direct',theme:'midnight',motion:'system',sports:'',news:'business, technology, world',markets:'energy, rates, materials',entertainment:'film, music, long-form',academyPriorities:'AI, Financial Intelligence, Spanish',travelMode:false,privacy:'local',hiddenModules:[],completed:[],saved:[],dismissed:[],notes:'',academy:{}};
export function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state))}
export function reset(){localStorage.removeItem(KEY);location.reload()}
