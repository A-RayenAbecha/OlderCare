(() => {
  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter'
  ];
  const overpassRequestTimeoutMs = 4500;

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

  const describeEmergencyPlace = tags => {
    if (!tags) {
      return 'Service m\u00e9dical';
    }
    if (tags.emergency === 'ambulance_station') {
      return 'Ambulance';
    }
    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') {
      return tags.emergency === 'yes' ? 'H\u00f4pital avec urgence' : 'H\u00f4pital';
    }
    if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') {
      return 'Clinique';
    }
    if (tags.amenity === 'doctors' || tags.healthcare === 'doctor') {
      return 'M\u00e9decin';
    }
    return 'Service m\u00e9dical';
  };

  const buildOverpassQuery = (lat, lng, radius) => `
    [out:json][timeout:5];
    (
      node(around:${radius},${lat},${lng})["amenity"~"hospital|clinic|doctors"];
      way(around:${radius},${lat},${lng})["amenity"~"hospital|clinic|doctors"];
      relation(around:${radius},${lat},${lng})["amenity"~"hospital|clinic|doctors"];
      node(around:${radius},${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
      way(around:${radius},${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
      relation(around:${radius},${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
      node(around:${radius},${lat},${lng})["emergency"="ambulance_station"];
      way(around:${radius},${lat},${lng})["emergency"="ambulance_station"];
      relation(around:${radius},${lat},${lng})["emergency"="ambulance_station"];
    );
    out center tags 30;
  `;

  const fetchOverpass = async query => {
    let lastError;
    for (const endpoint of endpoints) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), overpassRequestTimeoutMs);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new URLSearchParams({ data: query }),
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error('Erreur du service cartographique');
        }
        return await response.json();
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
    }
    throw lastError;
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
      let elements = [];
      for (const radius of [6000, 12000]) {
        const data = await fetchOverpass(buildOverpassQuery(lat, lng, radius));
        elements = data.elements || [];
        if (elements.length > 0 || radius === 12000) {
          break;
        }
      }

      const places = elements
        .map(element => {
          const placeLat = element.lat || (element.center && element.center.lat);
          const placeLng = element.lon || (element.center && element.center.lon);
          if (placeLat == null || placeLng == null) {
            return null;
          }
          const tags = element.tags || {};
          const name = tags.name || tags['name:fr'] || tags.operator || 'Urgence m\u00e9dicale proche';
          return {
            key: element.type + '-' + element.id,
            name,
            kind: describeEmergencyPlace(tags),
            lat: placeLat,
            lng: placeLng,
            phone: tags.phone || tags['contact:phone'] || '',
            distance: distanceInMeters(lat, lng, placeLat, placeLng)
          };
        })
        .filter(Boolean)
        .filter((place, index, list) => list.findIndex(item => item.key === place.key) === index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      if (places.length === 0) {
        const mapsSearch = 'https://www.google.com/maps/search/hospital+emergency/@' + lat + ',' + lng + ',13z';
        status.textContent = 'Non trouv\u00e9';
        rows.innerHTML = '<tr><td colspan="3">Aucune urgence trouv\u00e9e automatiquement. <a href="' + mapsSearch + '" target="_blank" rel="noreferrer">Chercher dans Maps</a></td></tr>';
        return;
      }

      status.textContent = places.length + ' trouv\u00e9es';
      rows.innerHTML = places.map(place => {
        const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + place.lat + ',' + place.lng;
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
      status.textContent = 'Indisponible';
      rows.innerHTML = '<tr><td colspan="3">Impossible de charger les urgences proches maintenant. <a href="' + mapsSearch + '" target="_blank" rel="noreferrer">Ouvrir Maps</a></td></tr>';
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
