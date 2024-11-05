const axios = require('axios');

const getPhoneNumbers = async (wabaId) => {
  const accessToken = process.env.ACCESS_TOKEN
    try {
      const response = await axios.get(`https://graph.facebook.com/v16.0/${wabaId}/phone_numbers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
  
      return response.data.data
    } catch (error) {
      console.error('Error fetching phone numbers:', error.response ? error.response.data : error.message);
    }
};

async function sendMessage(recipientNumber, phoneNumberId, accessToken) {
  const data = {
    messaging_product: "whatsapp",
    to: recipientNumber,
    type: "template",
    template: {
      name: "hello_world",
      language: { code: "en_US" }
    }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

module.exports = {
  getPhoneNumbers,
  sendMessage
}