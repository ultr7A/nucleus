package main

import (
	"fmt"
	"log"

	"github.com/boltdb/bolt"
	"github.com/labstack/echo"
	"github.com/spf13/viper"
)

var db *bolt.DB

func main() {
	var dbErr error
	viper.SetConfigName("nucleus")
	viper.AddConfigPath("$HOME/.nucleus")
	viper.AddConfigPath(".")
	err := viper.ReadInConfig()
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}
	port := fmt.Sprintf(":%d", viper.GetInt("port"))
	db, dbErr = bolt.Open("app.db", 0644, nil)
	if dbErr != nil {
		log.Fatal(dbErr)
	}
	defer db.Close()
	e := echo.New()

	api := e.Group("/api")
	api.GET("/read/:bucket/:key", HandleRead)
	api.POST("/write/:bucket/:key", HandleWrite)
	e.Static("/", "./app")
	e.Logger.Fatal(e.Start(port))
}
