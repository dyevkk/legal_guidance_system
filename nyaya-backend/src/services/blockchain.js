const { ethers } = require("ethers");
const crypto = require("crypto");
require("dotenv").config();

// Default values for local hardhat network
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
// Hardhat Account #0 private key
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// First deployed contract address on local hardhat
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let contract;

try {
    // Attempt to load the ABI from the adjacent contracts folder
    const artifact = require("../../../nyaya-contracts/artifacts/contracts/NyayaRegistry.sol/NyayaRegistry.json");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
} catch (err) {
    console.warn("⚠️ Blockchain contract artifact not found or connection failed. Blockchain features will be disabled.", err.message);
}

/**
 * Hash a string (like a document ID or content) and store it on the blockchain
 * @param {string} data The data to hash and store
 * @returns {Promise<{hash: string, txHash: string}>}
 */
async function storeHashOnChain(data) {
    if (!contract) throw new Error("Blockchain service not initialized");

    // Create a SHA-256 hash
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    // Add to blockchain
    const tx = await contract.addRecord(hash);
    const receipt = await tx.wait();

    return {
        hash,
        txHash: receipt.hash
    };
}

/**
 * Verify if a hash exists on the blockchain and get its timestamp
 * @param {string} hash The hash to check
 * @returns {Promise<number>} Timestamp of when it was recorded, or 0 if not found
 */
async function verifyHashOnChain(hash) {
    if (!contract) throw new Error("Blockchain service not initialized");
    return await contract.verifyRecord(hash);
}

module.exports = {
    storeHashOnChain,
    verifyHashOnChain
};
