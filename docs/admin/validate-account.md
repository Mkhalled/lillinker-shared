/**
 * # Validate User API
 * 
 * Endpoint that activates a specific user account by changing their status to active.
 * 
 * ## Endpoint
 * ```
 * PUT /api/admin/users/[id]
 * ```
 * 
 * ## Authentication
 * - Requires valid JWT platform_admin token in cookies
 * - Access restricted to others
 * 
 * ## Request
 * Updates the specified user record to set:
 * - `isActive: true` - Activating the user account
 * 
 * ## Response
 * Returns the updated user object with activated status.
 * 
 * ## Usage
 * This endpoint is used by administrators to approve and activate pending user accounts
 * after they have been verified.
 * 
 * ## Testing
 * Tests for this endpoint can be found in `tests/unit/admin/acceptUser.test.ts`
 */