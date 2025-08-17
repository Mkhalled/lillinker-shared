# Freelance Request Management Documentation

## Overview

The Lillinker platform provides freelancers with a comprehensive request management system that allows them to create, view, and manage their service requests. This system enables freelancers to efficiently track the status of their requests, monitor responses from companies, and initiate new requests as needed. The interface is designed with a clean, responsive layout that works across devices and includes pagination for managing large sets of requests.

## System Architecture

### Frontend Architecture

The request management frontend uses a modular component-based approach with React hooks for state management:

```
src/
├── app/
│   └── (dashboard)/
│       └── consultant/
│           └── requests/
│               └── page.tsx                  # Main requests page container
├── components/
│   ├── tables/
│   │   └── MesDemandes.tsx                   # Request listing table component
│   ├── details/
│   │   └── FreelanceRequestDetails.tsx       # Request details view
│   └── new-request/
│       └── NewRequest.tsx                    # New request creation form
└── types/
    └── demande.ts                            # Type definitions for request data
```

### Backend Architecture

The request management system's backend follows a RESTful API approach:

```
src/
├── app/
│   └── api/
│       └── freelance/
│           └── requests/
│               ├── route.ts                  # GET all requests with pagination
│               ├── [id]/
│               │   └── route.ts              # GET/PUT/DELETE specific request
│               └── create/
│                   └── route.ts              # POST new request
```

## User Interface Components

### Request Listing Table

The `MesDemandes` component provides a comprehensive view of all requests with the following features:

- **Tabular display** of request information including:
  - TJM (Daily Rate)
  - Creation Date
  - Priority (HIGH, MEDIUM, LOW)
  - Status (OPEN, PENDING, CLOSED)
  - Response count
- **Action buttons** for each request:
  - View details
  - Archive request
  - View responses
- **New Request button** prominently displayed in the header
- **Pagination system** with:
  - First/last page shortcuts
  - Page number navigation
  - Previous/Next buttons
  - Display of current range and total results

### Request Details View

The `FreelanceRequestDetails` component displays comprehensive information about a selected request:

- Complete request details including client information
- Platform services information
- Response data from companies
- Status and priority information
- Request timestamps and history

### New Request Form

The `NewRequest` component provides a form for freelancers to create new service requests. This component leverages several UI components and logic that were initially developed for the freelance onboarding process, ensuring consistency in user experience and code reusability:

- TJM (Daily Rate) input
- Mission priority selection (HIGH, MEDIUM, LOW)
- Mission status selection (OPEN, PENDING)
- Client information fields
- Service selection options
- Portage preferences
- Optional salary and employment preferences

The reuse of onboarding components enables a familiar interface for freelancers who have already completed the onboarding process, making the request creation experience more intuitive.

## Data Flow

### Request Listing Flow

1. **Data Fetching**:

   ```typescript
   // In page.tsx
   const fetchRequests = useCallback(async (page: number) => {
     setLoading(true);
     try {
       const res = await fetch(`/api/freelance/requests?page=${page}&pageSize=5`);
       if (!res.ok) {
         throw new Error('Failed to fetch requests');
       }
       const data = await res.json();
       setResponses(data);
     } catch (error) {
       console.error('Error fetching requests:', error);
     } finally {
       setLoading(false);
     }
   }, []);
   ```

2. **Data Display**:

   ```tsx
   // MesDemandes component receives and displays the data
   <MesDemandes
     demandeData={responses.data}
     pagination={{
       currentPage: responses.page,
       pageSize: responses.pageSize,
       totalPages: responses.totalPages,
     }}
     onPageChange={handlePageChange}
   />
   ```

3. **Pagination Handling**:
   ```typescript
   const handlePageChange = (page: number) => {
     if (page !== responses.page && page >= 1 && page <= responses.totalPages) {
       fetchRequests(page);
     }
   };
   ```

### Request Detail Flow

1. **Selection in List**:

   ```tsx
   // When user clicks on view details in MesDemandes.tsx
   <button
     className="group"
     title="Voir les détails"
     onClick={() => setSelectedDemande(demandeItem)}
   >
     {/* Icon SVG */}
   </button>
   ```

2. **Detail Display Logic**:
   ```tsx
   // Conditional rendering in MesDemandes.tsx
   if (selectedDemande) {
     return (
       <FreelanceRequestDetails
         demandeItem={selectedDemande}
         onClose={() => setSelectedDemande(null)}
       />
     );
   }
   ```

### New Request Flow

1. **Initiating New Request**:

   ```tsx
   // Button in MesDemandes.tsx
   <button
     onClick={() => setShowNewRequest(true)}
     className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
   >
     <svg>{/* Plus icon */}</svg>
     Nouvelle demande
   </button>
   ```

2. **Form Display Logic**:

   ```tsx
   // Conditional rendering in MesDemandes.tsx
   if (showNewRequest) {
     return <NewRequest onClose={() => setShowNewRequest(false)} />;
   }
   ```

3. **Form Components**:
   The `NewRequest` component internally uses several components from the freelance onboarding flow:
   ```tsx
   // Example import from freelance onboarding in NewRequest.tsx
   import { FreelanceTjmStep } from '@/components/onboarding/freelance/FreelanceTjmStep';
   import { FreelancePortageStep } from '@/components/onboarding/freelance/FreelancePortageStep';
   import { FreelancePriorityStep } from '@/components/onboarding/freelance/FreelancePriorityStep';
   ```

## Request Data Structure

The request data structure follows this pattern:

```typescript
interface demande {
  id: number;
  tjm: number; // Daily rate
  created_at: string; // Creation timestamp
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // Request priority
  mission_status: 'OPEN' | 'PENDING' | 'CLOSED'; // Current status
  responses: any[]; // Company responses
  want_salaried?: boolean; // Preference for salaried employment
  salary?: number; // Desired salary if salaried
  start_date?: string; // Preferred start date
  days?: number; // Mission duration in days
  wants_portage?: boolean; // Interest in portage options
  client_name?: string; // Optional client information
  client_address?: string;
  client_sector?: string;
}
```

## UI Design Details

### Colors and Status Indicators

The interface uses a color system to indicate different statuses and priorities:

- **Priority Colors**:

  - HIGH: Red (danger)
  - MEDIUM: Yellow/Orange (warning)
  - LOW: Green (success)

- **Status Colors**:
  - OPEN: Green (success)
  - PENDING: Red (danger)
  - CLOSED: Yellow/Orange (warning)

### Interactive Elements

- **Hover Effects**: All buttons have hover states for better user feedback
- **Loading States**: Skeleton loaders display while data is being fetched
- **Error Handling**: Console error logging with user-friendly messages

### Responsive Design

The table includes responsive considerations:

- Simplified mobile pagination controls
- Overflow handling for table content
- Adaptive display for different screen sizes

## User Workflows

### Viewing Requests

1. User navigates to the "/consultant/requests" page
2. System displays a paginated list of all requests
3. User can view basic information for each request in the table
4. User can navigate between pages using the pagination controls

### Viewing Request Details

1. User clicks the "View details" button (eye icon) for a specific request
2. System displays the detailed view of the selected request
3. User reviews complete information about the request
4. User can return to the list view using the close button

### Creating a New Request

1. User clicks the "Nouvelle demande" button
2. System displays the new request form
3. User completes all required fields and any optional information
4. User submits the form to create a new request
5. System returns to the updated request list showing the new entry

### Managing Responses

1. User clicks the "View responses" button (envelope icon)
2. System displays responses from companies for the selected request
3. User can review and take action on each response

## Summary

The Lillinker freelance request management system provides an intuitive interface for freelancers to:

- **Track Requests**: View all their service requests in a clear, organized table
- **Monitor Status**: See at a glance the status and priority of each request
- **Review Responses**: Access and evaluate responses from companies
- **Create New Requests**: Easily initiate new service requests with detailed specifications
- **Navigate History**: Use pagination to browse through their request history

The system leverages components from the freelance onboarding process for the request creation flow, ensuring consistency in user experience while reducing development time through component reuse. This approach creates a seamless transition between the onboarding process and active use of the platform.

This system streamlines the freelancer experience by centralizing all request-related activities in a single, user-friendly interface that balances comprehensive information with clean visual design.
