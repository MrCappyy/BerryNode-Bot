const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');

const LOG_CHANNEL_ID = '1375679184319545475';

// Helper function to get log channel
function getLogChannel(client) {
    return client.channels.cache.get(client.logChannelId || LOG_CHANNEL_ID);
}

module.exports = [
    // Message Delete
    {
        name: Events.MessageDelete,
        async execute(message) {
            if (!message.guild || message.author?.bot) return;
            
            const logChannel = getLogChannel(message.client);
            if (!logChannel) return;
            
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            }).catch(() => null);
            
            const deleteLog = fetchedLogs?.entries.first();
            let executor = null;
            
            if (deleteLog) {
                const { target, executor: logExecutor, extra } = deleteLog;
                if (target.id === message.author?.id && extra.channel.id === message.channel.id && Date.now() - deleteLog.createdTimestamp < 5000) {
                    executor = logExecutor;
                }
            }
            
            const deleteEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🗑️ Message Deleted')
                .addFields(
                    { name: '👤 Author', value: message.author ? `${message.author} (${message.author.tag})` : 'Unknown', inline: true },
                    { name: '📍 Channel', value: `${message.channel}`, inline: true },
                    { name: '🛡️ Deleted By', value: executor ? `${executor.tag}` : 'Self or Unknown', inline: true }
                );
            
            if (message.content) {
                deleteEmbed.addFields({
                    name: '📝 Content',
                    value: message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content,
                    inline: false
                });
            }
            
            if (message.attachments.size > 0) {
                deleteEmbed.addFields({
                    name: '📎 Attachments',
                    value: message.attachments.map(a => `[${a.name}](${a.url})`).join('\n'),
                    inline: false
                });
            }
            
            deleteEmbed
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: message.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [deleteEmbed] });
        }
    },
    
    // Message Update
    {
        name: Events.MessageUpdate,
        async execute(oldMessage, newMessage) {
            if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) return;
            
            const logChannel = getLogChannel(newMessage.client);
            if (!logChannel) return;
            
            const editEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('✏️ Message Edited')
                .setDescription(`[Jump to Message](${newMessage.url})`)
                .addFields(
                    { name: '👤 Author', value: `${newMessage.author} (${newMessage.author.tag})`, inline: true },
                    { name: '📍 Channel', value: `${newMessage.channel}`, inline: true },
                    { name: '🕒 Original Time', value: `<t:${Math.floor(newMessage.createdTimestamp / 1000)}:f>`, inline: true }
                );
            
            if (oldMessage.content) {
                editEmbed.addFields({
                    name: '📝 Before',
                    value: oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content,
                    inline: false
                });
            }
            
            if (newMessage.content) {
                editEmbed.addFields({
                    name: '📝 After',
                    value: newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content,
                    inline: false
                });
            }
            
            editEmbed
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: newMessage.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [editEmbed] });
        }
    },
    
    // Member Ban
    {
        name: Events.GuildBanAdd,
        async execute(ban) {
            const logChannel = getLogChannel(ban.client);
            if (!logChannel) return;
            
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            
            const banLog = fetchedLogs.entries.first();
            const { executor, reason } = banLog || { executor: null, reason: 'No reason provided' };
            
            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Member Banned')
                .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Banned User', value: `${ban.user.tag}\n${ban.user.id}`, inline: true },
                    { name: '🛡️ Banned By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '📝 Reason', value: reason || 'No reason provided', inline: false },
                    { name: '🕒 User Created', value: `<t:${Math.floor(ban.user.createdTimestamp / 1000)}:F>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: ban.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [banEmbed] });
        }
    },
    
    // Member Unban
    {
        name: Events.GuildBanRemove,
        async execute(ban) {
            const logChannel = getLogChannel(ban.client);
            if (!logChannel) return;
            
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanRemove,
            });
            
            const unbanLog = fetchedLogs.entries.first();
            const { executor } = unbanLog || { executor: null };
            
            const unbanEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Member Unbanned')
                .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Unbanned User', value: `${ban.user.tag}\n${ban.user.id}`, inline: true },
                    { name: '🛡️ Unbanned By', value: executor ? `${executor.tag}` : 'Unknown', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: ban.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [unbanEmbed] });
        }
    },
    
    // Member Leave/Kick (NOT DUPLICATE - guildMemberRemove logs leaves/kicks)
    {
        name: Events.GuildMemberRemove,
        async execute(member) {
            const logChannel = getLogChannel(member.client);
            if (!logChannel) return;
            
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberKick,
            }).catch(() => null);
            
            const kickLog = fetchedLogs?.entries.first();
            let wasKicked = false;
            let executor = null;
            let reason = null;
            
            if (kickLog) {
                const { target, executor: kickExecutor, reason: kickReason } = kickLog;
                if (target.id === member.id && Date.now() - kickLog.createdTimestamp < 5000) {
                    wasKicked = true;
                    executor = kickExecutor;
                    reason = kickReason;
                }
            }
            
            const embed = new EmbedBuilder()
                .setColor(wasKicked ? '#ff0000' : '#ff9900')
                .setTitle(wasKicked ? '👢 Member Kicked' : '📤 Member Left')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 User', value: `${member.user.tag}\n${member.id}`, inline: true },
                    { name: '📅 Joined At', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Unknown', inline: true },
                    { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true }
                );
            
            if (wasKicked) {
                embed.addFields(
                    { name: '🛡️ Kicked By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '📝 Reason', value: reason || 'No reason provided', inline: true }
                );
            }
            
            const roles = member.roles.cache.filter(r => r.id !== member.guild.id).map(r => r.toString());
            if (roles.length > 0) {
                embed.addFields({
                    name: '🏷️ Roles',
                    value: roles.join(', ').substring(0, 1024),
                    inline: false
                });
            }
            
            embed
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Channel Create
    {
        name: Events.ChannelCreate,
        async execute(channel) {
            if (!channel.guild) return;
            
            const logChannel = getLogChannel(channel.client);
            if (!logChannel) return;
            
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelCreate,
            }).catch(() => null);
            
            const createLog = fetchedLogs?.entries.first();
            const executor = createLog?.executor;
            
            const channelTypes = {
                [ChannelType.GuildText]: '💬 Text Channel',
                [ChannelType.GuildVoice]: '🔊 Voice Channel',
                [ChannelType.GuildCategory]: '📁 Category',
                [ChannelType.GuildAnnouncement]: '📢 Announcement Channel',
                [ChannelType.GuildStageVoice]: '🎭 Stage Channel',
                [ChannelType.GuildForum]: '💭 Forum Channel'
            };
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('➕ Channel Created')
                .addFields(
                    { name: '📍 Channel', value: `${channel} (${channel.name})`, inline: true },
                    { name: '📋 Type', value: channelTypes[channel.type] || 'Unknown', inline: true },
                    { name: '🛡️ Created By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '🗂️ Category', value: channel.parent ? channel.parent.name : 'None', inline: true },
                    { name: '🆔 ID', value: channel.id, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: channel.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Channel Delete
    {
        name: Events.ChannelDelete,
        async execute(channel) {
            if (!channel.guild) return;
            
            const logChannel = getLogChannel(channel.client);
            if (!logChannel) return;
            
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete,
            }).catch(() => null);
            
            const deleteLog = fetchedLogs?.entries.first();
            const executor = deleteLog?.executor;
            
            const channelTypes = {
                [ChannelType.GuildText]: '💬 Text Channel',
                [ChannelType.GuildVoice]: '🔊 Voice Channel',
                [ChannelType.GuildCategory]: '📁 Category',
                [ChannelType.GuildAnnouncement]: '📢 Announcement Channel',
                [ChannelType.GuildStageVoice]: '🎭 Stage Channel',
                [ChannelType.GuildForum]: '💭 Forum Channel'
            };
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('➖ Channel Deleted')
                .addFields(
                    { name: '📍 Channel', value: `${channel.name}`, inline: true },
                    { name: '📋 Type', value: channelTypes[channel.type] || 'Unknown', inline: true },
                    { name: '🛡️ Deleted By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '🗂️ Category', value: channel.parent ? channel.parent.name : 'None', inline: true },
                    { name: '🆔 ID', value: channel.id, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: channel.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Voice State Update (Join/Leave/Move)
    {
        name: Events.VoiceStateUpdate,
        async execute(oldState, newState) {
            const logChannel = getLogChannel(newState.client);
            if (!logChannel) return;
            
            const member = newState.member;
            let embed = null;
            
            // Voice Join
            if (!oldState.channel && newState.channel) {
                embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🔊 Voice Channel Joined')
                    .addFields(
                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                        { name: '📍 Channel', value: `${newState.channel}`, inline: true }
                    );
            }
            // Voice Leave
            else if (oldState.channel && !newState.channel) {
                embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔇 Voice Channel Left')
                    .addFields(
                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                        { name: '📍 Channel', value: `${oldState.channel}`, inline: true }
                    );
            }
            // Voice Move
            else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🔄 Voice Channel Moved')
                    .addFields(
                        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
                        { name: '📤 From', value: `${oldState.channel}`, inline: true },
                        { name: '📥 To', value: `${newState.channel}`, inline: true }
                    );
            }
            
            if (embed) {
                embed
                    .setTimestamp()
                    .setFooter({ text: 'BerryNode Logging System', iconURL: member.client.user.displayAvatarURL() });
                
                await logChannel.send({ embeds: [embed] });
            }
        }
    },
    
    // Role Create
    {
        name: Events.GuildRoleCreate,
        async execute(role) {
            const logChannel = getLogChannel(role.client);
            if (!logChannel) return;
            
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleCreate,
            }).catch(() => null);
            
            const createLog = fetchedLogs?.entries.first();
            const executor = createLog?.executor;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🏷️ Role Created')
                .addFields(
                    { name: '📛 Role', value: `${role} (${role.name})`, inline: true },
                    { name: '🎨 Color', value: role.hexColor, inline: true },
                    { name: '🛡️ Created By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '📊 Position', value: `${role.position}`, inline: true },
                    { name: '🆔 ID', value: role.id, inline: true },
                    { name: '⚡ Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: role.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Role Delete
    {
        name: Events.GuildRoleDelete,
        async execute(role) {
            const logChannel = getLogChannel(role.client);
            if (!logChannel) return;
            
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleDelete,
            }).catch(() => null);
            
            const deleteLog = fetchedLogs?.entries.first();
            const executor = deleteLog?.executor;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🏷️ Role Deleted')
                .addFields(
                    { name: '📛 Role', value: role.name, inline: true },
                    { name: '🎨 Color', value: role.hexColor, inline: true },
                    { name: '🛡️ Deleted By', value: executor ? `${executor.tag}` : 'Unknown', inline: true },
                    { name: '🆔 ID', value: role.id, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: role.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Invite Create
    {
        name: Events.InviteCreate,
        async execute(invite) {
            const logChannel = getLogChannel(invite.client);
            if (!logChannel) return;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔗 Invite Created')
                .addFields(
                    { name: '📎 Code', value: `discord.gg/${invite.code}`, inline: true },
                    { name: '👤 Created By', value: invite.inviter ? `${invite.inviter.tag}` : 'Unknown', inline: true },
                    { name: '📍 Channel', value: `${invite.channel}`, inline: true },
                    { name: '⏱️ Expires', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>` : 'Never', inline: true },
                    { name: '👥 Max Uses', value: invite.maxUses ? `${invite.maxUses}` : 'Unlimited', inline: true },
                    { name: '🕒 Temporary', value: invite.temporary ? 'Yes' : 'No', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: invite.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    },
    
    // Message Bulk Delete
    {
        name: Events.MessageBulkDelete,
        async execute(messages, channel) {
            const logChannel = getLogChannel(channel.client);
            if (!logChannel) return;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Bulk Messages Deleted')
                .addFields(
                    { name: '📍 Channel', value: `${channel}`, inline: true },
                    { name: '📊 Count', value: `${messages.size} messages`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'BerryNode Logging System', iconURL: channel.client.user.displayAvatarURL() });
            
            await logChannel.send({ embeds: [embed] });
        }
    }
];