const messageList = [
  "Welcome to Runeterra, $user$! :wave:",
  "Everyone, quickly assemble! $user$ has come to take all of the honeyfruit! :crossed_swords:",
  "Welcome, $user$! I hope you are not one of those pesky people that prefer peaches over honeyfruit, are you? :eyes:",
  "I think I know a Demacian when I see one, $user$. Welcome to Runeterra! :wave:",
  ":loudspeaker: FOR DEMACIAAA! ... Oh $user$..., where did you go ...?",
  "Welcome $user$, make yourself at home! :house: *But stay away from my honeyfruit...*",
  "Welcome, $user$! :wave: You look familiar, have we met before?",
  "It's our lucky day! $user$ decided to join the server!",
  "Wow, $user$. You are truly, truly outrageous! :sparkles:"
];

function getRandomMessage() {
  return messageList[Math.floor(Math.random() * messageList.length)];
}

module.exports = { messageList, getRandomMessage };
