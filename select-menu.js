// Enhance native selects while keeping their values as the filter's source of truth.
let openMenu = null;

export function enhanceSelect(select) {
  const doc = select.ownerDocument;
  const view = doc.defaultView;
  const options = [...select.options];
  const fieldLabel = select.labels[0];
  const root = doc.createElement('div');
  const trigger = doc.createElement('button');
  const valueLabel = doc.createElement('span');
  const arrow = doc.createElement('span');
  const list = doc.createElement('ul');

  root.className = 'skill-select';
  trigger.className = 'skill-select__trigger';
  trigger.type = 'button';
  trigger.id = `${select.id}-trigger`;
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', `${select.id}-options`);
  trigger.setAttribute('aria-labelledby', fieldLabel.id);
  valueLabel.className = 'skill-select__value';
  arrow.className = 'skill-select__arrow';
  arrow.setAttribute('aria-hidden', 'true');
  trigger.append(valueLabel, arrow);
  list.className = 'skill-select__list';
  list.id = `${select.id}-options`;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-labelledby', fieldLabel.id);
  list.hidden = true;

  let activeIndex = Math.max(0, select.selectedIndex);
  let isOpen = false;
  let typed = '';
  let lastTypedAt = 0;

  const items = options.map((option, index) => {
    const item = doc.createElement('li');
    const label = doc.createElement('span');
    const check = doc.createElement('span');
    item.id = `${select.id}-option-${index}`;
    item.setAttribute('role', 'option');
    item.className = 'skill-select__option';
    label.textContent = option.label;
    check.className = 'skill-select__check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');
    item.append(label, check);
    item.addEventListener('pointermove', () => setActive(index, false));
    item.addEventListener('click', () => commit(index));
    list.append(item);
    return item;
  });

  function setActive(index, scroll = true) {
    activeIndex = Math.max(0, Math.min(options.length - 1, index));
    items.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex));
    trigger.setAttribute('aria-activedescendant', items[activeIndex].id);
    if (scroll) items[activeIndex].scrollIntoView({block: 'nearest'});
  }

  function close() {
    isOpen = false;
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    root.classList.toggle('is-open', false);
    if (openMenu === close) openMenu = null;
  }

  function open(index = select.selectedIndex) {
    if (openMenu && openMenu !== close) openMenu();
    openMenu = close;
    isOpen = true;
    list.hidden = false;
    root.classList.toggle('is-open', true);
    trigger.setAttribute('aria-expanded', 'true');
    const rect = trigger.getBoundingClientRect();
    const below = view.innerHeight - rect.bottom;
    const above = rect.top;
    const opensUp = below < Math.min(288, options.length * 44 + 12) && above > below;
    root.classList.toggle('opens-up', opensUp);
    list.style.maxHeight = `${Math.max(44, Math.min(288, (opensUp ? above : below) - 16))}px`;
    setActive(index);
  }

  function sync() {
    close();
    valueLabel.textContent = options[select.selectedIndex]?.label || options[0].label;
    items.forEach((item, index) => item.setAttribute('aria-selected', index === select.selectedIndex));
  }

  function commit(index = activeIndex) {
    const changed = select.value !== options[index].value;
    select.value = options[index].value;
    sync();
    if (changed) select.dispatchEvent(new view.Event('change', {bubbles: true}));
    trigger.focus();
  }

  trigger.addEventListener('click', () => isOpen ? close() : open());
  trigger.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.isComposing) return;
    const key = event.key;
    if (key === 'Tab') {
      if (isOpen) commit();
      return;
    }
    if (key === 'Escape') {
      if (isOpen) { event.preventDefault(); event.stopPropagation(); close(); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key)) {
      event.preventDefault();
      if (key === 'Enter' || key === ' ') isOpen ? commit() : open();
      else if (key === 'Home') isOpen ? setActive(0) : open(0);
      else if (key === 'End') isOpen ? setActive(options.length - 1) : open(options.length - 1);
      else if (isOpen) setActive(activeIndex + (key === 'ArrowDown' ? 1 : -1));
      else open();
      return;
    }
    if (key.length === 1 && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      typed = now - lastTypedAt > 600 ? key : typed + key;
      lastTypedAt = now;
      const index = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(typed.toLocaleLowerCase()));
      if (index >= 0) isOpen ? setActive(index) : open(index);
    }
  });
  trigger.addEventListener('blur', close);
  // Keep pointer selection on the trigger until click commits the option.
  list.addEventListener('pointerdown', event => event.preventDefault());
  doc.addEventListener('pointerdown', event => {
    if (isOpen && !root.contains(event.target)) close();
  });
  select.addEventListener('change', sync);
  root.append(trigger, list);
  select.after(root);
  fieldLabel.htmlFor = trigger.id;
  select.hidden = true;
  sync();
  return {sync};
}

export function enhanceSelects(root) {
  return [...root.querySelectorAll('select[data-skill-select]')].map(enhanceSelect);
}
