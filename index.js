require('dotenv').config();
const express = require('express');
const { getPhoneNumbers, sendMessage } = require('./utils');

const app = express();

const port = process.env.PORT
const clientId = process.env.CLIENT_ID
const redirectUrl = process.env.REDIRECT_URL
let phoneNumberId = null;
let accessToken = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/token', (req, res) => {
    res.sendFile(__dirname + '/public/token.html');
});

app.get('/oauth/whatsapp/connect', (req, res) => {
    res.redirect(`https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&display=popup&redirect_uri=${redirectUrl}&response_type=token&scope=whatsapp_business_management,whatsapp_business_messaging`)
})

app.post('/oauth/whatsapp/callback', (req, res)=>{
    const accessTokenFromBody = req.body.access_token;
    if (accessTokenFromBody) {
        accessToken = accessTokenFromBody;
        console.log('Access Token:', accessToken);
        res.status(200).json({ message: 'Access Token received successfully' });
    } else {
        res.status(400).json({ error: 'Access Token not found' });
    }
})

app.get('/whatsapp/webhook', async (req, res) => {
    // console.log("Request body in GET : ", req.body)
    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            res.status(200).send(challenge)
        }else {
            res.status(403).send()
        }
    }
})

app.post('/whatsapp/webhook', async (req, res) => {
    console.log("Request body in POST : ", JSON.stringify(req.body, null, 2))
    phoneNumberId = req.body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    const From = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || null;
    const textReceived = req.body.entry?.[0].changes?.[0].value.messages?.[0].text.body || null;
    if(From && textReceived){
        console.log(`Received text ${textReceived} from ${From}`)
        const messageResult = await sendMessage(From, phoneNumberId, accessToken)
        console.log("MESSAGE RESULT : ", messageResult)
        return res.status(200).send();
    }
    res.status(200).send("Message from Whatsapp DM responder")
})

app.get('/get-phone-numbers', async (req, res) => {
    const phoneNumbers = await getPhoneNumbers('111576291812699')
    res.status(200).json({phoneNumbers})
})

app.listen(port, () => {
    console.log(`Server is running on https://${port}.code-amaan.w3d.run`);
});
