/** Minimal server-side external-session check for the React route guard. */
@RestResource(urlMapping='/auth/session')
global without sharing class UIBundleSession {
    @HttpGet
    global static SessionResponse getSession() {
        User runtimeUser = [
            SELECT Id, Name, ContactId, UserType
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];
        Boolean isCustomerCommunityUser =
            runtimeUser.UserType == 'CspLitePortal';
        Boolean isExternalPatient =
            isCustomerCommunityUser && runtimeUser.ContactId != null;
        return new SessionResponse(
            isExternalPatient,
            isExternalPatient ? runtimeUser.Id : null,
            isExternalPatient ? runtimeUser.Name : null
        );
    }

    global class SessionResponse {
        global Boolean authenticated;
        global String userId;
        global String name;

        global SessionResponse(Boolean authenticated, Id userId, String name) {
            this.authenticated = authenticated;
            this.userId = userId;
            this.name = name;
        }
    }
}