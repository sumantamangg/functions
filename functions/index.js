// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
'use strict'
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendFollowerNotification = functions.database.ref('/notifications/{notifications_id}')
    .onWrite((change, context) => {

        const user_id = context.params.user_id;
        const notifications_id = context.params.notifications_id;
        console.log("user id = ",user_id);

        if(!change.after.val()){
            return console.log('A Notification has been deleted from the databse: ',user_id);
            
        }
        const fromUser = admin.database().ref(`/notifications/${notifications_id}`).once('value');
        return fromUser.then(fromUserResult =>{
            const from_user_id = fromUserResult.val().from;
            
            
            //console.log('you have new notification from :',from_user_id);

            const userQuery = admin.database().ref(`/users/${from_user_id}/name`).once('value');
            return userQuery.then(userResult =>{
                const usereName = userResult.val();

                const deviceToken = admin.database().ref(`/users/${user_id}/deviceToken`).once('value');
                return deviceToken.then(result =>{

                const tokenId = result.val();
                const reqNode = fromUserResult.val().uqid;  //request pachi ko node
                const displayInfo = admin.database().ref(`/requests/${reqNode}/${from_user_id}`).once('value');
                return displayInfo.then(displayreq =>{

                    const heading = displayreq.val().heading;
                    const agenda = displayreq.val().agenda;
                    const reqdate = displayreq.val().date;
                    const fd = fromUserResult.val().uqid;
                    const payload = {
                        notification:{
                            title : "Request for meeting",
                            body : `${usereName} has sent you request`,
                            icon : 'default',
                            click_action : 'android.intent.action.NotificationTo'
                        },
                        data :{
                            from_user_id : from_user_id,
                            partyname : `${usereName}`,
                            heading : heading,
                            agenda : agenda,
                            reqdate : reqdate,
                            fd : fd
                        }
                };
                
                     return admin.messaging().sendToDevice(tokenId, payload).then(response =>{
                        return console.log('This was the notification Freature');
                    });
                });
                
            });
            
        });   

        });
             
    });