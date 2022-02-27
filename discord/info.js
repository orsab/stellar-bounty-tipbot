const DB = require("../db");
const stellar = require('../stellar').getInstance()
const assert = require('assert')

module.exports = async (interaction) => {
    const { commandName, options, member } = interaction;
    const db = await DB.getInstance()
    const currentMemberId = member.id;

    const targetMember = await db.getMember(currentMemberId)
    
    return targetMember
}