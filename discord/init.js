const { Constants } = require("discord.js");

module.exports = async (client) => {
  const guild = client.guilds.cache.get(process.env.DISCORDJS_GUILDID);

  guild.commands.create({
    name: "tip",
    description: "Tip member",
    options: [
      {
        name: "amount",
        description: "Positive amount to tip",
        type: Constants.ApplicationCommandOptionTypes.INTEGER,
        required: true,
      },
      {
        name: "member",
        description: "Choose a member to tip him",
        type: Constants.ApplicationCommandOptionTypes.USER,
        required: true,
      },
    ],
  });

  guild.commands.create({
    name: "link",
    description: "Link member to Stellar address",
    options: [
      {
        name: "address",
        description: "Stellar format address",
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
      },
    ],
  });

  guild.commands.create({
    name: "info",
    description: "Get info about yourself",
  });

  if(process.env.NETWORK === 'testnet'){
    guild.commands.create({
      name: "sponsor",
      description: "For testing reasons everyone can be Sponsor",
    });
  }

  if (!guild.roles.cache.some((role) => role.name === "Sponsor")) {
    guild.roles.create({
      name: "Sponsor",
      mentionable: true,
      color: "GREEN",
    });
  }
};
