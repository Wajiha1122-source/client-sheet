import "./globals.css";

export const metadata = {
  title: "Client Sheet",
  description: "CEO and office client sheet management software"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
