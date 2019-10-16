const Discord = require("discord.js");
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const sql = new SQLite("./database/users.sqlite");
const config = require("./auth.json");
const quotes = require("./resources/quotes.json");
const emotes = require("./resources/emotes.json");
const g = require("./global.js");
const db = require("./database/database.js");
const Canvas = require("canvas");
//const shapes = require("./shapes.js");
const welcome = require("./resources/welcome-messages.js");

// minigames
const gamble = require("./minigames/gamble.js");

client.on("ready", () => {
  db.start(client, sql);
});

// someone joins the server
client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.find(
    channel => channel.id === "477082508245073921"
  );

  if (channel) {
    channel.send(welcome.getRandomMessage().replace("$user$", member));
  }
});

// a member sends a message
client.on("message", message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  // Command-specific code here!
  if (command === "quote") {
    const quoteList = quotes.quotes;
    const embed = new Discord.RichEmbed()
      .setColor(0x00ae86) // Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      .setDescription(
        '*"' + quoteList[Math.floor(Math.random() * quoteList.length)] + '"*'
      )
      .setThumbnail(
        "https://vignette.wikia.nocookie.net/leagueoflegends/images/4/49/Kai%27SaSquare.png/revision/latest?cb=20180221202751"
      );

    message.channel.send({ embed });
  } else if (command === "emote") {
    const emoteID = pad(Math.floor(Math.random() * 15));

    const embed = new Discord.RichEmbed()
      .setColor(0x00ae86) // Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      .setDescription(emotes[emoteID].name)
      .setThumbnail(emotes[emoteID].url);

    message.channel.send({ embed });
  } else if (
    command === "gamble" &&
    message.channel.id === "606613431319003177"
  ) {
    gamble.play(message);
  } else if (command === "givebe") {
    db.verifyUser(client, message);

    const beToAdd = parseInt(args[1], 10);
    if (!beToAdd)
      return message.reply("You didn't tell me how much blue essence to give.");

    let text = "*";
    for (var i = 2; i < args.length; i++) {
      text += args[i];

      if (i !== args.length - 1) {
        text += " ";
      }
    }
    text += "*";

    giveBlueEssence(message, beToAdd, args[0], text);
  } else if (command === "giveoe") {
    db.verifyUser(client, message);

    const oeToAdd = parseInt(args[1], 10);
    if (!oeToAdd)
      return message.reply(
        "You didn't tell me how much orange essence to give."
      );

    let text = "*";
    for (var i = 2; i < args.length; i++) {
      text += args[i];

      if (i !== args.length - 1) {
        text += " ";
      }
    }
    text += "*";

    giveOrangeEssence(message, oeToAdd, args[0], text);
  } else if (command === "leaderboard") {
    const top10 = sql
      .prepare("SELECT * FROM users WHERE guild = ? ORDER BY xp DESC LIMIT 10;")
      .all(message.guild.id);

    // Now shake it and show it! (as a nice embed, too!)
    const embed = new Discord.RichEmbed()
      .setTitle("Leaderboard")
      //.setAuthor(client.user.username, client.user.avatarURL)
      .setDescription("Our top 10 xp leaders!")
      .setColor(0x00ae86);

    for (const data of top10) {
      embed.addField(
        client.users.get(data.user).username,
        `${data.points} points`
      );
    }
    return message.channel.send({ embed });
  } else if (command === "profile") {
    db.verifyUser(client, message);

    //const user = message.mentions.users.first();
    const user = message.mentions.members.first();
    if (user) showProfile(message, user);
    else showProfile(message, message.member);
  } else if (command === "welcome") {
    message.channel.send(
      welcome.getRandomMessage().replace("$user$", message.member)
    );
  } else if (command === "delete") {
    // check if the user is an admin
    if (message.member.roles.find(r => r.name === "Admin")) {
      const nbrToRemove = parseInt(args[0], 10);

      if (!nbrToRemove)
        return message.reply("you didn't tell me how many messages to delete.");

      deleteMessages(message.channel, nbrToRemove + 1);
    } else {
      return message.reply(
        "you do not possess the power to do that, summoner."
      );
    }
  }
});

client.login(config.token);

/*
 * Give blue essence to a user.
 */
function giveBlueEssence(message, BEToAdd, userToReceive, text) {
  // Limited to guild owner - adjust to your own preference!
  if (!message.member.roles.find(r => r.name === "Admin"))
    return message.reply("Only admins can give blue essence!");

  const user =
    message.mentions.users.first() || client.users.get(userToReceive);
  if (!user) return message.reply("You must mention someone or give their ID!");

  // Get their current data.
  let userData = client.getUser.get(user.id, message.guild.id);
  // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
  if (!userData) {
    // TODO: exhange for db.verifyUser ???
    userData = {
      id: `${message.guild.id}-${user.id}`,
      user: user.id,
      guild: message.guild.id,
      faction: 0,
      xp: 0,
      be: 0,
      oe: 0
    };
  }
  userData.be += BEToAdd;

  // And we save it!
  client.setUser.run(userData);

  //return message.channel.send(
  //  `${user.tag} has received ${pointsToAdd} blue essence and now stands at ${
  //    userscore.points
  //  }.`
  //);

  const embed = new Discord.RichEmbed()
    .setAuthor(
      BEToAdd + " blue essence received!",
      "https://vignette.wikia.nocookie.net/leagueoflegends/images/a/ac/BE_icon.png"
    )
    .setColor(0x0acce8)
    .addField("User", user, true)
    .addField("New balance", userData.be + " BE", true)
    .setFooter(
      "Received from " + message.author.username,
      message.author.displayAvatarURL
    )
    .setThumbnail("https://pbs.twimg.com/media/DLzJ8mkVoAE17EJ.png");

  if (text.length > 2) embed.addField("Message", text, false);

  message.channel.send({ embed });
}

async function showProfile(message, user) {
  let userData = client.getUser.get(user.id, message.guild.id);

  /*const embed = new Discord.RichEmbed()
    .setAuthor(user.username, user.displayAvatarURL)
    .setColor(0xefefef)
    .addField("Level", userData.xp, false)
    .addField("Blue essence", userData.be + " BE", true)
    .addField("Orange essence", userData.oe + " OE", true)
    //.setThumbnail(
    //  "https://vignette.wikia.nocookie.net/leagueoflegends/images/d/d8/Champion_Mastery_Level_1_Flair.png"
    //)
    .setThumbnail(
      "https://img.rankedboost.com/wp-content/uploads/2017/08/d2e01409b3b1a082.png"
    )
    .setImage(
      "https://img.rankedboost.com/wp-content/uploads/2017/08/bannerframe_05_inventory-1.png"
    );
  //.setFooter(
  //  "Ionia",
  ("https://vignette.wikia.nocookie.net/themannycenturionstheclashofkaijudo/images/f/fc/Ionia_Crest_icon.png/revision/latest?cb=20160306035515");
  //);

  message.channel.send({ embed });*/

  const canvas = Canvas.createCanvas(400, 250);
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "middle";

  const bannerframe = await Canvas.loadImage(getBannerFrame(user.roles)).catch(
    err => console.log("Caught an error while loading bannerframe icon.")
  );

  const banner = await Canvas.loadImage(
    "./resources/images/demacia/tier-1.png"
  ).catch(err => console.log("Caught an error while loading banner icon."));
  const blueEssence = await Canvas.loadImage(
    "./resources/images/blue-essence.png"
  ).catch(err =>
    console.log("Caught an error while loading blue essence icon.")
  );
  const orangeEssence = await Canvas.loadImage(
    "./resources/images/orange-essence.png"
  ).catch(err =>
    console.log("Caught an error while loading orange essence icon.")
  );

  // background
  ctx.fillStyle = "#010a13";
  ctx.rect(15, 60, canvas.width - 2 * 15, canvas.height - 2 * 60);
  ctx.fill();

  // border
  ctx.beginPath();
  ctx.strokeStyle = "#785b28";
  ctx.rect(
    15 + 1.5,
    60 - 1.5,
    canvas.width - 2 * 15 - 2 * 1.5,
    canvas.height - 2 * 60 + 2 * 1.5
  );
  ctx.rect(
    15 - 1.5,
    60 + 1.5,
    canvas.width - 2 * 15 + 2 * 1.5,
    canvas.height - 2 * 60 - 2 * 1.5
  );
  ctx.stroke();

  // banner + bannerframe
  //ctx.drawImage(banner, 35 + 9, 33 + 9, banner.width, banner.height);
  ctx.drawImage(banner, canvas.width - banner.width - 35, 33);
  //ctx.drawImage(bannerframe, 9, 9, bannerframe.width, bannerframe.height);
  ctx.drawImage(bannerframe, canvas.width - bannerframe.width, 0);

  // info
  const infoXpos = 30;
  const infoY = 85;
  const yDiff = 30;
  const scale = 0.15;
  // name
  ctx.font = "16px Verdana";
  ctx.fillStyle = "white";
  ctx.fillText(user.displayName, infoXpos, infoY);
  // be
  ctx.drawImage(
    blueEssence,
    infoXpos - 2,
    infoY + 1 * yDiff,
    blueEssence.width * scale,
    blueEssence.height * scale
  );
  ctx.font = "12px Verdana";
  ctx.fillText(userData.be, infoXpos + 30, infoY + 1 * yDiff + 11);
  // oe
  ctx.drawImage(
    orangeEssence,
    infoXpos - 1,
    infoY + 2 * yDiff,
    orangeEssence.width * scale * 0.9,
    orangeEssence.height * scale * 0.9
  );
  ctx.fillText(userData.oe, infoXpos + 30, infoY + 2 * yDiff + 11);

  const attachment = new Discord.Attachment(
    canvas.toBuffer(),
    "profile-image.png"
  );

  message.channel.send(attachment);
}

/*
 * Give orange essence to a user.
 */
async function giveOrangeEssence(message, OEToAdd, userToReceive, text) {
  // Limited to guild owner - adjust to your own preference!
  if (!message.member.roles.find(r => r.name === "Admin"))
    return message.reply("Only admins can give orange essence!");

  const user =
    message.mentions.users.first() || client.users.get(userToReceive);
  if (!user) return message.reply("You must mention someone or give their ID!");

  db.verifyUser(client, message);

  // Get their current data.
  let userData = client.getUser.get(user.id, message.guild.id);
  userData.oe += OEToAdd;
  client.setUser.run(userData); // save it

  const embed = new Discord.RichEmbed()
    .setAuthor(
      OEToAdd + " orange essence received!",
      "https://vignette.wikia.nocookie.net/leagueoflegends/images/3/37/OE_icon.png"
    )
    .setColor(0xf19230)
    .addField("User", user, true)
    .addField("New balance", userData.oe + " OE", true)
    .setFooter("Received from " + message.author.username, "")
    .setThumbnail(
      "https://vignette.wikia.nocookie.net/leagueoflegends/images/5/5e/Hextech_Crafting_Orange_Essence.png"
    );

  if (text.length > 2) embed.addField("Message", text, false);

  await message.channel.send({ embed });
  message.channel.send(user + "");
}

function pad(nbr) {
  var s = nbr + "";
  while (s.length < 3) s = "0" + s;
  return s;
}

function getBannerFrame(roles) {
  let bannerFrame = "./resources/images/bannerframe-user.png";

  if (roles.find(r => r.name === "Admin")) {
    bannerFrame = "./resources/images/bannerframe-admin.png";
  } else if (roles.find(r => r.name === "Moderator")) {
    bannerFrame = "./resources/images/bannerframe-moderator.png";
  }

  return bannerFrame;
}

async function deleteMessages(channel, nbr) {
  nbr = Math.abs(nbr);

  if (nbr > 11) {
    nbr = 11;
  }

  await channel
    .fetchMessages({ limit: nbr })
    .then(messages =>
      messages.forEach(msg => {
        msg.delete();
      })
    )
    .catch(console.error);

  console.log(
    "Successfully deleted " +
      (nbr - 1) +
      " (+1) messages from channel id " +
      channel.id
  );
}
