const mongoose = require('mongoose');
const crypto = require ('crypto');


const {ObjectId } = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({

        userTo: { type: ObjectId, ref: "User" },
        userFrom: { type: ObjectId, ref: "User" },
        notificationType: String,
        opened:{type: Boolean, default: false},
        entityId: ObjectId       
    }, 
    { timestamps: true }
);


NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId)=>{
    var data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId:entityId
    };
    await Notification.deleteOne(data).catch(error => console.log(error));
    return Notification.create(data).catch(error => console.log(error));
}

var Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;