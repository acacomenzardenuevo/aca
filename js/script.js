// Read the visible agenda so times and status always share one source.
(() => {
  const output = document.getElementById('proxima-reunion');
  if (!output) return;
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const duration = Number(document.querySelector('.meeting-grid').dataset.duration);
  const schedule = [...document.querySelectorAll('#reuniones .meeting-card')].map(card => {
    const label = card.querySelector('h3').textContent;
    const time = card.querySelector('.meeting-time').textContent;
    const [, hour, minute, period] = time.match(/(\d+):(\d+) ([ap])/);
    const badge = document.createElement('span');
    badge.className = 'meeting-badge';
    badge.hidden = true;
    card.prepend(badge);
    const calendar = document.createElement('a');
    calendar.className = 'calendar-link';
    calendar.textContent = 'Agregar al calendario';
    calendar.download = 'reunion-aca.ics';
    card.append(calendar);
    const topic = card.querySelector('p:not(.meeting-time)').textContent;
    return { card, badge, calendar, topic, day: days.indexOf(label), label, time, minutes: (Number(hour) % 12 + (period === 'p' ? 12 : 0)) * 60 + Number(minute), monthlyWeek: Number(card.dataset.monthlyWeek) };
  });
  // Convert Mexico City wall time with Intl, independent of the visitor's zone.
  function calendarTime(date, minutes) {
    const wall = date.getTime() + minutes * 60000;
    let utc = wall;
    for (let pass = 0; pass < 2; pass++) {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(utc));
      const get = type => Number(parts.find(part => part.type === type).value);
      const local = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
      utc += wall - local;
    }
    return utc;
  }
  const stamp = time => new Date(time).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const escapeCalendar = text => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  function updateCalendar(meeting, occurrence) {
    const start = calendarTime(occurrence.date, meeting.minutes);
    if (meeting.calendar.dataset.start === String(start)) return;
    meeting.calendar.setAttribute('aria-label', 'Agregar al calendario: ' + meeting.label + ', ' + meeting.time + ', ' + occurrence.topic);
    if (meeting.calendar.href.startsWith('blob:')) URL.revokeObjectURL(meeting.calendar.href);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ACAD Comenzar de nuevo//Reuniones//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + start + '-' + meeting.minutes + '@acacomenzardenuevo.org', 'DTSTAMP:' + stamp(Date.now()),
      'DTSTART:' + stamp(start), 'DTEND:' + stamp(start + duration * 60000),
      'SUMMARY:' + escapeCalendar('ACA · ' + occurrence.topic),
      'DESCRIPTION:' + escapeCalendar('Reunión en línea. Horario de Ciudad de México. ID: ' + document.getElementById('zoom-id').textContent + '. Contraseña: ' + document.getElementById('zoom-password').textContent),
      'LOCATION:https://zoom.us/j/3696161442', 'URL:https://acacomenzardenuevo.org/#reuniones', 'END:VEVENT', 'END:VCALENDAR'];
    // Fold by UTF-8 byte length for calendar applications that enforce RFC limits.
    const folded = lines.map(line => {
      const chunks = []; let chunk = '';
      for (const char of line) {
        if (new TextEncoder().encode(chunk + char).length > 73) { chunks.push(chunk); chunk = ' '; }
        chunk += char;
      }
      chunks.push(chunk); return chunks.join('\r\n');
    }).join('\r\n') + '\r\n';
    meeting.calendar.href = URL.createObjectURL(new Blob([folded], { type: 'text/calendar;charset=utf-8' }));
    meeting.calendar.dataset.start = String(start);
    meeting.calendar.title = 'Guardar la reunión del ' + occurrence.date.getUTCDate() + '/' + (occurrence.date.getUTCMonth() + 1);
  }
  function update() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const value = type => Number(parts.find(part => part.type === type).value);
    const today = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
    const now = value('hour') * 60 + value('minute');
    const occurrences = [];
    for (let offset = -1; offset <= 35; offset++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + offset);
      schedule.forEach(meeting => {
        if (date.getUTCDay() !== meeting.day) return;
        if (meeting.monthlyWeek && Math.ceil(date.getUTCDate() / 7) !== meeting.monthlyWeek) return;
        const topic = date.getUTCDate() <= 7 ? meeting.card.dataset.firstSundayTopic || meeting.topic : meeting.topic;
        occurrences.push({ ...meeting, topic, date, offset, wait: offset * 1440 + meeting.minutes - now });
      });
    }
    const current = occurrences.find(meeting => meeting.wait <= 0 && meeting.wait > -duration);
    const next = occurrences.filter(meeting => meeting.wait > 0).sort((a,b) => a.wait - b.wait)[0];
    schedule.forEach(meeting => {
      const todayMeeting = occurrences.find(item => item.card === meeting.card && item.offset === 0);
      const inProgress = meeting.card === current?.card;
      meeting.card.classList.toggle('is-current', inProgress);
      meeting.card.classList.toggle('is-today', Boolean(todayMeeting));
      meeting.badge.hidden = !todayMeeting;
      meeting.badge.textContent = inProgress ? 'En curso' : todayMeeting?.wait <= -duration ? 'Hoy · Finalizada' : 'Hoy';
      const upcoming = occurrences.filter(item => item.card === meeting.card && item.wait > -duration).sort((a,b) => a.wait - b.wait)[0];
      if (upcoming) updateCalendar(meeting, upcoming);
    });
    const todayMeetings = occurrences.filter(item => item.offset === 0);
    document.getElementById('agenda-hoy').textContent = todayMeetings.length
      ? 'Hoy: ' + todayMeetings.map(item => item.time + ' · ' + item.topic).join(' / ')
      : 'Hoy no hay reuniones programadas. Consulta la próxima reunión al inicio de la página.';
    if (current) {
      output.textContent = 'Reunión en curso: ' + current.label + ', ' + current.time + ' · Duración: ' + duration + ' minutos.';
    } else if (next) {
      const date = next.date.getUTCDate() + '/' + (next.date.getUTCMonth() + 1);
      output.textContent = 'Próxima reunión: ' + next.label + ' ' + date + ', ' + next.time + ' (hora de Ciudad de México).';
    }
  }
  update();
  setInterval(update, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();

// Keep manual copying available when clipboard access is unavailable.
(() => {
  const status = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const text = target.textContent.replace(/\s/g, '');
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = button.dataset.copyLabel + ' copiado.';
        button.textContent = 'Copiado';
        setTimeout(() => { button.textContent = button.dataset.originalLabel; }, 2500);
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'No se pudo copiar automáticamente. Mantén pulsado el texto seleccionado o usa la opción Copiar de tu dispositivo.';
      }
    });
    button.dataset.originalLabel = button.textContent;
  });
})();

// Personal selections remain only in the current page.
(() => {
  document.querySelectorAll('.traits-panel').forEach(panel => {
  const inputs = [...panel.querySelectorAll('input[type="checkbox"]')];
  const count = panel.querySelector('[role="status"]');
  const reset = panel.querySelector('.traits-reset');
  function updateSelection() {
    const selected = inputs.filter(input => input.checked).length;
    count.textContent = selected === 0 ? 'Puedes marcar las características que quieras.' : selected === 1 ? 'Has marcado 1 característica.' : 'Has marcado ' + selected + ' características.';
    reset.disabled = selected === 0;
  }
  panel.addEventListener('change', updateSelection);
  reset.addEventListener('click', () => {
    inputs.forEach(input => { input.checked = false; });
    updateSelection();
    inputs[0].focus();
  });
  panel.querySelector('.traits-actions').hidden = false;
  updateSelection();
  });
})();
