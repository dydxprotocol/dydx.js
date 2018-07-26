import chai from 'chai';
const expect = chai.expect;

// For solidity function calls that violate require()
export async function expectThrow(promise) {
  try {
    await promise;
    throw new Error('Did not throw');
  } catch (e) {
    assertCertainError(e, 'Exception while processing transaction: revert');
  }
}

// Helper function
function assertCertainError(ERROR, EXPECTED_ERROR_MSG) {
  // This complication is so that the actual error will appear in truffle test output
  const message = ERROR.message;
  const matchedIndex = message.search(EXPECTED_ERROR_MSG);
  let matchedString = message;
  if (matchedIndex >= 0) {
    matchedString = message.substring(matchedIndex, matchedIndex + EXPECTED_ERROR_MSG.length);
  }
  expect(matchedString).to.equal(EXPECTED_ERROR_MSG);
}
