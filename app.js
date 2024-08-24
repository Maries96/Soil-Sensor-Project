const express = require('express')
const { InfluxDB } = require('@influxdata/influxdb-client')
const app = express()
const port = 'http://localhost:8086'
const token = 'ZD2gXaSb-RlaCZf63ho98cYJvoo9By2XMQXK4xw29aSKni89HUt0H4_VnGgpti7kHpbJxGYuQ8nb2lJiheTVpA=='
const org = 'Soil Sensor Project'
const client = new InfluxDB({ url: port, token }) // Create InfluxDB client
const queryApi = client.getQueryApi(org)


app.use(express.static('public'))
app.set('port', port);
app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}.`);
});

// Only one definition for the /api/sensor_data endpoint
app.get('/api/sensor_data', (req, res) => {
  let csv = []
  const query = 
    `from(bucket: "Sensor_Info")
    |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
    |> filter(fn: (r) => r["_measurement"] == "Sensors")
    |> filter(fn: (r) => r["_field"] == "Temperature1" or r["_field"] == "Adjwatermark1" or r["_field"] == "Date")
    |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
    |> yield(name: "mean")`

  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const obj = tableMeta.toObject(row)
      csv.push(obj)
      console.log(`${obj._time} ${obj._measurement}: ${obj._field}=${obj._value}`)
    },
    error(error) {
      console.error(error)
      res.status(500).send('Error fetching data') // Send appropriate error response
    },
    complete() {
      res.json(csv)
    },
  })
})