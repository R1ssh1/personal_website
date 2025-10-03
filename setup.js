const fetch = require('node-fetch');

async function setupAdmin() {
  try {
    const response = await fetch('http://localhost:3003/api/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Setup result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupAdmin();