
// This enum was originally a Typescript enum
const CarverAddressType = {
  Tx: 0,
  Address: 1,
  Coinbase: 2,
  Zerocoin: 3,
  Burn: 4,
  Fee: 5,
  ProofOfStake: 6,
  Masternode: 7,
  Governance: 8
}
// This enum was originally a Typescript enum
const CarverMovementType = {
  CoinbaseToTx: 0,

  TxIdVoutToTx: 1,
  TxToAddress: 2,

  PosTxIdVoutToTx: 3,
  TxToPosAddress: 4, // These are converted from TxToPosOutputAddress 
  TxToMnAddress: 5, // These are converted from TxToPosOutputAddress 
  TxToCoinbaseRewardAddress: 6,

  ZerocoinToTx: 7,
  TxToZerocoin: 8,
  Burn: 9,

  MasternodeRewardToTx: 10,
  PosRewardToTx: 11,
  GovernanceRewardToTx: 12,
  TxToGovernanceRewardAddress: 13,
  TxToFee: 14,

  /**
   * This is a temporary tx in POS output. There are multiple outputs in POS and we'll need to figure out which ones are going to POS address and which one is MN. We'll assume these can be in any order with any number of outputs. (An input is eligible for POS)
   * In the first pass of tx we don't call any async methods. So we'll say all outputs of POS are this temporary movement and then we'll figure out the actual address later.
   */
  TxToPosOutputAddress: 1000
}
module.exports = {
  CarverAddressType,
  CarverMovementType
}