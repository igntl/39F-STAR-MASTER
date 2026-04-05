const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = "1483219896069525665";

let wins = {};
let matchCount = 0;
let leaderboardMessageId = null;
const recentMatches = {};

if (fs.existsSync("wins.json")) {
  wins = JSON.parse(fs.readFileSync("wins.json"));
}

async function updateLeaderboard(channel) {
  const sorted = Object.entries(wins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const text = sorted.length
    ? sorted.map((p, i) =>
        `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}-`} <@${p[0]}> — ${p[1]} فوز`
      ).join("\n")
    : "لا يوجد بيانات";

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🏆 لوحة الشرف")
    .setDescription(text);

  if (!leaderboardMessageId) {
    const msg = await channel.send({ embeds: [embed] });
    leaderboardMessageId = msg.id;
  } else {
    const msg = await channel.messages.fetch(leaderboardMessageId);
    if (msg) await msg.edit({ embeds: [embed] });
  }
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== CHANNEL_ID) return;

  const content = msg.content;

  if (content.startsWith("!board") || content.startsWith("!top")) {
    leaderboardMessageId = null;
    await updateLeaderboard(msg.channel);
    return msg.reply("📊 تم عرض لوحة الشرف");
  }

  const winnerLine = content.match(/الفائز\s*:\s*<@!?(\d+)>/);
  if (!winnerLine) return;

  const winnerId = winnerLine[1];
  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  const players = Array.from(msg.mentions.users.values());
  if (players.length < 2) return;

  const key = `${players[0].id}-${players[1].id}`;

  if (recentMatches[key] && Date.now() - recentMatches[key] < 60000) {
    return msg.reply("❌ لا تسجل نفس المباراة مرتين خلال دقيقة");
  }

  recentMatches[key] = Date.now();

  if (!wins[winner.id]) wins[winner.id] = 0;
  wins[winner.id]++;

  matchCount++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  updateLeaderboard(msg.channel);

  // ✅ هنا التعديل فقط
  if (matchCount === 10) {

    const sorted = Object.entries(wins)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return;

    const topId = sorted[0][0];
    const topWins = sorted[0][1];

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("🏆 كابتن التقسيمة")
      .setDescription(`👑 <@${topId}> هو الأكثر فوز!\n🔥 عدد الفوز: ${topWins}`)
      .setFooter({ text: "تم تصفير الإحصائيات" });

    await msg.channel.send({ embeds: [embed] });

    wins = {};
    matchCount = 0;
    leaderboardMessageId = null;

    fs.writeFileSync("wins.json", "{}");
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
