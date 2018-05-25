
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

exports.sendReqNotification = functions.database.ref('/notifications/{notifications_id}')
    .onCreate((snapshot, context) => {

        //const user_id = context.params.user_id;
        const notifications_id = context.params.notifications_id;
        

        const fromUser = admin.database().ref(`/notifications/${notifications_id}`).once('value');
        return fromUser.then(fromUserResult =>{
            const from_user_id = fromUserResult.val().from;
            
            
            //console.log('you have new notification from :',from_user_id);

            const userQuery = admin.database().ref(`/users/${from_user_id}/name`).once('value');
            return userQuery.then(userResult =>{
                const usereName = userResult.val();

                const deviceToken = admin.database().ref(`/users/BP6sgUJ3dxP0uZT4Yl8sGd9nCOk1/deviceToken`).once('value');
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
                        return console.log('This was the notification Freature',tokenId);
                    });
                });
                
            });
            
        });   

        });
             
    });


exports.sendAcceptNotification = functions.database.ref('/notifications/{notifications_id}')
    .onUpdate((change, context) => {
        const notifications_id = context.params.notifications_id;
        //const after = change.context.val();
        //return console.log('value is updated',after);
        const typee = admin.database().ref(`/notifications/${notifications_id}/type`).once('value');
        return typee.then(typename =>{
            const tp = typename.val();
            if(tp === "accepted"){
                const notificationdetail = admin.database().ref(`/notifications/${notifications_id}`).once('value'); //refer to notification object
                return notificationdetail.then(notresult =>{
                    const userId = notresult.val().from;
                    const reqNode = notresult.val().uqid;
                    const toUser = admin.database().ref(`/requests/${reqNode}/${userId}`).once('value'); //meeting info
                    return toUser.then(userResult =>{
                        const agenda = userResult.val().agenda;
                        const heading = userResult.val().heading;
                        const reqdate = userResult.val().date;
                        const getTokend = admin.database().ref(`/users/${userId}/deviceToken`).once('value');
                        return getTokend.then(toktok =>{
                            const tokenidd = toktok.val();
                            const payload = {
                                notification:{
                                    title : "Response to Your Request",
                                    body : `Your meeting request has been accepted for ${reqdate}`,
                                    icon : 'default',
                                    click_action : 'android.intent.action.NotificationTo'
                                },
                                data :{
                                    heading : heading,
                                    agenda : agenda,
                                    reqdate : reqdate,
                                    fd : reqNode
                                }
                            };
                            return admin.messaging().sendToDevice(tokenidd, payload).then(response =>{
                                console.log('by this person',userId);
                                return console.log('To this token',tokenidd);
                            });
                        });
                    });
                });
            }
            return console.log('new type is ',tp);
        });
    });




    // const adminToken = admin.database().ref(`/users/BP6sgUJ3dxP0uZT4Yl8sGd9nCOk1/deviceToken`).once('value');
    //             return adminToken.then(adToken =>{

    //             });