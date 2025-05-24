// Create this file: commands/rolecheck.js
// This is an optional slash command to manually check and assign roles

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolecheck')
        .setDescription('Check and assign Member role to all users without it'),
    
    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ You need Administrator permissions to use this command!', ephemeral: true });
        }
        
        await interaction.deferReply();
        
        const roleId = process.env.MEMBER_ROLE_ID;
        const role = interaction.guild.roles.cache.get(roleId);
        
        if (!role) {
            return interaction.editReply(`❌ Role with ID ${roleId} not found!`);
        }
        
        let assignedCount = 0;
        let checkedCount = 0;
        
        try {
            // Fetch all members
            await interaction.guild.members.fetch();
            
            for (const member of interaction.guild.members.cache.values()) {
                // Skip bots
                if (member.user.bot) continue;
                
                checkedCount++;
                
                // Check if member doesn't have the role
                if (!member.roles.cache.has(roleId)) {
                    try {
                        await member.roles.add(role);
                        assignedCount++;
                        
                        // Small delay to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error(`Failed to assign role to ${member.user.tag}:`, error);
                    }
                }
            }
            
            await interaction.editReply(`✅ Role check complete!\n📊 Checked: ${checkedCount} members\n✨ Assigned role to: ${assignedCount} members`);
            
        } catch (error) {
            console.error('Error in rolecheck command:', error);
            await interaction.editReply('❌ An error occurred while checking roles.');
        }
    },
};