import dotenv from 'dotenv'
const config = dotenv.config()

export class Config {
    EMAIL_1: string = process.env.EMAIL_1!;
    PASS_1: string = process.env.PASS_1!;
    EMAIL_2: string = process.env.EMAIL_2!;
    PASS_2: string = process.env.PASS_2!;
    DISCORD_TOKEN: string = process.env.DISCORD_TOKEN!;
    DISCORD_CHANNEL_ID: string = process.env.DISCORD_CHANNEL_ID!;
}