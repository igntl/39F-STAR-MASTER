const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// 🎯 رومك
const CHANNEL_ID = "1483219896069525665";

// 📊 بيانات
let wins = {};
let matches = [];
let matchCount = 0;
let leaderboardMessageId = null;

// تحميل البيانات
if (fs.existsSync("wins.json")) {
  wins = JSON.parse(fs.readFileSync("wins.json"));
}

if (fs.existsSync("matches.json")) {
  matches = JSON.parse(fs.readFileSync("matches.json"));
}

// 🏆 تحديث لوحة الشرف
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
    .setTitle("🏆 أفضل اللاعبين")
    .setDescription(text);

  if (!leaderboardMessageId) {
    const msg = await channel.send({ embeds: [embed] });
    leaderboardMessageId = msg.id;
  } else {
    const msg = await channel.messages.fetch(leaderboardMessageId);
    if (msg) await msg.edit({ embeds: [embed] });
  }
}

// 🎯 قراءة النتائج
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== CHANNEL_ID) return;

  const content = msg.content;

  // استخراج النتائج
  const scores = content.match(/\d+\s*-\s*\d+/g);
  if (!scores) return;

  // استخراج الفائز
  const winnerLine = content.match(/الفائز\s*:\s*<@!?(\d+)>/);
  if (!winnerLine) return;

  const winnerId = winnerLine[1];
  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  // منع التكرار السريع
  const matchId = content.trim();
  if (matches.includes(matchId)) {
    return msg.reply("❌ المباراة مسجلة من قبل");
  }

  // تسجيل الفوز
  if (!wins[winner.id]) wins[winner.id] = 0;
  wins[winner.id]++;

  matches.push(matchId);
  matchCount++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("matches.json", JSON.stringify(matches, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  // تحديث لوحة الشرف
  updateLeaderboard(msg.channel);

  // 💣 كل 10 مباريات
  if (matchCount >= 10) {

    const sorted = Object.entries(wins)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return;

    const topId = sorted[0][0];
    const topWins = sorted[0][1];

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("🏆 كابتن التقسيمة")
      .setDescription(`👑 <@${topId}> هو الأكثر فوز!\n🔥 عدد الفوز: ${topWins}`)
      .setFooter({ text: "تم تصفير الإحصائيات لبداية جولة جديدة" });

    await msg.channel.send({ embeds: [embed] });

    // 🔄 تصفير
    wins = {};
    matches = [];
    matchCount = 0;
    leaderboardMessageId = null;

    fs.writeFileSync("wins.json", "{}");
    fs.writeFileSync("matches.json", "[]");
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
