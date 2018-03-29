
const params = {
  LAST_POW_BLOCK: 345600,
  RAMP_TO_BLOCK: 960
};

const avgBlockTime = 90; // 1.5 minutes (90 seconds)

const blocksPerDay = (24 * 60 * 60) / avgBlockTime; // 960

const blocksPerWeek = blocksPerDay * 7; // 6720

const blocksPerMonth = (blocksPerDay * 365.25) / 12; // 29220

const blocksPerYear = blocksPerDay * 365.25; // 350640

const mncoins = 5000.0;

const getMNBlocksPerDay = (mns) => {
  return blocksPerDay / mns;
};

const getMNBlocksPerWeek = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 52);
};

const getMNBlocksPerMonth = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 12);
};

const getMNBlocksPerYear = (mns) => {
  return getMNBlocksPerDay(mns) * 365.25;
};

const getMNSubsidy = (nHeight = 0, nMasternodeCount = 0, nMoneySupply = 0) => {
  const blockValue = getSubsidy(nHeight);
  let ret = 0.0;

  if (nHeight < params.RAMP_TO_BLOCK) {
    ret = 0;
  } else if (nHeight <= 28799 && nHeight >= params.RAMP_TO_BLOCK) {
    ret = blockValue / 5;
  } else if (nHeight <= 57599 && nHeight >= 28800) {
    ret = blockValue / 4;
  } else if (nHeight <= 86399 && nHeight >= 57600) {
    ret = blockValue / 3;
  } else if (nHeight <= params.LAST_POW_BLOCK && nHeight >= 86400) {
    ret = blockValue / 2;
  } else if (nHeight > params.LAST_POW_BLOCK) {
    let mNodeCoins = nMasternodeCount * 5000;
    if (mNodeCoins === 0) {
      ret = 0;
    } else {
      if (mNodeCoins <= (nMoneySupply * 0.01) && mNodeCoins > 0) {
          ret = blockValue * 0.90;
      } else if (mNodeCoins <= (nMoneySupply * 0.02) && mNodeCoins > (nMoneySupply * 0.01)) {
          ret = blockValue * 0.88;
      } else if (mNodeCoins <= (nMoneySupply * 0.03) && mNodeCoins > (nMoneySupply * 0.02)) {
          ret = blockValue * 0.87;
      } else if (mNodeCoins <= (nMoneySupply * 0.04) && mNodeCoins > (nMoneySupply * 0.03)) {
          ret = blockValue * 0.86;
      } else if (mNodeCoins <= (nMoneySupply * 0.05) && mNodeCoins > (nMoneySupply * 0.04)) {
          ret = blockValue * 0.85;
      } else if (mNodeCoins <= (nMoneySupply * 0.06) && mNodeCoins > (nMoneySupply * 0.05)) {
          ret = blockValue * 0.84;
      } else if (mNodeCoins <= (nMoneySupply * 0.07) && mNodeCoins > (nMoneySupply * 0.06)) {
          ret = blockValue * 0.83;
      } else if (mNodeCoins <= (nMoneySupply * 0.08) && mNodeCoins > (nMoneySupply * 0.07)) {
          ret = blockValue * 0.82;
      } else if (mNodeCoins <= (nMoneySupply * 0.09) && mNodeCoins > (nMoneySupply * 0.08)) {
          ret = blockValue * 0.81;
      } else if (mNodeCoins <= (nMoneySupply * 0.10) && mNodeCoins > (nMoneySupply * 0.09)) {
          ret = blockValue * 0.80;
      } else if (mNodeCoins <= (nMoneySupply * 0.11) && mNodeCoins > (nMoneySupply * 0.10)) {
          ret = blockValue * 0.79;
      } else if (mNodeCoins <= (nMoneySupply * 0.12) && mNodeCoins > (nMoneySupply * 0.11)) {
          ret = blockValue * 0.78;
      } else if (mNodeCoins <= (nMoneySupply * 0.13) && mNodeCoins > (nMoneySupply * 0.12)) {
          ret = blockValue * 0.77;
      } else if (mNodeCoins <= (nMoneySupply * 0.14) && mNodeCoins > (nMoneySupply * 0.13)) {
          ret = blockValue * 0.76;
      } else if (mNodeCoins <= (nMoneySupply * 0.15) && mNodeCoins > (nMoneySupply * 0.14)) {
          ret = blockValue * 0.75;
      } else if (mNodeCoins <= (nMoneySupply * 0.16) && mNodeCoins > (nMoneySupply * 0.15)) {
          ret = blockValue * 0.74;
      } else if (mNodeCoins <= (nMoneySupply * 0.17) && mNodeCoins > (nMoneySupply * 0.16)) {
          ret = blockValue * 0.73;
      } else if (mNodeCoins <= (nMoneySupply * 0.18) && mNodeCoins > (nMoneySupply * 0.17)) {
          ret = blockValue * 0.72;
      } else if (mNodeCoins <= (nMoneySupply * 0.19) && mNodeCoins > (nMoneySupply * 0.18)) {
          ret = blockValue * 0.71;
      } else if (mNodeCoins <= (nMoneySupply * 0.20) && mNodeCoins > (nMoneySupply * 0.19)) {
          ret = blockValue * 0.70;
      } else if (mNodeCoins <= (nMoneySupply * 0.21) && mNodeCoins > (nMoneySupply * 0.20)) {
          ret = blockValue * 0.69;
      } else if (mNodeCoins <= (nMoneySupply * 0.22) && mNodeCoins > (nMoneySupply * 0.21)) {
          ret = blockValue * 0.68;
      } else if (mNodeCoins <= (nMoneySupply * 0.23) && mNodeCoins > (nMoneySupply * 0.22)) {
          ret = blockValue * 0.67;
      } else if (mNodeCoins <= (nMoneySupply * 0.24) && mNodeCoins > (nMoneySupply * 0.23)) {
          ret = blockValue * 0.66;
      } else if (mNodeCoins <= (nMoneySupply * 0.25) && mNodeCoins > (nMoneySupply * 0.24)) {
          ret = blockValue * 0.65;
      } else if (mNodeCoins <= (nMoneySupply * 0.26) && mNodeCoins > (nMoneySupply * 0.25)) {
          ret = blockValue * 0.64;
      } else if (mNodeCoins <= (nMoneySupply * 0.27) && mNodeCoins > (nMoneySupply * 0.26)) {
          ret = blockValue * 0.63;
      } else if (mNodeCoins <= (nMoneySupply * 0.28) && mNodeCoins > (nMoneySupply * 0.27)) {
          ret = blockValue * 0.62;
      } else if (mNodeCoins <= (nMoneySupply * 0.29) && mNodeCoins > (nMoneySupply * 0.28)) {
          ret = blockValue * 0.61;
      } else if (mNodeCoins <= (nMoneySupply * 0.30) && mNodeCoins > (nMoneySupply * 0.29)) {
          ret = blockValue * 0.60;
      } else if (mNodeCoins <= (nMoneySupply * 0.31) && mNodeCoins > (nMoneySupply * 0.30)) {
          ret = blockValue * 0.59;
      } else if (mNodeCoins <= (nMoneySupply * 0.32) && mNodeCoins > (nMoneySupply * 0.31)) {
          ret = blockValue * 0.58;
      } else if (mNodeCoins <= (nMoneySupply * 0.33) && mNodeCoins > (nMoneySupply * 0.32)) {
          ret = blockValue * 0.57;
      } else if (mNodeCoins <= (nMoneySupply * 0.34) && mNodeCoins > (nMoneySupply * 0.33)) {
          ret = blockValue * 0.56;
      } else if (mNodeCoins <= (nMoneySupply * 0.35) && mNodeCoins > (nMoneySupply * 0.34)) {
          ret = blockValue * 0.55;
      } else if (mNodeCoins <= (nMoneySupply * 0.363) && mNodeCoins > (nMoneySupply * 0.35)) {
          ret = blockValue * 0.54;
      } else if (mNodeCoins <= (nMoneySupply * 0.376) && mNodeCoins > (nMoneySupply * 0.363)) {
          ret = blockValue * 0.53;
      } else if (mNodeCoins <= (nMoneySupply * 0.389) && mNodeCoins > (nMoneySupply * 0.376)) {
          ret = blockValue * 0.52;
      } else if (mNodeCoins <= (nMoneySupply * 0.402) && mNodeCoins > (nMoneySupply * 0.389)) {
          ret = blockValue * 0.51;
      } else if (mNodeCoins <= (nMoneySupply * 0.415) && mNodeCoins > (nMoneySupply * 0.402)) {
          ret = blockValue * 0.50;
      } else if (mNodeCoins <= (nMoneySupply * 0.428) && mNodeCoins > (nMoneySupply * 0.415)) {
          ret = blockValue * 0.49;
      } else if (mNodeCoins <= (nMoneySupply * 0.441) && mNodeCoins > (nMoneySupply * 0.428)) {
          ret = blockValue * 0.48;
      } else if (mNodeCoins <= (nMoneySupply * 0.454) && mNodeCoins > (nMoneySupply * 0.441)) {
          ret = blockValue * 0.47;
      } else if (mNodeCoins <= (nMoneySupply * 0.467) && mNodeCoins > (nMoneySupply * 0.454)) {
          ret = blockValue * 0.46;
      } else if (mNodeCoins <= (nMoneySupply * 0.48) && mNodeCoins > (nMoneySupply * 0.467)) {
          ret = blockValue * 0.45;
      } else if (mNodeCoins <= (nMoneySupply * 0.493) && mNodeCoins > (nMoneySupply * 0.48)) {
          ret = blockValue * 0.44;
      } else if (mNodeCoins <= (nMoneySupply * 0.506) && mNodeCoins > (nMoneySupply * 0.493)) {
          ret = blockValue * 0.43;
      } else if (mNodeCoins <= (nMoneySupply * 0.519) && mNodeCoins > (nMoneySupply * 0.506)) {
          ret = blockValue * 0.42;
      } else if (mNodeCoins <= (nMoneySupply * 0.532) && mNodeCoins > (nMoneySupply * 0.519)) {
          ret = blockValue * 0.41;
      } else if (mNodeCoins <= (nMoneySupply * 0.545) && mNodeCoins > (nMoneySupply * 0.532)) {
          ret = blockValue * 0.40;
      } else if (mNodeCoins <= (nMoneySupply * 0.558) && mNodeCoins > (nMoneySupply * 0.545)) {
          ret = blockValue * 0.39;
      } else if (mNodeCoins <= (nMoneySupply * 0.571) && mNodeCoins > (nMoneySupply * 0.558)) {
          ret = blockValue * 0.38;
      } else if (mNodeCoins <= (nMoneySupply * 0.584) && mNodeCoins > (nMoneySupply * 0.571)) {
          ret = blockValue * 0.37;
      } else if (mNodeCoins <= (nMoneySupply * 0.597) && mNodeCoins > (nMoneySupply * 0.584)) {
          ret = blockValue * 0.36;
      } else if (mNodeCoins <= (nMoneySupply * 0.61) && mNodeCoins > (nMoneySupply * 0.597)) {
          ret = blockValue * 0.35;
      } else if (mNodeCoins <= (nMoneySupply * 0.623) && mNodeCoins > (nMoneySupply * 0.61)) {
          ret = blockValue * 0.34;
      } else if (mNodeCoins <= (nMoneySupply * 0.636) && mNodeCoins > (nMoneySupply * 0.623)) {
          ret = blockValue * 0.33;
      } else if (mNodeCoins <= (nMoneySupply * 0.649) && mNodeCoins > (nMoneySupply * 0.636)) {
          ret = blockValue * 0.32;
      } else if (mNodeCoins <= (nMoneySupply * 0.662) && mNodeCoins > (nMoneySupply * 0.649)) {
          ret = blockValue * 0.31;
      } else if (mNodeCoins <= (nMoneySupply * 0.675) && mNodeCoins > (nMoneySupply * 0.662)) {
          ret = blockValue * 0.30;
      } else if (mNodeCoins <= (nMoneySupply * 0.688) && mNodeCoins > (nMoneySupply * 0.675)) {
          ret = blockValue * 0.29;
      } else if (mNodeCoins <= (nMoneySupply * 0.701) && mNodeCoins > (nMoneySupply * 0.688)) {
          ret = blockValue * 0.28;
      } else if (mNodeCoins <= (nMoneySupply * 0.714) && mNodeCoins > (nMoneySupply * 0.701)) {
          ret = blockValue * 0.27;
      } else if (mNodeCoins <= (nMoneySupply * 0.727) && mNodeCoins > (nMoneySupply * 0.714)) {
          ret = blockValue * 0.26;
      } else if (mNodeCoins <= (nMoneySupply * 0.74) && mNodeCoins > (nMoneySupply * 0.727)) {
          ret = blockValue * 0.25;
      } else if (mNodeCoins <= (nMoneySupply * 0.753) && mNodeCoins > (nMoneySupply * 0.74)) {
          ret = blockValue * 0.24;
      } else if (mNodeCoins <= (nMoneySupply * 0.766) && mNodeCoins > (nMoneySupply * 0.753)) {
          ret = blockValue * 0.23;
      } else if (mNodeCoins <= (nMoneySupply * 0.779) && mNodeCoins > (nMoneySupply * 0.766)) {
          ret = blockValue * 0.22;
      } else if (mNodeCoins <= (nMoneySupply * 0.792) && mNodeCoins > (nMoneySupply * 0.779)) {
          ret = blockValue * 0.21;
      } else if (mNodeCoins <= (nMoneySupply * 0.805) && mNodeCoins > (nMoneySupply * 0.792)) {
          ret = blockValue * 0.20;
      } else if (mNodeCoins <= (nMoneySupply * 0.818) && mNodeCoins > (nMoneySupply * 0.805)) {
          ret = blockValue * 0.19;
      } else if (mNodeCoins <= (nMoneySupply * 0.831) && mNodeCoins > (nMoneySupply * 0.818)) {
          ret = blockValue * 0.18;
      } else if (mNodeCoins <= (nMoneySupply * 0.844) && mNodeCoins > (nMoneySupply * 0.831)) {
          ret = blockValue * 0.17;
      } else if (mNodeCoins <= (nMoneySupply * 0.857) && mNodeCoins > (nMoneySupply * 0.844)) {
          ret = blockValue * 0.16;
      } else if (mNodeCoins <= (nMoneySupply * 0.87) && mNodeCoins > (nMoneySupply * 0.857)) {
          ret = blockValue * 0.15;
      } else if (mNodeCoins <= (nMoneySupply * 0.883) && mNodeCoins > (nMoneySupply * 0.87)) {
          ret = blockValue * 0.14;
      } else if (mNodeCoins <= (nMoneySupply * 0.896) && mNodeCoins > (nMoneySupply * 0.883)) {
          ret = blockValue * 0.13;
      } else if (mNodeCoins <= (nMoneySupply * 0.909) && mNodeCoins > (nMoneySupply * 0.896)) {
          ret = blockValue * 0.12;
      } else if (mNodeCoins <= (nMoneySupply * 0.922) && mNodeCoins > (nMoneySupply * 0.909)) {
          ret = blockValue * 0.11;
      } else if (mNodeCoins <= (nMoneySupply * 0.935) && mNodeCoins > (nMoneySupply * 0.922)) {
          ret = blockValue * 0.10;
      } else if (mNodeCoins <= (nMoneySupply * 0.945) && mNodeCoins > (nMoneySupply * 0.935)) {
          ret = blockValue * 0.09;
      } else if (mNodeCoins <= (nMoneySupply * 0.961) && mNodeCoins > (nMoneySupply * 0.945)) {
          ret = blockValue * 0.08;
      } else if (mNodeCoins <= (nMoneySupply * 0.974) && mNodeCoins > (nMoneySupply * 0.961)) {
          ret = blockValue * 0.07;
      } else if (mNodeCoins <= (nMoneySupply * 0.987) && mNodeCoins > (nMoneySupply * 0.974)) {
          ret = blockValue * 0.06;
      } else if (mNodeCoins <= (nMoneySupply * 0.99) && mNodeCoins > (nMoneySupply * 0.987)) {
          ret = blockValue * 0.05;
      } else {
          ret = blockValue * 0.01;
      }
    }
  }

  return ret;
};

const getSubsidy = (nHeight = 1) => {
  let nSubsidy = 0.0;
  let nSlowSubsidy = 50.0;

  if (nHeight === 1) {
    nSubsidy = 489720.00;
  } else if (nHeight < params.RAMP_TO_BLOCK / 2) {
    nSlowSubsidy /= params.RAMP_TO_BLOCK;
    nSlowSubsidy *= nHeight;
  } else if (nHeight < params.RAMP_TO_BLOCK) {
    nSlowSubsidy /= params.RAMP_TO_BLOCK;
    nSlowSubsidy *= nHeight;
  } else if (nHeight <= 86399 && nHeight >= params.RAMP_TO_BLOCK) {
    nSubsidy = 50;
  } else if (nHeight <= 172799 && nHeight >= 86400) {
    nSubsidy = 43.75;
  } else if (nHeight <= 259199 && nHeight >= 172800) {
    nSubsidy = 37.5;
  } else if (nHeight <= params.LAST_POW_BLOCK && nHeight >= 259200) {
    nSubsidy = 31.25;

  // POS Year 1
  } else if (nHeight <= 431999 && nHeight > params.LAST_POW_BLOCK) {
    nSubsidy = 25;
  } else if (nHeight <= 518399 && nHeight >= 432000) {
    nSubsidy = 21.875;
  } else if (nHeight <= 604799 && nHeight >= 518400) {
    nSubsidy = 18.750;
  } else if (nHeight <= 691199 && nHeight >= 604800) {
    nSubsidy = 15.625;

  // POS Year 2
  } else if (nHeight <= 777599 && nHeight >= 691200) {
    nSubsidy = 12.50;
  } else if (nHeight <= 863999 && nHeight >= 777600) {
    nSubsidy = 10.938;
  } else if (nHeight <= 950399 && nHeight >= 864000) {
    nSubsidy = 9.375;
  } else if (nHeight <= 1036799 && nHeight >= 950400) {
    nSubsidy = 7.812;

  // POS Year 3
  } else if (nHeight <= 1123199 && nHeight >= 1036800) {
    nSubsidy = 6.250;
  } else if (nHeight <= 1209599 && nHeight >= 1123200) {
    nSubsidy = 5.469;
  } else if (nHeight <= 1295999 && nHeight >= 1209600) {
    nSubsidy = 4.688;
  } else if (nHeight <= 1382399 && nHeight >= 1296000) {
    nSubsidy = 3.906;

  // POS Year 4
  } else if (nHeight <= 1468799 && nHeight >= 1382400) {
    nSubsidy = 3.125;
  } else if (nHeight <= 1555199 && nHeight >= 1468800) {
    nSubsidy = 2.734;
  } else if (nHeight <= 1641599 && nHeight >= 1555200) {
    nSubsidy = 2.344;
  } else if (nHeight <= 1727999 && nHeight >= 1641600) {
    nSubsidy = 1.953;

  } else if (nHeight > 1728000) {
    nSubsidy = 1.625;
  } else {
    nSubsidy = 0;
  }

  return nHeight >= params.RAMP_TO_BLOCK ? nSubsidy : nSlowSubsidy;
};

const getROI = (subsidy, mns) => {
  return ((getMNBlocksPerYear(mns) * subsidy) / mncoins) * 100.0;
};

const isAddress = (s) => {
  return typeof(s) === 'string' && s.length === 34;
};

const isBlock = (s) => {
  return !isNaN(s) || (typeof(s) === 'string' && s.substr(0, 4) === '0000');
};

const isTX = (s) => {
  return typeof(s) === 'string';
};

module.exports = {
  avgBlockTime,
  blocksPerDay,
  blocksPerMonth,
  blocksPerWeek,
  blocksPerYear,
  mncoins,
  params,
  getMNBlocksPerDay,
  getMNBlocksPerMonth,
  getMNBlocksPerWeek,
  getMNBlocksPerYear,
  getMNSubsidy,
  getSubsidy,
  getROI,
  isAddress,
  isBlock,
  isTX
};
