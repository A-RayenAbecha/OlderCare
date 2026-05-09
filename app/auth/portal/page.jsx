import Link from "next/link";
import BraceletSuccess from "@/components/BraceletSuccess";
import EmergencyRail from "@/components/EmergencyRail";
import { createPortalToken, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "PORTAL") redirect("/auth/login-code-page");
  const params = await searchParams;
  const portalToken = createPortalToken(session.userId);

  return (
    <>
      <EmergencyRail />
      <main className="app-shell auth-shell portal-shell">
        <div className="topbar">
          <Link className="icon-button" href="/auth/logout">←</Link>
          <span />
          <div className="bracelet-status-pill"><span /> Bracelet connecté</div>
        </div>
        <section className="content portal-access-page">
          <img className="brand-wordmark brand-logo-wordmark" src="/images/oldercare-logo-transparent.gif" alt="OlderCare" />
          <h1 className="title-lg">Choisir le<br />type d'accès</h1>
          <p className="subtitle">Sélectionnez qui utilise ce code bracelet.</p>
          <div className="portal-choice-grid">
            <form method="post" action="/auth/portal/staff" className="portal-choice-form">
              <input type="hidden" name="portalToken" value={portalToken} />
              <button className="portal-card portal-action-card" type="submit">
                <span className="portal-icon">⚕</span>
                <h2>Personnel médical</h2>
                <p>Vue d'urgence en lecture seule avec option de déverrouillage médical.</p>
              </button>
            </form>
            <form method="post" action="/auth/portal/patient" className="portal-choice-form">
              <input type="hidden" name="portalToken" value={portalToken} />
              <button className="portal-card portal-action-card" type="submit">
                <span className="portal-icon">👤</span>
                <h2>Patient</h2>
                <p>Ouvrir le tableau de bord patient complet.</p>
              </button>
            </form>
            <form method="post" action="/auth/portal/autre" className="portal-choice-form">
              <input type="hidden" name="portalToken" value={portalToken} />
              <button className="portal-card portal-action-card secondary" type="submit">
                <span className="portal-icon">🛈</span>
                <h2>Autre</h2>
                <p>Ouvrir uniquement les informations d'urgence.</p>
              </button>
            </form>
          </div>
        </section>
      </main>
      <BraceletSuccess show={params?.bracelet === "connected"} />
    </>
  );
}
