const stellar = require('../stellar').getInstance()
const assert = require('assert')
const DB = require("../db")

module.exports = async (interaction) => {
    const { commandName, options, member } = interaction;
    const currentMemberId = member.id;

    const address = options.data.find((d) => d.name === "address")?.value;

    assert.ok(stellar.validateAddress(address), new Error('Bad Stellar address'))
    const db = await DB.getInstance()

    return db.linkMember(currentMemberId, address)
}