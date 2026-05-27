# TODO

- [ ] Add/Update UI on LoginPage: one form that supports Register + Forgot password links/buttons.
- [x] Implement “recovery password” flow without token input:
  - [x] Backend: modify reset-password route to accept { username, newPassword } and remove token verification.
  - [x] Clear recovery token fields on success.
  - [x] Frontend: update ResetPasswordPage to ask for username + new password only.
  - [x] Remove token from UI text/validation.
- [x] Update forgot-password UI to not display/require token.
- [ ] Ensure navigation between Login and Reset works with the new API.
- [ ] Run backend tests/build (frontend build already succeeded).


