import { IsNotEmpty, IsString, IsUrl} from "class-validator";

export class createDto{
    @IsNotEmpty()
    @IsString()
    @IsUrl({require_protocol: true})
    original: string;
}