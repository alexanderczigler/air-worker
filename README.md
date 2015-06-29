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