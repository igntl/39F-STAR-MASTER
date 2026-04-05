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
let leaderboardMessageId = null;
const recentMatches = {};
let divisionCount = 0;

// تحميل البيانات
if (fs.existsSync("wins.json")) {
  wins = JSON.parse(fs.readFileSync("wins.json"));
}

// 🏆 لوحة الشرف (كل اللاعبين)
async function updateLeaderboard(channel) {
  const sorted = Object.entries(wins)
    .sort((a, b) => b[1] - a[1]);

  const text = sorted.length
    ? sorted.map((p, i) =>
        `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}-`} <@${p[0]}> — ${p[1]} فوز`
      ).join("\n")
    : "لا يوجد بيانات";

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🏆 لوحة الشرف")
    .setDescription(text.slice(0, 4000));

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

  // 📊 عرض اللوحة
  if (content === "!board" || content === "!top") {
    leaderboardMessageId = null;
    await updateLeaderboard(msg.channel);
    return msg.reply("📊 تم عرض لوحة الشرف");
  }

  // 📈 عرض إحصائيات كاملة
  if (content === "!all") {

    const sorted = Object.entries(wins)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return msg.reply("❌ لا يوجد إحصائيات");
    }

    const text = sorted.map((p, i) =>
      `${i+1}- <@${p[0]}> : ${p[1]} فوز`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setColor("#5865f2")
      .setTitle("📊 إحصائيات الأسبوع كاملة")
      .setDescription(text.slice(0, 4000));

    return msg.channel.send({ embeds: [embed] });
  }

  // 🎯 تسجيل تقسيمة
  if (content === "!done") {

    divisionCount++;

    msg.channel.send(`📊 تم تسجيل تقسيمة (${divisionCount}/10)`);

    if (divisionCount === 10) {

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

      // 🔄 تصفير
      wins = {};
      divisionCount = 0;
      leaderboardMessageId = null;

      fs.writeFileSync("wins.json", "{}");
    }

    return;
  }

  // استخراج الفائز (مرن)
  let winnerId = null;
  const mentions = [...content.matchAll(/<@!?(\d+)>/g)];

  if (content.includes("الفائز") && mentions.length > 0) {
    winnerId = mentions[mentions.length - 1][1];
  }

  if (!winnerId) return;

  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  const players = Array.from(msg.mentions.users.values());
  if (players.length < 2) return;

  const ids = [players[0].id, players[1].id].sort();
  const key = `${ids[0]}-${ids[1]}`;

  // ⏱️ منع التكرار دقيقة
  if (recentMatches[key] && Date.now() - recentMatches[key] < 60000) {
    return msg.reply("❌ لا تسجل نفس المباراة مرتين خلال دقيقة");
  }

  recentMatches[key] = Date.now();

  // تسجيل الفوز
  if (!wins[winner.id]) wins[winner.id] = 0;
  wins[winner.id]++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  updateLeaderboard(msg.channel);
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
