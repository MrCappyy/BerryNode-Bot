const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const roleId = process.env.MEMBER_ROLE_ID;
        const logChannel = newMember.client.channels.cache.get(newMember.client.logChannelId || '1375679184319545475');
        
        // Check if the member had the role but now doesn't
        if (oldMember.roles.cache.has(roleId) && !newMember.roles.cache.has(roleId)) {
            console.log(`[BerryNode] ⚠️ Role removed from ${newMember.user.tag}, reassigning...`);
            
            // Log role removal detection
            if (logChannel) {
                const removalEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⚠️ Role Removal Detected')
                    .setDescription('Member role was removed - attempting automatic reassignment')
                    .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '👤 User', value: `${newMember} (${newMember.user.tag})`, inline: true },
                        { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                        { name: '⚡ Action', value: 'Auto-Reassign', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: newMember.client.user.displayAvatarURL() });
                
                await logChannel.send({ embeds: [removalEmbed] });
            }
            
            try {
                const role = newMember.guild.roles.cache.get(roleId);
                if (role) {
                    await newMember.roles.add(role);
                    console.log(`[BerryNode] ✅ Role reassigned to ${newMember.user.tag}`);
                    
                    // Log successful reassignment
                    if (logChannel) {
                        const successEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ Role Restored')
                            .setDescription('Member role has been automatically restored')
                            .addFields(
                                { name: '👤 User', value: `${newMember} (${newMember.user.tag})`, inline: true },
                                { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                                { name: '⏱️ Response Time', value: 'Instant', inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'BerryNode Logging System', iconURL: newMember.client.user.displayAvatarURL() });
                        
                        await logChannel.send({ embeds: [successEmbed] });
                    }
                }
            } catch (error) {
                console.error(`[BerryNode] ❌ Failed to reassign role:`, error);
                
                // Log error
                if (logChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Role Restoration Failed')
                        .setDescription('Failed to restore member role after removal')
                        .addFields(
                            { name: '👤 User', value: `${newMember} (${newMember.user.tag})`, inline: true },
                            { name: '🏷️ Role', value: `<@&${roleId}>`, inline: true },
                            { name: '⚠️ Error', value: error.message || 'Unknown error', inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'BerryNode Logging System', iconURL: newMember.client.user.displayAvatarURL() });
                    
                    await logChannel.send({ embeds: [errorEmbed] });
                }
            }
        }
        
        // Log other role changes (optional)
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        
        if ((addedRoles.size > 0 || removedRoles.size > 0) && logChannel) {
            const roleChangeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🏷️ Role Update')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 User', value: `${newMember} (${newMember.user.tag})`, inline: false }
                );
            
            if (addedRoles.size > 0) {
                roleChangeEmbed.addFields({
                    name: '➕ Added Roles',
                    value: addedRoles.map(role => `<@&${role.id}>`).join(', '),
                    inline: false
                });
            }
            
            if (removedRoles.size > 0) {
                roleChangeEmbed.addFields({
                    name: '➖ Removed Roles',
                    value: removedRoles.map(role => `<@&${role.id}>`).join(', '),
                    inline: false
                });
            }
            
            roleChangeEmbed
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: newMember.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [roleChangeEmbed] });
        }
    }
};