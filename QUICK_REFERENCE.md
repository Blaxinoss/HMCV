# 🚀 Quick Reference Guide - HustleMustle Frontend

## 📍 Key File Locations

### Trainees Management
```
client/src/components/Trainees/
├── TraineeList.tsx          ← Main trainee list view with filtering
├── SubscriptionForm.tsx     ← Form for create/edit trainee
├── SubscriptionPage.tsx     ← Container component
└── CheckInModal.tsx         ← Check-in attendance modal
```

### Dashboard
```
client/src/components/Dashboard/
├── Dashboard.tsx            ← Main dashboard with all metrics
├── DashboardMetrics.tsx     ← KPI display component
├── ExpiredSubscriptions.tsx ← Expired list with renewal
├── StatsCards.tsx           ← Individual stat cards
└── [other components...]
```

### Redux Slices
```
client/src/slices/
├── subscriptionSlice.js     ← Trainees state management
├── trainersSlice.js
├── expensesSlice.js
├── userSlice.js
└── authSlice.js
```

### Utilities
```
client/src/utils/
├── useMessageHook.ts        ← Success/error messages
├── ProtectedRoute.tsx       ← Route protection
├── TraineeContext.ts        ← Trainee context
├── api.ts                   ← API helpers
├── auth.ts                  ← Auth utilities
└── constants.ts             ← App constants
```

### Types & Interfaces
```
client/src/types/
└── index.ts                 ← Single source of truth for all types
```

### Internationalization
```
client/src/locales/
├── en.json                  ← English translations
└── ar.json                  ← Arabic translations
```

---

## 🔑 Key Imports

### Using Types
```typescript
import { Trainee, Expense, Trainer, User } from '../../types';
```

### Using Redux
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTrainees, addTrainee, updateTrainee } from '../../slices/subscriptionSlice';
```

### Using Hooks
```typescript
import useMessage from '../../utils/useMessageHook';
const { success, error, warning, info } = useMessage();
```

### Using Translations
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

---

## 🎯 Common Tasks

### Add a New Trainee
```typescript
const dispatch = useDispatch<AppDispatch>();

const handleAddTrainee = async (traineeData: Trainee) => {
  try {
    dispatch(addTrainee(traineeData));
    success('Trainee added successfully!');
  } catch (error) {
    error('Failed to add trainee');
  }
};
```

### Update a Trainee
```typescript
const handleUpdateTrainee = async (trainee: Trainee) => {
  try {
    dispatch(updateTrainee({
      traineeId: trainee._id,
      data: trainee
    }));
    success('Trainee updated successfully!');
  } catch (error) {
    error('Failed to update trainee');
  }
};
```

### Check-In Trainee
```typescript
const handleCheckIn = async (traineeId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/trainees/${traineeId}/check-in`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    if (response.ok) {
      success('Check-in successful!');
    }
  } catch (error) {
    error('Check-in failed');
  }
};
```

### Filter Trainees by Status
```typescript
const filteredTrainees = trainees.filter(t => {
  const isExpired = new Date(t.subscriptionEndDate) < new Date();
  const isActive = !isExpired && !t.accountFreezeStatus;
  
  if (filterStatus === 'expired') return isExpired;
  if (filterStatus === 'active') return isActive;
  return true; // All
});
```

### Get Trainee Status Badge
```typescript
const getStatusBadge = (trainee: Trainee) => {
  if (trainee.accountFreezeStatus) {
    return <span className="badge bg-yellow">Frozen</span>;
  }
  if (new Date(trainee.subscriptionEndDate) < new Date()) {
    return <span className="badge bg-red">Expired</span>;
  }
  if (trainee.remaining > 0) {
    return <span className="badge bg-orange">Debt</span>;
  }
  return <span className="badge bg-green">Active</span>;
};
```

---

## 🧮 Dashboard Calculations

### Get Active Trainees Count
```typescript
const activeTrainees = trainees.filter(t => {
  const isActive = new Date(t.subscriptionEndDate) > new Date() 
    && !t.accountFreezeStatus;
  return isActive;
}).length;
```

### Get Total Revenue
```typescript
const totalRevenue = trainees.reduce((sum, t) => sum + t.paid, 0);
```

### Get Collection Rate
```typescript
const totalCost = trainees.reduce((sum, t) => sum + t.totalCost, 0);
const collectionRate = (totalRevenue / totalCost) * 100;
```

### Get Freeze Rate
```typescript
const frozenCount = trainees.filter(t => t.accountFreezeStatus).length;
const freezeRate = (frozenCount / trainees.length) * 100;
```

### Get Days Until Expiry
```typescript
const daysLeft = Math.ceil(
  (new Date(trainee.subscriptionEndDate).getTime() - new Date().getTime())
  / (1000 * 60 * 60 * 24)
);
```

---

## 🌐 Translations

### Access Translation
```typescript
const { t } = useTranslation();

// Usage
<h1>{t('dashboard.total_trainees')}</h1>
<button>{t('trainees.renew')}</button>
<p>{t('trainees.check_in_success')}</p>
```

### Common Translation Keys
```typescript
// Dashboard
t('dashboard.total_trainees')
t('dashboard.active_trainees')
t('dashboard.expired_subscriptions')
t('dashboard.pending_payments')
t('dashboard.total_revenue')
t('dashboard.total_expenses')
t('dashboard.net_profit')

// Trainees
t('trainees.title')
t('trainees.check_in')
t('trainees.renew')
t('trainees.status')
t('trainees.active')
t('trainees.expired')
t('trainees.frozen')
t('trainees.debt')
```

---

## ⚠️ Breaking Changes from Old Code

### Field Name Changes
```typescript
// OLD - Don't use
startDate, expiryDate, fees

// NEW - Use these
subscriptionStartDate, subscriptionEndDate, totalCost
```

### Hook Changes
```typescript
// OLD - Don't use
import useMessageHook from '...';
const { showMessage } = useMessageHook();
showMessage('text', 'success');

// NEW - Use this
import useMessage from '...';
const { success, error } = useMessage();
success('text');
```

### Component Imports
```typescript
// OLD - Don't import JSX files
import Component from './Component.jsx';

// NEW - Only import TSX files
import Component from './Component';  // .tsx implied
```

---

## 🔍 Debugging Tips

### Check Redux State
```typescript
const state = useSelector((state: RootState) => state);
console.log('Full Redux state:', state);

// Specific slice
const { trainees } = useSelector((state: RootState) => state.trainees);
console.log('Trainees:', trainees);
```

### Check Trainee Data
```typescript
const trainee: Trainee = {
  _id: '123',
  name: 'John Doe',
  phone: '01234567890',
  subscriptionStartDate: new Date(),
  subscriptionEndDate: new Date(),
  totalCost: 500,
  paid: 500,
  remaining: 0,
  discount: 0,
  // ... other required fields
};

console.log('Trainee:', trainee);
```

### Test API Call
```typescript
const testCheckIn = async (traineeId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/trainees/${traineeId}/check-in`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📱 Component Structure Template

### Creating New Trainee Component
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { Trainee } from '../../types';
import useMessage from '../../utils/useMessageHook';

interface MyComponentProps {
  trainee: Trainee;
  onClose: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ trainee, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useMessage();
  const { trainees } = useSelector((state: RootState) => state.trainees);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white">{trainee.name}</h2>
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

---

## 🚀 Running the App

### Prerequisites
```bash
cd client
npm install
```

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Type Check
```bash
npx tsc --noEmit
```

---

## 📋 Trainee Model Fields Reference

```typescript
interface Trainee {
  // Identifiers
  _id: string;              // MongoDB ID
  memberId: string;         // Custom member ID

  // Personal Info
  name: string;             // Trainee name
  phone: string;            // Contact phone
  
  // Subscription Dates
  subscriptionStartDate: Date;    // When subscription started
  subscriptionEndDate: Date;      // When subscription ends
  daysLeft: number;               // Virtual: calculated days remaining
  
  // Payment Info
  totalCost: number;        // Total subscription cost
  paid: number;             // Amount paid
  remaining: number;        // Amount still owed
  discount: number;         // Discount applied
  
  // Status
  accountFreezeStatus: boolean;   // Account frozen?
  freezeStartDate?: Date;         // When frozen
  isSession: boolean;             // Session subscription?
  
  // Additional Info
  appliedDiscount?: string;       // Coupon/discount code
  attendanceHistory: AttendanceRecord[];  // Check-in records
  crmInfo?: object;               // Custom CRM data
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 💡 Pro Tips

1. **Always use `t()` for user-facing text** - Makes app translatable
2. **Type everything with interfaces** - Prevents runtime errors
3. **Use `useMessage` for notifications** - Consistent UX
4. **Check Redux state in DevTools** - Easier debugging
5. **Keep components focused** - Single responsibility
6. **Use conditional rendering** - Show/hide based on state
7. **Add loading states** - Better UX for async operations
8. **Validate on form submit** - Prevent bad data
9. **Use `.unwrap()` on async actions** - Better error handling
10. **Check localStorage for token** - Verify auth status

---

## 🆘 Common Issues & Solutions

### "Cannot find module"
- Check file name case (TypeScript is case-sensitive)
- Verify .tsx extension
- Check import path

### "Type 'xyz' is not assignable"
- Check Trainee interface matches backend
- Use correct field names
- Verify types in types/index.ts

### "Message not showing"
- Check useMessage hook is used correctly
- Verify Message.tsx is working
- Check console for errors

### "Check-in fails with 401"
- Verify token exists in localStorage
- Check token is valid (not expired)
- Verify Authorization header format

### "Redux state not updating"
- Check action is dispatched
- Verify reducer logic
- Check Redux DevTools

---

## 📞 Getting Help

1. **Check FRONTEND_REVOLUTION.md** - Comprehensive overview
2. **Check API_INTEGRATION_GUIDE.md** - API details
3. **Check types/index.ts** - Type definitions
4. **Check locales/** - Translation keys
5. **Check existing components** - Follow patterns

---

**Last Updated:** January 22, 2026
**Status:** ✅ Ready for Use
