import { injected, web3 } from '../utils/connector';
import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react";
import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import LoadingSpinner from "./Loader";
import { wallet_counter_contract_abi, wallet_counter_contract_address } from "../utils/contracts-details";

export function Home() {

    const { active, account, library, connector, activate, deactivate } = useWeb3React();

    const [walletCounter, setWalletCounter] = useState();
    const [totalValue, setTotalValue] = useState("0");
    const [noOfWallets, setNoOfWallets] = useState("0");
    const [inputValue, setInputValue] = useState("");
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [transactionUrl, setTransactionUrl] = useState(null);
    const [transactionHash, setTransactionHash] = useState("");

    const handleShow = () => setShow(true);

    const handleClose = () => {
        setShow(false);
        setTransactionHash("");
        setTransactionUrl(null);
    };

    async function connectWallet() {
        try {
            await activate(injected);
            if (window.ethereum.networkVersion !== "80001") {
                handleShow();
                setErrorMessage("Please connect to Mumbai matic network in your metamask!");
            } else {
                localStorage.setItem('isWalletConnected', true);
            }
        } catch (ex) {
            console.log("err", ex);
        }
    }

    async function disconnectWallet() {
        try {
            deactivate()
            localStorage.setItem('isWalletConnected', false);
            setTotalValue(0);
            setNoOfWallets(0);
        } catch (ex) {
            console.log(ex);
        }
    }

    async function initializeContracts() {
        const walletCounterContract = new web3.eth.Contract(wallet_counter_contract_abi, wallet_counter_contract_address);
        setWalletCounter(walletCounterContract);
    }

    async function getTotalValueAndNoOfWallets() {
        const result = await walletCounter.methods.getTotalValueAndWalletCounts().call();
        const valueInEther = web3.utils.fromWei(result[0], "mwei");
        setTotalValue(valueInEther);
        setNoOfWallets(result[1]);
    }

    function handleChange(event) {
        const re = new RegExp(/^[-]?\d+\.?\d{0,6}$/);
        if (event.target.value === "" || re.test(event.target.value)) {
            setInputValue(event.target.value);
        }
    }

    async function addNumber() {
        setErrorMessage("Transaction in progress!");
        handleShow();
        if (!active) {
            setErrorMessage("Please connect to Mumbai matic network in your metamask!");
            return;
        } else if (!parseFloat(inputValue)) {
            setErrorMessage("Please enter valid number!");
            return;
        }
        try {
            let transHash;
            setLoader(true);
            const valueInWei = web3.utils.toWei(inputValue, "mwei");

            const gasLimit = await walletCounter.methods
                .enterNumber(valueInWei)
                .estimateGas({ from: account });

            const bufferedGasLimit = Math.round(
                Number(gasLimit) + Number(gasLimit) * Number(0.2)
            );

            await walletCounter.methods
                .enterNumber(valueInWei)
                .send({
                    from: account,
                    gasLimit: bufferedGasLimit
                })
                .on("transactionHash", (hash) => {
                    transHash = hash;
                    setTransactionHash(hash);
                    setErrorMessage("Transaction hash generated : " + hash);
                })
                .on("receipt", async () => {
                    setTransactionUrl("https://mumbai.polygonscan.com/tx/" + transHash);
                    setErrorMessage("Transaction successful!");
                    setInputValue("");
                    await getTotalValueAndNoOfWallets();
                    setLoader(false);
                })
                .on("error", (error) => {
                    setErrorMessage(error.message);
                    setLoader(false);
                });

        } catch (error) {
            setErrorMessage(error.message);
            setLoader(false);
        }
    }

    useEffect(() => {
        if (active && web3) {
            initializeContracts();
        } else {
            setTotalValue(0);
            setNoOfWallets(0);
        }
    }, [account, web3]);

    useEffect(() => {
        if (walletCounter && active) {
            getTotalValueAndNoOfWallets();
        }
    }, [walletCounter, active]);

    return (
        <div>

            <div className="App-header">
                <div className='row'>
                    <div className='col-7'>
                        {active ? <span className='nav-welcome-msg'>
                            Welcome to Wallet Counter App
                        </span> : <></>}
                    </div>
                    <div className='col-5 btn-container'>

                        {active ? <button className='address'>{account.substring(0, 10)}...{account.substring(account.length - 10, account.length)}</button> : <></>}

                        {!active ? <button className='connect-btn' onClick={() => connectWallet()}>Connect</button> : <></>}

                        {active ?
                            <button className='connect-btn' onClick={() => disconnectWallet()}>Disconnect</button>
                            : <></>}
                    </div>
                </div>
            </div>

            <div className='mt-3 mb-5' >

                <div class="container" id="container">
                    <div class="form-container sign-in-container">
                        <form action=''>
                            <h3>Enter value</h3>
                            <input type="number" value={inputValue} placeholder="12" onChange={handleChange} />
                            <br />
                            <button type='button'
                                onClick={() => addNumber()} >
                                Submit
                            </button>
                        </form>
                    </div>
                    <div class="overlay-container">
                        <div class="overlay">
                            <div class="overlay-panel overlay-right">
                                <h3>Total No. of Wallets</h3>
                                <button class="ghost" id="signUp">{noOfWallets}</button>
                                <br />
                                <h3>Total Value</h3>
                                <button class="ghost" id="signUp">{totalValue}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                {loader ? (<LoadingSpinner />) : (<></>)}
                <Modal.Body>
                    {errorMessage}
                    {transactionUrl ? <a href={transactionUrl} target='_blank' rel='noopener noreferrer'> https://mumbai.polygonscan.com/tx/{transactionHash} </a> : <></>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}
