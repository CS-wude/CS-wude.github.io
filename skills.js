import { SKILLS } from './data/skills.js';
import { filterSkills, normalizeFilters } from './skills-render.js';
const form = document.querySelector('#skillFilters');
if (form) {
  const search = form.querySelector('[name="q"]');
  const category = form.querySelector('[name="category"]');
  const source = form.querySelector('[name="source"]');
  const cards = [...document.querySelectorAll('[data-skill-id]')];
  const count = document.querySelector('#skillCount');
  const empty = document.querySelector('#skillEmpty');
  const reset = document.querySelector('#skillReset');
  const apply = (restoreControls = true) => {
    const state = normalizeFilters(new URLSearchParams(location.search));
    if (restoreControls) {
      search.value = state.q;
      category.value = state.category;
      source.value = state.source;
    }
    const matches = new Set(filterSkills(SKILLS,state).map(s=>s.id));
    cards.forEach(card => {card.hidden = !matches.has(card.dataset.skillId);});
    count.textContent = `显示 ${matches.size} / ${SKILLS.length} 个技能`;
    empty.hidden = matches.size > 0;
    reset.hidden = !state.q && state.category === 'all' && state.source === 'all';
  };
  const update = (push=false) => {
    const url = new URL(location.href);
    for (const [key,value] of [['q',search.value.trim()],['category',category.value],['source',source.value]]) {
      if (value && (key === 'q' || value !== 'all')) url.searchParams.set(key,value); else url.searchParams.delete(key);
    }
    if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null,'',url);
    apply(false);
  };
  search.addEventListener('input',()=>update());
  category.addEventListener('change',()=>update(true)); source.addEventListener('change',()=>update(true));
  form.addEventListener('submit',event=>{event.preventDefault();update(true);});
  const clear = () => {search.value='';category.value='all';source.value='all';update(true);search.focus();};
  reset.addEventListener('click',clear);document.querySelector('#skillEmptyReset').addEventListener('click',clear);
  window.addEventListener('popstate',()=>apply());
  apply(); form.hidden = false;
}
