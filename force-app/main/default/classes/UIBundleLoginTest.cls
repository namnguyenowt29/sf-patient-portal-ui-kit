@IsTest
private class UIBundleLoginTest {
    @IsTest
    static void returnsGenericInvalidCredentialsForMissingRedirect() {
        RestContext.request = new RestRequest();
        RestContext.response = new RestResponse();
        UIBundleLogin.useTestDouble = true;
        UIBundleLogin.testLoginRedirectUrl = null;

        UIBundleAuthUtils.AuthFailureResponse response = (UIBundleAuthUtils.AuthFailureResponse) UIBundleLogin.doLogin('patient@example.test', 'password', '/profile');
        System.assertEquals(false, response.success);
        System.assertEquals(UIBundleAuthUtils.INVALID_CREDENTIALS, response.errors[0]);
        System.assertEquals(401, RestContext.response.statusCode);
    }

    @IsTest
    static void rejectsInvalidLoginInput() {
        RestContext.request = new RestRequest();
        RestContext.response = new RestResponse();
        UIBundleAuthUtils.AuthFailureResponse response = (UIBundleAuthUtils.AuthFailureResponse) UIBundleLogin.doLogin('not-an-email', null, '//example.test');
        System.assertEquals(false, response.success);
        System.assertEquals(400, RestContext.response.statusCode);
        System.assertEquals(3, response.errors.size());
    }
}
