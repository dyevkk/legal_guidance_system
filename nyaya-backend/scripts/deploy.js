const hre = require("hardhat");

async function main() {
    const NyayaRegistry = await hre.ethers.getContractFactory("NyayaRegistry");
    const registry = await NyayaRegistry.deploy();

    await registry.waitForDeployment();

    console.log("NyayaRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
