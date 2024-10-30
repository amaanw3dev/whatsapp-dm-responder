require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const app = express();

const port = process.env.PORT
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/whatsapp/webhook', async (req, res) => {
    const { Body, From } = req.body;
    // console.log("request body : ", req.body)
    // console.log(`Received message from ${From}: ${Body}`);

    try {
        const response = await client.messages.create({
            body: `You said : ${Body}`,
            from: `whatsapp:${whatsappNumber}`,
            to: From
        });
        console.log("Message sent : ", response.body)
        
        res.status(200).send('Message received and responded to');
    } catch (error) {
        console.error("Error sending message:", error?.message);
        res.status(500).send('Error sending message');
    }
});

app.listen(port, () => {
    console.log(`Server is running on https://${port}.code-amaan.w3d.run`);
});
