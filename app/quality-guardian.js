const SAFE_TARGET=/^[a-z0-9:_-]{1,100}$/i;

export const RECOVERY_CONTRACT=Object.freeze({
  explain:true,preserveAttempt:true,retry:true,defer:true,resume:true,completionEvidence:true
});

export const SURFACE_REGISTRY=Object.freeze([
  {id:'navigation',selector:'body',controls:'#deck-back,#deck-next,#deck-index-button,#tutorial-launch',minimumControls:4,recovery:'scene-index'},
  {id:'today',selector:'#scene-today',controls:'button,a[href]',minimumControls:2,recovery:'command-deck-index'},
  {id:'integration',selector:'#scene-integration',controls:'[data-process],[data-process-advance]',minimumControls:2,recovery:'reset-local-run'},
  {id:'academy',selector:'#scene-academy',controls:'[data-course],[data-lesson-submit],[data-lesson-pause]',minimumControls:4,recovery:'retry-hint-defer-resume'},
  {id:'globe',selector:'#scene-globe',controls:'[data-region],[data-globe-point]',minimumControls:1,recovery:'image-and-offline-fallback'},
  {id:'intelligence',selector:'#scene-intelligence',controls:'[data-filter],a[href]',minimumControls:1,recovery:'degraded-source-state'},
  {id:'water-cooler',selector:'#scene-water-cooler',controls:'button,a[href]',minimumControls:0,recovery:'read-only-briefing'},
  {id:'markets',selector:'#scene-markets',controls:'button,a[href]',minimumControls:0,recovery:'read-only-metrics'},
  {id:'media',selector:'#scene-xmi',controls:'a[href],[data-save],[data-dismiss],[data-preview]',minimumControls:1,recovery:'direct-link-and-close'},
  {id:'mission',selector:'#scene-mission',controls:'[data-complete],#mission-notes',minimumControls:2,recovery:'local-save-and-toggle'},
  {id:'evolution',selector:'#scene-evolution',controls:'button,a[href]',minimumControls:0,recovery:'truth-state-display'},
  {id:'radar',selector:'#scene-radar',controls:'button,a[href]',minimumControls:0,recovery:'read-only-decision-field'},
  {id:'timeline',selector:'#scene-timeline',controls:'[data-complete]',minimumControls:1,recovery:'reversible-local-toggle'},
  {id:'archive',selector:'#scene-archive',controls:'a[href]',minimumControls:1,recovery:'degraded-manifest-state'},
  {id:'warden',selector:'#scene-warden',controls:'a[href]',minimumControls:1,recovery:'truth-state-evidence'},
  {id:'voice',selector:'#voice-assessment-runtime',controls:'button',minimumControls:1,recovery:'deny-retry-delete-disable'}
]);

export function sanitizeControlTarget(value='unknown'){
  const target=String(value).trim().toLowerCase().replace(/[^a-z0-9:_-]+/g,'-').slice(0,100);
  return SAFE_TARGET.test(target)?target:'unknown';
}

export function auditRecoveryResult(result){
  const missing=[];
  if(!result?.feedback)missing.push('explanation');
  if(result?.passed===false&&!result.canRetry)missing.push('retry');
  if(result?.passed===false&&!result.recovery)missing.push('recovery-route');
  return{passed:missing.length===0,missing};
}

export function auditInteractiveControls(root=document){
  return [...root.querySelectorAll('button,a[href],input,textarea,select,[role="button"]')].map(control=>{
    const label=(control.getAttribute('aria-label')||control.textContent||control.getAttribute('name')||control.id||'').trim();
    const actionable=control.matches('a[href],input,textarea,select')||control.disabled||[...control.attributes].some(attr=>attr.name.startsWith('data-'))||Boolean(control.id);
    return{target:sanitizeControlTarget(control.dataset.action||control.id||control.tagName),labelled:Boolean(label),actionable};
  });
}

export function summarizeControlAudit(items){
  const failures=items.filter(item=>!item.labelled||!item.actionable);
  return{total:items.length,passed:failures.length===0,failures};
}

export function auditLinks(root=document){
  return [...root.querySelectorAll('a[href]')].map(link=>{
    const href=link.getAttribute('href')||'';
    const external=/^https?:/i.test(href);
    const safeExternal=!external||(link.getAttribute('target')==='_blank'&&/\bnoopener\b/.test(link.getAttribute('rel')||''));
    return{target:sanitizeControlTarget(link.dataset.outbound||link.textContent||'link'),hrefPresent:Boolean(href.trim()),safeExternal};
  });
}

export function auditMedia(root=document){
  return [...root.querySelectorAll('video,audio,iframe')].map(media=>({
    target:sanitizeControlTarget(media.id||media.getAttribute('title')||media.tagName),
    labelled:media.tagName==='IFRAME'?Boolean(media.getAttribute('title')):Boolean(media.getAttribute('aria-label')||media.getAttribute('title')),
    controllable:media.tagName==='IFRAME'||media.hasAttribute('controls')
  }));
}

export function auditSurfaceCoverage(root=document,registry=SURFACE_REGISTRY){
  return registry.map(contract=>{
    const surface=root.querySelector(contract.selector);
    if(!surface)return{id:contract.id,present:false,passed:false,controlCount:0,recovery:contract.recovery};
    const controls=[...surface.querySelectorAll(contract.controls)];
    const audit=summarizeControlAudit(auditInteractiveControls({
      querySelectorAll:selector=>controls.filter(control=>control.matches(selector))
    }));
    const enoughControls=controls.length>=(contract.minimumControls??1);
    return{id:contract.id,present:true,passed:audit.passed&&enoughControls,controlCount:controls.length,minimumControls:contract.minimumControls??1,recovery:contract.recovery,failures:audit.failures};
  });
}

export function runQualitySweep(root=document,registry=SURFACE_REGISTRY){
  const controls=summarizeControlAudit(auditInteractiveControls(root));
  const links=auditLinks(root);
  const media=auditMedia(root);
  const surfaces=auditSurfaceCoverage(root,registry);
  const findings=[
    ...controls.failures.map(item=>({code:'control-contract',context:item.target})),
    ...links.filter(item=>!item.hrefPresent||!item.safeExternal).map(item=>({code:'link-contract',context:item.target})),
    ...media.filter(item=>!item.labelled||!item.controllable).map(item=>({code:'media-contract',context:item.target})),
    ...surfaces.filter(item=>!item.passed).map(item=>({code:'surface-contract',context:item.id}))
  ];
  return{passed:findings.length===0,controls,links,media,surfaces,findings};
}

export function observeQuality(root=document,onSweep=()=>{}){
  let pending=false;
  const sweep=()=>{pending=false;onSweep(runQualitySweep(root))};
  const schedule=()=>{if(!pending){pending=true;queueMicrotask(sweep)}};
  const observer=new MutationObserver(schedule);
  observer.observe(root.documentElement||root,{subtree:true,childList:true,attributes:true,attributeFilter:['href','disabled','aria-label','title']});
  schedule();
  return()=>observer.disconnect();
}
