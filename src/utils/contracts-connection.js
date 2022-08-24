// import Web3 from 'web3';
// import "./utils/contracts-details";
// import { dino_pool_abi, dino_pool_address, dino_token_abi, dino_token_address, fossil_token_abi, fossil_token_address, liquidity_mining_manager_abi, liquidity_mining_manager_address, rewards_pool_abi, rewards_pool_address, utility_manager_abi, utility_manager_address } from './utils/contracts-details';

// export let fossilToken;
// export let rewardsPool;
// export let dinoToken;
// export let utilityManager;
// export let dinoPool;
// export let liquidityManager;

// async function initializeContracts() {
//     const web3 = await new Web3(Web3.givenProvider);

//     const fossilTokenContract = await web3.eth.contract(fossil_token_abi);
//     fossilToken = await fossilTokenContract.at(fossil_token_address);

//     const rewardsPoolContract = await web3.eth.contract(rewards_pool_abi);
//     rewardsPool = await rewardsPoolContract.at(rewards_pool_address);

//     // const dinoTokenContract = web3.eth.contract(dino_token_abi);
//     // dinoToken = dinoTokenContract.at(dino_token_address);

//     // const utilityManagerContract = web3.eth.contract(utility_manager_abi);
//     // utilityManager = utilityManagerContract.at(utility_manager_address);

//     // const dinoPoolContract = web3.eth.contract(dino_pool_abi);
//     // dinoPool = dinoPoolContract.at(dino_pool_address);

//     // const liquidityManagerContract = web3.eth.contract(liquidity_mining_manager_abi);
//     // liquidityManager = liquidityManagerContract.at(liquidity_mining_manager_address);
// }

// initializeContracts();
