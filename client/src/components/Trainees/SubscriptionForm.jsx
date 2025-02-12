import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Import watch and setValue
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { addTrainee } from "../../slices/subscriptionSlice";
import Message from "../../utils/Message";
import useMessageHook from "../../utils/useMessageHook";

const schema = yup.object().shape({
	name: yup.string().required("Name is required"),
	phone: yup
		.string()
		.matches(/^\d{11}$/, "Phone number must be 11 digits")
		.required("Phone number is required"),
	subscriptionStartDate: yup.date().required("Start Date is required"),
	subscriptionEndDate: yup.date().required("Finish Date is required")
		.test("check-start-end-same", "Start date and end date must be the same for sessions and Freeze is false", function (value) {
			const { isSession, subscriptionStartDate, accountFreezeStatus, subscriptionEndDate } = this.parent;

			if (isSession && value && subscriptionStartDate) {
				return new Date(value).getTime() === new Date(subscriptionStartDate).getTime() && accountFreezeStatus === false;
			}
			return true;  // If not a session or Freeze is true, no validation needed
		}),
	totalCost: yup
		.number()
		.typeError("Total Cost must be a number")
		.positive("Total Cost must be positive")
		.required("Total Cost is required"),
	paid: yup
		.number()
		.typeError("Paid amount must be a number")
		.positive("Paid amount must be positive")
		.required("Paid amount is required"),
	remaining: yup
		.number()
		.typeError("Remaining amount must be a number")
		.min(0, "Remaining amount cannot be negative")
		.required("Remaining amount is required"),
	discount: yup.number().optional().typeError("Discount must be a number"),
	deleteFlag: yup.boolean().default(false),
	accountFreezeStatus: yup.boolean().required("Active status is required").default(false),
	isSession: yup.boolean().default(false),
});

const SubscriptionForm = () => {
	const { t } = useTranslation(); // Initialize t() for translation
	const { error, status } = useSelector((state) => state.trainees);
	const [showForm, setShowForm] = useState(true);
	const { message, showMessage } = useMessageHook();
	const dispatch = useDispatch();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch,
		setValue,
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: { discount: 0 },
	});

	// Watch totalCost and paid fields
	const totalCost = watch("totalCost");
	const paid = watch("paid");
	const discount = watch('discount')
	const isSession = watch('isSession')

	useEffect(() => {
		const remaining = (totalCost || 0) - (paid || 0) - (discount || 0);
		setValue("remaining", Math.max(0, remaining));
	}, [totalCost, paid, discount, setValue]);

	const onSubmit = async (data) => {
		try {

			await dispatch(addTrainee(data));
			showMessage(t('TraineeAdded'))
		} catch (error) {
			showMessage(error.message)
		}
	};

	const clearFormInputs = () => {
		reset();
	};

	return (
		<>

			<button className="bg-white mb-5" onClick={() => setShowForm(!showForm)}>
				{t('SubscriptionForm.form')}
			</button>
			<Message message={message} />
			{showForm && (
				<div className="bg-gray-800 p-6 rounded-lg shadow-md w-full mx-auto text-white">
					{status === "loading" && <p>{t('SubscriptionForm.loading')}</p>}
					{error && <p className="text-red-500">{error}</p>}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<h2 className="text-xl font-bold text-green-500 mb-6">{t('SubscriptionForm.new_trainee')}</h2>

						{/* Name */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label htmlFor="name" className="block mb-2">
									{t('SubscriptionForm.name')}:
								</label>
								<input
									type="text"
									id="name"
									{...register("name")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.name && (
									<span className="text-red-500 ml-2">{errors.name.message}</span>
								)}
							</div>

							{/* Phone */}
							<div>
								<label htmlFor="phone" className="block mb-2">
									{t('SubscriptionForm.phone')}:
								</label>
								<input
									type="text"
									id="phone"
									{...register("phone")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.phone && (
									<span className="text-red-500 ml-2">{errors.phone.message}</span>
								)}
							</div>
						</div>

						{/* Start Date */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label htmlFor="subscriptionStartDate" className="block mb-2">
									{t('SubscriptionForm.start_date')}:
								</label>
								<input
									type="date"
									id="subscriptionStartDate"
									{...register("subscriptionStartDate")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.subscriptionStartDate && (
									<span className="text-red-500 ml-2">
										{errors.subscriptionStartDate.message}
									</span>
								)}
							</div>

							{/* Finish Date */}
							<div>
								<label htmlFor="subscriptionEndDate" className="block mb-2">
									{t('SubscriptionForm.finish_date')}:
								</label>
								<input
									type="date"
									id="subscriptionEndDate"
									{...register("subscriptionEndDate")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.subscriptionEndDate && (
									<span className="text-red-500 ml-2">
										{errors.subscriptionEndDate.message}
									</span>
								)}
							</div>
						</div>

						{/* Total Cost */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label htmlFor="totalCost" className="block mb-2">
									{t('SubscriptionForm.total_cost')}:
								</label>
								<input
									type="number"
									id="totalCost"
									{...register("totalCost")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.totalCost && (
									<span className="text-red-500 ml-2">{errors.totalCost.message}</span>
								)}
							</div>

							{/* Paid */}
							<div>
								<label htmlFor="paid" className="block mb-2">
									{t('SubscriptionForm.paid')}:
								</label>
								<input
									type="number"
									id="paid"
									{...register("paid")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.paid && (
									<span className="text-red-500 ml-2">{errors.paid.message}</span>
								)}
							</div>
						</div>

						{/* Remaining */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label htmlFor="remaining" className="block mb-2">
									{t('SubscriptionForm.remaining')}:
								</label>
								<input
									type="number"
									id="remaining"
									{...register("remaining")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:border-orange-400 bg-[#0684ff57]"
									readOnly // Make the field read-only
								/>
								{errors.remaining && (
									<span className="text-red-500 ml-2">{errors.remaining.message}</span>
								)}
							</div>

							{/* Discount (Optional) */}
							<div>
								<label htmlFor="discount" className="block mb-2">
									{t('SubscriptionForm.discount')}:
								</label>
								<input
									type="number"
									id="discount"
									{...register("discount")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:border-orange-400 bg-[#0684ff57]"
								/>
								{errors.discount && (
									<span className="text-red-500 ml-2">{errors.discount.message}</span>
								)}
							</div>
						</div>

						{/* Account Status */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label htmlFor="accountFreezeStatus" className="block mb-2">
									{t('SubscriptionForm.account_status')}:
								</label>
								<select
									id="accountFreezeStatus"
									{...register("accountFreezeStatus")}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:border-orange-400 bg-[#0684ff57]"
								>
									<option value={false} color="orange">{t('SubscriptionForm.ongoing')}</option>
									<option value={true} color="blue">{t('SubscriptionForm.freezed')}</option>
								</select>
								{errors.accountFreezeStatus && (
									<span className="text-red-500 ml-2">
										{errors.accountFreezeStatus.message}
									</span>
								)}
							</div>
							{/* isSession */}
							<div>
								<label htmlFor="isSession" className="block mb-2">
									{t('SubscriptionForm.isSession')}:
								</label>
								<label htmlFor="isSession" className="inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										id="isSession"
										{...register("isSession")}
										className="hidden"
									/>
									<div className={`relative w-14 h-6 ${isSession ? 'bg-green-500' : 'bg-red-500'}  rounded-full p-1 flex items-center justify-start duration-300 ease-in-out`}>
										<div
											className={`absolute left-[4px] w-4 h-4  rounded-full shadow-md transform duration-300 ease-in-out ${isSession ? "translate-x-8 bg-white" : "bg-black "
												}`}
										></div>
									</div>
								</label>
								{errors.isSession && (
									<span className="text-red-500 ml-2">
										{errors.isSession.message}
									</span>
								)}
							</div>


						</div>


						{/* Buttons */}
						<div className="flex justify-center md:justify-end gap-2">
							<button
								disabled={isSubmitting}
								type="submit"
								className={`bg-yellow-400 hover:bg-yellow-500 text-[#330d6d] font-bold py-2 px-4 rounded md:px-8 md:py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-yellow-400'} `}

							>
								{t('SubscriptionForm.save')}
							</button>
							<button
								onClick={clearFormInputs}
								type="button"
								className="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4 md:px-8 md:py-4"
							>
								{t('SubscriptionForm.clear')}
							</button>
						</div>
					</form>
				</div>
			)}
		</>
	);
};

export default SubscriptionForm;
