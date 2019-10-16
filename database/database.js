/*
 * "Initialize" or start the database.
 * Used when the bot is "ready".
 */
function start(client, sql) {
  // Check if the table "users" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE users (id TEXT PRIMARY KEY, user TEXT, guild TEXT, faction INTEGER, xp INTEGER, be INTEGER, oe INTEGER);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_users_id ON users (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  /*client.getScore = sql.prepare(
    "SELECT * FROM scores WHERE user = ? AND guild = ?"
  );
  client.setScore = sql.prepare(
    "INSERT OR REPLACE INTO scores (id, user, guild, points) VALUES (@id, @user, @guild, @points);"
  );*/
  client.getUser = sql.prepare(
    "SELECT * FROM users WHERE user = ? AND guild = ?"
  );
  client.setUser = sql.prepare(
    "INSERT OR REPLACE INTO users (id, user, guild, faction, xp, be, oe) VALUES (@id, @user, @guild, @faction, @xp, @be, @oe);"
  );
  /*client.getXP = sql.prepare(
    "SELECT xp FROM users WHERE user = ? AND guild = ?"
  );*/
  client.setXP = sql.prepare(
    "INSERT OR REPLACE INTO users (id, user, guild, faction, xp, be, oe) VALUES (@id, @user, @guild, @faction, @xp, @be, @oe);"
  );
  /*client.getBE = sql.prepare(
    "SELECT be FROM users WHERE user = ? AND guild = ?"
  );*/
  client.setBE = sql.prepare(
    "INSERT OR REPLACE INTO users (id, user, guild, faction, xp, be, oe) VALUES (@id, @user, @guild, @faction, @xp, @be, @oe);"
  );
  /*client.getOE = sql.prepare(
    "SELECT oe FROM users WHERE user = ? AND guild = ?"
  );*/
  client.setOE = sql.prepare(
    "INSERT OR REPLACE INTO users (id, user, guild, faction, xp, be, oe) VALUES (@id, @user, @guild, @faction, @xp, @be, @oe);"
  );
}

function verifyUser(client, message) {
  let user;
  if (message.guild) {
    user = client.getUser.get(message.author.id, message.guild.id);
    if (!user) {
      user = {
        id: `${message.guild.id}-${message.author.id}`,
        user: message.author.id,
        guild: message.guild.id,
        faction: 0,
        xp: 0,
        be: 0,
        oe: 0
      };
    }
    client.setUser.run(user);
  }
}

module.exports = { start, verifyUser };
