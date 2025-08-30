import React from "react";
import { useTimeBasedTheme } from "./hooks/useTimeBasedTheme";
import Dashboard from "./components/Dashboard";
import { Routes, Route } from 'react-router-dom';
import Leaderboard from "./components/Leaderboard";

const App = () => {
	const isDarkMode = useTimeBasedTheme();

	return (
		<div
			className={`h-screen w-screen relative ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
				}`}
		>
			<Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
		</div>
	);
};

export default App;
