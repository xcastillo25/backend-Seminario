const axios = require('axios');

// Función para obtener el token OAuth2
async function getOAuth2AccessToken() {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const scope = process.env.AZURE_SCOPE;

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    try {
        const response = await axios.post(url, new URLSearchParams({
            client_id: clientId,
            scope: scope,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        }));

        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo el token OAuth2:', error.response.data);
        throw new Error('Failed to obtain OAuth2 access token');
    }
}

module.exports = { getOAuth2AccessToken };
