import React, { useEffect, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainee } from '../slices/subscriptionSlice';
import SubscriptionForm from './SubscriptionForm';
import SubscriptionTable from './SubscriptionTable';

const SubscriptionPage = () => {
	const { t } = useTranslation();

	const dispatch = useDispatch()
	useEffect(() => {
		dispatch(fetchTrainee());
	}, [dispatch]);
	const { subList } = useSelector((state) => state.trainees);

	// Memoize the filtered subscriptions to avoid unnecessary recomputations
	const subscriptions = useMemo(() => {
		return subList ? subList.filter((sub) => !sub.deleteFlag) : [];
	}, [subList]); // Recompute only if subList changes


	return (
		<div className=" p-7
	">
			<h1 className="text-2xl mb-4 text-white">{t('subscription.title')}</h1> {/* Example of translation */}

			<SubscriptionForm subscriptions={subscriptions} />
			<SubscriptionTable subscriptions={subscriptions} short={false} />
		</div>
	);
};

export default SubscriptionPage;
