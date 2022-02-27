const DB = require("../db");
const stellar = require('../stellar').getInstance()
const assert = require('assert')

const wait = () => new Promise(res => setTimeout(res, 10000))

module.exports = async (interaction) => {
    const { commandName, options, member } = interaction;
    const db = await DB.getInstance()
    const currentMemberId = member.id;

    const targetMember = await db.getMember(currentMemberId)
    if(!targetMember){
        throw new Error('User not linked')
    }
    
    return targetMember
}