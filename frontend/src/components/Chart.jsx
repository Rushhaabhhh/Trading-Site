import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartComponent = () => {
  const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [selectedStock, setSelectedStock] = useState('IBM'); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); // To handle errors

  const fetchStockData = async (stockSymbol) => {
    setLoading(true);
    setError(null); // Reset error on every fetch
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (data["Time Series (Daily)"]) {
        const timeSeries = data["Time Series (Daily)"];
        const labels = Object.keys(timeSeries).reverse(); // Dates
        const prices = labels.map(date => timeSeries[date]["4. close"]); // Closing prices

        setChartData({
          labels: labels,
          datasets: [
            {
              label: `${stockSymbol} Stock Price`,
              data: prices,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            }
          ]
        });
      } else if (data["Error Message"]) {
        setError("Invalid stock symbol or API error.");
      } else {
        setError("No data available for this stock.");
      }
    } catch (error) {
      setError("Fetch error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch stock data on component mount and when selected stock changes
  useEffect(() => {
    fetchStockData(selectedStock);
  }, [selectedStock]);

  // Handler for stock selection change
  const handleStockChange = (event) => {
    setSelectedStock(event.target.value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Select Stock : </h2>
      <select
        value={selectedStock}
        onChange={handleStockChange}
        className="mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="NIFTY50">NIFTY50</option>
        <option value="IBM">IBM</option>
        <option value="AAPL">Apple</option>
        <option value="GOOGL">Google</option>
        <option value="MSFT">Microsoft</option>
        <option value="AMZN">Amazon</option>
        <option value="TSLA">Tesla</option>
        <option value="NVDA">NVIDIA</option>
        <option value="AMD">AMD</option>
        <option value="FB">Facebook</option>
      </select>
      
      {loading ? (
        <p className="text-center text-blue-600">Loading data...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                },
              },
            }}
            height={400}
          />
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
