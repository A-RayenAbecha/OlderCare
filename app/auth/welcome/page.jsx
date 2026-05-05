import Link from "next/link";
import EmergencyRail from "@/components/EmergencyRail";
import { redirectIfLoggedIn } from "@/lib/auth";

export default async function WelcomePage() {
  await redirectIfLoggedIn();

  return (
    <>
      <EmergencyRail />
      <main className="app-shell welcome-shell">
        <div className="topbar">
          <strong className="brand brand-with-video"><video className="brand-video" src="/videos/oldercare-logo.mp4" autoPlay muted loop playsInline aria-label="OlderCare" /></strong>
          <Link className="welcome-login-btn" href="/auth/login-code-page"><span>👤</span>Connexion</Link>
        </div>
        <section className="welcome-hero">
          <div className="welcome-copy">
            <div className="step-text welcome-kicker"><span>🛡</span> Accès santé par bracelet</div>
            <h1>Santé connectée,<br /><span>reliée</span> à vous</h1>
            <p>Reliez votre bracelet médical, protégez vos informations d'urgence et accédez à votre espace santé depuis n'importe quel appareil.</p>
            <div className="welcome-actions">
              <Link className="primary-btn" href="/auth/signup/patient"><span>👤</span> Inscription patient</Link>
              <Link className="welcome-secondary-btn" href="/auth/login-code-page"><span>▦</span> Connexion avec code bracelet</Link>
            </div>
            <div className="welcome-secure-line"><span>🛡</span> Sécurisé&nbsp; •&nbsp; Privé&nbsp; •&nbsp; Toujours accessible</div>
          </div>
          <div className="welcome-visual" aria-hidden="true">
            <img src="/images/medical-care-bg.png" alt="" />
          </div>
        </section>
        <section className="welcome-feature-grid" aria-label="Avantages OlderCare">
          <article className="welcome-feature-card"><div className="welcome-feature-icon blue">📄</div><div><h2>Dossier médical sécurisé</h2><p>Stockez et gérez vos informations médicales en toute sécurité.</p></div></article>
          <article className="welcome-feature-card"><div className="welcome-feature-icon green">📡</div><div><h2>Connexion du bracelet</h2><p>Connectez votre bracelet pour un accès instantané en cas d'urgence.</p></div></article>
          <article className="welcome-feature-card"><div className="welcome-feature-icon red">🚑</div><div><h2>Prêt en urgence</h2><p>Partagez vos informations de santé critiques au moment où elles comptent le plus.</p></div></article>
        </section>
        <section className="welcome-control-card">
          <span>🛡</span><div><h2>Votre santé. Vos données. Votre contrôle.</h2><p>Vos informations restent protégées et accessibles uniquement lorsque vous en avez besoin.</p></div>
        </section>
      </main>
    </>
  );
}
