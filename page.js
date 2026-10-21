/* Форма заявки.
   Если в index.html у формы заполнен data-endpoint (например, адрес Formspree) – заявка уходит туда.
   Если пусто – открывается письмо на mail@urvancev.info с уже заполненным текстом. */
(function () {
  'use strict';
  var MAIL = 'mail@urvancev.info';

  var form = document.getElementById('lead-form');
  if (!form) return;
  var ok = document.getElementById('lead-ok');
  var err = document.getElementById('lead-err');
  var btn = form.querySelector('button[type="submit"]');

  function markTouched() {
    Array.prototype.forEach.call(form.elements, function (el) { el.classList.add('touched'); });
  }

  function done(text) {
    ok.textContent = text;
    form.hidden = true;
    ok.hidden = false;
    ok.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;

    if (!form.checkValidity()) {
      markTouched();
      var bad = form.querySelector(':invalid');
      if (bad) bad.focus();
      return;
    }

    var data = new FormData(form);
    var endpoint = form.getAttribute('data-endpoint');

    if (endpoint) {
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          done('Заявка получена. Напишу или позвоню в течение рабочего дня, чтобы договориться о времени разговора.');
        })
        .catch(function () { btn.disabled = false; err.hidden = false; });
      return;
    }

    var lines = [];
    data.forEach(function (value, key) {
      var el = form.elements[key];
      var label = el && el.getAttribute ? el.getAttribute('data-label') : null;
      if (label) lines.push(label + ': ' + value);
    });
    window.location.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent('Заявка на разговор') +
      '&body=' + encodeURIComponent(lines.join('\n'));
    done('Открыли письмо в вашей почтовой программе. Отправьте его, и я свяжусь с вами в течение рабочего дня.');
  });
})();
