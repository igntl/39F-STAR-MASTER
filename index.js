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

const CHANNEL_ID = "1483219896069525665";
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

`👑 {user} يخطف لقب الكابيتانو بعد أداء استثنائي وسيطرة واضحة على مجريات التقسيمات
قدم مستوى ثابت من البداية للنهاية وفرض أسلوبه على جميع المنافسين
يثبت أنه حاضر دائمًا في أقوى اللحظات ولا يتأثر بالضغط
يؤكد أنه من نخبة اللاعبين في الساحة ويستحق القمة بجدارة
@everyone`,

`👑 {user} يحسم لقب الكابيتانو بعد منافسة قوية وأداء متوازن طوال المباريات
لعب بثقة عالية واتخذ قرارات حاسمة في اللحظات المهمة
أثبت أنه قادر على التعامل مع الضغط والمحافظة على مستواه
يؤكد أنه أحد أبرز الأسماء في هذه التقسيمات
@everyone`,

`👑 {user} يتوج بلقب الكابيتانو بعد مستوى مميز وثبات عالي في جميع المواجهات
قدم أداء متكامل يعكس خبرته وقدرته على التحكم في اللعب
لم يترك فرصة للخصوم وفرض سيطرته في كل جولة
يثبت أنه يستحق هذا التتويج بكل جدارة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح وثقة كبيرة في كل جولة
أدار المباريات بذكاء ونجح في التفوق على منافسين أقوياء
حافظ على مستواه العالي حتى النهاية دون تراجع
يؤكد أنه لاعب يعتمد عليه في أصعب المنافسات
@everyone`,

`👑 {user} يحسم اللقب بعد أداء قوي وقرارات ذكية طوال التقسيمات
قرأ المباريات بشكل ممتاز واستغل الفرص بالشكل الصحيح
أثبت أنه يمتلك عقلية بطل داخل المنافسة
يؤكد أنه من الصفوة ويستحق الصدارة
@everyone`,

`👑 {user} يتصدر ويخطف لقب الكابيتانو بعد سلسلة مواجهات ناجحة
قدم أداء ثابت يعكس احترافيته العالية في اللعب
حافظ على تركيزه وفرض نفسه في جميع الجولات
يؤكد استحقاقه الكامل لهذا الإنجاز الكبير
@everyone`,

`👑 {user} يفرض نفسه ويأخذ الكابيتانو بعد أداء منظم وثابت
تحكم في مجريات اللعب وقدم مستوى متوازن في كل مباراة
لم يتأثر بأي ضغط واستمر بنفس القوة حتى النهاية
يثبت أنه حاضر دائمًا في المنافسات القوية
@everyone`,

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وأداء مستقر
قدم مستوى عالي يعكس جاهزيته وثقته بنفسه
نجح في السيطرة على المباريات الحاسمة
يؤكد أنه لاعب يعتمد عليه في أصعب الظروف
@everyone`,

`👑 {user} يخطف اللقب بعد سيطرة واضحة وثقة عالية في اللعب
فرض أسلوبه منذ البداية وواصل بنفس المستوى حتى النهاية
أثبت أنه قادر على التفوق على الجميع
يؤكد أنه يستحق القمة بدون أي جدال
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد أداء متكامل وانضباط في المباريات
لعب بتركيز عالي وقدم مستوى ثابت طوال المنافسة
نجح في إنهاء المواجهات لصالحه بكل احترافية
يثبت أنه من أفضل اللاعبين في الساحة
@everyone`,

// 🔥 (نفس الأسلوب مكمل +100 رسالة بدون تكرار)

`👑 {user} يحسم اللقب بعد منافسة شرسة وأداء قوي وثابت
قدم مستوى مميز يعكس خبرته الكبيرة في اللعب
تعامل مع جميع المواجهات بثقة عالية وتركيز كامل
يثبت أنه يستحق هذا الإنجاز بكل جدارة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد سلسلة مباريات ناجحة وأداء متوازن
فرض سيطرته على مجريات اللعب منذ البداية
لم يترك مجالًا للمنافسين وقدم مستوى ثابت
يؤكد أنه من أبرز الأسماء في هذه البطولة
@everyone`,

`👑 {user} يتصدر ويأخذ اللقب بعد أداء قوي وثقة واضحة
قدم مستوى عالي واستمر بنفس الجودة حتى النهاية
نجح في فرض أسلوبه على جميع الخصوم
يثبت أنه لاعب من الطراز الأول
@everyone`,

`👑 {user} يحسم الكابيتانو بعد تحكم كامل في سير المباريات
لعب بذكاء عالي وقرأ المواجهات بشكل ممتاز
نجح في استغلال الفرص وتحقيق الانتصارات
يؤكد أنه يستحق هذا التتويج الكبير
@everyone`,

`👑 {user} يخطف اللقب بعد أداء ثابت ومستوى مميز في جميع الجولات
قدم مباريات قوية تعكس احترافيته العالية
لم يتراجع أمام أي تحدي واستمر بنفس القوة
يثبت أنه من نخبة اللاعبين في الساحة
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد أداء قوي وسيطرة واضحة
نجح في فرض أسلوبه على جميع المنافسين
قدم مستوى متكامل من البداية للنهاية
يؤكد أنه يستحق القمة بكل جدارة
@everyone`,

`👑 {user} يخطف لقب الكابيتانو بعد أداء استثنائي وتحكم كامل في مجريات اللعب
قدم مستوى عالي يعكس خبرته الكبيرة وثقته بنفسه في جميع المواجهات
لم يتراجع أمام أي تحدي وواصل بنفس القوة حتى النهاية
يثبت أنه من نخبة اللاعبين ويستحق هذا التتويج الكبير
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سلسلة مواجهات قوية وأداء ثابت
لعب بتركيز عالي ونجح في فرض أسلوبه على جميع الخصوم
أظهر احترافية كبيرة في التعامل مع اللحظات الحاسمة
يؤكد أنه لاعب يعتمد عليه في أقوى المنافسات
@everyone`,

`👑 {user} يتوج باللقب بعد أداء متكامل وسيطرة واضحة
قدم مستوى مميز من البداية وحتى صافرة النهاية
نجح في التفوق على جميع المنافسين بثقة عالية
يثبت أنه يستحق القمة بجدارة واستحقاق
@everyone`,

`👑 {user} يخطف الكابيتانو بعد حضور قوي وثبات في جميع الجولات
تحكم في إيقاع اللعب وفرض نفسه في كل مواجهة
أثبت أنه قادر على الحسم في أصعب الظروف
يؤكد أنه من أخطر اللاعبين في الساحة
@everyone`,

`👑 {user} يحسم اللقب بعد أداء قوي وقرارات دقيقة طوال المباريات
قرأ المواجهات بشكل ممتاز واستغل الفرص بالشكل الصحيح
نجح في السيطرة على اللحظات الحاسمة
يثبت أنه لاعب من الطراز العالي
@everyone`,

`👑 {user} يتصدر ويأخذ الكابيتانو بعد سلسلة انتصارات متتالية
قدم مستوى ثابت يعكس احترافيته العالية
حافظ على تركيزه وواصل بنفس الأداء حتى النهاية
يؤكد أنه يستحق هذا الإنجاز الكبير
@everyone`,

`👑 {user} يخطف اللقب بعد أداء متوازن وثقة واضحة في اللعب
أدار المباريات بذكاء ونجح في حسم المواجهات الصعبة
لم يتأثر بالضغط واستمر بنفس القوة
يثبت أنه من الصفوة في هذه المنافسة
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد أداء قوي وتحكم واضح
قدم مباريات مميزة تعكس خبرته الكبيرة
فرض أسلوبه على جميع الخصوم بدون استثناء
يؤكد أنه الأفضل في هذه التقسيمات
@everyone`,

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وأداء ثابت
لعب بثقة عالية واستطاع السيطرة على مجريات اللعب
نجح في التفوق في اللحظات الحاسمة
يثبت أنه يستحق هذا التتويج بكل جدارة
@everyone`,

`👑 {user} يخطف اللقب بعد سلسلة مباريات ناجحة وأداء متكامل
قدم مستوى عالي يعكس احترافيته في اللعب
حافظ على ثباته حتى النهاية دون أي تراجع
يؤكد أنه من أبرز الأسماء في المنافسة
@everyone`,

`👑 {user} يتصدر ويأخذ الكابيتانو بعد أداء قوي وثقة كبيرة
نجح في فرض سيطرته على جميع الجولات
لعب بتركيز عالي واستغل كل فرصة ممكنة
يثبت أنه لاعب يعتمد عليه دائمًا
@everyone`,

`👑 {user} يحسم اللقب بعد أداء مميز وسيطرة واضحة
قدم مباريات قوية تعكس مستواه الحقيقي
لم يترك أي مجال للمنافسين للمفاجأة
يؤكد أنه يستحق هذا الإنجاز الكبير
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم كامل في المباريات
قرأ اللعب بشكل ممتاز واتخذ قرارات ذكية
نجح في إنهاء المواجهات لصالحه بثقة
يثبت أنه من أفضل اللاعبين في الساحة
@everyone`,

`👑 {user} يتوج باللقب بعد أداء ثابت ونتائج قوية
قدم مستوى عالي طوال المنافسة دون تراجع
فرض نفسه بقوة في جميع الجولات
يؤكد أنه يستحق القمة بكل جدارة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سلسلة مواجهات صعبة
أظهر ثبات عالي وقدرة على التعامل مع الضغط
نجح في حسم المباريات المهمة لصالحه
يثبت أنه لاعب حاسم في كل الأوقات
@everyone`,

`👑 {user} يخطف اللقب بعد أداء قوي وثقة واضحة
قدم مباريات مميزة تعكس احترافيته
لم يتراجع أمام أي تحدي واستمر بنفس المستوى
يؤكد أنه من نخبة اللاعبين في المنافسة
@everyone`,

`👑 {user} يتصدر ويأخذ الكابيتانو بعد أداء متكامل
فرض سيطرته على جميع المواجهات
لعب بثقة عالية واستحق الفوز
يثبت أنه الأفضل في هذه الجولة
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية وأداء ثابت
نجح في السيطرة على مجريات اللعب
قدم مستوى مميز يعكس خبرته الكبيرة
يؤكد أنه يستحق هذا التتويج
@everyone`,

`👑 {user} يخطف الكابيتانو بعد سلسلة نتائج إيجابية
قدم أداء عالي واستمر بنفس القوة
نجح في التفوق على جميع المنافسين
يثبت أنه من الصفوة في هذه المنافسة
@everyone`,

`👑 {user} يتوج باللقب بعد أداء قوي وثبات ملحوظ
فرض أسلوبه على جميع الخصوم
لعب بتركيز عالي حتى النهاية
يؤكد أنه يستحق القمة بكل جدارة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد تحكم واضح في اللعب
قرأ المواجهات بشكل ممتاز
نجح في حسم اللحظات الحاسمة
يثبت أنه لاعب من الطراز العالي
@everyone`,

`👑 {user} يخطف اللقب بعد أداء متكامل وثقة كبيرة
قدم مستوى مميز في جميع الجولات
لم يتأثر بأي ضغط وواصل بنفس القوة
يؤكد أنه من أبرز اللاعبين
@everyone`,

`👑 {user} يتصدر ويأخذ الكابيتانو بعد أداء ثابت
نجح في فرض نفسه على الجميع
قدم مباريات قوية تعكس مستواه الحقيقي
يثبت أنه يستحق هذا الإنجاز
@everyone`,

`👑 {user} يحسم اللقب بعد سلسلة مباريات ناجحة
لعب بثقة عالية واستطاع التفوق
نجح في السيطرة على المباريات المهمة
يؤكد أنه من أفضل المنافسين
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء قوي ومستوى ثابت
فرض سيطرته على جميع الجولات
قدم مباريات مميزة تعكس احترافيته
يثبت أنه يستحق القمة
@everyone`,

`👑 {user} يتوج باللقب بعد أداء متوازن وثقة عالية
نجح في حسم المواجهات الصعبة
قدم مستوى قوي حتى النهاية
يؤكد أنه لاعب حاسم
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة
قدم مستوى عالي في جميع المباريات
نجح في التفوق على الجميع
يثبت أنه الأفضل
@everyone`,

`👑 {user} يخطف اللقب بعد أداء ثابت وثقة كبيرة
فرض نفسه في جميع الجولات
نجح في حسم المباريات الحاسمة
يؤكد أنه يستحق هذا الإنجاز
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
