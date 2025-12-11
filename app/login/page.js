export default function LoginPage() {
  const handleClick = () => alert('✅ Login mock - API funcionando!')
  
  return (
    <div style={{ padding: '40px' }}>
      <h1>Login EcoEnergy</h1>
      <p>Clique para testar a API de login</p>
      <button onClick={handleClick} style={{ padding: '10px 20px' }}>
        Testar Login
      </button>
    </div>
  )
}
