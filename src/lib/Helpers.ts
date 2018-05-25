export function setupContract(
    contract,
    provider,
    networkId: number
) {
    contract.setProvider(provider);
    contract.setNetwork(networkId);
}
