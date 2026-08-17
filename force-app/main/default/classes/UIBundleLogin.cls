/** Guest-safe login endpoint: POST /services/apexrest/auth/login. */
@RestResource(urlMapping='/auth/login')
global without sharing class UIBundleLogin {
    @TestVisible
    private static Boolean useTestDouble = false;
    @TestVisible
    private static String testLoginRedirectUrl;

    @HttpPost
    global static UIBundleAuthUtils.AuthResponse doLogin(
        String email,
        String password,
        String startUrl
    ) {
        try {
            String username = validateAndNormalize(email, password, startUrl);
            String sanitizedStartUrl = UIBundleAuthUtils.getSanitizedStartUrl(
                startUrl,
                Site.getPathPrefix()
            );
            String redirectUrl = createLoginRedirect(
                username,
                password,
                sanitizedStartUrl
            );
            if (String.isBlank(redirectUrl)) {
                UIBundleAuthUtils.setResponseStatus(401);
                return UIBundleAuthUtils.failure(
                    UIBundleAuthUtils.INVALID_CREDENTIALS
                );
            }
            return new UIBundleAuthUtils.AuthSuccessResponse(redirectUrl);
        } catch (UIBundleAuthUtils.AuthException ex) {
            UIBundleAuthUtils.setResponseStatus(ex.statusCode);
            return UIBundleAuthUtils.failure(ex.messages);
        } catch (Exception ex) {
            UIBundleAuthUtils.debugLog(ex, LoggingLevel.ERROR);
            UIBundleAuthUtils.setResponseStatus(500);
            return UIBundleAuthUtils.failure(
                UIBundleAuthUtils.GENERIC_AUTH_FAILURE
            );
        }
    }

    private static String validateAndNormalize(
        String email,
        String password,
        String startUrl
    ) {
        String username = email == null ? null : email.trim().toLowerCase();
        List<String> errors = new List<String>();
        if (String.isBlank(username))
            errors.add('Email is required.');
        else if (!Site.isValidUserName(username))
            errors.add('Email is invalid.');
        if (String.isBlank(password))
            errors.add('Password is required.');
        if (!UIBundleAuthUtils.isSafeRelativeStartUrl(startUrl))
            errors.add('Return URL is invalid.');
        if (!errors.isEmpty()) {
            throw new UIBundleAuthUtils.AuthException(400, errors);
        }
        return username;
    }

    private static String createLoginRedirect(
        String username,
        String password,
        String startUrl
    ) {
        if (Test.isRunningTest() && useTestDouble)
            return testLoginRedirectUrl;
        try {
            PageReference loginResult = Site.login(
                username,
                password,
                startUrl
            );
            return loginResult == null ? null : loginResult.getUrl();
        } catch (Exception ex) {
            UIBundleAuthUtils.debugLog(ex, LoggingLevel.WARN);
            return null;
        }
    }
}