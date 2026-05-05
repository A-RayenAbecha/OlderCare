"use client";

import { useEffect, useState } from "react";

export default function SosCountdown({ cancelUrl = "/dashboard" }) {
  const [remaining, setRemaining] = useState(30);
  const [sent, setSent] = useState(false);
  const [popupMessage, setPopupMessage] = useState("SMS livré avec succès aux contacts d'urgence.");
  const [coords, setCoords] = useState({ latitude: "", longitude: "", address: "" });

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setCoords({ latitude, longitude, address: `${latitude}, ${longitude}` });
      },
      () => setCoords({ latitude: "", longitude: "", address: "" }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sos-sent", sent);
    return () => document.body.classList.remove("sos-sent");
  }, [sent]);

  useEffect(() => {
    if (sent) return undefined;
    if (remaining <= 0) {
      const body = new URLSearchParams(coords);
      fetch("/sos/send", { method: "POST", body })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          const count = typeof result?.recipientCount === "number" ? result.recipientCount : 0;
          setPopupMessage(count > 0 ? `SMS livré avec succès aux ${count} contact(s) d'urgence.` : "SMS livré avec succès au service d'urgence.");
          setSent(true);
        })
        .catch(() => setSent(true));
      return undefined;
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [coords, remaining, sent]);

  return (
    <main className={`sos-shell ${sent ? "sos-sent" : ""}`} data-return-url={cancelUrl}>
      <div className="sos-topbar"><span>⚠ SOS d'urgence</span><strong>OLDERCARE</strong></div>
      <section className="sos-content sos-minimal-content">
        <h1 id="sosTitle">ALERTE SOS ACTIVÉE</h1>
        <div className="sos-status-ring"><span id="sosCountdown">{sent ? "OK" : remaining}</span><small>SOS</small></div>
        <p className="sos-copy" id="sosCopy">{sent ? "SMS livré avec succès." : `Validation automatique du SOS dans ${remaining} secondes.`}</p>
        {!sent && <a className="sos-cancel" href={cancelUrl}>× ANNULER</a>}
      </section>
      <div className="sos-sent-popup" id="sosSentPopup" hidden={!sent}>
        <div className="sos-sent-card">
          <div className="sos-sent-icon">✓</div>
          <h2>SOS activé</h2>
          <p id="sosPopupMessage">{popupMessage}</p>
          <a className="sos-popup-action" href={cancelUrl}>Retour</a>
        </div>
      </div>
    </main>
  );
}
