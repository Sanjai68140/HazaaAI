import { Telegraf } from 'telegraf';
import axios from 'axios';
import 'dotenv/config';
import { startMotivation, stopMotivation } from './motivationManager.js';
import { fetchMatchStats } from './footballApi.js';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let activePaidMessages = {};

bot.on('channel_post', async (ctx) => {
  try {
    const text = ctx.channelPost.text || '';
    const caption = ctx.channelPost.caption || '';
    const messageId = ctx.channelPost.message_id;
    const content = text + ' ' + caption;
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('rpy') || content.includes('https://rpy.club/')) {
      console.log('Paid team detected.');
      activePaidMessages[messageId] = true;
      startMotivation(ctx, messageId);
      setTimeout(() => {
        if (activePaidMessages[messageId]) {
          stopMotivation(messageId);
          delete activePaidMessages[messageId];
          console.log('Motivation auto-stopped after 35 mins.');
        }
      }, 35 * 60 * 1000); // 35 mins
    } else if (lowerContent.includes('ready') || lowerContent.includes('open')) {
      console.log('Open team detected.');
      await ctx.reply('Loading match stats...');
      const matchInfo = await fetchMatchStats(content);
      if (matchInfo) {
        await ctx.replyWithMarkdown(matchInfo);
      } else {
        await ctx.reply('Match stats not found.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

bot.launch();
console.log('HazaaPrimeAI Bot Started');
