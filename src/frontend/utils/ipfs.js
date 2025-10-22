import axios from 'axios'

// Load dotenv only when running in Node (server-side or scripts).
// This will be ignored in browser builds (where dotenv has no effect).
 

/**
 * Upload a JSON object to Pinata using pinJSONToIPFS.
 * Returns the IpfsHash string, or throws on error.
 */
export async function uploadJsonToIPFS(metadata) {
  if (!metadata) {
    console.error('IPFS Error: metadata is undefined');
    throw new Error('metadata undefined');
  }

  // Support both CRA and Vite env var names (CRA preferred)
  const key1 = '040f85a27334fe7f1ba8';
  const key2 = 'f9c2de8eab32c1c5bffd874db35683d2fb558490d1ff3d5541da8551839e9a60';

  if (!key1 || !key2) {
    console.error('IPFS Error: Pinata API keys are not available in env')
    throw new Error('Pinata env vars missing')
  }

  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: key1,
          pinata_secret_api_key: key2,
        },
      }
    )

    return res.data.IpfsHash
  } catch (err) {
    console.error('IPFS Error:', err.response?.data || err)
    throw err
  }
}

 
export async function uploadFileToIPFS(file) {
  if (!file) {
    throw new Error('file is undefined')
  }
 
  const key1 = '040f85a27334fe7f1ba8';
  const key2 = 'f9c2de8eab32c1c5bffd874db35683d2fb558490d1ff3d5541da8551839e9a60';

  if (!key1 || !key2) {
    console.error('IPFS Error: Pinata API keys are not available in env')
    throw new Error('Pinata env vars missing')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: key1,
        pinata_secret_api_key: key2,
      },
    })

    return res.data.IpfsHash
  } catch (err) {
    console.error('IPFS Error (file):', err.response?.data || err)
    throw err
  }
}
