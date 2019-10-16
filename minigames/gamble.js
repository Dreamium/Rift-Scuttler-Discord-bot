const Discord = require("discord.js");
const Canvas = require("canvas");
const shapes = require("../shapes.js");

async function play(message) {
  // load assets
  const keyImg = await Canvas.loadImage(
    "https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f1/Hextech_Crafting_Key.png"
  ).catch(err => console.log("Caught an error while loading key image."));
  const chestImg = await Canvas.loadImage(
    "https://vignette.wikia.nocookie.net/leagueoflegends/images/6/60/Hextech_Crafting_Chest.png"
  ).catch(err => console.log("Caught an error while loading chest image."));
  const gemImg = await Canvas.loadImage(
    "https://vignette.wikia.nocookie.net/leagueoflegends/images/0/0d/Hextech_Crafting_Gemstone.png"
  ).catch(err => console.log("Caught an error while loading gemstone image."));

  // randomize values
  const first = pickRandom();
  const second = pickRandom();

  const canvas = Canvas.createCanvas(233, 104);
  const ctx = canvas.getContext("2d");

  //ctx.beginPath();

  // render first box
  shapes.addRect(ctx, 2, 2);
  if (first === "KEY") {
    ctx.drawImage(keyImg, 0, -2, keyImg.width * 0.35, keyImg.height * 0.35);
  } else if (first === "CHEST") {
    ctx.drawImage(
      chestImg,
      -16,
      -14,
      chestImg.width * 0.32,
      chestImg.height * 0.32
    );
  } else {
    ctx.drawImage(gemImg, 0, -2, gemImg.width * 0.35, gemImg.height * 0.35);
  }

  // render second box
  shapes.addRect(ctx, 131, 2);
  if (second === "KEY") {
    ctx.drawImage(keyImg, 131, -2, keyImg.width * 0.35, keyImg.height * 0.35);
  } else if (second === "CHEST") {
    ctx.drawImage(
      chestImg,
      115,
      -14,
      chestImg.width * 0.32,
      chestImg.height * 0.32
    );
  } else {
    ctx.drawImage(gemImg, 131, -2, gemImg.width * 0.35, gemImg.height * 0.35);
  }

  const attachment = new Discord.Attachment(
    canvas.toBuffer(),
    "loot-image.png"
  );
  message.channel.send(attachment);

  if (first === "GEMSTONE" || second === "GEMSTONE") {
    if (first === "GEMSTONE" && second === "GEMSTONE") {
      return message.reply(
        "lady luck is truly smilin'! You hit the jackpot and are now xx BE richer! :gem: :money_mouth: :gem:"
      );
    }
    return message.reply("you got lucky! You are now xx BE richer! :gem:");
  } else if (first !== second) {
    return message.reply(
      "you gamled x BE and **won**. You are now xx BE richer! :moneybag:"
    );
  } else {
    return message.reply("you gamled x BE and **lost**! :skull:");
  }
}

/*
 * Randomly returns either KEY, CHEST, or GEMSTONE.
 */
function pickRandom() {
  let rnd = Math.random();
  if (rnd > 0.9) {
    return "GEMSTONE";
  } else if (rnd > 0.6) {
    return "KEY";
  } else {
    return "CHEST";
  }
}

module.exports = { play };
