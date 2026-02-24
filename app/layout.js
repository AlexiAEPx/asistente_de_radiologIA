export const metadata = {
  title: "asistente_de_radiologIA",
  description: "Estación de trabajo radiológico con IA — by Alexis Espinosa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body { overflow: hidden; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
