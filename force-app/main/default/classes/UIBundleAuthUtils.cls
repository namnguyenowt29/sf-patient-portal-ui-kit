global without sharing class UIBundleAuthUtils {
    public static final String GENERIC_AUTH_FAILURE = 'We couldn\'t complete your request. Please try again.';
    public static final String GENERIC_REGISTRATION_FAILURE = 'We couldn\'t create your account. Please try again.';
    public static final String INVALID_CREDENTIALS = 'Invalid username or password.';

    global class AuthException extends Exception {
        public Integer statusCode { get; private set; }
        public List<String> messages { get; private set; }

        global AuthException(Integer statusCode, String message) {
            this.statusCode = statusCode;
            this.messages = new List<String>{ message };
        }

        global AuthException(Integer statusCode, List<String> messages) {
            this.statusCode = statusCode;
            this.messages = new List<String>(messages);
        }
    }

    global abstract class AuthResponse {
    }

    global class AuthSuccessResponse extends AuthResponse {
        global Boolean success = true;
        global String redirectUrl;

        global AuthSuccessResponse(String redirectUrl) {
            this.redirectUrl = redirectUrl;
        }
    }

    global class AuthFailureResponse extends AuthResponse {
        global Boolean success = false;
        global List<String> errors;

        global AuthFailureResponse(String error) {
            this.errors = new List<String>{ error };
        }

        global AuthFailureResponse(List<String> errors) {
            this.errors = new List<String>(errors);
        }
    }

    global static AuthFailureResponse failure(String message) {
        return new AuthFailureResponse(message);
    }

    global static AuthFailureResponse failure(List<String> messages) {
        return new AuthFailureResponse(messages);
    }

    public static void setResponseStatus(Integer statusCode) {
        if (RestContext.response != null) {
            RestContext.response.statusCode = statusCode;
        }
    }

    /**
     * Returns a site-relative URL or the supplied site root when the input is blank or unsafe.
     * The decoded path is validated before it is appended, so encoded redirect bypasses cannot
     * escape the Experience Cloud site.
     */
    public static String getSanitizedStartUrl(
        String url,
        String sitePathPrefix
    ) {
        String siteRoot = normalizeSitePathPrefix(sitePathPrefix);
        String normalizedPath = normalizeRelativePath(url);
        return normalizedPath == null ? siteRoot : siteRoot + normalizedPath;
    }

    public static Boolean isSafeRelativeStartUrl(String url) {
        return String.isBlank(url) || normalizeRelativePath(url) != null;
    }

    @TestVisible
    private static String normalizeRelativePath(String url) {
        if (String.isBlank(url) || url == '/') {
            return '';
        }

        String decoded = url;
        try {
            for (Integer attempt = 0; attempt < 3; attempt++) {
                String nextValue = EncodingUtil.urlDecode(decoded, 'UTF-8');
                if (nextValue == decoded) {
                    break;
                }
                decoded = nextValue;
            }
        } catch (Exception ex) {
            return null;
        }

        // More encoded content after bounded decoding is rejected rather than interpreted later.
        if (
            decoded.contains('%') ||
            !decoded.startsWith('/') ||
            decoded.startsWith('//')
        ) {
            return null;
        }
        if (
            decoded.contains('\\') ||
            decoded.contains('@') ||
            decoded.contains(':')
        ) {
            return null;
        }

        for (Integer index = 0; index < decoded.length(); index++) {
            Integer characterCode = decoded.charAt(index);
            if (characterCode < 32 || characterCode == 127) {
                return null;
            }
        }

        Integer queryIndex = decoded.indexOf('?');
        Integer fragmentIndex = decoded.indexOf('#');
        Integer pathEnd = decoded.length();
        if (queryIndex >= 0) {
            pathEnd = queryIndex;
        }
        if (fragmentIndex >= 0 && fragmentIndex < pathEnd) {
            pathEnd = fragmentIndex;
        }
        for (String segment : decoded.substring(1, pathEnd).split('/')) {
            if (segment == '.' || segment == '..') {
                return null;
            }
        }

        return decoded;
    }

    private static String normalizeSitePathPrefix(String sitePathPrefix) {
        if (String.isBlank(sitePathPrefix) || sitePathPrefix == '/') {
            return '';
        }
        String normalized = sitePathPrefix.trim();
        while (normalized.endsWith('/')) {
            normalized = normalized.left(normalized.length() - 1);
        }
        return normalized.startsWith('/') ? normalized : '/' + normalized;
    }

    /** Logs diagnostics only to Salesforce logs; callers must never return this detail to guests. */
    public static void debugLog(Exception ex, LoggingLevel level) {
        System.debug(level, 'Message: ' + ex.getMessage());
        System.debug(level, 'Stack Trace: ' + ex.getStackTraceString());
    }
}