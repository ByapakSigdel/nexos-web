"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(data);
      }
    };

    fetchData();

    // Real-time subscription
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-6 font-mono">
      <h1 className="text-4xl font-bold mb-6 text-gray-300 tracking-wide">
        Raspberry Pi Data
      </h1>

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
            {data.length > 0 ? (
              data.map((item, index) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-3 text-center text-gray-500">
                  No data available...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
