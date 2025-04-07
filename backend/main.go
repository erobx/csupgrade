package main

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"log"
	"os"

	"github.com/erobx/tradeups-backend/internal/app"
	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/erobx/tradeups-backend/pkg/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln(err)
	}

	db, err := createConnection()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	cdnUrl := os.Getenv("CDN_URL")
	storage := repository.NewStorage(db, cdnUrl)
	userService := api.NewUserService(storage)
	storeService := api.NewStoreService(storage)

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(os.Getenv("RSA_PRIVATE_KEY")))
	if err != nil {
		log.Fatalln(err)
	}

	server := app.NewServer("8080", privateKey, userService, storeService)
	server.Run()
}

func createConnection() (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	return pool, err
}

func generate() {
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Println("Error generating RSA key:", err)
		return
	}

	// Encode private key to PEM format
	privBytes := x509.MarshalPKCS1PrivateKey(priv)
	privPem := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privBytes,
	}

	// Encode to string
	privPemString := string(pem.EncodeToMemory(privPem))
	file, err := os.Create(".env")
	if err != nil {
		fmt.Println("Error creating .env file:", err)
		return
	}
	defer file.Close()

	// Write the private key string to the file
	_, err = file.WriteString("RSA_PRIVATE_KEY=" + privPemString + "\n")
	if err != nil {
		fmt.Println("Error writing to .env file:", err)
		return
	}
}
