import {
	ArcElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';

import { t } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainee } from '../../slices/subscriptionSlice';
import SubscriptionTable from '../Trainees/SubscriptionTable';
import AddNewButtons from './AddNewButtons';
import Charts from './Charts';
import ExpiredSubscriptions from './ExpiredSubscriptions';
import Header from './Header';
import Quote from './Quote';
import StatsCards from './StatsCards';
import StatsSlider from './StatsSlider';

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	Tooltip,
	Legend
);

const Dashboard = () => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(fetchTrainee());
	}, [dispatch]);

	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [openNotifications, setOpenNotifications] = useState(false);
	const { subList } = useSelector(state => state.trainees);
	const expensesData = useSelector(state => state.expenses.items);

	const subscriptions = useMemo(
		() => subList?.filter(sub => !sub.deleteFlag) || [],
		[subList]
	);

	// Function to calculate the monthly revenue
	const getMonthlyRevenue = (subscriptions, month) => {
		const monthlyRevenue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let numMembers = 0;
		let revenue = 0;
		let needToCollect = 0;
		let numExpires = 0;
		let subfreezedCounts = 0;
		let expenses = 0;
		let notificationsArray = [];

		const currentYear = new Date().getFullYear();
		const startDate = new Date(currentYear, month, 20);
		const endDate = new Date(currentYear, month + 1, 19);

		expensesData.forEach(exp => {
			const datePay = new Date(exp.dateOfPayment);
			if (datePay >= startDate && datePay <= endDate) expenses += exp.amount;
		});

		subscriptions.forEach(sub => {
			const subStartDate = new Date(sub.subscriptionStartDate);
			const subEndDate = new Date(sub.subscriptionEndDate);

			if (subStartDate >= startDate && subStartDate <= endDate) {
				revenue += sub.paid; // Add the paid amount for that month
				needToCollect += sub.remaining;
				numMembers += 1;
			}

			if (subEndDate >= startDate && subEndDate <= endDate) {
				numExpires += 1;
			}

			if (subEndDate.getDate() === new Date().getDate()) {
				notificationsArray.push({ name: sub.name, phone: sub.phone });
			}

			if (sub.accountFreezeStatus) {
				subfreezedCounts += 1; // Correcting the increment of freezed counts
			}

			if (subStartDate >= startDate && subEndDate <= endDate) {
				monthlyRevenue[selectedMonth] += sub.paid; // Add the paid amount for the selected month
			}
		});

		const doughnutData = {
			labels: [t('Donut.label1'), t('Donut.label2')],
			datasets: [
				{
					data: [subfreezedCounts, numMembers - subfreezedCounts],
					backgroundColor: ['#154dc5', '#16C784'],
					hoverBackgroundColor: ['#154dc5', '#16C784'],
					borderWidth: 0,
					cutout: '65%',
				},
			],
		};

		const monthsArray = t('monthsArray', { returnObjects: true });

		const lineData = {
			labels: [...monthsArray],
			datasets: [
				{
					label: t('numCards.revenue'),
					data: monthlyRevenue,
					borderColor: '#10B981',
					backgroundColor: 'rgba(16, 185, 129, 0.2)',
					fill: true,
					tension: 0.4,
				},
			],
		};
		const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

		const lineOptions = {
			responsive: true,
			plugins: {
				legend: { display: false },
				tooltip: {
					rtl: isRtl, // Ensure tooltips are also shown in RTL mode
				},
			},
			scales: {
				x: {
					grid: { display: false },
					ticks: { color: '#9CA3AF' },
					reverse: isRtl,
				},
				y: {
					grid: { color: '#374151' },
					ticks: { color: '#9CA3AF' },
				},
			},
		};

		const doughnutOptions = {
			responsive: true,
			plugins: {
				legend: {
					position: 'bottom',
					labels: { color: 'white' },
				},
			},
		};

		return {
			revenue,
			needToCollect,
			numMembers,
			numExpires,
			expenses,
			notificationsArray,
			doughnutData,
			lineData,
			lineOptions,
			doughnutOptions,
		};
	};

	const {
		revenue,
		needToCollect,
		numMembers,
		numExpires,
		notificationsArray,
		doughnutData,
		lineData,
		lineOptions,
		doughnutOptions,
		expenses,
	} = useMemo(
		() => getMonthlyRevenue(subscriptions, selectedMonth),
		[subscriptions, selectedMonth]
	);

	const handleSliderChange = event =>
		setSelectedMonth(Number(event.target.value));

	return (
		<>
			<div className="bg-black text-white min-h-screen p-6 relative">
				<Header
					notificationsArray={notificationsArray}
					openNotifications={openNotifications}
					setOpenNotifications={setOpenNotifications}
				/>
				<Quote />
				<AddNewButtons />
				<StatsSlider
					selectedMonth={selectedMonth}
					handleSliderChange={handleSliderChange}
				/>
				<StatsCards
					revenue={revenue}
					numMembers={numMembers}
					needToCollect={needToCollect}
					numExpires={numExpires}
					expenses={expenses}
				/>
				<ExpiredSubscriptions subscriptions={subscriptions} />
				<Charts
					doughnutData={doughnutData}
					lineData={lineData}
					lineOptions={lineOptions}
					doughnutOptions={doughnutOptions}
				/>
			</div>
			<SubscriptionTable subscriptions={subscriptions} short={true} />
		</>
	);
};

export default Dashboard;
