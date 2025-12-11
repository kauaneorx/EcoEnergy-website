export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2ecc71' }}>🌿 EcoEnergy Website</h1>
      <p>✅ Site online e funcionando!</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          background: '#0070f3', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Acessar Login
        </a>
      </div>
    </div>
  )
}
