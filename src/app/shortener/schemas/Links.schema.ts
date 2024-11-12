import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Links{
    @Prop({ unique: true, required: true })
    original: string;;

    @Prop()
    num?: number;

    @Prop()
    shortCode: string;

    @Prop({ default: 0 })
    usageTimes: number;
}

export const LinksSchema = SchemaFactory.createForClass(Links);

