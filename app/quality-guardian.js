const SAFE_TARGET=/^[a-z0-9:_-]{1,100}$/i;

export const RECOVERY_CONTRACT=Object.freeze({
  explain:true,preserveAttempt:true,retry:true,defer:true,resume:true,completionEvidence:true
});

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
