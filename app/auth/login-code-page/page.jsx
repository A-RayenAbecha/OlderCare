import Link from "next/link";
import { redirectIfLoggedIn } from "@/lib/auth";

export default async function LoginCodePage({ searchParams }) {
  await redirectIfLoggedIn();
  const params = await searchParams;

  return (
    <main className="app-shell auth-shell auth-login-shell">
      <div className="topbar">
        <Link className="icon-button" href="/auth/welcome">←</Link>
        <strong>Connexion sécurisée</strong>
        <span />
      </div>
      <section className="content">
        <h1 className="title-lg">Entrez votre<br />code bracelet</h1>
        <p className="subtitle">Utilisez le code unique inscrit sur votre bracelet, puis choisissez Personnel médical, Patient ou Autre.</p>
        {params?.error && <p className="notice">{params.error}</p>}
        <form method="post" action="/auth/login-code" className="form-panel white-card form-stack">
          <div className="field">
            <label>Code bracelet</label>
            <input type="password" name="code" placeholder="BRACELET-001" autoComplete="off" required />
          </div>
          <button className="primary-btn">SE CONNECTER</button>
        </form>
      </section>
    </main>
  );
}
