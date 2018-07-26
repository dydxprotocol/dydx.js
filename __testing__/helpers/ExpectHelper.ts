import chai from 'chai';
const expect = chai.expect;

// For solidity function calls that violate require()
export async function expectThrow(promise) {
  try {
    await promise;
    throw new Error('Did not throw');
  } catch (e) {
    expect(e).to.match(/Exception while processing transaction: revert/);
  }
}
