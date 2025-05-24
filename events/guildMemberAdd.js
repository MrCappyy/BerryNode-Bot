const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const roleId = process.env.MEMBER_ROLE_ID;
        const welcomeChannelId = '1364042824512704607';
        
        console.log(`[BerryNode] 👤 New member: ${member.user.tag}`);
        
        // Send welcome message to welcome channel
        const welcomeChannel = member.client.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#067dfe')
                .setAuthor({ 
                    name: 'BerryNode Welcome System',
                    iconURL: member.guild.iconURL({ dynamic: true }) || member.client.user.displayAvatarURL()
                })
                .setDescription(`Hey ${member}! Welcome to our community. Feel free to ask any questions!`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
                .setFooter({ text: `${member.user.tag} • Member #${member.guild.memberCount}` })
                .setTimestamp();
            
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }
        
        // Log member join (existing logging)
        const logChannel = member.client.channels.cache.get(member.client.logChannelId || '1375679184319545475');
        if (logChannel) {
            const joinEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📥 Member Joined')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                    { name: '🆔 ID', value: member.id, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [joinEmbed] });
        }
        
        try {
            // Find the role
            const role = member.guild.roles.cache.get(roleId);
            
            if (!role) {
                console.error(`[BerryNode] ❌ Role not found: ${roleId}`);
                
                // Log error
                if (logChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Role Assignment Failed')
                        .setDescription('Member role not found!')
                        .addFields(
                            { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                            { name: '🏷️ Role ID', value: roleId, inline: true },
                            { name: '⚠️ Error', value: 'Role does not exist', inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
                    
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                return;
            }
            
            // Check if member already has the role
            if (member.roles.cache.has(roleId)) {
                console.log(`[BerryNode] ℹ️ Member already has the role`);
                return;
            }
            
            // Assign the role
            await member.roles.add(role);
            console.log(`[BerryNode] ✅ Role assigned to ${member.user.tag}`);
            
            // Log successful assignment
            if (logChannel) {
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Role Assigned')
                    .setDescription('Member role successfully assigned to new member')
                    .addFields(
                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                        { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                        { name: '⚡ Trigger', value: 'Member Join', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
                
                await logChannel.send({ embeds: [successEmbed] });
            }
            
        } catch (error) {
            console.error(`[BerryNode] ❌ Failed to assign role:`, error);
            
            // Log error
            if (logChannel) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Role Assignment Error')
                    .setDescription('Failed to assign role to new member')
                    .addFields(
                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                        { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                        { name: '⚠️ Error', value: error.message || 'Unknown error', inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
                
                await logChannel.send({ embeds: [errorEmbed] });
            }
        }
    }
};