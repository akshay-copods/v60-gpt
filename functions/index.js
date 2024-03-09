const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.capitalizeMessage = functions.https.onRequest(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const message = req.body.data.text;
  console.log('message', {message,body:req.body});
  if (!message) {
    res.status(400).send('No message provided');
    return;
  }

  const capitalizedMessage = message.toUpperCase();
  const chatsRef = admin.firestore().collection('chats');
  await chatsRef.add({
    text: capitalizedMessage,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    user: {_id: 4, name: 'Automated Capitalizer'}, // Assuming user 4 is your bot
  });
  
  res.send(true);
});
