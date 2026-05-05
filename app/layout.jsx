import "./globals.css";
import BodyRouteClass from "@/components/BodyRouteClass";

export const metadata = {
  title: "OlderCare",
  description: "Espace santé connecté au bracelet médical",
  icons: {
    icon: "/images/favicon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <BodyRouteClass />
        {children}
      </body>
    </html>
  );
}
