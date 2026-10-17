'use strict';
const el = (tag, cls, text) => {const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let items=[],category='ALL';
const container=document.querySelector('#ratings'), search=document.querySelector('#search');
function render(){
 const query=search.value.trim().toLocaleLowerCase();
 const filtered=items.filter(i=>(category==='ALL'||i.category===category)&&`${i.title} ${i.artist}`.toLocaleLowerCase().includes(query));
 document.querySelector('#count').textContent=`${filtered.length} items`;
 container.replaceChildren();
 const groups=new Map();
 for(const item of filtered){const key=item.score===null?'Unrated':Number(item.score).toFixed(1);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 for(const key of [...groups.keys()].sort((a,b)=>a==='Unrated'?1:b==='Unrated'?-1:Number(b)-Number(a))){
  const section=el('section','group'),heading=el('h2','',key);heading.append(el('span','',`${groups.get(key).length}`));section.append(heading);
  const cards=el('div','cards');
  for(const i of groups.get(key).sort((a,b)=>a.title.localeCompare(b.title,'ko'))){
   const card=el('article','card'),cover=el('a','cover');cover.href=i.note;cover.setAttribute('aria-label',i.title);
   if(i.cover){const img=el('img');img.src=i.cover;img.alt=i.title;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{cover.replaceChildren(el('span','placeholder',i.title.charAt(0)));},{once:true});cover.append(img);}else cover.append(el('span','placeholder',i.title.charAt(0)));
   const title=el('h3'),link=el('a','',i.title);link.href=i.note;title.append(link);
   card.append(cover,title,el('p','artist',i.artist),el('p','meta',[i.year,i.category].filter(Boolean).join(' · ')));
   cards.append(card);
  }
  section.append(cards);container.append(section);
 }
 if(!filtered.length)container.append(el('p','','No ratings match your search.'));
}
fetch('ratings.json').then(r=>{if(!r.ok)throw Error('Load failed');return r.json();}).then(data=>{
 items=data;const nav=document.querySelector('#categories');
 for(const name of ['ALL',...[...new Set(items.map(i=>i.category))].sort((a,b)=>a.localeCompare(b,'ko'))]){
  const button=el('button','',name);button.type='button';button.setAttribute('aria-pressed',String(name===category));button.append(el('small','',name==='ALL'?items.length:items.filter(i=>i.category===name).length));
  button.onclick=()=>{category=name;for(const b of nav.children)b.setAttribute('aria-pressed',String(b===button));render();};nav.append(button);
 }
 search.addEventListener('input',render);render();
}).catch(()=>{container.textContent='Could not load ratings. Please reload to try again.';});
