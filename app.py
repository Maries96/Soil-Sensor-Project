from flask import Flask, jsonify
from influxdb_client import InfluxDBClient, QueryApi
from influxdb_client.client.exceptions import InfluxDBError

app = Flask(__name__)


# Connect to InfluxDB 
client = InfluxDBClient(
    url="http://localhost:8086",
    token="ZD2gXaSb-RlaCZf63ho98cYJvoo9By2XMQXK4xw29aSKni89HUt0H4_VnGgpti7kHpbJxGYuQ8nb2lJiheTVpA==",
    org="Soil Sensor Project"
)

query_api = client.query_api()


@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        query = '''
          from(bucket: "Sensor_Info")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "Sensors")
        '''
        tables = query_api.query(query)

        results = []
        for table in tables:
            for record in table.records:
                results.append(dict(record))  # Use dict constructor for brevity

        return jsonify(results)

    except InfluxDBError as e:
        # Handle InfluxDB-specific errors
        print(f"InfluxDB Error: {str(e)}")
        return jsonify({"error": "Error querying InfluxDB", "details": str(e)}), 500

    except Exception as e:
        # Handle general errors
        print(f"Error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)