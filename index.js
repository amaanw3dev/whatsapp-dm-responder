require('dotenv').config();
const express = require('express');
const { getPhoneNumbers, sendMessage } = require('./utils');
const { createUser, findUserById, updateAccessToken } = require('./db/queries');

const app = express();

const port = process.env.PORT
const clientId = process.env.CLIENT_ID
let redirectUrl = process.env.REDIRECT_URL
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

app.get('/whatsapp/get-businesses', async (req, res) => {
    const accessToken = req.query.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/me/businesses?access_token=${accessToken}`);
      const data = await response.json();
  
      if (response.ok) {
        res.status(200).json(data);
      } else {
        res.status(response.status).json(data);
      }
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch businesses: ${error.message}` });
    }
});

app.get('/whatsapp/get-whatsapp-businesses', async (req, res) => {
    const accessToken = req.query.access_token;
    const selectedAccountId = req.query.selected_account;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${selectedAccountId}/owned_whatsapp_business_accounts?access_token=${accessToken}`);
      const data = await response.json();
  
      if (response.ok) {
        res.status(200).json(data);
      } else {
        res.status(response.status).json(data);
      }
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch businesses: ${error.message}` });
    }
});

let currentUserId = null
let currentUserEmail = null

app.get('/oauth/whatsapp/connect', (req, res) => {
    const { user_id, user_email } = req.query
    currentUserId = user_id
    currentUserEmail = user_email
    res.redirect(`https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&display=popup&redirect_uri=${redirectUrl}&response_type=token&scope=whatsapp_business_management,whatsapp_business_messaging,business_management`)
})

app.post('/store-user', async (req, res)=>{
    const accessTokenFromBody = req.body.access_token;
    if (accessTokenFromBody) {
        accessToken = accessTokenFromBody;
        console.log('Access Token:', accessToken);
        const existingUser = await findUserById(currentUserId)
        console.log("EXISTING USER : ", existingUser)
        if(!existingUser[0]){
            const storedUser = await createUser({
                id: currentUserId,
                email: currentUserEmail,
                accessToken
            })
            res.status(201).json({userId: currentUserId, message : `User stored successfully`});
        }
        else{
            await updateAccessToken(existingUser[0].id, accessToken)
            res.status(200).json({userId: existingUser[0].id, message : `Updated access token`})
        }
    } else {
        res.status(400).json({ error: 'Access Token not found' });
    }
})

app.get('/get-user', async (req, res) => {
    const { user_id } = req.query
    try {
        const userData = await findUserById(user_id)
        res.status(200).json(userData[0])
    } catch (error) {
        console.log("error while getting user : ", error?.message)
        res.status(500).json("Internal Server Error")
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

app.get('/whatsapp/get-phone-numbers', async (req, res) => {
    const {selected_whatsapp_account, access_token} = req.query
    const phoneNumbers = await getPhoneNumbers(selected_whatsapp_account, access_token)
    res.status(200).json(phoneNumbers)
})

app.listen(port, () => {
    console.log(`Server is running on https://${port}.code-amaan.w3d.run`);
});
