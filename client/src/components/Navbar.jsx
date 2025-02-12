import { faGear, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
function Navbar() {

	const { t } = useTranslation();
	const [mobileMenu, setMobileMenu] = useState(false);


	const handleWrapperClick = (event) => {
		// If the click is on the wrapper (not inside menu), close it
		if (event.target === event.currentTarget) {
			setMobileMenu(false);
		}
	};


	return (
		<>


			<div className="flex gap-10 p-5 bg-raisin-black justify-around items-center">
				<div>
					<img src="/Logo.jpg" alt="Fight Logo" className="w-[70px] h-auto " />
				</div>

				<div
					className="text-white relative "
					ed
				>

					<div className="flex flex-col justify-center items-center m-auto">
						<FontAwesomeIcon
							icon={faList}
							size="2x"
							className="cursor-pointer md:hidden"
							onClick={() => {
								setMobileMenu(!mobileMenu);
							}}
						/>
						{mobileMenu && (
							<>
								<div className={`test fixed inset-0  bg-transparent  ${mobileMenu ? 'z-20' : 'z-0'}  `} onClick={handleWrapperClick}
								>	</div>
								<div className="absolute top-10 bg-black rounded-lg p-4 z-30"
									onClick={(e) => e.stopPropagation()}
								>
									<ul className="  flex flex-col transition-[hover] text-xs lg:gap-20 md:text-[1.1rem]  text-center">
										<Link
											className="text-white  hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
											to='/'
											onClick={() => setMobileMenu(false)}
										>
											{t("navbar.dashboard")}
										</Link>

										<Link
											to='/trainers'
											onClick={() => setMobileMenu(false)}
											className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
										>
											{t("navbar.trainers")}
										</Link>
										<Link
											to='/trainees'
											onClick={() => setMobileMenu(false)}
											className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
										>
											{t("navbar.trainees")}
										</Link>
										<Link
											to='/allUsers'
											className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
											onClick={() => setMobileMenu(false)}
										>
											{t("navbar.all_users")}
										</Link>

										<Link
											to='/expenses'
											className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
											onClick={() => setMobileMenu(false)}
										>
											{t("navbar.expenses")}
										</Link>

									</ul>
								</div>
							</>)}

					</div>

					<ul className=" hidden md:flex  transition-[hover] text-xs lg:gap-20 md:text-[1.1rem]">
						<Link
							className=" text-white  hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
							to='/'
						>
							{t("navbar.dashboard")}
						</Link>

						<Link
							to='/trainers'
							className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
						>
							{t("navbar.trainers")}
						</Link>
						<Link
							to='/trainees'
							className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
						>
							{t("navbar.trainees")}
						</Link>
						<Link
							to='/allUsers'
							className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
						>
							{t("navbar.all_users")}
						</Link>
						<Link
							to='/expenses'
							className="text-white hover:bg-blue-600 p-3 hover:p-3  rounded-md cursor-pointer hover:duration-300"
						>
							{t("navbar.expenses")}
						</Link>

					</ul>
				</div >
				<div className='flex items-center justify-center gap-3'>

					<Link
						to='/settings'
						className="text-white hover:bg-red-600 p-1 hover:p-1  rounded-md cursor-pointer hover:duration-300"
						onClick={() => setMobileMenu(false)}
					>
						<FontAwesomeIcon icon={faGear} size='2x' />
					</Link>
					<span><LanguageSwitcher /></span>
				</div>
			</div>
			<Outlet />
		</>
	);
}

export default Navbar;
