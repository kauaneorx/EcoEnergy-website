export const metadata = {
  title: 'EcoEnergy',
  description: 'Website EcoEnergy',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
