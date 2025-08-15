// json fee function
function estimateRecursiveInscriptionFee(numItems: number, feeRate = 1) {
  // Calculate sizes
  const baseSize = 1000;
  const perItemSize = 100;
  const inscriptionSize = baseSize + numItems * perItemSize;

  // Commit transaction (typically ~150-200 vBytes)
  const commitVBytes = 200;
  const commitFee = commitVBytes * feeRate;

  // Reveal transaction
  const DUST_THRESHOLD = 546;
  const opCodeOverheadVBytes = Math.ceil(inscriptionSize / 520) * 3;
  const revealVBytes = Math.ceil(inscriptionSize / 4) + 200; // Transaction overhead included
  const revealFee =
    (revealVBytes + opCodeOverheadVBytes) * feeRate + DUST_THRESHOLD;

  return {
    commitFee: commitFee,
    revealFee: revealFee,
    totalFeeSats: commitFee + revealFee
  };
}

// one of one editions and traits upload files fee function

function estimateRegularInscriptionFee(fileSize: number, feeRate = 1) {
  // For regular inscriptions, the entire file is inscribed
  const inscriptionSize = fileSize;

  // Commit transaction (typically ~150-200 vBytes)
  const commitVBytes = 200;
  const commitFee = commitVBytes * feeRate;

  // Reveal transaction
  // File data goes in witness (1/4 weight) + transaction overhead
  const DUST_THRESHOLD = 546;
  const opCodeOverheadVBytes = Math.ceil(inscriptionSize / 520) * 3;
  const revealVBytes = Math.ceil(inscriptionSize / 4) + 180;
  const revealFee =
    (revealVBytes + opCodeOverheadVBytes) * feeRate + DUST_THRESHOLD;

  return {
    commitFee: commitFee,
    revealFee: revealFee,
    totalFeeSats: commitFee + revealFee
  };
}
