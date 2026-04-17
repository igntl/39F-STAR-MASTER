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

const CHANNEL_ID = "1359414548184043570";
const ANNOUNCE_CHANNEL = "1489912837592842294";

let wins = {};
let totalWins = {};
let leaderboardMessageId = null;
const recentMatches = {};
let divisionCount = 0;

// تحميل البيانات
if (fs.existsSync("wins.json")) wins = JSON.parse(fs.readFileSync("wins.json"));
if (fs.existsSync("totalWins.json")) totalWins = JSON.parse(fs.readFileSync("totalWins.json"));
if (fs.existsSync("division.json")) divisionCount = JSON.parse(fs.readFileSync("division.json"));

// 🔥 رسائل اللقب
const winnerMessages = [

`👑 {user}

بعد منافسة قوية في تقسيمات تيتانيوم، يتمكن من حسم اللقب بعد أداء متكامل وثبات واضح طوال المواجهات.

لم يكن هذا الفوز مجرد نتيجة، بل تأكيد جديد على قدرته في فرض السيطرة والتفوق أمام منافسين أقوياء.

ليواصل بذلك ترسيخ اسمه بين نخبة الكباتن في هذه المنافسة.

@everyone`,

`👑 {user}

في أجواء مليئة بالتحدي، ينجح في الحفاظ على اللقب بعد سلسلة مباريات قوية ومليئة بالندية.

قدم مستوى ثابت يعكس خبرته العالية وتحكمه الكامل في مجريات اللعب.

ليثبت أنه من الأسماء التي لا تتأثر بالضغط وتبقى دائمًا في القمة.

@everyone`,

`👑 {user}

يعود من جديد ليحسم اللقب بعد أداء احترافي وثقة واضحة في جميع الجولات.

تعامل مع كل مواجهة بتركيز عالٍ ونجح في فرض أسلوبه الخاص.

ليؤكد أنه لاعب يصنع الفارق ويستحق هذا التتويج.

@everyone`,

`👑 {user}

بعد منافسة شرسة، يتمكن من خطف اللقب ويواصل كتابة اسمه في القمة.

لم يمنح خصومه أي فرصة حقيقية للعودة وفرض سيطرته منذ البداية.

ليثبت أنه أحد أعمدة المنافسة في تقسيمات تيتانيوم.

@everyone`,

`👑 {user}

يحقق اللقب بعد سلسلة مواجهات قوية أظهر خلالها مستوى عالي من الاحترافية.

نجح في التعامل مع الضغط وتحويله إلى تفوق داخل الملعب.

ليؤكد أنه من أخطر الكباتن في هذه البطولة.

@everyone`,

`👑 {user}

يحسم اللقب بعد أداء متوازن وثبات ملحوظ في جميع الجولات.

قدم مباريات قوية تعكس خبرته الكبيرة وقدرته على إدارة المواجهات.

ليثبت أنه من الصفوة ويستحق القمة بجدارة.

@everyone`,

`👑 {user}

يتوج من جديد بعد أداء قوي وسيطرة واضحة على مجريات اللعب.

نجح في التفوق على منافسين أقوياء بثقة عالية.

ليؤكد استمراريته في القمة دون أي تراجع.

@everyone`,

`👑 {user}

يخطف اللقب بعد سلسلة مباريات ناجحة وأداء ثابت من البداية للنهاية.

تعامل مع جميع التحديات بذكاء وهدوء.

ليثبت أنه لاعب لا يكتفي بالفوز بل يصنع الهيمنة.

@everyone`,

`👑 {user}

يفرض نفسه في الصدارة ويحسم اللقب بعد أداء متكامل في جميع المواجهات.

أظهر مستوى عالي من التركيز والانضباط.

ليؤكد أنه من أبرز الأسماء في هذه الساحة.

@everyone`,

`👑 {user}

يعود بقوة ويحسم اللقب بعد منافسة قوية وأداء ثابت.

نجح في السيطرة على اللحظات الحاسمة بكل ثقة.

ليثبت أنه لاعب يعتمد عليه في أصعب الظروف.

@everyone`,

`👑 {user}

يحقق اللقب بعد أداء احترافي وثبات واضح في جميع الجولات.

لم يتراجع أمام أي تحدي وواصل بنفس المستوى حتى النهاية.

ليؤكد أنه من نخبة اللاعبين في هذه المنافسة.

@everyone`,

`👑 {user}

يحافظ على اللقب بعد سلسلة مواجهات قوية وأداء مميز.

فرض أسلوبه على جميع المنافسين دون استثناء.

ليثبت أنه أحد أقوى الأسماء في تقسيمات تيتانيوم.

@everyone`,

`👑 {user}

يتصدر من جديد ويحسم اللقب بعد أداء قوي وتحكم كامل في المباريات.

نجح في قراءة اللعب والتفوق في جميع المواجهات.

ليؤكد أنه لاعب من الطراز الرفيع.

@everyone`,

`👑 {user}

يخطف اللقب بعد أداء متكامل وثقة عالية في جميع الجولات.

أثبت أنه قادر على التعامل مع أقوى المنافسين.

ليواصل ترسيخ اسمه في القمة.

@everyone`,

`👑 {user}

يتوج باللقب بعد منافسة قوية وأداء ثابت طوال التقسيمات.

نجح في فرض سيطرته منذ البداية وحتى النهاية.

ليؤكد أنه يستحق هذا الإنجاز بكل جدارة.

@everyone`,

  `👑 {user}

يواصل تألقه ويحسم اللقب بعد أداء قوي وثبات واضح في جميع المواجهات.

نجح في فرض أسلوبه الخاص والتفوق على منافسين أقوياء دون تراجع.

ليؤكد أنه أحد أبرز الكباتن في هذه المنافسة.

@everyone`,

`👑 {user}

يخطف اللقب بعد سلسلة مباريات حاسمة أظهر خلالها مستوى عالي من التركيز.

تعامل مع جميع المواجهات بثقة وثبات حتى النهاية.

ليثبت أنه لاعب يصعب مجاراته في هذه التقسيمات.

@everyone`,

`👑 {user}

يحسم اللقب بعد أداء متكامل وتحكم واضح في مجريات اللعب.

فرض سيطرته على جميع الجولات وقدم مستوى ثابت.

ليؤكد استحقاقه الكامل لهذا التتويج.

@everyone`,

`👑 {user}

يتوج من جديد بعد منافسة قوية وأداء احترافي طوال التقسيمات.

نجح في التعامل مع الضغط والتفوق في اللحظات الحاسمة.

ليثبت أنه من نخبة اللاعبين في الساحة.

@everyone`,

`👑 {user}

يواصل فرض اسمه في القمة بعد حسم اللقب بأداء ثابت ومميز.

قدم مباريات قوية تعكس خبرته الكبيرة في المنافسة.

ليؤكد أنه أحد الأسماء التي لا تغيب عن الصدارة.

@everyone`,

`👑 {user}

يحقق اللقب بعد سلسلة نتائج إيجابية وأداء متوازن في جميع الجولات.

نجح في الحفاظ على مستواه رغم قوة المنافسة.

ليثبت أنه يستحق هذا الإنجاز بكل جدارة.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد مواجهة قوية وأداء منظم طوال التقسيمات.

أظهر قدرة عالية على التحكم في إيقاع اللعب.

ليؤكد أنه لاعب يعتمد عليه في أصعب اللحظات.

@everyone`,

`👑 {user}

يخطف اللقب بعد أداء قوي وثقة واضحة في جميع المواجهات.

نجح في فرض أسلوبه والتفوق على الجميع.

ليثبت أنه من الصفوة في هذه المنافسة.

@everyone`,

`👑 {user}

يتصدر الترتيب ويحسم اللقب بعد سلسلة مواجهات ناجحة.

قدم مستوى ثابت يعكس احترافيته العالية.

ليؤكد أنه أحد أبرز الكباتن في هذه البطولة.

@everyone`,

`👑 {user}

يتوج باللقب بعد أداء مميز وثبات في جميع الجولات.

تعامل مع جميع التحديات بثقة كبيرة.

ليثبت أنه لاعب يصنع الفارق في كل مرة.

@everyone`,

`👑 {user}

يحسم اللقب بعد أداء قوي ومستوى ثابت طوال المنافسة.

فرض سيطرته على المباريات ونجح في الحسم.

ليؤكد أنه يستحق هذا التتويج.

@everyone`,

`👑 {user}

يخطف الكابيتانو بعد سلسلة مباريات قوية وأداء متكامل.

نجح في التفوق على منافسين على مستوى عالٍ.

ليثبت أنه أحد أقوى الأسماء في الساحة.

@everyone`,

`👑 {user}

يتوج من جديد بعد أداء احترافي وتحكم واضح في المباريات.

قدم مستوى عالي يعكس خبرته الكبيرة.

ليؤكد استمراريته في القمة.

@everyone`,

`👑 {user}

يحسم اللقب بعد مواجهة حاسمة وأداء ثابت.

نجح في التعامل مع الضغط والتفوق في اللحظات المهمة.

ليثبت أنه لاعب حاسم في جميع الأوقات.

@everyone`,

`👑 {user}

يواصل التألق ويحسم اللقب بعد أداء قوي في جميع الجولات.

فرض أسلوبه الخاص على جميع المنافسين.

ليؤكد أنه من أبرز الأسماء في المنافسة.

@everyone`,

`👑 {user}

يخطف اللقب بعد سلسلة مواجهات صعبة وأداء مميز.

نجح في تجاوز جميع التحديات بثقة.

ليثبت أنه من الصفوة في هذه البطولة.

@everyone`,

`👑 {user}

يتصدر ويحقق اللقب بعد أداء متوازن وثبات ملحوظ.

قدم مباريات قوية تعكس مستواه العالي.

ليؤكد استحقاقه الكامل لهذا الإنجاز.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد أداء قوي وتحكم واضح في اللعب.

نجح في التفوق في جميع المواجهات.

ليثبت أنه الأفضل في هذه الجولة.

@everyone`,

`👑 {user}

يتوج باللقب بعد أداء ثابت ونتائج قوية.

فرض سيطرته على مجريات اللعب.

ليؤكد أنه من نخبة اللاعبين.

@everyone`,

`👑 {user}

يخطف اللقب بعد منافسة قوية وأداء متكامل.

نجح في حسم المواجهات الصعبة.

ليثبت أنه لاعب من الطراز العالي.

@everyone`,

// 🔥 كملنا 20

`👑 {user}

يحسم اللقب بعد أداء قوي وثقة واضحة في جميع المباريات.

نجح في السيطرة على مجريات اللعب.

ليؤكد أنه يستحق القمة.

@everyone`,

`👑 {user}

يتوج بالكابيتانو بعد سلسلة انتصارات قوية وأداء ثابت.

فرض نفسه بقوة في جميع الجولات.

ليثبت أنه أحد أفضل المنافسين.

@everyone`,

`👑 {user}

يخطف اللقب بعد أداء متكامل وتحكم واضح.

نجح في التفوق على جميع الخصوم.

ليؤكد أنه من الصفوة.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد أداء قوي ومستوى ثابت.

قدم مباريات مميزة تعكس احترافيته.

ليثبت أنه لاعب حاسم.

@everyone`,

`👑 {user}

يتصدر الترتيب بعد أداء ثابت وثقة عالية.

نجح في فرض أسلوبه على الجميع.

ليؤكد أنه يستحق هذا الإنجاز.

@everyone`,

`👑 {user}

يخطف اللقب بعد سلسلة مباريات ناجحة.

قدم مستوى قوي ومستقر.

ليثبت أنه من أفضل اللاعبين.

@everyone`,

`👑 {user}

يتوج بالكابيتانو بعد أداء مميز وثبات واضح.

نجح في السيطرة على جميع المواجهات.

ليؤكد استحقاقه الكامل.

@everyone`,

`👑 {user}

يحسم اللقب بعد مواجهة قوية وأداء ثابت.

نجح في التفوق في اللحظات الحاسمة.

ليثبت أنه لاعب يعتمد عليه.

@everyone`,

`👑 {user}

يخطف الكابيتانو بعد أداء متكامل وثقة كبيرة.

فرض نفسه في جميع الجولات.

ليؤكد أنه من نخبة المنافسين.

@everyone`,

`👑 {user}

يتصدر ويحسم اللقب بعد أداء قوي وثبات.

نجح في التفوق على الجميع.

ليثبت أنه الأفضل.

@everyone`,

// 🔥 آخر 10

`👑 {user}

يحسم اللقب بعد أداء قوي ومستوى ثابت.

نجح في السيطرة على المباريات.

ليؤكد أنه يستحق هذا الإنجاز.

@everyone`,

`👑 {user}

يتوج بالكابيتانو بعد أداء مميز وثبات.

فرض أسلوبه على جميع المنافسين.

ليثبت أنه من الصفوة.

@everyone`,

`👑 {user}

يخطف اللقب بعد سلسلة مواجهات قوية.

نجح في التفوق بثقة عالية.

ليؤكد أنه الأفضل.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد أداء ثابت وتحكم واضح.

نجح في فرض سيطرته.

ليثبت أنه لاعب حاسم.

@everyone`,

`👑 {user}

يتصدر بعد أداء قوي ومستوى مميز.

نجح في التفوق على الجميع.

ليؤكد أنه يستحق القمة.

@everyone`,

`👑 {user}

يخطف اللقب بعد أداء متكامل وثقة.

نجح في حسم جميع المواجهات.

ليثبت أنه من الأفضل.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد أداء قوي وثبات.

نجح في السيطرة على اللعب.

ليؤكد استحقاقه.

@everyone`,

`👑 {user}

يتوج باللقب بعد سلسلة نتائج قوية.

نجح في التفوق على المنافسين.

ليثبت أنه الأفضل.

@everyone`,

`👑 {user}

يخطف اللقب بعد أداء ثابت وثقة عالية.

نجح في فرض أسلوبه.

ليؤكد أنه من الصفوة.

@everyone`,

`👑 {user}

يحسم الكابيتانو بعد أداء قوي ومستوى ثابت.

نجح في التفوق على الجميع.

ليثبت أنه الرقم الصعب.

@everyone`,
  
];

// 🏆 لوحة الشرف
async function updateLeaderboard(channel) {
  const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);

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

  const content = msg.content;

  // 🔥 تصفير كامل
  if (content === "!res") {

    if (!msg.member.permissions.has("Administrator")) {
      return msg.reply("❌ هذا الأمر للإدارة فقط");
    }

    wins = {};
    totalWins = {};
    divisionCount = 0;
    leaderboardMessageId = null;

    fs.writeFileSync("wins.json", "{}");
    fs.writeFileSync("totalWins.json", "{}");
    fs.writeFileSync("division.json", "0");

    return msg.reply("♻️ تم تصفير جميع الإحصائيات");
  }

  // 👇 باقي الأوامر فقط بروم النتائج
  if (msg.channel.id !== CHANNEL_ID) return;

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
        .setDescription(text)]
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
        .setDescription(text)]
    });
  }

  // ➕ إضافة فوز
  if (content.startsWith("!addwin")) {
    const user = msg.mentions.users.first();
    const amount = parseInt(content.split(" ")[2]) || 1;

    if (!user) return msg.channel.send("حدد شخص");

    if (!wins[user.id]) wins[user.id] = 0;
    if (!totalWins[user.id]) totalWins[user.id] = 0;

    wins[user.id] += amount;
    totalWins[user.id] += amount;

    fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
    fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

    return msg.channel.send(`✅ تم إضافة ${amount} فوز لـ ${user}`);
  }

  // ➖ إزالة فوز
  if (content.startsWith("!removewin")) {
    const user = msg.mentions.users.first();
    const amount = parseInt(content.split(" ")[2]) || 1;

    if (!user) return msg.channel.send("حدد شخص");
    if (!wins[user.id]) return msg.channel.send("ما عنده فوز");

    wins[user.id] -= amount;
    if (wins[user.id] <= 0) delete wins[user.id];

    fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));

    return msg.channel.send(`❌ تم إزالة ${amount} فوز من ${user}`);
  }

  // 🎯 done
  if (content.startsWith("!done")) {

    const number = parseInt(content.split(" ")[1]);

    if (!isNaN(number)) divisionCount = number;
    else divisionCount++;

    fs.writeFileSync("division.json", JSON.stringify(divisionCount));

    msg.channel.send(`📊 تم تسجيل تقسيمة (${divisionCount}/10)`);

    if (divisionCount === 10) {
      const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      if (!sorted.length) return;

      const topId = sorted[0][0];
      const topWins = sorted[0][1];

      // 🏆 كارد فخم
      await msg.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#347235")
            .setTitle("🏆 TITANIUM")
            .setDescription(`🔥 بعد منافسة نارية، ينجح 👑 <@${topId}> في خطف اللقب!

🔥 عدد الفوز: ${topWins}
━━━━━━━━━━━━━━`)
            .setFooter({ text: "TITANIUM CAPTAIN" })
            .setTimestamp()
        ]
      });

      // إعلان
      const randomMsg = winnerMessages[Math.floor(Math.random() * winnerMessages.length)];
      const finalMsg = randomMsg.replace("{user}", `<@${topId}>`);

      const announceChannel = client.channels.cache.get(ANNOUNCE_CHANNEL);
      if (announceChannel) {
        announceChannel.send(finalMsg);
      }

      wins = {};
      divisionCount = 0;

      fs.writeFileSync("wins.json", "{}");
      fs.writeFileSync("division.json", "0");
    }

    return;
  }

  // 🔥 تسجيل الفوز
  let winnerId = null;
  const mentions = [...content.matchAll(/<@!?(\d+)>/g)];

  if (content.includes("الفائز") && mentions.length > 0) {
    winnerId = mentions[mentions.length - 1][1];
  }

  if (!winnerId) return;

  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  if (!wins[winner.id]) wins[winner.id] = 0;
  if (!totalWins[winner.id]) totalWins[winner.id] = 0;

  wins[winner.id]++;
  totalWins[winner.id]++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

  msg.reply(`🏆 ${winner} فاز!`);

  updateLeaderboard(msg.channel);
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
