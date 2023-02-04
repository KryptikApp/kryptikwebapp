const {
  Account,
  Algodv2,
  AtomicTransactionComposer,
  generateAccount,
  getApplicationAddress,
  getMethodByName,
  Indexer,
  makeApplicationCloseOutTxn,
  OnApplicationComplete,
  SuggestedParams,
  Transaction,
  assignGroupID,
  makeBasicAccountTransactionSigner,
  decodeAddress,
  makeApplicationOptInTxn,
  makePaymentTxnWithSuggestedParams,
  mnemonicToSecretKey,
  ABIContract,
} = require("algosdk");
const depositsABI = require("./deposits.json");
const folksdk = require("folks-finance-js-sdk");

const enc = new TextEncoder();
function addEscrowNoteTransaction(
  userAddr,
  escrowAddr,
  appId,
  notePrefix,
  params
) {
  const note = Uint8Array.from([
    ...enc.encode(notePrefix),
    ...decodeAddress(escrowAddr).publicKey,
  ]);
  return makePaymentTxnWithSuggestedParams(
    userAddr,
    getApplicationAddress(appId),
    0,
    undefined,
    note,
    params
  );
}

async function main() {
  const algodClient = new Algodv2(
    "",
    "https://testnet-api.algonode.cloud/",
    443
  );
  const indexerClient = new Indexer(
    "",
    "https://testnet-idx.algonode.cloud/",
    443
  );
  const a = "QDMZGJ7XEUTT4JZW5LEO2SYCNLBGJC5WZ5XNBMVIUDWYCHRT7ZOS2BPFSE";
  const m =
    "virtual sleep tag rib host material spoon flight logic puzzle danger unlock siege quantum weekend father coach spider update lady begin country genuine ability cash";
  const user = mnemonicToSecretKey(m);
  const depositAppId = folksdk.TestnetDepositsAppId;
  const poolManageAppId = folksdk.TestnetPoolManagerAppId;
  let accountInfo = await algodClient.accountInformation(user.addr).do();
  console.log(accountInfo);
  const pool = folksdk.TestnetPools["ALGO"];
  const params = await algodClient.getTransactionParams().do();

  const depositInfo = await folksdk.retrieveUserDepositsInfo(
    indexerClient,
    folksdk.TestnetDepositsAppId,
    user.addr
  );
  console.log(depositInfo);
  if (depositInfo.length == 0) {
    let { txns, escrow } = folksdk.prepareAddDepositEscrowToDeposits(
      depositAppId,
      user.addr,
      params
    );

    let signedTxns = txns.map((txn) => txn.signTxn(user.sk));
    signedTxns.map(
      async (signedTxn) =>
        await algodClient.sendRawTransaction(signedTxns[0]).do()
    );
  }
  const escrow = depositInfo[0].escrowAddress;
  console.log(escrow);

  /*let txn = makeApplicationOptInTxn(user.addr, params, depositAppId);
  let signedtxn = txn.signTxn(user.sk);
  await algodClient.sendRawTransaction(signedtxn).do();*/

  folksdk.calcDepositInterestRate();
  //let signedtxn = txn.signTxn(user.sk);
  //algodClient.sendRawTransaction(signedtxn).do();
  /*txn = folksdk.prepareOptDepositEscrowIntoAssetInDeposits(
    depositAppId,
    poolManageAppId,
    user.addr,
    escrow,
    pool,
    params
  );
  signedtxn = txn.signTxn(user.sk);
  algodClient.sendRawTransaction(signedtxn).do();*/
  /*txns = folksdk.prepareDepositIntoPool(
    pool,
    folksdk.TestnetPoolManagerAppId,
    sender.addr
  );
  txns = prepareDepositTransactions(pool, sender.addr, depositAmount, params);
  signedTxns = txns.map((txn) => txn.signTxn(sender.sk));
  txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
  await algosdk.waitForConfirmation(algodClient, txId, 1000);*/
}
main();
