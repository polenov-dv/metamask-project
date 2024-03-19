"use client";
import { useState, useEffect } from "react";
import Web3 from "web3";
import { makeStyles } from "@mui/styles";
import {
  Button,
  Container,
  TextField,
  Typography,
  Select,
  MenuItem,
  Box,
  Grid,
} from "@mui/material";

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1d7ed",
    height: "100vh",
  },
  container: {
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "20px",
  },
}));

export default function Home() {
  const cls = useStyles();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("");
  const [bnbBalance, setBnbBalance] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("mainnet");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [walletType, setWalletType] = useState<string>("eth");
  const [disableWalletSelect, setDisableWalletSelect] =
    useState<boolean>(false);

  useEffect(() => {
    const initWeb3 = async () => {
      // @ts-ignore
      const ethereum = window.ethereum;
      if (ethereum) {
        const web3Instance = new Web3(ethereum);
        setWeb3(web3Instance);

        try {
          await ethereum.request({ method: "eth_requestAccounts" });

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const ethBalance = await web3Instance.eth.getBalance(accounts[0]);
          setEthBalance(web3Instance.utils.fromWei(ethBalance, "ether"));

          const bnbBalance = await web3Instance.eth.getBalance(accounts[0]);
          setBnbBalance(web3Instance.utils.fromWei(bnbBalance, "ether"));
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  const handleTransaction = async () => {
    if (!web3 || !recipientAddress || !transferAmount) return;

    const amountInWei = web3.utils.toWei(transferAmount, "ether");
    if (!disableWalletSelect) {
      const balanceInWei =
        walletType === "eth"
          ? web3.utils.toWei(ethBalance, "ether")
          : web3.utils.toWei(bnbBalance, "ether");

      if (parseInt(amountInWei) > parseInt(balanceInWei)) {
        console.error("Insufficient balance");
        return;
      }
    }

    try {
      const tx = await web3.eth.sendTransaction({
        from: account,
        to: recipientAddress,
        value: amountInWei,
      });
      console.log("Transaction successful:", tx);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleNetworkChange = async (value: string) => {
    setNetwork(value);
    setDisableWalletSelect(value === "testnet");

    if ("ethereum" in window) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: value === "mainnet" ? "0x1" : "0x3" }],
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <main className={cls.content}>
      <Container className={cls.container} maxWidth="md">
        <Typography variant="h2" align="center">
          Wallet
        </Typography>
        <Typography variant="h5" gutterBottom>
          Address:
          <Box
            component="span"
            display="inline"
            color="olive"
            sx={{ marginLeft: "5px", overflowWrap: "break-word" }}
          >
            {account}
          </Box>
        </Typography>
        <Typography variant="h6" gutterBottom>
          ETH Balance:
          <Box component="span" color="blue" margin={1}>
            {ethBalance}
          </Box>
          ETH
        </Typography>
        <Typography variant="h6" style={{ marginBottom: "2rem" }}>
          BNB Balance:
          <Box component="span" color="blue" margin={1}>
            {bnbBalance}
          </Box>
          BNB
        </Typography>
        <Select
          value={network}
          onChange={(event) => handleNetworkChange(event.target.value)}
          fullWidth
          variant="outlined"
          style={{ marginBottom: "1rem" }}
        >
          <MenuItem value="mainnet">Mainnet</MenuItem>
          <MenuItem value="testnet">Testnet</MenuItem>
        </Select>

        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="Amount"
              variant="outlined"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              inputProps={{
                min: "0",
                max: walletType === "eth" ? ethBalance : bnbBalance,
                step: "0.01",
              }}
              style={{ marginBottom: "1rem" }}
            />
          </Grid>

          <Grid item>
            <Select
              value={walletType}
              disabled={disableWalletSelect}
              onChange={(e) => setWalletType(e.target.value as string)}
              variant="outlined"
              style={{ marginBottom: "1rem" }}
            >
              <MenuItem value="eth">ETH</MenuItem>
              <MenuItem value="bnb">BNB</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Recipient Address"
          variant="outlined"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleTransaction}
          style={{ padding: "10px" }}
        >
          Send Transaction
        </Button>
      </Container>
    </main>
  );
}
