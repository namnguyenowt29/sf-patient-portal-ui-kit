@IsTest
private class UIBundleAuthUtilsTest {
    @IsTest
    static void sanitizesValidSiteRelativeRoutes() {
        System.assertEquals('/portal/profile?tab=details', UIBundleAuthUtils.getSanitizedStartUrl('/profile?tab=details', '/portal'));
        System.assertEquals('/portal', UIBundleAuthUtils.getSanitizedStartUrl(null, '/portal'));
        System.assertEquals('/portal', UIBundleAuthUtils.getSanitizedStartUrl('/', '/portal'));
    }

    @IsTest
    static void rejectsUnsafeRedirects() {
        List<String> unsafeUrls = new List<String>{
            'https://example.test', '//example.test', '/%2f%2fexample.test', '/\\example.test',
            '/%252f%252fexample.test', '/profile:443', '/profile@evil.test', '/../setup', '/%2e%2e/setup'
        };
        for (String unsafeUrl : unsafeUrls) {
            System.assertEquals('/portal', UIBundleAuthUtils.getSanitizedStartUrl(unsafeUrl, '/portal'), unsafeUrl);
            System.assertEquals(false, UIBundleAuthUtils.isSafeRelativeStartUrl(unsafeUrl), unsafeUrl);
        }
    }
}
