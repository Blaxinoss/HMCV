# HustleMustle Frontend - API Integration Guide

## Backend Integration Status ✅ COMPLETE

All frontend components are now properly integrated with the new TypeScript backend.

---

## 📡 API Endpoints Used

### Trainees Endpoints

#### 1. **Get All Trainees**
```
GET /api/trainees
```
**Used in:** TraineeList.tsx, Dashboard.tsx
**Redux Action:** `fetchTrainees()`
**Response:**
```typescript
Trainee[] - Array of trainee objects with full details
```

#### 2. **Create New Trainee**
```
POST /api/trainees
```
**Used in:** SubscriptionForm.tsx
**Redux Action:** `addTrainee(data)`
**Request Body:**
```typescript
{
  memberId: string;
  name: string;
  phone: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  totalCost: number;
  paid: number;
  discount: number;
  isSession: boolean;
}
```

#### 3. **Update Trainee**
```
PUT /api/trainees/:id
```
**Used in:** SubscriptionForm.tsx, ExpiredSubscriptions.tsx (renew)
**Redux Action:** `updateTrainee({ traineeId, data })`
**Request Body:** Same as Create with updated values

#### 4. **Delete Trainee**
```
DELETE /api/trainees/:id
```
**Used in:** TraineeList.tsx
**Redux Action:** `deleteTrainee(id)`

#### 5. **Check-In Trainee**
```
POST /api/trainees/:id/check-in
```
**Used in:** CheckInModal.tsx
**Headers:** Authorization: Bearer {token}
**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    trainee: Trainee;
    attendanceRecord: AttendanceRecord;
  }
}
```
**Error Responses:**
- 400: Already checked in today
- 400: Subscription expired
- 400: Account is frozen
- 401: Unauthorized (invalid token)

---

## 📊 Data Types & Interfaces

### Trainee Interface (Source of Truth)
```typescript
interface Trainee {
  _id: string;
  memberId: string;
  name: string;
  phone: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  totalCost: number;
  paid: number;
  remaining: number;    // Calculated: totalCost - paid
  discount: number;
  accountFreezeStatus: boolean;
  freezeStartDate?: Date;
  isSession: boolean;
  appliedDiscount?: string;
  attendanceHistory: AttendanceRecord[];
  crmInfo?: {
    notes?: string;
    referralSource?: string;
    [key: string]: any;
  };
  daysLeft: number;     // Virtual: days until subscription ends
  createdAt: Date;
  updatedAt: Date;
}
```

### AttendanceRecord Interface
```typescript
interface AttendanceRecord {
  _id: string;
  checkInDate: Date;
  checkInTime: string;
  duration?: number;
}
```

---

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

**Token Storage:**
- Key: `token` in localStorage
- Set after successful login
- Cleared on logout

---

## 📝 Form Field Mapping

### SubscriptionForm → Backend

| Form Field | Backend Field | Type | Notes |
|-----------|---------------|------|-------|
| name | name | string | Required |
| phone | phone | string | Required, phone number |
| subscriptionStartDate | subscriptionStartDate | Date | ISO string format |
| subscriptionEndDate | subscriptionEndDate | Date | ISO string format |
| totalCost | totalCost | number | Required, in currency units |
| paid | paid | number | Must be ≤ totalCost |
| discount | discount | number | Applied discount amount |
| isSession | isSession | boolean | Session subscription flag |

---

## 🎯 Redux State Structure

### TraineesState (subscriptionSlice)
```typescript
interface TraineesState {
  trainees: Trainee[];
  selectedTrainee: Trainee | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}
```

### Available Redux Actions
```typescript
// Async thunks
dispatch(fetchTrainees())           // Get all trainees
dispatch(addTrainee(data))          // Create new
dispatch(updateTrainee({...}))      // Update existing
dispatch(deleteTrainee(id))         // Delete trainee

// Sync actions
dispatch(setSelectedTrainee(trainee))
dispatch(clearError())
dispatch(resetSuccess())
```

---

## 💬 Message Notifications

### useMessage Hook API
```typescript
import useMessage from '../../utils/useMessageHook';

const { success, error, warning, info } = useMessage();

// Usage:
success('Subscription renewed successfully!');
error('Failed to update trainee');
warning('Subscription expires soon');
info('Subscription details saved');
```

### Message Options
```typescript
success(message: string, duration?: number)
error(message: string, duration?: number)
warning(message: string, duration?: number)
info(message: string, duration?: number)
```

**Default Duration:** 3000ms (configurable in Message.tsx)

---

## 🔄 Component Data Flow

### Trainees Page Flow
```
SubscriptionPage (Container)
├── SubscriptionForm (Create/Edit)
│   ├── Dispatches: addTrainee / updateTrainee
│   ├── Shows: success/error messages
│   └── Updates: selected trainee state
└── TraineeList (Display)
    ├── Dispatches: fetchTrainees (on mount)
    ├── Shows: status badges, expandable details
    ├── Actions: edit, delete, check-in
    └── Filtering: all/active/expired
        ├── CheckInModal (check-in)
        │   └── Calls: POST /api/trainees/:id/check-in
        └── Delete confirmation
            └── Dispatches: deleteTrainee
```

### Dashboard Flow
```
Dashboard
├── Dispatch: fetchTrainees, fetchTrainers, fetchExpenses
├── Calculate Metrics:
│   ├── activeTrainees
│   ├── expiredTrainees
│   ├── totalRevenue
│   ├── totalExpenses
│   ├── netProfit
│   └── collection rate, freeze rate, etc.
└── Render:
    ├── StatsCards (KPIs)
    ├── Financial Overview
    ├── Team Overview
    ├── Charts
    └── ExpiredSubscriptions (with renew button)
```

---

## 🛠️ Debugging & Troubleshooting

### Common Issues & Solutions

#### Issue: "Token not found"
**Solution:** Check localStorage.getItem('token'), ensure user is logged in

#### Issue: "Cannot read property 'subscriptionEndDate'"
**Solution:** Verify Trainee object has all required fields, check backend response

#### Issue: "API endpoint not found"
**Solution:** Verify backend server is running on correct port (5000), check API URLs

#### Issue: "Subscription form not submitting"
**Solution:** Check console for validation errors, verify all required fields are filled

#### Issue: "Check-in fails with '400 Already checked in today'"
**Solution:** This is expected behavior - user already checked in today

---

## 📱 Component Props & Events

### TraineeList Props
```typescript
interface TraineeListProps {
  onEdit: (trainee: Trainee) => void;
  onAddNew: () => void;
}
```

### SubscriptionForm Props
```typescript
interface SubscriptionFormProps {
  trainee?: Trainee | null;      // Edit mode if provided
  onSuccess: () => void;          // Called after successful save
  onCancel: () => void;           // Called on cancel button
}
```

### CheckInModal Props
```typescript
interface CheckInModalProps {
  traineeId: string;
  traineeName: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

---

## 🔍 Data Validation

### Frontend Validation (SubscriptionForm)
```typescript
Required Fields:
- name: Non-empty string
- phone: Valid phone number
- totalCost: Number > 0

Optional Fields:
- subscriptionStartDate: Valid date
- subscriptionEndDate: Must be after start date
- paid: 0 to totalCost
- discount: 0 to totalCost
- isSession: Boolean
```

### Backend Validation
Backend performs additional validation:
- Phone number format
- Subscription dates logic
- Payment amount constraints
- Duplicate member ID check

---

## 📈 Performance Notes

### Optimization Tips
1. **Memoization:** TraineeList uses React.memo for status badges
2. **Filtering:** Done client-side for instant feedback
3. **Lazy Loading:** Expandable details avoid DOM bloat
4. **Debouncing:** Filter changes debounced to prevent re-renders

### Data Fetching
- Trainees fetched once on dashboard mount
- Updates trigger full refetch (consider incremental updates)
- No caching layer (consider Redux persist)

---

## 🚀 Deployment Checklist

- [ ] Backend server running and accessible
- [ ] API endpoints verified and responding
- [ ] JWT token generation working
- [ ] All imports pointing to .tsx files
- [ ] Environment variables configured (.env)
- [ ] Message notifications working
- [ ] Form validation working
- [ ] Delete confirmations showing
- [ ] i18n working for both languages
- [ ] Responsive design tested on mobile

---

## 📞 Support

### Common Commands

**Fetch all trainees:**
```typescript
const dispatch = useDispatch();
dispatch(fetchTrainees());
```

**Add new trainee:**
```typescript
dispatch(addTrainee({
  name: 'John Doe',
  phone: '01234567890',
  subscriptionStartDate: new Date(),
  subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000),
  totalCost: 500,
  paid: 500,
  discount: 0,
  isSession: false
}));
```

**Show success message:**
```typescript
const { success } = useMessage();
success('Operation completed successfully!');
```

---

**Last Updated:** January 22, 2026
**Status:** ✅ Complete and Ready for Production
