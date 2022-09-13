package main

import (
    "github.com/ethereum/go-ethereum/crypto"
    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    client, err := ethclient.Dial("http://localhost:8575")
    if err != nil {
        log.Fatal(err)
    }
    defer client.close()
}
