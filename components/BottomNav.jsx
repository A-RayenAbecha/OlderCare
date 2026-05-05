import Link from "next/link";

export default function BottomNav({ active = "home", shared = true }) {
  const items = [
    { key: "home", href: "/dashboard", icon: "⌂", label: "Accueil" },
    { key: "medications", href: "/dashboard/medications", icon: "💊", label: "Médicaments" },
    { key: "appointments", href: "/dashboard/appointments", icon: "🗓", label: "Rendez-vous" },
    { key: "vaccines", href: "/dashboard/vaccines", icon: "💉", label: "Vaccins" }
  ];

  return (
    <nav className={shared ? "medical-mobile-nav shared-dashboard-nav" : "medical-mobile-nav"}>
      {items.map((item) => (
        <Link key={item.key} className={active === item.key ? "active" : ""} href={item.href}>
          <span>{item.icon}</span>{item.label}
        </Link>
      ))}
    </nav>
  );
}
