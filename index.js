// BerryNode Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create bot client with ALL necessary intents for comprehensive logging
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ]
});

// Load event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    // Check if it's the allLogs.js file (array of events)
    if (Array.isArray(event)) {
        // Load multiple events from allLogs.js
        for (const logEvent of event) {
            if (logEvent.once) {
                client.once(logEvent.name, (...args) => logEvent.execute(...args));
            } else {
                client.on(logEvent.name, (...args) => logEvent.execute(...args));
            }
            console.log(`[BerryNode] Loaded log event: ${logEvent.name}`);
        }
    } else {
        // Load single event files
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`[BerryNode] Loaded event: ${event.name}`);
    }
}

// Load ticket handlers
const ticketsPath = path.join(__dirname, 'tickets');
if (fs.existsSync(ticketsPath)) {
    const ticketFiles = fs.readdirSync(ticketsPath).filter(file => file.endsWith('.js'));
    
    for (const file of ticketFiles) {
        const filePath = path.join(ticketsPath, file);
        const handler = require(filePath);
        
        if (handler.once) {
            client.once(handler.name, (...args) => handler.execute(...args));
        } else {
            client.on(handler.name, (...args) => handler.execute(...args));
        }
        console.log(`[BerryNode] Loaded ticket handler: ${file}`);
    }
}

// Error handling
client.on('error', error => {
    console.error('[BerryNode] Bot error:', error);
});

process.on('unhandledRejection', error => {
    console.error('[BerryNode] Unhandled error:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN);