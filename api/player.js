// api/player.js
// Vercel Serverless Function to proxy Supercell API calls
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { tag } = req.query;
  if (!tag) {
    return res.status(400).json({ error: 'El tag del jugador es obligatorio.' });
  }

  // Formatear el tag del jugador (ej: #G2LPQ0YV)
  let formattedTag = tag.trim().toUpperCase();
  if (!formattedTag.startsWith('#')) {
    formattedTag = '#' + formattedTag;
  }
  
  // Reemplazar # por %23 para la URL de la API de Supercell
  const apiTag = formattedTag.replace('#', '%23');
  const apiKey = process.env.CLASH_ROYALE_API_KEY;

  // Función de fallback para cargar ejemplojson.json
  const sendMockFallback = (errorMessage) => {
    console.warn(`[Fallback] ${errorMessage}. Cargando datos simulados.`);
    try {
      const filePath = path.join(process.cwd(), 'documentacion', 'ejemplojson.json');
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      
      // Personalizar el tag con el solicitado por el usuario
      data.tag = formattedTag;
      return res.status(200).json(data);
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: `Error original: ${errorMessage}. Además, falló el fallback: ${fallbackError.message}` 
      });
    }
  };

  if (!apiKey) {
    return sendMockFallback('La API Key de Clash Royale no está configurada');
  }

  try {
    const apiResponse = await fetch(`https://api.clashroyale.com/v1/players/${apiTag}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) {
        return res.status(404).json({ error: 'Jugador no encontrado. Verifica el tag e intenta nuevamente.' });
      }
      return sendMockFallback(`Error de la API de Supercell (${apiResponse.status} - ${apiResponse.statusText})`);
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return sendMockFallback('Error de red al conectar con la API de Supercell: ' + error.message);
  }
};
