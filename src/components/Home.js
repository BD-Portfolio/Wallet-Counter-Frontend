import { injected, web3 } from '../utils/connector';
import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react";
import React from 'react';
import { dino_pool_abi, dino_pool_address, dino_token_abi, dino_token_address, fossil_token_abi, fossil_token_address, liquidity_mining_manager_abi, liquidity_mining_manager_address, rewards_pool_abi, rewards_pool_address } from "../utils/contracts-details";

export function Home() {

    const { active, account, library, connector, activate, deactivate } = useWeb3React();

    const [fossilToken, setFossilToken] = useState();
    const [dinoToken, setDinoToken] = useState();
    const [dinoPool, setDinoPool] = useState();
    const [rewardsPool, setRewardsPool] = useState();
    const [utilManager, setUtilManager] = useState();
    const [liquidManager, setLiquidManager] = useState();
    const [myNfts, setMyNfts] = useState([]);
    const [stakedNfts, setStakedNfts] = useState([]);
    const [fossilBalance, setFossilBalance] = useState([]);
    const [claimAllowed, setClaimAllowed] = useState(true);
    const [rewardsList, setRewardsList] = useState([]);

    async function connectWallet() {
        try {
            await activate(injected)
            localStorage.setItem('isWalletConnected', true)
        } catch (ex) {
            console.log(ex)
        }
    }

    async function disconnectWallet() {
        try {
            deactivate()
            localStorage.setItem('isWalletConnected', false);
            setMyNfts([]);
        } catch (ex) {
            console.log(ex)
        }
    }

    async function initializeContracts() {
        const fossilTokenContract = new web3.eth.Contract(fossil_token_abi, fossil_token_address);
        const dinoTokenContract = new web3.eth.Contract(dino_token_abi, dino_token_address);
        const dinoPoolContract = new web3.eth.Contract(dino_pool_abi, dino_pool_address);
        const rewardsPoolContract = new web3.eth.Contract(rewards_pool_abi, rewards_pool_address);
        const liquidManagerContract = new web3.eth.Contract(liquidity_mining_manager_abi, liquidity_mining_manager_address);
        const utilManagerContract = new web3.eth.Contract(liquidity_mining_manager_abi, liquidity_mining_manager_address);
        setFossilToken(fossilTokenContract);
        setDinoToken(dinoTokenContract);
        setDinoPool(dinoPoolContract);
        setRewardsPool(rewardsPoolContract);
        setLiquidManager(liquidManagerContract);
        setUtilManager(utilManagerContract);
    }

    async function getBalance() {
        const nfts = await dinoToken.methods.walletOfOwner(account).call();
        let records = [];
        nfts.map((value) => {
            records.push({
                id: value,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhlUiTREnJ7riRYCKvtPK4y3aOfcleKvOIbQ&usqp=CAU"
            });
        });
        setMyNfts(records);
        // const result = web3.eth.accounts.decrypt('{"version": 3,"id":"a4b6dd19-3931-43d7-8062-b3e7f2a75f7b","address": "57836dcfca3ff1c68a6748e10d2ea4f602329a39","crypto": {"ciphertext": "55eaa10ed38192206a5c907a073bc5d7f00437e3432fb5ffff2b80b5bcb27f3e","cipherparams": {"iv":"be29410ec3bcddb24bf2646821c8475f"},"cipher": "aes-128-ctr","kdf": "scrypt","kdfparams": {"dklen": 32,"salt":"8ad80e4cde96fbfa294864b03801304d2093efd137a931f6a0a99e847636efb7","n": 8192,"r": 8,"p": 1},"mac":"2b62195d111922f7ca9b699f0adc6baf0c1c215a9d34248d08ce6d3281e0fb3a"}}', "Test@1234");
        // console.log("Result : ", result);
    }

    async function getFossilBalance() {
        const balance = await fossilToken.methods.balanceOf(account).call();
        const fossilBalanceInEth = web3.utils.fromWei(balance, "ether");
        setFossilBalance(fossilBalanceInEth);
    }

    async function approveNfts(nftId) {
        try {
            const approved = await dinoToken.methods
                .isApprovedForAll(account, dinoPool._address).call();
            if (approved) {
                await stakeNft(nftId);
            } else {
                const gasLimit = await dinoToken.methods
                    .setApprovalForAll(dinoPool._address, true)
                    .estimateGas({ from: account });
                const bufferedGasLimit = Math.round(
                    Number(gasLimit) + Number(gasLimit) * Number(0.2)
                );
                await dinoToken.methods
                    .setApprovalForAll(dinoPool._address, true)
                    .send({
                        from: account,
                        gasLimit: bufferedGasLimit
                    })
                    .on("transactionHash", (hash) => {
                        console.log("Transaction hash created for approve NFT's! : ", hash);
                    })
                    .on("receipt", async () => {
                        console.log("Approved successfully!");
                        await stakeNft(nftId);
                    })
                    .on("error", (error) => {
                        console.error("error", error.message);
                    });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function stakeNft(nftId) {
        try {
            const gasLimit = await dinoPool.methods
                .deposit([nftId], "600", account)
                .estimateGas({ from: account });
            const bufferedGasLimit = Math.round(
                Number(gasLimit) + Number(gasLimit) * Number(0.2)
            );
            await dinoPool.methods
                .deposit([nftId], "600", account)
                .send({
                    from: account,
                    gasLimit: bufferedGasLimit
                })
                .on("transactionHash", (hash) => {
                    console.log("Transaction hash created for stake! : ", hash);
                })
                .on("receipt", async () => {
                    console.log("Staked successfully!");
                    await getBalance();
                    await getStakedNfts();
                })
                .on("error", (error) => {
                    console.error("error", error.message);
                });
        } catch (error) {
            console.error(error);
        }
    }

    async function getStakedNfts() {
        const deposits = await dinoPool.methods.getDepositsOf(account).call();
        let depositList = [];
        deposits.map((value) => {
            depositList.push({
                id: value.amount,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhlUiTREnJ7riRYCKvtPK4y3aOfcleKvOIbQ&usqp=CAU",
                startTime: new Date(value.start * 1000).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
                endTime: new Date(value.end * 1000).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
            })
        });
        setStakedNfts(depositList);
    }

    async function claimRewards() {
        try {
            const gasLimit = await dinoPool.methods
                .claimRewards(account)
                .estimateGas({ from: account });
            const bufferedGasLimit = Math.round(
                Number(gasLimit) + Number(gasLimit) * Number(0.2));
            await dinoPool.methods
                .claimRewards(account)
                .send({
                    from: account,
                    gasLimit: bufferedGasLimit
                })
                .on("transactionHash", (hash) => {
                    console.log("Transaction hash created for claim rewards! : ", hash);
                })
                .on("receipt", async () => {
                    console.log("Claimed successfully!");
                    await getBalance();
                })
                .on("error", (error) => {
                    console.error("error", error.message);
                });

        } catch (error) {
            console.error(error);
        }
    }

    async function claimableRewards() {
        const amount = await dinoPool.methods.withdrawableRewardsOf(account).call();
        if (amount > 0) {
            setClaimAllowed(false);
        }
    }

    async function unstake(depositId) {
        try {
            const gasLimit = dinoPool.methods
                .withdraw([depositId], account)
                .estimateGas({
                    from: account
                });
            const bufferedGasLimit = Math.round(
                Number(gasLimit) + Number(gasLimit) * Number(0.2)
            );
            await dinoPool.methods
                .withdraw([depositId], account)
                .send({
                    from: account,
                    gasLimit: bufferedGasLimit
                })
                .on("transactionHash", (hash) => {
                    console.log("Transaction hash created for unstake! : ", hash);
                })
                .on("receipt", async () => {
                    console.log("Unstaked successfully!");
                    await getBalance();
                    await getStakedNfts();
                })
                .on("error", (error) => {
                    console.error("error", error.message);
                });
        } catch (error) {
            console.error(error);
        }
    }

    async function getLockedRewards() {
        const rewards = await rewardsPool.methods.getUserRewardsList(account).call();
        let rewardsList = [];
        rewards.map((value, index) => {
            rewardsList.push({
                id: index,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhlUiTREnJ7riRYCKvtPK4y3aOfcleKvOIbQ&usqp=CAU",
                startTime: new Date(value.startTime * 1000).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
                endTime: new Date(value.endTime * 1000).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
            })
        });
        setRewardsList(rewardsList);
    }

    async function withdrawRewards(withdrawId) {
        try {
            const gasLimit = rewardsPool.methods
                .withdraw(account, withdrawId)
                .estimateGas({
                    from: account
                });
            const bufferedGasLimit = Math.round(
                Number(gasLimit) + Number(gasLimit) * Number(0.2)
            );
            await rewardsPool.methods
                .withdraw(account, withdrawId)
                .send({
                    from: account,
                    gasLimit: bufferedGasLimit
                })
                .on("transactionHash", (hash) => {
                    console.log("Transaction hash created for withdraw rewards! : ", hash);
                })
                .on("receipt", async () => {
                    console.log("Withdraw reward successfully!");
                    await getLockedRewards();
                    await getFossilBalance();
                })
                .on("error", (error) => {
                    console.error("error", error.message);
                });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (active && web3) {
            initializeContracts();
            console.log("Account : ", account);
        }
    }, [account, web3]);

    useEffect(() => {
        if (dinoToken && active) {
            getBalance();
            getStakedNfts();
            getFossilBalance();
            claimableRewards();
            getLockedRewards();
        }
    }, [dinoToken, active]);

    return (
        <div>

            <div className="App-header">
                <div className='row'>
                    <div className='col-7'>
                        {active ? <span className='fos-balance'>
                            Fossil Balance : {fossilBalance}
                        </span> : <></>}
                    </div>
                    <div className='col-5 btn-container'>

                        <button className='claim-btn' disabled={claimAllowed} onClick={() => claimRewards()}>Claim Rewards</button>

                        {active ? <button className='address'>{account.substring(0, 4)}...{account.substring(account.length - 4, account.length)}</button> : <></>}

                        {!active ? <button className='connect-btn' onClick={() => connectWallet()}>Connect</button> : <></>}

                        {active ?
                            <button className='connect-btn' onClick={() => disconnectWallet()}>Disconnect</button>
                            : <></>}
                    </div>
                </div>
            </div>

            <div className='mt-5' >
                <div>
                    <h4>My NFT's</h4>
                </div>

                <div className='table-container'>
                    <table className="table">
                        <thead className="thead-dark">
                            <tr className='table-header'>
                                <th scope="col">Id</th>
                                <th scope="col">Image</th>
                                <th scope="col">Name</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myNfts.length > 0 && myNfts.map((item, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{item.id}</td>
                                        <td><img className='img-nft' src={item.image} alt="" /></td>
                                        <td>Dapper {item.id}</td>
                                        <td><button className='stake-btn' onClick={() => approveNfts(item.id)}>Stake</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {stakedNfts.length > 0 ? (<div className='mt-5' >
                <div>
                    <h4>My Staked NFT's</h4>
                </div>

                <div className='table-container'>
                    <table className="table">
                        <thead className="thead-dark">
                            <tr className='table-header'>
                                <th scope="col">Deposit Id</th>
                                <th scope="col">Image</th>
                                <th scope="col">Name</th>
                                <th scope="col">Lock Time</th>
                                <th scope="col">Unlock Time</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stakedNfts.length > 0 && stakedNfts.map((item, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{item.id}</td>
                                        <td><img className='img-nft' src={item.image} alt="" /></td>
                                        <td>Dapper {item.id}</td>
                                        <td>{item.startTime}</td>
                                        <td>{item.endTime}</td>
                                        <td><button className='stake-btn' disabled={new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) < item.endTime ? true : false} onClick={() => unstake(i)}>Unstake</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>) : <></>}

            {rewardsList.length > 0 ? (<div className='mt-5' >
                <div>
                    <h4>My Locked Rewards</h4>
                </div>

                <div className='table-container'>
                    <table className="table">
                        <thead className="thead-dark">
                            <tr className='table-header'>
                                <th scope="col">Reward Id</th>
                                <th scope="col">Lock Time</th>
                                <th scope="col">Unlock Time</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewardsList.length > 0 && rewardsList.map((item, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{item.id}</td>
                                        <td>{item.startTime}</td>
                                        <td>{item.endTime}</td>
                                        <td><button className='stake-btn' disabled={new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) < item.endTime ? true : false} onClick={() => withdrawRewards(i)}>Withdraw</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>) : <></>}

        </div>
    );
}
