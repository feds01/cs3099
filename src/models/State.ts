import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IState {
    state: string;
    from: string;
}

interface IStateDocument extends IState, Document {}

interface IStateModel extends Model<IStateDocument> {}

const StateSchema = new Schema<IState, IStateModel, IState>(
    {
        from: { type: String, required: true },
        state: { type: String, required: true },
    },
    { timestamps: true },
);

export default mongoose.model<IState, IStateModel>('state', StateSchema);
