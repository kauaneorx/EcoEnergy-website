export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('✅ API /register recebeu:', data);
    
    // Resposta SIMPLES que funciona
    return Response.json({
      success: true,
      message: "Registration successful",
      user: {
        id: Date.now(),
        email: data.emailOrPhone || data.email,
        name: data.name || "User"
      },
      token: "mock_jwt_token_" + Date.now()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// Para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
