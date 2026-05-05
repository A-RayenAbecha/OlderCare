import Link from "next/link";
import { logoutAction } from "@/app/actions";

export default function TopBar({ active = "accueil", readonly = false, emergencyHref = "/dashboard/emergency-info" }) {
  return (
    <header className="topbar">
      <Link className="brand-video-link" href={readonly ? "/readonly/profile" : "/dashboard"}>
        <video src="/videos/oldercare-logo.mp4" autoPlay muted loop playsInline aria-label="OlderCare" />
      </Link>
      <div className="bracelet-pill"><span /> Bracelet connecté</div>
      <nav className="top-actions">
        {!readonly && <Link className={active === "home" ? "pill active" : "pill"} href="/dashboard">Accueil</Link>}
        {!readonly && <Link className={active === "profile" ? "pill active" : "pill"} href="/dashboard/profile">Fiche</Link>}
        <form action={logoutAction}>
          <button className="link-button" type="submit">Déconnexion</button>
        </form>
        <Link className="dots-button" href={emergencyHref} aria-label="Informations d'urgence">•••</Link>
      </nav>
    </header>
  );
}
