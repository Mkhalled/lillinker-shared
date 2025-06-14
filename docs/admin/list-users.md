/\*\*

- # Admin Users List API
-
- Endpoint that returns a list of verified but inactive users for administrative purposes.
-
- ## Endpoint
- ```

  ```

- GET /api/admin/users
- ```

  ```

-
- ## Authentication
- - Requires valid JWT platform_admin token in cookies
- - Access restricted to others
-
- ## Response
- Returns a JSON array of user objects matching the following criteria:
- - `emailVerified: true` - Only users with verified email addresses
- - `isActive: false` - Only users that are currently inactive
-
- ## Usage
- This endpoint is used by the admin dashboard to display pending user activations
- that require administrator approval.
-
- ## Testing
- Tests for this endpoint can be found in `tests/unit/admin/listUsers.test.ts`
  \*/
