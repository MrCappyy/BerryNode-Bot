const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
        
        const CATEGORY_ID = '1365073975637704756';
        const SUPPORT_ROLE_ID = '1363742523276660847';
        const LOG_CHANNEL_ID = '1364042025732804608';
        
        // Handle ticket category selection
        if (interaction.customId === 'ticket_category') {
            const category = interaction.values[0];
            const member = interaction.member;
            
            // Check if user already has an open ticket
            const existingTicket = interaction.guild.channels.cache.find(
                channel => channel.name.includes(member.user.username.toLowerCase()) && 
                channel.parentId === CATEGORY_ID
            );
            
            if (existingTicket) {
                return interaction.reply({ 
                    content: `❌ You already have an open ticket: ${existingTicket}`, 
                    ephemeral: true 
                });
            }
            
            // Create ticket channel
            const channelName = `${category}-${member.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
            
            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: CATEGORY_ID,
                    topic: `Ticket Creator: ${member.id}`, // Store creator ID in topic
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: member.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: SUPPORT_ROLE_ID,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                });
                
                // Create ticket control panel
                const ticketEmbed = new EmbedBuilder()
                    .setColor('#067dfe')
                    .setTitle('🎫 Support Ticket')
                    .setDescription(`Welcome ${member}!\n\nPlease describe your issue in detail. Our support team will assist you shortly.`)
                    .addFields(
                        { name: 'Category', value: getCategoryName(category), inline: true },
                        { name: 'Created by', value: `${member}`, inline: true },
                        { name: 'Ticket ID', value: ticketChannel.id, inline: true }
                    )
                    .setFooter({ text: 'BerryNode Support System' })
                    .setTimestamp();
                
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close Ticket')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('delete_ticket')
                            .setLabel('Delete Ticket')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true) // Initially disabled
                    );
                
                await ticketChannel.send({ 
                    content: `${member} <@&${SUPPORT_ROLE_ID}>`,
                    embeds: [ticketEmbed], 
                    components: [buttons] 
                });
                
                await interaction.reply({ 
                    content: `✅ Your ticket has been created: ${ticketChannel}`, 
                    ephemeral: true 
                });
                
                // Log ticket creation
                const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('🎫 Ticket Created')
                        .addFields(
                            { name: 'User', value: `${member} (${member.user.tag})`, inline: true },
                            { name: 'Category', value: getCategoryName(category), inline: true },
                            { name: 'Channel', value: `${ticketChannel}`, inline: true }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
                
            } catch (error) {
                console.error('Error creating ticket:', error);
                await interaction.reply({ 
                    content: '❌ Failed to create ticket. Please try again.', 
                    ephemeral: true 
                });
            }
        }
        
        // Handle close ticket button
        if (interaction.customId === 'close_ticket') {
            const member = interaction.member;
            const channel = interaction.channel;
            
            // Get creator ID from channel topic
            const creatorId = channel.topic?.split('Ticket Creator: ')[1];
            
            // Check permissions (ticket creator or support role)
            const isCreator = member.id === creatorId;
            const hasRole = member.roles.cache.has(SUPPORT_ROLE_ID);
            const isAdmin = member.permissions.has('Administrator');
            
            if (!isCreator && !hasRole && !isAdmin) {
                return interaction.reply({ 
                    content: '❌ You cannot close this ticket!', 
                    ephemeral: true 
                });
            }
            
            // Update channel permissions to remove creator access but keep support access
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                ViewChannel: false
            });
            
            // Remove creator's access
            if (creatorId) {
                await channel.permissionOverwrites.delete(creatorId);
            }
            
            // Ensure support role and admins still have access
            await channel.permissionOverwrites.edit(SUPPORT_ROLE_ID, {
                ViewChannel: true,
                SendMessages: true
            });
            
            // Update embed and buttons
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor('#ff0000')
                .setTitle('🔒 Ticket Closed')
                .setDescription(`This ticket has been closed by ${member}.`);
            
            const updatedButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('delete_ticket')
                        .setLabel('Delete Ticket')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(false) // Always enabled after closing
                );
            
            await interaction.update({ embeds: [updatedEmbed], components: [updatedButtons] });
            
            // Log ticket closure
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔒 Ticket Closed')
                    .addFields(
                        { name: 'Closed by', value: `${member} (${member.user.tag})`, inline: true },
                        { name: 'Channel', value: channel.name, inline: true },
                        { name: 'Time Open', value: getTimeSinceCreation(channel), inline: true }
                    )
                    .setTimestamp();
                
                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        
        // Handle delete ticket button
        if (interaction.customId === 'delete_ticket') {
            // Only admins can delete
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({ 
                    content: '❌ Only administrators can delete tickets!', 
                    ephemeral: true 
                });
            }
            
            await interaction.reply({ content: '🗑️ Deleting ticket and generating transcript...', ephemeral: true });
            
            // Generate transcript
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages.reverse().map(m => 
                `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`
            ).join('\n');
            
            // Log ticket deletion with transcript
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🗑️ Ticket Deleted')
                    .addFields(
                        { name: 'Deleted by', value: `${interaction.member} (${interaction.user.tag})`, inline: true },
                        { name: 'Channel', value: interaction.channel.name, inline: true },
                        { name: 'Total Messages', value: `${messages.size}`, inline: true }
                    )
                    .setTimestamp();
                
                // Send log with transcript as attachment
                const transcriptBuffer = Buffer.from(transcript, 'utf-8');
                await logChannel.send({ 
                    embeds: [logEmbed], 
                    files: [{
                        attachment: transcriptBuffer,
                        name: `${interaction.channel.name}-transcript.txt`
                    }]
                });
            }
            
            // Delete the channel
            await interaction.channel.delete();
        }
    }
};

// Helper functions
function getCategoryName(category) {
    const categories = {
        'general': '💬 General Enquiries',
        'minecraft': '⛏️ Minecraft Support',
        'billing': '💳 Billing Support',
        'partner': '🤝 Partnership'
    };
    return categories[category] || category;
}

function getTimeSinceCreation(channel) {
    const created = channel.createdTimestamp;
    const now = Date.now();
    const diff = now - created;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}