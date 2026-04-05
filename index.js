const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
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
const CHANNEL_ID = "1359414548184043570";

let wins = {};
let totalWins = {};
let leaderboardMessageId = null;
const recentMatches = {};
let divisionCount = 0;

// تحميل البيانات
if (fs.existsSync("wins.json")) {
  wins = JSON.parse(fs.readFileSync("wins.json"));
}
if (fs.existsSync("totalWins.json")) {
  totalWins = JSON.parse(fs.readFileSync("totalWins.json"));
}

// 🏆 لوحة الشرف
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

  // 📊 لوحة الشرف
  if (content === "!board" || content === "!top") {
    leaderboardMessageId = null;
    await updateLeaderboard(msg.channel);
    return msg.reply("📊 تم عرض لوحة الشرف");
  }

  // 📈 إحصائيات الأسبوع
  if (content === "!all") {
    const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.reply("❌ لا يوجد بيانات");

    const text = sorted.map((p, i) =>
      `${i+1}- <@${p[0]}> : ${p[1]} فوز`
    ).join("\n");

    return msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📊 إحصائيات الأسبوع")
        .setDescription(text.slice(0, 4000))]
    });
  }

  // 🏆 إحصائيات دائمة
  if (content === "!total") {
    const sorted = Object.entries(totalWins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.reply("❌ لا يوجد بيانات");

    const text = sorted.map((p, i) =>
      `${i+1}- <@${p[0]}> : ${p[1]} فوز`
    ).join("\n");

    return msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor("#00ff99")
        .setTitle("🏆 الإحصائيات الكاملة")
        .setDescription(text.slice(0, 4000))]
    });
  }

  // 🎯 إنهاء تقسيمة
  if (content === "!done") {
    divisionCount++;
    msg.channel.send(`📊 تم تسجيل تقسيمة (${divisionCount}/10)`);

    if (divisionCount === 10) {
      const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      if (!sorted.length) return;

      const topId = sorted[0][0];
      const topWins = sorted[0][1];

      await msg.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle("🏆 كابتن التقسيمة")
          .setDescription(`👑 <@${topId}> هو الأكثر فوز!\n🔥 عدد الفوز: ${topWins}`)]
      });

      wins = {};
      divisionCount = 0;
      leaderboardMessageId = null;

      fs.writeFileSync("wins.json", "{}");
    }
    return;
  }

  // 🔥 أمر التصفير
  if (content === "!res") {

    if (!msg.member.permissions.has("Administrator")) {
      return msg.reply("❌ هذا الأمر للإدارة فقط");
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_reset")
        .setLabel("✅ تأكيد")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("cancel_reset")
        .setLabel("❌ إلغاء")
        .setStyle(ButtonStyle.Secondary)
    );

    return msg.reply({
      content: "⚠️ هل أنت متأكد من تصفير جميع الإحصائيات؟",
      components: [row]
    });
  }

  // 🧠 استخراج الفائز
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

  if (recentMatches[key] && Date.now() - recentMatches[key] < 60000) {
    return msg.reply("❌ لا تسجل نفس المباراة مرتين خلال دقيقة");
  }

  recentMatches[key] = Date.now();

  if (!wins[winner.id]) wins[winner.id] = 0;
  if (!totalWins[winner.id]) totalWins[winner.id] = 0;

  wins[winner.id]++;
  totalWins[winner.id]++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  updateLeaderboard(msg.channel);
});

// 🔘 الأزرار
client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.isButton()) return;

  if (interaction.customId === "confirm_reset") {

    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "❌ هذا الزر للإدارة فقط", ephemeral: true });
    }

    wins = {};
    totalWins = {};
    divisionCount = 0;
    leaderboardMessageId = null;

    fs.writeFileSync("wins.json", "{}");
    fs.writeFileSync("totalWins.json", "{}");

    await interaction.update({
      content: "♻️ تم تصفير جميع الإحصائيات",
      components: []
    });
  }

  if (interaction.customId === "cancel_reset") {
    await interaction.update({
      content: "❌ تم إلغاء التصفير",
      components: []
    });
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
