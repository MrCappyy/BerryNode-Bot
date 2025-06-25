Got it — here's the cleaned-up, more professional and slightly aggressive version of the README. No emojis, no fluff, but still human and sharp.

---

# BerryNode Discord Bot

**This bot is private and not intended for public use (This is just a showcase). If you want a custom version or want to license this commercially, message `@MrCappy1` on Discord.**

Private, in-house Discord bot used for **BerryNode’s** support server. Built for automation, control, and not dealing with bullshit.

---

## Features

### Role Management

* Automatically assigns `Member` role to all new users
* Re-applies the role if someone removes it (why would they even try?)
* Bulk role assignment on bot startup
* Admin command: `!rolecheck`

### Ticket System

* Ticket creation via dropdown panel
* Categories: General, Minecraft Support, Billing, Partnerships
* Auto-generates private channels visible only to support staff
* Transcripts saved on deletion
* Admin-only command: `!sendtickets`

### Logging System

Logs damn near everything to a logging channel:

* Joins, leaves, bans, kicks
* Message deletes and edits
* Role updates
* Channel creation/deletion
* Voice activity
* Invite creation
* Every moderation action gets tracked

### Welcome System

* Sends a clean welcome embed with the user’s avatar
* Looks polished and works every damn time

---

## Install It (If You're Dumb Enough to Try)

1. Clone the repo:

```bash
git clone https://github.com/MrCappyy/BerryNode-Bot
cd berrynode-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create your `.env` file:

```env
DISCORD_TOKEN=YOUR_TOKEN_HERE
MEMBER_ROLE_ID=1363744459925491794
```

4. Run the bot:

```bash
npm start
```

For dev mode with auto-reload (nodemon):

```bash
npm run dev
```

---

## Project Structure

```
berrynode-bot/
├── events/               # Event handlers
│   ├── ready.js
│   ├── guildMemberAdd.js
│   ├── guildMemberUpdate.js
│   ├── messageCreate.js
│   ├── allLogs.js
│   └── ticketCommand.js
├── tickets/
│   └── ticketHandler.js
├── .env                  # Your token (don’t be stupid and commit this)
├── index.js              # Entry point
├── package.json
└── README.md
```

---

## Configuration

### Hardcoded IDs

* Member Role: `1363744459925491794`
* Log Channel: `1375679184319545475`
* Welcome Channel: `1364042824512704607`
* Ticket Panel Channel: `1364040634511659159`
* Ticket Category: `1365073975637704756`
* Support Role: `1363742523276660847`
* Ticket Logs: `1364042025732804608`

### Permissions Required

* View Channels
* Send Messages
* Embed Links
* Manage Roles
* Manage Channels
* Read Message History
* Add Reactions
* View Audit Log
* Attach Files

---

## Commands

| Command        | Permission | What It Does                         |
| -------------- | ---------- | ------------------------------------ |
| `!rolecheck`   | Admin      | Mass-checks and fixes roles          |
| `!sendtickets` | Admin Only | Posts the dropdown panel for tickets |

---

## How Tickets Work

1. Admin runs `!sendtickets`
2. User picks a category
3. Bot creates a private channel
4. Only support, the user, and admins can see it
5. Ticket can be closed by staff or the user
6. Only admins can delete tickets (generates transcript)

---

## Security Notes

* Don’t ever commit your `.env`.
* If you leak your bot token, you’re an idiot. Regenerate it immediately.
* This bot is **hardcoded** to the BerryNode server. Don't waste time trying to port it.

---

## Development Notes

* Add new event files in `/events` — it auto-loads them
* Follow the structure or it breaks
* For dev mode, use nodemon:

```bash
npm run dev
```

---

## Monitoring & Logging

* Logs all actions to:

  * Console (with `[BerryNode]` prefix)
  * Logging channel (embed style)
  * Transcripts saved on deletion

---

## Troubleshooting

**Bot won’t come online?**

* Double-check the token
* Enable intents in Discord dev panel
* Check console logs like an adult

**Roles not being assigned?**

* Bot role must be above Member
* Make sure the role ID is correct
* Permissions: Manage Roles

**Tickets not working?**

* Wrong IDs, missing channels, or perms
* Make sure bot can view and create channels in the category
* Support role must exist

---

## Author

Made by MrCappy for **BerryNode Minecraft Hosting**
If you’re not part of that, don’t touch this. 
