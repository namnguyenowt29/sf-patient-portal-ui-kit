@IsTest
private class UIBundleRegistrationTest {
    @IsTest
    static void validatesAndNormalizesRegistrationInput() {
        UIBundleRegistration.RegistrationRequest request = new UIBundleRegistration.RegistrationRequest();
        request.firstName = ' Ada ';
        request.lastName = ' Lovelace ';
        request.email = ' ADA@EXAMPLE.TEST ';
        request.password = 'validPassword1!';
        request.startUrl = '/profile';

        request.validate();
        System.assertEquals('Ada', request.firstName);
        System.assertEquals('Lovelace', request.lastName);
        System.assertEquals('ada@example.test', request.email);
    }

    @IsTest
    static void returnsSafeFailuresForNullAndFailedProvisioning() {
        RestContext.request = new RestRequest();
        RestContext.response = new RestResponse();
        UIBundleAuthUtils.AuthFailureResponse nullResponse = (UIBundleAuthUtils.AuthFailureResponse) UIBundleRegistration.registerUser(null);
        System.assertEquals(false, nullResponse.success);
        System.assertEquals(400, RestContext.response.statusCode);

        UIBundleRegistration.useTestDouble = true;
        UIBundleRegistration.testProvisionedUserId = null;
        UIBundleRegistration.testLoginRedirectUrl = '/portal/profile';
        UIBundleRegistration.RegistrationRequest request = validRequest();
        UIBundleAuthUtils.AuthFailureResponse provisionResponse = (UIBundleAuthUtils.AuthFailureResponse) UIBundleRegistration.registerUser(request);
        System.assertEquals(false, provisionResponse.success);
        System.assertEquals(UIBundleAuthUtils.GENERIC_REGISTRATION_FAILURE, provisionResponse.errors[0]);
    }

    @IsTest
    static void rejectsMissingLoginRedirectWithoutLeakingDetails() {
        RestContext.request = new RestRequest();
        RestContext.response = new RestResponse();
        UIBundleRegistration.useTestDouble = true;
        UIBundleRegistration.testProvisionedUserId = '005000000000001';
        UIBundleRegistration.testLoginRedirectUrl = null;

        UIBundleAuthUtils.AuthFailureResponse response = (UIBundleAuthUtils.AuthFailureResponse) UIBundleRegistration.registerUser(validRequest());
        System.assertEquals(false, response.success);
        System.assertEquals(UIBundleAuthUtils.GENERIC_REGISTRATION_FAILURE, response.errors[0]);
    }

    private static UIBundleRegistration.RegistrationRequest validRequest() {
        UIBundleRegistration.RegistrationRequest request = new UIBundleRegistration.RegistrationRequest();
        request.firstName = 'Ada';
        request.lastName = 'Lovelace';
        request.email = 'ada@example.test';
        request.password = 'validPassword1!';
        request.startUrl = '/profile';
        return request;
    }
}
