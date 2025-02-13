"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [data, setData] = useState([]);
  const [showBotView, setShowBotView] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sensorData, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(sensorData);
      }
    };

    fetchData();

    const channel = supabase
      .channel("realtime:sensor_data")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          setData((prevData) => [payload.new, ...prevData]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const BotView = ({ data }) => {
    const latestData = data[0] || {};
    
    return (
      <div className="relative w-96 h-96 bg-gray-800 rounded-full flex items-center justify-center 
        shadow-xl border-4 border-green-400 animate-pulse-slow">
        <div className="absolute top-4 left-4 bg-gray-900 p-4 rounded-lg">
          <div className="text-green-400 font-bold">Sensor 1</div>
          <div className="text-2xl">{latestData.val1 || "-"}</div>
        </div>
        
        <div className="absolute top-4 right-4 bg-gray-900 p-4 rounded-lg">
          <div className="text-green-400 font-bold">Sensor 2</div>
          <div className="text-2xl">{latestData.val2 || "-"}</div>
        </div>
        
        <div className="absolute bottom-4 left-4 bg-gray-900 p-4 rounded-lg">
          <div className="text-green-400 font-bold">Sensor 3</div>
          <div className="text-2xl">{latestData.val3 || "-"}</div>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-gray-900 p-4 rounded-lg">
          <div className="text-green-400 font-bold">Sensor 4</div>
          <div className="text-2xl">{latestData.val4 || "-"}</div>
        </div>

        <div className="text-gray-400 text-center">
          <div className="text-xl">Raspberry Pi</div>
          <div className="text-sm">Last update:</div>
          <div className="text-xs">
            {latestData.created_at ? 
              new Date(latestData.created_at).toLocaleTimeString() : 
              "No data"}
          </div>
        </div>
      </div>
    );
  };

  const SensorTable = () => (
    <div className="w-full max-w-2xl bg-gray-800 shadow-lg rounded-lg p-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-700 text-gray-300 uppercase text-sm">
            <th className="p-3 text-left border-b border-gray-600">📌 ID</th>
            <th className="p-3 text-left border-b border-gray-600">📊 Sensor 1</th>
            <th className="p-3 text-left border-b border-gray-600">📊 Sensor 2</th>
            <th className="p-3 text-left border-b border-gray-600">📊 Sensor 3</th>
            <th className="p-3 text-left border-b border-gray-600">📊 Sensor 4</th>
            <th className="p-3 text-left border-b border-gray-600">📅 Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={`border-b border-gray-700 ${
                index % 2 === 0 ? "bg-gray-750" : "bg-gray-800"
              }`}
            >
              <td className="p-3">{item.id}</td>
              <td className="p-3 text-green-400 font-semibold">{item.val1}</td>
              <td className="p-3 text-green-400 font-semibold">{item.val2}</td>
              <td className="p-3 text-green-400 font-semibold">{item.val3}</td>
              <td className="p-3 text-green-400 font-semibold">{item.val4}</td>
              <td className="p-3 text-gray-400 text-sm">
                {new Date(item.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-6 font-mono">
      <h1 className="text-4xl font-bold mb-6 text-gray-300 tracking-wide">
        Raspberry Pi Data
      </h1>

      <button
        onClick={() => setShowBotView(!showBotView)}
        className="mb-6 px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold
                 transition-colors duration-200"
      >
        {showBotView ? "Show Table View" : "Show Bot View"}
      </button>

      {showBotView ? (
        <BotView data={data} />
      ) : (
        <SensorTable />
      )}

      <div className="mt-6 text-gray-500 text-sm">
        {data.length} records found - Updated in real-time
      </div>
    </div>
  );
}