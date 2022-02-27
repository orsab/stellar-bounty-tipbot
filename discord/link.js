const stellar = require('../stellar').getInstance()
const assert = require('assert')
const DB = require("../db")

module.exports = async (currentMemberId, address) => {
    assert.ok(stellar.validateAddress(address), new Error('Bad Stellar address'))
    const db = await DB.getInstance()

    return db.linkMember(currentMemberId, address)
}