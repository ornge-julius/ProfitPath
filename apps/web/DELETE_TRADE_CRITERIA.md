# Delete Trade Functionality - Acceptance Criteria

## Feature Overview
Add the ability to delete trades from the trade journal application with a confirmation modal to prevent accidental deletions.

---

## Scenario 1: Delete Button Visibility on Edit Trade Form
**Given** that a user is authenticated and viewing the trade detail view for an existing trade  
**And** they click the "Edit Trade" button to edit the trade  
**When** the edit trade form is displayed  
**Then** a "Delete Trade" button should be visible on the form  
**And** the button should be styled with a destructive/danger appearance (e.g., red background)  
**And** the button should include a trash or delete icon  

---

## Scenario 2: Delete Button Positioning and Styling
**Given** that the edit trade form is displayed  
**When** the user views the form layout  
**Then** the delete button should be positioned alongside or below the "Update Trade" and "Cancel" buttons  
**And** the delete button should follow the existing design patterns (Tailwind CSS classes)  
**And** the button should have hover states that indicate it is interactive  

---

## Scenario 3: Opening Confirmation Modal
**Given** that the edit trade form is displayed with a delete button  
**When** the user clicks the delete button  
**Then** a confirmation modal should appear  
**And** the edit trade form should remain in the background but be visually obscured  
**And** the modal should be centered on the screen  

---

## Scenario 4: Confirmation Modal Content
**Given** that the delete confirmation modal has been opened  
**When** the user views the modal  
**Then** it should display a clear warning message about deleting the trade  
**And** it should show details about the trade being deleted (e.g., symbol, trade ID, or entry date)  
**And** it should have two action buttons: "Confirm Delete" and "Cancel"  
**And** the "Confirm Delete" button should have a destructive/danger appearance  
**And** the "Cancel" button should have a neutral/subtle appearance  

---

## Scenario 5: Confirming Trade Deletion
**Given** that the delete confirmation modal is displayed  
**When** the user clicks the "Confirm Delete" button  
**Then** the trade should be deleted from the database  
**And** the confirmation modal should close  
**And** the edit trade form should close  
**And** if the user was on the trade detail view, they should be redirected to the trade list  
**And** the deleted trade should no longer appear in the trade history table  
**And** the metrics and charts should be updated to reflect the deleted trade  
**And** a success message or notification should be displayed to confirm the deletion  

---

## Scenario 6: Canceling Trade Deletion
**Given** that the delete confirmation modal is displayed  
**When** the user clicks the "Cancel" button in the modal  
**Then** the confirmation modal should close  
**And** the edit trade form should remain open  
**And** the trade should not be deleted  
**And** no changes should be made to the database  

---

## Scenario 7: Closing Modal via Outside Click
**Given** that the delete confirmation modal is displayed  
**When** the user clicks outside the modal (on the backdrop)  
**Then** the modal should close  
**And** the trade should not be deleted  
**And** the edit trade form should remain open  

---

## Scenario 8: Authentication Requirement
**Given** that a user is not authenticated  
**When** they attempt to access the delete functionality  
**Then** the delete button should not be visible  
**And** if they somehow trigger the delete flow, they should be prompted to sign in  
**And** the sign-in form should be displayed  

---

## Scenario 9: Delete Trade Functionality
**Given** that the delete trade function exists in the useTradeManagement hook  
**When** the delete functionality is implemented  
**Then** the deleteTrade function should be called from the App.jsx component  
**And** the function should make a DELETE request to the Supabase trades table  
**And** the function should handle the tradeReducer DELETE_TRADE action to update local state  
**And** the function should include proper error handling and logging  

---

## Scenario 10: Integration with TradeDetailView
**Given** that a user is viewing a trade detail view  
**And** they edit the trade  
**When** the delete functionality is added  
**Then** the delete button should be accessible from the edit trade form  
**And** the deleteTrade function should be passed as a prop or accessible through context  
**And** after successful deletion, the viewingTrade state should be cleared  
**And** the user should be redirected back to the trade list  

---

## Scenario 11: Error Handling
**Given** that a user attempts to delete a trade  
**When** the delete operation fails (e.g., network error, database error)  
**Then** an error message should be displayed to the user  
**And** the modal should remain open or close appropriately  
**And** the trade should not be removed from the local state if the database deletion failed  
**And** error details should be logged to the console for debugging  

---

## Scenario 12: Edge Case - Deleting Last Trade
**Given** that a user has only one trade in their account  
**When** they delete that trade  
**Then** the trade should be successfully deleted  
**And** the trade history table should display an empty state or "No trades found" message  
**And** the metrics should update to show zero trades (no division by zero errors)  
**And** the charts should display empty or default states  

---

## Scenario 13: Edge Case - Concurrent Edits
**Given** that a user opens the edit trade form  
**When** another user or process modifies the same trade in the background  
**And** the first user attempts to delete the trade  
**Then** the deletion should either succeed or fail gracefully  
**And** if the trade no longer exists, an appropriate error message should be shown  
**And** the state should be refreshed to reflect current data  

---

## Scenario 14: Edge Case - Rapid Click Spam
**Given** that a user clicks the delete button multiple times rapidly  
**When** the confirmation modal appears  
**Then** only one instance of the modal should be displayed  
**And** clicking the confirm button multiple times should only trigger one deletion  
**And** the delete function should have proper safeguards against duplicate calls  

---

## Scenario 15: Edge Case - Network Interruption
**Given** that a user confirms trade deletion  
**When** the network connection is interrupted during the deletion process  
**Then** the deletion request should fail gracefully  
**And** an appropriate error message should inform the user of the network issue  
**And** the trade should remain in the database and local state  

---

## Scenario 16: Success Indicator
**Given** that a trade deletion is successful  
**When** the user completes the deletion process  
**Then** a visual indicator should confirm the success (e.g., toast notification, success message)  
**And** the trade should immediately disappear from the trade list  
**And** all dependent data (metrics, charts) should update in real-time  

---

## Technical Requirements

### Files to Modify
1. `app/src/components/forms/TradeForm.jsx` - Add delete button and modal state
2. `app/src/App.jsx` - Add delete trade handler and pass to TradeForm
3. (Optional) Create a new `app/src/components/ui/ConfirmModal.jsx` - Reusable confirmation modal component

### Function Integration
- The `deleteTrade` function from `useTradeManagement` hook should be utilized
- The function should be called with the trade ID
- Proper state management using the existing tradeReducer pattern

### Modal Pattern
- Follow existing modal patterns (SettingsForm, TradeForm, AccountEditForm)
- Use `isOpen` prop pattern to control visibility
- Style with Tailwind CSS classes consistent with the app theme
- Include backdrop blur effect and appropriate z-index

### State Management
- Maintain `editingTrade` state appropriately during deletion
- Update `viewingTrade` state when on detail view
- Clear editing/viewing states after successful deletion
- Trigger refresh of trade list and metrics automatically

