const fetchData = async () => {
  let traceData;

  const plotly = (data) => {
    const layout = {
      title: 'Soil Temperature and Watermark',
    };
    return Plotly.newPlot('graphs-container', [data], layout);
  };

  const getData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      // Combine filtering and data preparation
      const filteredData = data.filter(row => row._field === 'Temperature1' || row._field === 'Adjwatermark1')
        .map(row => ({
          _time: row._time,
          y: row._value,
        }));

      return {
        type: 'scatter',
        mode: 'lines',
        name: 'Temperature and Adjwatermark',
        x: filteredData.map(row => row._time),
        y: filteredData.map(row => row.y), // Assuming all filtered data has a value
        line: { color: '#17BECF' },
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      // Consider displaying a user-friendly error message here
    }
  };

  try {
    traceData = await getData('/api/sensor_data');
    plotly(traceData);
  } catch (error) {
    console.error('Error creating plot:', error);
    // Consider displaying a user-friendly error message here
  }
};