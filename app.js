const express = require('express');
const { InfluxDB } = require('@influxdata/influxdb-client');
const app = express();
const port = '8088';

const token = 'ZD2gXaSb-RlaCZf63ho98cYJvoo9By2XMQXK4xw29aSKni89HUt0H4_VnGgpti7kHpbJxGYuQ8nb2lJiheTVpA==';
const org = 'Soil Sensor Project';
const influxurl = "http://localhost:8086/";
const client = new InfluxDB({ url: influxurl, token }); // Create InfluxDB client
const queryApi = client.getQueryApi(org);


app.use(express.static('public'));
app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`Listening on ${app.get('port')}.`);
});

app.get('/', (req, res) => {
    let csv = [];
    const query = 
    `from(bucket: "Sensor_Info")
    |> range(start: 2024-01-01T00:00:00Z)
    |> filter(fn: (r) => r["_measurement"] == "Sensors")
    |> filter(fn: (r) => r["_field"] == "Adjwatermark1" or r["_field"] == "Temperature1")
    |> pivot(
        rowKey: ["_time", "name"],  
        columnKey: ["_field"],  
        valueColumn: "_value" )
    |> keep(columns: ["_time", "name", "Adjwatermark1", "Temperature1"])  // Keep relevant columns
    |> yield(name: "mean")`;


    
    /*`
    from(bucket: "Sensor_Info")
    |> range(start: 2024-01-01T00:00:00Z)
    |> filter(fn: (r) => r["_measurement"] == "Sensors")
    |> filter(fn: (r) => r["_field"] == "Adjwatermark1" or r["_field"] == "Temperature1")
    |> filter(fn: (r) => r["name"]`;*/

    queryApi.queryRows(query, {
        next(row, tableMeta) {
            const obj = tableMeta.toObject(row);
            csv.push(obj);
            console.log(`${obj._time} ${obj._measurement}: ${obj._field}=${obj._value}`);
        },
        error(error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        },
        complete() {
            res.json(csv); // Send the CSV data to the client-side
        },
    });
});
