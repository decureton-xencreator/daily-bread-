import{commands}from'./commands.js';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function bootCommandDeck(){
  const scenes=[$('#today'),...$$('.content > section.module')].filter(Boolean);
  if(!scenes.length)return;
  scenes.forEach((scene,index)=>{
    scene.classList.add('deck-scene');
    scene.dataset.deckScene=String(index);
    scene.tabIndex=-1;
    if(!scene.id)scene.id=`deck-${scene.dataset.module||index}`;
  });
  const labels=scenes.map(scene=>scene.querySelector('h1,h2')?.textContent.trim()||scene.dataset.module||'Scene');
  const list=$('#deck-scene-list');
  list.innerHTML=scenes.map((scene,index)=>`<button type="button" data-deck-jump="${index}"><i>${String(index+1).padStart(2,'0')}</i><span>${labels[index]}</span><small>${scene.dataset.module||'orientation'}</small></button>`).join('');
  let active=Math.max(0,scenes.findIndex(scene=>`#${scene.id}`===location.hash));
  const available=()=>scenes.filter(scene=>!scene.hidden);
  const render=(focus=false)=>{
    const visible=available();
    if(!visible.includes(scenes[active]))active=scenes.indexOf(visible[0]||scenes[0]);
    const current=scenes[active],position=Math.max(0,visible.indexOf(current));
    scenes.forEach((scene,index)=>scene.classList.toggle('active',index===active));
    $$('[data-deck-jump]').forEach((button,index)=>button.classList.toggle('active',index===active));
    $('#deck-progress').style.width=`${((position+1)/visible.length)*100}%`;
    $('#deck-counter').textContent=`${String(position+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`;
    $('#deck-scene-label').textContent=`${String(position+1).padStart(2,'0')} · ${labels[active].toUpperCase()}`;
    $('#deck-back').disabled=position===0;
    $('#deck-next').disabled=position===visible.length-1;
    history.replaceState(null,'',`#${current.id}`);
    if(focus)current.focus({preventScroll:true});
  };
  const move=direction=>{
    const visible=available(),position=visible.indexOf(scenes[active]),next=visible[position+direction];
    if(next){active=scenes.indexOf(next);render(true)}
  };
  $('#deck-back').addEventListener('click',()=>move(-1));
  $('#deck-next').addEventListener('click',()=>move(1));
  $('#deck-index').addEventListener('click',()=>{$('#deck-index-panel').hidden=false;$('#deck-index-close').focus()});
  $('#deck-index-close').addEventListener('click',()=>{$('#deck-index-panel').hidden=true;$('#deck-index').focus()});
  list.addEventListener('click',event=>{const button=event.target.closest('[data-deck-jump]');if(!button)return;active=Number(button.dataset.deckJump);$('#deck-index-panel').hidden=true;render(true)});
  $$('.rail a,.mobile-nav a,.brand').forEach(link=>link.addEventListener('click',event=>{const target=$(link.getAttribute('href'));if(!target)return;const index=scenes.indexOf(target);if(index<0)return;event.preventDefault();active=index;render(true)}));
  document.addEventListener('keydown',event=>{
    if(!$('#deck-index-panel').hidden&&event.key==='Escape'){$('#deck-index-panel').hidden=true;return}
    if(event.target.matches('input,textarea,select'))return;
    if(event.key==='ArrowRight'||event.key==='PageDown')move(1);
    if(event.key==='ArrowLeft'||event.key==='PageUp')move(-1);
  });
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    const command=event.target.closest('[data-command]');
    if(command){
      const targetId=commands[Number(command.dataset.command)]?.target,target=targetId&&$(`#${targetId}`),index=scenes.indexOf(target);
      if(index>=0){active=index;setTimeout(()=>render(true),0)}
    }
    if(action==='diagnostics')setTimeout(()=>{const label=$('.diagnostic-row span');if(label)label.textContent='Application shell · XPS 4.0 Command Deck'},0);
    if(action==='provenance')setTimeout(()=>{const copy=$('#drawer-body .drawer-section>p');if(copy)copy.textContent=copy.textContent.replace('XPS 3.3 integration shell','XPS 4.0 Command Deck shell')},0);
  });
  new MutationObserver(()=>render()).observe($('#main'),{subtree:true,attributes:true,attributeFilter:['hidden']});
  document.body.classList.add('command-deck');
  render();
}

addEventListener('load',bootCommandDeck,{once:true});
