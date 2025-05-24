const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check for !sendtickets command
        if (message.content === '!sendtickets') {
            // Check if user has admin permissions
            if (!message.member.permissions.has('Administrator')) {
                return message.reply('❌ You need Administrator permissions to use this command!');
            }
            
            // Check if in correct channel
            if (message.channel.id !== '1364040634511659159') {
                return message.reply('❌ This command can only be used in the tickets channel!');
            }
            
            // Create the ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setColor('#067dfe')
                .setTitle('🎫 Support Tickets')
                .setDescription('Need help? Create a support ticket by selecting a category below.\n\nOur support team will assist you as soon as possible!')
                .addFields(
                    { name: '📋 Before Creating a Ticket', value: '• Make sure to check our FAQ first\n• Provide as much detail as possible\n• Be patient, we\'ll respond ASAP', inline: false },
                    { name: '⏰ Response Time', value: 'Most tickets are answered within 24 hours', inline: false }
                )
                .setFooter({ text: 'BerryNode Support', iconURL: message.guild.iconURL() })
                .setTimestamp();
            
            // Create the dropdown menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('Select Support Category')
                .addOptions([
                    {
                        label: 'General Enquiries',
                        description: 'General questions about our services',
                        value: 'general',
                        emoji: '💬'
                    },
                    {
                        label: 'Minecraft Support',
                        description: 'Issues with your Minecraft server',
                        value: 'minecraft',
                        emoji: '⛏️'
                    },
                    {
                        label: 'Billing Support',
                        description: 'Payment and billing related issues',
                        value: 'billing',
                        emoji: '💳'
                    },
                    {
                        label: 'Partnership',
                        description: 'Partnership opportunities and inquiries',
                        value: 'partner',
                        emoji: '🤝'
                    }
                ]);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            // Send the ticket panel
            await message.channel.send({ embeds: [ticketEmbed], components: [row] });
            
            // Delete the command message
            await message.delete().catch(() => {});
        }
    }
};