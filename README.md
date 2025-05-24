# 🫐 BerryNode Discord Bot

Private Discord bot for BerryNode - MrCappy's Minecraft Hosting Services.

## 📋 Features

### 🎯 Auto Role Management
- Automatically assigns Member role to all new users
- Monitors and re-assigns role if removed
- Bulk role assignment on startup
- Admin command: `!rolecheck`

### 🎫 Ticket System
- Support ticket creation via dropdown menu
- Categories: General, Minecraft Support, Billing, Partnership
- Private ticket channels with support team access
- Ticket closing and deletion with transcripts
- Admin command: `!sendtickets`

### 📊 Comprehensive Logging
Logs all server events to dedicated channel:
- Member joins/leaves/kicks/bans
- Message edits/deletes
- Role updates
- Channel creation/deletion
- Voice channel activity
- Invite creation
- All moderation actions

### 👋 Welcome System
- Sends welcome embed to new members
- Clean, professional design with member avatar

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/MrCappyy/BerryNode-Bot
cd berrynode-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
MEMBER_ROLE_ID=1363744459925491794
```

4. **Run the bot**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure
```
berrynode-bot/
├── events/
│   ├── ready.js              # Bot startup and status
│   ├── guildMemberAdd.js     # New member handling
│   ├── guildMemberUpdate.js  # Role monitoring
│   ├── messageCreate.js      # Commands handling
│   ├── allLogs.js           # Comprehensive logging
│   └── ticketCommand.js      # Ticket panel command
├── tickets/
│   └── ticketHandler.js      # Ticket system logic
├── .env                      # Environment variables (DO NOT COMMIT)
├── .gitignore               # Git ignore rules
├── index.js                 # Main bot file
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Important IDs
- **Member Role**: `1363744459925491794`
- **Log Channel**: `1375679184319545475`
- **Welcome Channel**: `1364042824512704607`
- **Ticket Channel**: `1364040634511659159`
- **Ticket Category**: `1365073975637704756`
- **Support Role**: `1363742523276660847`
- **Ticket Logs**: `1364042025732804608`

### Bot Permissions Required
- View Channels
- Send Messages
- Embed Links
- Manage Roles
- Manage Channels
- Read Message History
- Add Reactions
- View Audit Log
- Attach Files

## 📝 Commands

| Command | Permission | Description |
|---------|------------|-------------|
| `!rolecheck` | Administrator | Manually check and assign roles to all members |
| `!sendtickets` | Administrator | Send ticket creation panel (only in ticket channel) |

## 🎫 Ticket System Usage

1. Admin runs `!sendtickets` in the designated channel
2. Users select support category from dropdown
3. Private ticket channel is created
4. Ticket can be closed by:
   - Ticket creator
   - Support team
   - Administrators
5. Only admins can delete tickets (generates transcript)

## 🔒 Security Notes

- **NEVER commit `.env` file** - Contains bot token
- Keep bot token secret and regenerate if exposed
- This is a private bot for BerryNode server only
- All sensitive IDs are hardcoded for this specific server

## 🛠️ Development

### Adding New Features
1. Create new event files in `events/` folder
2. Follow the existing event structure
3. Bot automatically loads all `.js` files from events folder

### Testing Locally
```bash
# Install nodemon for auto-reload
npm install --save-dev nodemon

# Run in development mode
npm run dev
```

## 📊 Monitoring

The bot logs all actions to:
- Console with `[BerryNode]` prefix
- Dedicated logging channel with embeds
- Ticket transcripts saved on deletion

## 🆘 Troubleshooting

### Bot not coming online
- Check bot token in `.env`
- Ensure all intents are enabled in Discord Developer Portal
- Check console for error messages

### Roles not being assigned
- Verify bot role is above Member role in hierarchy
- Check role ID is correct
- Ensure bot has Manage Roles permission

### Tickets not working
- Verify all channel and category IDs
- Check bot has permissions in the category
- Ensure support role exists

## 👤 Author

Created for **BerryNode** - MrCappy's Minecraft Hosting Services

---

*This is a private bot and not intended for public use. All features are specifically designed for the BerryNode Discord server.*
