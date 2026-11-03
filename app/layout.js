import "./globals.css";
import Nav from "./nav";

export const metadata = {
  title: "MUSE",
  description: "Your ideas deserve to be created.",
  appleWebApp: { capable: true, title: "MUSE", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#120e17",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className="page">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
