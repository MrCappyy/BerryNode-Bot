const { Events, ActivityType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`[BerryNode] ✅ Bot is online!`);
        console.log(`[BerryNode] 🤖 Logged in as: ${client.user.tag}`);
        console.log(`[BerryNode] 📊 Servers: ${client.guilds.cache.size}`);
        console.log(`[BerryNode] 🎯 Auto-role ready: ${process.env.MEMBER_ROLE_ID}`);
        console.log(`[BerryNode] 💬 Commands: !rolecheck (admin only)`);
        
        // Set bot status - Changed to just "BerryNode"
        client.user.setActivity('BerryNode', { type: ActivityType.Watching });
        
        // Send startup log
        const logChannel = client.channels.cache.get('1375679184319545475');
        if (logChannel) {
            const startupEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🚀 Bot Started')
                .setDescription('BerryNode bot is now online and monitoring!')
                .addFields(
                    { name: '🤖 Bot', value: client.user.tag, inline: true },
                    { name: '📊 Servers', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '🎯 Auto-Role', value: `<@&${process.env.MEMBER_ROLE_ID}>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [startupEmbed] });
        }
        
        // Check all existing members and assign role if they don't have it
        console.log(`[BerryNode] 🔍 Checking existing members for missing roles...`);
        
        const roleId = process.env.MEMBER_ROLE_ID;
        let totalAssigned = 0;
        const assignedMembers = [];
        
        // Loop through all guilds
        for (const guild of client.guilds.cache.values()) {
            try {
                // Fetch all members
                await guild.members.fetch();
                
                const role = guild.roles.cache.get(roleId);
                if (!role) {
                    console.error(`[BerryNode] ❌ Role ${roleId} not found in ${guild.name}`);
                    continue;
                }
                
                // Check each member
                for (const member of guild.members.cache.values()) {
                    // Skip bots
                    if (member.user.bot) continue;
                    
                    // Check if member doesn't have the role
                    if (!member.roles.cache.has(roleId)) {
                        try {
                            await member.roles.add(role);
                            console.log(`[BerryNode] ✅ Assigned role to: ${member.user.tag}`);
                            assignedMembers.push(member);
                            totalAssigned++;
                            
                            // Small delay to avoid rate limits
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            console.error(`[BerryNode] ❌ Failed to assign role to ${member.user.tag}:`, error.message);
                        }
                    }
                }
            } catch (error) {
                console.error(`[BerryNode] ❌ Error checking members in ${guild.name}:`, error.message);
            }
        }
        
        // Log bulk role assignment
        if (totalAssigned > 0 && logChannel) {
            const bulkEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('🔄 Bulk Role Assignment')
                .setDescription(`Assigned Member role to ${totalAssigned} users during startup check`)
                .addFields(
                    { name: '👥 Users', value: assignedMembers.slice(0, 10).map(m => `• ${m.user.tag}`).join('\n') + (totalAssigned > 10 ? `\n... and ${totalAssigned - 10} more` : ''), inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [bulkEmbed] });
        }
        
        if (totalAssigned > 0) {
            console.log(`[BerryNode] 🎉 Assigned role to ${totalAssigned} existing members!`);
        } else {
            console.log(`[BerryNode] ✅ All existing members already have the role!`);
        }
        
        // Store log channel ID globally for other events
        client.logChannelId = '1375679184319545475';
        
        // Set up periodic check every 30 seconds
        setInterval(async () => {
            for (const guild of client.guilds.cache.values()) {
                const role = guild.roles.cache.get(roleId);
                if (!role) continue;
                
                // Only check cached members to reduce API calls
                for (const member of guild.members.cache.values()) {
                    if (member.user.bot) continue;
                    
                    if (!member.roles.cache.has(roleId)) {
                        try {
                            await member.roles.add(role);
                            console.log(`[BerryNode] 🔄 Re-assigned role to ${member.user.tag} (periodic check)`);
                            
                            // Log periodic reassignment
                            const logChannel = client.channels.cache.get(client.logChannelId);
                            if (logChannel) {
                                const periodicEmbed = new EmbedBuilder()
                                    .setColor('#ffff00')
                                    .setTitle('🔄 Automatic Role Recovery')
                                    .setDescription('Role was missing and has been automatically reassigned')
                                    .addFields(
                                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                                        { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                                        { name: '⚡ Action', value: 'Periodic Check', inline: true }
                                    )
                                    .setTimestamp()
                                    .setFooter({ text: 'BerryNode Logging System', iconURL: client.user.displayAvatarURL() });
                                
                                await logChannel.send({ embeds: [periodicEmbed] });
                            }
                        } catch (error) {
                            // Silent fail to avoid spam
                        }
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }
};