package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/segmentio/kafka-go"
)

type SalesEvent struct {
	ID        string  `json:"id"`
	Product   string  `json:"product"`
	Region    string  `json:"region"`
	Amount    float64 `json:"amount"`
	Timestamp string  `json:"timestamp"`
}

var (
	salesEvents []SalesEvent
	mu          sync.Mutex
)

func main() {
	// Start Kafka consumer in a separate goroutine
	go consumeKafka()

	// HTTP handler with CORS enabled
	http.HandleFunc("/events", eventsHandler)
	fmt.Println("Go Cloud Function listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	mu.Lock()
	defer mu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(salesEvents)
}

func consumeKafka() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "sales",
		GroupID: "go-cloud-function",
	})
	defer reader.Close()

	fmt.Println("Kafka consumer started")
	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Printf("Error reading message: %v\n", err)
			continue
		}

		var event SalesEvent
		if err := json.Unmarshal(m.Value, &event); err != nil {
			fmt.Printf("Error unmarshalling message: %v\n", err)
			continue
		}

		mu.Lock()
		salesEvents = append(salesEvents, event)
		mu.Unlock()
		fmt.Printf("Received sales event: %+v\n", event)
	}
}
