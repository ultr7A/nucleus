package main

import (
	"fmt"
	"io/ioutil"
	"log"

	"github.com/boltdb/bolt"
	"github.com/labstack/echo"
)

// retrieve the data
func HandleRead(c echo.Context) error {
	var val []byte
	bucket := []byte(c.Param("bucket"))
	key := []byte(c.Param("key"))
	err := db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(bucket)
		if bucket == nil {
			return c.JSON(400, fmt.Errorf("Bucket %q not found!", bucket))
		}

		val = bucket.Get(key)
		return nil
	})

	if err != nil {
		log.Fatal(err)
	}

	return c.JSON(200, string(val[:]))
}

// store some data
func HandleWrite(c echo.Context) error {
	var err error
	bucket := []byte(c.Param("bucket"))
	key := []byte(c.Param("key"))
	if c.Request().Body != nil {
		value, _ := ioutil.ReadAll(c.Request().Body)
		err = db.Update(func(tx *bolt.Tx) error {
			bucket, err := tx.CreateBucketIfNotExists(bucket)
			if err != nil {
				return err
			}

			err = bucket.Put(key, value)
			if err != nil {
				return err
			}
			return nil
		})

		if err != nil {
			log.Fatal(err)
		}
	} else {
		log.Fatal("no data to save")
	}
	return nil
}
