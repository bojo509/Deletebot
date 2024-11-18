import { Client, GatewayIntentBits } from 'discord.js';
import { createServer } from 'http';
import { config } from 'dotenv';
const port = process.env.PORT || 8000;

config();

// Create a new client instance with the necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// When the client is ready, run this code
client.once('ready', () => {
  console.log('Bot is ready!');
});

// Command handler
client.on('messageCreate', async message => {
  if (message.author.bot) {
    return;
  }
  if (!message.content.startsWith('!')) {
    return;
  }

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  console.log(`Parsed command: ${command}`);

  if (command === 'clear') {
    console.log('Executing clear command');
    const channel = message.channel;
    
    try {
      const messages = await channel.messages.fetch();
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      
      // Separate messages into recent and old
      const recentMessages = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);
      const oldMessages = messages.filter(msg => msg.createdTimestamp <= twoWeeksAgo);

      // Bulk delete recent messages if any exist
      if (recentMessages.size > 0) {
        await channel.bulkDelete(recentMessages);
        console.log(`Bulk deleted ${recentMessages.size} recent messages`);
      }

      // Delete old messages one by one
      for (const msg of oldMessages.values()) {
        await msg.delete();
      }
      
      console.log(`Individually deleted ${oldMessages.size} old messages`);
    } catch (error) {
      console.error('Error clearing messages:', error);
      await message.channel.send('An error occurred while clearing messages.');
    }
  } else {
    console.log('Unknown command');
  }
});

// Login to Discord with your bot token
client.login(process.env.BOT_TOKEN);


createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}).listen(port, () => console.log(`Health check server running on port ${port}`));