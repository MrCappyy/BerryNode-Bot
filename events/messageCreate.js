const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;
        
        const logChannel = message.client.channels.cache.get(message.client.logChannelId || '1375679184319545475');
        
        // Check for !rolecheck command
        if (message.content === '!rolecheck') {
            // Check if user has admin permissions
            if (!message.member.permissions.has('Administrator')) {
                const deniedEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Permission Denied')
                    .setDescription(`${message.author} attempted to use !rolecheck without permissions`)
                    .addFields(
                        { name: '👤 User', value: `${message.author.tag}`, inline: true },
                        { name: '📍 Channel', value: `${message.channel}`, inline: true },
                        { name: '⚠️ Required', value: 'Administrator', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: message.client.user.displayAvatarURL() });
                
                if (logChannel) await logChannel.send({ embeds: [deniedEmbed] });
                return message.reply('❌ You need Administrator permissions to use this command!');
            }
            
            // Log command usage
            if (logChannel) {
                const commandEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🔧 Command Executed')
                    .setDescription('!rolecheck command initiated')
                    .addFields(
                        { name: '👤 Admin', value: `${message.author} (${message.author.tag})`, inline: true },
                        { name: '📍 Channel', value: `${message.channel}`, inline: true },
                        { name: '⚡ Action', value: 'Role Check Started', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: message.client.user.displayAvatarURL() });
                
                await logChannel.send({ embeds: [commandEmbed] });
            }
            
            const roleId = process.env.MEMBER_ROLE_ID;
            const role = message.guild.roles.cache.get(roleId);
            
            if (!role) {
                return message.reply(`❌ Role with ID ${roleId} not found!`);
            }
            
            const statusMsg = await message.reply('🔍 Checking all members...');
            
            let assignedCount = 0;
            let checkedCount = 0;
            const assignedMembers = [];
            
            try {
                // Fetch all members
                await message.guild.members.fetch();
                
                for (const member of message.guild.members.cache.values()) {
                    // Skip bots
                    if (member.user.bot) continue;
                    
                    checkedCount++;
                    
                    // Check if member doesn't have the role
                    if (!member.roles.cache.has(roleId)) {
                        try {
                            await member.roles.add(role);
                            assignedCount++;
                            assignedMembers.push(member);
                            console.log(`[BerryNode] ✅ Assigned role to ${member.user.tag} via !rolecheck`);
                            
                            // Small delay to avoid rate limits
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            console.error(`Failed to assign role to ${member.user.tag}:`, error);
                        }
                    }
                }
                
                await statusMsg.edit(`✅ **Role check complete!**\n📊 Checked: ${checkedCount} members\n✨ Assigned role to: ${assignedCount} members`);
                
                // Log results
                if (logChannel) {
                    const resultsEmbed = new EmbedBuilder()
                        .setColor(assignedCount > 0 ? '#ffa500' : '#00ff00')
                        .setTitle('✅ Role Check Complete')
                        .setDescription(`Manual role check completed by ${message.author}`)
                        .addFields(
                            { name: '📊 Members Checked', value: `${checkedCount}`, inline: true },
                            { name: '✨ Roles Assigned', value: `${assignedCount}`, inline: true },
                            { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true }
                        );
                    
                    if (assignedCount > 0) {
                        resultsEmbed.addFields({
                            name: '👥 Users Updated',
                            value: assignedMembers.slice(0, 10).map(m => `• ${m.user.tag}`).join('\n') + (assignedCount > 10 ? `\n... and ${assignedCount - 10} more` : ''),
                            inline: false
                        });
                    }
                    
                    resultsEmbed
                        .setTimestamp()
                        .setFooter({ text: 'BerryNode Logging System', iconURL: message.client.user.displayAvatarURL() });
                    
                    await logChannel.send({ embeds: [resultsEmbed] });
                }
                
            } catch (error) {
                console.error('Error in rolecheck command:', error);
                await statusMsg.edit('❌ An error occurred while checking roles.');
                
                // Log error
                if (logChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Role Check Error')
                        .setDescription('An error occurred during manual role check')
                        .addFields(
                            { name: '👤 Admin', value: `${message.author.tag}`, inline: true },
                            { name: '⚠️ Error', value: error.message || 'Unknown error', inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'BerryNode Logging System', iconURL: message.client.user.displayAvatarURL() });
                    
                    await logChannel.send({ embeds: [errorEmbed] });
                }
            }
        }
    }
};