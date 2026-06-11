import "./globals.css";
import Shell from "@/components/Shell";

export const metadata = {
  title: "MyBenefitsPathway",
  description:
    "Track your work, school, volunteering, and income, and see how they count toward CalFresh and Medi-Cal community engagement requirements. Informational tool only.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
