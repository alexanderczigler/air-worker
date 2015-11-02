# air-worker
Copies weather readings from S3 to elasticsearch

## Configuration

Create an "air.config.json" file in the src/ folder. Example:

```
{
  "aws": {
    "accessKeyId": "abc123",
    "secretAccessKey": "def456"
  },
  "s3": {
    "bucket": "weather-log-store"
  },
  "elasticsearch": {
    "host": "192.168.59.103",
    "port": "9200",
    "index": "weather"
  }
}
```

## Docker-compose // Tutum

```
elasticsearch:
  image: alexanderczigler/elasticsearch
  ports:
    - "9200:9200"
    - "9300:9300"
kibana:
  image: arcus/kibana
  links:
    - elasticsearch
  ports:
    - "80:80"
worker:
 image: tutum.co/alexanderczigler/air-worker
 links:
   - elasticsearch
```
