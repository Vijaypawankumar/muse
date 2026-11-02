import "./globals.css";
import Nav from "./nav";

export const metadata = {
  title: "MUSE",
  description: "Your ideas deserve to be created.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15111a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="page">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
