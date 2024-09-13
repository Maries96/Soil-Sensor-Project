$(document).ready(function() {
    $.getJSON('/', function(csvData) {
        console.log(csvData);  // Check if the correct data is being received
        const plotData = generatePlotData(csvData);
        Plotly.newPlot('soil-sensor-visualization', plotData.data, plotData.layout);
      });      
  });
  
  function generatePlotData(csvData) {
    const traces = [];
  
    // Group data by sensor name and field (e.g., SensorA:Adjwatermark1, SensorB:Temperature1)
    const groupedData = csvData.reduce((acc, row) => {
        const key = `${row.name}:${row._field}`;  // Grouping by name and field
        if (!acc[key]) {
            acc[key] = {
                x: [],
                y: [],
                name: `${row.name} (${row._field})`  // Show name and field in the plot legend
            };
        }
        acc[key].x.push(row._time);
        acc[key].y.push(row._value);
        return acc;
    }, {});
  
    // Prepare traces for each group of data (e.g., SensorA:Adjwatermark1, SensorB:Temperature1)
    for (const key in groupedData) {
        const { x, y, name } = groupedData[key];
        traces.push({
            x,
            y,
            type: 'scatter',
            mode: 'lines+markers',
            name,  // Show both sensor name and field type in the legend
        });
    }
  
    // Layout of the Plotly graph
    const layout = {
        title: 'Sensor Data Visualization',
        xaxis: {
          title: 'Time',
          automargin: true,
          type: 'date'  // If you want the x-axis to handle dates specifically
        },
        yaxis: {
          title: 'Value',
          automargin: true
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
      };
      
  
    return { data: traces, layout: layout };
  }
  