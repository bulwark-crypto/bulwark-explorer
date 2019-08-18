
// Enum of all possible Carver2D addresses. In carver, everything is a movement between two addresses. Money always flows in between two "carver addresses"
const CarverAddressType = {
  Tx: 0,
  Address: 1,
  Coinbase: 2,
  Zerocoin: 3,
  Burn: 4,
  Fee: 5,
  ProofOfStake: 6,
  Masternode: 7,
  Governance: 8,
  RewardTx: 9
}

/**
 * During syncing, identify what type of transaciton we're working with
 */
const CarverTxType = {
  BasicTx: 0, // Basic movement
  Coinbase: 1, // POW or POW+MN
  ProofOfStake: 2, // POS or POS+MN
  ZerocoinSpend: 3 // Zerocoin->addresses
}

/*
Flow of funds is always represented as a movement between two carver addresses. Ideally you want to be able to reconcile your entire blockchain to 0.00. 
Carver algorithm should be compatible with any blockchain. 

Examples: 
 - Bitcoin: address -> tx -> address 
 - Zerocoin = address -> tx -> "ZEROCOIN" address -> tx -> address 
 - MN+POS: Address -> tx -> (pos address + mn address) 
 - OP_RETURN(Burn): tx -> address
 - Basic transaction: address -> tx -> (address + "FEE" address)
 - Any complex mixing logic can be fanned out: (address + address) -> address OR address -> (address + address)

Here is the current state of Carver2D: (address,address,...) -> (tx,tx,...) -> (address,address,...)
Here is the future state of Carver2D: (address,address,...) -> block -> (tx,tx,...) -> (address,address,...)
*/
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

  AddressToTx: 15,

  /**
   * This is a temporary tx in POS output. There are multiple outputs in POS and we'll need to figure out which ones are going to POS address and which one is MN. We'll assume these can be in any order with any number of outputs. (An input is eligible for POS)
   * In the first pass of tx we don't call any async methods. So we'll say all outputs of POS are this temporary movement and then we'll figure out the actual address later.
   */
  TxToPosOutputAddress: 1000
}
module.exports = {
  CarverAddressType,
  CarverMovementType,
  CarverTxType
}