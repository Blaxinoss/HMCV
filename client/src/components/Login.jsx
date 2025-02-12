import axios from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
	const { t } = useTranslation(); // Initialize t() for translation
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate(); // Hook for navigation

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('${API_BASE_URL}/login', {
				username,
				password,
			});
			setMessage(response.data.message);
			console.log('Login successful, redirecting...');

			// Save login status in localStorage
			localStorage.setItem('log', 'true');

			// Redirect to a protected route (e.g., dashboard)
			navigate('/dashboard'); // Redirect to the desired page
		} catch (err) {
			setMessage(err.response?.data?.message || t('login_failed'));
		}
	};

	return (
		<div
			className="flex items-center justify-center bg-gray-100
        rounded-md absolute -translate-y-[50%] top-[50%] -translate-x-[50%] left-[50%] w-[100%] p-5 z-[-1]
        h-[100vh] bg-[url('/background2.jpg')] md:bg-[url('/background.webp')] bg-cover bg-no-repeat"
		>
			<div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
				<h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">{t('login')}</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						type="text"
						placeholder={t('username')}
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
					/>
					<input
						type="password"
						placeholder={t('password')}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
					/>
					<button
						type="submit"
						className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
					>
						{t('login')}
					</button>
				</form>
				{message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
			</div>
		</div>
	);
};

export default Login;
