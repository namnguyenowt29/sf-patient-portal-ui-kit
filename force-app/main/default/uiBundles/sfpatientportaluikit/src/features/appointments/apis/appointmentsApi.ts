import { createDataSDK } from "@salesforce/platform-sdk";

import type {
  CreateAppointmentMutation,
  CreateAppointmentMutationVariables,
  GetAppointmentsQuery,
  GetAppointmentsQueryVariables,
} from "@/api/graphql-operations-types";
import { profileApi } from "@/features/profile/apis/profileApi";
import CREATE_APPOINTMENT_MUTATION from "./mutations/createAppointment.graphql?raw";
import GET_APPOINTMENTS_QUERY from "./queries/getAppointments.graphql?raw";

export type AppointmentStatus = "scheduled" | "in-progress" | "complete";

export type Appointment = Readonly<{
  id: string;
  dateTime: string;
  serviceName: string;
  status: AppointmentStatus;
}>;

export type AppointmentsByPeriod = Readonly<{
  upcoming: readonly Appointment[];
  previous: readonly Appointment[];
}>;

export type CreateAppointmentInput = Readonly<{
  scheduledStart: string;
  scheduledEnd: string;
  subject: string;
  status: AppointmentStatus;
}>;

type MutableAppointmentsByPeriod = {
  upcoming: Appointment[];
  previous: Appointment[];
};

type ServiceAppointmentRecord = Readonly<{
  Id?: string | null;
  Subject?: Readonly<{ value?: string | null }> | null;
  SchedStartTime?: Readonly<{ value?: string | null; displayValue?: string | null }> | null;
  Status?: Readonly<{ value?: string | null }> | null;
}>;

const EMPTY_APPOINTMENTS: AppointmentsByPeriod = { upcoming: [], previous: [] };
const promiseSDK = createDataSDK();
const DEMO_PARENT_ACCOUNT_ID = "001gK00001ItJ8qQAF";

const salesforceStatusByAppointmentStatus: Readonly<Record<AppointmentStatus, string>> = {
  scheduled: "Scheduled",
  "in-progress": "In Progress",
  complete: "Complete",
};

const toAppointmentStatus = (status: string | null | undefined): AppointmentStatus | null => {
  switch (status) {
    case "Scheduled":
      return "scheduled";
    case "In Progress":
      return "in-progress";
    case "Complete":
    case "Completed":
      return "complete";
    default:
      return null;
  }
};

const isTodayOrLater = (dateTime: string): boolean => {
  const scheduledDate = new Date(dateTime);
  const today = new Date();
  const scheduledDay = new Date(
    scheduledDate.getFullYear(),
    scheduledDate.getMonth(),
    scheduledDate.getDate()
  ).getTime();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return scheduledDay >= currentDay;
};

const toAppointment = (
  record: ServiceAppointmentRecord | null | undefined
): Readonly<{ appointment: Appointment; isUpcoming: boolean }> | null => {
  if (!record) {
    return null;
  }

  const scheduledStart = record.SchedStartTime?.value;
  const subject = record.Subject?.value;
  const status = toAppointmentStatus(record.Status?.value);
  const scheduledStartTimestamp = scheduledStart ? Date.parse(scheduledStart) : Number.NaN;

  if (!record.Id || !subject || !scheduledStart || !status || Number.isNaN(scheduledStartTimestamp)) {
    return null;
  }

  return {
    appointment: {
      id: record.Id,
      dateTime: record.SchedStartTime?.displayValue ?? scheduledStart,
      serviceName: subject,
      status,
    },
    isUpcoming: isTodayOrLater(scheduledStart),
  };
};

function createAppointmentsApi() {
  const createAppointmentForUser = async (userId: string, input: CreateAppointmentInput): Promise<void> => {
    const subject = input.subject.trim();
    const scheduledStartTimestamp = Date.parse(input.scheduledStart);
    const scheduledEndTimestamp = Date.parse(input.scheduledEnd);

    if (!userId) {
      throw new Error("You must be signed in to create an appointment.");
    }

    if (!subject) {
      throw new Error("Enter the service you want to book.");
    }

    if (scheduledEndTimestamp <= scheduledStartTimestamp) {
      throw new Error("The end date must be after the start date.");
    }

    const contactId = await profileApi.getCurrentContactId(userId);
    if (!contactId) {
      throw new Error("No Contact record is associated with the current user.");
    }

    const sdk = await promiseSDK;
    const result = await sdk.graphql?.mutate<CreateAppointmentMutation, CreateAppointmentMutationVariables>({
      mutation: CREATE_APPOINTMENT_MUTATION,
      variables: {
        appointment: {
          ContactId: contactId,
          ParentRecordId: DEMO_PARENT_ACCOUNT_ID,
          SchedStartTime: input.scheduledStart,
          SchedEndTime: input.scheduledEnd,
          Status: salesforceStatusByAppointmentStatus[input.status],
          Subject: subject,
        },
      },
    });

    if (!result) {
      throw new Error("Salesforce GraphQL client is unavailable");
    }

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    if (!result.data?.uiapi.ServiceAppointmentCreate?.Record?.Id) {
      throw new Error("Salesforce did not return the new appointment.");
    }
  };

  const getAppointmentsForUser = async (userId: string): Promise<AppointmentsByPeriod> => {
    if (!userId) {
      return EMPTY_APPOINTMENTS;
    }

    const contactId = await profileApi.getCurrentContactId(userId);
    if (!contactId) {
      return EMPTY_APPOINTMENTS;
    }

    const sdk = await promiseSDK;
    const result = await sdk.graphql?.query<GetAppointmentsQuery, GetAppointmentsQueryVariables>({
      query: GET_APPOINTMENTS_QUERY,
      variables: { contactId },
    });

    if (!result) {
      throw new Error("Salesforce GraphQL client is unavailable");
    }

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    return (
      result.data?.uiapi.query.ServiceAppointment?.edges?.reduce<MutableAppointmentsByPeriod>(
        (appointments, edge) => {
          const record = toAppointment(edge?.node);
          if (record) {
            appointments[record.isUpcoming ? "upcoming" : "previous"].push(record.appointment);
          }
          return appointments;
        },
        { upcoming: [], previous: [] }
      ) ?? EMPTY_APPOINTMENTS
    );
  };

  return { createAppointmentForUser, getAppointmentsForUser };
}

export const appointmentsApi = createAppointmentsApi();
