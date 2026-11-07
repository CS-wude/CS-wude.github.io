import { CATEGORIES } from './data/skills.js';
export const escapeHTML = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const normalizeFilters = params => ({
  q: (params.get('q') || '').trim(),
  category: CATEGORIES.includes(params.get('category')) ? params.get('category') : 'all',
  source: ['external','wude'].includes(params.get('source')) ? params.get('source') : 'all',
});
export const filterSkills = (skills, {q='',category='all',source='all'} = {}) => {
  const words = q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return skills.filter(skill => (category === 'all' || skill.category === category) && (source === 'all' || skill.source === source) && words.every(word => [skill.name,skill.description,skill.author,skill.category,...skill.tags].join(' ').toLocaleLowerCase().includes(word)));
};
export const renderSkills = skills => skills.map((skill,index) => {
  const url = new URL(skill.url);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Skill destination must use public HTTPS');
  return `<article class="skill-card" data-skill-id="${escapeHTML(skill.id)}" id="skill-${escapeHTML(skill.id)}">
    <div class="skill-card__top"><span class="skill-symbol" aria-hidden="true">${['{ }','Aa','&gt;_','[ ]'][index%4]}</span><span class="skill-category">${escapeHTML(skill.category)}</span></div>
    <p class="skill-author">${escapeHTML(skill.author)} <span>· ${skill.source === 'wude' ? 'WUDE 维护' : '外部来源'}</span></p>
    <h2>${escapeHTML(skill.name)}</h2><p class="skill-description">${escapeHTML(skill.description)}</p>
    <ul class="skill-tags" aria-label="标签">${skill.tags.map(tag=>`<li>${escapeHTML(tag)}</li>`).join('')}</ul>
    <a class="skill-link" href="${escapeHTML(url.href)}" target="_blank" rel="noopener noreferrer" aria-label="查看 ${escapeHTML(skill.name)} 来源（新窗口）"><span>查看来源</span><span aria-hidden="true">↗</span></a>
  </article>`;
}).join('\n');
