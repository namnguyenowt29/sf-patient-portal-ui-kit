@RestResource(urlMapping='/auth/register')
global without sharing class UIBundleRegistration {
    @TestVisible
    private static Boolean useTestDouble = false;
    @TestVisible
    private static String testProvisionedUserId;
    @TestVisible
    private static String testLoginRedirectUrl;

    @HttpPost
    global static UIBundleAuthUtils.AuthResponse registerUser(
        RegistrationRequest request
    ) {
        Savepoint savepoint = Database.setSavepoint();
        System.debug('start register user');
        try {
            if (request == null) {
                throw new UIBundleAuthUtils.AuthException(
                    400,
                    'Registration details are required.'
                );
            }
            request.validate();

            User portalUser = new User(
                Username = request.email,
                Email = request.email,
                FirstName = request.firstName,
                LastName = request.lastName,
                CommunityNickname = buildCommunityNickname(
                    request.firstName,
                    request.lastName
                )
            );
            System.debug('portalUser' + portalUser);
            validatePassword(portalUser, request.password);

            String userId = provisionPersonAccountUser(
                portalUser,
                // resolveConfiguredOwnerId(),
                '005fj00000J8K53AAF',
                request.password
            );
            if (String.isBlank(userId)) {
                throw new UIBundleAuthUtils.AuthException(
                    500,
                    'Can\'t create user id portal'
                );
            }

            String startUrl = UIBundleAuthUtils.getSanitizedStartUrl(
                request.startUrl,
                Site.getPathPrefix()
            );
            String redirectUrl = createLoginRedirect(
                request.email,
                request.password,
                startUrl
            );
            if (String.isBlank(redirectUrl)) {
                throw new UIBundleAuthUtils.AuthException(
                    500,
                    'can\'t redirect'
                );
            }
            return new UIBundleAuthUtils.AuthSuccessResponse(redirectUrl);
        } catch (UIBundleAuthUtils.AuthException ex) {
            Database.rollback(savepoint);
            UIBundleAuthUtils.setResponseStatus(ex.statusCode);
            return UIBundleAuthUtils.failure(ex.messages);
        } catch (Exception ex) {
            Database.rollback(savepoint);

            UIBundleAuthUtils.debugLog(ex, LoggingLevel.ERROR);
            UIBundleAuthUtils.setResponseStatus(500);
            return UIBundleAuthUtils.failure('Auth failure' + ex.getMessage());
        }
    }

    global class RegistrationRequest {
        global String email;
        global String firstName;
        global String lastName;
        global String password;
        global String startUrl;

        public void validate() {
            email = email == null ? null : email.trim().toLowerCase();
            firstName = firstName == null ? null : firstName.trim();
            lastName = lastName == null ? null : lastName.trim();
            startUrl = startUrl == null ? null : startUrl.trim();

            List<String> errors = new List<String>();
            if (String.isBlank(firstName))
                errors.add('First name is required.');
            if (String.isBlank(lastName))
                errors.add('Last name is required.');
            if (String.isBlank(password))
                errors.add('Password is required.');
            if (String.isBlank(email) || !Site.isValidUserName(email))
                errors.add('Email is invalid.');
            if (!UIBundleAuthUtils.isSafeRelativeStartUrl(startUrl))
                errors.add('Return URL is invalid.');
            if (!errors.isEmpty()) {
                throw new UIBundleAuthUtils.AuthException(400, errors);
            }
        }
    }

    private static void validatePassword(User portalUser, String password) {
        if (Test.isRunningTest() && useTestDouble)
            return;
        try {
            Site.validatePassword(portalUser, password, password);
        } catch (Exception ex) {
            UIBundleAuthUtils.debugLog(ex, LoggingLevel.WARN);
            throw new UIBundleAuthUtils.AuthException(
                400,
                'Password does not meet the site requirements.'
            );
        }
    }

    private static String provisionPersonAccountUser(
        User portalUser,
        Id ownerId,
        String password
    ) {
        System.debug('provisionPersonAccountUser');

        if (Test.isRunningTest() && useTestDouble) {
            System.debug('testProvisionedUserId' + testProvisionedUserId);
            return testProvisionedUserId;
        }
        try {
            System.debug('start createPersonAccountPortalUser');
            Id personAccountId = Site.createPersonAccountPortalUser(
                portalUser,
                ownerId,
                password
            );

            System.debug('personAccountId@@' + personAccountId);
            return personAccountId;
        } catch (Exception ex) {
            System.debug(ex.getMessage());
            UIBundleAuthUtils.debugLog(ex, LoggingLevel.ERROR);
            throw new UIBundleAuthUtils.AuthException(500, ex.getMessage());
        }
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
            UIBundleAuthUtils.debugLog(ex, LoggingLevel.ERROR);
            return null;
        }
    }

    private static Id resolveConfiguredOwnerId() {
        if (Test.isRunningTest() && useTestDouble) {
            return UserInfo.getUserId();
        }
        // Demo-only owner selection. Replace with deployable configuration before production use.
        List<User> owners = [
            SELECT Id
            FROM User
            WHERE
                Name = 'Nam Nguyen'
                AND IsActive = TRUE
                AND Profile.Name = 'System Administrator'
                AND UserRole.Name = 'CEO'
            LIMIT 2
        ];
        if (owners.size() != 1) {
            throw new UIBundleAuthUtils.AuthException(
                500,
                'can\'t query admin'
            );
        }
        return owners[0].Id;
    }

    private static String buildCommunityNickname(
        String firstName,
        String lastName
    ) {
        String stem = (firstName.left(1) + lastName)
            .replaceAll('[^A-Za-z0-9]', '');
        if (String.isBlank(stem))
            stem = 'Patient';
        return stem.left(28) +
            EncodingUtil.convertToHex(Crypto.generateAesKey(128)).left(12);
    }
}