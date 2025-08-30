import { useEffect, useState } from "react"
import Header from "./Header"
import axios from "axios"
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

const Leaderboard = () => {
  const isDarkMode = useTimeBasedTheme();
  const [tokensLBData, setTokensLBData] = useState(null)
  const [activityLBData, setActivityLBData] = useState(null)
  const [airQualityLBData, setAirQualityLBData] = useState(null)
  const [CleanAirLBData, setCleanAirLBData] = useState(null)

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tokens Leaderboard Data
        const LEADERS = await axios.get('https://pay-the-piper-production.up.railway.app/leaders', { headers });
        setTokensLBData(Object.entries(LEADERS?.data))

        // Activity Leaderboard Data
        const COLLECTIONS = await axios.get('/api/select', { headers });
        const collections = COLLECTIONS?.data?.data?.collections;
        const sortedActivityArray = collections
          .map((collection) => ({
            collectionName: collection?.collection_name,
            activity: collection?.collection_data?.documents?.length || 0,
            latestDocument: collection?.collection_data?.latest_document
          }))
          .sort((a, b) => b.activity - a.activity);
        setActivityLBData(sortedActivityArray);

      } catch (err) {
        console.error('Error fetching sensor data:', err.response || err);
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      // Cleanest City Leaderboard
      const getAQIData = await Promise.all(
        activityLBData?.map(data => axios.get(`/api/select?document_id=${data?.latestDocument}`, { headers }))
      )
      const sortedAQIData = getAQIData?.map(data => data?.data?.data)?.sort((a, b) => a?.aqi - b?.aqi)
      setAirQualityLBData(sortedAQIData)
    }
    activityLBData?.length && fetchData()
  }, [activityLBData])

  useEffect(() => {
    const fetchData = async () => {
      // FInd the region with lat and lng
      const updatedData = await Promise.all(
        airQualityLBData?.map(async data => {
          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${data?.gps_lat}&lon=${data?.gps_lng}&format=json`)
            return {
              ...data,
              location: response?.data?.address?.state_district, // Add the display name from the API response
            };
          } catch (error) {
            console.error('Error fetching location data:', error);
            return {
              ...data,
              location: 'Location not found', // Handle error case
            };
          }
        })
      )
      setCleanAirLBData(updatedData)
    }
    airQualityLBData?.length && fetchData()
  }, [airQualityLBData])

  return (
    <div className="pt-[60px]">
      <Header />
      <div className="mx-auto py-2 px-4 lg:px-24 sm:block lg:flex flex-wrap justify-between">
        {
          tokensLBData?.length > 0 && (
            <div className="mt-6 w-full lg:w-[45%] border border-gray-300 rounded-lg p-4">
              <h1 className={`border-b border-gray-300 pb-3 mb-4 font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : ''}`}>Rewards Leaderboard</h1>
              <div className="overflow-x-auto">
                <table className="min-w-full w-[800px] md:w-auto table-auto bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-6 py-3 text-left w-[10%]">Rank</th>
                      <th className="px-6 py-3 text-left w-[65%]">Address</th>
                      <th className="px-6 py-3 text-left w-[25%]">$AQI Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      tokensLBData?.map(([address, tokens], index) => {
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{address}</td>
                            <td className="px-6 py-4">{(tokens / 1e18).toFixed(3)}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {
          activityLBData?.length > 0 && (
            <div className="mt-6 w-full lg:w-[45%] border border-gray-300 rounded-lg p-4">
              <h1 className={`border-b border-gray-300 pb-3 mb-4 font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : ''}`}>Activity Leaderboard</h1>
              <div className="overflow-x-auto">
                <table className="min-w-full w-[800px] md:w-auto table-auto bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-6 py-3 text-left w-[15%]">Sl no.</th>
                      <th className="px-6 py-3 text-left w-[55%]">Device Name</th>
                      <th className="px-6 py-3 text-left w-[30%]">Climate Data points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      activityLBData?.map((activity, index) => {
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{activity?.collectionName}</td>
                            <td className="px-6 py-4">{activity?.activity}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {
          CleanAirLBData?.length > 0 && (
            <div className="mt-6 lg:mt-16 w-full lg:w-[45%] border border-gray-300 rounded-lg p-4">
              <h1 className={`border-b border-gray-300 pb-3 mb-4 font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : ''}`}>Clean Air Regions Leaderboard</h1>
              <div className="overflow-x-auto">
                <table className="min-w-full w-[800px] md:w-auto table-auto bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-6 py-3 text-left w-[15%]">Sl no.</th>
                      <th className="px-6 py-3 text-left w-[65%]">City</th>
                      <th className="px-6 py-3 text-left w-[20%]">Air Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      CleanAirLBData?.map((activity, index) => {
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{activity?.location}</td>
                            <td className="px-6 py-4">{activity?.aqi}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Leaderboard
