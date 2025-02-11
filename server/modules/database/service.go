package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

var (
	host     = getEnv("DB_HOST")
	port     = getEnv("DB_PORT")
	user     = getEnv("POSTGRES_USER")
	password = getEnv("POSTGRES_PASSWORD")
	dbname   = getEnv("POSTGRES_DB")
)

var DB *sql.DB

func StartDb() (err error) {
	var connectionString = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", connectionString, err)
		os.Exit(1)
		return err
	}

	DB = db
	return nil
}

func GetDB() (dbConnection *sql.DB) {
	return DB
}

func getEnv(key string) string {
	return os.Getenv(key)
}
