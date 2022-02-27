const { Asset } = require("stellar-sdk");
const sdk = require("stellar-sdk");

const URL =
  process.env.NETWORK === "testnet"
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";
const NETWORK =
  process.env.NETWORK === "testnet"
    ? sdk.Networks.TESTNET
    : sdk.Networks.PUBLIC;


class StellarHandler {
  instance;
  server;
  custodian;

  constructor(server, custodian) {
    this.server = server;
    this.custodian = custodian;
  }

  static getInstance() {
    if (!this.instance) {
      const server = new sdk.Server(URL);
      const custodian = sdk.Keypair.fromSecret(process.env.CUSTODIAN_WALLET);
      this.instance = new StellarHandler(server, custodian);
    }
    return this.instance;
  }

  async initCustomer(id) {
    const custodianAcc = await this.server.loadAccount(
      this.custodian.publicKey()
    );

    return new sdk.MuxedAccount(custodianAcc, String(id));
  }

  validateAddress(address) {
    return (
      sdk.StrKey.isValidMed25519PublicKey(address) ||
      sdk.StrKey.isValidEd25519PublicKey(address)
    );
  }

  async getAccount(address) {
    const targetAcc = await this.server.loadAccount(address).catch((e) => null);

    return targetAcc
  }

  async payClaimableToAddress(targetAcc, amount, asset) {
    const custodianAcc = await this.server.loadAccount(
      this.custodian.publicKey()
    );

    const deltaSeconds = Number(process.env.CLAIMABALE_BALANCE_CLAWBACK_TIME)
    let soon = Math.ceil(Date.now() / 1000 + deltaSeconds); // .now() is in ms
    let bCanClaim = sdk.Claimant.predicateBeforeRelativeTime(
      String(deltaSeconds)
    );
    let aCanReclaim = sdk.Claimant.predicateNot(
      sdk.Claimant.predicateBeforeAbsoluteTime(soon.toString())
    );

    let payment = sdk.Operation.createClaimableBalance({
      source: custodianAcc.accountId(),
      asset: asset,
      amount: String(amount),
      claimants: [new sdk.Claimant(targetAcc.accountId(), bCanClaim), new sdk.Claimant(custodianAcc.accountId(), aCanReclaim)],
    });

    const tx = new sdk.TransactionBuilder(custodianAcc, {
      networkPassphrase: NETWORK,
      fee: sdk.BASE_FEE,
    })
      .addOperation(payment)
      .setTimeout(30)
      .build();

    tx.sign(sdk.Keypair.fromSecret(process.env.CUSTODIAN_WALLET));
    return this.server.submitTransaction(tx);
  }

  async payToAddress(targetAcc, amount, asset) {
    const custodianAcc = await this.server.loadAccount(
      this.custodian.publicKey()
    );

    let payment = sdk.Operation.payment({
      source: custodianAcc.accountId(),
      destination: targetAcc.accountId(),
      asset: asset,
      amount: String(amount),
    });

    const tx = new sdk.TransactionBuilder(custodianAcc, {
      networkPassphrase: NETWORK,
      fee: sdk.BASE_FEE,
    })
      .addOperation(payment)
      .setTimeout(30)
      .build();

    tx.sign(sdk.Keypair.fromSecret(process.env.CUSTODIAN_WALLET));
    return this.server.submitTransaction(tx);
  }

  async getMuxedAccount(id) {
    const custodianAcc = await this.server.loadAccount(
      this.custodian.publicKey()
    );
    return new sdk.MuxedAccount(custodianAcc, String(id));
  }

  async getBalance(address) {
    const account = sdk.StrKey.isValidMed25519PublicKey(address.accountId())
      ? address.baseAccount()
      : address.accountId();

    return account.balances[0].balance;
  }
}

module.exports = StellarHandler;
