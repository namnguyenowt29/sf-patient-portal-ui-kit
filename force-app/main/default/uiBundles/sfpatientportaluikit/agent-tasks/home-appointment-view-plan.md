# Home appointment view plan

## Goal

Add a static appointment summary to the home page that reflects the supplied design, with upcoming and previous appointments plus a route to a future appointments page.

## Steps

1. Create `HomeAppointmentView` with six representative appointments and the three requested statuses.
2. Render the view on the home page beneath the welcome and booking controls.
3. Add a blank `Appointments` page and register its `/appointments` route.
4. Validate the UI Bundle with build, lint, and the development server.

## Data boundary

This first version is deliberately static. A later task can replace the local appointment arrays with Salesforce data access.
