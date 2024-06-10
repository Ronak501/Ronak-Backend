import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "Plan"
    }
},{
    timestamps: true
});     

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
