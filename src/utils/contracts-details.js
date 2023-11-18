export const wallet_counter_contract_address = "0x39A29a015dd54B28Ef290697BdB269d2E5110CCB";

export const wallet_counter_contract_abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "walletAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "numberEntered",
                "type": "int256"
            }
        ],
        "name": "NumberEntered",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "int256",
                "name": "_numberEntered",
                "type": "int256"
            }
        ],
        "name": "enterNumber",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalValueAndWalletCounts",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
