"use client";

import { useEffect, useState } from "react";

export default function BraceletSuccess({ show = false }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <section className="bracelet-success-overlay" data-bracelet-success onClick={() => setVisible(false)}>
      <article className="bracelet-success-modal" onClick={(event) => event.stopPropagation()}>
        <div className="bracelet-confetti one">+</div>
        <div className="bracelet-confetti two">+</div>
        <div className="bracelet-check-ring">
          <span>✓</span>
        </div>
        <h2>Bracelet connecté<br /><strong>avec succès</strong></h2>
        <div className="bracelet-success-line"><span /></div>
        <p>Votre bracelet a été connecté avec succès.</p>
        <button type="button" className="bracelet-modal-button" data-close-bracelet onClick={() => setVisible(false)}>Continuer</button>
      </article>
    </section>
  );
}
