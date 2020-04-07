'use-strict'
const functions = require('firebase-functions');

// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// // exports.helloWorld = functions.https.onRequest((request, response) => {
// //  response.send("Hello from Firebase!");
// // });

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database.ref('/notifications/{user_id}/{notification_id}').onWrite((change, event) =>{

    const user_id = event.params.user_id;
    const notification_id = event.params.notification_id;

    console.log('We have a notification from : ', user_id);
      if(!change.after.exists()){

        return console.log('A Notification has been deleted from the database : ', notification_id);

     }
     let sender,type,name;
     
    return admin.database().ref(`/notifications/${user_id}/${notification_id}`).once('value')
          .then((data)=>{
            sender = data.val().sender;
            type = data.val().Type;
            console.log("sender " + sender + "type " + type);
            return admin.database().ref(`Users/${sender}/name`).once('value');
            
          })
          .then((dat)=>{
              name = dat.val();

            return admin.database().ref(`/Users/${user_id}/device_token`).once('value');
          })
          .then((result)=>{
            const token_id=result.val();
            let body,title,clickAction;
            if(type === 'Request'){
                title = "New Friend Request"
                body = `${name} sent you friend request`;
                clickAction = "com.example.chatApp.TARGET_NOTIFICATION"
            }
            if(type === 'Message'){
                title = "New Message"
                body = `New message from ${name}`;
                clickAction = "com.example.chatApp.TARGET_NOTIFICATION_MESSAGE"
            }

            const payload = {
                 
                notification:{
                    title: title,
                    body:  body,
                    icon: "default",
                    click_action: clickAction
                },
                data: {
                    user2: sender,
                }
            };
            return admin.messaging().sendToDevice(token_id,payload);  
          })
    .then((response)=>{ 
     return console.log("This was the notification Feature..");
    }).catch((err)=>{console.log(err)});
});



