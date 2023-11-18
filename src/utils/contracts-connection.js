import Web3 from 'web3';
import { wallet_counter_contract_address, wallet_counter_contract_abi } from './contracts-details';

export let walletCounter;

async function initializeContracts() {

    const web3 = new Web3(Web3.givenProvider);
    const walletCounterContract = await web3.eth.contract(wallet_counter_contract_abi);
    walletCounter = await walletCounterContract.at(wallet_counter_contract_address);

}

initializeContracts();
