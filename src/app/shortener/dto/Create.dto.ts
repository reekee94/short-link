import { IsNotEmpty, IsString } from "class-validator";

export class createDto{
    @IsNotEmpty()
    @IsString()
    original: string;

}