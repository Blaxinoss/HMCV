import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTrainee, freezeTrainee, updateTrainee } from '../slices/subscriptionSlice';

const SubscriptionTable = ({ subscriptions, short }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(); // Access the translation function
	const [editingRowId, setEditingRowId] = useState(null);
	const [editableValues, setEditableValues] = useState({});
	const { error, status } = useSelector((state) => state.trainees);

	// Start editing a row
	const handleEditClick = (sub) => {
		setEditingRowId(sub._id); // Set the current row in edit mode
		setEditableValues(sub); // Populate the editable values
	};

	// Save changes and exit edit mode
	const handleSaveClick = () => {
		dispatch(updateTrainee({ id: editingRowId, updatedData: editableValues }));
		setEditingRowId(null); // Exit edit mode
	};

	// Cancel editing and exit edit mode
	const handleCancelClick = () => {
		setEditingRowId(null); // Exit edit mode without saving
	};

	// Update editable values on input change
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditableValues({ ...editableValues, [name]: value });
	};

	const handleFreezeTrainee = (id) => {
		dispatch(freezeTrainee(id));
	};

	const handleDelete = (id) => {
		dispatch(deleteTrainee(id));
	};

	return (
		<div className="overflow-x-auto mt-5 p-5">
			{status === 'loading' && <p>{t('loading')}</p>}
			{error && <p className="text-red-500">{error}</p>}
			<table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
				<thead className="bg-[#325bb3] text-white">
					<tr>
						{short ? (
							<>
								<th className="rtl:text-right px-4 py-2 text-left text-sm font-medium">{t('subscription.name')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.finishDate')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.phone')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.remaining')}</th>
								<th className="rtl:text-right px-4 py-2 text-center text-sm font-medium">{t('subscription.freeze')}</th>
							</>
						) : (
							<>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.name')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.finishDate')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.totalCost')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.phone')}</th>
								<th className="rtl:text-right  px-4 py-2 text-left text-sm font-medium">{t('subscription.startDate')}</th>
								<th className="rtl:text-right px-4 py-2 text-left text-sm font-medium">{t('subscription.paid')}</th>
								<th className="rtl:text-right px-4 py-2 text-left text-sm font-medium">{t('subscription.remaining')}</th>
								<th className="rtl:text-right px-4 py-2 text-left text-sm font-medium">{t('subscription.discount')}</th>
								<th className=" px-4 py-2 text-center text-sm font-medium">{t('subscription.freeze')}</th>
								<th className="px-4 py-2  text-center text-sm font-medium">{t('subscription.actions')}</th>
							</>
						)}
					</tr>
				</thead>
				<tbody className="overflow-auto">
					{subscriptions.map((sub) => (
						<tr key={sub._id} className="border-t bg-gray-800 text-white transition-colors h-16 items-center">
							{editingRowId === sub._id ? (
								<>
									{/* Editable Inputs */}
									<td className="px-4 py-2">
										<input
											type="text"
											name="name"
											value={editableValues.name || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.namePlaceholder')}
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="text"
											name="phone"
											value={editableValues.phone || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.phonePlaceholder')}
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="date"
											name="subscriptionStartDate"
											value={new Date(editableValues.subscriptionStartDate).toISOString().split("T")[0]}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="date"
											name="subscriptionEndDate"
											value={new Date(editableValues.subscriptionEndDate).toISOString().split("T")[0]}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="number"
											name="totalCost"
											value={editableValues.totalCost || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.totalCostPlaceholder')}
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="number"
											name="paid"
											value={editableValues.paid || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.paidPlaceholder')}
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="number"
											name="remaining"
											value={editableValues.remaining || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.remainingPlaceholder')}
										/>
									</td>
									<td className="px-4 py-2">
										<input
											type="number"
											name="discount"
											value={editableValues.discount || ""}
											onChange={handleInputChange}
											className="w-full border border-gray-300 rounded px-2 py-1 text-black"
											placeholder={t('subscription.discountPlaceholder')}
										/>
									</td>
									<td className="px-4 py-2 text-center"></td>
									<td className="px-4 py-2 text-center">
										<button
											onClick={handleSaveClick}
											className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
										>
											{t('subscription.save')}
										</button>
										<button
											onClick={handleCancelClick}
											className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
										>
											{t('subscription.cancel')}
										</button>
									</td>
								</>
							) : (
								<>
									{short ? (
										<>
											<td className="px-4 py-2">{sub.name}</td>
											<td className="px-4 py-2">{new Date(sub.subscriptionEndDate).toLocaleDateString()}</td>
											<td className="px-4 py-2">{sub.phone}</td>
											<td className="px-4 py-2">{sub.remaining}</td>

											{/* Freeze Button */}
											{new Date() < new Date(sub.subscriptionEndDate) && !sub.isSession ?
												(<td className="px-4 py-2 text-center rtl:text-right ">
													<button
														onClick={() => handleFreezeTrainee(sub._id)}
														className={`btn px-3 py-1 rounded text-white ${sub.accountFreezeStatus ? "bg-green-500 hover:bg-green-600" : "bg-blue-400 hover:bg-blue-400"}`}
													>
														{sub.accountFreezeStatus ? t('subscription.unfreeze') : t('subscription.freeze')}
													</button>
												</td>) : (
													<td className="px-4 py-2 text-center rtl:text-right ">

													</td>
												)}
										</>
									) : (
										<>
											<td className="px-4 py-2">{sub.name}</td>
											<td className="px-4 py-2">{new Date(sub.subscriptionEndDate).toLocaleDateString()}</td>
											<td className="px-4 py-2">{sub.totalCost}</td>
											<td className="px-4 py-2">{sub.phone}</td>
											<td className="px-4 py-2">{new Date(sub.subscriptionStartDate).toLocaleDateString()}</td>
											<td className="px-4 py-2">{sub.paid}</td>
											<td className="px-4 py-2">{sub.remaining}</td>
											<td className="px-4 py-2">{sub.discount}</td>

											{/* Freeze Button */}
											{new Date() < new Date(sub.subscriptionEndDate) && !sub.isSession ?
												(<td className="px-4 py-2 text-center rtl:text-right ">
													<button
														onClick={() => handleFreezeTrainee(sub._id)}
														className={`btn px-3 py-1 rounded text-white ${sub.accountFreezeStatus ? "bg-green-500 hover:bg-green-600" : "bg-blue-400 hover:bg-blue-400"}`}
													>
														{sub.accountFreezeStatus ? t('subscription.unfreeze') : t('subscription.freeze')}
													</button>
												</td>) : (
													<td className="px-4 py-2 text-center rtl:text-right ">

													</td>
												)}

											{/* Actions (Edit/Delete) */}
											<td className="px-4 py-2 ">
												<div className="text-center flex items-center justify-center gap-1">
													<button
														onClick={() => handleEditClick(sub)}
														className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
													>
														{t('subscription.edit')}
													</button>
													<button
														onClick={() => handleDelete(sub._id)}
														className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
													>
														{t('subscription.delete')}
													</button>
												</div>
											</td>
										</>
									)}
								</>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default SubscriptionTable;
