// src/components/Dashboard/Charts.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Charts: React.FC = () => {
  const { trainees } = useSelector((state: RootState) => state.trainees);
  const { expenses } = useSelector((state: RootState) => state.expenses);

  const totalRevenue = trainees.reduce(
    (sum, trainee) => sum + (trainee.paid || 0),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );
  const profit = totalRevenue - totalExpenses;

  const revenuePercentage =
    totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-6">Financial Overview</h2>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Revenue</span>
            <span className="font-semibold">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Expenses</span>
            <span className="font-semibold">${totalExpenses.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: `${totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Profit</span>
            <span className={`font-semibold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${profit.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${profit > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(Math.abs(revenuePercentage), 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Revenue</p>
          <p className="text-xl font-bold text-green-400">
            ${totalRevenue.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Expenses</p>
          <p className="text-xl font-bold text-red-400">
            ${totalExpenses.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Profit</p>
          <p
            className={`text-xl font-bold ${profit > 0 ? 'text-blue-400' : 'text-orange-400'}`}
          >
            ${profit.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Charts;
