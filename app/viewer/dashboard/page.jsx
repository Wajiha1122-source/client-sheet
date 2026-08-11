import ClientEntriesPage from "@/app/ceo/clients/page";

export default async function ViewerDashboard({ searchParams }) {
  return ClientEntriesPage({ searchParams, viewer: true });
}
