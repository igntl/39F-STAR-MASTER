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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

// 🔥 غيرها حسب سيرفرك
const RESULTS_CHANNEL = "🔒｜chat";
const HALL_CHANNEL_ID = "1483219896069525665";

// 📂 بيانات
let wins = {};
let matches = [];

if (fs.existsSync("wins.json")) {
  wins = JSON.parse(fs.readFileSync("wins.json"));
}

if (fs.existsSync("matches.json")) {
  matches = JSON.parse(fs.readFileSync("matches.json"));
}

let hallMessageId = null;

// 🧠 تحديث لوحة الشرف
async function updateHall(guild) {

  const channel = guild.channels.cache.get(HALL_CHANNEL_ID);
  if (!channel) return;

  const sorted = Object.entries(wins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const description = sorted.length
    ? sorted.map((p, i) =>
        `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**${i+1}.**`} <@${p[0]}> — ${p[1]} فوز`
      ).join("\n")
    : "لا يوجد نتائج حتى الآن";

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🏆 لوحة الشرف")
    .setDescription(description)
    .setFooter({ text: "تتحدث تلقائيًا 🔥" });

  if (!hallMessageId) {
    const msg = await channel.send({ embeds: [embed] });
    hallMessageId = msg.id;
  } else {
    const msg = await channel.messages.fetch(hallMessageId);
    if (msg) await msg.edit({ embeds: [embed] });
  }
}

// 🎯 قراءة النتائج
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.channel.name !== RESULTS_CHANNEL) return;

  const content = msg.content;

  const scores = content.match(/\d+\s*-\s*\d+/g);
  if (!scores || scores.length < 2) return;

  const mentions = msg.mentions.users;
  if (mentions.size < 2) return;

  const matchId = content.trim();
  if (matches.includes(matchId)) {
    return msg.reply("❌ المباراة مسجلة من قبل");
  }

  let t1 = 0, t2 = 0;

  scores.forEach(s => {
    const [a, b] = s.split("-").map(Number);
    t1 += a;
    t2 += b;
  });

  const players = Array.from(mentions.values());
  const p1 = players[0];
  const p2 = players[1];

  let winner;

  if (t1 > t2) winner = p1;
  else if (t2 > t1) winner = p2;
  else return msg.reply("🤝 تعادل");

  if (!wins[winner.id]) wins[winner.id] = 0;
  wins[winner.id]++;

  matches.push(matchId);

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("matches.json", JSON.stringify(matches, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  updateHall(msg.guild);
});

// 📊 أمر عرض
client.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!stats")) {
    const user = msg.mentions.users.first() || msg.author;
    const count = wins[user.id] || 0;
    msg.reply(`🎯 ${user} فاز ${count} تقسيمات`);
  }
});

client.on("ready", async () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
