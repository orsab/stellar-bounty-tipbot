const DB = require("../db");
const sdk = require('stellar-sdk')
const stellar = require("../stellar").getInstance();
const assert = require("assert");

const ASSET = new sdk.Asset(
  process.env.TIP_ASSET_CODE,
  process.env.TIP_ASSET_ISSUER
);

module.exports = async (amount, targetMemberId, member) => {
  const db = await DB.getInstance();

  const targetMember = await db.getMember(targetMemberId);

  assert.ok(targetMember, new Error("Member not linked"));
  assert.ok(
    member.roles.cache.some((role) => role.name === "Sponsor"),
    new Error('Should be "Sponsor" to send tip')
  );
  assert.ok(amount > 0, new Error("Bad amount"));

  let typeResponse = 0;
  const targetAccount = await stellar.getAccount(targetMember.address);

  // Account not exist = notify user how to create the account
  if (!targetAccount) {
    typeResponse = -1;
  }
  // Account exists, but trustline not exist = Send Claimable balance
  else if (
    !targetAccount.balances.some(
      (b) => b.asset_code === ASSET.code && b.asset_issuer === ASSET.issuer
    )
  ) {
    typeResponse = -2;
    
    try{
      await stellar.payClaimableToAddress(
        targetAccount,
        amount,
        ASSET
      );
    }catch(e){
      // Owner haven't BEAR coin
      typeResponse = -3
    }
  }
  // Account exists and trustline exists = Send payment
  else {
    await stellar.payToAddress(targetAccount, amount, ASSET);
  }

  return {
      type: typeResponse,
  }
};
