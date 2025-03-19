import json
import time
import uuid
import random
from kafka import KafkaProducer

# Initialize Kafka producer with JSON serializer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

products = ['Laptop', 'Smartphone', 'Headphones', 'Monitor', 'Keyboard']
regions = ['North', 'South', 'East', 'West']

def produce_event():
    event = {
        "id": str(uuid.uuid4()),
        "product": random.choice(products),
        "region": random.choice(regions),
        "amount": round(random.uniform(50, 1500), 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    producer.send('sales', event)
    print("Produced sales event:", event)

if __name__ == "__main__":
    while True:
        produce_event()
        time.sleep(3)
