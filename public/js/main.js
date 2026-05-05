function collectChecked(selector) {
  return Array.from(document.querySelectorAll(selector + ':checked')).map(item => item.value).join(', ');
}

function collectCheckedValues(selector) {
  return Array.from(document.querySelectorAll(selector + ':checked')).map(item => item.value);
}

function collectAllergyRows(listId) {
  const list = document.getElementById(listId);
  if (!list) return '';
  return Array.from(list.querySelectorAll('.allergy-input'))
    .map(input => input.value.trim())
    .filter(Boolean)
    .join('\n');
}

function syncAllergyFields(form) {
  form.querySelectorAll('[data-allergy-group]').forEach(group => {
    const hidden = form.querySelector('[name="' + group.dataset.hidden + '"]');
    if (hidden) hidden.value = collectAllergyRows(group.dataset.list);
  });
}

function buildAllergyRow(value, placeholder) {
  const row = document.createElement('div');
  row.className = 'allergy-row';

  const input = document.createElement('input');
  input.className = 'allergy-input';
  input.type = 'text';
  input.value = value || '';
  input.placeholder = placeholder || 'Allergie';

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'icon-button small danger';
  remove.setAttribute('data-remove-allergy', '');
  remove.setAttribute('aria-label', "Supprimer l'allergie");
  remove.textContent = '-';

  row.append(input, remove);
  return row;
}

function updateDiabetesPanel() {
  const toggle = document.getElementById('diabetesToggle');
  const panel = document.getElementById('diabetesTypePanel');
  if (!toggle || !panel) return;
  panel.classList.toggle('is-disabled', !toggle.checked);
  panel.querySelectorAll('input[name="diabetesType"]').forEach(input => {
    input.disabled = !toggle.checked;
  });
}

async function postForm(url, data, nextUrl) {
  const body = data instanceof FormData ? data : new URLSearchParams(data);
  const response = await fetch(url, { method: 'POST', body });
  if (!response.ok) {
    alert('Enregistrement impossible. V\u00e9rifiez les champs puis r\u00e9essayez.');
    return;
  }
  window.location.href = nextUrl;
}

function saveDraftFromForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  syncAllergyFields(form);
  const data = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem('draft:' + formId, JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-add-allergy]');
    if (addButton) {
      const list = document.getElementById(addButton.dataset.target);
      if (list) {
        list.append(buildAllergyRow('', addButton.dataset.placeholder));
        list.lastElementChild.querySelector('input').focus();
      }
      return;
    }

    const removeButton = event.target.closest('[data-remove-allergy]');
    if (removeButton) {
      const list = removeButton.closest('.dynamic-list');
      removeButton.closest('.allergy-row').remove();
      if (list && !list.querySelector('.allergy-row')) {
        list.append(buildAllergyRow('', list.dataset.placeholder));
      }
    }
  });

  const diabetesToggle = document.getElementById('diabetesToggle');
  if (diabetesToggle) {
    diabetesToggle.addEventListener('change', updateDiabetesPanel);
    updateDiabetesPanel();
  }

  document.querySelectorAll('[data-draft]').forEach(button => {
    button.addEventListener('click', () => {
      saveDraftFromForm(button.dataset.draft);
      button.textContent = 'ENREGISTR\u00c9';
      setTimeout(() => button.textContent = 'ENREGISTRER', 900);
    });
  });
});
