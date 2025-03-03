import mineflayer, { Bot } from 'mineflayer';
import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { Config } from '../config.js';

const config = new Config();

const discordBot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

discordBot.login(config.DISCORD_TOKEN);
const DISCORD_CHANNEL_ID = config.DISCORD_CHANNEL_ID!;

class MinecraftBot {
    bot: Bot;

    constructor(username: string, password: string) {
        this.bot = mineflayer.createBot({
            host: 'mc.hypixel.net',
            port: 25565,
            version: '1.19.4',
            username,
            password,
            auth: 'microsoft'
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.bot.on('message', (jsonMsg) => {
            const message = jsonMsg.toString();
            const guildChatMatch = message.match(/^Guild > (?:\[[^\]]+\] )?(\w+) (?:\[[^\]]+\])?: (.+)$/);
            if (guildChatMatch) {
                const username = guildChatMatch[1];
                const chatMessage = guildChatMatch[2];
                this.relayMessage(username, chatMessage);
            }
        });

        this.bot.on('login', () => {
            console.log(`[${this.bot.username}] Logged in.`);
            this.bot.chat("/limbo")
        });

        this.bot.on('error', (err) => {
            console.error(`[${this.bot.username}] Error:`, err);
        });
    }

    relayMessage(username: string, message: string) {
        console.log(`[Guild] ${username}: ${message}`);
        DiscordBot.sendToDiscord(username, message);
    }

    sendMessage(username: string, message: string) {
        this.bot.chat(`/gc ${username}: ${message}`);
    }
}

class Bot1 extends MinecraftBot {
    constructor() {
        super(config.EMAIL_1, config.PASS_1);
    }
}

class Bot2 extends MinecraftBot {
    constructor() {
        super(config.EMAIL_2 as string, config.PASS_2 as string);
    }
}

class DiscordBot {
    static async sendToDiscord(username: string, message: string) {
        const channel = discordBot.channels.cache.get(DISCORD_CHANNEL_ID) as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(0x00AAFF)
            .setAuthor({ name: username, iconURL: `https://mc-heads.net/avatar/${username}` })
            .setThumbnail(`https://mc-heads.net/avatar/Sorky`)
            .setDescription(message)
            .setFooter({ text: 'Made by Sorky <3' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
}

const bot1 = new Bot1();
const bot2 = new Bot2();

bot1.bot.on('message', (jsonMsg) => {
    const message = jsonMsg.toString();
    const guildChatMatch = message.match(/^Guild > (?:\[[^\]]+\] )?(\w+) (?:\[[^\]]+\])?: (.+)$/);
    if (guildChatMatch) {
        bot2.sendMessage(guildChatMatch[1], guildChatMatch[2]);
    }
});

bot2.bot.on('message', (jsonMsg) => {
    const message = jsonMsg.toString();
    const guildChatMatch = message.match(/^Guild > (?:\[[^\]]+\] )?(\w+) (?:\[[^\]]+\])?: (.+)$/);
    if (guildChatMatch) {
        bot1.sendMessage(guildChatMatch[1], guildChatMatch[2]);
    }
});

discordBot.on('messageCreate', async (msg) => {
    if (msg.author.bot || msg.channel.id !== DISCORD_CHANNEL_ID) return;

    const message = `[Discord] ${msg.author.username}: ${msg.content}`;
    bot1.sendMessage(msg.author.username, msg.content);
    bot2.sendMessage(msg.author.username, msg.content);
    console.log(`[Discord -> MC] ${msg.author.username}: ${msg.content}`);
});

discordBot.once('ready', () => {
    console.log(`✅ Discord bot logged in as ${discordBot.user?.tag}`);
});