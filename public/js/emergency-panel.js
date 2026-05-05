(() => {
  const escapeHtml = value => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const distanceInMeters = (fromLat, fromLng, toLat, toLng) => {
    const earthRadius = 6371000;
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180)
      * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatDistance = meters => {
    if (meters < 1000) {
      return Math.round(meters) + ' m';
    }
    return (meters / 1000).toFixed(1).replace('.', ',') + ' km';
  };

  const setNearbyMessage = (widget, message) => {
    const rows = widget.querySelector('[data-nearby-rows]');
    if (rows) {
      rows.innerHTML = '<tr><td colspan="3">' + escapeHtml(message) + '</td></tr>';
    }
  };

  const loadNearbyEmergencyPlaces = async (widget, lat, lng) => {
    const status = widget.querySelector('[data-nearby-status]');
    const rows = widget.querySelector('[data-nearby-rows]');
    if (!status || !rows) {
      return;
    }

    status.textContent = 'Recherche...';
    setNearbyMessage(widget, 'Recherche des urgences proches...');

    try {
      const response = await fetch('/api/emergency/nearby?lat=' + encodeURIComponent(lat) + '&lng=' + encodeURIComponent(lng), {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Erreur du service de localisation');
      }
      const payload = await response.json();
      const places = Array.isArray(payload.places) ? payload.places : [];

      if (places.length === 0) {
        const mapsSearch = 'https://www.google.com/maps/search/hospital+emergency/@' + lat + ',' + lng + ',13z';
        status.textContent = 'Non trouv\u00e9';
        rows.innerHTML = '<tr><td colspan="3">Aucune urgence trouv\u00e9e automatiquement. <a href="' + mapsSearch + '" target="_blank" rel="noreferrer">Chercher dans Maps</a></td></tr>';
        return;
      }

      status.textContent = payload.source === 'fallback' ? places.length + ' secours' : places.length + ' trouv\u00e9es';
      rows.innerHTML = places.map(place => {
        const mapsUrl = place.mapsUrl || 'https://www.google.com/maps/dir/?api=1&destination=' + place.lat + ',' + place.lng;
        const phoneLink = place.phone
          ? '<a class="emergency-nearby-phone" href="tel:' + escapeHtml(place.phone) + '">' + escapeHtml(place.phone) + '</a>'
          : '';
        return `
          <tr>
            <td>
              <strong>${escapeHtml(place.name)}</strong>
              <span>${escapeHtml(place.kind)}${phoneLink}</span>
            </td>
            <td>${formatDistance(place.distance)}</td>
            <td><a href="${mapsUrl}" target="_blank" rel="noreferrer">Ouvrir</a></td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      const mapsSearch = 'https://www.google.com/maps/search/hospital+emergency/@' + lat + ',' + lng + ',13z';
      status.textContent = 'Maps';
      rows.innerHTML = '<tr><td colspan="3">La liste automatique est momentan\u00e9ment indisponible. <a href="' + mapsSearch + '" target="_blank" rel="noreferrer">Ouvrir Maps</a></td></tr>';
    }
  };

  const updateMessageWithLocation = (widget, mapsUrl) => {
    const message = widget.querySelector('[data-sos-message]');
    if (!message) {
      return;
    }
    const baseMessage = message.dataset.baseMessage || message.textContent.trim();
    message.textContent = baseMessage + '\nLocalisation : ' + mapsUrl;
  };

  const startLocation = widget => {
    const status = widget.querySelector('[data-location-status]');
    const title = widget.querySelector('[data-location-title]');
    const coords = widget.querySelector('[data-location-coords]');
    const mapsLink = widget.querySelector('[data-maps-link]');

    if (!('geolocation' in navigator)) {
      if (status) status.textContent = 'GPS INDISPONIBLE';
      if (title) title.textContent = 'Navigateur incompatible';
      if (coords) coords.textContent = 'La g\u00e9olocalisation n est pas disponible sur cet appareil.';
      setNearbyMessage(widget, 'Votre navigateur ne permet pas la recherche par position.');
      return;
    }

    if (status) status.textContent = 'LOCALISATION GPS EN COURS';
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      const mapsUrl = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      if (status) status.textContent = 'LOCALISATION GPS RE\u00c7UE';
      if (title) title.textContent = 'Votre position actuelle';
      if (coords) coords.textContent = lat + ', ' + lng;
      if (mapsLink) {
        mapsLink.href = mapsUrl;
        mapsLink.style.display = 'inline-flex';
      }
      updateMessageWithLocation(widget, mapsUrl);
      loadNearbyEmergencyPlaces(widget, Number(lat), Number(lng));
    }, () => {
      if (status) status.textContent = 'LOCALISATION REFUS\u00c9E';
      if (title) title.textContent = 'Position indisponible';
      if (coords) coords.textContent = 'Activez la permission de localisation pour partager votre position.';
      if (mapsLink) mapsLink.style.display = 'none';
      setNearbyMessage(widget, 'Autorisez la localisation pour rechercher les urgences les plus proches.');
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  document.querySelectorAll('[data-emergency-page]').forEach(startLocation);

  document.querySelectorAll('[data-emergency-widget]').forEach(widget => {
    const trigger = widget.querySelector('[data-emergency-toggle]');
    const panel = widget.querySelector('[data-emergency-panel]');
    const backdrop = widget.querySelector('[data-emergency-backdrop]');
    const close = widget.querySelector('[data-emergency-close]');
    let locationStarted = false;

    const openPanel = () => {
      if (!panel || !backdrop) {
        return;
      }
      panel.hidden = false;
      backdrop.hidden = false;
      document.body.classList.add('emergency-panel-open');
      if (!locationStarted) {
        locationStarted = true;
        startLocation(widget);
      }
    };

    const closePanel = () => {
      if (panel) panel.hidden = true;
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove('emergency-panel-open');
    };

    trigger?.addEventListener('click', openPanel);
    close?.addEventListener('click', closePanel);
    backdrop?.addEventListener('click', closePanel);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  });
})();
